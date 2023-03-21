// Test import of a JavaScript module
import p5 from 'p5'
import { Tile } from './js/tile';
import { Map } from './js/map';
import { events } from './js/events';
import { renderSignals } from './js/signals';
import '@/styles/index.scss';

const sketch = (p5) => {

    const canvas_width = 600;

    // player locations
    let playerX, playerY;
    let playerTile;

    // control variables for animating movement
    let waypoints = []
    let waypointPath = [];
    let animating = false
    let movingTo = null

    // player methods
    const drawPlayer = () => {
        p5.strokeWeight(0)
        p5.fill('red')
        p5.circle(playerX, playerY, 10)
    }

    const stopMoving = () => {
        animating = false
        movingTo = null
        waypointPath = [];
        waypoints = []
        for (const t of Map.tiles) {
            t.path = null
            t.waypoint = null
        }
        return
    }

    // move the player to the movingTo destination
    // if we are there already, get the next tile from the queue (waypointPath)
    // if the queue is empty, we have arrived at the final destination
    const movePlayer = () => {
        if (movingTo == null) {
            animating = false
            return
        }
        animating = true
        const dX = movingTo.px - playerX
        const dY = movingTo.py - playerY
        if (Math.sqrt(dX * dX + dY * dY) < 1) {
            // we arrived at the next tile, now start moving to the next one
            movingTo = waypointPath.shift()
            // stop moving if there are no more places to go next
            if (movingTo == undefined) {
                stopMoving()
            }
            const signals = Map.getSignals(playerTile)
            renderSignals(signals)
            let playerCoord = Tile.pxToCoord({ x: playerX, y: playerY })
            playerTile = Map.getTile(playerCoord)
            if (playerTile.event) {
                //display event stuff
                document.getElementById("event").classList.add('show');
                document.getElementById("e-title").innerHTML = playerTile.event.title;
                document.getElementById("e-text").innerHTML = playerTile.event.text;
                document.getElementById("e-result").innerHTML = playerTile.event.effect;
                stopMoving()
            } else {
                document.getElementById("event").classList.remove('show')
            }
        } else {
            playerX += dX / 8
            playerY += dY / 8
            let playerCoord = Tile.pxToCoord({ x: playerX, y: playerY })
            playerTile = Map.getTile(playerCoord)
            playerTile.path = null
            playerTile.waypoint = null
        }
    }

    p5.setup = () => {
        Map.generateTiles()
        //aspect ratio
        p5.createCanvas(canvas_width, canvas_width * 9 / 16);
        playerTile = Map.tiles[7]
        playerX = playerTile.px
        playerY = playerTile.py
    }

    p5.draw = () => {
        p5.background('white')
        Map.draw(p5)
        movePlayer()
        drawPlayer()
        if (movingTo == null) {
            Map.exploreAdjacentTiles(playerTile)

            // draw hypothetical path
            const hoveredTile = Map.tiles.find((t) => t.selected)
            const waypoint_copy = [...waypoints]
            if (hoveredTile) {
                waypoint_copy.push(hoveredTile)
            }
            Map.markWaypointPath(p5, playerTile, waypoint_copy)
        }
    }

    // click tiles to set them as waypoints
    p5.mouseClicked = () => {
        if (animating)
            return
        const clickedTile = Map.tiles.find((t) => t.selected)
        if (clickedTile) {
            const indexClicked = waypoints.indexOf(clickedTile)
            if (indexClicked != -1) {
                waypoints = waypoints.splice(indexClicked, -1)
                clickedTile.waypoint = false
            } else {
                waypoints.push(clickedTile)
                clickedTile.waypoint = true
            }
            waypointPath = Map.markWaypointPath(p5, playerTile, waypoints)
        }
    }

    // press a key to move
    p5.keyPressed = () => {
        if (animating) {
            return
        }
        movingTo = waypointPath.shift()
    }

}

new p5(sketch, document.getElementById('nav'));