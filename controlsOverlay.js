
const outerJoystickOutsideRadius = 70;
const outerJoystickRingRadialThickness = 10;
const innerJoystickRadius = 50;

isJoystickHeldMap = {};
anchorMap = {};
joystickToTouchMap = {};
doesUpperJoystickHaveFirstTouch = false;

initializeControls(mainDiv);

function initializeControls(parent) {

    // Create the top joystick
    const upperJoystick = createJoystick("upperJoystick", 25, 50, parent);
    const lowerJoystick = createJoystick("lowerJoystick", 75, 50, parent);
    // TODO create another joystick

}

function createJoystick(id, x, y, parent) {
    const outerRingSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    outerRingSvg.style.display = "block";
    outerRingSvg.style.position = "absolute";
    outerRingSvg.style.top = `${x}%`;
    outerRingSvg.style.left = `${y}%`;
    outerRingSvg.style.width = `${2 * outerJoystickOutsideRadius}px`;
    outerRingSvg.style.height = `${2 * outerJoystickOutsideRadius}px`;
    outerRingSvg.style.transform = `translate(-50%, -50%)`;
    outerRingSvg.setAttribute("viewBox", "0 0 100 100");
    outerRingSvg.innerHTML = `<circle cx="50" cy="50" 
        r="${50 * (1 - outerJoystickRingRadialThickness / outerJoystickOutsideRadius)}" 
        stroke-width="${outerJoystickRingRadialThickness}" stroke="black" fill="none"/>`;
    parent.appendChild(outerRingSvg);

    const innerJoystick = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    innerJoystick.style.display = "block";
    innerJoystick.style.position = "absolute";
    innerJoystick.style.top = `${x}%`;
    innerJoystick.style.left = `${y}%`;
    innerJoystick.style.width = `${y}%`;
    innerJoystick.style.width = `${2 * innerJoystickRadius}px`;
    innerJoystick.style.height = `${2 * innerJoystickRadius}px`;
    innerJoystick.style.transform = `translate(-50%, -50%)`;
    innerJoystick.setAttribute("viewBox", "0 0 100 100");
    innerJoystick.innerHTML = `<circle cx="50" cy="50" r="${innerJoystickRadius}" stroke="none" fill="#333"/>`;
    parent.appendChild(innerJoystick);

    function setAnchor() {
        if (anchorMap[id] && !isNaN(anchorMap[id][0])) return;
        const rect = outerRingSvg.getBoundingClientRect();
        anchorMap[id] = [
            rect.left + rect.width / 2,
            rect.top + rect.height / 2
        ];
    }

    function standardMousedown() {
        joystickToTouchMap[id] = [...Object.keys(isJoystickHeldMap)].filter(key => isJoystickHeldMap[key]).length;
        isJoystickHeldMap[id] = true;
        setAnchor();
    }
    innerJoystick.addEventListener("mousedown", (event) => {
        standardMousedown();
        updateJoystickPosition(event);
    });
    innerJoystick.addEventListener("touchstart", (event) => {
        event.preventDefault();
        standardMousedown();
        updateJoystickPosition(event.touches[joystickToTouchMap[id]]);
    });

    function standardMouseup() {
        isJoystickHeldMap[id] = false;
        delete joystickToTouchMap[id];
        innerJoystick.style.transform = `translate(${-innerJoystickRadius}px, ${-innerJoystickRadius}px)`;
    }

    document.body.addEventListener("mouseup", standardMouseup);
    document.body.addEventListener("touchend", standardMouseup);
    document.body.addEventListener("mousemove", updateJoystickPosition);
    document.body.addEventListener("touchmove", (event) => {
        updateJoystickPosition(event.touches[joystickToTouchMap[id]]);
    });
    
    const outerJoystickOutsideRadiusSquared = outerJoystickOutsideRadius * outerJoystickOutsideRadius;
    function updateJoystickPosition(touchEvent) {
        if (!isJoystickHeldMap[id]) return;
        const anchor = anchorMap[id];
        let vector = [touchEvent.pageX - anchor[0], touchEvent.pageY - anchor[1]];
        let vectorSquareLength = vector[0] * vector[0] + vector[1] * vector[1];
        if (vectorSquareLength > outerJoystickOutsideRadiusSquared) {
            vector[0] *= outerJoystickOutsideRadius / Math.sqrt(vectorSquareLength);
            vector[1] *= outerJoystickOutsideRadius / Math.sqrt(vectorSquareLength);
        }
        innerJoystick.style.transform = `translate(${-innerJoystickRadius + vector[0]}px, ${-innerJoystickRadius + vector[1]}px)`;
        debugDiv.innerHTML = vector;
        // TODO call any registered callbacks about new control values from the joystick
    }

}