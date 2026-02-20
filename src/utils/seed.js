import { loadData, saveData } from './storage';

const SEED_EXPENSES = [
  { name: 'Ethniki', amount: 150, category: 'Insurance' },
  { name: 'Vodafone (Mobile)', amount: 72.16, category: 'Telecom' },
  { name: 'Vodafone (Internet)', amount: 88.88, category: 'Telecom' },
  { name: 'Eydap', amount: 35.55, category: 'Utilities' },
  { name: 'Zenith Electricity', amount: 75.52, category: 'Energy' },
  { name: 'Paidikos Stathmos (Monthly)', amount: 80, category: 'Childcare' },
  { name: 'Gym', amount: 120, category: 'Fitness' },
  { name: 'Replayce', amount: 90, category: 'Subscription' },
  { name: 'Zenith Gas', amount: 35, category: 'Energy' },
  { name: 'Koinoxrhsta', amount: 100, category: 'Building' },
  { name: 'Super Market', amount: 400, category: 'Groceries' },
  { name: 'Local Market', amount: 200, category: 'Groceries' },
  { name: 'Meat', amount: 100, category: 'Food' },
  { name: 'Paidikos Stathmos (Tuition)', amount: 350, category: 'Childcare' },
];

const SEED_INCOMES = [
  { name: 'Monthly Salary', amount: 2800, category: 'Salary' },
];

export function seedIfEmpty() {
  const data = loadData();
  if (data.expenses.length > 0) return data;

  const now = new Date();
  for (let offset = 0; offset < 3; offset++) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 15);
    const dateStr = date.toISOString().split('T')[0];

    SEED_EXPENSES.forEach(exp => {
      const variation = 1 + (Math.random() * 0.1 - 0.05);
      data.expenses.push({
        id: crypto.randomUUID(),
        name: exp.name,
        amount: offset === 0 ? exp.amount : Math.round(exp.amount * variation * 100) / 100,
        category: exp.category,
        date: dateStr,
      });
    });

    SEED_INCOMES.forEach(inc => {
      data.incomes.push({
        id: crypto.randomUUID(),
        name: inc.name,
        amount: inc.amount,
        category: inc.category,
        date: dateStr,
      });
    });
  }

  saveData(data);
  return data;
}
