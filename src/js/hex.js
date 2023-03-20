// hex coordinates helper functions
// mostly stolen from https://www.redblobgames.com/grids/hexagons
export const axialToCoord = (ax) => {
    const x = ax.q + (ax.r - (ax.r & 1)) / 2
    const y = ax.r
    return { x, y }
}

export const coordToAxial = (coord) => {
    const q = coord.x - (coord.y - (coord.y & 1)) / 2
    const r = coord.y
    return { q, r }
}

export const axialDist = (a, b) => {
    return (Math.abs(a.q - b.q)
        + Math.abs(a.q + a.r - b.q - b.r)
        + Math.abs(a.r - b.r)) / 2
}

export const cube_round = (pt) => {
    let q = Math.round(pt.q)
    let r = Math.round(pt.r)
    let s = Math.round(pt.s)

    const q_diff = Math.abs(q - pt.q)
    const r_diff = Math.abs(r - pt.r)
    const s_diff = Math.abs(s - pt.s)

    if (q_diff > r_diff && q_diff > s_diff) {
        q = -r - s
    } else if (r_diff > s_diff) {
        r = -q - s
    } else {
        s = -q - r

    }
    return { q, r, s }
}