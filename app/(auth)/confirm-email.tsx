import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { confirmEmail } from '@/api';

export default function ConfirmEmailScreen() {
  const [message, setMessage] = useState<string>('');
  const params = useLocalSearchParams<{ userId: string; token: string }>();
  const router = useRouter();

  useEffect(() => {
    const userId = params.userId;
    const token = params.token;

    async function handleEmailConfirmation(uid: string, tkn: string) {
      try {
        await confirmEmail(uid, tkn);
        setMessage('Email confirmed successfully! Redirecting to login...');
        setTimeout(() => router.replace('/(auth)/login'), 3000);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setMessage('Confirmation failed: ' + err.message);
        } else {
          setMessage('Confirmation failed for an unknown reason.');
        }
      }
    }

    if (userId && token) {
      handleEmailConfirmation(userId, token);
    } else {
      setMessage('Invalid confirmation link.');
    }
  }, [params.userId, params.token, router]);

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Email Confirmation
      </Text>
      {message ? (
        <Text style={styles.message}>{message}</Text>
      ) : (
        <ActivityIndicator size="large" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    color: '#374151',
    lineHeight: 24,
  },
});
