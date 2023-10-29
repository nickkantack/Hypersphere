
let environment = new Environment(10, Math.PI * 2 / 3, Math.PI / 2, mainDiv);

for (let i = -5; i < 5; i++) {
    for (let j = -5; j < 5; j++) {
        environment.addPoint([4 * i, 4 * j, -1]);
    }
}

let joystickAdapter = new PoseJoystickAdapter(environment);