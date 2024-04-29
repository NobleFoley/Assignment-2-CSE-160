class Cube {
  // Constructor
  constructor() {
    this.type = "cube";
    this.color = [1.0, 0.0, 0.0, 1.0];
    this.matrix = new Matrix4();
    this.buffer = null;
  }
  // Render the shape * This is the Draw Cube function
  render() {
    var rgba = this.color;

    if (this.buffer === null) {
      this.buffer = gl.createBuffer();
      if (!this.buffer) {
        console.log("Failed to create the buffer object");
        return -1;
      }
    }

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    // Front
    drawTriangles3D([0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0], this.buffer);
    drawTriangles3D([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0], this.buffer);
    // Back
    drawTriangles3D([0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0], this.buffer);
    drawTriangles3D([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0], this.buffer);

    // Dims the color on the other sides
    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.85,
      rgba[1] * 0.85,
      rgba[2] * 0.85,
      rgba[3]
    );

    // Top
    drawTriangles3D([0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0], this.buffer);
    drawTriangles3D([1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0], this.buffer);

    // Bottom
    drawTriangles3D([0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0], this.buffer);
    drawTriangles3D([1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0], this.buffer);
    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.8,
      rgba[1] * 0.8,
      rgba[2] * 0.8,
      rgba[3]
    );

    // Left
    drawTriangles3D([0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0], this.buffer);
    drawTriangles3D([0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0], this.buffer);
    // Right
    drawTriangles3D([1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0], this.buffer);
    drawTriangles3D([1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0], this.buffer);
  }
}
