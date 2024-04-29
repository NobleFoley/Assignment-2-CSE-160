class Cylinder {
  constructor() {
    this.type = "cylinder";
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 0.0, 0.0, 1.0];
    this.radius = 0.5;
    this.height = 0.5;
    this.segments = 32;
    this.matrix = new Matrix4();
    this.buffer = null;
  }

  render() {
    const rgba = this.color;

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    if (this.buffer === null) {
      this.buffer = gl.createBuffer();
      if (!this.buffer) {
        console.log("Failed to create the buffer object");
        return -1;
      }
    }
    // Calculates the angle change per iteration
    const angleStep = 360 / this.segments;

    // Loops over the amount of segments specified
    for (let i = 0; i < this.segments; i++) {
      // Calculates the angle of this iteration and the next
      const angle1 = i * angleStep;
      const angle2 = (i + 1) * angleStep;
      // Converts the degrees to radians for finer angles
      const x1 = this.radius * Math.cos((angle1 * Math.PI) / 180);
      const z1 = this.radius * Math.sin((angle1 * Math.PI) / 180);
      const x2 = this.radius * Math.cos((angle2 * Math.PI) / 180);
      const z2 = this.radius * Math.sin((angle2 * Math.PI) / 180);

      // Dims the top and bottom sides
      gl.uniform4f(
        u_FragColor,
        rgba[0] * 0.9,
        rgba[1] * 0.9,
        rgba[2] * 0.9,
        rgba[3]
      );

      // Top
      drawTriangles3D(
        [x1, this.height, z1, 0, this.height, 0, x2, this.height, z2],
        this.buffer
      );

      // Bottom
      drawTriangles3D(
        [x1, -this.height, z1, x2, -this.height, z2, 0, -this.height, 0],
        this.buffer
      );

      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

      // Sides
      drawTriangles3D(
        [x1, -this.height, z1, x2, -this.height, z2, x1, this.height, z1],
        this.buffer
      );

      drawTriangles3D(
        [x1, this.height, z1, x2, -this.height, z2, x2, this.height, z2],
        this.buffer
      );
    }
  }
}
