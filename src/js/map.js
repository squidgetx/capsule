import { Tile } from "./tile"
import { cube_round, axialDist, axialToCoord } from "./hex"
import { events } from './events';

export const Map = {
    width: 6,
    height: 6,
    tiles: [],
}

Map.getTile = (coord) => {
    return Map.tiles[coord.y * Map.width + coord.x]
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
}

Map.draw = (p5) => {
    for (const tile of Map.tiles) {
        tile.checkMouse(p5)
        tile.draw(p5)
    }
}


Map.getTilePath = (p5, start, end) => {
    const steps = axialDist(start, end) + 1
    console.log(start, end, steps - 1)
    const dQ = end.q - start.q
    const dR = end.r - start.r
    const dS = end.s - start.s
    const dQStep = dQ / steps
    const dRStep = dR / steps
    const dSStep = dS / steps

    const pt = { q: start.q, r: start.r, s: start.s }
    const path = [start]

    for (let i = 0; i < steps; i++) {
        const tileCoord = axialToCoord(cube_round(pt))
        const currentTile = Map.getTile(tileCoord)
        const lastTileInPath = path.slice(-1)[0]
        if (currentTile != lastTileInPath) {
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
    return path
}
