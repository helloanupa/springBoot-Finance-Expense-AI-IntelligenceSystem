import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export function useTransactions(filters = {}) {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      
      const data = await api.get(`/transactions?${params}`);
      setTransactions(data.data || []);
      setSummary(data.summary || { income: 0, expense: 0, balance: 0 });
      setPagination(data.pagination || { total: 0, page: 1, pages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const addTransaction = useCallback(async (txData) => {
    try {
      const data = await api.post('/transactions', txData);
      toast.success('Transaction added!');
      fetchTransactions();
      return data;
    } catch (err) {
      toast.error(err.message || 'Failed to add transaction');
      throw err;
    }
  }, [fetchTransactions]);

  const deleteTransaction = useCallback(async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      toast.success('Transaction deleted');
      fetchTransactions();
    } catch (err) {
      toast.error('Failed to delete transaction');
    }
  }, [fetchTransactions]);

  const updateTransaction = useCallback(async (id, data) => {
    try {
      const result = await api.put(`/transactions/${id}`, data);
      toast.success('Transaction updated');
      fetchTransactions();
      return result;
    } catch (err) {
      toast.error('Failed to update transaction');
      throw err;
    }
  }, [fetchTransactions]);

  return { transactions, summary, pagination, loading, error, addTransaction, deleteTransaction, updateTransaction, refetch: fetchTransactions };
}
