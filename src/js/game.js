//resource functions
import { inspect } from "./inspect";
import { renderEnd } from "./end";
import { applyEventEffect, renderEvent } from "./events";
import { SPACE_STUFF } from "./spaceStuff";

export const RESOURCE = {
    HEALTH: 'health',
    MORALE: 'morale',
    ENERGY: 'energy',
    BEACON: 'beacons',
    OXYGEN: 'oxygen'
}

const MOVE_SPEED = 0.001

export class Game {
    constructor(player, map, terminal, nav) {
        this.player = player;
        this.map = map
        this.terminal = terminal
        this.nav = nav

        this.health = 5
        this.morale = 5
        this.oxygen = 100
        this.beacons = 5
        this.energy = 20

        this.actionQueue = []
        this.busy = false

        this.firstMoveEvent = false
    }

    loop() {
        const move = this.player.move(MOVE_SPEED)

        // todo this code should maybe live somewhere else 
        if (this.player.movingTo && this.firstMoveEvent == false) {
            this.firstMoveEvent = true
            this.queueEvent(SPACE_STUFF.firstMovement)
        }

        if (move == 'CROSS') {
            // we arrived at the next tile in the path
            this.changeResource(RESOURCE.ENERGY, -1)
            this.crossTileActions()
        }

        if (move == 'ARRIVE') {
            // check for events
            const blockingEvents = this.player.currentTile.getEvents().filter(e => e.blocking == true)
            if (blockingEvents.length > 0) {
                // TODO handle multiple events in one tile?
                // TODO maybe nav is just paused while navigation is happening?
                this.player.stopMoving()
                this.nav.clear()
                this.actionQueue.unshift(() =>
                    renderEvent(blockingEvents[0], this))
            }
        }

        if (move == 'START') {
            // check for warnings
            const warnings = this.player.movingTo.getWarnings()
            if (warnings.length > 0) {
                this.queueTerminalMessages(warnings[0])
            }
        }

        if (move == "END") {
            this.endNavigationAction()
        }
    }

    useBeacon() {
        if (this.beacons > 0) {
            this.queueTerminalMessages("You light a rescue beacon...Nothing happens.")
            this.changeResource(RESOURCE.BEACON, -1)
        } else {
            this.queueTerminalMessages("You are out of rescue beacons. How are you going to get rescued now?")
        }
    }

    inspect() {
        this.queueTerminalMessages(inspect(this.player, this.map))
    }

    closeEvent() {
        document.getElementById("event").classList.remove('show')
        this.endAction()
    }

    // Call this function to execute the next function
    // in the game's event queue. Only does anything if 
    // the game is not busy rendering another action
    next() {
        if (this.busy == true) {
            console.log('bsy')
            return
        }
        const nextAction = this.actionQueue.shift()
        if (nextAction) {
            this.busy = true
            nextAction()
        }
    }

    // Call this to mark an action as completed and to 
    // automatically pull the next action off the queue
    // Should only really be called in the helper functions below
    // or in rare cases when designing custom game scripts
    endAction() {
        this.busy = false
        this.next()
    }

    // Queue an action to be executed and automatically execute it
    // if the queue is empty
    queue(cb) {
        this.actionQueue.push(cb)
        this.next()
    }

    // Queue a message to be displayed to the terminal. Note
    // how this fires the endAction callback when the message 
    // is done displaying
    queueTerminalMessages(...msgs) {
        for (const msg of msgs) {
            this.queue(() => this.terminal.playMessage(msg, () => this.endAction()))
        }
    }

    queueEvent(evt) {
        if (evt.inTerminal) {
            this.queueTerminalMessages(evt.text)
            this.queue(() => {
                applyEventEffect(evt, this)
                this.endAction()
            })
        } else {
            this.queue(() => renderEvent(evt, this))
        }
    }

    crossTileActions() {
        // Code used to handle arriving at a new tile
        const currentTile = this.player.currentTile
        this.map.exploreTiles(currentTile)
        this.terminal.update(currentTile)
        this.terminal.setSignals(this.map.getSignals(currentTile))

        if (currentTile.star != null) {
            this.queueTerminalMessages("Nearby star system detected. Energy systems recovered.")
            this.changeResourceLog(RESOURCE.ENERGY, currentTile.star)
        }
    }

    endNavigationAction() {
        const currentTile = this.player.currentTile
        this.queueTerminalMessages("Arrived at " + currentTile.getName())
        const arrivalEvents = this.player.currentTile.getEvents()
        if (arrivalEvents.length > 0) {
            console.log('ae', arrivalEvents)
            this.queueEvent(arrivalEvents[0])
        }
        this.nav.clear()
    }

    changeResourceLog(resource, delta) {
        this.changeResource(resource, delta)
        const verb = delta > 0 ? "Gained" : "Lost"
        this.queueTerminalMessages(`${verb} ${delta} ${resource}`)
    }

    changeResource(resource, delta) {
        this[resource] += delta
        if (this[resource] <= 0) {
            renderEnd(resource)
        }
        this.renderResources()
    }

    renderResources() {
        let resourceDiv = document.getElementById("resources");
        resourceDiv.querySelector(".energy").innerHTML = 'energy: ' + this.energy;
        resourceDiv.querySelector(".oxygen").innerHTML = 'oxygen: ' + this.oxygen + '%';
        resourceDiv.querySelector(".health").innerHTML = 'health: ' + this.health;
        resourceDiv.querySelector(".morale").innerHTML = 'morale: ' + this.morale;
        resourceDiv.querySelector(".beacon").innerHTML = `Beacons (x${this.beacons})`
    }
}
