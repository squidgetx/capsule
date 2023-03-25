import { Tile } from './tile';
import { renderEvent } from './events';
import '@/styles/index.scss';
import { clamp } from './util';
import { renderSignals } from './signals';

const MOVE_SPEED = 0.005

/**
 * 
 * @param {*} Player 
 * @param {*} Map 
 * @param {*} Terminal 
 * @param {*} canvasWidth 
 * @param {*} canvasHeight 
 * @param {*} zoomLevel 
 * @param {*} followPlayer boolean, whether to lock the camera on the player
 * @param {*} allowInteract boolean, whether to allow interaction
 * @returns object with properties 
 */
export const getNav = (Player, Map, Terminal, canvasWidth, canvasHeight, zoomLevel, followPlayer, allowInteract) => {
    const camera = { x: 0, y: 0, zoom: zoomLevel }
    const centerCamera = () => {
        camera.x = (Player.px * camera.zoom - canvasWidth / 2) / camera.zoom
        camera.y = (Player.py * camera.zoom - canvasHeight / 2) / camera.zoom
    }
    centerCamera()

    let highlightedTile = null;
    let waypoints = []
    let waypointPath = []
    let hypoNavPath = []

    // All code to do with changing positions should go here

    const clear = () => {
        waypointPath = [];
        waypoints = []
        hypoNavPath = []
        for (const t of Map.tiles) {
            t.path = null
            t.waypoint = null
        }
        highlightedTile = null
    }

    const stopMoving = () => {
        Player.currentTile = Player.movingTo
        Player.px = Player.currentTile.px
        Player.py = Player.currentTile.py
        Player.movingTo = null;
        clear()

        // Code used to handle arriving at a new tile
        // Feels like this should live somwhere else, but not that obvious where
        Map.exploreAdjacentTiles(Player.currentTile)
        Terminal.update(Player.currentTile)
        Terminal.setSignals(Map.getSignals(Player.currentTile))
        Terminal.appendMessage("Arrived at " + Player.currentTile.getName())

        if (Player.currentTile.star != null) {
            Terminal.appendMessage("Nearby star system detected. Energy systems recovered.")
            Player.changeEnergy(Player.currentTile.star)
        }

        return
    }

    const go = () => {
        Player.movingTo = waypointPath.shift();
        Player.movingProgress = 0
        // for animation
        Player.movingFrom = Player.currentTile
        Terminal.appendMessage("Navigating to " + waypoints.slice(-1)[0].getName() + "...")
    }

    const movePlayer = () => {
        if (Player.movingTo == null) {
            return
        }
        Player.movingProgress += MOVE_SPEED
        const dX = Player.movingTo.px - Player.movingFrom.px
        const dY = Player.movingTo.py - Player.movingFrom.py

        Player.px = dX * Player.movingProgress + Player.movingFrom.px
        Player.py = dY * Player.movingProgress + Player.movingFrom.py

        if (Player.movingProgress > 1) {
            // we arrived at the next tile in the path

            Player.changeEnergy(-1)

            // check for events
            if (Player.movingTo.event) {
                //display event stuff
                renderEvent(Player.movingTo.event, Player)
                // TODO: if we want events that don't interrupt the path completely, make change here
                stopMoving()
                return
            }
            Terminal.setSignals(Map.getSignals(Player.movingTo))

            Player.movingFrom.path = null
            Player.movingFrom.waypoint = null

            // align player coordinates with current position
            Player.movingProgress = 0
            Player.px = Player.movingTo.px
            Player.py = Player.movingTo.py
            Player.movingFrom = Player.movingTo

            // move to the next location in the path
            if (waypointPath.length == 0) {
                stopMoving()
            } else {
                Player.movingTo = waypointPath.shift()
            }
        }
    }

    const renderNavMenu = () => {
        const navInfo = document.getElementById('nav-info')
        const destination = highlightedTile || waypoints.slice(-1)[0]
        const energyCost = waypointPath.length + hypoNavPath.length;
        if (destination) {
            const name = destination.explored ? destination.name : "???"
            navInfo.innerHTML = `<p>${name}</p>`
            if (energyCost) {
                navInfo.innerHTML += `<p>Energy cost: ${energyCost}</p>`
            }
            if (waypoints.length > 0) {
                document.getElementById('nav-go').disabled = false;
            } else {
                document.getElementById('nav-go').disabled = true;
            }
        } else {
            navInfo.innerHTML = ''
            document.getElementById('nav-actions').classList.remove('show')
        }
    }

    const mainLoop = () => {
        movePlayer()
        renderNavMenu()
    }

    const sketch = (p5) => {

        p5.setup = () => {
            p5.createCanvas(canvasWidth, canvasHeight);
        }

        const mouseActive = p5 =>
            allowInteract && (p5.mouseX > 0 && p5.mouseY > 0 && p5.mouseX < canvasWidth && p5.mouseY < canvasHeight)

        p5.draw = () => {
            p5.background('#011F1D')

            if (followPlayer) {
                centerCamera()
            }
            Map.draw(p5, camera)

            if (mouseActive(p5)) {
                highlightedTile = Map.getMousedTile(p5.mouseX, p5.mouseY, camera)
                if (highlightedTile && Player.movingTo == null) {
                    highlightedTile.draw(p5, camera, 'rgba(0,255,255,0.5)')
                    const start = waypoints.length > 0 ? waypoints.slice(-1)[0] : Player.currentTile
                    hypoNavPath = Map.getTilePath(start, highlightedTile)
                    for (const t of hypoNavPath) {
                        t.draw(p5, camera, 'rgba(255,255,255,0.5)')
                    }
                    if (dragging < DRAG_FRAME_DELAY)
                        p5.cursor('pointer')
                } else {
                    hypoNavPath = []
                }
            }

            Player.draw(p5, camera)

            if (allowInteract) {
                renderNavMenu()
            }
        }

        let dragging = 0
        const DRAG_FRAME_DELAY = 3
        let dragStartX, dragStartY

        p5.mousePressed = (evt) => {
            if (mouseActive(p5)) {
                dragStartX = p5.mouseX
                dragStartY = p5.mouseY
            }
        }

        p5.mouseDragged = () => {
            if (mouseActive(p5)) {
                if (dragging > DRAG_FRAME_DELAY) {
                    p5.cursor('grab')
                }
                dragging += 1
                let dx = p5.mouseX - dragStartX
                let dy = p5.mouseY - dragStartY
                camera.x -= dx / camera.zoom
                camera.y -= dy / camera.zoom
                dragStartX = p5.mouseX
                dragStartY = p5.mouseY
            }
        }

        p5.mouseReleased = (evt) => {
            if (!mouseActive(p5)) {
                return
            }
            if (dragging < DRAG_FRAME_DELAY && Player.movingTo == null) {
                dragging = 0
                if (highlightedTile) {
                    const indexClicked = waypoints.indexOf(highlightedTile)
                    if (indexClicked != -1) {
                        waypoints = waypoints.filter(a => a != highlightedTile)
                        highlightedTile.waypoint = false
                    } else {
                        waypoints.push(highlightedTile)
                        highlightedTile.waypoint = true
                    }
                    waypointPath = Map.markWaypointPath(p5, Player.currentTile, waypoints)
                }
            }
            dragging = 0;
        }

        p5.mouseWheel = (evt) => {
            if (mouseActive(p5)) {
                const z1 = camera.zoom
                const z2 = clamp(camera.zoom + evt.delta / 100, 0.25, 4)
                // fx, fy are the map X/Y coordinates of the mouse pointer 
                // eg, if we are at zoom level 2 and the mouse is at 100,100 and camera(10,10)
                // then we are actually pointing at (60,60)
                const fx = (p5.mouseX / z1 + camera.x)
                const fy = (p5.mouseY / z1 + camera.y)

                const x2 = fx - (fx - camera.x) * z1 / z2
                const y2 = fy - (fy - camera.y) * z1 / z2
                camera.x = x2
                camera.y = y2
                camera.zoom = z2
            }
        }
    }

    return {
        sketch,
        go,
        stop: stopMoving,
        clear,
        getDestination: () => highlightedTile,
        mainLoop,
        hidden: true,
        disableInteraction: () => { allowInteract = false },
        enableInteraction: () => { allowInteract = true }
    }
}