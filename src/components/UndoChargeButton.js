import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function UndoChargeButton({ onPress, disabled = false }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[styles.btn, disabled && styles.btnDisabled]}
      activeOpacity={0.7}
      accessibilityLabel="Undo charge"
      accessibilityRole="button"
    >
      <Text style={[styles.icon, disabled && styles.iconDisabled]}>↺</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#1a6fd4',
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  btnDisabled: {
    opacity: 0.4,
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  icon: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a6fd4',
    marginTop: -1,
  },
  iconDisabled: {
    color: '#999',
  },
});
