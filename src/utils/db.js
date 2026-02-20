import { supabase } from './supabase';

export async function fetchExpenses() {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchIncomes() {
  const { data, error } = await supabase
    .from('incomes')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertExpense(expense) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('expenses')
    .insert({ ...expense, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function insertIncome(income) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('incomes')
    .insert({ ...income, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeExpense(id) {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

export async function removeIncome(id) {
  const { error } = await supabase.from('incomes').delete().eq('id', id);
  if (error) throw error;
}

export async function clearAllData() {
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('expenses').delete().eq('user_id', user.id);
  await supabase.from('incomes').delete().eq('user_id', user.id);
}

export async function exportToCsv() {
  const expenses = await fetchExpenses();
  const incomes = await fetchIncomes();
  const header = 'type,name,amount,category,date';
  const rows = [];
  expenses.forEach(e => {
    rows.push(`expense,"${e.name.replace(/"/g, '""')}",${e.amount},"${e.category}",${e.date}`);
  });
  incomes.forEach(i => {
    rows.push(`income,"${i.name.replace(/"/g, '""')}",${i.amount},"${i.category}",${i.date}`);
  });
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

  const header = lines[0].toLowerCase();
  if (!header.includes('type') || !header.includes('amount')) {
    throw new Error('Invalid CSV format');
  }

  const { data: { user } } = await supabase.auth.getUser();
  const expenses = [];
  const incomes = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = parseCsvLine(lines[i]);
    if (parts.length < 5) continue;
    const [type, name, amountStr, category, date] = parts;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || !name) continue;
    const entry = { name, amount, category, date, user_id: user.id };
    if (type.toLowerCase() === 'income') incomes.push(entry);
    else expenses.push(entry);
  }

  if (expenses.length > 0) {
    const { error } = await supabase.from('expenses').insert(expenses);
    if (error) throw error;
  }
  if (incomes.length > 0) {
    const { error } = await supabase.from('incomes').insert(incomes);
    if (error) throw error;
  }
}
