import { setupTextAnimation } from "./util"
import { getSignalText } from "./signals"

const Terminal = {
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
    signal: null
}
Terminal.setSignals = (signals) => {
    // Right now we just fetch the signals again later
    if (signals.length > 0) {
        Terminal.signal = getSignalText(signals[0])
        document.getElementById('termSignal').classList.remove('sub-btn')
    } else {
        document.getElementById('termSignal').classList.add('sub-btn')
    }
}

export const getTerminal = () => Terminal