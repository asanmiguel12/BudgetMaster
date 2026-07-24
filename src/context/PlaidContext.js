import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  connectSandboxBank,
  fetchPlaidItems,
  fetchBankAccounts,
  syncPlaidItem,
} from '../api/plaidApi';
import { fetchPlaidTransactions } from '../api/transactionsApi';
import { canUseRemoteApi } from '../api/config';

const PlaidContext = createContext();

export function PlaidProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [bankTransactions, setBankTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!canUseRemoteApi()) {
      setItems([]);
      setAccounts([]);
      setBankTransactions([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [nextItems, nextAccounts, txResult] = await Promise.all([
        fetchPlaidItems(),
        fetchBankAccounts(),
        fetchPlaidTransactions({ limit: 100 }),
      ]);
      setItems(nextItems || []);
      setAccounts(nextAccounts || []);
      setBankTransactions(txResult.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    } else {
      setItems([]);
      setAccounts([]);
      setBankTransactions([]);
    }
  }, [isAuthenticated, refresh]);

  const connectSandbox = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      await connectSandboxBank();
      await refresh();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [refresh]);

  const syncAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      for (const item of items) {
        await syncPlaidItem(item.id);
      }
      await refresh();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [items, refresh]);

  return (
    <PlaidContext.Provider value={{
      items,
      accounts,
      bankTransactions,
      isLoading,
      isConnecting,
      error,
      isConnected: items.length > 0,
      connectSandbox,
      syncAll,
      refresh,
    }}>
      {children}
    </PlaidContext.Provider>
  );
}

export function usePlaid() {
  return useContext(PlaidContext);
}
