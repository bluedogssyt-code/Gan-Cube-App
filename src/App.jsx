import React, { useState, useRef, useEffect } from "react";
import { connectToGanCube, disconnectGanCube } from "./bluetooth/gan";
import Cube3D from "./cube/Cube3D";
import { applyMoveToCubeJS, getCubeNotation } from "./cube/cubeState";

/*
  References (used in comments and for implementation guidance):
  - GAN cube protocol (reverse-engineered): https://github.com/cubing/gancube
  - gan-web-bluetooth example: https://github.com/afedotov/gan-web-bluetooth
  - cubejs for cube state math: https://github.com/ldez/cubejs
  - Three.js: https://github.com/mrdoob/three.js
*/

export default function App() {
  const [status, setStatus] = useState("Disconnected");
  const [deviceName, setDeviceName] = useState(null);
  const cubeRef = useRef(null);

  // Called when Bluetooth module receives a parsed notation move (like "R", "R'", "U2")
  const handleIncomingMove = (moveNotation) => {
    // normalize notation
    const notation = getCubeNotation(moveNotation) || moveNotation;
    // Update internal cubejs state
    applyMoveToCubeJS(notation);
    // Notify 3D cube to animate the move
    if (cubeRef.current) {
      cubeRef.current.enqueueMove(notation);
    }
  };

  const handleConnectClick = async () => {
    setStatus("Connecting");
    try {
      const device = await connectToGanCube({
        onMove: handleIncomingMove,
        onStatus: (s) => setStatus(s),
      });
      if (device) {
        setDeviceName(device.name || device.id);
        setStatus("Connected");
      } else {
        setStatus("Disconnected");
      }
    } catch (err) {
      console.error("Connect error:", err);
      setStatus("Disconnected");
    }
  };

  const handleDisconnectClick = async () => {
    setStatus("Disconnecting");
    await disconnectGanCube();
    setStatus("Disconnected");
    setDeviceName(null);
  };

  // For demo: allow keyboard to perform moves locally
  useEffect(() => {
    function onKey(e) {
      const keyMap = {
        r: "R",
        R: "R",
        u: "U",
        U: "U",
        f: "F",
        F: "F",
        l: "L",
        L: "L",
        d: "D",
        D: "D",
        b: "B",
        B: "B",
      };
      const move = keyMap[e.key];
      if (move) {
        const parsed = getCubeNotation(move); // default single turn
        handleIncomingMove(parsed);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="app">
      <div className="header">
        <h1>GAN Cube Web</h1>
        <div className="controls">
          <button
            onClick={handleConnectClick}
            className="btn"
          >
            Connect GAN Cube
          </button>
          <button
            onClick={handleDisconnectClick}
            className="btn"
            style={{ marginLeft: 8 }}
          >
            Disconnect
          </button>
          <div className="status">
            <strong>Status:</strong> {status}
            {deviceName ? ` — ${deviceName}` : ""}
          </div>
        </div>
      </div>

      <div className="canvas-container">
        <Cube3D ref={cubeRef} />
      </div>

      <div className="footer">
        <small>
          Uses Web Bluetooth; works only on HTTPS and compatible Chromium browsers.
        </small>
      </div>
    </div>
  );
}