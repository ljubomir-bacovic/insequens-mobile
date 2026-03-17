import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, TextInput, Button, Checkbox } from 'react-native-paper';
import { useRouter, Link } from 'expo-router';
import { loginUser } from '@/api';
import * as SecureStore from 'expo-secure-store';

const REMEMBER_ME_KEY = 'rememberMe';
const SAVED_EMAIL_KEY = 'savedEmail';

export default function LoginScreen() {
  const router = useRouter();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const loadSavedCredentials = async () => {
      const saved = await SecureStore.getItemAsync(REMEMBER_ME_KEY);
      if (saved === 'true') {
        setRememberMe(true);
        const savedEmail = await SecureStore.getItemAsync(SAVED_EMAIL_KEY);
        if (savedEmail) {
          setForm((p) => ({ ...p, email: savedEmail }));
        }
      }
    };
    loadSavedCredentials();
  }, []);

  const handleSubmit = async () => {
    setError('');
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      const response = await loginUser(form);
      const { token, refreshToken } = response;

      if (!token) {
        setError('Login succeeded but no session token was returned. Please try again.');
        return;
      }
      await SecureStore.setItemAsync('token', token);
      if (refreshToken) await SecureStore.setItemAsync('refreshToken', refreshToken);

      if (rememberMe) {
        await SecureStore.setItemAsync(REMEMBER_ME_KEY, 'true');
        await SecureStore.setItemAsync(SAVED_EMAIL_KEY, form.email);
      } else {
        await SecureStore.deleteItemAsync(REMEMBER_ME_KEY);
        await SecureStore.deleteItemAsync(SAVED_EMAIL_KEY);
      }

      router.replace('/(app)/today');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="headlineMedium" style={styles.title}>
          Login
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TextInput
          label="Email"
          value={form.email}
          onChangeText={(v) => setForm((p) => ({ ...p, email: v }))}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          style={styles.input}
        />

        <TextInput
          label="Password"
          value={form.password}
          onChangeText={(v) => setForm((p) => ({ ...p, password: v }))}
          mode="outlined"
          secureTextEntry={!showPassword}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword((p) => !p)}
            />
          }
          style={styles.input}
        />

        <View style={styles.rememberRow}>
          <Checkbox
            status={rememberMe ? 'checked' : 'unchecked'}
            onPress={() => setRememberMe((p) => !p)}
          />
          <Text
            style={styles.rememberText}
            onPress={() => setRememberMe((p) => !p)}
          >
            Remember me
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Login
        </Button>

        <View style={styles.linkRow}>
          <Link href="/(auth)/forgot-password" asChild>
            <Text style={styles.link}>Forgot Password?</Text>
          </Link>
        </View>

        <View style={styles.linkRow}>
          <Text style={styles.linkText}>Don&apos;t have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <Text style={styles.link}>Sign up</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    marginBottom: 24,
    fontWeight: '700',
  },
  input: {
    marginBottom: 12,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rememberText: {
    color: '#374151',
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#dc2626',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  linkText: {
    color: '#6b7280',
  },
  link: {
    color: '#0a7ea4',
    textDecorationLine: 'underline',
  },
});
