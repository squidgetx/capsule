// Test import of a JavaScript module
import p5 from 'p5'
import { Tile, tile_size_px } from './js/tile';
import { Map } from './js/map';
import { events } from './js/events';
import { renderSignals } from './js/signals';
import '@/styles/index.scss';
import { axialDist } from './js/hex';
import { endings } from './js/end';
import { clamp, setupTextAnimation } from './js/util';

const sketch = (p5) => {

    const canvasWidth = 600;
    const canvasHeight = 400;

    let camera = { x: 0, y: 0, zoom: 1 }
    let getCameraView = (coord) => ({
        x: (coord.x - camera.x) * camera.zoom,
        y: (coord.y - camera.y) * camera.zoom,
        s: coord.s * camera.zoom
    })

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
        let c = getCameraView({ x: playerX, y: playerY, s: 10 })
        p5.circle(c.x, c.y, c.s)
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
        document.getElementById('current-sector').innerHTML = `${playerTile.name}`

        const navInfo = document.getElementById('nav-info')
        const destination = Map.tiles.find(t => t.selected) || waypoints.slice(-1)[0]
        const energyCost = hypoNavPath.length
        if (destination) {
            const name = destination.explored ? destination.name : "???"
            navInfo.innerHTML = `<p>${name}</p>`
            if (energyCost) {
                navInfo.innerHTML += `<p>Energy cost: ${energyCost}</p>`
            }
            if (waypoints.length > 0) {
                document.getElementById('nav-actions').classList.add('show')
            } else {
                document.getElementById('nav-actions').classList.remove('show')
            }
        } else {
            navInfo.innerHTML = ''
            document.getElementById('nav-actions').classList.remove('show')
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
        if (energy <= 0) {
            renderEnd('energy')
        }
    }

    const changeOxygen = (a) => {
        //want to be able to add oxygen
        //want to be able to pause oxygen
        // right now it's called every 2 seconds in setup which might not be ideal
        if (oxygen > 0) {
            oxygen--;
        } else {
            renderEnd('oxygen');
        }
    }

    const renderResources = () => {
        let resourceDiv = document.getElementById("resources");
        resourceDiv.querySelector(".energy").innerHTML = 'energy: ' + energy;
        resourceDiv.querySelector(".oxygen").innerHTML = 'oxygen: ' + oxygen + '%';
        resourceDiv.querySelector(".health").innerHTML = 'health: ' + health;
        resourceDiv.querySelector(".morale").innerHTML = 'morale: ' + morale;
    }


    // Render the event and call the callback arg when the event is closed.
    const renderEvent = (e) => {
        document.getElementById("event-title").innerHTML = e.title;
        document.getElementById("event-close").disabled = true;
        document.getElementById("event-effect").innerHTML = '';

        const applyEventEffect = (e) => {
            let effects = ''
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
            return effects
        }
        const renderEventEffect = (e) => {
            let effects = applyEventEffect(e)
            document.getElementById("event-effect").innerHTML = effects;
            document.getElementById("event-close").disabled = false;
        }
        setupTextAnimation(
            document.getElementById('event-text'),
            e.text,
            {
                callback: () => renderEventEffect(e)
            }
        );
    }

    function renderEnd(a) {
        document.getElementById("end").classList.add("show");
        //eventually pick a random ending
        let endtitle = document.getElementById("end-title");
        let endtext = document.getElementById("end-text");
        if (a == "oxygen") {
            endtitle.innerHTML = endings.oxygen.events[0].title;
            endtext.innerHTML = endings.oxygen.events[0].text;
        }
        if (a == "energy") {
            endtitle.innerHTML = endings.energy.events[0].title;
            endtext.innerHTML = endings.energy.events[0].text;
        }
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
                renderEvent(playerTile.event)
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
        p5.createCanvas(canvasWidth, canvasHeight);
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

        // event buttons
        document.getElementById("event-close").addEventListener("click", () => {
            document.getElementById("event").classList.remove('show')
        })


        //oxygen timer
        setInterval(changeOxygen, 2000)
    }

    const handleMapMovement = (p5) => {
        const mX = p5.mouseX
        const mY = p5.mouseY
        const edgeThreshold = 100
        const cameraSpeed = 2
        if (mX < edgeThreshold && camera.x > -edgeThreshold) {
            // scroll map left
            camera.x -= cameraSpeed
        }
        if (mX > canvasWidth - edgeThreshold && camera.x < Map.width * tile_size_px - canvasWidth + edgeThreshold) {
            // scroll right
            camera.x += cameraSpeed
        }
        if (mY < edgeThreshold && camera.y > -edgeThreshold) {
            // scroll up
            camera.y -= cameraSpeed
        }
        if (mY > canvasHeight - edgeThreshold && camera.y < Map.height * tile_size_px - canvasHeight + edgeThreshold) {
            // scroll down
            camera.y += cameraSpeed
        }
    }

    let dragging = false
    let dragStartX, dragStartY

    p5.mousePressed = (evt) => {
        console.log(evt)
        dragStartX = p5.mouseX
        dragStartY = p5.mouseY

    }

    p5.mouseDragged = () => {
        dragging = true
        let dx = p5.mouseX - dragStartX
        let dy = p5.mouseY - dragStartY
        camera.x -= dx / camera.zoom
        camera.y -= dy / camera.zoom
        dragStartX = p5.mouseX
        dragStartY = p5.mouseY
    }

    p5.mouseReleased = (evt) => {
        if (dragging == false) {
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
        dragging = false;
    }


    p5.mouseWheel = (evt) => {
        let z1 = camera.zoom
        let z2 = clamp(camera.zoom + evt.delta / 100, 0.4, 4)
        // fx, fy are the map X/Y coordinates of the mouse pointer 
        // eg, if we are at zoom level 2 and the mouse is at 100,100 and camera(10,10)
        // then we are actually pointing at (60,60)
        const fx = (p5.mouseX / z1 + camera.x)
        const fy = (p5.mouseY / z1 + camera.y)

        let x2 = fx - (fx - camera.x) * z1 / z2
        let y2 = fy - (fy - camera.y) * z1 / z2
        camera.x = x2
        camera.y = y2
        camera.zoom = z2
    }

    p5.draw = () => {
        p5.background('#011F1D')
        Map.draw(p5, camera)
        movePlayer()
        drawPlayer(camera)
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
    p5.mouseClicked = (evt) => {
        if (animating || dragging)
            return

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