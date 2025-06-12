import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Difficulty = 'easy' | 'medium' | 'hard' | 'very-hard' | 'insane' | 'inhuman';

interface DifficultySelectorProps {
  onSelectDifficulty: (difficulty: Difficulty) => void;
}

const DIFFICULTY_INFO = {
  'easy': { label: 'Easy', cells: 62, color: '#2E7D32' },      // Dark green
  'medium': { label: 'Medium', cells: 53, color: '#558B2F' },  // Forest green
  'hard': { label: 'Hard', cells: 44, color: '#F57F17' },      // Dark amber
  'very-hard': { label: 'Very Hard', cells: 35, color: '#E65100' }, // Dark orange
  'insane': { label: 'Insane', cells: 26, color: '#BF360C' },  // Deep orange
  'inhuman': { label: 'Inhuman', cells: 17, color: '#B71C1C' }, // Dark red
} as const;

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelectDifficulty }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Difficulty</Text>
      <View style={styles.buttonContainer}>
        {Object.entries(DIFFICULTY_INFO).map(([key, info]) => (
          <TouchableOpacity
            key={key}
            style={[styles.button, { backgroundColor: info.color }]}
            onPress={() => onSelectDifficulty(key as Difficulty)}
          >
            <Text style={styles.buttonText}>{info.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#E0E0E0',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#333',
  },
  buttonText: {
    color: '#E0E0E0',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 