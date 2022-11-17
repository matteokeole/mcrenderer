import {Matrix4} from "./math/index.js";
import {linkProgram} from "./utils/index.js";

const
	canvas = document.createElement("canvas"),
	gl = canvas.getContext("webgl2"),
	init = async function() {
		canvas.width = innerWidth;
		canvas.height = innerHeight;

		document.body.appendChild(canvas);

		const program = await linkProgram(gl, [
			"main.vert",
			"main.frag",
		]);

		gl.useProgram(program);

		gl.attribute = {
			position: gl.getAttribLocation(program, "a_position"),
			uv: gl.getAttribLocation(program, "a_uv"),
		};
		gl.uniform = {
			matrix: gl.getUniformLocation(program, "u_matrix"),
		};
		gl.buffer = {
			vertex: gl.createBuffer(),
			index: gl.createBuffer(),
			uv: gl.createBuffer(),
		};
		gl.vao = gl.createVertexArray();

		gl.bindVertexArray(gl.vao);

		gl.enableVertexAttribArray(gl.attribute.position);
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.vertex);
		gl.vertexAttribPointer(gl.attribute.position, 3, gl.FLOAT, false, 0, 0);

		gl.enableVertexAttribArray(gl.attribute.uv);
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.uv);
		gl.vertexAttribPointer(gl.attribute.uv, 2, gl.FLOAT, true, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.buffer.index);

		gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);
	},
	render = function(scene, camera) {
		const
			meshes = [...scene.meshes],
			{length} = meshes;
		let mesh, worldMatrix, worldViewProjectionMatrix;

		const viewProjectionMatrix = camera.projectionMatrix
			.multiplyMatrix4(Matrix4.rotationX(-camera.rotation.x))
			.multiplyMatrix4(Matrix4.rotationY(camera.rotation.y))
			.multiplyMatrix4(Matrix4.translation(camera.position.multiply(camera.lhcs)));

		for (let i = 0; i < length; i++) {
			mesh = meshes[i];

			worldMatrix = Matrix4
				.translation(mesh.position.multiply(camera.lhcs).invert())
				.multiplyMatrix4(Matrix4.scale(mesh.scale));

			worldViewProjectionMatrix = viewProjectionMatrix
				.multiplyMatrix4(worldMatrix);

			gl.uniformMatrix4fv(gl.uniform.matrix, false, worldViewProjectionMatrix);

			gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.vertex);
			gl.bufferData(gl.ARRAY_BUFFER, mesh.geometry.vertices, gl.STATIC_DRAW);

			gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.uv);
			gl.bufferData(gl.ARRAY_BUFFER, mesh.geometry.uvs, gl.STATIC_DRAW);

			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.geometry.indices, gl.STATIC_DRAW);

			gl.bindTexture(gl.TEXTURE_2D, mesh.material.textures[0].texture);

			gl.drawElements(gl.TRIANGLES, mesh.geometry.indices.length, gl.UNSIGNED_SHORT, 0);
		}
	};

export const Renderer = {canvas, gl, init, render};