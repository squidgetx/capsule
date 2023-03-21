
export const renderSignals = (signals) => {
    for (const signal of signals) {
        renderSignal(signal)
    }
    if (signals.length == 0) {
        const signalDiv = document.getElementById("signal")
        signalDiv.classList.remove('show')
    }
}

const renderSignal = (signal) => {
    console.log(signal.text)
    const signalDiv = document.getElementById("signal")
    signalDiv.classList.add('show');
    signalDiv.querySelector('.text').innerHTML = `<span>${signal.text}</span><br /><span>Signal Strength: ${1 / signal.distance}</span>`
}