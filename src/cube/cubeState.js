// Cube state logic using cubejs
// Reference: https://github.com/ldez/cubejs
import Cube from "cubejs";

/*
  This module maintains a single cubejs instance to track logical cube state.
  It exposes `applyMoveToCubeJS(moveNotation)` which accepts a string like "R", "R'", "F2".
  It also exposes a helper to normalize/validate notation.
*/

const cube = new Cube(); // default solved state

export function applyMoveToCubeJS(move) {
  // cubejs accepts a space-separated sequence like "R U R'"
  try {
    cube.move(move);
  } catch (e) {
    // if cubejs throws, attempt to normalize
    const normalized = getCubeNotation(move);
    try {
      cube.move(normalized);
    } catch (er) {
      console.warn("Failed to apply move to cubejs:", move, er);
    }
  }
}

export function getCubeState() {
  return cube.asString(); // e.g. "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"
}

export function resetCubeState() {
  // cubejs exposes init to reset to solved
  try {
    if (typeof cube.init === "function") cube.init();
  } catch (e) {
    // ignore
  }
}

// Normalizes simple move notations to a cubejs-friendly token
export function getCubeNotation(token) {
  // Accept R, R', R2. Return token unchanged if it looks valid.
  if (typeof token !== "string") return "";
  const clean = token.trim();
  if (/^[URFDLBurfdlb][2']?$/.test(clean)) {
    // uppercase face
    const face = clean[0].toUpperCase();
    const suffix = clean.slice(1);
    return face + suffix;
  }
  return clean;
}

export default cube;