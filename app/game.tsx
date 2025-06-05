import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { SudokuBoard } from '@/components/SudokuBoard';
import { createPuzzle, type Board, isValidMove, isBoardSolved } from '@/utils/sudoku';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function GameScreen() {
  const router = useRouter();
  const { difficulty } = useLocalSearchParams<{ difficulty: 'easy' | 'medium' | 'hard' }>();
  
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');
  const [initialBoard, setInitialBoard] = useState<Board | null>(null);
  const [userBoard, setUserBoard] = useState<Board | null>(null);
  const [solutionBoard, setSolutionBoard] = useState<Board | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [incorrectCells, setIncorrectCells] = useState<Set<string>>(new Set());

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
    
    // Create a new board with the deleted value
    const newUserBoard = userBoard.map(r => [...r]);
    newUserBoard[row][col] = null;
    
    // Update the user board
    setUserBoard(newUserBoard);
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
        <TouchableOpacity
          style={[styles.numberButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
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
    gap: 10,
  },
  numberButton: {
    width: 50,
    height: 50,
    backgroundColor: '#e3f2fd',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  numberButtonText: {
    fontSize: 24,
    color: '#2196f3',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
    marginTop: 10,
  },
  deleteButtonText: {
    fontSize: 32,
    color: '#f44336',
    fontWeight: 'bold',
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
  },
  newGameButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
  },
  newGameButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 