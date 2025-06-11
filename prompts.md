# Prompts

## Rule
This file should be updated with each new prompt given to the AI assistant. Each prompt should be added as a new section with a timestamp.

## Initial Prompts
We are going to make a sudoku game. Start by adding buttons to allow the user to initiate an Easy, Medium, or Hard game.

Yes, proceed with implementing the Sudoku game board and logic.


The numbers on the number pad are not changing the value in the cells. They should. Also, move the number pad to a grid on the right side of the main board.


Leave the difficulty selector on the main index.tsx page, but move all of the sudoku and game functionality to a new screen and update the index.tsx to route to that new file when starting a new game of the chosen difficulty level

If the user makes an incorrect guess, immediately change the font color to red for the selected cell


The game is not keeping track of the solved board properly because it's incorrectly saying all guesses are incorrect


Change the createPuzzle logic to return both the solved board and the board with the numbers removed for the user to play with.  When the user enters a guess into the UI, it should check against the solved board to determine if the guess is correct or not and change color accordingly.


We are going to implement Sudoku Pen and Pencil modes.
- Pen and Pencil toggle buttons should be shown above the number pad and the same width as the delete and undo buttons
- When the user is in Pen mode, values will be entered into a cell when a number is chosen
- When the user is in Pencil mode, the following will happen:
-- The font on the number pad will be smaller
-- Numbers the user chooses will be updated as potential candidates in the cell, appearing in a 3x3 grid inside of the cell
-- If the cell has an actual value either initially, or one entered by the user, always show the value and never the candidate grid

 

We're going to refactor the existing code. Instead of using multiple boards, we are going to only use one Board object to represent the state of the game. Each cell of the board should contain the following information:
- answer (from the solution)
- initialValue (the same as the answers, with some of the values removed, depending on the difficulty level)
- userValue (values that the user enters in pen)
- userCandidates (values that the user enters in pencil)
- autoCandidates (will be used later)
- autoCandidatesRemoved (will be used later)
- isSelected (true when the user selects the cell in the UI)
- isCorrect (true when userValue == answer)

User interactions should update those fields instead of managing values in different boards like it does now.

Show the pencil values as a 3x3 grid within the cells

When the user is in pencil mode, make the numbers on the number pad smaller and when the user is not in pencil mode, make the icon look like a pen.


Change the createPuzzle function to return a single board object with the answer and initialValues set instead of returning two different boards

Change the SudokuCell interface to also include the row and column values for the cell and use those values when in calculations instead of calculating positions.


Add box to the SudokuCell properties after col to keep track of which box the cell is in (0 for top left 3x3 box and 8 for bottom right 3x3 box)

Since we're keeping track of the row and col as attributes of teh SudokuCell, we don't need the SudokuBoard to be a two-dimensional array.  Change the exported type to be a single array (which will be 81 SudokuCell objects).



We're going to add an auto-candidate feature.
- Place a toggle slider button below the delete/undo/pencil buttons with the label "Auto candidate Mode" (default = off)
- When Auto-candidate is off, the potential values in the null cells should come from the userCandidates set like it does already
- When the user turns Auto-candidate on, do the following:
-- For all cells that do not have a userValue, calculate valid potential values for the cell given the known values in the board and add the possible numbers to autoCandidates 
-- Display the autoCandidates in the null cells instead of the userCandidates
-- If the user enters a userValue into a cell while autoCandidate is turned on, recalculate the potential values for the candidate cells again, taking into account the updated userValue
- We will handle user editing the autoCandidate values later.

Don't Calculate auto-candidates whenever the board changes.  Only calculate auto-candidates when either:
- the user has toggled the Auto Candidate Mode from Off to On 
or
- the user changes or deletes the userValue of a cell while isAutoCandidateMode = true

