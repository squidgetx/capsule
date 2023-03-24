import { Tile } from './tile';
import { renderEvent } from './events';
import '@/styles/index.scss';
import { clamp } from './util';
import { renderSignals } from './signals';

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
        Player.movingTo = null;
        clear()
        Map.exploreAdjacentTiles(Player.currentTile)
        const signals = Map.getSignals(Player.currentTile)
        renderSignals(signals)
        Terminal.update(Player.currentTile)
        Terminal.appendMessage("Arrived at " + Player.currentTile.getName())
        return
    }

    const movePlayer = () => {
        if (Player.movingTo == null) {
            return
        }
        const dX = Player.movingTo.px - Player.px
        const dY = Player.movingTo.py - Player.py
        if (Math.sqrt(dX * dX + dY * dY) < 1) {
            // we arrived at the next tile, now start moving to the next one
            Player.changeEnergy(-1)
            Player.movingTo = waypointPath.shift()
            // stop moving if there are no more places to go next
            if (Player.movingTo == undefined) {
                stopMoving()
            }
            let playerCoord = Tile.pxToCoord({ x: Player.px, y: Player.py })
            Player.currentTile = Map.getTile(playerCoord)
            if (Player.currentTile.event) {
                //display event stuff
                document.getElementById("event").classList.add('show');
                renderEvent(Player.currentTile.event, Player)
                stopMoving()
            } else {
                document.getElementById("event").classList.remove('show')
            }
        } else {
            Player.px += dX / 32
            Player.py += dY / 32

            let playerCoord = Tile.pxToCoord({ x: Player.px, y: Player.py })
            Player.currentTile = Map.getTile(playerCoord)
            Player.currentTile.path = null
            Player.currentTile.waypoint = null
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
                    console.log(indexClicked, waypoints)
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
    const go =
        () => {
            Player.movingTo = waypointPath.shift();
            Terminal.appendMessage("Navigating to " + waypoints.slice(-1)[0].getName() + "...")
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