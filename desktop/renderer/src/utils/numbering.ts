/**
 * Converts a number to Roman numeral (I, II, III...)
 */
function toRoman(num: number): string {
    if (num < 1) return '';
    const map: Record<number, string> = {
        1000: 'M', 900: 'CM', 500: 'D', 400: 'CD',
        100: 'C', 90: 'XC', 50: 'L', 40: 'XL',
        10: 'X', 9: 'IX', 5: 'V', 4: 'IV', 1: 'I'
    };
    let result = '';
    for (const key in map) {
        const n = Number(key);
        // iterate backwards
    }
    // Simpler approach for typical legal depth
    const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    return romans[num - 1] || String(num);
}

/**
 * Converts index (0-based) and depth (0-based) to legal label.
 * 
 * Depth 0: I, II, III (Roman)
 * Depth 1: A, B, C (Upper Alpha)
 * Depth 2: 1, 2, 3 (Arabic)
 * Depth 3: a, b, c (Lower Alpha)
 */
export function getSectionLabel(depth: number, index: number): string {
    const n = index + 1;

    switch (depth % 4) {
        case 0: // Roman
            return toRoman(n) + '.';
        case 1: // Alpha Upper
            return String.fromCharCode(64 + n) + '.';
        case 2: // Numeric
            return n + '.';
        case 3: // Alpha Lower
            return String.fromCharCode(96 + n) + '.';
        default:
            return '';
    }
}
