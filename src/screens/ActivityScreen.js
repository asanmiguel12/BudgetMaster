import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBudget } from '../context/BudgetContext';
import { usePlaid } from '../context/PlaidContext';
import { useAuth } from '../context/AuthContext';

const CATEGORY_ICONS = {
  coffee: '☕',
  food: '🍽️',
  shopping: '🛍️',
  transport: '🚗',
  default: '💳',
};

function GroupedTransactions({ transactions }) {
  const grouped = transactions.reduce((acc, tx) => {
    const dateKey = tx.date.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(tx);
    return acc;
  }, {});

  return Object.entries(grouped).map(([date, txs]) => (
    <View key={date}>
      <Text style={styles.dateHeader}>{date}</Text>
      {txs.map(tx => (
        <View key={tx.id} style={styles.txRow}>
          <View style={[styles.txIcon, { backgroundColor: tx.color + '20' }]}>
            <Text style={{ fontSize: 22 }}>
              {CATEGORY_ICONS[tx.category] || CATEGORY_ICONS.default}
            </Text>
          </View>
          <View style={styles.txInfo}>
            <Text style={styles.txMerchant}>{tx.merchant}</Text>
            <Text style={styles.txCategory}>
              {tx.source === 'plaid' ? `Bank • ${tx.account || 'Plaid'}` : tx.category}
              {tx.pending ? ' • pending' : ''}
            </Text>
          </View>
          <View style={styles.txRight}>
            <Text style={[styles.txAmount, Number(tx.rawAmount ?? -tx.amount) > 0 && styles.txIncome]}>
              {Number(tx.rawAmount ?? -tx.amount) > 0 ? '+' : '-'}${tx.amount.toFixed(2)}
            </Text>
            <Text style={styles.txTime}>
              {tx.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      ))}
    </View>
  ));
}

export default function ActivityScreen() {
  const { transactions: budgetTx, spent, budget } = useBudget();
  const { bankTransactions, isConnected, isLoading } = usePlaid();
  const { isAuthenticated } = useAuth();

  const transactions = useMemo(() => {
    const normalizedBudget = budgetTx.map(tx => ({
      ...tx,
      source: 'budget',
      rawAmount: -Math.abs(Number(tx.amount)),
      amount: Math.abs(Number(tx.amount)),
    }));

    const normalizedBank = bankTransactions.map(tx => ({
      ...tx,
      amount: Math.abs(Number(tx.amount)),
    }));

    const merged = isAuthenticated && isConnected
      ? [...normalizedBank, ...normalizedBudget]
      : normalizedBudget;

    return merged.sort((a, b) => b.date - a.date);
  }, [budgetTx, bankTransactions, isAuthenticated, isConnected]);

  const totalSpent = transactions
    .filter(tx => Number(tx.rawAmount ?? -tx.amount) < 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const spentBase = isConnected ? totalSpent : spent;
  const budgetBase = budget || 1;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        {isConnected ? (
          <Text style={styles.bankBadge}>Bank synced</Text>
        ) : null}
      </View>

      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Transactions</Text>
          <Text style={styles.summaryValue}>{transactions.length}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text style={[styles.summaryValue, { color: '#e53e3e' }]}>-${spentBase.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Budget Used</Text>
          <Text style={styles.summaryValue}>{((spentBase / budgetBase) * 100).toFixed(1)}%</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${Math.min((spentBase / budgetBase) * 100, 100)}%` }]} />
      </View>

      {isLoading ? (
        <Text style={styles.loadingText}>Loading bank transactions…</Text>
      ) : null}

      <FlatList
        data={[{ key: 'content' }]}
        contentContainerStyle={{ paddingBottom: 110 }}
        renderItem={() => (
          <View style={styles.listContent}>
            {transactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📊</Text>
                <Text style={styles.emptyTitle}>No transactions yet</Text>
                <Text style={styles.emptySubtitle}>
                  Connect your bank in Profile to import Apple Pay and card charges automatically.
                </Text>
              </View>
            ) : (
              <GroupedTransactions transactions={transactions} />
            )}
          </View>
        )}
        keyExtractor={item => item.key}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#111' },
  bankBadge: {
    fontSize: 12,
    color: '#1a6fd4',
    fontWeight: '600',
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  summaryBar: { flexDirection: 'row', padding: 20, paddingBottom: 12 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: '600', color: '#111' },
  summaryDivider: { width: 1, backgroundColor: '#eee', marginVertical: 4 },
  progressContainer: {
    marginHorizontal: 20,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginBottom: 16,
  },
  progressBar: { height: 6, backgroundColor: '#1a6fd4', borderRadius: 3 },
  loadingText: { textAlign: 'center', color: '#999', marginBottom: 8 },
  listContent: { paddingHorizontal: 20 },
  dateHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    paddingVertical: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f5f5f5',
  },
  txIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txInfo: { flex: 1 },
  txMerchant: { fontSize: 15, fontWeight: '500', color: '#111', marginBottom: 2 },
  txCategory: { fontSize: 12, color: '#999', textTransform: 'capitalize' },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontSize: 15, fontWeight: '600', color: '#e53e3e' },
  txIncome: { color: '#2ecc71' },
  txTime: { fontSize: 12, color: '#999', marginTop: 2 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#111', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#999', textAlign: 'center', paddingHorizontal: 24 },
});
