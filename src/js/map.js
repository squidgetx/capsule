import { Tile } from "./tile"
import { cube_round, axialDist, axialToCoord } from "./hex"
import { events } from './events';
import { clamp } from "./util"

export const Map = {
    width: 8,
    height: 6,
    tiles: [],
}

Map.getTile = (coord) => {
    if (coord.y < 0 || coord.y >= Map.height) {
        return null
    }
    if (coord.x < 0 || coord.x >= Map.width) {
        return null
    }
    return Map.tiles[coord.y * Map.width + coord.x]
}

// Always returns a tile - if the coordinates are out of bounds attempts
// to re-place the tile in bounds
Map.getTileBounded = (ax) => {
    const q = clamp(ax.q, 0, Map.height)
    const r = clamp(ax.r, 0, Map.width)
    return Map.tiles[y * Map.width + x]
}

Map.generateTiles = () => {
    for (let j = 0; j < Map.height; j++) {
        for (let i = 0; i < Map.width; i++) {
            Map.tiles.push(new Tile(i, j))
        }
    }

    //select a handfull of random tiles, give them events
    Map.tiles[0].event = events.asteroids;
    Map.tiles[5].event = events.signal;
    Map.tiles[15].event = events.pirates;
    Map.tiles[21].signal = {
        strength: 3,
        text: "Every element of the program was in trouble and so were we. The simulators were not working, Mission Control was behind in virtually every area, and the flight and test procedures changed daily. Nothing we did had any shelf life. Not one of us stood up and said, ‘Dammit, stop!’ I don’t know what Thompson’s committee will find as the cause, but I know what I find. We are the cause! We were not ready! We did not do our job. We were rolling the dice, hoping that things would come together by launch day, when in our hearts we knew it would take a miracle. We were pushing the schedule and betting that the Cape would slip before we did."
    }
}

Map.draw = (p5) => {
    for (const tile of Map.tiles) {
        tile.checkMouse(p5)
        tile.draw(p5)
    }

}

Map.getTilePath = (p5, start, end) => {
    const steps = axialDist(start, end) + 1
    const dQ = end.q - start.q
    const dR = end.r - start.r
    const dS = end.s - start.s
    const dQStep = dQ / steps
    const dRStep = dR / steps
    const dSStep = dS / steps


    const pt = { q: start.q + 0.01, r: start.r + 0.01, s: start.s - 0.02 }
    const path = [start]


    for (let i = 0; i < steps; i++) {
        const tileCoord = axialToCoord(cube_round(pt))
        const currentTile = Map.getTile(tileCoord)
        const lastTileInPath = path.slice(-1)[0]
        if (currentTile && currentTile != lastTileInPath) {
            path.push(currentTile)
        }
        pt.q += dQStep
        pt.r += dRStep
        pt.s += dSStep
    }

    return path
}

Map.getWaypointPath = (p5, start, waypoints) => {
    let node = start
    const path = []
    for (const dest of waypoints) {
        path.push(...Map.getTilePath(p5, node, dest))
        node = dest
    }
    // remove elements that got duplicated
    if (path.length > 0) {
        path.push(waypoints.slice(-1)[0])
        const dedup_path = [start]
        for (const node of path) {
            if (node != dedup_path.slice(-1)[0]) {
                dedup_path.push(node)
            }
        }
        return dedup_path
    }
    return path
}

Map.markWaypointPath = (p5, start, waypoints) => {
    const path = Map.getWaypointPath(p5, start, waypoints)
    for (const t of Map.tiles) {
        t.path = null
    }
    for (const i in path) {
        path[i].path = i
    }
    if (path[0] == start)
        return path.slice(1)
    return path
}

Map.exploreAdjacentTiles = (tile) => {
    // Return array of adjacent tiles to the given tile
    Map.tiles.forEach(t => t.visible = false)
    const adjacentAxial = [
        { q: tile.q + 1, r: tile.r },
        { q: tile.q - 1, r: tile.r },
        { q: tile.q + 1, r: tile.r - 1 },
        { q: tile.q - 1, r: tile.r + 1 },
        { q: tile.q, r: tile.r + 1 },
        { q: tile.q, r: tile.r - 1 },
    ]
    const adjacentTiles = adjacentAxial.map(a => Map.getTile(axialToCoord(a))).filter(a => a != null)
    tile.explored = true
    tile.visible = true
    adjacentTiles.forEach(t => t.explored = true)
    adjacentTiles.forEach(t => t.visible = true)
}

// Return array of signals
Map.getSignals = (playerTile) => {
    const signalTiles = Map.tiles.filter(t => t.signal != undefined)
    // visible signals are within distance 'signal.strength' from the player
    const visibleSignalTiles = signalTiles.filter(t => axialDist(t, playerTile) < t.signal.strength)
    return visibleSignalTiles.map(t => {
        t.signal.distance = axialDist(t, playerTile);
        return t.signal
    }
    )
}