import {WINDOW} from "./constants.js";
import {Matrix4} from "./math/index.js";
import {linkProgram} from "./utils/index.js";

const
	canvas = document.createElement("canvas"),
	gl = canvas.getContext("webgl2"),
	init = async function() {
		canvas.width = innerWidth;
		canvas.height = innerHeight;

		document.body.appendChild(canvas);

		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		viewport();

		const program = await linkProgram(gl, [
			"main.vert",
			"main.frag",
		]);

		gl.useProgram(program);

		gl.attribute = {
			position: 0,
			uv: 1,
			matrix: 2,
		};
		gl.buffer = {
			index: gl.createBuffer(),
			vertex: gl.createBuffer(),
			matrix: gl.createBuffer(),
			uv: gl.createBuffer(),
		};
		gl.vao = gl.createVertexArray();

		gl.bindVertexArray(gl.vao);

		gl.enableVertexAttribArray(gl.attribute.position);
		gl.enableVertexAttribArray(gl.attribute.matrix);
		gl.enableVertexAttribArray(gl.attribute.uv);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.buffer.index);

		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.vertex);
		gl.vertexAttribPointer(gl.attribute.position, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.uv);
		gl.vertexAttribPointer(gl.attribute.uv, 2, gl.FLOAT, true, 0, 0);
	},
	prepareRender = function(scene, camera) {
		const
			meshes = [...scene.meshes],
			{length} = meshes;

		gl.matrixData = new Float32Array(16 * length);
		gl.matrices = [];

		for (let i = 0; i < length; i++) {
			gl.matrices.push(new Float32Array(
				gl.matrixData.buffer,
				i * 16 * 4,
				16,
			));
		}

		// Allocate space on the matrix buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.matrix);
		gl.bufferData(gl.ARRAY_BUFFER, gl.matrixData.byteLength, gl.DYNAMIC_DRAW);

		for (let i = 0; i < 4; i++) {
			const loc = gl.attribute.matrix + i;

			gl.enableVertexAttribArray(loc);
			gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 4 * 16, i * 16);
			gl.vertexAttribDivisor(loc, 1);
		}
	},
	render = function(scene, camera) {
		const
			meshes = [...scene.meshes],
			{length} = meshes;

		const viewProjectionMatrix = camera.projectionMatrix
			.multiplyMatrix4(Matrix4.translation(camera.distance.invert()))
			.multiplyMatrix4(Matrix4.rotationX(-camera.rotation.x))
			.multiplyMatrix4(Matrix4.rotationY(camera.rotation.y))
			.multiplyMatrix4(Matrix4.rotationZ(camera.rotation.z))
			.multiplyMatrix4(Matrix4.translation(camera.position.multiply(camera.lhcs)));

		gl.clearColor(...scene.background);
		gl.clear(gl.COLOR_BUFFER_BIT);

		for (let i = 0; i < length; i++) {
			const mesh = meshes[i];

			const matrix = viewProjectionMatrix
				.multiplyMatrix4(Matrix4.translation(mesh.position.multiply(camera.lhcs).invert()))
				.multiplyMatrix4(Matrix4.rotationX(-mesh.rotation.x))
				.multiplyMatrix4(Matrix4.rotationY(mesh.rotation.y))
				.multiplyMatrix4(Matrix4.rotationZ(-mesh.rotation.z))
				.multiplyMatrix4(Matrix4.scale(mesh.scale));

			for (let j = 0; j < 16; j++) {
				gl.matrices[i][j] = matrix[j];
			}
		}

		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, meshes[0].geometry.indices, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.vertex);
		gl.bufferData(gl.ARRAY_BUFFER, meshes[0].geometry.vertices, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.matrix);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, gl.matrixData);

		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.uv);
		gl.bufferData(gl.ARRAY_BUFFER, meshes[0].geometry.uvs, gl.STATIC_DRAW);

		gl.bindTexture(gl.TEXTURE_2D, meshes[0].material.texture[0].texture);

		gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0, length);
	},
	resize = function() {
		canvas.width = WINDOW.width;
		canvas.height = WINDOW.height;
	},
	viewport = () => gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);

canvas.addEventListener("click", function() {
	this.requestPointerLock();
});

export const Renderer = {canvas, gl, init, prepareRender, render, resize, viewport};