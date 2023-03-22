// Test import of a JavaScript module
import p5 from 'p5'
import { Tile } from './js/tile';
import { Map } from './js/map';
import { events } from './js/events';
import { animateSignal, renderSignals } from './js/signals';
import '@/styles/index.scss';
import { axialDist } from './js/hex';

const sketch = (p5) => {

    const canvas_width = 600;

    // player locations
    let playerX, playerY;
    let playerTile;

    // control variables for animating movement
    let waypoints = []
    let waypointPath = [];
    let hypoNavPath = [];
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

        const signals = Map.getSignals(playerTile)
        renderSignals(signals)

        return
    }

    const renderNavMenu = () => {
        const navInfo = document.getElementById('nav-info')
        const destination = Map.tiles.find(t => t.selected) || hypoNavPath.slice(-1)[0]
        const energyCost = hypoNavPath.length
        if (destination) {
            navInfo.innerHTML = `<p>${destination.name}</p>`
            if (energyCost) {
                navInfo.innerHTML += `<p>Energy cost: ${energyCost}</p>`
            }
            if (waypoints.length > 0) {
                document.getElementById('nav-actions').classList.add('show')
            } else {
                document.getElementById('nav-actions').classList.remove('show')
            }
        }
    }

    // player resources
    let energy = 20;
    let oxygen = 100;
    let health = 5;
    let morale = 5;

    //resource functions
    const changeEnergy = (a) => {
        energy = energy + a;
    }

    const changeOxygen = (a) => {
        //want to be able to add oxygen
        //want to be able to pause oxygen
        // right now it's called every 2 seconds in setup which might not be ideal
        if (oxygen > 0) {
            oxygen--;
        }
    }

    const renderResources = () => {
        let resourceDiv = document.getElementById("resources");
        resourceDiv.querySelector(".energy").innerHTML = 'energy: ' + energy;
        resourceDiv.querySelector(".oxygen").innerHTML = 'oxygen: ' + oxygen + '%';
        resourceDiv.querySelector(".health").innerHTML = 'health: ' + health;
        resourceDiv.querySelector(".morale").innerHTML = 'morale: ' + morale;
    }

    const renderEvent = () => {
        let e = playerTile.event
        let effects = '';
        document.getElementById("e-title").innerHTML = e.title;
        document.getElementById("e-text").innerHTML = e.text;
        if (e.energy) {
            changeEnergy(e.energy)
            effects += `Energy: ${e.energy} `
        }
        if (e.health) {
            health = health + e.health
            effects += `Health: ${e.health} `
        }
        if (e.morale) {
            morale = morale + e.morale
            effects += `Morale: ${e.morale} `
        }
        if (e.consumable) {
            playerTile.event = null
        }
        renderResources()
        document.getElementById("e-effect").innerHTML = effects;
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
            changeEnergy(-1)
            renderResources();
            movingTo = waypointPath.shift()
            // stop moving if there are no more places to go next
            if (movingTo == undefined) {
                stopMoving()
            }
            let playerCoord = Tile.pxToCoord({ x: playerX, y: playerY })
            playerTile = Map.getTile(playerCoord)
            if (playerTile.event) {
                //display event stuff
                document.getElementById("event").classList.add('show');
                renderEvent();
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


        // nav menu buttons
        document.getElementById('nav-go').addEventListener('click', () => {
            movingTo = waypointPath.shift()
        })
        document.getElementById('nav-cancel').addEventListener('click', () => {
            stopMoving()
        })

        //oxygen timer
        setInterval(changeOxygen, 2000)
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
            hypoNavPath = Map.markWaypointPath(p5, playerTile, waypoint_copy)
        }
        renderResources()
        renderNavMenu()
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

setInterval(animateSignal, 80)