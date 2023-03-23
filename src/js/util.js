export function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
};

export function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}
export function setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
}

const animateTextFrame = (div, pageSize, loop, cb) => {
    const text = div.getAttribute('data')
    let cursor = div.getAttribute('cursor')
    const divIntervalId = div.getAttribute('intervalId')
    if (text == null || cursor == null) {
        return
    }
    if (cursor > text.length) {
        if (loop) {
            cursor = 0
        } else {
            clearInterval(divIntervalId)
        }
        if (cb) {
            cb()
        }
        return
    }
    let offset = 0
    if (pageSize && cursor > pageSize) {
        offset = Math.floor(cursor / pageSize) * pageSize
    }
    div.innerHTML = text.slice(offset, cursor) + "\u275A"
    div.setAttribute('cursor', parseInt(cursor) + 1)
}

export const setupTextAnimation = (div, text, options) => {
    const defaultOptions = {
        callback: null,
        loop: null,
        pageSize: null,
        interval: 50
    }
    for (const key of Object.keys(options)) {
        defaultOptions[key] = options[key]
    }
    div.setAttribute('data', text)
    div.setAttribute('cursor', 0)
    const divIntervalId = div.getAttribute('intervalId')
    if (divIntervalId) {
        clearInterval(divIntervalId)
    }
    const intervalId = setInterval(
        () => animateTextFrame(
            div,
            defaultOptions.pageSize,
            defaultOptions.loop,
            defaultOptions.callback
        ),
        defaultOptions.interval
    )
    div.setAttribute('intervalId', intervalId)

    // if you click the div, just display the full text and kill the animation

    if (defaultOptions.loop == null) {
        div.addEventListener('click', () => {
            div.innerHTML = text
            if (options.callback) {
                options.callback()
            }
            clearInterval(intervalId)
        })
    }
}