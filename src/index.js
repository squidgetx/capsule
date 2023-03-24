// Test import of a JavaScript module
import p5 from 'p5'
import { Tile, tile_size_px } from './js/tile';
import { Map } from './js/map';
import { renderEvent } from './js/events';
import { renderSignals } from './js/signals';
import '@/styles/index.scss';
import { axialDist } from './js/hex';
import { endings } from './js/end';
import { clamp, setupTextAnimation } from './js/util';
import { Player } from './js/Player';
import { getNav } from './js/nav';

let Nav;

const setup = () => {

    Map.generateTiles()

    Player.currentTile = Map.tiles[7]
    Player.px = Player.currentTile.px
    Player.py = Player.currentTile.py

    Map.exploreAdjacentTiles(Player.currentTile)

    Nav = getNav(Player, Map, 600, 400, 1, false, false)
    const mininav = getNav(Player, Map, 150, 150, 1.5, true, false)

    let navSketch = new p5(Nav.sketch, document.getElementById('nav'));
    new p5(mininav.sketch, document.getElementById('mini-nav'));
    // event buttons
    document.getElementById("event-close").addEventListener("click", () => {
        document.getElementById("event").classList.remove('show')
    })
    // nav menu buttons
    document.getElementById('nav-go').addEventListener('click', () => {
        Nav.go()
    })
    document.getElementById('nav-cancel').addEventListener('click', () => {
        console.log('removing')
        Nav.disableInteraction()
        document.getElementById('navWrapper').classList.remove('show')
        Nav.hidden = true
    })
    document.getElementById('mini-nav').addEventListener('click', () => {
        if (!Nav.hidden) {
            console.log('removing')
            Nav.disableInteraction()
            document.getElementById('navWrapper').classList.remove('show')
            Nav.hidden = true
        } else {
            console.log('restoring')
            document.getElementById('navWrapper').classList.add('show')
            //document.getElementById('navWrapper').hidden = true
            Nav.enableInteraction()
            Nav.hidden = false
        }
    })
}

const loop = () => {
    Nav.mainLoop()
    Player.mainLoop()
    requestAnimationFrame(loop)
}


setup()
loop()