// Test import of a JavaScript module
import '@/styles/index.scss';
import p5 from 'p5'
import { getMap } from './js/map';
import { getPlayer } from './js/player';
import { getNav, setupNavControls } from './js/nav';
import { Game, RESOURCE } from './js/game';
import { getTerminal } from './js/terminal'
import { opening } from './js/opening';

let game, map, player, nav, terminal

const setup = () => {

    map = getMap()
    terminal = getTerminal()
    map.generateTiles()
    player = getPlayer(map.tiles[7])
    nav = getNav(player, map, terminal, 600, 350, 1, false, false)
    game = new Game(player, map, terminal, nav)

    game.crossTileActions()
    game.renderResources()

    const mininav = getNav(player, map, terminal, 200, 200, 1.75, true, false)

    new p5(nav.sketch, document.getElementById('nav'));
    new p5(mininav.sketch, document.getElementById('mini-nav'));

    // event buttons
    document.getElementById("event-close").addEventListener("click", () => {
        console.log('close event')
        game.closeEvent()
    })

    // terminal controls
    document.getElementById('termInspect').addEventListener('click', () => {
        game.inspect()
    })
    document.getElementById('viewport').addEventListener('click', () => {
        game.inspect()
    })
    document.getElementById('termSignal').addEventListener('click', () => {
        if (terminal.signal) {
            terminal.appendMessage("** INCOMING TRANSMISSION **")
            terminal.appendMessage(terminal.signal)
        } else {
            terminal.appendMessage("Your radio is silent")
        }
    })
    document.getElementById('beacon').addEventListener('click', () => {
        game.useBeacon()
    })

    // nav controls
    setupNavControls(nav)

    // begin the game

}

const loop = () => {
    game.loop()
    requestAnimationFrame(loop)
}


setup()
loop()
opening(game)