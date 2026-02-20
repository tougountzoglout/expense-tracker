const STORAGE_KEY = 'expense_tracker_data';

const getDefaultData = () => ({
  expenses: [],
  incomes: [],
  categories: [
    'Insurance', 'Telecom', 'Utilities', 'Childcare', 'Fitness',
    'Subscription', 'Energy', 'Building', 'Groceries', 'Food', 'Other'
  ],
  incomeCategories: [
    'Salary', 'Freelance', 'Investments', 'Rental', 'Bonus', 'Other'
  ],
});

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    const parsed = JSON.parse(raw);
    if (!parsed.incomes) parsed.incomes = [];
    if (!parsed.incomeCategories) parsed.incomeCategories = getDefaultData().incomeCategories;
    return parsed;
  } catch {
    return getDefaultData();
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addExpense(expense) {
  const data = loadData();
  data.expenses.push({ ...expense, id: crypto.randomUUID() });
  saveData(data);
  return data;
}

export function deleteExpense(id) {
  const data = loadData();
  data.expenses = data.expenses.filter(e => e.id !== id);
  saveData(data);
  return data;
}

export function updateExpense(id, updates) {
  const data = loadData();
  data.expenses = data.expenses.map(e => e.id === id ? { ...e, ...updates } : e);
  saveData(data);
  return data;
}

export function addIncome(income) {
  const data = loadData();
  data.incomes.push({ ...income, id: crypto.randomUUID() });
  saveData(data);
  return data;
}

export function deleteIncome(id) {
  const data = loadData();
  data.incomes = data.incomes.filter(e => e.id !== id);
  saveData(data);
  return data;
}

export function getExpensesByMonth(expenses, year, month) {
  return expenses.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

export function getIncomesByMonth(incomes, year, month) {
  return incomes.filter(i => {
    const d = new Date(i.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

export function getUniqueMonths(entries) {
  const set = new Set();
  entries.forEach(e => {
    const d = new Date(e.date);
    set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  });
  return Array.from(set).sort().reverse();
}

export function getMonthlyTotals(entries) {
  const map = {};
  entries.forEach(e => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map[key] = (map[key] || 0) + e.amount;
  });
  return map;
}

export function getCategoryTotals(entries) {
  const map = {};
  entries.forEach(e => {
    map[e.category] = (map[e.category] || 0) + e.amount;
  });
  return map;
}

export function getAverages(entries) {
  const months = getUniqueMonths(entries);
  if (months.length === 0) return { monthly: 0, perCategory: {} };

  const total = entries.reduce((s, e) => s + e.amount, 0);
  const monthly = total / months.length;

  const catTotals = getCategoryTotals(entries);
  const perCategory = {};
  for (const [cat, sum] of Object.entries(catTotals)) {
    perCategory[cat] = sum / months.length;
  }

  return { monthly, perCategory };
}

export function getMonthlySavings(expenses, incomes) {
  const expTotals = getMonthlyTotals(expenses);
  const incTotals = getMonthlyTotals(incomes);
  const allKeys = new Set([...Object.keys(expTotals), ...Object.keys(incTotals)]);
  const result = {};
  allKeys.forEach(key => {
    result[key] = (incTotals[key] || 0) - (expTotals[key] || 0);
  });
  return result;
}

export function getMonthlyAvailable(expenses, incomes, deposits) {
  const expTotals = getMonthlyTotals(expenses);
  const incTotals = getMonthlyTotals(incomes);
  const depTotals = getMonthlyTotals(deposits);
  const allKeys = new Set([...Object.keys(expTotals), ...Object.keys(incTotals), ...Object.keys(depTotals)]);
  const result = {};
  allKeys.forEach(key => {
    result[key] = (incTotals[key] || 0) - (expTotals[key] || 0) - (depTotals[key] || 0);
  });
  return result;
}

export function exportToCsv() {
  const data = loadData();
  const header = 'type,name,amount,category,date';
  const rows = [];
  data.expenses.forEach(e => {
    rows.push(`expense,"${e.name.replace(/"/g, '""')}",${e.amount},"${e.category}",${e.date}`);
  });
  data.incomes.forEach(i => {
    rows.push(`income,"${i.name.replace(/"/g, '""')}",${i.amount},"${i.category}",${i.date}`);
  });
  return [header, ...rows].join('\n');
}

export function importFromCsv(csvStr) {
  const lines = csvStr.trim().split('\n');
  if (lines.length < 2) throw new Error('Empty CSV');

  const header = lines[0].toLowerCase();
  if (!header.includes('type') || !header.includes('amount')) {
    throw new Error('Invalid CSV format. Expected: type,name,amount,category,date');
  }

  const data = loadData();

  for (let i = 1; i < lines.length; i++) {
    const parts = parseCsvLine(lines[i]);
    if (parts.length < 5) continue;

    const [type, name, amountStr, category, date] = parts;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || !name) continue;

    const entry = { id: crypto.randomUUID(), name, amount, category, date };

    if (type.toLowerCase() === 'income') {
      data.incomes.push(entry);
    } else {
      data.expenses.push(entry);
    }
  }

  saveData(data);
  return data;
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
