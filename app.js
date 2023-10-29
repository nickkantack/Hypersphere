
let environment = new Environment(10, Math.PI * 2 / 3, Math.PI / 2, mainDiv);

function terrainGenerator(x, y) {
    return Math.cos(2 * Math.PI / 5 * x) + Math.cos(2 * Math.PI / 8 * y);
}

for (let i = -15; i < 15; i++) {
    for (let j = -15; j < 15; j++) {
        environment.addPoint([2 * i, 2 * j, -1]);
    }
}

environment.addPolygon([
    [10, 0, 0],
    [10, 3, 0],
    [10, 3, 3],
    [10, 0, 3]
])
environment.addPoint([10, 0, 0]);
environment.addPoint([10, 3, 0]);
environment.addPoint([10, 3, 3]);
environment.addPoint([10, 0, 3]);

let joystickAdapter = new PoseJoystickAdapter(environment);