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

export const CUBE_DIRS = {
    E: { q: 1, r: 0 },
    NE: { q: 1, r: -1 },
    NW: { q: 0, r: -1 },
    W: { q: -1, r: 0 },
    SW: { q: -1, r: 1 },
    SE: { q: 0, r: 1 }
}

const axial_scale = (ax, factor) => {
    return {
        q: ax.q * factor, r: ax.r * factor
    }
}

const axial_add = (a, b) => {
    return {
        q: a.q + b.q, r: a.r + b.r
    }
}

const axial_move = (a, dir, dist) => {
    return axial_add(a, axial_scale(dir, dist))
}

