import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { Link } from 'expo-router';
import { registerUser } from '@/api';
import { isAxiosError } from 'axios';

interface RegisterForm {
  email: string;
  password: string;
}

const validateForm = (form: RegisterForm): { email?: string; password?: string } => {
  const errors: { email?: string; password?: string } = {};

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(form.email)) {
    errors.email = 'Invalid email format.';
  }

  const { password } = form;
  if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.';
  } else if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.password = 'Password must include at least one non-alphanumeric character.';
  } else if (!/\d/.test(password)) {
    errors.password = 'Password must include at least one digit.';
  } else if (!/[A-Z]/.test(password)) {
    errors.password = 'Password must include at least one uppercase letter.';
  } else if (!/[a-z]/.test(password)) {
    errors.password = 'Password must include at least one lowercase letter.';
  }

  return errors;
};

export default function RegisterScreen() {
  const [form, setForm] = useState<RegisterForm>({ email: '', password: '' });
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    const validationErrors = validateForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      await registerUser(form);
      setMessage(
        'Registration successful! Please check your email to confirm your account.'
      );
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const errorData = error.response?.data;

        if (Array.isArray(errorData)) {
          const descriptions = errorData
            .map((err: { description?: string }) => err.description)
            .filter(Boolean)
            .join('\n');
          setMessage('Registration failed:\n' + descriptions);
        } else if (errorData === 'Email already registered.') {
          setMessage('Email already registered. Please log in.');
        } else {
          setMessage('Registration failed. ' + errorData);
        }
      } else {
        setMessage('Registration failed. Please try again.');
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
          Register
        </Text>

        {message ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{message}</Text>
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
          error={Boolean(errors.email)}
        />
        {errors.email ? (
          <Text style={styles.errorText}>{errors.email}</Text>
        ) : null}

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
          error={Boolean(errors.password)}
        />
        {errors.password ? (
          <Text style={styles.errorText}>{errors.password}</Text>
        ) : null}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          buttonColor="#22c55e"
          style={styles.button}
        >
          Register
        </Button>

        <View style={styles.linkRow}>
          <Text style={styles.linkText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <Text style={styles.link}>Log in</Text>
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
    marginBottom: 4,
  },
  button: {
    marginTop: 12,
    marginBottom: 16,
  },
  messageBox: {
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  messageText: {
    color: '#374151',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginBottom: 8,
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
