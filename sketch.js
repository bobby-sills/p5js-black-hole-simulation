// Constants
const G = 6.6743 * (10 ** -11);
const c = 299792458;
const solarMass = 1.989e30;

let blackHole;
let rays;
let metersPerPixel;

function geodesicRHS(r, phi, dr, dphi, E, rs) {
  const f = 1.0 - rs / r;
  const dt_dl = E / f;

  return [
    dr,
    dphi,
    - (rs / (2 * r * r)) * f * (dt_dl * dt_dl)
    + (rs / (2 * r * r * f)) * (dr * dr)
    + (r - rs) * (dphi * dphi),
    -2.0 * dr * dphi / r,]
}

class BlackHole {
  constructor(mass = 10 * solarMass) {
    this.mass = mass;
    // Calculated using the Schwarzschild radius formula
    this.radius = (2 * G * this.mass) / (c ** 2);
  }

  draw() {
    fill("orange");
    noStroke();
    circle(0, 0, this.radius * 2 / metersPerPixel);
  }
}

function polarToCartesian({ r, phi }) {
  return {
    x: r * Math.cos(phi),
    y: r * Math.sin(phi)
  };
}

class Ray {
  constructor(r, phi, dr, dphi) {
    this.r = r;
    this.phi = phi;
    this.dr = dr;
    this.dphi = dphi;
    this.L = r * r * dphi;
    const f = 1.0 - blackHole.radius / r
    const dt_dl = sqrt((dr * dr) / (f * f) + (r * r * dphi * dphi) / f);
    this.E = f * dt_dl;
    this.maxTrailLength = 2;

    this.trail = [];
  }

  step(dl, rs) {
    if (this.r > (width * metersPerPixel)) { this.trail.length = 0; return; }
    if (this.r <= rs * 1.05) { this.trail.length = 0; return; }
    // current state
    const y0 = [this.r, this.phi, this.dr, this.dphi];

    const k1 = geodesicRHS(...y0, this.E, rs);
    const k2 = geodesicRHS(...y0.map((val, i) => val + k1[i] * (dl / 2)), this.E, rs);
    const k3 = geodesicRHS(...y0.map((val, i) => val + k2[i] * (dl / 2)), this.E, rs);
    const k4 = geodesicRHS(...y0.map((val, i) => val + k3[i] * dl), this.E, rs);
    this.r += (dl / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    this.phi += (dl / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    this.dr += (dl / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]);
    this.dphi += (dl / 6) * (k1[3] + 2 * k2[3] + 2 * k3[3] + k4[3]);

    if (!isFinite(this.r) || !isFinite(this.phi)) { this.trail.length = 0; return; }
    this.trail.push({ r: this.r, phi: this.phi });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }
  }

  draw() {
    if (this.trail.length < 2) return;
    stroke(255);
    strokeWeight(2);
    const p1 = polarToCartesian(this.trail[0]);
    const p2 = polarToCartesian(this.trail[1]);
    line(
      p1.x / metersPerPixel, p1.y / metersPerPixel,
      p2.x / metersPerPixel, p2.y / metersPerPixel
    );
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

let isPaused = false;

function restart() {
  noStroke();

  const mass = (massSlider ? massSlider.value() : 10) * solarMass;
  blackHole = new BlackHole(mass);
  metersPerPixel = blackHole.radius / 50;

  rays = [];
  const numberOfRays = rayCountSlider ? rayCountSlider.value() : 300;

  for (let i = 0; i < numberOfRays; i++) {
    const x = (-width / 2) * metersPerPixel;
    const y = (((height * i) / numberOfRays) - (height / 2)) * metersPerPixel;
    const xv = c;
    const yv = 0;
    const phi = Math.atan2(y, x);
    const r = Math.sqrt(x ** 2 + y ** 2);
    const dr = cos(phi) * xv + sin(phi) * yv;
    const dphi = (-sin(phi) * xv + cos(phi) * yv) / r;

    rays.push(new Ray(r, phi, dr, dphi));

  }
}

let speedSlider;
let massSlider;
let rayCountSlider;
let trailSlider;
let stepAccumulator = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(50);

  let controlsDiv = createDiv();
  controlsDiv.id('controls');
  controlsDiv.parent('sim-container');

  let buttonRow = createDiv();
  buttonRow.class('button-row');
  buttonRow.parent('controls');

  const pauseButton = createButton('Pause');
  pauseButton.parent(buttonRow);
  pauseButton.mousePressed(() => isPaused = !isPaused);

  const restartButton = createButton('Restart');
  restartButton.parent(buttonRow);
  restartButton.mousePressed(restart);

  let speedRow = createDiv();
  speedRow.class('slider-row');
  speedRow.parent('controls');

  let speedLabel = createSpan('Speed: 0.5');
  speedLabel.parent(speedRow);

  speedSlider = createSlider(0.05, 3, 0.5, 0.05);
  speedSlider.parent(speedRow);
  speedSlider.input(() => speedLabel.html('Speed: ' + speedSlider.value()));

  let massRow = createDiv();
  massRow.class('slider-row');
  massRow.parent('controls');

  let massLabel = createSpan('Mass: 10 solar');
  massLabel.parent(massRow);

  massSlider = createSlider(1, 50, 10, 1);
  massSlider.parent(massRow);
  massSlider.input(() => massLabel.html('Mass: ' + massSlider.value() + ' solar'));

  let rayCountRow = createDiv();
  rayCountRow.class('slider-row');
  rayCountRow.parent('controls');

  let rayCountLabel = createSpan('Rays: 300');
  rayCountLabel.parent(rayCountRow);

  rayCountSlider = createSlider(50, 1000, 300, 10);
  rayCountSlider.parent(rayCountRow);
  rayCountSlider.input(() => rayCountLabel.html('Rays: ' + rayCountSlider.value()));

  let trailRow = createDiv();
  trailRow.class('slider-row');
  trailRow.parent('controls');

  let trailLabel = createSpan('Trail: 10');
  trailLabel.parent(trailRow);

  trailSlider = createSlider(1, 80, 10, 1);
  trailSlider.parent(trailRow);
  trailSlider.input(() => trailLabel.html('Trail: ' + trailSlider.value()));

  restart();
}

function draw() {
  if (isPaused) return;
  translate(width / 2, height / 2);
  // Scale alpha by deltaTime so trail length is consistent regardless of FPS
  const trailAlpha = constrain(trailSlider.value() * (deltaTime / 16.67), 0, 255);
  background(50, trailAlpha);
  blackHole.draw();
  stepAccumulator += speedSlider.value();
  while (stepAccumulator >= 1) {
    for (const ray of rays) {
      ray.step(1e-5, blackHole.radius);
    }
    stepAccumulator -= 1;
  }
  for (const ray of rays) {
    ray.draw();
  }
}
