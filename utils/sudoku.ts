type CellValue = number | null;
type Board = CellValue[][];

// Generate a solved Sudoku board
const generateSolvedBoard = (): Board => {
  const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
  
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
  const puzzle: Board = solvedBoard.map(row => [...row]);
  
  const cellsToRemove = {
    easy: 30,
    medium: 40,
    hard: 50,
  }[difficulty];
  
  const positions = Array.from({ length: 81 }, (_, i) => i);
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  for (let i = 0; i < cellsToRemove; i++) {
    const pos = positions[i];
    const row = Math.floor(pos / 9);
    const col = pos % 9;
    puzzle[row][col] = null;
  }
  
  return puzzle;
};

// Check if a move is valid
const isValidMove = (board: Board, row: number, col: number, num: number): boolean => {
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

// Check if the board is solved
const isBoardSolved = (board: Board): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) return false;
      if (!isValidMove(board, row, col, board[row][col]!)) return false;
    }
  }
  return true;
};

export {
  type Board,
  type CellValue,
  createPuzzle,
  isValidMove,
  isBoardSolved,
}; 