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

    // Ensure the user entered a full word before checking it
    for (let c = 0; c < width; c++) {
        let currTile = document.getElementById(row.toString() + '-' + c.toString());
        let letter = currTile.innerText;
        guess += letter;
    }

    if (guess.length < width) {
        document.getElementById("answer").innerText = "Enter a full word!";
        return; // Stop processing if not all letters are entered
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

    let keyUpdates = {}; // Store letter states for keyboard update

    for (let c = 0; c < width; c++) {
        let currTile = document.getElementById(row.toString() + '-' + c.toString());
        let letter = currTile.innerText;

        setTimeout(() => {
            currTile.classList.add("flip");

            setTimeout(() => {
                if (word[c] === letter) {
                    currTile.classList.add("correct");
                    keyUpdates[letter] = "correct"; // Mark as correct
                    correct += 1;
                    letterCount[letter] -= 1;
                } else if (word.includes(letter) && letterCount[letter] > 0) {
                    currTile.classList.add("present");
                    // Only set as present if not already correct
                    if (!keyUpdates[letter]) keyUpdates[letter] = "present"; 
                    letterCount[letter] -= 1;
                } else {
                    currTile.classList.add("absent");
                    if (!keyUpdates[letter]) keyUpdates[letter] = "absent";
                }

                currTile.classList.remove("flip");

                // Move to the next row after the last tile finishes animation
                if (c === width - 1) {
                    updateKeyboardState(keyUpdates); // ✅ Update keyboard with final states

                    row += 1;
                    col = 0;

                    // ✅ **Move the win condition OUTSIDE the loop**
                    if (correct === width) {
                        gameOver = true;
                        setTimeout(showPopup, 500); // Show win popup
                        return; // 🚨 STOP EXECUTION IMMEDIATELY
                    }

                    // ❌ **Only trigger the lose condition if the word was NOT guessed correctly**
                    if (row === height && correct !== width) {
                        gameOver = true;
                        setTimeout(showLosePopup, 500);
                        return; // 🚨 STOP EXECUTION IMMEDIATELY
                    }
                }
            }, 200);
        }, c * 150);
    }
}



// Function to show the popup with animation
function showPopup() {
    let popup = document.getElementById("winPopup");
    popup.style.display = "block"; // Make it visible
    setTimeout(() => {
        popup.classList.add("show"); // Add animation class
    }, 10); // Small delay to allow transition
}

// Function to show the lose popup
function showLosePopup() {
    let popup = document.getElementById("losePopup");
    popup.style.display = "block"; // Make it visible
    setTimeout(() => {
        popup.classList.add("show"); // Add animation class
    }, 10);
}

// Function to close the popup smoothly
function closePopup() {
    let winPopup = document.getElementById("winPopup");
    let losePopup = document.getElementById("losePopup");

    // Add "hide" class to start shrinking animation
    if (winPopup.classList.contains("show")) {
        winPopup.classList.add("hide");
        setTimeout(() => {
            winPopup.classList.remove("show", "hide");
            winPopup.style.display = "none"; // Hide completely after animation
        }, 400); // Match the transition duration
    }

    if (losePopup.classList.contains("show")) {
        losePopup.classList.add("hide");
        setTimeout(() => {
            losePopup.classList.remove("show", "hide");
            losePopup.style.display = "none";
        }, 400);
    }
}

function updateKeyboardState(keyUpdates) {
    for (let letter in keyUpdates) {
        let keyTile = document.getElementById("Key" + letter.toUpperCase());

        if (keyUpdates[letter] === "correct") {
            keyTile.classList.remove("present", "absent");
            keyTile.classList.add("correct");
        } else if (keyUpdates[letter] === "present") {
            if (!keyTile.classList.contains("correct")) {
                keyTile.classList.remove("absent");
                keyTile.classList.add("present");
            }
        } else if (keyUpdates[letter] === "absent") {
            if (!keyTile.classList.contains("correct") && !keyTile.classList.contains("present")) {
                keyTile.classList.add("absent");
            }
        }
    }
}
