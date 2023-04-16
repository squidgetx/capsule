import { Tile } from "./tile"
import { cube_round, axialDist, axialToCoord } from "./hex"
import { events } from './events';
import { clamp } from "./util"
import { SPACE_STUFF } from "./spaceStuff";

export const getMap = () => {
    // READ ONLY PROPERTIES 
    const width = 9
    const height = 6
    const tiles = []

    const getTile = (coord) => {
        if (coord.y < 0 || coord.y >= height) {
            return null
        }
        if (coord.x < 0 || coord.x >= width) {
            return null
        }
        return tiles[coord.y * width + coord.x]
    }

    const generateTiles = () => {
        for (let j = 0; j < height; j++) {
            for (let i = 0; i < width; i++) {
                tiles.push(new Tile(i, j))
            }
        }

        // toy map for now
        tiles[21].spaceStuff = [SPACE_STUFF.asteroids]
        tiles[20].spaceStuff = [SPACE_STUFF.star]
        tiles[32].spaceStuff = [SPACE_STUFF.emptyPod]
        tiles[33].spaceStuff = [SPACE_STUFF.rescue1]
        tiles[33].explored = true
        tiles[8].spaceStuff = [SPACE_STUFF.wreckage]
        tiles[8].explored = true

    }

    const draw = (p5, camera) => {
        for (const tile of tiles) {
            tile.draw(p5, camera, null)
        }

    }

    const getMousedTile = (mouseX, mouseY, camera) => {
        let wx = mouseX / camera.zoom + camera.x
        let wy = mouseY / camera.zoom + camera.y
        return getTile(Tile.pxToCoord({ x: wx, y: wy }))
    }

    const getTilePath = (start, end) => {
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
            const currentTile = getTile(tileCoord)
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

    const getWaypointPath = (start, waypoints) => {
        let node = start
        const path = []
        for (const dest of waypoints) {
            path.push(...getTilePath(node, dest))
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

    const markWaypointPath = (p5, start, waypoints) => {
        const path = getWaypointPath(start, waypoints)
        for (const t of tiles) {
            t.path = null
        }
        for (const i in path) {
            path[i].path = i
        }
        if (path[0] == start)
            return path.slice(1)
        return path
    }

    const getAdjacentTiles = (tile) => {
        const adjacentAxial = [
            { q: tile.q + 1, r: tile.r },
            { q: tile.q - 1, r: tile.r },
            { q: tile.q + 1, r: tile.r - 1 },
            { q: tile.q - 1, r: tile.r + 1 },
            { q: tile.q, r: tile.r + 1 },
            { q: tile.q, r: tile.r - 1 },
        ]
        return adjacentAxial.map(a => getTile(axialToCoord(a))).filter(a => a != null)
    }

    const exploreTiles = (tile) => {
        // Return array of adjacent tiles to the given tile
        const adjacentTiles = getAdjacentTiles(tile)

        tiles.forEach(t => t.visible = false)
        tile.explored = true
        tile.visible = true
        adjacentTiles.forEach(t => t.explored = true)
        adjacentTiles.forEach(t => t.visible = true)
    }

    // Return array of signals
    const getSignals = (playerTile) => {
        return tiles.map(t => t.getVisibleSignals(playerTile)).flat()
    }

    return {
        width, height, tiles, getTile, getMousedTile,
        draw, generateTiles,
        getTilePath, getWaypointPath, markWaypointPath,
        getSignals, exploreTiles, getAdjacentTiles
    }
}