const stdout = process.stdout;

// Clear the screen and hide the cursor
stdout.write("\x1b[2J\x1b[?25l");

let A = 0;
let B = 0;

// Screen size (columns x rows)
const width = 80;
const height = 24;

// Pre-compute luminance characters from dark to bright
const luminanceChars = ".,-~:;=!*#$@";

// Main render loop
setInterval(() => {
  const zBuffer = new Array(width * height).fill(0);
  const output = new Array(width * height).fill(" ");

  // Iterate over the surface of the torus
  for (let theta = 0; theta < Math.PI * 2; theta += 0.07) {
    for (let phi = 0; phi < Math.PI * 2; phi += 0.02) {
      // Donut radii
      const R1 = 1; // tube radius
      const R2 = 2; // central radius

      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      // Calculate 3D coordinates after rotation
      const circleX = R2 + R1 * cosTheta;
      const circleY = R1 * sinTheta;

      // Spin around X and Z axes (A and B)
      const x = circleX * (Math.cos(B) * cosPhi + Math.sin(A) * Math.sin(B) * sinPhi) - circleY * Math.cos(A) * Math.sin(B);
      const y = circleX * (Math.sin(B) * cosPhi - Math.sin(A) * Math.cos(B) * sinPhi) + circleY * Math.cos(A) * Math.cos(B);
      const z = 5 + Math.cos(A) * circleX * sinPhi + circleY * Math.sin(A);

      // Perspective projection
      const ooz = 1 / z; // "one over z"
      const projX = Math.floor(width / 2 + 30 * ooz * x);
      const projY = Math.floor(height / 2 - 15 * ooz * y);

      // Calculate luminance
      const L = cosPhi * cosTheta * Math.sin(B) -
                Math.cos(A) * cosTheta * sinPhi -
                Math.sin(A) * sinTheta +
                Math.cos(B) * (Math.cos(A) * sinTheta - cosTheta * Math.sin(A) * sinPhi);

      const luminanceIndex = Math.floor((L + 1) * 5.5); // scale to 0-11

      // Update the pixel if within bounds and closer than previous point
      const idx = projX + width * projY;
      if (projY >= 0 && projY < height && projX >= 0 && projX < width && ooz > zBuffer[idx]) {
        zBuffer[idx] = ooz;
        const clampedIndex = Math.max(0, Math.min(luminanceIndex, luminanceChars.length - 1));
        output[idx] = luminanceChars[clampedIndex];
      }
    }
  }

  // Move cursor to home position
  stdout.write("\x1b[H");

  // Render frame
  for (let i = 0; i < output.length; i++) {
    if (i % width === 0 && i !== 0) stdout.write("\n");
    stdout.write(output[i]);
  }

  // Increment rotation angles
  A += 0.07;
  B += 0.03;
}, 50);

// Restore cursor when process exits
process.on("SIGINT", () => {
  stdout.write("\x1b[?25h\x1b[2J\x1b[H");
  process.exit();
}); 