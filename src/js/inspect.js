// code for determining what happens when you press the inspect button

// tracery n shit eventually

import { pickRandom } from "./util"

export const inspect = (Player, Map) => {
    const currentTile = Player.currentTile
    const neighbors = Map.getAdjacentTiles(currentTile)
    console.log(neighbors)
    const signals = Map.getSignals(currentTile)

    let str = [];

    if (currentTile.star) {
        str.push("There's a healthy star system here. This is a good spot to replenish our solar energy systems.")
    }
    if (signals.length > 0) {
        str.push("Looks like the radio is picking up a signal... It might just be noise, though.")
    }
    if (Player.morale < 3) {
        str.push("Hard to picture getting rescued out here. Everything is starting to look rather desolate.")
    }
    if (Player.energy < 5) {
        str.push("The ship is running low on power. Let's try not to get stranded.")
    }

    let neighbor_str = [];
    neighbors.forEach(n => {
        if (n.event) {
            neighbor_str.push("There's something going on over in " + n.name + '.')
        }
        if (n.star) {
            neighbor_str.push("It looks like there's a star system in " + n.name + '.')
        }
    })
    if (str.length == 0) {
        str = [
            'Space is empty and vast.',
        ]
    }
    if (neighbor_str.length == 0) {
        neighbor_str = [
            "It doesn't look like there's much nearby. "
        ]
    }
    let inspectStr = pickRandom(str) + ' ' + pickRandom(neighbor_str)
    return inspectStr

}