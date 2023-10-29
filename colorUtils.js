
class ColorUtils {

    static adjustColorHashtagForLighting(colorHashtag, lightVectorNormalVectorDotProduct) {
        const halfRange = 0.3;
        const sensitivity = 10;
        const expectedDot = 0.85;
        let colorScaler = (1 - halfRange) + halfRange * (lightVectorNormalVectorDotProduct - expectedDot) * sensitivity;
        if (colorScaler > 1) colorScaler = 1;
        if (colorScaler < 1 - 2 * halfRange) colorScaler = 1 - 2 * halfRange;
        const result = ColorUtils.arrayToColorHashtag(VectorCalc.scale(ColorUtils.colorHashtagToArray(colorHashtag), colorScaler));
        return result;
    }

    static colorHashtagToArray(colorHashtag) {
        if (colorHashtag.length === 0 || colorHashtag[0] !== "#") {
            console.error(`Invalid color hashtag ${colorHashtag}. Must start with #`);
            return;
        }
        if (colorHashtag.length === 4) {
            return [16 * ColorUtils.hexNumberToInt(colorHashtag[1]), 16 * ColorUtils.hexNumberToInt(colorHashtag[2]), 16 * ColorUtils.hexNumberToInt(colorHashtag[3])]
        }
        if (colorHashtag.length === 7) {
            return [
                ColorUtils.hexNumberToInt(colorHashtag[1]) * 16 + ColorUtils.hexNumberToInt(colorHashtag[2]),
                ColorUtils.hexNumberToInt(colorHashtag[3]) * 16 + ColorUtils.hexNumberToInt(colorHashtag[4]),
                ColorUtils.hexNumberToInt(colorHashtag[5]) * 16 + ColorUtils.hexNumberToInt(colorHashtag[6]),
            ];
        }
        console.error(`Color hashtag ${colorHashtag} had unexpected length. Needs to be 4 or 7.`);
    }

    static arrayToColorHashtag(array) {
        if (array.length !== 3) {
            console.error(`Can't convert array of length ${array.length} to color hashtag since it's not of length 3. Array was ${array}`);
            return;
        }
        return `#${ColorUtils.numberToHex(array[0])}${ColorUtils.numberToHex(array[1])}${ColorUtils.numberToHex(array[2])}`;
    }

    static numberToHex(number) {
        if (isNaN(number) || number < 0 || number > 255) {
            console.error(`Can't convert number ${number} to hex because it's not between 0 and 255 inclusively`);
            return;
        }
        number = parseInt(number);
        return `${ColorUtils.digitToHex(parseInt(number / 16))}${ColorUtils.digitToHex(number % 16)}`;
    }

    static digitToHex(number) {
        if (isNaN(number) || number < 0 || number > 15) {
            console.error(`Can't convert number ${number} to hex because it's not between 0 and 15 inclusively`);
            return;
        }
        number = parseInt(number);
        if (number < 10) return number.toString();
        switch (number) {
            case 10: return "A";
            case 11: return "B";
            case 12: return "C";
            case 13: return "D";
            case 14: return "E";
            case 15: return "F";
        }
    }

    static hexNumberToInt(hex) {
        switch (hex) {
            case 0: return 0;
            case 1: return 1;
            case 2: return 2;
            case 3: return 3;
            case 4: return 4;
            case 5: return 5;
            case 6: return 6;
            case 7: return 7;
            case 8: return 8;
            case 9: return 9;
            case "0": return 0;
            case "1": return 1;
            case "2": return 2;
            case "3": return 3;
            case "4": return 4;
            case "5": return 5;
            case "6": return 6;
            case "7": return 7;
            case "8": return 8;
            case "9": return 9;
            case "A": return 10;
            case "B": return 11;
            case "C": return 12;
            case "D": return 13;
            case "E": return 14;
            case "F": return 15;
            case "a": return 10;
            case "b": return 11;
            case "c": return 12;
            case "d": return 13;
            case "e": return 14;
            case "f": return 15;
        }
    }

}