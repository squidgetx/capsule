// Test import of a JavaScript module
import p5 from 'p5'
import { Tile, tile_size_px } from './js/tile';
import { getMap } from './js/map';
import { renderEvent } from './js/events';
import { getSignalText, renderSignal } from './js/signals';
import '@/styles/index.scss';
import { axialDist } from './js/hex';
import { endings } from './js/end';
import { clamp, setupTextAnimation } from './js/util';
import { getPlayer } from './js/Player';
import { getNav } from './js/nav';

let Map, Player, Nav, Terminal

const setup = () => {

    Map = getMap()
    Map.generateTiles()
    Player = getPlayer()

    // eventually move this to a module probably
    Terminal = {
        update: (currentTile) => {
            const termHeader = document.getElementById('terminalHeader')
            termHeader.innerHTML = currentTile.name
        },
        appendMessage: (msg) => {
            const termText = document.getElementById('terminalText')
            const newMsg = document.createElement('p')
            termText.prepend(newMsg)
            setupTextAnimation(newMsg, msg, {})
        },
        setSignals: (signals) => {
            // Right now we just fetch the signals again later
            if (signals.length > 0) {
                document.getElementById('termSignal').classList.remove('sub-btn')
            } else {
                document.getElementById('termSignal').classList.add('sub-btn')
            }
        }
    }

    Player.currentTile = Map.tiles[7]
    Player.px = Player.currentTile.px
    Player.py = Player.currentTile.py

    Nav = getNav(Player, Map, Terminal, 600, 350, 1, false, false)
    Map.exploreAdjacentTiles(Player.currentTile)

    Terminal.update(Player.currentTile)

    const mininav = getNav(Player, Map, Terminal, 200, 200, 1.75, true, false)

    new p5(Nav.sketch, document.getElementById('nav'));
    new p5(mininav.sketch, document.getElementById('mini-nav'));

    // event buttons
    document.getElementById("event-close").addEventListener("click", () => {
        document.getElementById("event").classList.remove('show')
    })

    // nav menu buttons
    document.getElementById('nav-go').addEventListener('click', () => {
        Nav.go()
        // dismiss nav
        Nav.disableInteraction()
        document.getElementById('navWrapper').classList.remove('show')
        Nav.hidden = true
    })
    document.getElementById('nav-cancel').addEventListener('click', () => {
        Nav.clear()
    })
    document.getElementById('mini-nav').addEventListener('click', () => {
        if (!Nav.hidden) {
            Nav.disableInteraction()
            document.getElementById('navWrapper').classList.remove('show')
            Nav.hidden = true
        } else {
            document.getElementById('navWrapper').classList.add('show')
            //document.getElementById('navWrapper').hidden = true
            Nav.enableInteraction()
            Nav.hidden = false
        }
    })


    // terminal 
    document.getElementById('termInspect').addEventListener('click', () => {
        Terminal.appendMessage(Player.currentTile.description || "Space is empty and vast.")
    })
    document.getElementById('viewport').addEventListener('click', () => {
        Terminal.appendMessage(Player.currentTile.description || "Space is empty and vast.")
    })
    document.getElementById('termSignal').addEventListener('click', () => {
        const signals = Map.getSignals(Player.currentTile)
        if (signals.length == 0) {
            Terminal.appendMessage("Your radio is silent")
        } else {
            Terminal.appendMessage("** INCOMING TRANSMISSION **")
            Terminal.appendMessage(getSignalText(signals[0]))
        }
    })
}

const loop = () => {
    Nav.mainLoop()
    requestAnimationFrame(loop)
}


setup()
loop()