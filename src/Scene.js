export function Scene() {
	this.meshes = new Set();
}

Scene.prototype.add = function(...meshes) {
	const {length} = meshes;

	for (let i = 0; i < length; i++) {
		this.meshes.add(meshes[i]);
	}
};

Scene.prototype.remove = function(...meshes) {
	const {length} = meshes;

	for (let i = 0; i < length; i++) {
		this.meshes.delete(meshes[i]);
	}
};