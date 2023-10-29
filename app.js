
let environment = new Environment(10, Math.PI * 2 / 3, Math.PI / 2, [-20, 10, -3], mainDiv);

function terrainGenerator(x, y) {
    return -1 + 0.3 * Math.cos(2 * Math.PI / 24 * (y + x)) + 0.2 * Math.cos(2 * Math.PI / 10 * x) + 0.3 * Math.cos(2 * Math.PI / 16 * y);
}

for (let i = -25; i < 25; i++) {
    for (let j = -25; j < 25; j++) {
        // environment.addPoint([2 * i, 2 * j, terrainGenerator(2 * i, 2 * j)]);
        environment.addPolygon([
            [2 * i, 2 * j, terrainGenerator(2 * i, 2 * j)],
            [2 * i, 2 * (j + 1), terrainGenerator(2 * i, 2 * (j + 1))],
            [2 * (i + 1), 2 * (j + 1), terrainGenerator(2 * (i + 1), 2 * (j + 1))],
            [2 * (i + 1), 2 * j, terrainGenerator(2 * (i + 1), 2 * j)],
        ], "#FAA");
    }
}

environment.addPolygon([
    [10, 0, 0],
    [10, 3, 0],
    [23, 3, 3],
    [23, 0, 3]
], "#FAA");

environment.addPoint([10, 0, 0]);
environment.addPoint([10, 3, 0]);
environment.addPoint([10, 3, 3]);
environment.addPoint([10, 0, 3]);

// Add the sun
environment.addPoint([20, -10, 3], 600, `
<radialGradient id="sunGradient">
      <stop offset="50%" stop-color="rgba(255,255,220,1)" />
      <stop offset="95%" stop-color="rgba(255,255,220,0)" />
    </radialGradient>
`, `url('#sunGradient')`);

let joystickAdapter = new PoseJoystickAdapter(environment);