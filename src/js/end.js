export const endings = {
    oxygen: {
        "events": [{
            "title": "Last Breath",
            "text": "The air grows thin. Your body feels heavy and you drift into a fitful sleep. You will your eyes to open and gaze up at the blurry expanse of stars. The lights dance above you and for a moment you remember why they once called it heaven."
        },
        {
            "title": "Air",
            "text": "You've never breathed a natural atmosphere. Oxygen has always come from electrolysis; every breath you've taken has been one recycled from Earth's atmosphere. You wonder how many bodies this air has passed through. You wonder how, if they find you, if they will recycle this air as well."
        }]
    },
    energy: {
        "events": [
            {
                "title": "Lights Out",
                "text": "The capsule's systems begin to fail as energy reserves run dry. First it gets very cold, the lights drain from your console, and then the nav systems begin to fail. At last, the power for your last distress beacon runs dry. Your world fades to black."
            },
            {
                "title": "Set Adrift",
                "text": "You knew this was your final destination. Still there was a glimmer of hope that someone, anyone, would come across you in the vastness of space. No one finds you in time."
            }
        ]
    }
}

export function renderEnd(a) {
    document.getElementById("end").classList.add("show");
    //eventually pick a random ending
    let endtitle = document.getElementById("end-title");
    let endtext = document.getElementById("end-text");
    if (a == "oxygen") {
        endtitle.innerHTML = endings.oxygen.events[0].title;
        endtext.innerHTML = endings.oxygen.events[0].text;
    }
    if (a == "energy") {
        endtitle.innerHTML = endings.energy.events[0].title;
        endtext.innerHTML = endings.energy.events[0].text;
    }
}