import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import BudgetDualCard from './BudgetDualCard';
import TimeframeProgressBar from './TimeframeProgressBar';
import { useBudget, getBudgetMetrics, getOnTrackProgress, getOnTrackProgressForDaysRemaining } from '../context/BudgetContext';

export default function BudgetCarousel({ previewDaysElapsed, onPreviewDaysElapsedChange }) {
  const {
    budgets,
    activeBudgetIndex,
    setActiveBudgetIndex,
    updateBudgetById,
    pendingTransaction,
    isAnimating,
  } = useBudget();
  const { width } = useWindowDimensions();
  const listRef = useRef(null);

  useEffect(() => {
    if (budgets.length === 0) return;
    listRef.current?.scrollToIndex({
      index: activeBudgetIndex,
      animated: true,
    });
  }, [activeBudgetIndex, budgets.length]);

  const getDisplayRemaining = (item, index, baseRemaining) => {
    const isActive = index === activeBudgetIndex;
    const pendingAmount = isActive && isAnimating && pendingTransaction
      ? pendingTransaction.amount
      : 0;
    return baseRemaining - pendingAmount;
  };

  const getDisplayOnTrack = (item, index) => {
    const metrics = getBudgetMetrics(item);
    const remaining = getDisplayRemaining(item, index, metrics.remaining);
    if (index !== activeBudgetIndex || previewDaysElapsed === null) {
      return getOnTrackProgress(
        item.amount,
        remaining,
        item.timeframe,
        item.periodStartDate,
      );
    }
    const actualDaysElapsed = Math.max(0, metrics.totalDays - metrics.daysRemaining);
    const elapsed = previewDaysElapsed ?? actualDaysElapsed;
    const previewDaysRemaining = Math.max(0, metrics.totalDays - elapsed);
    return getOnTrackProgressForDaysRemaining(
      item.amount,
      remaining,
      metrics.totalDays,
      previewDaysRemaining,
    );
  };

  const handleScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    if (index !== activeBudgetIndex && index >= 0 && index < budgets.length) {
      setActiveBudgetIndex(index);
      onPreviewDaysElapsedChange?.(null);
    }
  };

  if (budgets.length === 0) {
    return (
      <View style={[styles.emptyCard, { width: width - 32 }]}>
        <Text style={styles.emptyTitle}>No budgets yet</Text>
        <Text style={styles.emptySubtitle}>
          Create a budget to see your cash stacks here.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        ref={listRef}
        data={budgets}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        bounces={budgets.length > 1}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={handleScrollEnd}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            listRef.current?.scrollToIndex({ index: info.index, animated: false });
          }, 100);
        }}
        renderItem={({ item, index }) => {
          const metrics = getBudgetMetrics(item);
          const remaining = getDisplayRemaining(item, index, metrics.remaining);
          const isActive = index === activeBudgetIndex;
          return (
            <View style={{ width }}>
              <BudgetDualCard
                budget={item.amount}
                remaining={remaining}
                onTrackProgress={getDisplayOnTrack(item, index)}
                onUpdateBudget={(amount) => updateBudgetById(item.id, { amount })}
                isActive={isActive}
              />
              <TimeframeProgressBar
                timeframe={item.timeframe}
                totalDays={metrics.totalDays}
                daysRemaining={metrics.daysRemaining}
                onTrackProgress={getDisplayOnTrack(item, index)}
                previewDaysElapsed={isActive ? previewDaysElapsed : null}
                onPreviewDaysElapsedChange={isActive ? onPreviewDaysElapsedChange : undefined}
                isActive={isActive}
                onUpdateTimeframe={(selectedTimeframe) =>
                  updateBudgetById(item.id, {
                    timeframe: selectedTimeframe,
                    periodStartDate: new Date().toISOString(),
                  })
                }
              />
            </View>
          );
        }}
      />

      {budgets.length > 1 && (
        <View style={styles.dotsRow}>
          {budgets.map((b, i) => (
            <View
              key={b.id}
              style={[styles.dot, i === activeBudgetIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    alignSelf: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    paddingVertical: 36,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#e8f1fc',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a6fd4',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#5a6a7a',
    textAlign: 'center',
    lineHeight: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#d0d0d0',
  },
  dotActive: {
    backgroundColor: '#1a6fd4',
    width: 18,
  },
});
