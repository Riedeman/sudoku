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
  previousAutoCandidates: Set<number>;
  newAutoCandidates: Set<number>;
  previousAutoCandidatesRemoved: Set<number>;
  newAutoCandidatesRemoved: Set<number>;
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

  const calculateAutoCandidates = (currentBoard: Board) => {
    if (!currentBoard) return;
    const newBoard = currentBoard.map(cell => structuredClone(cell));
    
    // For each empty cell, calculate valid candidates
    const allValues = new Set<number>([1,2,3,4,5,6,7,8,9]);
    newBoard.forEach(cell => {
      if (cell.userValue === null) {
        const otherValues = new Set(newBoard.filter(c => (c.row === cell.row || c.col === cell.col || c.box === cell.box) && c.userValue !== null).map(c => c.userValue));
        const allowedValues = new Set([...allValues].filter(v => !otherValues.has(v) && !cell.autoCandidatesRemoved.has(v)));
        cell.autoCandidates = allowedValues;
      }
    });
    return newBoard;
  };

  const handleCellPress = (row: number, col: number) => {
    if (gameState !== 'playing' || !board) return;

    // Update selected state for all cells
    const newBoard = board.map(cell => {
      const clonedCell = structuredClone(cell);
      clonedCell.isSelected = false;
      clonedCell.isHighlighted = false;
      return clonedCell;
    });
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

const updateBoard = (newBoard: Board) => {
	if (isAutoCandidateMode) {
		const updatedBoard = calculateAutoCandidates(newBoard);
		if (updatedBoard) {
			setBoard(updatedBoard);
		}
	} else {
		setBoard(newBoard);
	}
}

  const handleNumberPress = (num: number) => {
    if (gameState !== 'playing' || !board || !selectedCell) return;
    
    const { row, col } = selectedCell;
    const newBoard = board.map(c => structuredClone(c));
    const newCell = newBoard.find(c => c.row === row && c.col === col);
		if (!newCell) return;

		const oldCell = structuredClone(newCell);
    if (isPencilMode) {
      if (isAutoCandidateMode) {
			if (newCell.autoCandidates.has(num)) {
          // Remove from autoCandidates and add to autoCandidatesRemoved
          newCell.autoCandidates.delete(num);
          newCell.autoCandidatesRemoved.add(num);
        } else if (newCell.autoCandidatesRemoved.has(num)) {
          // Remove from autoCandidatesRemoved and add back to autoCandidates
          newCell.autoCandidatesRemoved.delete(num);
          newCell.autoCandidates.add(num);
        }
			} else {
        // Toggle user candidate
        const newCandidates = new Set(newCell.userCandidates);
        if (newCandidates.has(num)) {
          newCandidates.delete(num);
        } else {
          newCandidates.add(num);
        }
        newCell.userCandidates = newCandidates;
      }
    } else {
      newCell.userValue = num;
    }
		recordMove(row, col, oldCell, newCell);
    updateBoard(newBoard);
    checkWinCondition(newBoard);
  };

  const handleDelete = () => {
    if (gameState !== 'playing' || !board || !selectedCell) return;
    
    const { row, col } = selectedCell;
    const selectedCellData = board.find(c => c.row === row && c.col === col);
    if (!selectedCellData || selectedCellData.initialValue !== null) return; // Don't modify initial values

    const newBoard = board.map(c => structuredClone(c));
    const newCell = newBoard.find(c => c.row === row && c.col === col);
    if (!newCell) return;

		const oldCell = structuredClone(newCell);
    newCell.userValue = null;
    recordMove(row, col, oldCell, newCell);
		updateBoard(newBoard);
  };

  const handleUndo = () => {
    if (gameState !== 'playing' || !board || moveHistory.length === 0) return;
    
    const lastMove = moveHistory[moveHistory.length - 1];
    const newBoard = board.map(c => structuredClone(c));
    const targetCell = newBoard.find(c => c.row === lastMove.row && c.col === lastMove.col);
    if (!targetCell) return;
    
    targetCell.userValue = lastMove.previousValue;
    targetCell.userCandidates = new Set(lastMove.previousCandidates);
    targetCell.autoCandidates = new Set(lastMove.previousAutoCandidates);
    targetCell.autoCandidatesRemoved = new Set(lastMove.previousAutoCandidatesRemoved);
    
    updateBoard(newBoard);
    setMoveHistory(prev => prev.slice(0, -1));
  };

  const recordMove = (
    row: number,
    col: number,
    oldCell: SudokuCell,
    newCell: SudokuCell
  ) => {
    const move: Move = {
      row,
      col,
      previousValue: oldCell.userValue,
      newValue: newCell.userValue,
      previousCandidates: new Set(oldCell.userCandidates),
      newCandidates: new Set(newCell.userCandidates),
      previousAutoCandidates: new Set(oldCell.autoCandidates),
      newAutoCandidates: new Set(newCell.autoCandidates),
      previousAutoCandidatesRemoved: new Set(oldCell.autoCandidatesRemoved),
      newAutoCandidatesRemoved: new Set(newCell.autoCandidatesRemoved)
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
							updateBoard(board);
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