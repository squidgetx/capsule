import { renderEnd } from './end';

const renderResources = () => {
    let resourceDiv = document.getElementById("resources");
    resourceDiv.querySelector(".energy").innerHTML = 'energy: ' + Player.energy;
    resourceDiv.querySelector(".oxygen").innerHTML = 'oxygen: ' + Player.oxygen + '%';
    resourceDiv.querySelector(".health").innerHTML = 'health: ' + Player.health;
    resourceDiv.querySelector(".morale").innerHTML = 'morale: ' + Player.morale;
}

export const Player = {
    energy: 20,
    oxygen: 100,
    health: 5,
    morale: 5,
    currentTile: null,
    mainLoop: renderResources
}

//resource functions
Player.changeEnergy = (a) => {
    Player.energy = Player.energy + a;
    if (Player.energy <= 0) {
        renderEnd('energy')
    }
}

Player.changeOxygen = (a) => {
    //want to be able to add oxygen
    //want to be able to pause oxygen
    // right now it's called every 2 seconds in setup which might not be ideal
    if (Player.oxygen > 0) {
        Player.oxygen--;
    } else {
        renderEnd('oxygen');
    }
}

// Player methods
Player.draw = (p5, camera) => {
    p5.strokeWeight(0)
    p5.fill('red')
    let cx = (Player.px - camera.x) * camera.zoom
    let cy = (Player.py - camera.y) * camera.zoom

    let s = 10 * camera.zoom
    p5.circle(cx, cy, s)
}

Player

