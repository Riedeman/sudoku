import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

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
        {value ? (
          <Text
            style={[
              styles.cellText,
              isInitialValue ? styles.initialValue : styles.userValue,
              cell.isSelected && styles.selectedText,
              !isInitialValue && cell.userValue !== cell.answer && styles.incorrectValue,
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
                      ? styles.activeCandidate 
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

const { width } = Dimensions.get('window');
const boardSize = width * 0.6; // Make board smaller to accommodate number pad
const cellSize = boardSize / 9;

const styles = StyleSheet.create({
  board: {
    width: boardSize,
    height: boardSize,
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#1E1E1E',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: cellSize,
    height: cellSize,
    borderWidth: 0.5,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  selectedCell: {
    backgroundColor: '#2C2C2C',
  },
  highlightedCell: {
    backgroundColor: '#2C2C4C',
  },
  cellText: {
    fontSize: cellSize * 0.4,
    color: '#E0E0E0',
  },
  initialValue: {
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  userValue: {
    color: '#90CAF9',
  },
  selectedText: {
    color: '#90CAF9',
  },
  rightBorder: {
    borderRightWidth: 2,
    borderRightColor: '#333',
  },
  bottomBorder: {
    borderBottomWidth: 2,
    borderBottomColor: '#333',
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
    fontSize: cellSize * 0.2,
    textAlign: 'center',
  },
  activeCandidate: {
    color: '#90CAF9',
  },
  inactiveCandidate: {
    color: 'transparent',
  },
  incorrectValue: {
    color: 'red',
  },
}); 