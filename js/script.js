function getRandomNumber(top, step) {
    return Math.floor(Math.random()*top) * step
}

function capitalize(string) {
    return string[0].toUpperCase() + string.slice(1)
}

function checkVowel(word) {
    vowelList = ['a', 'e', 'i', 'o', 'u']
    return vowelList.includes(word[0])
}

function remove(array, item) {
    array.splice(array.indexOf(item), 1)
}

function getDescRecurse(container) {
    let rString = ""
    for (let whatever of container) {
        rString += ` ${whatever.rDesc}`
        if ((whatever instanceof item) && (whatever.checkAttr("Container")) && (whatever.checkAttr("Locked") === false)) {
            rString += getDescRecurse(whatever.contents)
        }
    }
    return rString
}

function shortenName(full_name) {
    let lst = full_name.split(" ")
    if (lst.length > 1) {
        return lst.at(-1)
    } else {
        return full_name
    }
}

function nameSearch(name, container=null) {
    if (name === undefined) {
        return "Please enter a valid object name."
    }
    let found = null
    let times = 0
    let sw = false
    if (shortenName(name) === name) {
        sw = true
    }
    if (name === "room") {return gameState.PC.room}
    if (name === "self") {return gameState.PC}
    if (container != null) {
        for (let whatever of container) {
            if (sw) {
                if (shortenName(whatever.name) === name) {
                    found = whatever
                    times += 1
                }
            } else {
                if (whatever.name === name) {
                    found = whatever
                    times += 1
                }
            }
        }
    } else {
        for (let i of gameState.PC.room.items) {
            if (sw) {
                if (shortenName(i.name) === name) {
                    found = i
                    times += 1
                }
            } else {
                if (i.name === name) {
                    found = i
                    times += 1
                }
            }
             if ((i.contents.length != 0) && (!(i.checkAttr("Locked")))) {
                recurse = nameSearch(name, i.contents)
                if (recurse instanceof gameObject) {
                    found = recurse
                    times += 1
                }
            }
        } for (let p of gameState.PC.room.people) {
            if (sw) {
                if (shortenName(p.name) === name) {
                    found = p
                    times += 1
                }
            } else {
                if (p.name === name) {
                    found = p
                    times += 1
                }
            }
        } for (let i of gameState.PC.inventory) {
            if (sw) {    
                if (shortenName(i.name) === name) {
                    found = i
                    times += 1
                }
            } else {
                if (i.name === name) {
                    found = i
                    times += 1
                }
            }
            if ((i.contents.length != 0) && (!(i.checkAttr("Locked")))) {
                recurse = nameSearch(name, i.contents)
                if (recurse instanceof gameObject) {
                    found = recurse
                    times += 1
                }
            }
        }
    }
    if (times < 1) {
        return `Couldn't find the ${name}.`
    } else if (times === 1) {
        return found
    } else {
        return `Multiple finds, please be more specific.`
    }
}

function list(array) {
    let returnString = ""
    for (let i=0; i < array.length; i++) {
        if (i > 0) {returnString += ","}
        if ((i === array.length - 1) && (array.length > 1)) {returnString += " and"}
        if (checkVowel(array[i].name)) {
            returnString += ` an ${array[i].name}`
        } else {
            returnString += ` a ${array[i].name}`
        }
    }
    return returnString
}

function insert(array, index, newItem) {
    let returnArray = []
    for (let i = 0; i < index; i++) {
        returnArray.push(array[i])
    }
    returnArray.push(newItem)
    for (let j = index; j < array.length; j++) {
        returnArray.push(array[j])
    }
    return returnArray
}


function scoopUp(origin, target, specific=null) {
    if ((target instanceof item) && (target.checkAttr("Container") && !(target.checkAttr("Locked")))) {
        if ((specific != null) && (target.contents.includes(specific))) {
            origin.contents.push(specific)
            remove(target.contents, specific)
            return `The ${origin.name} now has the ${origin.contents.at(-1).name}.`
        } else if (specific === null) {
            ind = getRandomNumber(target.contents.length, 1)
            origin.contents.push(target.contents[ind])
            target.contents.splice(ind, 1)
            return `The ${origin.name} now has the ${origin.contents.at(-1).name}.`
        } else {
            return `The ${origin.name} can't pick any of that up.`
        }
    } else {
        return `Can't take from the ${target.name}`
    }
}

function pourInto(origin, target, specific=null) {
    if ((target instanceof item) && (target.checkAttr("Container") && !(target.checkAttr("Locked"))))  {
        if (specific != null) {
            target.contents.push(specific)
            remove(origin.contents, specific)
            return `The ${target.name} now has the ${target.contents.at(-1).name}.`
        } else {
            ind = getRandomNumber(target.contents.length, 1)
            target.contents.push(origin.contents[ind])
            origin.contents.splice(ind, 1)
            return `The ${target.name} now has the ${target.contents.at(-1).name}.`
        }
    } else {
        return `Can't put into the ${target.name}.`
    }
}

function bucketStuff(target) {
    if (gameState.bucket.contents.includes(gameState.water)) {
        if (target === gameState.planter) {
            remove(gameState.bucket.contents, gameState.water)
            new path(PN2, LPD2, PRDA2, PRDI2, UPD2, gameState.r2, gameState.r3, false)
            gameState.planter.breaks()
            return "Climable vines grow out of the planter at such a rate that they break the sides of the planter."
        }
        return pourInto(gameState.bucket, target, gameState.water)
    } else {
        return scoopUp(gameState.bucket, target, gameState.water)
    }
}

function talkWorker() {
    gameState.r3.items.push(gameState.stool)
}

function stoolStuff(target) {
    if (target === gameState.r3) { 
        gameState.chute.toggleAttr("Collectable")
        remove(gameState.PC.inventory, gameState.stool)
        return `You set down the stool. Standing on it allows you to reach higher items in the room`
    } else if (target instanceof room) {
        return `You don't need to set that down in this room.`
    } else {
        return `Try using it on a room ;)`
    }
}

function lightsRoom(target) {
    if (!(target instanceof room)) {
        return "Try using it on the room instead ;)"
    } else if (target != gameState.r4) {
        return "This room is already lit."
    } else {
        gameState.r4.desc = RD42
        gameState.r4.items.push(gameState.button)
        gameState.r4.items.push(gameState.orange)
        gameState.gunman.rDesc = CDD41
        return "The light from the lantern reveals the rest of the room."
    }
}

function endsGame(endingObject) {
    document.getElementById("mainText").style.backgroundColor = "lightgreen"
    document.getElementById("previousInputs").style.backgroundColor = "lightgreen"
    document.getElementById("commandHelp").style.backgroundColor = "lightgreen"
    document.getElementById("actionInput").style.backgroundColor = "lightgreen"
    document.getElementById("actionSubmit").style.backgroundColor = "lightgreen"
    if (endingObject === gameState.button) {return `Suddenly, you appear at the base of the strange tower you've been trapped in. Remembering where you saw smoke, you set out in the direction of civilization.<br>Congradulations, you've completed the Ruthless Ending. Refresh the page to restart or bask in your dishonorable victory. There are three possible endings.`}
    else if (endingObject === gameState.chute) {
        if ((gameState.guard.isDead) || (gameState.guy.isDead) || (gameState.gunman.isDead)) {
            return `You parachute down the whole height of the strange tower and land on the ground. Remembering where you saw smoke, you set out in the direction of civilzation.<br>Congradulations, you've completed the Main Ending. Refresh the page to restart or bask in your cannonical ending. There are three possible endings.`
        } else {
            return `You parachute down the whole height of the strange tower and land on the ground. Remembering where you saw smoke, you set out in the direction of civilzation.<br>Congradulations, you've completed the Pacifict Ending. Refresh the page to restart or bask in your completely innocent ending. There are three possible endings.`
        }
    }
}

function parachuteStuff(input) {
    if (input != gameState.PC) {
        return "Try using it on yourself ;)"
    } else {
        return endsGame(gameState.chute)
    }
}

class dialogTree {
    constructor(words, responses=[], branches=[], effect=null) {
        this.words = words
        this.responses = responses
        this.branches = branches
        this.effect = effect
    }

    getOne() {
        if (this.effect != null) {this.effect()}
        let rString = this.words
        if (this.responses.length > 0) {
            rString += `<br>Responses: `
            for (let r = 0; r < this.responses.length; r++) {
                rString += `[${r}] ${this.responses[r]}`
            }
        }
        return rString
    }

    moveDown(index) {
        if (this.responses.length === 0) {
            return `This person has nothing more to say.`
        }
        if (index < this.responses.length) {
            let nextOne = this.branches[index]
            this.words = nextOne.words
            this.responses = nextOne.responses
            this.branches = nextOne.branches
            this.effect = nextOne.effect
            return this.getOne()
        } else {
            return `That is not a viable response.`
        }
    } 
}



class gameObject {
    constructor(name, description) {
        this.name = name
        this.desc = description
    }
}

class room extends gameObject {
    constructor(name, description, items=[], people=[]) {
        super(name, description)
        this.items = items
        this.people = people
    }

    add(thing) {
        if (thing instanceof person) {
            this.people.push(thing)
            return `${thing.name} added to ${this.name}`
        } else if (thing instanceof item) {
            this.items.push(thing)
            return `${thing.name} added to ${this.name}`
        } else {return `Can't add ${thing} to ${this.name}`}
    }
}

class person extends gameObject {
    constructor(name, description, roomDescription, currentRoom, health, deathDescriptions=[], items=[], dialog=null, armor=null, allegiance="none", activated=true, activationDescription=null) {
        super(name, description)
        this.rDesc = roomDescription
        this.room = currentRoom
        this.health = health
        this.dDescs = deathDescriptions
        this.inventory = items
        this.dialog = dialog
        this.armor = armor
        this.allegiance = allegiance
        this.activated = activated
        this.aDesc = activationDescription
        this.isDead = false
        this.lastStrike = null
        this.room.people.push(this)
        if (armor != null) {
            this.inventory.push(armor)
        }
    }

    talk() {
        if (this.dialog != null) {
            return this.dialog.getOne()
        } else {
            return "This person has nothing to say."
        }
    }
    
    respond(index) {
        return this.dialog.moveDown(index)
    }

    checkLife() {
        if (this.health <= 0) {
            this.isDead = true
            return `The ${this.name} is dead`
        } else {
            return ""
        }
    }

    add(thing) {
        if (thing instanceof item) {
            this.inventory.push(thing)
            return `Added ${thing.name} to ${this.name}`
        } else {return `Can't add ${thing} to ${this.name}`}
    }

    chooseWeapon() {
        let best = null
        for (let obj of this.inventory) {
            if (obj instanceof weapon) {
                if (best === null) {best = obj}
                else if (best.damage < obj.damage) {best = obj}
            }
        }
        return best
    }

    chooseTarget() {
        let best = null
        for (let target of this.room.people) {
            if (target.allegiance != this.allegiance) {
                if (best === null) {best = target}
                else if (best.health < target.health) {best = target}
            }
        }
        return best
    }

    choices() {
        let weaponChoice = this.chooseWeapon()
        let attackChoice = this.chooseTarget()
        if ((attackChoice != null) && (weaponChoice != null)) {
            return `<br>The ${this.name} decides to attack the ${attackChoice.name}. ${weaponChoice.action(attackChoice)}`
        } return ""//return `<br>${this.name} does nothing.`
    
    }

    checkAlli() {
        if ((this.allegiance === "friendly") && (gameState.PC.inventory.includes(this.lastStrike))) {
            gameState.PC.allegiance = "none"
        }
    }

}

class item extends gameObject {
    constructor(name, description, roomDescription, attributes = [], action=null) {
        super(name, description)
        this.rDesc = roomDescription
        this.attrs = attributes
        this.action = action
        this.contents = []
    }

    checkAttr(attr) {
        return this.attrs.includes(attr)
    }

    toggleAttr(attr) {
        if (this.checkAttr(attr)) {
            remove(this.attrs, attr)
            return `Removed ${attr} from the ${this.name}`
        } else {
            this.attrs.push(attr)
            return `Added ${attr} to the ${this.name}`
        }
    }

    placeInside(obj) {
        if (this.attrs.includes("Container")) {
            this.contents.push(obj)
            obj.rDesc = `A ${obj.name} lies inside a ${this.name}.`
            return `Placed the ${obj.name} inside the ${this.name}.`
        } return `Can't place items in the ${this.name}.`
    }

    pickUp(perp) {
        if ((perp.inventory.includes(this)) || (!(gameState.PC.room.items.includes(this)))) {
            return `Can't pick up the ${this.name}`
        } else {
            if (this.attrs.includes("Collectable")) {
                perp.add(this)
                remove(gameState.PC.room.items, this)
                return `Picked up the ${this.name}`
            } return `Can't pick up the ${this.name}`
        }
    }

    putDown(perp) {
        if ((perp.inventory.includes(this))) {
            remove(perp.inventory, this)
            perp.room.add(this)
            if (perp.armor === this) {
                perp.armor = null
            }
            return `Put down the ${this.name}`
        } return `You don't hav the ${this.name}`
    }

    breaks() {
        let rString = ""
        this.rDesc = this.bDesc
        if (this.checkAttr("Container")) {
            for (let content of this.contents) {gameState.PC.room.add(content);}
            rString = `Out of the ${this.name} falls ${list(this.contents)}.`
        }
        remove(gameState.PC.room.items, this)
        delete this
        return `The ${this.name} breaks. ${rString}`
    }
}

class weapon extends item {
    constructor(name, description, roomDescription, damage, weaponStyle, attributes=["Collectable"]) {
        super(name, description, roomDescription, attributes)
        this.action = this.attack
        this.style = weaponStyle
        this.damage = damage
    }

    attack(target) {
        if (target instanceof person) {
            target.lastStrike = this
            let AN = 0
            if (target.armor != null) {
                AN = target.armor.rating
            }
            if ((typeof this.damage === "number") || (Array.isArray(this.damage) && (this.damage.length === 1))) {
                target.health -= (this.damage - AN)
                if (AN > 0) {return `The ${this.name} delt ${this.damage} damage to the ${target.name}. The ${target.name}'s ${target.armor.name} reduces the damage to ${(this.damage - AN)}`}
                else {return `The ${this.name} delt ${this.damage} damage to the ${target.name}.`}
            } else if ((Array.isArray(this.damage)) && (this.damage.length === 2)) {
                let d = (getRandomNumber((this.damage[1]-this.damage[0]), 1) + this.damage[0])
                let da = d - AN
                if (da < 0) {da = 0}
                target.health -= da
                if(da != d) {return `The ${this.name} delt ${d} damage to the ${target.name}. The ${target.name}'s ${target.armor.name} reduces the damage to ${da}.`}
                else {return `The ${this.name} delt ${d} damage to the ${target.name}.`}
            } else if ((Array.isArray(this.damage)) && (this.damage.length > 2)) {
                let d = (this.damage[getRandomNumber(this.damage.length), 1])
                let da = d - AN
                if (da < 0) {da = 0}
                target.health -= da
                if (da != d) {return `The ${this.name} delt ${d} damage to the ${target.name}. The ${target.name}'s ${target.armor.name} reduces the damage to ${da}`}
                else {return `The ${this.name} delt ${d} damage to the ${target.name}.`}
            }
        } else if ((target instanceof item) && (target.checkAttr("Fragile"))) {
            return target.breaks()
        } else if (target instanceof item) {
            return `The ${target.name} doesn't break.`
        }
    }

}

class armor extends item {
    constructor(name, description, roomDescription, armor_rating, attributes=["Collectable"]) {
        super(name, description, roomDescription, attributes)
        this.action = this.don_doff
        this.rating = armor_rating
    }

    don(person) {
        if (person.armor === null) {
            person.armor = this
            return `The ${person.name} is now wearing the ${this.name}`
        } else {
            return `That ${person.name} is already wearing the ${person.armor.name}`
        }
    }

    doff(person) {
        if (person.armor != null) {
            person.armor = null
            return `The ${person.name} is no longer wearing the ${this.name}`
        } else {
            return `The ${person.name} wasn't wearing the ${this.name}`
        }
    }

    don_doff(person) {
        if (person.armor === null) {
            person.armor = this
            return `The ${person.name} is now wearing the ${this.name}`
        } else {
            if (person.armor === this) {
                person.armor = null
                return `The ${person.name} is no longer wearing the ${this.name}`
            } else {
                return `The ${person.name} wasn't wearing the ${this.name}`
            }
        }
    }
}

class path extends item {
    constructor(name, description, roomDescription, inactiveDescription1, inactiveDescription2, location, destination, locked=false) {
        super(name, description, roomDescription)
        this.IRDesc = inactiveDescription1
        this.ILDesc = inactiveDescription2
        this.location = location
        this.destination = destination
        this.locked = locked
        if (this.location != null) {this.location.items = insert(this.location.items, 0, this)}
        if (this.destination != null) {this.destination.items = insert(this.destination.items, 0, this)}
    }

    toggleLock() {
        let temp = this.desc
        this.desc = this.ILDesc
        this.ILDesc = temp
        if (this.locked) {
            this.locked = false
            return `The ${this.name} is no longer locked.`
        } else {
            this.locked = true
            return `The ${this.name} is now locked.`
        }
    }

    moveThrough(person) {
        if (this.locked) {
            return `The ${this.name} is locked`
        } else {
            //return `Leaving the ${this.location}, entering the ${this.destination}`
            remove(person.room.people, person)
            this.destination.add(person)
            if (person === gameState.PC) {
                gameState.PC.room = this.destination
                this.destination = this.location
                this.location = gameState.PC.room
                let temp = this.rDesc
                this.rDesc = this.IRDesc
                this.IRDesc = temp
                return `Leaving the ${this.destination.name}, entering the ${this.location.name}`
                //return `Entering the ${this.location}`
            } else {
                person.room = this.destination
                return `The ${target.name} has entered the ${this.location}`
            }
        }
    }
}

class key extends item {
    constructor(name, description, roomDescription, specific=null, attributes=["Collectable"]) {
        super(name, description, roomDescription, attributes)
        this.action = this.useKey
        this.specific = specific
    }

    useKey(target) {
        if (((this.specific != null) && (target === this.specific)) || (this.specific === null)) {
            if (target instanceof path) {return target.toggleLock()}
            else if (target instanceof item) {
                if (target.checkAttr("Container")) {
                    return target.toggleAttr("Locked")
                } else if (!(target.checkAttr("Collectable")) && (target.action != null)) {
                    return target.action(target)
                }
            }
        } else {
            return `The key doesn't work on the ${target.name}`
        } return `Something's gone wrong`
    }
}

class gameState {
    static inputText = ""
    static descriptionText = "Hello, and welcome to An Adventure in a Confused World: The Castle.<br><br>You awake blearily in an uncomfortable cot."
    static gameOn = true

    static lantern = new item(IN8, ID8, IRD8, ["Collectable"],lightsRoom)
    static orange = new item(IN10, ID10, IRD10)
    static button = new item(IN9, ID9, IRD9,[], endsGame)
    static card = new key(KN2, KD2, KRD2, gameState.button)
    static pistol = new weapon(WN4, WD4, WRD4, 100, "bullet")
    static sidearm = new weapon(WN5, WD5, WRD5, 110, "bullet")
    static r4 = new room(RN4, RD4)
    static sbDialog = new dialogTree(D41)
    static mgDialog = new dialogTree(D31)
    static gunman = new person(CN4, CD4, CRD4, gameState.r4, 30, [CDD4, CDD4, CDD4, CDD4, CDD4], [gameState.sidearm], gameState.sbDialog, null, "friendly")
    static guy = new person(CN3, CD3, CRD3, gameState.r4, 30, [CDDS3, CDDC3, CDDP3, CDDM3, CDDB3], [gameState.pistol, gameState.card, gameState.lantern], gameState.mgDialog, null, "friendly")
    
    static stool = new item(IN12, ID12, IRD12, ["Collectable"], stoolStuff)
    static workerDialog = new dialogTree(D51, [R51, R52], [new dialogTree(D53, [R53], [new dialogTree(D54, [], [], talkWorker)]), new dialogTree(D52)])
    static chute = new item(IN11, ID11, IRD11, [], parachuteStuff)
    static r3 = new room(RN3, RD3, [gameState.chute])
    static worker = new person(CN5, CD5, CRD5, gameState.r3, 75, [CDD5, CDD5, CDD5, CDD5, CDD5], [], gameState.workerDialog, null, "friendly")

    static mDoor = new path(PN3, LPD3, PRDA3, PRDI3, UPD3, gameState.r3, gameState.r4)

    static planter = new item(IN6, ID6, IRD6, ["Container"])
    static eyepiece = new item(IN7, ID7, IRD7)
    static plate = new armor(AN1, AD1, ARD1, 10)
    static sword = new weapon(WN2, WD2, WRD2, [40, 90], "slice")
    static r2 = new room(RN2, RD2, [gameState.planter, gameState.eyepiece])
    static guard = new person(CN2, CD2, CRD2,gameState.r2, 50, [CDDS2, CDDC2, CDDP2, CDDM2, CDDB2], [gameState.sword], null, gameState.plate, "hostile", false, CAD2)

    static water = new item(IN1, ID1, IRD1)
    static basin = new item(IN2, ID2, IRD2, ["Container"])
    static bucket = new item(IN3, ID3, IRD3, ["Collectable", "Container"],bucketStuff)
    static cot = new item(IN4, ID4, IRD4)
    static key = new key(KN1, KD1, KRD1)
    static mirror = new item(IN5, ID5, IRD5, ["Container", "Locked", "Fragile"])
    static rock = new weapon(WN1, WD1, WRD1, [30, 70], "crush")
    //static gun = new weapon("gun", "It's a gun", "There's also a gun", 10000, "bullet")

    static r1 = new room(RN1, RD1, [gameState.basin, gameState.cot, gameState.mirror, gameState.rock, gameState.bucket])
    static door = new path(PN1, LPD1, PRDA1, PRDI1, UPD1, gameState.r1, gameState.r2, true)
    static PC = new person(CN1, CD1, CRD1,gameState.r1, 100, [CDDS1, CDDC1, CDDP1, CDDM1, CDDB1],[],[],null, "friendly")

    static ham = new weapon(WN3, WD3, WRD3, 100000, "magic")


}

function initialize() {
    gameState.key.specific = gameState.door
    gameState.mirror.placeInside(gameState.key)
    gameState.basin.placeInside(gameState.water)
    document.getElementById("actionInput").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            if (document.getElementById("actionInput").value != "") {checkInput()}
        }
    })
}


function checkInput() {
    let input = document.getElementById("actionInput").value;
    document.getElementById("actionInput").value = "";
    gameState.inputText += `<br>${input}`
    document.getElementById("previousInputs").innerHTML = gameState.inputText;
    let words = input.toLowerCase().split(" ");
    let loud = false
    let timeConsuming = false
    if (gameState.gameOn === false) {
        gameState.descriptionText += `<br>The game's over, stop doing things.`
        document.getElementById("mainText").innerHTML = gameState.descriptionText;
        return
    }
    if (words[0] === "examine") {
        if (gameState.PC.isDead) {
            gameState.descriptionText += `<br>You can't look at anything much, you're dead!`
        } else {
            if (words.length > 2) {
                words[1] = words[1] + " " + words[2]
                words.splice(2, 1)
            }
            exObj = nameSearch(words[1])
            if (exObj instanceof room) {gameState.descriptionText += `<br>${exObj.desc} ${getDescRecurse(exObj.items)} ${getDescRecurse(exObj.people)}`}
            else if (exObj instanceof gameObject) {gameState.descriptionText += `<br>${exObj.desc}`}
            else {gameState.descriptionText += "<br>" + exObj}
        }
    } else if (words[0] === "use") {
        if (words.includes("on")) {
            if (gameState.PC.isDead) {
                gameState.descriptionText += `<br>If you ask the worms real nicely, maybe they'll do that for you. Cause buddy, you're dead`
            } else { 
                loud = true
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
                if (!(useObj instanceof item)) {gameState.descriptionText += `<br>${words[1]} can't be found`}
                else if (!(tarObj instanceof gameObject)) {gameState.descriptionText += `<br>${words[3]} can't be found`}
                else if (useObj.action === null) {gameState.descriptionText += `<br>The${useObj.name} does not have a usage.`}
                else {
                    if (gameState.PC.inventory.includes(useObj)) {
                        gameState.descriptionText += `<br>${useObj.action(tarObj)}`
                        timeConsuming = true
                    } else {
                        //document.getElementById("actionInput").placeholder = words[1]
                        gameState.descriptionText += `<br>You don't have the ${useObj.name}`
                    }
                }
            }
        } else {
            if (gameState.PC.isDead) {
                gameState.descriptionText += `<br>The only place you're going is into the light.`
            } else {
                if (words.length > 2) {
                    words[1] = words[1] + " " + words[2]
                    words.splice(2, 1)
                }
                movObj = nameSearch(words[1])
                if ((movObj instanceof path)) {
                    gameState.descriptionText += `<br>${movObj.moveThrough(gameState.PC)}`
                } else if (movObj instanceof gameObject) {
                    gameState.descriptionText += `<br>${movObj.name} is not a path`
                } else {
                    gameState.descriptionText += `<br>${movObj}`
                }
            }
        }
    } else if (words[0] === "enter") {
        if (gameState.PC.isDead) {
            gameState.descriptionText += `<br>The only place you're going is into the light.`
        } else {
            if (words.length > 2) {
                words[1] = words[1] + " " + words[2]
                words.splice(2, 1)
            }
            movObj = nameSearch(words[1])
            if ((movObj instanceof path)) {
                gameState.descriptionText += `<br>${movObj.moveThrough(gameState.PC)}`
            } else if (movObj instanceof gameObject) {
                gameState.descriptionText += `<br>${movObj.name} is not a path`
            } else {
                gameState.descriptionText += `<br>${movObj}`
            }
        }
    } else if ((words[0] === "take") || (words[0] === "grab")) {
        if (gameState.PC.isDead) {
            gameState.descriptionText += `<br>I'm fairly certain that at this point, that would be grave-robbing`
        } else {
            loud = true
            if (words.length > 2) {
                words[1] = words[1] + " " + words[2]
                words.splice(2, 1)
            }
            tkObj = nameSearch(words[1])
            if (tkObj instanceof item) {
                gameState.descriptionText += `<br>${tkObj.pickUp(gameState.PC)}`
                timeConsuming = true
            } else if (tkObj instanceof gameObject) {
                gameState.descriptionText += `<br>I'm sorry, but that's not an item.`
            } else {
                gameState.descriptionText += `<br>${tkObj}`
            }
        }
    } else if (words[0] === "drop") {
        if (gameState.PC.isDead) {
            gameState.descriptionText += `<br>Yeah, you don't have much choice in this matter. You've already dropped everything. You. DIED!`
        } else {
            loud = true
            if (!(gameState.dead)) {
                if (words.length > 2) {
                    words[1] = words[1] + " " + words[2]
                    words.splice(2, 1)
                }
                dropObj = nameSearch(words[1])
                if (dropObj instanceof item) {
                    gameState.descriptionText += `<br>${dropObj.putDown(gameState.PC)}`
                    timeConsuming = true
                }
            }
        }

    } else if ((words[0] === "view") && (words[1] === "inventory")) {
        if (gameState.PC.isDead) {
            gameState.descriptionText += `<br>Don't you know you can't take any of this with you?`
        } else {
            if (gameState.PC.inventory.length === 0) {
                gameState.descriptionText += `<br>You're inventory is empty`
            }else if (gameState.inventory.length === 1) {
                if (checkVowel(gameState.PC.inventory[0].name)) {gameState.descriptionText += `<br>You have an ${gameState.PC.inventory[0].name} in your inventory`}
                else {gameState.descriptionText += `<br>You have a ${gameState.PC.inventory[0].name} in your inventory`}
            } else {
                gameState.descriptionText += `<br>You have${list(gameState.PC.inventory)}.`
            }
            if (gameState.PC.armor != null) {
                gameState.descriptionText += ` You are wearing ${gameState.PC.armor.name}.`
            }
        }
    } else if ((words[0] === "view") && (words[1] === "health")) {
        gameState.descriptionText += `<br>Your current health is ${gameState.PC.health}.`
        if (gameState.PC.armor != null) {
            gameState.descriptionText += ` You are wearing ${gameState.PC.armor.name}.`
        }
    } else if (words[0] === "talk") {
        if (gameState.PC.isDead) {
            gameState.descriptionText += `<br>Sure, you can talk - with whom? Marley? Casper? Banquo? Obi-wan Kenobi?`
        } else {
            loud = true
            if (words.length > 2) {
                words[1] = words[1] + " " + words[2]
                words.splice(2, 1)
            }
            talker = nameSearch(words[1])
            if (talker instanceof person) {
                gameState.descriptionText += `<br>${talker.talk()}`
                timeConsuming = true
            } else {
                gameState.descriptionText += `<br>You can't talk to that, it's not a person`
            }
        }

    } else if (words[0] === "place") {
        if (gameState.PC.isDead) {
            gameState.descriptionText += `<br>With what hands, buster? You're dead.`
        } else {
            onIndex = words.indexOf("in")
            if (onIndex > 2) {
                words[1] = words[1] + " " + words[2]
                words.splice(2, 1)
            } if (words.length > 4) {
                words[3] = words[3] + " " + words[4]
                words.splice(4, 1)
            }
            invObj = nameSearch(words[1], gameState.inventory)
            conObj = nameSearch(words[3], gameState.PC.room.items)
            if ((invObj instanceof item) && (conObj instanceof item)) {
                if ((conObj.checkAttr("Container")) && !(conObj.checkAttr("Locked"))) {
                    conObj.placeInside(invObj)
                    gameState.descriptionText += `<br> You place the ${invObj.name} inside the ${conObj.name}`
                    timeConsuming = true
                } else {
                    gameState.descriptionText += `<br>You can't place items inside the ${conObj.name}`
                }
            } else if (invObj === null) {
                gameState.descriptionText += `<br>No objects by the name of ${words[1]} in your inventory`
            } else if (conObj === null) {
                gameState.descriptionText += `<br>No objects by the name of ${words[3]} in your inventory`
            }
        }

    } else if (words[0] === "die") {
        if (gameState.PC.isDead) {
            gameState.descriptionText += `<br>Wouldn't that be redundant?`
        } else {
            gameState.PC.health = 0
            gameState.PC.lastStrike = gameState.ham
        }

    } else if (words[0] === "search") {
        if (gameState.PC.isDead) {
            gameState.descriptionText += `<br>How about you do some soul-searching instead?`
        } else {
            if (words.length > 2) {
                words[1] = words[1] + " " + words[2]
                words.splice(2, 1)
            }
            searchObj = nameSearch(words[1])
            if ((searchObj instanceof person)) {
                if (searchObj.isDead) {
                    gameState.PC.room.items = gameState.PC.room.items.concat(searchObj.inventory)
                    gameState.descriptionText += `<br>The ${searchObj.name} had${list(searchObj.inventory)}`
                    timeConsuming
                } else {
                    gameState.descriptionText += `<br>That guy's not dead.`
                }
            } else {
                gameState.descriptionText += `<br>I'm sorry, could you say that one more time?`
            }
        }

    } else if ((words[0] === "respond") && (words[1] === "to")) {
        if (gameState.PC.isDead) {
            gameState.descriptionText += `<br>Yeah, how about you respond to your great-great-grandparents, I think they're calling you.`
        } else {if (words.includes("with")) {
                withIndex = words.indexOf("with")
                if (withIndex > 3) {
                    words[2] = words[2] + " " + words[3]
                    words.splice(3,1)
                }
                respObj = nameSearch(words[2])
                respOp = parseInt(words[4])
                if (respObj instanceof person) {
                    gameState.descriptionText += `<br>${respObj.respond(respOp)}`
                } else if (respObj instanceof gameObject) {
                    gameState.descriptionText += `<br>${respObj.name} is not a person`
                } else {
                    gameState.descriptionText += `<br>${words[2]} is not an object`
                }
            } else {
                gameState.descriptionText += `<br>You are missing the 'with' keyword, please try again`
            }
        }
    } else if ((words[0] === "attack") || (words[0] === "hit") || (words[0] === "strike") || (words[0] === "smack")) {
        if (gameState.PC.isDead) {
            gameState.descriptionText += `<br>Now would probably actually be a good time to start making peace.`
        } else {
            if (words.includes("with")) {
                withIndex = words.indexOf("with")
                if (withIndex > 2) {
                    words[1] = words[1] + " " + words[2]
                    words.splice(3,1)
                } if (words.length > 4) {
                    words[3] = words[3] + " " + words[4]
                    words.splice(4, 1)
                }
                tarObj = nameSearch(words[1])
                weapObj = nameSearch(words[3])
                if (((tarObj instanceof person) || (tarObj instanceof item)) && (weapObj instanceof weapon)) {
                    timeConsuming = true
                    gameState.descriptionText += `<br>${weapObj.attack(tarObj)}`
                } else if (tarObj instanceof person) {
                    gameState.descriptionText += `<br>${words[1]} is not a viable target.`
                    console.log(tarObj)
                } else {
                    gameState.descriptionText += `<br>${words[3]} is not a weapon.`
                    console.log(weapObj)
                }
            } else {
                if (words.length > 2) {
                    words[1] = words[1] + " " + words[2]
                    words.splice(2, 1)
                }
                tarObj = nameSearch(words[1])
                weapObj = gameState.PC.chooseWeapon()
                if (((tarObj instanceof person) || (tarObj instanceof item)) && (weapObj != null)) {
                    timeConsuming = true
                    gameState.descriptionText += `<br>${weapObj.attack(tarObj)}`
                } else if (weapObj === null) {
                    gameState.descriptionText += `<br>You don't have any weapons.`
                } else {
                    gameState.descriptionText += `<br>${words[1]} is not a viable target.`
                    console.log(tarObj)
                }
            }
        }
    } else {
        gameState.descriptionText += `<br>That command is not recognized: "${input}"`
    }
    document.getElementById("mainText").innerHTML = gameState.descriptionText;
    //document.getElementById("actionInput").placeholder = gameState.PC.room
    for (let npc of gameState.PC.room.people) {
        if (npc != gameState.PC) {
            if (!(npc.isDead)) {
                npc.checkLife()
                if (npc.isDead) {
                    gameState.descriptionText += `<br>The ${npc.name} is dead.`
                    if (npc.lastStrike.style === "slice") {npc.rDesc = npc.dDescs[0]}
                    else if (npc.lastStrike.style === "crush") {npc.rDesc = npc.dDescs[1]}
                    else if (npc.lastStrike.style === "pierce") {npc.rDesc = npc.dDescs[2]}
                    else if (npc.lastStrike.style === "magic") {npc.rDesc = npc.dDescs[3]}
                    else if (npc.laststrike.style === "bullet") {npc.rDesc = npc.dDescs[4]}
                } else if ((npc.activated) && (timeConsuming)) {gameState.descriptionText += npc.choices()}
                else {
                    if (!(npc.activated) && (loud === true)) {
                        gameState.descriptionText += `<br>The ${npc.name} notices you.`
                        npc.activated = true
                        if (npc.aDesc != null) {
                            npc.rDesc = npc.aDesc
                        }
                    }
                }
            }
        }
        npc.checkAlli()
    }
    if (gameState.PC.isDead === false) {
        gameState.PC.checkLife()
        if (gameState.PC.isDead) {
            document.getElementById("mainText").style.backgroundColor = "lightcoral"
            document.getElementById("previousInputs").style.backgroundColor = "lightcoral"
            document.getElementById("commandHelp").style.backgroundColor = "lightcoral"
            document.getElementById("actionInput").style.backgroundColor = "lightcoral"
            document.getElementById("actionSubmit").style.backgroundColor = "lightcoral"
            if (gameState.PC.lastStrike.style === "slice"){gameState.descriptionText += "<br>" + gameState.PC.dDescs[0]}
            else if (gameState.PC.lastStrike.style === "crush"){gameState.descriptionText += "<br>" + gameState.PC.dDescs[1]}
            else if (gameState.PC.lastStrike.style === "pierce"){gameState.descriptionText += "<br>" + gameState.PC.dDescs[2]}
            else if (gameState.PC.lastStrike.style === "magic"){gameState.descriptionText += "<br>" + gameState.PC.dDescs[3]}
            else if (gameState.PC.lastStrike.style === "bullet"){gameState.descriptionText += "<br>" + gameState.PC.dDescs[4]}
        }
    }
    document.getElementById("mainText").innerHTML = gameState.descriptionText;
    document.getElementById("mainText").scrollTop = document.getElementById("mainText").scrollHeight
}