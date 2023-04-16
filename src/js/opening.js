
// when the player begins the game....

import { SPACE_STUFF } from "./spaceStuff";

export function opening(game) {
    /*
    const clickBlocker = document.createElement('div')
    document.body.appendChild(clickBlocker)
    clickBlocker.id = 'clickBlocker'
    clickBlocker.classList.add('dark')

    game.queueEvent(SPACE_STUFF.opening)
    game.queue(() => {
        clickBlocker.classList.remove('dark')
        game.endAction()
    })

    game.queueTerminalMessages(
        "CAPSULE-14: 1 PASSENGER",
        "PRESS HAND TO INTERFACE. "
    )
    game.queue(() => {
        clickBlocker.addEventListener('click', () => {
            clickBlocker.remove()
            game.endAction()
        })
    })
    */
    game.queue(() => {
        document.getElementById('mini-nav-mask').classList.add('on')
        game.endAction()
    })
    game.queueTerminalMessages(
        "NAVIGATION SYSTEM ONLINE",
        "PILOT BIOMETRICS SYNCED",
        "OPEN MANUAL FOR OVERVIEW AND OPERATION INSTRUCTIONS.",
        "PILOT ACTION NEEDED: CHART COURSE.",
    )
}