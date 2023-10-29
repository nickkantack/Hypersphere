class Environment {

    #points;
    #polygons;
    #referenceDistance;
    #bMax;
    #cMax;
    #parent;
    #lastDrawTime;
    #lastDrawDuration;
    #lightVector;
    #bFieldOfViewAngle;
    #cFieldOfViewAngle;
    #backgroundGradientSvg;

    static minMillisBetweenDraws = 10;

    constructor(referenceDistance, bFieldOfViewAngle, cFieldOfViewAngle, lightVector, parent) {
        this.#referenceDistance = referenceDistance;
        this.#points = [];
        this.#polygons = [];
        this.#lightVector = lightVector;
        this.#bFieldOfViewAngle = bFieldOfViewAngle;
        this.#cFieldOfViewAngle = cFieldOfViewAngle;
        const lightVectorLength = VectorCalc.mag(lightVector);
        if (lightVectorLength < VectorCalc.NEARLY_ZERO) {
            console.warn(`Light vector has practically no length. This will cause lighting problems.`);
        } else {
            this.#lightVector = VectorCalc.scale(this.#lightVector, 1 / lightVectorLength);
        }
        // Compute bMax and cMax
        this.#bMax = Math.tan(bFieldOfViewAngle / 2) * referenceDistance / 200;
        this.#cMax = Math.tan(cFieldOfViewAngle / 2) * referenceDistance / 200;
        this.#parent = parent;

        // Add the non-gradient SVG background
        const backgroundSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        backgroundSvg.setAttribute("viewBox", "0 0 100 100");
        backgroundSvg.setAttribute("preserveAspectRatio", "none");
        backgroundSvg.style.display = "block";
        backgroundSvg.style.position = "absolute";
        backgroundSvg.style.left = "0";
        backgroundSvg.style.top = "0";
        backgroundSvg.style.width = "100%";
        backgroundSvg.style.height = "100%";
        backgroundSvg.innerHTML = `
        <rect width="100%" height="100%" fill="rgb(205,30,30)">`;
        this.#parent.appendChild(backgroundSvg);

        // Add the SVG for the background now
        this.#backgroundGradientSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.#backgroundGradientSvg.setAttribute("viewBox", "0 0 100 100");
        this.#backgroundGradientSvg.setAttribute("preserveAspectRatio", "none");
        this.#backgroundGradientSvg.style.display = "block";
        this.#backgroundGradientSvg.style.position = "absolute";
        this.#backgroundGradientSvg.style.left = "0";
        this.#backgroundGradientSvg.style.top = "0";
        this.#backgroundGradientSvg.style.width = "100%";
        this.#backgroundGradientSvg.style.height = "100%";
        this.#backgroundGradientSvg.innerHTML = `
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgb(255,175,150);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(205,30,30);stop-opacity:1" />
        </linearGradient>
        <rect width="100%" height="100%" fill="url(#grad1)">`;
        this.#parent.appendChild(this.#backgroundGradientSvg);
    }

    addPoint(coordinates, size, customFillHtml, identifier) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 100 100");
        svg.style.display = "block";
        svg.style.position = "absolute";
        svg.style.left = "50%";
        svg.style.top = "50%";
        svg.style.width = "10px";
        svg.style.height = "10px";
        svg.style.transform = "transform(-50%, -50%)";
        svg.innerHTML = `${customFillHtml || ""}<circle cx="50" cy="50" r="40" stroke="none" fill="${customFillHtml ? identifier : "#400"}"/>`;
        this.#points.push({svg: svg, coordinates: coordinates, size: size});
        this.#parent.appendChild(svg);
    }

    addPolygon(arrayOfCoordinates, principalColorHashtag) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 100 100");
        svg.setAttribute("preserveAspectRatio", "none");
        svg.style.display = "block";
        svg.style.position = "absolute";
        svg.style.left = "0";
        svg.style.top = "0";
        svg.style.width = `100%`;
        svg.style.height = `100%`;
        let normalVector = null;
        if (arrayOfCoordinates.length > 2) {
            const v1 = [arrayOfCoordinates[1][0] - arrayOfCoordinates[0][0], 
                        arrayOfCoordinates[1][1] - arrayOfCoordinates[0][1],
                        arrayOfCoordinates[1][2] - arrayOfCoordinates[0][2]];
            const v2 = [arrayOfCoordinates[2][0] - arrayOfCoordinates[0][0], 
                        arrayOfCoordinates[2][1] - arrayOfCoordinates[0][1],
                        arrayOfCoordinates[2][2] - arrayOfCoordinates[0][2]];
            normalVector = [v1[1] * v2[2] - v2[1] * v1[2],
                            v1[2] * v2[0] - v2[2] * v1[0],
                            v1[0] * v2[1] - v2[0] * v1[1]];
            const normalVectorLength = Math.sqrt(normalVector[0] * normalVector[0] + normalVector[1] * normalVector[1] + normalVector[2] * normalVector[2]);
            if (normalVectorLength < 0.00001) {
                console.warn("Got a polygon with a normal vector that's practically zero. That's probably gonna be an issue.");
            } else {
                normalVector = [normalVector[0] / normalVectorLength, normalVector[1] / normalVectorLength, normalVector[2] / normalVectorLength];
            }
        }
        const lightingDotProduct = VectorCalc.dotProduct(normalVector, this.#lightVector);
        svg.innerHTML = `<path stroke="none" fill=${ColorUtils.adjustColorHashtagForLighting(principalColorHashtag, lightingDotProduct)} d=""/>`;
        this.#polygons.push({svg: svg, arrayOfCoordinates: arrayOfCoordinates, normalVector: normalVector});
        this.#parent.appendChild(svg);
    }

    #threePointToTopAndLeftPercents(point, azimuthAngle, elevationAngle, observerCoordinates, doPolyPin) {
        let translatedPoint = [point[0] - observerCoordinates[0], point[1] - observerCoordinates[1], point[2] - observerCoordinates[2]];
        let intermedRotatedPoint = [translatedPoint[0] * FastMath.fastCosine(azimuthAngle) - translatedPoint[1] * FastMath.fastSine(azimuthAngle),
                                    translatedPoint[1] * FastMath.fastCosine(azimuthAngle) + translatedPoint[0] * FastMath.fastSine(azimuthAngle), 
                                    translatedPoint[2]];
        let rotatedPoint = [intermedRotatedPoint[0] * FastMath.fastCosine(elevationAngle) - intermedRotatedPoint[2] * FastMath.fastSine(elevationAngle),
                            intermedRotatedPoint[1],
                            intermedRotatedPoint[2] * FastMath.fastCosine(elevationAngle) + intermedRotatedPoint[0] * FastMath.fastSine(elevationAngle)];
        // Now rotatedPoint can be thought of as in the form [a, b, c], where a is depth, b is long dim of the screen, and c is the
        // short dim of the screen
        let isVisible = rotatedPoint[0] > 0;
        if (doPolyPin && rotatedPoint[0] < 0) rotatedPoint[0] = 0.1;
        let screenX = rotatedPoint[0] === 0 ? rotatedPoint[1] : rotatedPoint[1] * this.#referenceDistance / rotatedPoint[0];
        screenX /= this.#bMax;
        let screenY = rotatedPoint[0] === 0 ? rotatedPoint[0] : rotatedPoint[2] * this.#referenceDistance / rotatedPoint[0];
        screenY /= this.#cMax;
        const sizeScaler = rotatedPoint[0] === 0 ? 0 : 1 / rotatedPoint[0] * this.#referenceDistance;

        isVisible &= Math.abs(screenX) < 110 && Math.abs(screenY) < 110;

        return {
            isVisible: isVisible,
            leftPercent: 50 + screenY,
            topPercent: 50 + screenX,
            sizeScaler: sizeScaler,
            rotatedPoint: rotatedPoint
        }

    }

    draw(azimuthAngle, elevationAngle, observerCoordinates) {
        const drawStartTime = Date.now();
        if (drawStartTime - this.#lastDrawTime < Environment.minMillisBetweenDraws) return;

        // Draw the sky
        this.#backgroundGradientSvg.style.left = `${elevationAngle / this.#cFieldOfViewAngle * 200}%`;

        for (let polygon of this.#polygons) {
            // Generate the svg d string
            if (polygon.arrayOfCoordinates.length < 3) {
                console.warn(`Skipping drawing polygon with only ${polygon.arrayOfCoordinates.length} vertices.`);
                continue;
            }

            let projection = this.#threePointToTopAndLeftPercents(polygon.arrayOfCoordinates[0], azimuthAngle, elevationAngle, observerCoordinates, true);
            let isAnyPointVisible = projection.isVisible;
            // Do the small polygon approximation (if any point is behind the player, the whole polygon is invisible)
            if (projection.rotatedPoint[0] < 0) {
                polygon.svg.style.display = "none";
                continue;
            }
            let pathString = `M${projection.leftPercent} ${projection.topPercent}`;
            for (let i = 1; i < polygon.arrayOfCoordinates.length; i++) {
                projection = this.#threePointToTopAndLeftPercents(polygon.arrayOfCoordinates[i], azimuthAngle, elevationAngle, observerCoordinates, true);
                // Do the small polygon approximation (if any point is behind the player, the whole polygon is invisible)
                if (projection.rotatedPoint[0] < 0) {
                    polygon.svg.style.display = "none";
                    break;
                }
                isAnyPointVisible |= projection.isVisible;
                if (projection.isVisible) {
                    polygon.svg.setAttribute("lastACoordinate", VectorCalc.squareDistanceBetween(projection.rotatedPoint, observerCoordinates));
                }
                pathString += `L${projection.leftPercent} ${projection.topPercent}`;
            }
            if (isAnyPointVisible) {
                polygon.svg.style.display = "block";
                //polygon.svg.querySelector("path").setAttribute("opacity", (10 / projection.rotatedPoint[0] > 1 ? 1 : 10 / projection.rotatedPoint[0]));
                polygon.svg.querySelector("path").setAttribute("d", `${pathString}Z`);
                // Do one swap with a neighbor
                /*
                const previousSibling = polygon.svg.previousSibling;
                if (previousSibling.tagName === "svg") {
                    if (previousSibling.getAttribute("lastACoordinate") && polygon.svg.getAttribute("lastACoordinate")) {
                        if (previousSibling.getAttribute("lastACoordinate") < polygon.svg.getAttribute("lastACoordinate")) {
                            polygon.svg.parentNode.insertBefore(polygon.svg, previousSibling);
                        }
                    }
                }
                */
            } else {
                polygon.svg.style.display = "none";
            }
        }

        for (let point of this.#points) {
            let svg = point.svg;

            const projection = this.#threePointToTopAndLeftPercents(point.coordinates, azimuthAngle, elevationAngle, observerCoordinates);

            svg.style.display = projection.isVisible ? "block" : "none";
            if (!projection.isVisible) continue;
            svg.style.width = `${(point.size ? point.size : 10) * projection.sizeScaler}px`;
            svg.style.height = `${(point.size ? point.size : 10) * projection.sizeScaler}px`;
            svg.style.top = `${projection.topPercent}%`;
            svg.style.left = `${projection.leftPercent}%`;
        }

        this.#lastDrawTime = Date.now();
        this.#lastDrawDuration = this.#lastDrawTime - drawStartTime;
    }

    getLastDrawDuration() {
        return this.#lastDrawDuration;
    }

}
