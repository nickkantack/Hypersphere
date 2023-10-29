class Environment {

    #points;
    #referenceDistance;
    #bMax;
    #cMax;
    #parent;
    #lastDrawTime;
    #lastDrawDuration;

    static minMillisBetweenDraws = 10;

    constructor(referenceDistance, bFieldOfViewAngle, cFieldOfViewAngle, parent) {
        this.#referenceDistance = referenceDistance;
        this.#points = [];
        // Compute bMax and cMax
        this.#bMax = Math.tan(bFieldOfViewAngle / 2) * referenceDistance / 200;
        this.#cMax = Math.tan(cFieldOfViewAngle / 2) * referenceDistance / 200;
        this.#parent = parent;
    }

    addPoint(coordinates) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 100 100");
        svg.style.display = "block";
        svg.style.position = "absolute";
        svg.style.left = "50%";
        svg.style.top = "50%";
        svg.style.width = "10px";
        svg.style.height = "10px";
        svg.style.transform = "transform(-50%, -50%)";
        svg.innerHTML = `<circle cx="50" cy="50" r="40" stroke="none" fill="#400"/>`;
        this.#points.push({svg: svg, coordinates: coordinates});
        this.#parent.appendChild(svg);
    }

    draw(azimuthAngle, elevationAngle, observerCoordinates) {
        const drawStartTime = Date.now();
        if (drawStartTime - this.#lastDrawTime < Environment.minMillisBetweenDraws) return;
        // First, translate everything so that the origin is referenceDistance
        for (let point of this.#points) {
            let svg = point.svg;
            let p = point.coordinates;
            let translatedPoint = [p[0] - observerCoordinates[0], p[1] - observerCoordinates[1], p[2] - observerCoordinates[2]];
            // console.log(`translatedPoint: ${translatedPoint}`);
            let intermedRotatedPoint = [translatedPoint[0] * Math.cos(azimuthAngle) - translatedPoint[1] * Math.sin(azimuthAngle),
                                        translatedPoint[1] * Math.cos(azimuthAngle) + translatedPoint[0] * Math.sin(azimuthAngle), 
                                        translatedPoint[2]];
            // console.log(`intermedRotatedPoint: ${intermedRotatedPoint}`);
            let rotatedPoint = [intermedRotatedPoint[0] * Math.cos(elevationAngle) - intermedRotatedPoint[2] * Math.sin(elevationAngle),
                                intermedRotatedPoint[1],
                                intermedRotatedPoint[2] * Math.cos(elevationAngle) + intermedRotatedPoint[0] * Math.sin(elevationAngle)];
            // console.log(`rotatedPoint: ${rotatedPoint}`);
            if (rotatedPoint[0] < 0) {
                svg.style.display = "none";
                continue;
            }
            // Now rotatedPoint can be thought of as in the form [a, b, c], where a is depth, b is long dim of the screen, and c is the
            // short dim of the screen
            let screenX = rotatedPoint[0] === 0 ? rotatedPoint[1] : rotatedPoint[1] * this.#referenceDistance / rotatedPoint[0];
            screenX /= this.#bMax;
            let screenY = rotatedPoint[0] === 0 ? rotatedPoint[0] : rotatedPoint[2] * this.#referenceDistance / rotatedPoint[0];
            screenY /= this.#cMax;
            const size = rotatedPoint[0] === 0 ? 0 : 10 / rotatedPoint[0] * this.#referenceDistance;
            // console.log(`screenX: ${screenX}, screenY: ${screenY}`);

            const isVisible = rotatedPoint[0] > 0 && Math.abs(screenX) < 110 && Math.abs(screenY) < 110;

            svg.style.display = isVisible ? "block" : "none";
            if (!isVisible) continue;
            svg.style.width = `${size}px`;
            svg.style.height = `${size}px`;
            svg.style.top = `${50 + screenX}%`;
            svg.style.left = `${50 + screenY}%`;
        }
        this.#lastDrawTime = Date.now();
        this.#lastDrawDuration = this.#lastDrawTime - drawStartTime;
    }

    getLastDrawDuration() {
        return this.#lastDrawDuration;
    }

}
