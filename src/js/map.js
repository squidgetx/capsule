import { Tile } from "./tile"

export const Map = {
    width: 6,
    height: 6,
    tiles: [],
}

Map.getTile = (x, y) => {
    return Map.tiles[y * Map.width + x]
}

Map.generateTiles = () => {
    for (let j = 0; j < Map.height; j++) {
        for (let i = 0; i < Map.width; i++) {
            Map.tiles.push(new Tile(i, j))
        }
    }
}

Map.draw = (p5) => {
    for (const tile of Map.tiles) {
        tile.checkMouse(p5)
        tile.draw(p5)
    }
}

// Path finding //

Map.getTilePath = (p5, start, end) => {
    const steps = Tile.axialDist(start, end) + 1
    console.log(start, end, steps - 1)
    const dX = end.px - start.px
    const dY = end.py - start.py
    const dXstep = dX / steps
    const dYstep = dY / steps

    let x = start.px
    let y = start.py
    const path = [start]

    for (let i = 0; i < steps; i++) {
        const tileCoord = Tile.pxToCoord({ x: x + 1, y: y + 1 })
        const index = tileCoord.y * Map.width + tileCoord.x
        const currentTile = Map.tiles[index]
        const lastTileInPath = path.slice(-1)[0]
        if (currentTile != lastTileInPath) {
            path.push(currentTile)
        }
        x += dXstep
        y += dYstep
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
