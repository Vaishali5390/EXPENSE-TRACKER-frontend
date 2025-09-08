import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { fetchExpenses, createExpense, updateExpense, deleteExpense } from './api/expenses';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expenses]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchExpenses(query ? { q: query } : {});
      setExpenses(data);
    } catch (e) {
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(payload) {
    await createExpense(payload);
    setEditing(null);
    await load();
  }

  async function handleUpdate(payload) {
    if (!editing) return;
    await updateExpense(editing.id, payload);
    setEditing(null);
    await load();
  }

  async function handleDelete(id) {
    await deleteExpense(id);
    await load();
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h1>Expense Tracker</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button onClick={load} disabled={loading}>Search</button>
        <button onClick={() => setEditing({})}>Add Expense</button>
      </div>

      {error ? <div style={{ color: 'red' }}>{error}</div> : null}

      {!loading && (
        <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', marginBottom: 12 }}>
          <strong>Total Expenses:</strong>
          <span>{expenses.length} item{expenses.length === 1 ? '' : 's'}</span>
          <span style={{ marginLeft: 'auto', fontSize: 18, fontWeight: 600 }}>
            ₹ {totalAmount.toFixed(2)}
          </span>
        </div>
      )}

      {editing ? (
        <div style={{ border: '1px solid #ddd', padding: 16, marginBottom: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
          <h3>{editing?.id ? 'Edit Expense' : 'Add Expense'}</h3>
          <ExpenseForm
            initialValue={editing?.id ? editing : undefined}
            onSubmit={editing?.id ? handleUpdate : handleCreate}
            onCancel={() => setEditing(null)}
          />
        </div>
      ) : null}

      {loading ? <p>Loading...</p> : (
        <div style={{ marginTop: 12 }}>
          <ExpenseList items={expenses} onEdit={setEditing} onDelete={handleDelete} />
        </div>
      )}
    </div>
  );
}

export default App;
