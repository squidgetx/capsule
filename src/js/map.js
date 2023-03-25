import { Tile } from "./tile"
import { cube_round, axialDist, axialToCoord } from "./hex"
import { events } from './events';
import { clamp } from "./util"

export const getMap = () => {
    // READ ONLY PROPERTIES 
    const width = 8
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

        //select a handfull of random tiles, give them events
        tiles[0].event = events.asteroids;
        tiles[10].star = 10
        tiles[5].event = events.signal;
        tiles[15].event = events.pirates;
        tiles[21].signal = {
            strength: 3,
            text: "Every element of the program was in trouble and so were we. The simulators were not working, Mission Control was behind in virtually every area, and the flight and test procedures changed daily. Nothing we did had any shelf life. Not one of us stood up and said, ‘Dammit, stop!’ I don’t know what Thompson’s committee will find as the cause, but I know what I find. We are the cause! We were not ready! We did not do our job. We were rolling the dice, hoping that things would come together by launch day, when in our hearts we knew it would take a miracle. We were pushing the schedule and betting that the Cape would slip before we did."
        }
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

    const exploreAdjacentTiles = (tile) => {
        // Return array of adjacent tiles to the given tile
        tiles.forEach(t => t.visible = false)
        const adjacentAxial = [
            { q: tile.q + 1, r: tile.r },
            { q: tile.q - 1, r: tile.r },
            { q: tile.q + 1, r: tile.r - 1 },
            { q: tile.q - 1, r: tile.r + 1 },
            { q: tile.q, r: tile.r + 1 },
            { q: tile.q, r: tile.r - 1 },
        ]
        const adjacentTiles = adjacentAxial.map(a => getTile(axialToCoord(a))).filter(a => a != null)
        tile.explored = true
        tile.visible = true
        adjacentTiles.forEach(t => t.explored = true)
        adjacentTiles.forEach(t => t.visible = true)
    }

    // Return array of signals
    const getSignals = (playerTile) => {
        const signalTiles = tiles.filter(t => t.signal != undefined)
        // visible signals are within distance 'signal.strength' from the player
        const visibleSignalTiles = signalTiles.filter(t => axialDist(t, playerTile) < t.signal.strength)
        return visibleSignalTiles.map(t => {
            t.signal.distance = axialDist(t, playerTile);
            return t.signal
        }
        )
    }

    return {
        width, height, tiles, getTile, getMousedTile,
        draw, generateTiles,
        getTilePath, getWaypointPath, markWaypointPath,
        getSignals, exploreAdjacentTiles
    }
}