// Constants
const graviationalConstant = 6.6743 * (10 ^ -11);
const lightSpeed = 299792458;

let blackHole;
let rays;

class BlackHole {
  constructor(position = createVector(0, 0), mass) {

  }
}

class Ray {
  constructor(position, velocity = createVector(1, 0)) {
    this.position = position;
    this.velocity = velocity;
  }

  step() {
    this.position.add(p5.Vector.mult(this.velocity, lightSpeed));
  }
}

function setup() {
  createCanvas(400, 400);
  noStroke();

  rays = [];
  const numberOfRays = 20;

  for (let i = 0; i < numberOfRays; i++) {
    rays.push(new Ray(createVector(0, (i * (height / numberOfRays)) + height / (numberOfRays * 2))));
  }

  print(rays);

  blackHole = {
    position: createVector(200, 200),
    radius: 100,
  };
}

function draw() {
  for (const ray of rays) {
    ray.step();
  }

  background(0);

  fill("red");
  circle(blackHole.position.x, blackHole.position.y, blackHole.radius);

  for (let ray of rays) {
    fill("yellow");
    circle(ray.position.x, ray.position.y, 5);
  }

}
