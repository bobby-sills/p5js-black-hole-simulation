# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## How to Help Me

I'm a 9th grader learning the physics behind black holes and trying to implement them myself. **Please prioritize teaching over coding.** Rather than writing large blocks of code for me, help me understand the concepts — the physics, the math, and *why* things work the way they do — so I can write the code myself. Small code snippets or pseudocode to illustrate a point are fine, but I want to learn by doing. Explain things at a high-school level when possible.

## Reference Project

I'm recreating the simulation from [kavan010/black_hole](https://github.com/kavan010/black_hole), which is a C++/OpenGL black hole simulation. A clone of that repo lives at `reference/` in this project directory. The most relevant file for my p5.js version is `reference/2D_lensing.cpp` — it implements the same 2D gravitational lensing with Schwarzschild geodesic equations that I'm trying to port to JavaScript/p5.js.

Key things I'm learning and implementing step by step:
1. **Schwarzschild geodesic equations** — how light bends in curved spacetime near a black hole
2. **Conserved quantities (E and L)** — energy and angular momentum of light rays
3. **RK4 numerical integration** — for accurately stepping rays through curved spacetime
4. **Polar coordinates** — the simulation works in (r, φ) and converts to Cartesian for drawing

When helping, refer to `reference/2D_lensing.cpp` for the target implementation rather than fetching from the web.

## Project Overview

A black hole gravitational lensing simulation built with p5.js. Light rays are emitted and bent by the gravitational field of a black hole, visualized on an HTML5 canvas.

## Running

Open `index.html` in a browser. No build step or package manager is needed. p5.js is loaded from CDN (v1.11.11) and also vendored locally as `p5.js` and `p5.sound.min.js`.

## Architecture

- **sketch.js** — All simulation logic lives in this single file:
  - `BlackHole` class: positioned at a coordinate with a mass, computes its Schwarzschild radius, draws itself
  - `Ray` class: a light ray with position and velocity, steps forward each frame
  - p5.js `setup()` creates the canvas, instantiates one black hole and an array of rays
  - p5.js `draw()` is the animation loop — steps rays and renders them
- **index.html** — Loads p5.js from CDN and includes sketch.js
- **style.css** — Minimal canvas styling

## p5.js Conventions

This project uses p5.js in global mode (not instance mode). Functions like `createVector()`, `createCanvas()`, `fill()`, `circle()`, `background()` are all global. The `setup()` and `draw()` functions are the p5.js entry points — do not call them manually.
