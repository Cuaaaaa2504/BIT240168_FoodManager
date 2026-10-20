import React, { useState } from 'react';
import {
  ActivityIndicator,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

import { initializeData } from './src/services/initializeData';
import { getCategories, getDishes } from './src/services/api';

function App(): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(
    'Press the button to initialize sample data.',
  );

  const handleInitialize = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    setMessage('Connecting to MockAPI...');

    try {
      await initializeData();

      const [categories, dishes] = await Promise.all([
        getCategories(),
        getDishes(),
      ]);

      setMessage(
        `Connected successfully!\n\n` +
          `Categories: ${categories.length}\n` +
          `Dishes: ${dishes.length}`,
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        setMessage(
          `API error${status ? ` (${status})` : ''}: ${error.message}`,
        );
      } else {
        setMessage(
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Food Manager</Text>

          <Text style={styles.student}>
            BIT240168 - Nguyễn Hà Trung Nam
          </Text>

          <Text style={styles.subtitle}>MockAPI connection test</Text>

          <View style={styles.card}>
            <Text style={styles.message}>{message}</Text>
          </View>

          {loading && (
            <ActivityIndicator
              size="large"
              color="#2563eb"
              style={styles.spinner}
            />
          )}

          <Button
            title={loading ? 'Please wait...' : 'Initialize sample data'}
            onPress={handleInitialize}
            disabled={loading}
          />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  student: {
    marginTop: 10,
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 24,
    fontSize: 18,
    color: '#0f172a',
    textAlign: 'center',
  },
  card: {
    marginVertical: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  message: {
    fontSize: 16,
    lineHeight: 26,
    color: '#334155',
  },
  spinner: {
    marginBottom: 20,
  },
});

export default App;