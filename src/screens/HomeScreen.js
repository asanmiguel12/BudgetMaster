import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, StatusBar, Modal, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CashStack from '../components/CashStack';
import BudgetCarousel from '../components/BudgetCarousel';
import BudgetSetupModal from '../components/BudgetSetupModal';
import EditPencil from '../components/EditPencil';
import { EditBudgetNameModal } from '../components/BudgetEditModals';
import AuthModal from '../components/AuthModal';
import { useBudget, isValidBudgetName } from '../context/BudgetContext';
import { useAuth } from '../context/AuthContext';

function TransactionRow({ transaction }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatDate = (date) => {
    return (
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ', ' +
      date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    );
  };

  return (
    <Animated.View style={[styles.txRow, { opacity: fadeAnim }]}>
      <View style={[styles.txIcon, { backgroundColor: transaction.color + '20' }]}>
        <Text style={{ fontSize: 20 }}>
          {transaction.category === 'coffee' ? '☕' : '🍽️'}
        </Text>
      </View>

      <View style={styles.txInfo}>
        <Text style={styles.txMerchant}>{transaction.merchant}</Text>
        <Text style={styles.txDate}>{formatDate(transaction.date)}</Text>
      </View>

      <Text style={styles.txAmount}>-${transaction.amount.toFixed(2)}</Text>
    </Animated.View>
  );
}

const TAB_ROUTES = [
  { name: 'Home', label: 'Home', icon: '🏠' },
  { name: 'Activity', label: 'Activity', icon: '📋' },
  { name: 'Insights', label: 'Insights', icon: '📊' },
  { name: 'Profile', label: 'Profile', icon: '👤' },
];

function ProfileSilhouette({ size = 28, color = '#1a6fd4' }) {
  const headSize = size * 0.36;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View
        style={{
          width: headSize,
          height: headSize,
          borderRadius: headSize / 2,
          backgroundColor: color,
          marginBottom: 1,
        }}
      />
      <View
        style={{
          width: size * 0.72,
          height: size * 0.38,
          borderTopLeftRadius: size * 0.36,
          borderTopRightRadius: size * 0.36,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const {
    transactions, pendingTransaction, isAnimating,
    simulateBankNotification, addBudget, budgetName, updateBudgetName,
    deleteBudget, activeBudget,
  } = useBudget();

  const [previewDaysElapsed, setPreviewDaysElapsed] = useState(null);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [nameEditVisible, setNameEditVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [authVisible, setAuthVisible] = useState(false);

  const { user, isAuthenticated, signOut } = useAuth();

  const cashRef = useRef(null);

  const processingOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pendingTransaction && isAnimating) {
      cashRef.current?.deduct(pendingTransaction.amount);
    }
  }, [pendingTransaction, isAnimating]);

  useEffect(() => {
    if (isAnimating) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(processingOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(processingOpacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      processingOpacity.stopAnimation();
      processingOpacity.setValue(0);
    }
  }, [isAnimating]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap} pointerEvents="none">
          <Text style={styles.headerTitle}>Budget Master</Text>
        </View>

        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => setMenuVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signInBtn}
          onPress={() => {
            if (isAuthenticated) {
              Alert.alert(
                'Sign out',
                `Signed in as ${user?.name || user?.full_name || user?.email}`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Sign Out', style: 'destructive', onPress: signOut },
                ],
              );
            } else {
              setAuthVisible(true);
            }
          }}
          activeOpacity={0.7}
        >
          {isAuthenticated ? (
            <ProfileSilhouette size={28} color="#1a6fd4" />
          ) : (
            <Text style={styles.signInBtnText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>

      <AuthModal visible={authVisible} onClose={() => setAuthVisible(false)} />

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuBackdrop}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuPanel} onStartShouldSetResponder={() => true}>
            {TAB_ROUTES.map((route) => (
              <TouchableOpacity
                key={route.name}
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate(route.name);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.menuItemIcon}>{route.icon}</Text>
                <Text style={styles.menuItemLabel}>{route.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <EditBudgetNameModal
        visible={nameEditVisible}
        initialName={budgetName}
        onSave={updateBudgetName}
        onDelete={() => deleteBudget(activeBudget?.id)}
        onClose={() => setNameEditVisible(false)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        directionalLockEnabled
        contentContainerStyle={{ paddingBottom: 140 }}
      >

        <View style={styles.carouselToolbar}>
          <TouchableOpacity
            style={styles.budgetNameTapArea}
            onPress={() => setNameEditVisible(true)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.budgetName,
                !isValidBudgetName(budgetName) && styles.budgetNameRequired,
              ]}
              numberOfLines={1}
            >
              {budgetName || 'Name Budget*'}
            </Text>
            <EditPencil onPress={() => setNameEditVisible(true)} size={12} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.newBudgetBtn}
            onPress={() => setShowAddBudget(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.newBudgetBtnText}>+ New Budget</Text>
          </TouchableOpacity>
        </View>

        {/* Swipeable budget cards */}
        <BudgetCarousel
          previewDaysElapsed={previewDaysElapsed}
          onPreviewDaysElapsedChange={setPreviewDaysElapsed}
        />
        <BudgetSetupModal
          visible={showAddBudget}
          title="Add a budget"
          onComplete={(amount, selectedTimeframe, name) => addBudget(amount, selectedTimeframe, name)}
          onClose={() => setShowAddBudget(false)}
        />

        {/* Deducting label */}
        {isAnimating && pendingTransaction && (
          <Animated.Text style={[styles.processingText, { opacity: processingOpacity }]}>
            Deducting ${pendingTransaction.amount.toFixed(2)}...
          </Animated.Text>
        )}

        {/* Mini cash stacks */}
        <View style={styles.cashArea}>
          <CashStack
            miniOnly
            onRef={(api) => (cashRef.current = api)}
          />
        </View>


        {/* Demo button */}
        <TouchableOpacity
          style={styles.demoButton}
          onPress={simulateBankNotification}
          disabled={isAnimating}
        >
          <Text style={styles.demoButtonText}>
            {isAnimating ? 'Processing...' : '💳 Simulate Bank Notification'}
          </Text>
        </TouchableOpacity>

        {/* ⭐ RECENT ACTIVITY BOX ⭐ */}
        <View style={styles.activityContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Activity')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {transactions.slice(0, 5).map(tx => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------------------------------------
   STYLES
--------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 48,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    position: 'relative',
  },

  headerTitleWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 96,
    zIndex: 0,
  },
  menuBtn: {
    position: 'absolute',
    left: 20,
    zIndex: 2,
    padding: 4,
  },
  menuIcon: { fontSize: 20, color: '#333' },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
  },
  signInBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 2,
    paddingVertical: 4,
  },
  signInBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a6fd4',
    lineHeight: 18,
    textAlign: 'right',
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingTop: 56,
    paddingHorizontal: 20,
  },
  menuPanel: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  menuItemIcon: { fontSize: 20 },
  menuItemLabel: { fontSize: 16, fontWeight: '500', color: '#111' },
  carouselToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    gap: 12,
  },
  budgetNameTapArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  budgetName: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
  },
  budgetNameRequired: {
    color: '#1a6fd4',
    fontStyle: 'italic',
  },
  newBudgetBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f0f7ff',
  },
  newBudgetBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a6fd4',
  },

  processingText: {
    textAlign: 'center',
    color: '#1a6fd4',
    fontSize: 15,
    fontWeight: '500',
    marginTop: 8,
  },

  cashArea: { paddingHorizontal: 0, paddingTop: 3, paddingBottom: 4 },

  /* ⭐ NEW ACTIVITY BOX ⭐ */
  activityContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },

    elevation: 4,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111' },
  viewAll: { fontSize: 14, color: '#1a6fd4', fontWeight: '500' },

  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txInfo: { flex: 1 },
  txMerchant: { fontSize: 15, fontWeight: '500', color: '#111', marginBottom: 2 },
  txDate: { fontSize: 12, color: '#999' },
  txAmount: { fontSize: 15, fontWeight: '600', color: '#e53e3e' },

  demoButton: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1a6fd4',
    borderStyle: 'dashed',
  },
  demoButtonText: { color: '#1a6fd4', fontSize: 15, fontWeight: '600' },
});
