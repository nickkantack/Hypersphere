
const angleResolution = 1000;
const angles =[...new Array(parseInt(2 * Math.PI * angleResolution + 1)).fill(0)].map((_,i) => ({
  cos: Math.cos(i / angleResolution),
  sin: Math.sin(i / angleResolution)
}));

const TWO_PI = 2 * Math.PI;

class FastMath {

    static fastCosine(argument) {
        const argumentInPrincipalDomain = ((argument % TWO_PI) + TWO_PI) % TWO_PI;
        return angles[parseInt(argumentInPrincipalDomain * angleResolution)].cos; 
    }

    static fastSine(argument) {
        const argumentInPrincipalDomain = ((argument % TWO_PI) + TWO_PI) % TWO_PI;
        return angles[parseInt(argumentInPrincipalDomain * angleResolution)].sin; 
    }

}