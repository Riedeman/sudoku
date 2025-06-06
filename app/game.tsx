import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useState } from 'react';
import { SudokuBoard } from '@/components/SudokuBoard';
import { createPuzzle, type Board, isValidMove, isBoardSolved } from '@/utils/sudoku';
import { useLocalSearchParams, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const boardSize = width * 0.6;
const cellSize = boardSize / 9;

type Move = {
  row: number;
  col: number;
  previousValue: number | null;
  newValue: number | null;
};

export default function GameScreen() {
  const router = useRouter();
  const { difficulty } = useLocalSearchParams<{ difficulty: 'easy' | 'medium' | 'hard' }>();
  
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');
  const [initialBoard, setInitialBoard] = useState<Board | null>(null);
  const [userBoard, setUserBoard] = useState<Board | null>(null);
  const [solutionBoard, setSolutionBoard] = useState<Board | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [incorrectCells, setIncorrectCells] = useState<Set<string>>(new Set());
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);

  const recordMove = (row: number, col: number, newValue: number | null) => {
    if (!userBoard) return;
    
    const move: Move = {
      row,
      col,
      previousValue: userBoard[row][col],
      newValue
    };
    setMoveHistory(prev => [...prev, move]);
  };

  // Initialize the game when the component mounts
  useState(() => {
    if (difficulty) {
      const { puzzle, solution } = createPuzzle(difficulty);
      setInitialBoard(puzzle);
      setSolutionBoard(solution);
      setUserBoard(puzzle);
    }
  });

  const handleCellPress = (row: number, col: number) => {
    if (gameState !== 'playing' || !initialBoard || !userBoard) return;
    if (initialBoard[row][col] !== null) return; // Don't select initial values
    setSelectedCell({ row, col });
  };

  const handleNumberPress = (num: number) => {
    if (gameState !== 'playing' || !initialBoard || !userBoard || !selectedCell || !solutionBoard) return;
    
    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== null) return; // Don't modify initial values
    
    recordMove(row, col, num);
    
    // Check if the move is valid against the solution
    if (!isValidMove(userBoard, solutionBoard, row, col, num)) {
      // Mark the cell as incorrect
      setIncorrectCells(prev => new Set([...prev, `${row}-${col}`]));
    } else {
      // Remove the cell from incorrect cells if it was previously marked
      setIncorrectCells(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${row}-${col}`);
        return newSet;
      });
    }
    
    // Create a new board with the updated value
    const newUserBoard = userBoard.map(r => [...r]);
    newUserBoard[row][col] = num;
    
    // Update the user board
    setUserBoard(newUserBoard);
    
    // Check if the board is solved
    if (isBoardSolved(newUserBoard, solutionBoard)) {
      setGameState('won');
    }
  };

  const handleDelete = () => {
    if (gameState !== 'playing' || !initialBoard || !userBoard || !selectedCell) return;
    
    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== null) return; // Don't modify initial values
    
    recordMove(row, col, null);
    
    // Create a new board with the deleted value
    const newUserBoard = userBoard.map(r => [...r]);
    newUserBoard[row][col] = null;
    
    // Update the user board
    setUserBoard(newUserBoard);
  };

  const handleUndo = () => {
    if (gameState !== 'playing' || !userBoard || moveHistory.length === 0) return;
    
    // Get the last move
    const lastMove = moveHistory[moveHistory.length - 1];
    
    // Create a new board with the previous value
    const newUserBoard = userBoard.map(r => [...r]);
    newUserBoard[lastMove.row][lastMove.col] = lastMove.previousValue;
    
    // Update the user board
    setUserBoard(newUserBoard);
    
    // Remove the last move from history
    setMoveHistory(prev => prev.slice(0, -1));
    
    // Update incorrect cells
    setIncorrectCells(prev => {
      const newSet = new Set(prev);
      newSet.delete(`${lastMove.row}-${lastMove.col}`);
      return newSet;
    });
  };

  const renderNumberPad = () => {
    return (
      <View style={styles.numberPad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <TouchableOpacity
            key={num}
            style={styles.numberButton}
            onPress={() => handleNumberPress(num)}
          >
            <Text style={styles.numberButtonText}>{num}</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.numberButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.numberButton, styles.undoButton]}
            onPress={handleUndo}
            disabled={moveHistory.length === 0}
          >
            <Text style={[styles.undoButtonText, moveHistory.length === 0 && styles.disabledButtonText]}>↩</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderGame = () => {
    if (!initialBoard || !userBoard) return null;
    
    return (
      <View style={styles.gameContainer}>
        <View style={styles.boardContainer}>
          <SudokuBoard
            initialBoard={initialBoard}
            userBoard={userBoard}
            onCellPress={handleCellPress}
            selectedCell={selectedCell}
            incorrectCells={incorrectCells}
          />
        </View>
        <View style={styles.numberPadContainer}>
          {renderNumberPad()}
        </View>
      </View>
    );
  };

  const renderWinMessage = () => {
    return (
      <View style={styles.winContainer}>
        <Text style={styles.winText}>Congratulations! You solved the puzzle!</Text>
        <TouchableOpacity
          style={styles.newGameButton}
          onPress={() => router.back()}
        >
          <Text style={styles.newGameButtonText}>New Game</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {gameState === 'playing' && renderGame()}
      {gameState === 'won' && renderWinMessage()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  gameContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberPadContainer: {
    width: '30%',
    paddingLeft: 20,
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 5,
    width: '100%',
  },
  numberButton: {
    width: cellSize,
    height: cellSize,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  numberButtonText: {
    fontSize: cellSize * 0.4,
    color: '#E0E0E0',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: cellSize * 3 + 10,
    marginTop: 5,
  },
  deleteButton: {
    backgroundColor: '#2D1E1E',
    borderColor: '#442222',
    width: '48%',
  },
  undoButton: {
    backgroundColor: '#1E2D2D',
    borderColor: '#224444',
    width: '48%',
  },
  deleteButtonText: {
    fontSize: cellSize * 0.5,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  undoButtonText: {
    fontSize: cellSize * 0.5,
    color: '#6BFF6B',
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: '#666666',
  },
  winContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  winText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#E0E0E0',
  },
  newGameButton: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 10,
  },
  newGameButtonText: {
    color: '#E0E0E0',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 