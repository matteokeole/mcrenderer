#version 300 es

precision mediump float;

in vec2 v_uv;
// in float v_brightness;

uniform sampler2D u_texture;

out vec4 FragColor;

void main() {
	// FragColor = texture(u_texture, v_uv) * brightness;

	FragColor = texture(u_texture, v_uv);
}