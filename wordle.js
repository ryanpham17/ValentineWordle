var height = 6; // number of guesses
var width = 3; // length of the word

var row = 0; // current guess (attempt #)
var col = 0; // current letter for that attempt

var gameOver = false;
var wordList = ["yes"]; // Add some valid 3-letter words
function generateThreeLetterWords() {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const words = [];
    
    for (let i = 0; i < alphabet.length; i++) {
        for (let j = 0; j < alphabet.length; j++) {
            for (let k = 0; k < alphabet.length; k++) {
                words.push(alphabet[i] + alphabet[j] + alphabet[k]);
            }
        }
    }
    
    return words;
}

// Generate all 3-letter words
var threeLetterWords = generateThreeLetterWords();

// Your original guess list
var guessList = ["dog", "cat", "bat", "rat", "yes", "hey", "sat"];

// Adding the three-letter words to the list
guessList = guessList.concat(threeLetterWords);

var word = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase(); // randomly select a word
console.log(word);

window.onload = function () {
    initialize();
}

function initialize() {
    // Create the game board
    for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
            let tile = document.createElement("span");
            tile.id = r.toString() + "-" + c.toString();
            tile.classList.add("tile");
            tile.innerText = "";
            document.getElementById("board").appendChild(tile);
        }
    }

    // Create the key board
    let keyboard = [
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
        ["Enter", "Z", "X", "C", "V", "B", "N", "M", "⌫"]
    ];

    for (let i = 0; i < keyboard.length; i++) {
        let currRow = keyboard[i];
        let keyboardRow = document.createElement("div");
        keyboardRow.classList.add("keyboard-row");

        for (let j = 0; j < currRow.length; j++) {
            let keyTile = document.createElement("div");
            let key = currRow[j];
            keyTile.innerText = key;
            if (key == "Enter") {
                keyTile.id = "Enter";
            }
            else if (key == "⌫") {
                keyTile.id = "Backspace";
            }
            else if ("A" <= key && key <= "Z") {
                keyTile.id = "Key" + key; // "Key" + "A";
            }

            keyTile.addEventListener("click", processKey);

            if (key == "Enter") {
                keyTile.classList.add("enter-key-tile");
            } else {
                keyTile.classList.add("key-tile");
            }
            keyboardRow.appendChild(keyTile);
        }
        document.body.appendChild(keyboardRow);
    }

    // Listen for Key Press
    document.addEventListener("keyup", (e) => {
        processInput(e);
    })
}

function processKey() {
    e = { "code": this.id };
    processInput(e);
}

function processInput(e) {
    if (gameOver) return;

    if ("KeyA" <= e.code && e.code <= "KeyZ") {
        if (col < width) {
            let currTile = document.getElementById(row.toString() + '-' + col.toString());
            if (currTile.innerText == "") {
                currTile.innerText = e.code[3];
                col += 1;
            }
        }
    }
    else if (e.code == "Backspace") {
        if (0 < col && col <= width) {
            col -= 1;
        }
        let currTile = document.getElementById(row.toString() + '-' + col.toString());
        currTile.innerText = "";
    }
    else if (e.code == "Enter") {
        update();
    }

    if (!gameOver && row == height) {
        gameOver = true;
        showLosePopup();  // Show losing popup if all attempts are used
    }
}

function update() {
    let guess = "";
    document.getElementById("answer").innerText = "";

    // Concatenate letters from the current guess row
    for (let c = 0; c < width; c++) {
        let currTile = document.getElementById(row.toString() + '-' + c.toString());
        let letter = currTile.innerText;
        guess += letter;
    }

    guess = guess.toLowerCase(); // case sensitive
    console.log(guess);

    if (!guessList.includes(guess)) {
        document.getElementById("answer").innerText = "Not in word list";
        return;
    }

    // Start processing guess
    let correct = 0;
    let letterCount = {}; // keep track of letter frequency
    for (let i = 0; i < word.length; i++) {
        let letter = word[i];
        if (letterCount[letter]) {
            letterCount[letter] += 1;
        } else {
            letterCount[letter] = 1;
        }
    }

    // First iteration: check correct ones first
    for (let c = 0; c < width; c++) {
        let currTile = document.getElementById(row.toString() + '-' + c.toString());
        let letter = currTile.innerText;

        if (word[c] == letter) {
            currTile.classList.add("correct");
            let keyTile = document.getElementById("Key" + letter);
            keyTile.classList.remove("present");
            keyTile.classList.add("correct");
            correct += 1;
            letterCount[letter] -= 1;
        }
    }

    if (correct == width) {
        gameOver = true;
        showPopup();  // Show the popup when user wins
    }

    // Second iteration: mark incorrect position letters
    for (let c = 0; c < width; c++) {
        let currTile = document.getElementById(row.toString() + '-' + c.toString());
        let letter = currTile.innerText;

        if (!currTile.classList.contains("correct")) {
            if (word.includes(letter) && letterCount[letter] > 0) {
                currTile.classList.add("present");
                let keyTile = document.getElementById("Key" + letter);
                if (!keyTile.classList.contains("correct")) {
                    keyTile.classList.add("present");
                }
                letterCount[letter] -= 1;
            } else {
                currTile.classList.add("absent");
                let keyTile = document.getElementById("Key" + letter);
                keyTile.classList.add("absent");
            }
        }
    }

    updateKeyboardState();
    row += 1;
    col = 0;
}

// Function to show the popup
function showPopup() {
    document.getElementById("winPopup").style.display = "block";
}

// Function to show the lose popup
function showLosePopup() {
    document.getElementById("losePopup").style.display = "block";
}

// Function to close the popups
function closePopup() {
    document.getElementById("winPopup").style.display = "none";
    document.getElementById("losePopup").style.display = "none";
}


function updateKeyboardState() {
    // Update the keyboard keys to reflect the current state (correct, present, absent)
    for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
            let currTile = document.getElementById(r.toString() + '-' + c.toString());
            let letter = currTile.innerText;

            if (letter !== "") {
                let keyTile = document.getElementById("Key" + letter);

                // If the letter is already marked as correct (green), ensure it stays green
                if (currTile.classList.contains("correct")) {
                    keyTile.classList.add("correct");
                    keyTile.classList.remove("present", "absent");
                } 
                // If the letter is already marked as present (yellow), ensure it stays yellow
                else if (currTile.classList.contains("present")) {
                    keyTile.classList.add("present");
                    keyTile.classList.remove("correct", "absent");
                } 
                // If the letter is already marked as absent (dark gray), ensure it stays dark gray
                else if (currTile.classList.contains("absent")) {
                    keyTile.classList.add("absent");
                    keyTile.classList.remove("correct", "present");
                }
            }
        }
    }
}