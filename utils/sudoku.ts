import { type Board, type SudokuCell } from '@/components/SudokuBoard';

type CellValue = number | null;
type Board = CellValue[][];

// Generate a solved Sudoku board
const generateSolvedBoard = (): number[][] => {
  const board: number[][] = Array(9).fill(null).map(() => Array(9).fill(null));
  
  const isValid = (row: number, col: number, num: number): boolean => {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num) return false;
    }
    
    // Check column
    for (let x = 0; x < 9; x++) {
      if (board[x][col] === num) return false;
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[boxRow + i][boxCol + j] === num) return false;
      }
    }
    
    return true;
  };
  
  const solve = (row: number, col: number): boolean => {
    if (col === 9) {
      row++;
      col = 0;
    }
    
    if (row === 9) return true;
    
    if (board[row][col] !== null) {
      return solve(row, col + 1);
    }
    
    const nums = Array.from({ length: 9 }, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    
    for (const num of nums) {
      if (isValid(row, col, num)) {
        board[row][col] = num;
        if (solve(row, col + 1)) return true;
        board[row][col] = null;
      }
    }
    
    return false;
  };
  
  solve(0, 0);
  return board;
};

// Create a puzzle by removing numbers based on difficulty
const createPuzzle = (difficulty: 'easy' | 'medium' | 'hard'): Board => {
  const solvedBoard = generateSolvedBoard();
  
  const cellsToRemove = {
    easy: 3,
    medium: 40,
    hard: 50,
  }[difficulty];
  
  const positions = Array.from({ length: 81 }, (_, i) => i);
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  // Create the board as a flat array of cells
  const board: Board = [];
  for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
    for (let colIndex = 0; colIndex < 9; colIndex++) {
      const answer = solvedBoard[rowIndex][colIndex];
      const shouldRemove = positions.slice(0, cellsToRemove).includes(rowIndex * 9 + colIndex);
      const box = Math.floor(rowIndex / 3) * 3 + Math.floor(colIndex / 3);
      const initialValue = shouldRemove ? null : answer;

			board.push({
        row: rowIndex,
        col: colIndex,
        box,
        answer,
        initialValue,
        userValue: initialValue,
        userCandidates: new Set(),
        autoCandidates: new Set(),
        autoCandidatesRemoved: new Set(),
        isSelected: false,
      });
    }
  }
  
  return board;
};

export {
  type Board,
  type CellValue,
  createPuzzle,
}; 