import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { usePlaid } from '../context/PlaidContext';
import { useAuth } from '../context/AuthContext';

export default function BankConnectCard() {
  const { isAuthenticated } = useAuth();
  const {
    items,
    accounts,
    isConnected,
    isLoading,
    isConnecting,
    error,
    connectSandbox,
    syncAll,
  } = usePlaid();
  const [localError, setLocalError] = useState(null);

  if (!isAuthenticated) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Bank sync (Plaid)</Text>
        <Text style={styles.subtitle}>
          Sign in to connect your bank and automatically import Apple Pay and card charges.
        </Text>
      </View>
    );
  }

  const primaryAccount = accounts[0];
  const displayError = localError || error;

  const handleConnect = async () => {
    setLocalError(null);
    try {
      await connectSandbox();
      Alert.alert(
        'Bank connected',
        'Sandbox bank linked. Apple Pay and card purchases will sync as transactions.',
      );
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const handleSync = async () => {
    setLocalError(null);
    try {
      await syncAll();
      Alert.alert('Synced', 'Latest transactions pulled from your bank.');
    } catch (err) {
      setLocalError(err.message);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Bank sync (Plaid)</Text>
      <Text style={styles.subtitle}>
        Connect your bank to automatically track Apple Pay and card charges — no notification scraping needed.
      </Text>

      {isConnected ? (
        <>
          <View style={styles.connectedRow}>
            <Text style={styles.bankIcon}>🏦</Text>
            <View style={styles.connectedInfo}>
              <Text style={styles.connectedLabel}>
                {items[0]?.institution_name || 'Connected bank'}
              </Text>
              <Text style={styles.connectedValue}>
                {primaryAccount
                  ? `${primaryAccount.name} ••••${primaryAccount.mask || '****'}`
                  : 'Accounts synced'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleSync} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#1a6fd4" />
            ) : (
              <Text style={styles.secondaryBtnText}>Sync transactions now</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={[styles.primaryBtn, isConnecting && styles.primaryBtnDisabled]}
          onPress={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>Connect sandbox bank</Text>
          )}
        </TouchableOpacity>
      )}

      {displayError ? <Text style={styles.errorText}>{displayError}</Text> : null}

      <Text style={styles.note}>
        Sandbox mode uses Plaid test data. Add PLAID_CLIENT_ID and PLAID_SECRET to .env for live banks.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 14,
  },
  primaryBtn: {
    backgroundColor: '#1a6fd4',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: '#1a6fd4',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#1a6fd4', fontWeight: '600', fontSize: 15 },
  connectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bankIcon: { fontSize: 24, marginRight: 12 },
  connectedInfo: { flex: 1 },
  connectedLabel: { fontSize: 15, fontWeight: '600', color: '#111' },
  connectedValue: { fontSize: 12, color: '#999', marginTop: 2 },
  errorText: { color: '#e53e3e', fontSize: 12, marginTop: 10 },
  note: { fontSize: 11, color: '#999', marginTop: 10, lineHeight: 16 },
});
