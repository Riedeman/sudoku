import { StyleSheet, View, Text } from 'react-native';
import { DifficultySelector } from '@/components/DifficultySelector';
import { useRouter, Stack } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  const handleDifficultySelect = (difficulty: 'easy' | 'medium' | 'hard') => {
    router.push({
      pathname: '/game',
      params: { difficulty }
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.title}>Sudoku</Text>
      <DifficultySelector onSelectDifficulty={handleDifficultySelect} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 40,
  },
}); 