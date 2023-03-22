export function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
};

export function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}
export function setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
}