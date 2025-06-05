import { StyleSheet, View } from 'react-native';
import { DifficultySelector } from '@/components/DifficultySelector';
import { useRouter } from 'expo-router';

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
      <DifficultySelector onSelectDifficulty={handleDifficultySelect} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
}); 