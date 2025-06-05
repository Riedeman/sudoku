import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

type CellValue = number | null;
type Board = CellValue[][];

interface SudokuBoardProps {
  initialBoard: Board;
  userBoard: Board;
  onCellPress: (row: number, col: number) => void;
  selectedCell: { row: number; col: number } | null;
}

export const SudokuBoard: React.FC<SudokuBoardProps> = ({
  initialBoard,
  userBoard,
  onCellPress,
  selectedCell,
}) => {
  const renderCell = (row: number, col: number) => {
    const initialValue = initialBoard[row][col];
    const userValue = userBoard[row][col];
    const value = initialValue !== null ? initialValue : userValue;
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isInitialValue = initialValue !== null;

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[
          styles.cell,
          isSelected && styles.selectedCell,
          col % 3 === 2 && col !== 8 && styles.rightBorder,
          row % 3 === 2 && row !== 8 && styles.bottomBorder,
        ]}
        onPress={() => onCellPress(row, col)}
      >
        <Text
          style={[
            styles.cellText,
            isInitialValue ? styles.initialValue : styles.userValue,
            isSelected && styles.selectedText,
          ]}
        >
          {value || ''}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.board}>
      {initialBoard.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
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
    borderColor: '#000',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: cellSize,
    height: cellSize,
    borderWidth: 0.5,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCell: {
    backgroundColor: '#e3f2fd',
  },
  cellText: {
    fontSize: cellSize * 0.4,
  },
  initialValue: {
    fontWeight: 'bold',
    color: '#000',
  },
  userValue: {
    color: '#2196f3',
  },
  selectedText: {
    color: '#2196f3',
  },
  rightBorder: {
    borderRightWidth: 2,
    borderRightColor: '#000',
  },
  bottomBorder: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
}); 