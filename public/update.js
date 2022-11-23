import {Keybind, keys, VELOCITY, VELOCITY_SQRT1_2, CAMERA_LERP_FACTOR} from "./constants.js";
import {camera} from "./main.js";
import {lerp} from "../src/utils/index.js";
import {Vector3} from "../src/math/index.js";

let v;

export default function() {
	// Cancel diagonal speed boost
	v = diagonalMovement() ? VELOCITY_SQRT1_2 : VELOCITY;

	if (keys.has(Keybind.forward)) camera.moveTargetZ(v);
	if (keys.has(Keybind.backward)) camera.moveTargetZ(-v);
	if (keys.has(Keybind.left)) camera.moveTargetX(-v);
	if (keys.has(Keybind.right)) camera.moveTargetX(v);
	if (keys.has(Keybind.up)) camera.moveTargetY(v);
	if (keys.has(Keybind.down)) camera.moveTargetY(-v);

	camera.position = camera.target.lerp(camera.position, CAMERA_LERP_FACTOR);
};

const diagonalMovement = () =>
	(keys.has(Keybind.forward) || keys.has(Keybind.backward)) &&
	(keys.has(Keybind.left) || keys.has(Keybind.right));