const Readline = require("readline");

// Represent suits with array to keep order.
const suits = ["♦", "♣", "♥", "♠"];
const ranks = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

// Generate a deck of cards and assign them values ranging from [1..52] by rank and suit.
const generateDeck = () => {
  const deck = [];
  let value = 1;

  for (const rank of ranks) {
    for (const suit of suits) {
      deck.push({
        suit,
        rank,
        value,
      });
      value++;
    }
  }
  return deck;
};

// Given a deck of cards, shuffle them and return an object with the shuffled cards and the total count.
const shuffleDeck = (deck) => {
  let shuffledDeck = deck
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  return {
    deck: shuffledDeck,
    totalCount: deck.length,
  };
};

// Borrow this function to read input from command line.
const readInput = (question) => {
  const read = Readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    read.question(question, (answer) => {
      read.close();
      resolve(answer);
    });
  });
};

// Initialize a card game and return the tally of scores.
const init = async () => {
  const deckInput = await readInput("Enter number of decks: ");
  const numDecks = Number(deckInput);

  if (numDecks <= 0) {
    console.log("Minimum of 1 deck required.");
    return;
  }

  const playerInput = await readInput("Enter number of players (min. 4): ");
  const numPlayers = Number(playerInput);

  if (numPlayers <= 3) {
    console.log("Minimum of 4 players required.");
    return [];
  }

  const skipInput = await readInput("Allow skipping (y/n)?: ");

  // Prep deck and commence game.
  const rawDeck = Array.from({ length: numDecks }, () => generateDeck()).flat();
  const shuffledDeckResponse = shuffleDeck(rawDeck);
  const deck = shuffledDeckResponse.deck;

  console.log(`Game prepped with: ${shuffledDeckResponse.totalCount} cards!`);
  console.log("======================");

  console.log(
    await game(numPlayers, deck, skipInput === "y" || skipInput === "Y")
  );
};

const game = async (numPlayers, deck, isSkipAllowed = false) => {
  const overallScores = Array(numPlayers).fill(0);
  let highestValueRoundCard = null;
  let highestValueRoundPlayers = [];

  let roundCounter = 0;

  while (deck.length > 0) {
    if (deck.length < numPlayers) {
      console.log("Insufficient cards left in the deck, terminating game.");
      break;
    }

    roundCounter++;
    console.log(`Round: ${roundCounter}`);
    console.log("======================");

    for (let i = 0; i < numPlayers; i++) {
      if (i !== 0 && isSkipAllowed) {
        const skip = await readInput(`Skip Player ${i + 1}'s draw (y/n)?: `);
        if (skip === "y" || skip === "Y") {
          console.log(`Player ${i + 1} skips!`);
          continue;
        }
      }

      const drawnCard = deck.shift();

      console.log(`Player ${i + 1} draws: ${drawnCard.suit} ${drawnCard.rank}`);

      if (
        !highestValueRoundCard ||
        highestValueRoundCard.value === drawnCard.value
      ) {
        highestValueRoundPlayers.push(i);
        highestValueRoundCard = drawnCard;
      }

      if (highestValueRoundCard.value < drawnCard.value) {
        highestValueRoundPlayers = [i];
        highestValueRoundCard = drawnCard;
      }
    }

    highestValueRoundPlayers.forEach((x) => overallScores[x]++);
    console.log(
      `Round winners: ${highestValueRoundPlayers
        .map((x) => `Player ${x + 1}`)
        .join(", ")}`
    );
    console.log("======================");

    highestValueRoundPlayers = [];
    highestValueRoundCard = null;
  }

  return overallScores;
};

init();
