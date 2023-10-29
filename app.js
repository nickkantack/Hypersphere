
let environment = new Environment(10, Math.PI * 2 / 3, Math.PI / 2, mainDiv);

for (let i = -15; i < 15; i++) {
    for (let j = -15; j < 15; j++) {
        environment.addPoint([2 * i, 2 * j, -1]);
    }
}

let joystickAdapter = new PoseJoystickAdapter(environment);