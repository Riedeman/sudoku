import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const boardSize = Math.min(width * 0.7, height * 0.85);
const cellSize = boardSize / 9;

export interface SudokuCell {
  row: number;
  col: number;
  box: number; // 0-8 representing the 3x3 box (0: top-left, 8: bottom-right)
  answer: number;
  initialValue: number | null;
  userValue: number | null;
  userCandidates: Set<number>;
  autoCandidates: Set<number>;
  autoCandidatesRemoved: Set<number>;
  isSelected: boolean;
  isHighlighted: boolean;
  hasConflict: boolean;
}

export type Board = SudokuCell[];

interface SudokuBoardProps {
  board: Board;
  onCellPress: (row: number, col: number) => void;
  isAutoCandidateMode: boolean;
}

export const SudokuBoard: React.FC<SudokuBoardProps> = ({
  board,
  onCellPress,
  isAutoCandidateMode,
}) => {
  const renderCell = (cell: SudokuCell) => {
    const value = cell.initialValue !== null ? cell.initialValue : cell.userValue;
    const isInitialValue = cell.initialValue !== null;

    return (
      <TouchableOpacity
        key={`${cell.row}-${cell.col}`}
        style={[
          styles.cell,
          cell.isSelected && styles.selectedCell,
          cell.isHighlighted && styles.highlightedCell,
          cell.col % 3 === 2 && cell.col !== 8 && styles.rightBorder,
          cell.row % 3 === 2 && cell.row !== 8 && styles.bottomBorder,
        ]}
        onPress={() => onCellPress(cell.row, cell.col)}
      >
        {cell.hasConflict && <View style={styles.conflictLine} />}
        {value ? (
          <Text
            style={[
              styles.cellText,
              isInitialValue ? styles.initialValue : styles.userValue,
              cell.isSelected && styles.selectedText,
            ]}
          >
            {value}
          </Text>
        ) : (isAutoCandidateMode ? cell.autoCandidates : cell.userCandidates).size > 0 ? (
          <View style={styles.candidatesGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <View key={num} style={styles.candidateCell}>
                <Text
                  style={[
                    styles.candidateText,
                    (isAutoCandidateMode ? cell.autoCandidates : cell.userCandidates).has(num) 
                      ? (isAutoCandidateMode ? styles.autoCandidate : styles.userCandidate)
                      : styles.inactiveCandidate,
                  ]}
                >
                  {(isAutoCandidateMode ? cell.autoCandidates : cell.userCandidates).has(num) ? num : ''}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  // Group cells into rows for rendering
  const rows = Array.from({ length: 9 }, (_, rowIndex) => 
    board.filter(cell => cell.row === rowIndex)
  );

  return (
    <View style={styles.board}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map(cell => renderCell(cell))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    width: boardSize,
    height: boardSize,
    borderWidth: 2,
    borderColor: '#666',
    backgroundColor: '#1E1E1E',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: cellSize,
    height: cellSize,
    borderWidth: 0.5,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  selectedCell: {
    backgroundColor: '#0c6fc0',
  },
  highlightedCell: {
    backgroundColor: '#0086b3',
  },
  cellText: {
    fontSize: cellSize * 0.75,
    color: '#E0E0E0',
  },
  initialValue: {
    color: '#92b6d3',
  },
  userValue: {
    color: '#e7f3fd',
  },
  selectedText: {
    color: '#cfe8fc',
  },
  rightBorder: {
    borderRightWidth: 2,
    borderRightColor: '#666',
  },
  bottomBorder: {
    borderBottomWidth: 2,
    borderBottomColor: '#666',
  },
  candidatesGrid: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 1,
  },
  candidateCell: {
    width: '33.33%',
    height: '33.33%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  candidateText: {
    fontSize: cellSize * 0.23,
    textAlign: 'center',
  },
  userCandidate: {
    color: '#90CAF9', // Blue for user candidates
  },
  autoCandidate: {
    color: '#4CAF50', // Dark green for auto-candidates
  },
  inactiveCandidate: {
    color: 'transparent',
  },
  conflictLine: {
    position: 'absolute',
    width: '141%', // sqrt(2) * 100% to ensure full diagonal coverage
    height: 3,
    backgroundColor: '#ff4444',
    transform: [{ rotate: '135deg' }],
    top: '50%',
    left: '-20%',
    zIndex: 1,
  },
}); 