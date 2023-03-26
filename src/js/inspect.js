// code for determining what happens when you press the inspect button

// tracery n shit eventually

import { pickRandom } from "./util"

export const inspect = (Player, Map) => {
    const currentTile = Player.currentTile
    const signals = Map.getSignals(currentTile)

    let str = [];

    let i = currentTile.spaceStuff.map(s => s.inspect).join(" ")
    if (i) {
        str.push(i)
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

    if (str.length == 0) {
        str = [
            'Space is empty and vast.',
        ]
    }
    return str.join(" ")

}