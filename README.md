Files:

- game.ts
- game.js

Instructions:

- Run `game.js` with Node by invoking `node`.
- Run `game.ts` with Node by invoking `npx tsx game.ts`. You will need a TypeScript execution environment like `ts-node` or `tsx`. Install it with `npm i -D tsx` or `yarn -D tsx`.

Conditions:

- A deck has 4 suits and 13 rank cards.
- The ranking of suits is Spades > Hearts > Clubs > Diamonds.
- Multiple decks may be used for the game.
- There can be 4 to N players.
- Players draw a card from the deck each round.
- Players who are not the first to draw can choose to skip their turn.
- All drawn cards must be shown.
- Players with the highest scoring card will win the round and score a point.
- Joint scoring applies if two players draw the same highest card (in the event of multiple decks).
- The game ends if there are not enough cards to be dealt to all players in a single round or if the cards are exhausted.
- A scoreboard of the overall point tally should be shown at the end of the game.

Notes:

- The data structures, functions, and tests are all colocated in a single script.
- The test cases are commented out but can be uncommented if you wish to run them. The expected results are annotated for each case.
- The test cases are non-exhaustive due to time constraints; any uncaught edge cases will be described here or in the code as comments.
- We do not test for skipping since it isn't deterministic when a player will skip.
- The program does not account for invalid input types.
