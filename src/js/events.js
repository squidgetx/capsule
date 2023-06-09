import { setupTextAnimation } from "./util";
import { RESOURCE } from "./game";

export const applyEventEffect = (e, game) => {
    let effectText = ''
    for (const resource of Object.values(RESOURCE)) {
        if (e.effects[resource]) {
            game.changeResourceLog(resource, e.effects[resource])
            effectText += `${resource}: ${e.effects[resource]} `
        }
    }

    if (e.effects['explore']) {
        game.map.tiles[e.effects['explore']].explored = true
        effectText += `New sector added to navigation computer!`
    }

    return effectText
}
// Render the event and call the callback arg when the event is closed.
export const renderEvent = (e, game, cb) => {

    document.getElementById("event").classList.add('show');
    document.getElementById("event-title").innerHTML = e.title || '';
    document.getElementById("event-close").disabled = true;
    document.getElementById("event-effect").innerHTML = '';
    document.getElementById("event-options").innerHTML = '';

    const afterText = (e) => {
        // once event text is done scrolling, apply effects
        let effects = applyEventEffect(e, game)
        document.getElementById("event-effect").innerHTML = effects;

        // enable closing the event
        document.getElementById("event-close").disabled = false;

        // render event options
        if (e.options) {
            const optionWrapper = document.getElementById('event-options')
            const optionButtons = e.options.map((op) => {
                const b = document.createElement('button')
                b.innerHTML = op.text
                b.classList.add('btn')
                b.addEventListener('click', () => {
                    if (op.action) {
                        op.action(game)
                    }
                    game.closeEvent()
                })
                return b
            })
            for (const optionButton of optionButtons) {
                optionWrapper.appendChild(optionButton)
            }
        }
    }

    setupTextAnimation(
        document.getElementById('event-text'),
        e.text,
        {
            callback: () => afterText(e)
        }
    );
}

export const events = {
    asteroids: {
        "title": "The Tabrini Asteroids",
        "text": "Your Capsule does its best to navigate through the dense field of obliterated rocks and metals, but you are no pilot. You brush against an asteroid and the entire cabin flickers.",
        "energy": -1,
        "health": -1
    },
    signal: {
        "title": "An Errant Signal",
        "text": "Your Capsule picks up a radio message as you glide through empty space. 'Rendezvous at Sierra 21-3.' The message repeats over and over.",
        "effect": "+1 Area of Interest"
    },
    pirates: {
        "title": "Amytis of Babylon",
        "text": "A ship appears on your radar, but it's a fearsome thing made of guns and steel. You send a plea for rescue and recieve a message. 'Can't pick up strangers, but dropped this for you. Godspeed.' ",
        "energy": +1,
        "morale": -1,
        "consumable": true
    }
}