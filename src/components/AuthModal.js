import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { isApiEnabled } from '../api/config';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthModal({ visible, onClose }) {
  const { signIn, signUp, isSubmitting } = useAuth();
  const [mode, setMode] = useState('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setMode('signIn');
      setEmail('');
      setPassword('');
      setName('');
      setError('');
    }
  }, [visible]);

  const isSignUp = mode === 'signUp';
  const isValidEmail = EMAIL_PATTERN.test(email.trim());
  const isValidPassword = password.length >= 6;
  const isValidName = !isSignUp || name.trim().length > 0;
  const canSubmit = isValidEmail && isValidPassword && isValidName && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (!isApiEnabled()) {
      setError('API is disabled. Enable EXPO_PUBLIC_API_ENABLED in your .env file.');
      return;
    }

    setError('');
    try {
      if (isSignUp) {
        await signUp(email.trim(), password, name.trim());
      } else {
        await signIn(email.trim(), password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.title}>{isSignUp ? 'Create account' : 'Sign in'}</Text>
            <Text style={styles.subtitle}>
              {isSignUp
                ? 'Create an account to sync budgets across devices.'
                : 'Sign in to load and sync your budgets.'}
            </Text>

            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[styles.modeBtn, !isSignUp && styles.modeBtnActive]}
                onPress={() => { setMode('signIn'); setError(''); }}
              >
                <Text style={[styles.modeBtnText, !isSignUp && styles.modeBtnTextActive]}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, isSignUp && styles.modeBtnActive]}
                onPress={() => { setMode('signUp'); setError(''); }}
              >
                <Text style={[styles.modeBtnText, isSignUp && styles.modeBtnTextActive]}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {isSignUp && (
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Name"
                placeholderTextColor="#bbb"
                autoCapitalize="words"
                returnKeyType="next"
              />
            )}

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#bbb"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password (min 6 characters)"
              placeholderTextColor="#bbb"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={isSubmitting}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, !canSubmit && styles.saveBtnDisabled]}
                onPress={handleSubmit}
                disabled={!canSubmit}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  modeBtnActive: {
    backgroundColor: '#f0f7ff',
  },
  modeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  modeBtnTextActive: {
    color: '#1a6fd4',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111',
    marginBottom: 12,
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#1a6fd4',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
