import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { SudokuBoard, type Board, type SudokuCell } from '@/components/SudokuBoard';
import { createPuzzle } from '@/utils/sudoku';
import { useLocalSearchParams, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const boardSize = width * 0.6;
const cellSize = boardSize / 9;

type Move = {
  row: number;
  col: number;
  previousValue: number | null;
  newValue: number | null;
  previousCandidates: Set<number>;
  newCandidates: Set<number>;
};

export default function GameScreen() {
  const router = useRouter();
  const { difficulty } = useLocalSearchParams<{ difficulty: 'easy' | 'medium' | 'hard' }>();

  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');
  const [board, setBoard] = useState<Board | null>(null);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [isPencilMode, setIsPencilMode] = useState(false);
  const [isAutoCandidateMode, setIsAutoCandidateMode] = useState(false);

  // Initialize the game when the component mounts
  useEffect(() => {
    if (difficulty) {
      const newBoard = createPuzzle(difficulty);
      setBoard(newBoard);
    }
  }, [difficulty]);

  const calculateAutoCandidates = () => {
    if (!board) return;
		const newBoard = board.map(cell => ({ ...cell }));
    
    // For each empty cell, calculate valid candidates
		const allValues = new Set<number>([1,2,3,4,5,6,7,8,9]);
    newBoard.forEach(cell => {
      if (cell.userValue === null) {
				const otherValues = new Set(newBoard.filter(c => (c.row === cell.row || c.col === cell.col || c.box === cell.box) && c.userValue !== null).map(c => c.userValue));
				const allowedValues = new Set([...allValues].filter(v => !otherValues.has(v)));
        cell.autoCandidates = allowedValues;
      }
    });
    setBoard(newBoard);
  };

  const handleCellPress = (row: number, col: number) => {
    if (gameState !== 'playing' || !board) return;
    const cell = board.find(c => c.row === row && c.col === col);

    // Update selected state for all cells
    const newBoard = board.map(cell => ({
      ...cell,
      isSelected: false,
      isHighlighted: false,
    }));
    const chosenCell = newBoard.find(c => c.row === row && c.col === col);
    if (chosenCell) {
      chosenCell.isSelected = true;
      
      // If the chosen cell has a value, highlight cells with the same value
      if (chosenCell.userValue !== null) {
        newBoard.forEach(cell => {
          if (cell.userValue === chosenCell.userValue) {
            cell.isHighlighted = true;
          }
        });
      }
    }
    setBoard(newBoard);
    setSelectedCell({ row, col });
  };

  const handleNumberPress = (num: number) => {
    if (gameState !== 'playing' || !board || !selectedCell) return;
    
    const { row, col } = selectedCell;
    const cell = board.find(c => c.row === row && c.col === col);

    const newBoard = board.map(c => ({ ...c }));
    const newCell = newBoard.find(c => c.row === row && c.col === col);
    if (!newCell) return;

    if (isPencilMode) {
      // Toggle candidate
      const newCandidates = new Set(newCell.userCandidates);
      if (newCandidates.has(num)) {
        newCandidates.delete(num);
      } else {
        newCandidates.add(num);
      }
      
      recordMove(row, col, newCell.userValue, newCell.userValue, newCell.userCandidates, newCandidates);
      newCell.userCandidates = newCandidates;
    } else {
      // Set value and store current candidates
      const previousValue = newCell.userValue;
      const previousCandidates = new Set(newCell.userCandidates);
      
      recordMove(row, col, previousValue, num, previousCandidates, previousCandidates);
      newCell.userValue = num;
      
      // Recalculate auto-candidates if auto-candidate mode is on
      if (isAutoCandidateMode) {
        calculateAutoCandidates();
      }
    }

    setBoard(newBoard);
    checkWinCondition(newBoard);
  };

  const handleDelete = () => {
    if (gameState !== 'playing' || !board || !selectedCell) return;
    
    const { row, col } = selectedCell;
    const cell = board.find(c => c.row === row && c.col === col);
    if (!cell || cell.initialValue !== null) return; // Don't modify initial values

    const newBoard = board.map(c => ({ ...c }));
    const newCell = newBoard.find(c => c.row === row && c.col === col);
    if (!newCell) return;

    // Clear userValue but preserve candidates
    recordMove(row, col, newCell.userValue, null, newCell.userCandidates, newCell.userCandidates);
    newCell.userValue = null;

    // Recalculate auto-candidates if auto-candidate mode is on
    if (isAutoCandidateMode) {
      calculateAutoCandidates();
    }

    setBoard(newBoard);
  };

  const handleUndo = () => {
    if (gameState !== 'playing' || !board || moveHistory.length === 0) return;
    
    const lastMove = moveHistory[moveHistory.length - 1];
    const newBoard = board.map(c => ({ ...c }));
    const cell = newBoard.find(c => c.row === lastMove.row && c.col === lastMove.col);
    if (!cell) return;
    
    cell.userValue = lastMove.previousValue;
    cell.userCandidates = new Set(lastMove.previousCandidates);
    
    setBoard(newBoard);
    setMoveHistory(prev => prev.slice(0, -1));
  };

  const recordMove = (
    row: number,
    col: number,
    previousValue: number | null,
    newValue: number | null,
    previousCandidates: Set<number>,
    newCandidates: Set<number>
  ) => {
    const move: Move = {
      row,
      col,
      previousValue,
      newValue,
      previousCandidates,
      newCandidates,
    };
    setMoveHistory(prev => [...prev, move]);
  };

  const checkWinCondition = (currentBoard: Board) => {
    const isWon = currentBoard.every(cell => cell.userValue === cell.answer);
    if (isWon) {
      setGameState('won');
    }
  };

  const renderNumberPad = () => {
    return (
      <View style={styles.numberPad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <TouchableOpacity
            key={num}
            style={[
              styles.numberButton,
              isPencilMode && styles.pencilModeButton
            ]}
            onPress={() => handleNumberPress(num)}
          >
            <Text style={[
              styles.numberButtonText,
              isPencilMode && styles.pencilModeButtonText
            ]}>
              {num}
            </Text>
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
          <TouchableOpacity
            style={[styles.numberButton, isPencilMode ? styles.pencilButtonActive : styles.pencilButton]}
            onPress={() => setIsPencilMode(!isPencilMode)}
          >
            <Text style={styles.pencilButtonText}>
              {isPencilMode ? '✎' : '✒'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.autoCandidateContainer}>
          <Text style={styles.autoCandidateLabel}>Auto candidate Mode</Text>
          <TouchableOpacity
            style={[styles.toggleButton, isAutoCandidateMode && styles.toggleButtonActive]}
            onPress={() => {
              setIsAutoCandidateMode(!isAutoCandidateMode);
              if (!isAutoCandidateMode) {
                calculateAutoCandidates();
              }
            }}
          >
            <View style={[styles.toggleSlider, isAutoCandidateMode && styles.toggleSliderActive]} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderGame = () => {
    if (!board) return null;
    
    return (
      <View style={styles.gameContainer}>
        <View style={styles.boardContainer}>
          <SudokuBoard
            board={board}
            onCellPress={handleCellPress}
            isAutoCandidateMode={isAutoCandidateMode}
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
  pencilModeButton: {
    backgroundColor: '#1E1E2D',
    borderColor: '#222244',
  },
  pencilModeButtonText: {
    fontSize: cellSize * 0.3,
    color: '#90CAF9',
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
    width: '31%',
  },
  undoButton: {
    backgroundColor: '#1E2D2D',
    borderColor: '#224444',
    width: '31%',
  },
  pencilButton: {
    backgroundColor: '#1E1E2D',
    borderColor: '#222244',
    width: '31%',
  },
  pencilButtonActive: {
    backgroundColor: '#2D2D4D',
    borderColor: '#444466',
    width: '31%',
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
  pencilButtonText: {
    fontSize: cellSize * 0.5,
    color: '#6B6BFF',
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
  autoCandidateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingHorizontal: 10,
  },
  autoCandidateLabel: {
    color: '#E0E0E0',
    fontSize: 16,
  },
  toggleButton: {
    width: 50,
    height: 24,
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 2,
		marginLeft: 10,
  },
  toggleButtonActive: {
    backgroundColor: '#4CAF50',
  },
  toggleSlider: {
    width: 20,
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
  },
  toggleSliderActive: {
    transform: [{ translateX: 26 }],
  },
}); 