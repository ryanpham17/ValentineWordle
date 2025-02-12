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

    // Create the keyboard
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

            // Ensure the Enter key gets the correct ID
            if (key === "Enter") {
                keyTile.id = "Enter";
            }
            // Handle backspace key
            else if (key === "⌫") {
                keyTile.id = "Backspace";
            }
            // Handle regular letter keys
            else if ("A" <= key && key <= "Z") {
                keyTile.id = "Key" + key; // "Key" + "A";
            }

            keyTile.addEventListener("click", processKey);

            // Add the appropriate class based on the key type
            if (key === "Enter") {
                keyTile.classList.add("enter-key-tile");
            } else {
                keyTile.classList.add("key-tile");
            }

            keyboardRow.appendChild(keyTile);
        }
        document.body.appendChild(keyboardRow);
    }

    // Listen for Key Press (physical keyboard)
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

    guess = guess.toLowerCase();
    console.log(guess);

    if (!guessList.includes(guess)) {
        document.getElementById("answer").innerText = "Not in word list";
        return;
    }

    let correct = 0;
    let letterCount = {}; // Keep track of letter frequency
    for (let i = 0; i < word.length; i++) {
        let letter = word[i];
        letterCount[letter] = (letterCount[letter] || 0) + 1;
    }

    for (let c = 0; c < width; c++) {
        let currTile = document.getElementById(row.toString() + '-' + c.toString());
        let letter = currTile.innerText;

        setTimeout(() => {
            currTile.classList.add("flip"); // Start flipping

            setTimeout(() => {
                // Change color midway through the flip
                if (word[c] == letter) {
                    currTile.classList.add("correct");
                    document.getElementById("Key" + letter).classList.add("correct");
                    correct += 1;
                    letterCount[letter] -= 1;
                } else if (word.includes(letter) && letterCount[letter] > 0) {
                    currTile.classList.add("present");
                    document.getElementById("Key" + letter).classList.add("present");
                    letterCount[letter] -= 1;
                } else {
                    currTile.classList.add("absent");
                    document.getElementById("Key" + letter).classList.add("absent");
                }

                currTile.classList.remove("flip"); // Remove the flip class after animation

                // If the user wins, show the win popup
                if (correct === width) {
                    gameOver = true;
                    setTimeout(showPopup, 500);
                }

                // If this was the last row and the word is still not correct, show the lose popup
                if (row === height - 1 && correct !== width) {
                    gameOver = true;
                    setTimeout(showLosePopup, 500);
                }

                // Move to the next row after the last tile finishes animation
                if (c === width - 1) {
                    row += 1;
                    col = 0;
                }
            }, 200); // Midway flip for color change

        }, c * 150); // Overlapping animation starts 150ms apart
    }
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