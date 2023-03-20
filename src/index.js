// Test import of a JavaScript module
import p5 from 'p5'
import { Tile } from './js/tile';
import { Map } from './js/map';

const sketch = (p5) => {

    const canvas_width = 1000;

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
            movingTo = waypointPath.shift()
            if (movingTo == undefined) {
                animating = false
                waypointPath = [];
                waypoints = []
                return
            }
        } else {
            playerX += dX / 10
            playerY += dY / 10
            let playerCoord = Tile.pxToCoord({ x: playerX, y: playerY })
            playerTile = Map.getTile(playerCoord)
            playerTile.path = null
            playerTile.waypoint = null
        }
    }

    p5.setup = () => {
        Map.generateTiles()
        p5.createCanvas(canvas_width, canvas_width * 9 / 16);
        playerTile = Map.tiles[7]
        playerX = playerTile.px
        playerY = playerTile.py
    }

    p5.draw = () => {
        p5.background('grey')
        Map.draw(p5)
        movePlayer()
        drawPlayer()
    }

    // click tiles to set them as waypoints
    p5.mouseClicked = () => {
        if (animating)
            return
        const clickedTile = Map.tiles.find((t) => t.selected)
        if (clickedTile) {
            if (clickedTile.waypoint) {
                waypoints = waypoints.splice(waypoints.indexOf(clickedTile), 1)
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

new p5(sketch)