import readline from "readline";

// Represent suits with array to keep order.
const suits = ["♦", "♣", "♥", "♠"] as const;
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
] as const;

// Enforce union type.
type Suit = (typeof suits)[number];
type Rank = (typeof ranks)[number];

type Card = {
  suit: Suit;
  rank: Rank;
  value: number;
};

type Deck = Card[];

// Generate a deck of cards and assigned them values ranging from [1..52] by rank and suit.
export const generateDeck = (): Deck => {
  const deck: Deck = [];
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
export const shuffleDeck = (
  deck: Deck
): {
  deck: Deck;
  totalCount: number;
} => {
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
const readInput = (question: string) => {
  const read = readline.createInterface({
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
  // WARNING: readInput does not validate input type.
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

  if (numDecks <= 0) {
    console.log("Minimum of 1 deck required.");
    return;
  }

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

const game = async (numPlayers: number, deck: Deck, isSkipAllowed = false) => {
  // The overall tally of player scores.
  const overallScores = Array(numPlayers).fill(0);
  // The currently highest scored card of a given round.
  let highestValueRoundCard: Card | null = null;
  // The players who have drawn the highest scored card of a given round.
  let highestValueRoundPlayers: number[] = [];

  let roundCounter = 0;

  // Game continues until there are no cards left in the deck.
  while (deck.length > 0) {
    // Early exit if there are insufficient cards to be dealt to all players in a round.
    if (deck.length < numPlayers) {
      console.log("Insufficent cards left in the deck, terminating game.");
      break;
    }

    roundCounter++;
    console.log(`Round: ${roundCounter}`);
    console.log("======================");

    for (let i = 0; i < numPlayers; i++) {
      // Skipping is not permitted for the first player.
      if (i !== 0 && isSkipAllowed) {
        const skip = await readInput(`Skip Player ${i + 1}'s draw (y/n)?: `);
        if (skip === "y" || skip === "Y") {
          console.log(`Player ${i + 1} skips!`);
          continue;
        }
      }

      // Card draw.
      // https://stackoverflow.com/questions/65514481/typescript-says-array-pop-might-return-undefined-even-when-array-is-guaranteed
      const drawnCard = deck.shift() as Card;

      // Drawn cards must always be shown.
      console.log(`Player ${i + 1} draws: ${drawnCard.suit} ${drawnCard.rank}`);

      // If this is the first card drawn, or if a drawn card has the same value as the highest card, add
      // the drawing player into our tracker and update the highest drawn card.
      if (
        !highestValueRoundCard ||
        highestValueRoundCard.value === drawnCard.value
      ) {
        highestValueRoundPlayers.push(i);
        highestValueRoundCard = drawnCard;
      }

      // If we draw a card of higher value, nullify the player track, add the drawing player into the
      // cleaned tracker and update the highest drawn card.
      if (highestValueRoundCard.value < drawnCard.value) {
        highestValueRoundPlayers = [i];
        highestValueRoundCard = drawnCard;
      }
    }

    // Players who has drawn the highest valued card this round gets a score on their overall tally.
    highestValueRoundPlayers.forEach((x) => overallScores[x]++);
    console.log(
      `Round winners: ${highestValueRoundPlayers
        .map((x) => `Player ${x + 1}`)
        .join(", ")}`
    );
    console.log("======================");

    // Reset round.
    highestValueRoundPlayers = [];
    highestValueRoundCard = null;
  }

  return overallScores;
};

init();

// // Borrow this implementation of deep equality strictly for testing purposes.
// // Ideally rely on a well-maintained library for such functions.
// export const isEqual = <T>(a: T, b: T): boolean => {
//   if (a === b) {
//     return true;
//   }

//   const bothAreObjects =
//     a && b && typeof a === "object" && typeof b === "object";

//   return Boolean(
//     bothAreObjects &&
//       Object.keys(a).length === Object.keys(b).length &&
//       Object.entries(a).every(([k, v]) => isEqual(v, b[k as keyof T]))
//   );
// };

// // generateDeck tests.
// console.log(
//   generateDeck().some((x) => isEqual(x, { rank: "A", suit: "♦", value: 1 }))
// ); // true;
// console.log(
//   generateDeck().some((x) => isEqual(x, { rank: "J", suit: "♣", value: 42 }))
// ); // true;
// console.log(
//   generateDeck().some((x) => isEqual(x, { rank: "Q", suit: "♥", value: 47 }))
// ); // true;
// console.log(
//   generateDeck().some((x) => isEqual(x, { rank: "K", suit: "♠", value: 52 }))
// ); // true;
// console.log(
//   generateDeck().some((x) => isEqual(x, { rank: "K", suit: "♦", value: 1 }))
// ); // false;
// console.log(
//   generateDeck().some((x) => isEqual(x, { rank: "7", suit: "♦", value: 27 }))
// ); // false;
// console.log(
//   generateDeck().some((x) => isEqual(x, { rank: "A", suit: "♠", value: 52 }))
// ); // false;

// // shuffleDeck test.
// // A naive test to check if deck is actually shuffled by testing a shuffle against a sorted deck by value.
// console.log(
//   shuffleDeck(generateDeck()).deck.map((card) => card.value) ===
//     shuffleDeck(generateDeck())
//       .deck.map((card) => card.value)
//       .sort()
// ); // false;

// console.log(game(1, [])); // [0]
// console.log(game(8, [])); // [0, 0, 0, 0, 0, 0, 0, 0]
// console.log(game(1, [{ rank: "A", suit: "♠", value: 4 }])); // [1]
// console.log(
//   game(2, [
//     { rank: "A", suit: "♠", value: 4 },
//     { rank: "A", suit: "♠", value: 4 },
//   ])
// ); // [1, 1]
// console.log(
//   game(4, [
//     { rank: "K", suit: "♠", value: 52 },
//     { rank: "A", suit: "♠", value: 4 },
//     { rank: "A", suit: "♠", value: 4 },
//     { rank: "A", suit: "♠", value: 4 },
//   ])
// ); // [1, 0, 0, 0]
// console.log(
//   game(8, [
//     { rank: "A", suit: "♦", value: 1 },
//     { rank: "A", suit: "♦", value: 1 },
//     { rank: "K", suit: "♠", value: 52 },
//     { rank: "A", suit: "♦", value: 1 },
//     { rank: "A", suit: "♦", value: 1 },
//     { rank: "K", suit: "♠", value: 52 },
//     { rank: "A", suit: "♦", value: 1 },
//     { rank: "A", suit: "♦", value: 1 },
//   ])
// ); // [0, 0, 1, 0, 0, 1, 0, 0]
// console.log(
//   game(2, [
//     { rank: "A", suit: "♦", value: 1 },
//     { rank: "A", suit: "♦", value: 1 },
//     { rank: "K", suit: "♠", value: 52 },
//     { rank: "A", suit: "♦", value: 1 },
//     { rank: "A", suit: "♦", value: 1 },
//     { rank: "K", suit: "♠", value: 52 },
//     { rank: "A", suit: "♦", value: 1 },
//     { rank: "A", suit: "♦", value: 1 },
//   ])
// ); // [3, 3]
