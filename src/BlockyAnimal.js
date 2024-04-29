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
let u_ModelMatrix;

function setUpWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById("webgl");

  // Get the rendering context for WebGL
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
  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }
  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(
    gl.program,
    "u_GlobalRotateMatrix"
  );
  if (!u_GlobalRotateMatrix) {
    console.log("Failed to get the storage location of u_GlobalRotateMatrix");
    return;
  }
  // Pass an identity Matrix to the u_ModelMatrix variable in gl
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Globals for UI Elements
let g_globalAngle = [0, 0];
let g_tail_endAngle = 0;
let g_tail_middleAngle = 0;
let g_tail_baseAngle = 0;
let g_headAngle = 0;
let g_bodyAngle = 0;
let g_feetAngle = 0;
let g_tail_endAnimation = false;
let g_tail_middle_Animation = false;
let g_tail_baseAnimation = false;
let g_headAnimation = false;
let g_bodyAnimation = false;
let g_feetAnimation = false;

function addActionsForHtmlUI() {
  document.getElementById("tail_end_animation_on").onclick = function () {
    g_tail_endAnimation = true;
  };
  document.getElementById("tail_end_animation_off").onclick = function () {
    g_tail_endAnimation = false;
  };

  document.getElementById("tail_middle_animation_on").onclick = function () {
    g_tail_middle_Animation = true;
  };
  document.getElementById("tail_middle_animation_off").onclick = function () {
    g_tail_middle_Animation = false;
  };

  document.getElementById("tail_base_animation_on").onclick = function () {
    g_tail_baseAnimation = true;
  };
  document.getElementById("tail_base_animation_off").onclick = function () {
    g_tail_baseAnimation = false;
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
    g_tail_endAnimation = true;
    g_tail_middle_Animation = true;
    g_tail_baseAnimation = true;
    g_headAnimation = true;
    g_bodyAnimation = true;
    g_feetAnimation = true;
  };
  document.getElementById("all_animation_off").onclick = function () {
    g_tail_endAnimation = false;
    g_tail_middle_Animation = false;
    g_tail_baseAnimation = false;
    g_headAnimation = false;
    g_bodyAnimation = false;
    g_feetAnimation = false;
  };

  document
    .getElementById("tail_end_input")
    .addEventListener("input", function () {
      g_tail_endAngle = this.value;
      renderAllShapes();
    });
  document
    .getElementById("tail_middle_input")
    .addEventListener("input", function () {
      g_tail_middleAngle = this.value;
      renderAllShapes();
    });
  document
    .getElementById("tail_base_input")
    .addEventListener("input", function () {
      g_tail_baseAngle = this.value;
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
// Global for jawAnimation (poke animation)
let g_jawAnimation = false;

function main() {
  setUpWebGL();

  connectVariablesToGLSL();

  addActionsForHtmlUI();

  // Pokeshift toggles on and off the jawAnimation
  canvas.onmousedown = function (ev) {
    if (ev.shiftKey) {
      g_jawAnimation = !g_jawAnimation;
    }
  };
  // Register function (event handler) to be called on a mouse click and drage (rotation)
  canvas.onmousemove = function (ev) {
    if (ev.buttons == 1) {
      click(ev);
    }
  };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);
}

// Tracks the seconds since website start
var g_startTime = performance.now() / 1000;
var g_seconds = performance.now() / 1000 - g_startTime;

// Rerenders the scene
function tick() {
  g_seconds = performance.now() / 1000 - g_startTime;

  updateAnimationAngles();

  renderAllShapes();

  requestAnimationFrame(tick);
}

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

// Handles the updates for the rotation for the animations
function updateAnimationAngles() {
  if (g_tail_endAnimation) {
    g_tail_endAngle = 20 * Math.sin(2.5 * g_seconds);
  }
  if (g_tail_middle_Animation) {
    g_tail_middleAngle = 20 * Math.sin(3 * g_seconds);
  }
  if (g_tail_baseAnimation) {
    g_tail_baseAngle = 20 * Math.sin(3 * g_seconds);
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

// Renders all the primitives needed for the Animal
function renderAllShapes() {
  var startTime = performance.now();

  // Global Rotation Matrix for the mouse drag rotation
  var globalRotMat = new Matrix4()
    .rotate(-g_globalAngle[0], 0, 1, 0)
    .rotate(g_globalAngle[1], 1, 0, 0);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Function for connecting the leg parts together made for simplicity returns each of the parts
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
  // Function for connecting the teeth made for simplicity returns each of them
  function drawTeeth(jaw_coords) {
    var tooth = new Cube();
    tooth.color = [1, 1, 1, 1];
    tooth.matrix = new Matrix4(jaw_coords);
    tooth.matrix.scale(0.03, 0.02, 0.05);
    return tooth;
  }
  // Main body of the crocodile
  var body = new Cube();
  body.color = [0.034, 0.5, 0.05, 1];
  body.matrix.rotate(g_bodyAngle, 0, 1, 0);
  var body_coords = new Matrix4(body.matrix);
  body.matrix.translate(-0.15, -0.25, 0.0);
  body.matrix.rotate(-95, 1, 0, 0);
  body.matrix.scale(0.25, 0.5, 0.2);
  body.render();

  // Larger part of the body of the crocodile
  var outer_body_shell = new Cube();
  outer_body_shell.color = [0.1, 0.4, 0.05, 1];
  outer_body_shell.matrix = new Matrix4(body_coords);
  outer_body_shell.matrix.translate(-0.17, -0.25, -0.05);
  outer_body_shell.matrix.rotate(-95, 1, 0, 0);
  outer_body_shell.matrix.scale(0.3, 0.4, 0.2);
  outer_body_shell.render();

  // Head of the crocodile
  var head = new Cube();
  head.color = [0.1, 0.4, 0.05, 1];
  head.matrix = new Matrix4(body_coords);
  head.matrix.rotate(g_headAngle, 0, 1, 0);
  head.matrix.translate(-0.12, -0.28, -0.5);
  // For later use of connecting parts with rotation
  var head_coords = new Matrix4(head.matrix);
  head.matrix.scale(0.2, 0.22, 0.2);
  head.matrix.rotate(-95, 1, 0, 0);
  head.render();

  // Eyes of the crocodile
  var eyes = new Cylinder();
  eyes.color = [0, 0, 0, 1];
  // Attaches eyes to the rotation/animation of the head
  eyes.matrix = new Matrix4(head_coords);
  eyes.matrix.rotate(-90, 0, 0, 1);
  eyes.matrix.scale(0.04, 0.21, 0.04);
  eyes.matrix.translate(-4, 0.47, -2);
  eyes.render();

  // Lower Jaw of the crocodile
  var lower_jaws = new Cube();
  lower_jaws.color = [0.034, 0.35, 0.05, 1];
  // Attaches lower jaw to the rotation/animation of the head
  lower_jaws.matrix = new Matrix4(head_coords);
  lower_jaws.matrix.translate(0.01, 0.02, -0.2);
  // If poke animation is true than it will do the animation for opening the mouth
  if (g_jawAnimation) {
    g_jawAngle = 15 * Math.sin(5 * g_seconds);
    if (g_jawAngle > 0) {
      lower_jaws.matrix.rotate(-g_jawAngle, 1, 0, 0);
    }
  }
  // Used to attach the teeth to the lower jaw
  var jaw_coords = new Matrix4(lower_jaws.matrix);
  lower_jaws.matrix.rotate(-95, 1, 0, 0);
  lower_jaws.matrix.scale(0.18, 0.25, 0.05);
  lower_jaws.render();

  // All the teeth (connected to the jaw) uses the drawTeeth() func
  var tooth1 = drawTeeth(jaw_coords);
  tooth1.matrix.translate(0.25, 1.5, -4);
  tooth1.render();
  var tooth2 = drawTeeth(jaw_coords);
  tooth2.matrix.translate(4.7, 1.5, -4);
  tooth2.render();
  var tooth3 = drawTeeth(jaw_coords);
  tooth3.matrix.translate(0.25, 1.5, -2);
  tooth3.render();
  var tooth4 = drawTeeth(jaw_coords);
  tooth4.matrix.translate(4.7, 1.5, -2);
  tooth4.render();
  // Tongue of the crocodile
  var tongue = new Cube();
  tongue.color = [1 * 0.85, 0, 0.4 * 0.85, 1];
  // Attached to the jaw
  tongue.matrix = new Matrix4(jaw_coords);
  tongue.matrix.scale(0.05, 0.025, 0.15);
  tongue.matrix.translate(1.35, 1.5, -1);
  tongue.render();

  // Upper Jaw of the crocodile
  var upper_jaw = new Cube();
  upper_jaw.color = [0.034, 0.3, 0.05, 1];
  // Attaches to the head
  upper_jaw.matrix = new Matrix4(head_coords);
  upper_jaw.matrix.translate(0.01, 0.07, -0.205);
  // If poke animation is true than it will do the animation for opening the mouth
  if (g_jawAnimation) {
    g_jawAngle = 15 * Math.sin(5 * g_seconds);
    if (g_jawAngle > 0) {
      upper_jaw.matrix.rotate(g_jawAngle, 1, 0, 0);
    }
  }
  upper_jaw.matrix.rotate(-95, 1, 0, 0);
  upper_jaw.matrix.scale(0.18, 0.25, 0.05);
  upper_jaw.render();

  // Uses the drawLeg() func to easily make the objects for the legs and return the parts for finetuning
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

  // Base of the tail
  var tail_base = new Cylinder();
  tail_base.color = [0.1, 0.4, 0.05, 1];
  tail_base.matrix = new Matrix4(body_coords);
  tail_base.matrix.rotate(g_tail_baseAngle, 0, 1, 0);
  var tail_coords = new Matrix4(tail_base.matrix);
  tail_base.matrix.scale(0.15, 0.15, 0.15);
  tail_base.matrix.translate(-0.15, -1, 0);
  tail_base.matrix.rotate(-95, 1, 0, 0);
  tail_base.render();

  // Middle portion of the tail
  var tail_middle = new Cylinder();
  tail_middle.color = [0.034, 0.35, 0.05, 1];
  tail_middle.matrix = tail_coords;
  tail_middle.matrix.translate(-0.025, -0.15, 0.125);
  tail_middle.matrix.scale(0.125, 0.125, 0.125);
  tail_middle.matrix.rotate(g_tail_middleAngle, 0, 1, 0);
  var tail2_coords = new Matrix4(tail_middle.matrix);
  tail_middle.matrix.rotate(-95, 1, 0, 0);
  tail_middle.render();

  // End portion of the tail
  var tail_end = new Cylinder();
  tail_end.color = [0.034, 0.2, 0.05, 1];
  tail_end.matrix = tail2_coords;
  tail_end.matrix.rotate(-95, 1, 0, 0);
  tail_end.matrix.rotate(g_tail_endAngle, 0, 0, 1);
  tail_end.matrix.translate(-0.025, -0.8, 0);
  tail_end.matrix.scale(0.8, 0.8, 0.8);
  tail_end.render();

  // Spikes on the back of the crocodile
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

  // Calculates the time that it took to do all the rendering and push the fps to the screen
  var duration = performance.now() - startTime;
  sendTextToHTML(
    " ms: " +
      Math.floor(duration) +
      " fps: " +
      Math.floor(10000 / duration) / 10,
    "performance_text"
  );
}
// Pushes the text to the screen
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
  }
  htmlElm.innerHTML = text;
}
