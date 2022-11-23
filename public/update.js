import {Keybind, keys, VELOCITY, VELOCITY_SQRT1_2} from "./constants.js";
import {camera} from "./main.js";
import {lerp} from "../src/utils/index.js";

let v;

export default function() {
	// Cancel diagonal speed boost
	v = diagonalMovement() ? VELOCITY_SQRT1_2 : VELOCITY;

	if (keys.has(Keybind.forward)) camera.moveZ(v);
	if (keys.has(Keybind.backward)) camera.moveZ(-v);
	if (keys.has(Keybind.left)) camera.moveX(-v);
	if (keys.has(Keybind.right)) camera.moveX(v);
	if (keys.has(Keybind.up)) camera.moveY(v);
	if (keys.has(Keybind.down)) camera.moveY(-v);

	// camera.position = camera.position.lerp();
};

const diagonalMovement = () =>
	(keys.has(Keybind.forward) || keys.has(Keybind.backward)) &&
	(keys.has(Keybind.left) || keys.has(Keybind.right));