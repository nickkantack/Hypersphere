class PoseJoystickAdapter {

    /*
    This class bridges the gap between the joystick controls and the environment. Specifically, the controlsOverlay are written in a 
    generic and reusable, way, which admits the design principal "The joysticks should not know they are controlling a character's
    position and orientation." The environment, similarily, "should not know its drawing reference is attached to a movable player."

    This adapter is responsible for consolidating recent position and orientation data from the controlsOverlay and providing an
    orderly, well controlled rate of requests for draws from the enrivonment. The environment has basic throttling, but this class
    is responsible for ensuring the environment draw requests are optmized for the best user experience.
    */

    #environment;
    #playerAzimuthAngle = 0;
    #playerElevationAngle = 0;
    #playerXCoordinate = 0;
    #playerYCoordinate = 0;

    #azimuthDamperFactor = 1 / 50;
    #elevationDamperFactor = 1 / 50;

    #sideToSideDamperFactor = 1 / 10;
    #forwardAndBackDamperFactor = 1 / 10;

    #delayBetweenEnvironmentDrawsMillis = 15;

    constructor(environment) {
        this.#environment = environment;

        environment.draw(0, 0, [0.001, 0.001, 0.001]);

        setInterval(() => {

            // A positive azimuth angle change is like turning left, so the "top" coordinate (index 1) going further top (negative change)
            // should correspond to the first element of the alignedVector (the new azimuth angle) becoming more positive.
            // A positive elevation angle change is like looking down, so the "left" coordinate (index 0) going further left (negative change)
            // should correspond to the second element of the alignedVector (the new elevation angle) becoming more positive.
            if (isJoystickHeldMap["lowerJoystick"]) {
                let vector = joystickToVectorMap["lowerJoystick"];
                vector = this.#postProcessJoystickVector(vector);
                this.#playerAzimuthAngle -= vector[1] * this.#azimuthDamperFactor;
                this.#playerElevationAngle -= vector[0] * this.#elevationDamperFactor;
                // debugDiv.innerHTML = `${vector[0]}, ${vector[1]}`;
            }
            if (isJoystickHeldMap["upperJoystick"]) {
                // The player's "right" vector (Unity speak) is the vector that should be added to the x and y portion of the player position,
                // scaled by the negative "top" displacement of the vector (i.e. -vector[1]).
                let vector = joystickToVectorMap["upperJoystick"];
                vector = this.#postProcessJoystickVector(vector);
                let rightVector = [Math.sin(this.#playerAzimuthAngle), Math.cos(this.#playerAzimuthAngle)];
                // There are cross terms here! Both elements of rightVector should influence the player's X and Y coordinates
                // debugDiv.innerHTML = `${rightVector[0]},${rightVector[1]}`;
                this.#playerXCoordinate += vector[1] * rightVector[0] * this.#sideToSideDamperFactor;
                this.#playerYCoordinate += vector[1] * rightVector[1] * this.#sideToSideDamperFactor;
                // The player's "forward" vector should also be added, and this is positively scaled by the "left" displacement of the vector.
                let forwardVector = [Math.cos(this.#playerAzimuthAngle), -Math.sin(this.#playerAzimuthAngle)];
                this.#playerXCoordinate += vector[0] * forwardVector[0] * this.#forwardAndBackDamperFactor;
                this.#playerYCoordinate += vector[0] * forwardVector[1] * this.#forwardAndBackDamperFactor;
            }
            if (isJoystickHeldMap["lowerJoystick"] || isJoystickHeldMap["upperJoystick"]) {
                this.#environment.draw(this.#playerAzimuthAngle, this.#playerElevationAngle, [this.#playerXCoordinate, this.#playerYCoordinate, 0]);
                debugDiv.innerHTML = this.#environment.getLastDrawDuration();
            }
        }, this.#delayBetweenEnvironmentDrawsMillis);
    }

    #postProcessJoystickVector(vector) {
        return VectorCalc.cube(vector);
    }
}