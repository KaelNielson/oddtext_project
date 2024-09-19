function getRandomNumber(top, step) {
    return Math.floor(Math.random()*top) * step
}

function capitalize(string) {
    return string[0].toUpperCase() + string.slice(1)
}

class gameRoom {
    constructor(name, description) {
        this.map = new Map();
        this.map.set("Name", name)
        this.map.set("Main", description)
        this.roomItems = []
        this.roomPeople = []
    }
}

class gameObject {
    constructor(name, description, roomDescription, action, attributes=[]) {
        this.map = new Map();
        this.map.set("Name", name)
        this.map.set("Main", description)
        this.map.set("Room", roomDescription)
        this.action = action;
        this.attributes = attributes
        if (this.attributes.includes("Container")) {
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
        newItem.map.set("Room", `A ${newItem.map.get("Name")} lies inside a ${this.map.get("Name")}.`)
    }

    pickUp() {
        if (gameState.inventory.includes(this)) {
            return `You have already picked up the ${this.map.get("Name")}`
        } else {
            if (this.checkAttribute("Collectable")) {
                gameState.inventory.push(this)
                gameState.currentRoom.roomItems.splice(gameState.currentRoom.roomItems.indexOf(this), 1)
                return `You picked up the ${this.map.get("Name")}`
            } else {
                return `You can't pick up the ${this.map.get("Name")}`
            }
        }
        
    }

    putDown() {
        if (gameState.inventory.includes(this)) {
            gameState.inventory.splice(gameState.inventory.indexOf(this), 1)
            gameState.currentRoom.roomItems.push(this)
            this.map.set("Room", `A ${this.map.get("Name")} lies on the floor.`)
            return `You've dropped the ${this.map.get("Name")}`
        } else {
            return `You aren't holding a ${this.map.get("Name")}`
        }
    }

    checkAttribute(attr) {
        return (this.attributes.includes(attr));
    }
}

class gamePath {
    constructor (name, unlockedDescription, lockedDescription, roomDescription, inactiveDescription, destination, locked) {
        this.map = new Map();
        this.map.set("Name", name)
        if (locked) {
            this.map.set("Main", lockedDescription)
            this.map.set("Unmain", unlockedDescription)
        } else {
            
            this.map.set("Main", unlockedDescription)
            this.map.set("Unmain", lockedDescription)
        }
        this.map.set("Room", roomDescription)
        this.map.set("Inactive", inactiveDescription)
        this.destination = destination
        this.locked = locked
    }

    toggleLock() {
        let temporary = this.map.get("Main")
        this.map.set("Main", this.map.get("Unmain"))
        this.map.set("Unmain", temporary)
        if (this.locked === true) {
            this.locked = false
            return `The ${this.map.get("Name")} is unlocked`
        } else {
            this.locked = true
            return `The ${this.map.get("Name")} is locked`
        }
    }

    moveThrough() {
        if (this.locked === false) {
            let tempRoom = gameState.currentRoom
            gameState.currentRoom = this.destination
            this.destination = tempRoom
            let tempDesc = this.map.get("Room")
            this.map.set("Room", this.map.get("Inactive"))
            this.map.set("Inactive", tempDesc) 
            //document.getElementById("actionInput").placeholder = this.currentRoom.map.get("Name")
            gameState.currentRoom.roomItems.push(this)
            return `You've entered the ${gameState.currentRoom.map.get("Name")}`
        } else {
            return `You can't go through the ${this.map.get("Name")}; it's locked.`
        }
    }
}

class gamePerson {
    constructor(name, title, description, roomDescription, deathEvent, inventory=[], action=null) {
        this.map = new Map();
        this.map.set("Name", name)
        this.map.set("Title", title)
        this.map.set("Main", description)
        this.map.set("Room", roomDescription)
        this.deathEvent = deathEvent
        this.inventory = inventory
        this.isDead = false
        this.action = action
        this.dialog = []
    }

    talk() {
        if (this.dialog.length === 0) {
            return "This person has nothing to say."
        } else if (this.dialog.length === 1) {
            return this.dialog[0]
        } else {
            this.dialog[getRandomNumber(this.dialog.length, 1)]
        }
    }
}

class gameState {
    static inputText = ""
    static descriptionText = "Hello, and welcome to An Adventure in a Confused World: The Castle.<br><br>You awake blearily in an uncomfortable cot."
    static currentRoom = new gameRoom("prison cell", "The room is small and the walls are made of cobblestone. The whole room smells of mildew. The only light comes from the moon, through the window above your head.")
    static inventory = []
    static armor = null
    static dead = false
    
    //static glass = new gameObject("glass shard", "It's a large piece of the mirror's glass. If you're careful, you can handle it without cutting your fingers.", "On the floor below the shattered mirror, a single large glass shard lays in the dirt.", null, true)
    static water = new gameObject("still water", "The water is still, and smells faintly of mildew.", "Still water sits in the water basin.", null)
    static basin = new gameObject("water basin", "Basin is a generous term for the basic metal bowl on the floor, but it is in fact, full of water. The water has been here for a while, as noted by the rust at the bottom of the bowl.", "In the west, a water basin sits on the floor.", null, ["Container"])
    static cot = new gameObject("cot", "It's a simple cot, designed for the barest necessity, not for comfort. Just staw and wood.", "In the north of the room lies your cot, the one you just awoke from.", null)
    static bucket = new gameObject("wooden bucket", "The bucket is, thankfully, empty, and appears to be made of sturdy wood.", "On the southern side of the room, a wooden bucket sits on the ground.", bucket, ["Collectable", "Container"])
    static mirror = new gameObject("old mirror", "The mirror is old, but still reflects your face back at you. Wow, you look a little sickly. A large crack spans the mirror, splitting your reflection. Something gleams from within the crack.", "On the west wall, an old mirror has been crudely placed into the wall.", null, ["Container", "Locked", "Fragile"])
    static door = new gamePath("prison door", "The door seems old, but its still sturdy. No amount of brute force would open this one. A large, weighty padlock hangs open on the door.","The door seems old, but its still sturdy. No amount of brute force will open this one. It's got a large, weighty padlock keeping it shut. Maybe there's a key nearby...", "On the east side, the monotony of the wall is broken by an old prison door made of iron bars.", "The only wall of the balcony, at the west side, contains this old prison door of iron bars.", undefined, true)
    static key = new gameObject("silver key", "The key is old but still gleams silvery in the light. Perhaps it will fit in a lock nearby.", "Sticking out of the broken mirror, a silver key reflects the moonlight into your eyes.", lockSpecific(gameState.door), ["Collectable"])
    static rock = new gameObject("rock", "The rock looks like it might have been part of the wall. It seems weighty", "The floor is just flat dirt except for one rock next to the door.", strike, ["Collectable"])
    //static fruit = new gameObject("orange", "It's an orange", "There's also an orange", null, true)
    
    static guy = new gamePerson("john doe", "mysterious gentleman", "The man is well dressed, with a three-piece black suit and a top hat.", "A mysterious gentleman stands below the single light in the room")
    static nextRoom = new gameRoom("mysterious room", "The room is entirely dark except for a single spotlight of indeterminate origin in the center of the room. It is unclear how large the room is because the walls are hidden in the darkness. The only visible wall is the east wall.")
    
    static balcony = new gameRoom("garden balcony", "Instead of a room, you see a balcony open to the air. The balcony overlooks miles of forest, and in the distance, you can see the smoke of civilization. However, the balcony has no clear exits.")
    static planter = new gameObject("stone planter", "The planter is made of smooth stone, in a simple, rectangle shape. It is full of rich, black, soil, and appears to already have a seed planted inside it.", "On the north side of the balcony, a stone planter sits next to the railing.", null, ["Container"])
    static eyepiece = new gameObject("ornate telescope", "The telescope is carved all over with various constellations. Unfortunately, it is midday, and the telescope will not show you the stars.", "In the southwest corner of the balcony, an ornate telescope is anchored to the railing, pointing at the sky.", null)
    static plate = new gameObject("plate armor", "The armor is heavy, but it appears fairly sturdy.", "Plate Armor lays afixed to the dead guard on the floor.", bolster, ["Collectable"])
    static sword = new gameObject("sharp sword", "The sword is sharp, and has a light, quick feel to it.", "A Sharp Sword lays beside the dead guard.", strike, ["Collectable"])
    static guard = new gamePerson("clyde michaelson", "prison guard", "The guard wears heavy metal plate armor, and has a sword at his side.", "A prison guard stands in the center of the balcony with his back to you. Doing anything rash might bring his attention to you.", guardDies, [gameState.plate, gameState.sword], noticesYou)

    static secondBalcony = new gameRoom("empty balcony", "This balcony has nothing much of note, although it still has the beautiful view as the one before it.")
    static mysteryDoor = new gamePath("balcony door", "The door is made of rather fancy and high-end wood. It's handle is gilted.","The door is made of rather fancy and high-end wood. It's handle is gilted.", "The stone wall at the west side of the balcony contains a rather fancy balcony door.", "The shadow of the east wall is only broken by the fancy balcony door.", gameState.nextRoom, false)
}

function initialize() {
    gameState.mirror.placeInside(gameState.key)
    gameState.basin.placeInside(gameState.water)
    //gameState.mirror.placeInside(gameState.glass)
    gameState.currentRoom.roomItems = [gameState.door, gameState.basin, gameState.rock, gameState.cot, gameState.bucket, gameState.mirror]
    gameState.balcony.roomPeople = [gameState.guard]
    gameState.nextRoom.roomPeople = [gameState.guy]
    gameState.guy.dialog.push("The Man says: 'Good evening. This marks the end of the completed content. Feel free to continue exploring what has already been created.'")
    gameState.guy.deathEvent = dies
    document.getElementById("actionInput").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            if (document.getElementById("actionInput").value != "") {checkInput()}
        }
    })
    gameState.balcony.roomItems = [gameState.planter, gameState.eyepiece]
    gameState.door.destination = gameState.balcony
    gameState.secondBalcony.roomItems.push(gameState.mysteryDoor)
}

function attacksYou(person, words) {
    if ((words[0] === "use") || (words[0] === "talk") || (words[0] === "take") || (words[0] === "drop") || (words[0] === "place")) {
        return `<br>The ${person.map.get("Title")} draws his weapon and strikes you.${characterDies()}`
    }
}

function noticesYou(person, words) {
    if ((words[0] === "use") || (words[0] === "talk") || (words[0] === "take") || (words[0] === "drop") || (words[0] === "place")) {
        person.action = attacksYou
        person.map.set("Room", `A ${person.title} looks at you in confusion.`)
        return `<br>The ${person.map.get("Title")} notices you. His face draws itself in surprise.`
    } else {
        return ""
    }
}

function bolster(armor, origin) {
    if (gameState.inventory.includes(armor)) {
        gameState.inventory.splice(gameState.inventory.indexOf(armor), 1)
        gameState.armor = armor
        return `You put the ${armor.map.get("Name")} on, and feel a whole world safer.`
    } else {
        return `You don't seem to have that armor with you.`
    }
}

function strike(origin, target) {
    let returnString = "";
    if (origin === target) {
        returnString += "You strike yourself in the head."
        returnString += characterDies()
    }else if (target instanceof gameObject) {
        if (gameState.currentRoom.roomItems.includes(target)) {
            if (target.checkAttribute("Fragile")) {
                returnString += `You break the ${target.map.get("Name")}.`
                if (target.checkAttribute("Container")) {
                    returnString += ` Out of the ${target.map.get("Name")} falls a `
                    for(let r = 0; r < target.contents.length; r++) {
                        returnString += `${target.contents[r].map.get("Name")} and a `
                        gameState.currentRoom.roomItems.push(target.contents[r])
                    }
                    returnString = returnString.slice(0, returnString.length-7)
                    returnString += "."
                }
                gameState.currentRoom.roomItems.splice(gameState.currentRoom.roomItems.indexOf(target), 1);
            } else {
                returnString = `The ${target.map.get("Name")} doesn't break.`
            }
        } else if (gameState.inventory.includes(target)) {
            if (target.checkAttribute("Fragile")) {
                returnString += `You break the ${target.map.get("Name")}`
                if (target.checkAttribute("Container")) {
                    returnString += `Out of the ${target.map.get("Name")} falls a `
                    for(let r = 0; r < target.contents.length; r++) {
                        returnString += `${target.contents[r]} and a `
                        gameState.inventory.push(target.contents[r])
                    }
                    returnString.slice(returnString.length-6, 6)
                }
                gameState.inventory.splice(inventory.indexOf(target), 1);
            } else {
                returnString = `The ${target.map.get("Name")} doesn't break.`
            }
        } else {
            returnString = `The ${target.map.get("Name")} isn't in this room`
        }
    } else if (target instanceof gamePerson) {
        if (target.deathEvent != null) {
            returnString = target.deathEvent()
        } else {
            returnString = `The ${target.map.get("Title")} is out of reach of your attack.`
        }
    } else if (target === undefined) {
        returnString = `You...want to hit...the room? Um, no. Like, honestly, what?`
    } else {
        returnString = `The ${target.map.get("Name")} doesn't break`
    }
    return returnString
}

function lockSpecific(specific) {
    function ls(origin, target) {
        if (target instanceof gamePath) {
            if (target === specific) {
                return target.toggleLock()
            } else {
                return `This key doesn't work on ${target.map.get("Name")}`
            }
        } else if (target === undefined) {
            return `The room is not a door`
        } else {
            return `The ${target.map.get("Name")} is not a door.`
        }
    }
    return ls
}

function revenge() {
    gameState.descriptionText += "<br> A shot rings out in the darkness, and a bullet flies solidly through your heart. Maybe next time, consider not killing random people."
    //document.getElementById("actionInput").placeholder = "Get Revenge"
    gameState.descriptionText += characterDies()
    document.getElementById("mainText").innerHTML = gameState.descriptionText;
    document.getElementById("mainText").scrollTop = document.getElementById("mainText").scrollHeight
    
}

function dies() {
    gameState.guy.map.set("Tile", "dead gentleman")
    gameState.guy.map.set("Main", "The corpse is a well-dressed man, bleeding from the temple. His top hat lays discarded along-side him.") 
    gameState.guy.map.set("Room", "A dead gentleman lays bleeding below the single light in the room.") 
    setTimeout(revenge, 2000)
    gameState.guy.isDead = true
    return "Your strike solidly lands on his temple, and he falls to the ground. Blood slides down his face as his eyes unfocus. 'You malicious bugger, you'll...pay...for this.'"
}

function guardDies() {
    gameState.guard.map.set("Title", "dead guard")
    gameState.guard.map.set("Main", "Other than his gear, you also see an earpiece in his ear. Who could he have been communicating with?")
    gameState.guard.map.set("Room", "A dead guard lies face down on the balcony floor.")
    gameState.guard.isDead = true
    return "Your strike cracks against the guard's skull, and he falls forward onto the ground."
}

function takeFrom(specific=null) {
    function putInto(origin, target) {
        if ((target instanceof gameObject) && (target.checkAttribute("Container"))) {
            if ((specific != null) && (target.contents.includes(specific))) {
                origin.contents.push(specific)
                target.contents.splice(target.contents.indexOf(specific), 1)
                specific.map.set("Room", `${capitalize(specific.map.get("Name"))} sits in the ${origin.map.get("Name")}.`) 
                return `The ${origin.map.get("Name")} now has the ${specific.map.get("Name")}`
            } else if ((specific != null) && !(target.contents.includes(specific))) {
                return `The ${target.map.get("Name")} does not have the ${specific.map.get("Name")}`
            } else {
                if (target.contents.length > 0) {
                    origin.contents.push(target.contents.at(0))
                    target.contents.splice(0, 1)
                }
            }
        } else {
            return `The ${target.map.get("Name")} doesn't have the stuff you need in it.`
        }
    }
    return putInto
}

function pourInto(origin, target) {
        if ((target === gameState.planter) && (origin === gameState.bucket)) {
            if (origin.contents[0] === gameState.water) {
                return plant()
            } else {
                return "Your bucket is empty"
            }
        } else if ((target instanceof gameObject) && (target.checkAttribute("Container")) && !(target.checkAttribute("Locked"))) {
            target.contents.push(origin.contents[0])
            origin.contents.splice(0, 1)
            return `The ${origin.map.get("Name")} poured the ${target.contents.at(-1).map.get("Name")} into the ${target.map.get("Name")}`
        } else {
            return `You can't pour into that.`
        }
}

function bucket(origin, target) {
    if (origin.contents.length > 0) {
        return pourInto(origin, target)
    } else {
        return takeFrom(gameState.water)(origin, target)
    }
}

function plant() {
    gameState.bucket.contents.splice(0, 1)
    gameState.currentRoom.roomItems.push(new gamePath("climable vines", "The vines are thick and green, and have a texture of treebark. They twist and cross across the stone.","The vines are thick and green, and have a texture of treebark. They twist and cross across the stone.", "Climable vines grow out of the planter in the north of the balcony.", "Climable vines grow from a planter in the balcony below", gameState.secondBalcony, false))
    return "Climable vines grow out of the planter at such a rate that they crack the sides of the planter."
}


function shortenName(ogName, fl) {
    if (ogName.split(" ").length > 1) { if (fl === 1) {return ogName.split(" ").at(-1)} else {return ogName.split(" ").at(0)}}
    else {return ogName}
}

function nameSearch(name, container=null) {
    if (container === null) {
        for (let item of gameState.currentRoom.roomItems) {
            if ((shortenName(item.map.get("Name"), 1) === name) || (item.map.get("Name") === name)) {
                return item
            } if ((item instanceof gameObject) && (item.checkAttribute("Container")) && !(item.checkAttribute("Locked"))) {
                recurse = nameSearch(name, item.contents)
                if (recurse != null) {
                    return recurse
                }
            }
        } for (let person of gameState.currentRoom.roomPeople) {
            if ((shortenName(person.map.get("Name"), 0) === name) || (shortenName(person.map.get("Name"), 1) === name) || (person.map.get("Name") === name) || (shortenName(person.map.get("Title"), 1) === name) || (person.map.get("Title") === name)) {
                return person
            }
        } for (let item of gameState.inventory) {
            if ((shortenName(item.map.get("Name"), 1) === name) || (item.map.get("Name") === name)) {
                return item
            } if ((item.checkAttribute("Container")) && !(item.checkAttribute("Locked"))) {
                for (let content of item.contents) {
                    if ((shortenName(content.map.get("Name"), 1) === name) || (content.map.get("Name") === name)) {
                        return content
                    }
                }
            }
        }
    } else {
        for (let obj of container) {
            if ((shortenName(obj.map.get("Name"), 1) === name) || (obj.map.get("Name") === name)) {
                return obj
            }
        }
    }
    return null
}

function checkVowel(word) {
    vowelList = ['a', 'e', 'i', 'o', 'u']
    return vowelList.includes(word[0])
}

function examineRoomItems(container) {
    let returnString = ""
    for (item of container) {
        returnString += " " + item.map.get("Room")
        if ((item instanceof gameObject) && (item.checkAttribute("Container")) && !(item.checkAttribute("Locked"))) {
            returnString += examineRoomItems(item.contents)
        }
    }
    return returnString
}

function list(array) {
    let returnString = ""
    for (let i=0; i < array.length; i++) {
        if (i > 0) {returnString += ","}
        if (i === array.length - 1) {returnString += " and"}
        if (checkVowel(array[i].map.get("Name"))) {
            returnString += ` an ${array[i].map.get("Name")}`
        } else {
            returnString += ` a ${array[i].map.get("Name")}`
        }
    }
    return returnString
}

function characterDies() {
    if (gameState.armor === null) {
        document.getElementById("mainText").style.backgroundColor = "lightcoral"
        document.getElementById("previousInputs").style.backgroundColor = "lightcoral"
        document.getElementById("commandHelp").style.backgroundColor = "lightcoral"
        document.getElementById("actionInput").style.backgroundColor = "lightcoral"
        document.getElementById("actionSubmit").style.backgroundColor = "lightcoral"
        gameState.dead = true
        return "<br>YOU DIE."
    } else {
        gameState.armor = null
        return "<br>Your armor saves you from death, for now, but now it's broken. Best be careful."
    }
}

function checkInput() {
    let input = document.getElementById("actionInput").value;
    document.getElementById("actionInput").value = "";
    gameState.inputText += `<br>${input}`
    document.getElementById("previousInputs").innerHTML = gameState.inputText;
    let words = input.toLowerCase().split(" ");
    if (words[0] === "examine") {
        if (!(gameState.dead)) {
            if (words.length > 2) {
                words[1] = words[1] + " " + words[2]
                words.splice(2, 1)
            }
            if ((words[1] === "room") || (nameSearch(words[1]) === currentRoom)) {
                gameState.descriptionText += `<br>${gameState.currentRoom.map.get("Main")}`
                gameState.descriptionText += examineRoomItems(gameState.currentRoom.roomItems)
                gameState.descriptionText += examineRoomItems(gameState.currentRoom.roomPeople)
            } else {
                exObj = nameSearch(words[1])
                if (exObj != null) {gameState.descriptionText += `<br>${exObj.map.get("Main")}`}
                else {gameState.descriptionText += `<br>That item cannot be found.`}
            }
        } else {
            gameState.descriptionText += `<br>You can't look at anything much, you're dead!`
        }
    } else if (words[0] === "take") {
        if (!(gameState.dead)) {
            if (words.length > 2) {
                words[1] = words[1] + " " + words[2]
                words.splice(2, 1)
            }
            tkObj = nameSearch(words[1])
            if (tkObj instanceof gameObject) {
                gameState.descriptionText += `<br>${tkObj.pickUp()}`
            } else if (tkObj === null) {
                gameState.descriptionText += `<br>I'm sorry, but I can't find that anywhere.`
            } else {
                gameState.descriptionText += `<br>I'm sorry, but that's not an item.`
            }
        } else {
            gameState.descriptionText += `<br>I'm fairly certain that at this point, that would be grave-robbing`
        }
    } else if (words[0] === "use") {  
        if (!(gameState.dead)) {  
            onIndex = words.indexOf("on")
            if (onIndex > 2) {
                words[1] = words[1] + " " + words[2]
                words.splice(2, 1)
            } if (words.length > 4) {
                words[3] = words[3] + " " + words[4]
                words.splice(4, 1)
            }
            useObj = nameSearch(words[1])
            tarObj = nameSearch(words[3])
            if ((words[3] != "room") && (words[3] != "self")) {
                if (useObj === null) {gameState.descriptionText += `<br>${words[1]} can't be found`}
                else if (tarObj === null) {gameState.descriptionText += `<br>${words[3]} can't be found`}
                else {
                    if (gameState.inventory.includes(useObj)) {
                        gameState.descriptionText += `<br>${useObj.action(useObj, tarObj)}`
                    } else {
                        //document.getElementById("actionInput").placeholder = words[1]
                        gameState.descriptionText += `<br>You don't have the ${useObj.map.get("Name")}`
                    }
                }
            } else if (words[3] === "self") {
                if (useObj === null) {gameState.descriptionText += `<br>${words[1]} can't be found`}
                else {
                    if (gameState.inventory.includes(useObj)) {
                        gameState.descriptionText += `<br>${useObj.action(useObj, useObj)}`
                    } else {
                        //document.getElementById("actionInput").placeholder = words[1]
                        gameState.descriptionText += `<br>You don't have the ${useObj.map.get("Name")}`
                    }
                }
            } else {
                if (useObj === null) {gameState.descriptionText += `<br>${words[1]} can't be found`}
                else {
                    if (gameState.inventory.includes(useObj)) {
                        gameState.descriptionText += `<br>${useObj.action()}`
                    } else {
                        //document.getElementById("actionInput").placeholder = words[1]
                        gameState.descriptionText += `<br>You don't have the ${useObj.map.get("Name")}`
                    }
                }
            }
        } else {
            gameState.descriptionText += `<br>If you ask the worms real nicely, maybe they'll do that for you. Cause buddy, you're dead`
        }
    } else if (words[0] == "enter") {
        if (!(gameState.dead)) {
            if (words.length > 2) {
                words[1] = words[1] + " " + words[2]
                words.splice(2, 1)
            }
            movObj = nameSearch(words[1])
            if ((movObj instanceof gamePath)) {
                gameState.descriptionText += `<br>${movObj.moveThrough()}`
            } else {
                gameState.descriptionText += `<br>${words[1]} is not a viable path`
            }
        } else {
            gameState.descriptionText += `<br>The only place you're going is into the light.`
        }
    } else if (words[0] === "drop") {
        if (!(gameState.dead)) {
            if (words.length > 2) {
                words[1] = words[1] + " " + words[2]
                words.splice(2, 1)
            }
            dropObj = nameSearch(words[1])
            if ((dropObj != null) && (dropObj instanceof gameObject)) {
                gameState.descriptionText += `<br>${dropObj.putDown()}`
            }
        } else {
            gameState.descriptionText += `<br>Yeah, you don't have much choice in this matter. You've already dropped everything. You. DIED!`
        }
    } else if ((words[0] === "view") && (words[1] === "inventory")) {
        if (!(gameState.dead)) {
            if (gameState.inventory.length === 0) {
                gameState.descriptionText += `<br>You're inventory is empty`
            }else if (gameState.inventory.length === 1) {
                if (checkVowel(gameState.inventory[0].map.get("Name"))) {gameState.descriptionText += `<br>You have an ${gameState.inventory[0].map.get("Name")} in your inventory`}
                else {gameState.descriptionText += `<br>You have a ${gameState.inventory[0].map.get("Name")} in your inventory`}
            } else {
                gameState.descriptionText += `<br>You have${list(gameState.inventory)}.`
            }
            if (gameState.armor != null) {
                gameState.descriptionText += ` You are wearing ${gameState.armor.map.get("Name")}.`
            }
        } else {
            gameState.descriptionText += `<br>Don't you know you can't take any of this with you?`
        }
    } else if (words[0] === "talk") {
        if (!(gameState.dead)) {
            if (words.length > 2) {
                words[1] = words[1] + " " + words[2]
                words.splice(2, 1)
            }
            talker = nameSearch(words[1])
            if (talker instanceof gamePerson) {
                gameState.descriptionText += `<br>${talker.talk()}`
            } else {
                gameState.descriptionText += `<br>You can't talk to that, it's not a person`
            }
        } else {
            gameState.descriptionText += `<br>Sure, you can talk - with whom? Marley? Casper? Banquo? Obi-wan Kenobi?`
        }
    } else if (words[0] === "place") {
        if (!(gameState.dead)) {
            onIndex = words.indexOf("in")
            if (onIndex > 2) {
                words[1] = words[1] + " " + words[2]
                words.splice(2, 1)
            } if (words.length > 4) {
                words[3] = words[3] + " " + words[4]
                words.splice(4, 1)
            }
            invObj = nameSearch(words[1], gameState.inventory)
            conObj = nameSearch(words[3], gameState.currentRoom.roomItems)
            if ((invObj != null) && (conObj != null)) {
                if ((conObj instanceof gameObject) && (conObj.checkAttribute("Container")) && !(conObj.checkAttribute("Locked"))) {
                    conObj.placeInside(invObj)
                    gameState.descriptionText += `<br> You place the ${invObj.map.get("Name")} inside the ${conObj.map.get("Name")}`
                } else {
                    gameState.descriptionText += `<br>You can't place items inside the ${conObj.map.get("Name")}`
                }
            } else if (invObj === null) {
                gameState.descriptionText += `<br>No objects by the name of ${words[1]} in your inventory`
            } else if (conObj === null) {
                gameState.descriptionText += `<br>No objects by the name of ${words[3]} in your inventory`
            }
        } else {
            gameState.descriptionText += `<br>With what hands, buster? You're dead.`
        }
    } else if (words[0] === "die") {
        gameState.descriptionText += `<br>Sure, if you really want to.`
        gameState.descriptionText += characterDies()
    } else if (words[0] === "search") {
        if (!(gameState.dead)) {
            if (words.length > 2) {
                words[1] = words[1] + " " + words[2]
                words.splice(2, 1)
            }
            searchObj = nameSearch(words[1])
            if ((searchObj != null) && (searchObj instanceof gamePerson)) {
                if (searchObj.isDead) {
                    gameState.currentRoom.roomItems = gameState.currentRoom.roomItems.concat(searchObj.inventory)
                    gameState.descriptionText += `<br>The ${searchObj.map.get("Title")} had${list(searchObj.inventory)}`
                } else {
                    gameState.descriptionText += `<br>That guy's not dead.`
                }
            } else {
                gameState.descriptionText += `<br>I'm sorry, could you say that one more time?`
            }
        }else {
            gameState.descriptionText += `<br>How about you do some soul-searching instead?`
        }
    } else {
        gameState.descriptionText += `<br>That command is not recognized: "${input}"`
    } for (let person of gameState.currentRoom.roomPeople) {
        if ((person.action != null) && (person.isDead != true)) {
            gameState.descriptionText += `${person.action(person, words)}`
        }
    }
    document.getElementById("mainText").innerHTML = gameState.descriptionText;
    document.getElementById("mainText").scrollTop = document.getElementById("mainText").scrollHeight
}
