// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

let canvas;
let gl;
let a_Position;
let u_FragColor;
//let u_Size;
let u_ModelMatrix;

function setUpWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById("webgl");

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get the storage location of u_FragColor");
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(
    gl.program,
    "u_GlobalRotateMatrix"
  );
  if (!u_GlobalRotateMatrix) {
    console.log("Failed to get the storage location of u_GlobalRotateMatrix");
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals for UI Elements
let g_selectedColor = [1.0, 0.0, 0.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_globalAngle = [0, 0];
let g_tail3Angle = 0;
let g_tail2Angle = 0;
let g_tail1Angle = 0;
let g_headAngle = 0;
let g_bodyAngle = 0;
let g_feetAngle = 0;
let g_tail3Animation = false;
let g_tail2Animation = false;
let g_tailAnimation = false;
let g_headAnimation = false;
let g_bodyAnimation = false;
let g_feetAnimation = false;

function addActionsForHtmlUI() {
  document.getElementById("yellow_animation_on").onclick = function () {
    g_tail3Animation = true;
  };
  document.getElementById("yellow_animation_off").onclick = function () {
    g_tail3Animation = false;
  };

  document.getElementById("magenta_animation_on").onclick = function () {
    g_tail2Animation = true;
  };
  document.getElementById("magenta_animation_off").onclick = function () {
    g_tail2Animation = false;
  };

  document.getElementById("tail_base_animation_on").onclick = function () {
    g_tailAnimation = true;
  };
  document.getElementById("tail_base_animation_off").onclick = function () {
    g_tailAnimation = false;
  };
  document.getElementById("head_animation_on").onclick = function () {
    g_headAnimation = true;
  };
  document.getElementById("head_animation_off").onclick = function () {
    g_headAnimation = false;
  };
  document.getElementById("body_animation_on").onclick = function () {
    g_bodyAnimation = true;
  };
  document.getElementById("body_animation_off").onclick = function () {
    g_bodyAnimation = false;
  };
  document.getElementById("feet_animation_on").onclick = function () {
    g_feetAnimation = true;
  };
  document.getElementById("feet_animation_off").onclick = function () {
    g_feetAnimation = false;
  };
  document.getElementById("all_animation_on").onclick = function () {
    g_tail3Animation = true;
    g_tail2Animation = true;
    g_tailAnimation = true;
    g_headAnimation = true;
    g_bodyAnimation = true;
    g_feetAnimation = true;
  };
  document.getElementById("all_animation_off").onclick = function () {
    g_tail3Animation = false;
    g_tail2Animation = false;
    g_tailAnimation = false;
    g_headAnimation = false;
    g_bodyAnimation = false;
    g_feetAnimation = false;
  };

  document
    .getElementById("yellow_input")
    .addEventListener("input", function () {
      g_tail3Angle = this.value;
      renderAllShapes();
    });
  document
    .getElementById("magenta_input")
    .addEventListener("input", function () {
      g_tail2Angle = this.value;
      renderAllShapes();
    });
  document
    .getElementById("tail_base_input")
    .addEventListener("input", function () {
      g_tail1Angle = this.value;
      renderAllShapes();
    });
  document.getElementById("head_input").addEventListener("input", function () {
    g_headAngle = this.value;
    renderAllShapes();
  });
  document.getElementById("body_input").addEventListener("input", function () {
    g_bodyAngle = this.value;
    renderAllShapes();
  });
  document.getElementById("feet_input").addEventListener("input", function () {
    g_feetAngle = this.value;
    renderAllShapes();
  });
  document
    .getElementById("camera_input")
    .addEventListener("input", function () {
      g_globalAngle = [this.value, 0];
      renderAllShapes();
    });
}

let g_jawAnimation = false;

function main() {
  setUpWebGL();

  connectVariablesToGLSL();

  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  //canvas.onmousedown = click;
  canvas.onmousedown = function (ev) {
    if (ev.shiftKey) {
      g_jawAnimation = !g_jawAnimation;
    }
  };
  canvas.onmousemove = function (ev) {
    if (ev.buttons == 1) {
      click(ev);
    }
  };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);
  //renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000;
var g_seconds = performance.now() / 1000 - g_startTime;

function tick() {
  g_seconds = performance.now() / 1000 - g_startTime;
  //console.log(g_seconds);

  updateAnimationAngles();

  renderAllShapes();

  requestAnimationFrame(tick);
}

var g_shapesList = [];

function click(ev) {
  // Passes event to function to convert into WebGL coords
  let [x, y] = handleClicks(ev);
  g_globalAngle = [x * 75, y * 75];
  console.log(g_globalAngle);
}

function handleClicks(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

var stats = new Stats();

// move panel to right side instead of left
// cuz our canvas will be covered
stats.dom.style.left = "auto";
stats.dom.style.right = "0";
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

function updateAnimationAngles() {
  if (g_tail3Animation) {
    g_tail3Angle = 20 * Math.sin(2.5 * g_seconds);
  }
  if (g_tail2Animation) {
    g_tail2Angle = 20 * Math.sin(3 * g_seconds);
  }
  if (g_tailAnimation) {
    g_tail1Angle = 20 * Math.sin(3 * g_seconds);
  }
  if (g_headAnimation) {
    g_headAngle = 5 * Math.sin(2 * g_seconds);
  }
  if (g_bodyAnimation) {
    g_bodyAngle = 5 * Math.sin(2 * g_seconds);
  }
  if (g_feetAnimation) {
    g_feetAngle = 8 * Math.sin(2 * g_seconds);
  }
}

function renderAllShapes() {
  var startTime = performance.now();

  var globalRotMat = new Matrix4()
    .rotate(-g_globalAngle[0], 0, 1, 0)
    .rotate(g_globalAngle[1], 1, 0, 0);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  function drawLeg(body_coords) {
    var leg = new Cube();
    leg.color = [0.034, 0.5, 0.05, 1];
    leg.matrix = new Matrix4(body_coords);
    leg.matrix.rotate(g_feetAngle, 0, 0, 1);
    leg.matrix.translate(0.1, -0.22, -0.15);
    leg.matrix.rotate(-95, 1, 0, 0);
    var leg_coord = leg.matrix;
    leg.matrix.scale(0.08, 0.08, 0.1);

    var leg_joint = new Cylinder();
    leg_joint.color = [0.034, 0.3, 0.05, 1];
    leg_joint.matrix = new Matrix4(leg_coord);
    leg_joint.matrix.scale(0.5, 0.5, 0.8);
    leg_joint.matrix.translate(1.5, 1.2, 0);
    var legjoint_coord = leg_joint.matrix;
    leg_joint.matrix.rotate(-95, 1, 0, 0);

    var foot = new Cube();
    foot.color = [0.034, 0.2, 0.05, 1];
    foot.matrix = new Matrix4(legjoint_coord);
    foot.matrix.translate(-0.5, 0.5, -0.5);
    foot.matrix.scale(1.5, 0.5, 2);

    return [leg, leg_joint, foot];
  }

  var body = new Cube();
  body.color = [0.034, 0.5, 0.05, 1];
  body.matrix.rotate(g_bodyAngle, 0, 1, 0);
  var body_coords = new Matrix4(body.matrix);
  body.matrix.translate(-0.15, -0.25, 0.0);
  body.matrix.rotate(-95, 1, 0, 0);
  body.matrix.scale(0.25, 0.5, 0.2);
  body.render();

  var body2 = new Cube();
  body2.color = [0.1, 0.4, 0.05, 1];
  body2.matrix = new Matrix4(body_coords);
  body2.matrix.translate(-0.17, -0.25, -0.05);
  body2.matrix.rotate(-95, 1, 0, 0);
  body2.matrix.scale(0.3, 0.4, 0.2);
  body2.render();

  var head = new Cube();
  head.color = [0.1, 0.4, 0.05, 1];
  head.matrix = new Matrix4(body_coords);
  head.matrix.rotate(g_headAngle, 0, 1, 0);
  head.matrix.translate(-0.12, -0.28, -0.5);
  var head_coords = new Matrix4(head.matrix);
  head.matrix.scale(0.2, 0.22, 0.2);
  head.matrix.rotate(-95, 1, 0, 0);
  head.render();

  var eyes = new Cylinder();
  eyes.color = [0, 0, 0, 1];
  eyes.matrix = new Matrix4(head_coords);
  eyes.matrix.rotate(-90, 0, 0, 1);
  eyes.matrix.scale(0.04, 0.21, 0.04);
  eyes.matrix.translate(-4, 0.47, -2);
  eyes.render();

  var jaws = new Cube();
  jaws.color = [0.034, 0.35, 0.05, 1];
  jaws.matrix = new Matrix4(head_coords);
  jaws.matrix.translate(0.01, 0.02, -0.2);
  if (g_jawAnimation) {
    g_jawAngle = 15 * Math.sin(5 * g_seconds);
    if (g_jawAngle > 0) {
      jaws.matrix.rotate(-g_jawAngle, 1, 0, 0);
    }
  }
  jaws.matrix.rotate(-95, 1, 0, 0);
  jaws.matrix.scale(0.18, 0.25, 0.05);
  jaws.render();

  var jaws2 = new Cube();
  jaws2.color = [0.034, 0.3, 0.05, 1];
  jaws2.matrix = new Matrix4(head_coords);
  jaws2.matrix.translate(0.01, 0.07, -0.205);
  if (g_jawAnimation) {
    g_jawAngle = 15 * Math.sin(5 * g_seconds);
    if (g_jawAngle > 0) {
      jaws2.matrix.rotate(g_jawAngle, 1, 0, 0);
    }
  }
  jaws2.matrix.rotate(-95, 1, 0, 0);
  jaws2.matrix.scale(0.18, 0.25, 0.05);
  jaws2.render();

  var backright_legs = drawLeg(body_coords);
  backright_legs[0].render();
  backright_legs[1].render();
  backright_legs[2].render();
  var frontright_legs = drawLeg(body_coords);
  frontright_legs[0].matrix.translate(0, 2, 0);
  frontright_legs[0].render();
  frontright_legs[1].matrix.translate(0, -0.2, 4);
  frontright_legs[1].render();
  frontright_legs[2].matrix.translate(0, -0.4, 1.8);
  frontright_legs[2].render();
  var backleft_legs = drawLeg(body_coords);
  backleft_legs[0].matrix.translate(-4, 0, 0);
  backleft_legs[0].render();
  backleft_legs[1].matrix.translate(-9, 0, 0);
  backleft_legs[1].render();
  backleft_legs[2].matrix.translate(-6.3, 0, 0);
  backleft_legs[2].render();
  var frontleft_legs = drawLeg(body_coords);
  frontleft_legs[0].matrix.translate(-4, 2, 0);
  frontleft_legs[0].render();
  frontleft_legs[1].matrix.translate(-9, -0.2, 4);
  frontleft_legs[1].render();
  frontleft_legs[2].matrix.translate(-6.3, -0.4, 1.8);
  frontleft_legs[2].render();

  var tail = new Cylinder();
  tail.color = [0.1, 0.4, 0.05, 1];
  tail.matrix = new Matrix4(body_coords);
  tail.matrix.rotate(g_tail1Angle, 0, 1, 0);
  var tail_coords = new Matrix4(tail.matrix);
  tail.matrix.scale(0.15, 0.15, 0.15);
  tail.matrix.translate(-0.15, -1, 0);
  tail.matrix.rotate(-95, 1, 0, 0);
  tail.render();

  var tail1 = new Cylinder();
  tail1.color = [0.034, 0.35, 0.05, 1];
  tail1.matrix = tail_coords;
  tail1.matrix.translate(-0.025, -0.15, 0.125);
  tail1.matrix.scale(0.125, 0.125, 0.125);
  tail1.matrix.rotate(g_tail2Angle, 0, 1, 0);
  var tail2_coords = new Matrix4(tail1.matrix);
  tail1.matrix.rotate(-95, 1, 0, 0);
  tail1.render();

  var tail2 = new Cylinder();
  tail2.color = [0.034, 0.2, 0.05, 1];
  tail2.matrix = tail2_coords;
  tail2.matrix.rotate(-95, 1, 0, 0);
  tail2.matrix.rotate(g_tail3Angle, 0, 0, 1);
  tail2.matrix.translate(-0.025, -0.8, 0);
  tail2.matrix.scale(0.8, 0.8, 0.8);
  tail2.render();

  var spikes = new Cube();
  spikes.color = [0.034, 0.3, 0.05, 1];
  spikes.matrix = new Matrix4(body_coords);
  spikes.matrix.rotate(-5, 1, 0, 0);
  spikes.matrix.scale(0.05, 0.05, 0.08);
  spikes.matrix.translate(-0.8, -1.5, -5);
  spikes.render();

  var spikes2 = new Cube();
  spikes2.color = [0.034, 0.3, 0.05, 1];
  spikes2.matrix = new Matrix4(body_coords);
  spikes2.matrix.rotate(-5, 1, 0, 0);
  spikes2.matrix.scale(0.05, 0.05, 0.08);
  spikes2.matrix.translate(-0.8, -1.5, -3.2);
  spikes2.render();

  var spikes3 = new Cube();
  spikes3.color = [0.034, 0.3, 0.05, 1];
  spikes3.matrix = new Matrix4(body_coords);
  spikes3.matrix.rotate(-5, 1, 0, 0);
  spikes3.matrix.scale(0.05, 0.05, 0.08);
  spikes3.matrix.translate(-0.8, -1.5, -1.8);
  spikes3.render();

  var duration = performance.now() - startTime;
  sendTextToHTML(
    " ms: " +
      Math.floor(duration) +
      " fps: " +
      Math.floor(10000 / duration) / 10,
    "performance_text"
  );
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
  }
  htmlElm.innerHTML = text;
}
