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
  useWindowDimensions,
} from 'react-native';

export function parseChargeAmount(input) {
  const parsed = parseFloat(String(input).replace(/,/g, ''));
  if (Number.isNaN(parsed) || parsed <= 0) return null;
  return Math.round(parsed * 100) / 100;
}

export default function SimulateChargeModal({
  visible,
  onClose,
  onSubmit,
  budgetName,
  remaining,
}) {
  const [input, setInput] = useState('');
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.min(screenWidth - 48, 420);
  const cardHeight = Math.min(screenHeight * 0.52, 360);

  useEffect(() => {
    if (visible) setInput('');
  }, [visible]);

  const parsed = parseChargeAmount(input);
  const isValid = parsed !== null;
  const exceedsRemaining = parsed !== null && parsed > remaining + 0.001;

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit(parsed);
    onClose();
  };

  if (!visible) return null;

  const formattedRemaining = remaining.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ width: cardWidth }}
        >
          <Pressable style={[styles.card, { width: cardWidth, height: cardHeight }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.content}>
              <Text style={styles.title}>Simulate bank charge</Text>
              <Text style={styles.subtitle}>
                {budgetName
                  ? `How much should we deduct from ${budgetName}?`
                  : 'How much should we deduct from your budget?'}
              </Text>
              <Text style={styles.remainingHint}>
                ${formattedRemaining} remaining
              </Text>

              <View style={styles.inputRow}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.input}
                  value={input}
                  onChangeText={setInput}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#bbb"
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </View>

              {exceedsRemaining ? (
                <Text style={styles.warningText}>
                  This charge exceeds your remaining budget.
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.button, !isValid && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!isValid}
            >
              <Text style={styles.buttonText}>Simulate Charge</Text>
            </TouchableOpacity>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  remainingHint: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a6fd4',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#2a8a2a',
    paddingBottom: 8,
    marginBottom: 12,
    width: '100%',
    justifyContent: 'center',
  },
  dollarSign: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2a8a2a',
    marginRight: 4,
  },
  input: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2a8a2a',
    minWidth: 120,
    textAlign: 'center',
    padding: 0,
  },
  warningText: {
    fontSize: 13,
    color: '#e53e3e',
    textAlign: 'center',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#1a6fd4',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
