import { clamp, setupTextAnimation } from './util';

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
export const getNav = (
    game,
    canvasWidth,
    canvasHeight,
    zoomLevel,
    followPlayer,
    allowInteract,
) => {
    const camera = { x: 0, y: 0, zoom: zoomLevel }

    const Player = game.player
    const Map = game.map

    const centerCamera = () => {
        camera.x = (Player.px * camera.zoom - canvasWidth / 2) / camera.zoom
        camera.y = (Player.py * camera.zoom - canvasHeight / 2) / camera.zoom
    }
    centerCamera()

    let highlightedTile = null;
    let selectedTile = null;
    let waypoints = []
    let waypointPath = []
    let hypoNavPath = []

    // All code to do with changing positions should go here

    const stop = () => {
        waypointPath = [];
        waypoints = []
        hypoNavPath = []
        for (const t of Map.tiles) {
            t.path = null
            t.waypoint = null
        }
        highlightedTile = null
        selectedTile = null
        Player.stopMoving()
        renderNavMenu([], null)
        game.queueTerminalMessages("Navigation cancelled.")

    }

    const go = () => {
        Map.tiles.forEach(t => t.waypoint = false)
        waypoints.forEach(w => w.waypoint = true)
        Player.setMovingQueue([...waypointPath])
        // for animation
        game.queueTerminalMessages("Navigating to " + waypoints.slice(-1)[0].getName() + "...")
    }

    const get_destination = () => {
        return waypoints.length ? waypoints.slice(-1)[0] : null
    }

    const renderNavMenu = (path, selected) => {
        const navInfo = document.getElementById('nav-action-detail')
        document.getElementById('nav-destination').innerHTML = ''
        document.getElementById('nav-terminal').innerHTML = ''
        if (selected) {
            const destination = selected
            const name = destination.explored ? destination.name : "Unknown Sector"
            document.getElementById('nav-destination').innerHTML = `${name}`
            document.getElementById('nav-inspect').classList.add('show')
        } else {
            document.getElementById('nav-inspect').classList.remove('show')
        }

        document.getElementById('nav-cancel').classList.remove('show')
        if (path.length > 0) {
            if (Player.movingTo == null) {
                const energyCost = path.length;
                navInfo.innerHTML = `<p>Energy cost: ${energyCost}</p>`
                document.getElementById('nav-go').classList.add('show')
            } else {
                navInfo.innerHTML = '<p class="placeholder">Navigation in progress...</p>'
                document.getElementById('nav-go').classList.remove('show')
                document.getElementById('nav-cancel').classList.add('show')
            }
        } else {
            document.getElementById('nav-go').classList.remove('show')
            navInfo.innerHTML = '<p class="placeholder">No destination selected</p>'
        }

        document.getElementById('nav-energy').innerHTML = `Current energy: ${game.energy}`
    }

    const sketch = (p5) => {

        p5.setup = () => {
            p5.createCanvas(canvasWidth, canvasHeight);
            //Map.draw(p5, camera)
        }

        const mouseActive = p5 =>
            allowInteract && (p5.mouseX > 0 && p5.mouseY > 0 && p5.mouseX < canvasWidth && p5.mouseY < canvasHeight)

        p5.draw = () => {
            p5.background('#011F1D')

            if (followPlayer) {
                centerCamera()
            }

            Map.draw(p5, camera)
            if (selectedTile) {
                selectedTile.draw(p5, camera, 'rgba(0,255,100,0.5)')
            }


            if (mouseActive(p5)) {
                highlightedTile = Map.getMousedTile(p5.mouseX, p5.mouseY, camera)
                if (highlightedTile) {
                    highlightedTile.draw(p5, camera, 'rgba(255,255,255,0.5)')
                }
                /*
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
      */
            }

            Player.draw(p5, camera)

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
            if (dragging < DRAG_FRAME_DELAY) {
                dragging = 0
                if (highlightedTile) {

                    if (selectedTile == highlightedTile) {
                        selectedTile = null
                    } else {
                        selectedTile = highlightedTile
                    }

                    if (Player.movingTo == null) {
                        if (selectedTile == null) {
                            waypoints = []
                        } else {
                            waypoints = [selectedTile]
                        }
                        waypointPath = Map.markWaypointPath(p5, Player.currentTile, waypoints)
                    }
                    renderNavMenu(waypointPath, selectedTile)
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
        stop,
        getDestination: get_destination,
        renderNavMenu: () => renderNavMenu(waypointPath, selectedTile),
        disableInteraction: () => { allowInteract = false },
        enableInteraction: () => { allowInteract = true },
    }
}

// Functions to handle the HTML rendering of the main nav component //

let mainNavHidden = true

const dismissNav = (nav) => {
    nav.disableInteraction()
    document.getElementById('navWrapper').classList.remove('show')
    mainNavHidden = true
    // hacky for now redesign later
    document.getElementById('terminalWrapper').classList.remove('navmode')
}

const showNav = (nav) => {
    nav.enableInteraction()
    document.getElementById('navWrapper').classList.add('show')
    mainNavHidden = false
    document.getElementById('terminalWrapper').classList.add('navmode')
    nav.renderNavMenu()
}

export const setupNavControls = (nav) => {
    // nav menu buttons
    document.getElementById('nav-go').addEventListener('click', () => {
        nav.go()
        dismissNav(nav)
        // todo move this code somewhere it's actually supposed to go
    })
    document.getElementById('nav-cancel').addEventListener('click', () => {
        nav.stop()
    })

    document.getElementById('mini-nav').addEventListener('click', () => {
        if (mainNavHidden) {
            showNav(nav)
        } else {
            dismissNav(nav)
        }
    })

    document.getElementById('nav-close').addEventListener('click', () => {
        dismissNav(nav)
    })
    document.getElementById('nav-inspect').addEventListener('click', (evt) => {
        const navTerminal = document.getElementById('nav-terminal')
        setupTextAnimation(navTerminal, nav.getDestination().getNavDetail(), {})
        evt.stopImmediatePropagation()
    })
}

