
export const SPACE_STUFF = {
    asteroids: {
        title: "The Tabrini Asteroids",
        type: "Asteroid Field",
        navDetail: "An asteroid field composed of many large rocks and mineral deposits.",
        inspect: "Rumor has it that giant predators live inside the maze like crater systems of the larger asteroids.",
        warning: "Asteroids ahead!",
        action: null,
        event: {
            title: "The Tabrini Asteroids",
            text: "Your Capsule does its best to navigate through the dense field of obliterated rocks and metals, but you are no pilot. You brush against an asteroid and the entire cabin flickers.",
            effects: {
                energy: -1,
                health: -1,
            },
            blocking: true,
            asModal: true,
        },
        signal: null
    },
    star: {
        title: "Alpha Sagorut",
        type: "Star",
        navDetail: "Alpha Sagorut is the central star in this sector. It should be healthy enough to restore the ship's solar energy systems.",
        inspect: "Alpha Sagorut shines brightly in the distance.",
        warning: null,
        action: null,
        event: {
            text: "Solar energy detected",
            effects: {
                energy: 20,
            },
            blocking: false,
            asModal: false
        },
        signal: null,
    },
    pirates: {
        type: "Ship",
        title: "Amytis of Babylon",
        navDetail: null,
        inspect: "A fearsome ship made of guns and steel looms in the distance. Is that where that signal is coming from?",
        warning: null,
        action: {
            label: "Send short wave distress signal!",
            event: {
                title: "Amytis of Babylon",
                text: "You send a plea for rescue and receive a message. 'Can't pick up strangers, but dropped this for you. Godspeed.' \nThe ship disappears into the inky blackness. ",
                effects: {
                    energy: 1,
                    morale: -1,
                },
            },
            allowRepeat: false
        },
        event: null,
        signal: {
            text: "With this new haul of energy cells we're bound to come out ahead on credits",
            strength: 2
        },
    },
    blackHole: {
        type: "Black Hole",
        title: "Black Hole",
        navDetail: "A black hole is here.",
        inspect: null,
        warning: "A black hole looms!",
        action: null,
        event: {
            title: "Black Hole",
            text: "A swirling mass of darkness descends upon you",
            effects: {
                energy: -100,
                health: -100
            },
            blocking: true,
            asModal: true,
        },
        signal: null
    }
}