import { apiRequest } from './client';
import { canUseRemoteApi } from './config';

export function mapPlaidTransaction(tx) {
  const amount = Math.abs(Number(tx.amount));
  const isExpense = Number(tx.amount) < 0;
  const date = tx.datetime ? new Date(tx.datetime) : new Date(tx.date);

  return {
    id: tx.id,
    merchant: tx.merchant_name || tx.name || 'Transaction',
    amount,
    rawAmount: Number(tx.amount),
    category: tx.plaid_category?.[0]?.toLowerCase() || 'default',
    color: isExpense ? '#e53e3e' : '#2ecc71',
    date,
    pending: tx.pending,
    source: 'plaid',
    account: tx.accounts?.name,
    accountMask: tx.accounts?.mask,
  };
}

export async function fetchPlaidTransactions({ page = 1, limit = 50 } = {}) {
  if (!canUseRemoteApi()) return { data: [], pagination: { total: 0 } };

  const result = await apiRequest(`/api/transactions?page=${page}&limit=${limit}`);
  return {
    ...result,
    data: (result.data || []).map(mapPlaidTransaction),
  };
}
