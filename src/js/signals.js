import { pickRandom, setCharAt, setupTextAnimation } from "./util"

export const renderSignals = (signals) => {
    if (signals.length > 0) {
        document.getElementById('termSignal').classList.remove('sub-btn')
    } else {
        document.getElementById('termSignal').classList.add('sub-btn')
    }
}

const scrambleText = (text, distance) => {
    const scrambleWords = ["brzt", "...", "kssh", "\u275A", "?", " "]
    const words = text.split(" ")
    if (distance == 0) {
        return text
    }
    // fuzz 50% of the words
    for (let i = 0; i < words.length; i++) {
        if (Math.random() < 0.5) {
            words[i] = pickRandom(scrambleWords)
        }
    }
    let newText = words.join(" ")
    if (distance == 1) {
        return newText
    }

    // at higher distances random characters are also distorted
    for (let i = 0; i < newText.length; i += 1) {
        if (Math.random() < 0.2 * distance) {
            newText = setCharAt(newText, i, pickRandom(scrambleWords))
        }
    }
    return newText
}

export const getSignalText = (signal) => {
    return scrambleText(signal.text, signal.distance)
}

