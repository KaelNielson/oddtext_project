class gameRoom {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.roomItems = []
        this.roomPeople = []
    }

}

class gamePathway {
    constructor(name, description, room1, room2, locked) {
        this.name = name
        this.description = description
        this.room1 = room1
        this.room2 = room2
        this.locked = locked
    }

    travelThrough() {
        if (!locked) {
            if (currentRoom === room1) {
                currentRoom = room2
            } else if (currentRoom === room2) {
                currentRoom = room1
            }
            return `You enter ${currentRoom}`
        } else {
            return `The ${this.name} is shut.`
        }
    }

    toggleLock() {
        if (locked) {
            locked = false
        } else {
            locked = true
        }
    }
}

class gameObject {
    constructor(name, description, roomDescription, action, container=false) {
        this.name = name;
        this.description = description;
        this.roomDescription = roomDescription
        this.action = action;
        this.attributes = []
        if (container) {
            this.attributes.push("Container");
            this.contents = []
        }
    }

    toggleAttribute(attr) {
        if (this.checkAttribute(attr)) {
            this.attributes.splice(this.attributes.indexOf(attr), 1)
        } else {
            this.attributes.push(attr)
        }
    }

    placeInside(newItem) {
        this.contents.push(newItem)
    }

    pickUp() {
        if (this.checkAttribute("Collectable")) {
            inventory.push(this)
            currentRoom.roomItems.splice(currentRoom.roomItems.indexOf(this), 1)
            return `You picked up the ${this.name}`
        } else {
            return `You can't pick up the ${this.name}`
        }
        
    }

    checkAttribute(attr) {
        return (this.attributes.includes(attr));
    }
}

class gameCharacter {
    constructor(name, description, dialogue) {
        this.name = name;
        this.description = description;
        this.dialogue = dialogue;
    }

    talk() {
        return dialogue[getRandomNumber(dialogue.length,1)];
    }
}

let inputFullText = ""
let descriptionFullText = `Hello, and welcome to The Adventures of A Confused Hero: The Prison.<br><br>You awake blearily in an uncomfortable cot.`
let r1 = new gameRoom("prison cell", "The room is small and the walls are made of cobblestone. On the east side, the monotony of the wall is broken by an old prison door made of iron bars. The whole room smells of mildew. The only light comes from the moon, through the window above your head.")

let r2 = new gameRoom("prison hallway", "Placeholder description")
//let p1 = new gamePathway("prison door", "The door seems old, but its still sturdy. No amount of brute force will open this one. It's got a large, weighty padlock keeping it shut. Maybe there's a key nearby...",r1, r2, true)
let key = new gameObject("silver key", "The key is old but still gleams silvery in the light. Perhaps it will fit in a lock nearby.", "Sticking out of the broken mirror, a silver key reflects the moonlight into your eyes.")
key.toggleAttribute("Collectable")
let glass = new gameObject("glass shard", "It's a large piece of the mirror's glass. If you're careful, you can handle it without cutting your fingers.", "On the floor below the shattered mirror, a single large glass shard lays in the dirt.", null)
glass.toggleAttribute("Collectable")
let basin = new gameObject("water basin", "Basin is a generous term for the basic metal bowl on the floor, but it is in fact, full of water. The water has been here for a while, as noted by the rust at the bottom of the bowl.", "In the west, a water basin sits on the floor.", null)
let cot = new gameObject("cot", "It's a simple cot, designed for the barest necessity, not for comfort. Just staw and wood.", "In the north of the room lies your cot, the one you just awoke from.", null)
let bucket = new gameObject("wooden bucket", "The bucket is, thankfully, empty, and appears to be made of sturdy wood.", "On the southern side of the room, a wooden bucket sits on the ground.", null)
bucket.toggleAttribute("Collectable")
let mirror = new gameObject("old mirror", "The mirror is old, but still reflects your face back at you. Wow, you look a little sickly. A large crack spans the mirror, splitting your reflection. Something gleams from within the crack.", "On the west wall, an old mirror has been crudely placed into the wall.", null, true)
mirror.toggleAttribute("Fragile")
mirror.placeInside(key)
mirror.placeInside(glass)
let rock = new gameObject("rock", "The rock looks like it might have been part of the wall. It seems weighty", "The floor is just flat dirt except for one rock next to the door.", strike)
rock.toggleAttribute("Collectable")
//r1.roomItems += [basin, cot, bucket, mirror]
r1.roomItems = r1.roomItems.concat([basin, rock, cot, bucket, mirror])
let currentRoom = r1
let inventory = []

function getRandomNumber(top, step) {
    return Math.floor(Math.random()*top) * step
}


function nameSearch(name, container=null) {
    let objFound = null;
    let wordNum = name.split(" ").length
    if (container === null) {
        for (let item of currentRoom.roomItems) {
            if ((wordNum === 1) && (item.name.length > 1)) {
                if (item.name.split(" ").includes(name)) {
                    objFound = item
                }
            } else {
                if (item.name === name) {
                    objFound = item
                }
            }
        } for (let person of currentRoom.roomPeople) {
            if ((wordNum === 1) && (person.name.length > 1)) {
                if (person.name.split(" ").includes(name)) {
                    objFound = person
                }
            } else {
                if (person.name === name) {
                    objFound = person
                }
            }
        } for (let path of currentRoom.paths) {
            if (path != null) {
                if ((wordNum === 1) && (path.name.length > 1)) {
                    if (path.name.split(" ").includes(name)) {
                        objFound = path
                    }
                } else {
                    if (path.name === name) {
                        objFound = path
                    }
                }
            }
        } for (let item of inventory) {
            if ((wordNum === 1) && (item.name.length > 1)) {
                if (item.name.split(" ").includes(name)) {
                    objFound = item
                }
            } else {
                if (item.name === name) {
                    objFound = item
                }
            }
        } 
    } else {
        for (let mystery of container) {
            if ((wordNum === 1) && (mystery.name.length > 1)) {
                if (mystery.name.split(" ").includes(name)) {
                    objFound = mystery
                }
            } else {
                if (mystery.name === name) {
                    objFound = mystery
                }
            }
        }
    } 
    return objFound  
}

function checkInput() {
    //let r1 = new gameRoom("placeholder name", "placeholder description")
    //let currentRoom = r1
    //let currentRoom = new gameRoom("Something1", "Something2")
    //let newRoom = currentRoom
    //document.getElementById("actionInput").placeholder = "Current room works"
    let input = document.getElementById("actionInput").value.toLowerCase();
    document.getElementById("actionInput").value = "";
    inputFullText += "<br>";
    inputFullText += input;
    let words = input.split(" ");
    if (words[0] === "examine") {
        if (words.length > 2) {
            words[1] = `${words[1]} ${words[2]}`;
        }
        if (words[1] === "room") {
            descriptionFullText += "<br>";
            descriptionFullText += currentRoom.description;
            if (currentRoom.roomItems.length > 0) {
                for (let j = 0; j < currentRoom.roomItems.length;j++) {
                    descriptionFullText += ` ${currentRoom.roomItems[j].roomDescription}`
                } 
            }
        } else {
            let exObj = nameSearch(words[1])
            if (exObj != null) {descriptionFullText += `<br>${exObj.description}`} else {descriptionFullText += "<br>That can't be examined. Please refer to the bottom-right box for command parameters.";}
        }
    } else if (words[0] === "take") {
        if (words.length > 2) {
            words[1] = `${words[1]} ${words[2]}`;
        }
        let tkObj = nameSearch(words[1]);
        if (tkObj instanceof gameObject) {
            if (inventory.includes(tkObj)) {
                descriptionFullText += `<br>You already have the ${words[1]}`
            } else {
                descriptionFullText += `<br>${tkObj.pickUp()}`
            }
        } else if (tkObj === null) {
            description += `<br>That item is not in this room.`
        } else {
            description += `<br>That is not an item, so it can't be picked up.`
        }
    } else if (words[0] === "use") {
        middleIndex = words.indexOf("on")
        // Use Heavy Rock on Old Mirror
        //use rock on mirror
        if (middleIndex > 2) {
            words[1] = `${words[1]} ${words[2]}`
            words.splice(2, 1)
        } if (words.length > 4) {
            words[3] = `${words[3]} ${words[4]}`
            words.splice(4,1)
        }
        //document.getElementById("actionInput").placeholder = "No object search runs"
        let useObj = nameSearch(words[1], inventory)
        //document.getElementById("actionInput").placeholder = "First object search runs"
        let tarObj = nameSearch(words[3])
        //document.getElementById("actionInput").placeholder = "Second object search runs"
        if ((useObj === null) || !(useObj instanceof gameObject)) {
            descriptionFullText += `<br>${words[1]} is not a valid object`
        } else {
            if (useObj.action === null) {
            descriptionFullText += `<br>You can't use that object`
            } else {
                if (tarObj === null) {
                    descriptionFullText += `<br>${words[3]} is not a valid target`
                } else {
                    descriptionFullText += `<br>${useObj.action(tarObj)}`
                }
            }
        }
    } else {
        descriptionFullText += "<br>That's not a recognized command. Please refer to the bottom-right box for command parameters.";
    }
    document.getElementById("mainText").innerHTML = descriptionFullText;
    document.getElementById("previousInputs").innerHTML = inputFullText
    //document.getElementById('mainBody').style.backgroundColor = "blue";
}

function strike(target) {
    let returnString = "";
    if (target instanceof gameObject) {
        if (currentRoom.roomItems.includes(target)) {
            if (target.checkAttribute("Fragile")) {
                returnString += `You break the ${target.name}.`
                if (target.checkAttribute("Container")) {
                    returnString += ` Out of the ${target.name} falls a `
                    for(let r = 0; r < target.contents.length; r++) {
                        returnString += `${target.contents[r].name} and a `
                        currentRoom.roomItems.push(target.contents[r])
                    }
                    returnString = returnString.slice(0, returnString.length-7)
                    returnString += "."
                }
                currentRoom.roomItems.splice(currentRoom.roomItems.indexOf(target), 1);
            } else {
                returnString = `The ${target} doesn't break.`
            }
        } else if (inventory.includes(target)) {
            if (target.checkAttribute("Fragile")) {
                returnString += `You break the ${target}`
                if (target.checkAttribute("Container")) {
                    returnString += `Out of the ${target} falls a `
                    for(let r = 0; r < target.contents.length; r++) {
                        returnString += `${target.contents[r]} and a `
                        inventory.push(target.contents[r])
                    }
                    returnString.slice(returnString.length-6, 6)
                }
                inventory.splice(inventory.indexOf(target), 1);
            } else {
                returnString = `The ${target} doesn't break.`
            }
        } else {
            returnString = `The ${target} isn't in this room`
        }
    } else {
        returnString = `The ${target} doesn't break`
    }
    return returnString
}

function lockSpecific(specific) { //Returns a function to unlock/lock a specific door
    function lS(target) {
        if (target === specific) {
            target.toggleLock()
            return true
        } else {
            return false
        }
    }
    return lS
}

