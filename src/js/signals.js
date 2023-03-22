import { pickRandom, setCharAt } from "./util"

export const renderSignals = (signals) => {
    for (const signal of signals) {
        renderSignal(signal)
    }
    if (signals.length == 0) {
        const signalDiv = document.getElementById("signal")
        signalDiv.classList.remove('show')
    }
}

const scrambleText = (text, distance) => {
    const scrambleWords = ["brzt", "...", "kssh", "\u275A", "?"]
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

const renderSignal = (signal) => {
    const signalDiv = document.getElementById("signal")
    signalDiv.classList.add('show');
    let signalText = scrambleText(signal.text, signal.distance)
    signalDiv.querySelector('.text').setAttribute('data', signalText)
    signalDiv.querySelector('.text').setAttribute('cursor', 0)
}

export const animateSignal = () => {
    const signalTextDiv = document.getElementById('signal').querySelector('.text')
    const text = signalTextDiv.getAttribute('data')
    let cursor = signalTextDiv.getAttribute('cursor')
    if (text == null || cursor == null) {
        return
    }
    if (cursor > text.length) {
        cursor = 0
    }
    let offset = 0
    const pageSize = 200
    if (cursor > pageSize) {
        offset = Math.floor(cursor / pageSize) * pageSize
    }
    signalTextDiv.innerHTML = text.slice(offset, cursor) + "\u275A"
    signalTextDiv.setAttribute('cursor', parseInt(cursor) + 1)
}