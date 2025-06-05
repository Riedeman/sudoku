import { StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { DifficultySelector } from '@/components/DifficultySelector';
import { useState } from 'react';

export default function SudokuScreen() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);

  const handleDifficultySelect = (difficulty: 'easy' | 'medium' | 'hard') => {
    setSelectedDifficulty(difficulty);
    // TODO: Initialize game with selected difficulty
    console.log(`Starting ${difficulty} game`);
  };

  return (
    <View style={styles.container}>
      <DifficultySelector onSelectDifficulty={handleDifficultySelect} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 