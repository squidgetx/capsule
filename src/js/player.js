import { renderEnd } from './end';

const MAX_ENERGY = 20

class Player {
    constructor() {
        this.energy = MAX_ENERGY;
        this.oxygen = 100;
        this.health = 5;
        this.morale = 5;
        this.beacons = 5;
        this.currentTile = null
    }


    //resource functions
    changeEnergy(a) {
        this.energy += a;
        if (this.energy <= 0) {
            renderEnd('energy')
        }
        if (this.energy > MAX_ENERGY) {
            this.energy = MAX_ENERGY
        }
        this.renderResources()
    }

    changeHealth(a) {
        this.health += a
        if (this.health <= 0) {
            renderEnd('health')
        }
        this.renderResources()
    }

    changeMorale(a) {
        this.morale += a
        if (this.morale <= 0) {
            renderEnd('morale')
        }
        this.renderResources()
    }

    changeOxygen(a) {
        //want to be able to add oxygen
        //want to be able to pause oxygen
        // right now it's called every 2 seconds in setup which might not be ideal
        if (this.oxygen > 0) {
            this.oxygen--;
        } else {
            renderEnd('oxygen');
        }
        this.renderResources()
    }

    useBeacon() {
        this.beacons--
        if (this.beacons < 0) {
            this.beacons = 0
        }
        this.renderResources()
    }

    draw(p5, camera) {
        p5.strokeWeight(0)
        p5.fill('red')
        let cx = (this.px - camera.x) * camera.zoom
        let cy = (this.py - camera.y) * camera.zoom

        let s = 10 * camera.zoom
        p5.circle(cx, cy, s)
    }

    renderResources() {
        let resourceDiv = document.getElementById("resources");
        resourceDiv.querySelector(".energy").innerHTML = 'energy: ' + this.energy;
        resourceDiv.querySelector(".oxygen").innerHTML = 'oxygen: ' + this.oxygen + '%';
        resourceDiv.querySelector(".health").innerHTML = 'health: ' + this.health;
        resourceDiv.querySelector(".morale").innerHTML = 'morale: ' + this.morale;
        resourceDiv.querySelector(".beacon").innerHTML = `Beacons (x${this.beacons})`
    }

    mainLoop() {

    }

}

const singlePlayer = new Player()

export const getPlayer = () => singlePlayer