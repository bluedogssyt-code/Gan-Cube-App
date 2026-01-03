// GNAN Bluetooth helper for GAN smart cubes
// References:
// - GAN cube protocol (reverse-engineered): https://github.com/cubing/gancube
// - gan-web-bluetooth example: https://github.com/afedotov/gan-web-bluetooth
//
// This module exports:
// - connectToGanCube({ onMove, onStatus }) => returns BluetoothDevice
// - disconnectGanCube()
//
// IMPORTANT: This is browser-side Web Bluetooth code and must run under HTTPS
// or on localhost in supported Chromium browsers.

let bluetoothDevice = null;
let gattServer = null;
let moveCharacteristic = null;

const GAN_SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb"; // commonly used in GAN BLE examples
const GAN_CHAR_NOTIFY_UUID = "0000fff1-0000-1000-8000-00805f9b34fb"; // notification characteristic (example from references)

/*
  The actual GAN protocol has packets that encode moves.
  We implement a robust parser:
  - If the characteristic sends ASCII text (some firmware/debug variants), decode and try to parse moves directly.
  - Otherwise parse raw bytes using a fallback mapping commonly used in reverse-engineered code.
  - We emit standard cube notation strings like "R", "U'", "F2".
*/

function notifyStatus(onStatus, s) {
  try {
    if (typeof onStatus === "function") onStatus(s);
  } catch (e) {
    console.warn("onStatus callback error", e);
  }
}

export async function connectToGanCube({ onMove, onStatus } = {}) {
  notifyStatus(onStatus, "Requesting device");
  if (!navigator.bluetooth) {
    notifyStatus(onStatus, "Web Bluetooth not supported");
    throw new Error("Web Bluetooth not supported in this browser");
  }

  try {
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      // Required example from the task:
      filters: [{ namePrefix: "GAN" }],
      optionalServices: [GAN_SERVICE_UUID],
    });

    if (!bluetoothDevice) {
      notifyStatus(onStatus, "No device selected");
      return null;
    }

    bluetoothDevice.addEventListener("gattserverdisconnected", () => {
      notifyStatus(onStatus, "Disconnected");
      // Consumers may call connectToGanCube again to reconnect
    });

    notifyStatus(onStatus, "Connecting to GATT server...");
    gattServer = await bluetoothDevice.gatt.connect();

    notifyStatus(onStatus, "Getting GAN service...");
    const service = await gattServer.getPrimaryService(GAN_SERVICE_UUID);

    notifyStatus(onStatus, "Getting characteristic...");
    // Characteristic uuid may vary; try the common one, otherwise pick first characteristic that supports notify
    try {
      moveCharacteristic = await service.getCharacteristic(GAN_CHAR_NOTIFY_UUID);
    } catch (err) {
      // fallback: pick first notify supporting characteristic
      const chars = await service.getCharacteristics();
      moveCharacteristic = chars.find(c => c.properties.notify || c.properties.indicate);
      if (!moveCharacteristic) throw err;
    }

    // Setup notification handler
    await moveCharacteristic.startNotifications();
    moveCharacteristic.addEventListener("characteristicvaluechanged", (ev) => {
      const value = ev.target.value;
      const parsedMoves = parseGanNotification(value);
      if (parsedMoves && parsedMoves.length) {
        parsedMoves.forEach((m) => {
          if (typeof onMove === "function") {
            onMove(m);
          }
        });
      }
    });

    notifyStatus(onStatus, "Connected");
    return bluetoothDevice;
  } catch (err) {
    notifyStatus(onStatus, "Connection failed");
    console.error("GAN connect error:", err);
    throw err;
  }
}

export async function disconnectGanCube() {
  try {
    if (moveCharacteristic) {
      try { await moveCharacteristic.stopNotifications(); } catch (e) {}
      moveCharacteristic = null;
    }
    if (gattServer && gattServer.connected) {
      gattServer.disconnect();
    }
    if (bluetoothDevice && bluetoothDevice.gatt && bluetoothDevice.gatt.connected) {
      bluetoothDevice.gatt.disconnect();
    }
  } catch (e) {
    // ignore
  } finally {
    bluetoothDevice = null;
    gattServer = null;
  }
}

/*
  Parsing function:
  Attempts multiple strategies:
  1) Try TextDecoder - if readable moves present (e.g., "R", "R'", "U2", space-separated)
  2) Fallback: parse structured bytes. Some GAN firmwares send 4-byte packets with move ids.
     We'll implement a best-effort mapping:
*/
function parseGanNotification(dataView) {
  // 1) try to decode as text
  try {
    const decoder = new TextDecoder("utf-8");
    const text = decoder.decode(dataView);
    if (text && text.trim().length > 0) {
      // split by whitespace or commas
      const tokens = text.trim().split(/[\s,;]+/).map(s => s.trim()).filter(Boolean);
      // quick validation: tokens like R, R', R2, U, U', etc.
      const valid = tokens.every(t => /^[URFDLBxyzMESurfdbxyz2']+$/.test(t));
      if (valid) return tokens;
    }
  } catch (e) {
    // proceed to binary parse
  }

  // 2) binary parse fallback
  const bytes = [];
  for (let i = 0; i < dataView.byteLength; i++) {
    bytes.push(dataView.getUint8(i));
  }

  // Some GAN implementations send sequences where a move is encoded in a single byte: 0..11 mapping to moves/prime/2.
  // We'll implement a conservative mapping:
  const idxToMove = [
    "U", "R", "F", "D", "L", "B",
    "U'", "R'", "F'", "D'", "L'", "B'"
  ];

  // heuristic: if bytes length == 1 and value < 12 -> map
  if (bytes.length === 1 && bytes[0] < 12) {
    return [idxToMove[bytes[0]]];
  }

  // heuristic: look for sequences where each byte is in 0..11
  if (bytes.length > 0 && bytes.every(b => b < 12)) {
    return bytes.map(b => idxToMove[b]);
  }

  // Some firmwares encode moves as two nibbles: high nibble face, low nibble turn type
  // Attempt to parse pairs
  const moves = [];
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    const face = b & 0x07; // 0..7
    const turn = (b >> 3) & 0x03; // 0..3
    const faceMap = ["U", "R", "F", "D", "L", "B", null, null];
    const faceChar = faceMap[face];
    if (!faceChar) continue;
    let notation = faceChar;
    if (turn === 1) notation = faceChar + "'"; // prime
    if (turn === 2) notation = faceChar + "2"; // double
    moves.push(notation);
  }
  if (moves.length) return moves;

  // Nothing matched
  return [];
}

/* Export parse function for unit testing or debug if needed */
export const _internal = { parseGanNotification };