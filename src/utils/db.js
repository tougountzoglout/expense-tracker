import { supabase } from './supabase';

// --- Expenses ---
export async function fetchExpenses() {
  const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertExpense(expense) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('expenses').insert({ ...expense, user_id: user.id }).select().single();
  if (error) throw error;
  return data;
}

export async function removeExpense(id) {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

// --- Incomes ---
export async function fetchIncomes() {
  const { data, error } = await supabase.from('incomes').select('*').order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertIncome(income) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('incomes').insert({ ...income, user_id: user.id }).select().single();
  if (error) throw error;
  return data;
}

export async function removeIncome(id) {
  const { error } = await supabase.from('incomes').delete().eq('id', id);
  if (error) throw error;
}

// --- Savings Deposits ---
export async function fetchDeposits() {
  const { data, error } = await supabase.from('savings_deposits').select('*').order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertDeposit(deposit) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('savings_deposits').insert({ ...deposit, user_id: user.id }).select().single();
  if (error) throw error;
  return data;
}

export async function removeDeposit(id) {
  const { error } = await supabase.from('savings_deposits').delete().eq('id', id);
  if (error) throw error;
}

// --- User Preferences ---
export async function fetchPreferences() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('user_preferences').select('*').eq('user_id', user.id).single();
  if (error && error.code === 'PGRST116') {
    // No row yet, create default
    const { data: newRow, error: insertErr } = await supabase
      .from('user_preferences')
      .insert({ user_id: user.id, salary_type: '14', monthly_salary: 0 })
      .select().single();
    if (insertErr) throw insertErr;
    return newRow;
  }
  if (error) throw error;
  return data;
}

export async function updatePreferences(prefs) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('user_preferences').update(prefs).eq('user_id', user.id);
  if (error) throw error;
}

// --- Clear All ---
export async function clearAllData() {
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('expenses').delete().eq('user_id', user.id);
  await supabase.from('incomes').delete().eq('user_id', user.id);
  await supabase.from('savings_deposits').delete().eq('user_id', user.id);
}

// --- CSV Export/Import ---
export async function exportToCsv() {
  const [expenses, incomes, deposits] = await Promise.all([fetchExpenses(), fetchIncomes(), fetchDeposits()]);
  const header = 'type,name,amount,category,date';
  const rows = [];
  expenses.forEach(e => rows.push(`expense,"${e.name.replace(/"/g, '""')}",${e.amount},"${e.category}",${e.date}`));
  incomes.forEach(i => rows.push(`income,"${i.name.replace(/"/g, '""')}",${i.amount},"${i.category}",${i.date}`));
  deposits.forEach(d => rows.push(`saving,"${d.name.replace(/"/g, '""')}",${d.amount},"${d.category}",${d.date}`));
  return [header, ...rows].join('\n');
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export async function importFromCsv(csvStr) {
  const lines = csvStr.trim().split('\n');
  if (lines.length < 2) throw new Error('Empty CSV');
  const { data: { user } } = await supabase.auth.getUser();
  const expenses = [], incomes = [], deposits = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = parseCsvLine(lines[i]);
    if (parts.length < 5) continue;
    const [type, name, amountStr, category, date] = parts;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || !name) continue;
    const entry = { name, amount, category, date, user_id: user.id };
    const t = type.toLowerCase();
    if (t === 'income') incomes.push(entry);
    else if (t === 'saving') deposits.push(entry);
    else expenses.push(entry);
  }

  if (expenses.length) { const { error } = await supabase.from('expenses').insert(expenses); if (error) throw error; }
  if (incomes.length) { const { error } = await supabase.from('incomes').insert(incomes); if (error) throw error; }
  if (deposits.length) { const { error } = await supabase.from('savings_deposits').insert(deposits); if (error) throw error; }
}
