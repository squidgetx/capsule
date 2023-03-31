//resource functions
import { inspect } from "./inspect";
import { renderEnd } from "./end";
import { applyEventEffect, renderEvent } from "./events";

export const RESOURCE = {
    HEALTH: 'health',
    MORALE: 'morale',
    ENERGY: 'energy',
    BEACON: 'beacons',
    OXYGEN: 'oxygen'
}

const MOVE_SPEED = 0.01

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
    }

    loop() {
        const move = this.player.move(MOVE_SPEED)

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
                console.log('be', blockingEvents)
                this.renderEvent(blockingEvents[0])
            }
        }

        if (move == 'START') {
            // check for warnings
            const warnings = this.player.movingTo.getWarnings()
            if (warnings.length > 0) {
                this.terminal.appendMessage(warnings[0])
            }
        }

        if (move == "END") {
            this.endNavigationAction()
        }
    }

    useBeacon() {
        if (this.beacons > 0) {
            this.terminal.appendMessage("You light a rescue beacon...Nothing happens.")
            this.changeResource(RESOURCE.BEACON, -1)
        } else {
            this.terminal.appendMessage("You are out of rescue beacons. How are you going to get rescued now?")
        }
    }

    inspect() {
        this.terminal.appendMessage(inspect(this.player, this.map))
    }

    renderEvent(evt) {
        if (evt.asModal) {
            renderEvent(evt, this)
            this.player.stopMoving()
            this.nav.clear()
        } else {
            this.terminal.appendMessage(evt.text)
            applyEventEffect(evt, this)
        }
    }

    crossTileActions() {
        // Code used to handle arriving at a new tile
        const currentTile = this.player.currentTile
        this.map.exploreTiles(currentTile)
        this.terminal.update(currentTile)
        this.terminal.setSignals(this.map.getSignals(currentTile))

        if (currentTile.star != null) {
            this.terminal.appendMessage("Nearby star system detected. Energy systems recovered.")
            this.changeResourceLog(RESOURCE.ENERGY, currentTile.star)
        }
    }

    endNavigationAction() {
        const currentTile = this.player.currentTile
        this.terminal.appendMessage("Arrived at " + currentTile.getName())
        const arrivalEvents = this.player.currentTile.getEvents()
        if (arrivalEvents.length > 0) {
            console.log('ae', arrivalEvents)
            this.renderEvent(arrivalEvents[0])
        }
        this.nav.clear()
    }

    changeResourceLog(resource, delta) {
        this.changeResource(resource, delta)
        const verb = delta > 0 ? "Gained" : "Lost"
        this.terminal.appendMessage(`${verb} ${delta} ${resource}`)
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
