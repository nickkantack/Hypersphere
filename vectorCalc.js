
class VectorCalc {

    /*
    This class is meant to be a speed-optimized utility class for vector operations on 3 dimensional arrays. It is so speed-optimized
    that it avoids many convenience functions and iterators in favor of the lowest possible execution time. Do not give this class
    vectors that are not 3D. This thing is so speed-optimized it will not validate your input, but rather process it as fast as possible.
    */

    static NEARLY_ZERO = 0.000001;

    static add(p1, p2) {
        return [p1[0] + p2[0], p1[1] + p2[1], p1[2] + p2[2]];
    }

    static mag(array) {
        return Math.sqrt(array[0] * array[0] + array[1] * array[1] + array[2] * array[2]);
    }

    static magSq(array) {
        return array[0] * array[0] + array[1] * array[1] + array[2] * array[2];
    }

    static scale(array, factor) {
        return [array[0] * factor, array[1] * factor, array[2] * factor];
    }

    static dotProduct(array1, array2) {
        return array1[0] * array2[0] + array1[1] * array2[1] + array1[2] * array2[2];
    }

    static distanceBetween(p1, p2) {
        return VectorCalc.mag([p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2]]);
    }

    static squareDistanceBetween(p1, p2) {
        return VectorCalc.magSq([p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2]]);
    }

    static square(array) {
        return [array[0] * array[0], array[1] * array[1], array[2] * array[2]];
    }

    static cube(array) {
        return [array[0] * array[0] * array[0], array[1] * array[1] * array[1], array[2] * array[2] * array[2]];
    }

}