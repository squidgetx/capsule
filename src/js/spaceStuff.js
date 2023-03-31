
export const SPACE_STUFF = {
    wreckage: {
        title: "Ship Wreckage",
        navDetail: "Wreckage of a large spacecraft detected. Closer inspection could be dangerous.",
        inspect: "Wreckage of a large spacecraft detected. Closer inspection could be dangerous.",
        warning: null,
        event: {
            title: "Ship Wreckage",
            text: "The Arc was once two perfect rings propelling your people to their new home. Now it looks like a mess of shattered ribs, frozen in space. All the lights are out. You see detritus float in the dark, even at this distance. You dare not approach.",
            blocking: false,
            asModal: true,
            effects: {}
        },
        signal: null
    },
    emptyPod: {
        title: "Jettisoned Escape Pod",
        inspect: "Another CAPSULE pod is floating in space!",
        warning: null,
        event: {
            title: "Jettisoned Escape Pod",
            text: "You maneuver as close as you can to the other pod, but it's empty. You requisition its energy stores for later use. You also take note of the plotted course in its navigation computer.",
            effects: {
                energy: 10,
                morale: -1,
                explore: 20,
            },
            blocking: false,
            asModal: true,
        },
        signal: {
            text: "Helllllp!!! I'm in an escape pod!",
            strength: 1
        }
    },
    rescue1: {
        title: "Rescue Point",
        navDetail: "The Capsule navigation system rendevous point!",
        inspect: "There's nothing here...",
        warning: null,
        event: null,
        signal: null,
    },
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