/*import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  AlertTriangle,
  Calendar,
  Tag,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Expense, Income } from '../../types';

const categories = [
  { name: 'Food', color: '#EF4444', icon: '🍕' },
  { name: 'Transport', color: '#3B82F6', icon: '🚗' },
  { name: 'Entertainment', color: '#8B5CF6', icon: '🎬' },
  { name: 'Shopping', color: '#F59E0B', icon: '🛍️' },
  { name: 'Bills', color: '#10B981', icon: '📄' },
  { name: 'Healthcare', color: '#EF4444', icon: '🏥' },
  { name: 'Education', color: '#6366F1', icon: '📚' },
  { name: 'Other', color: '#6B7280', icon: '📦' },
];
type DashboardProps = {
  categoryData: any[];
  setCategoryData: React.Dispatch<React.SetStateAction<any[]>>;
  monthlyData: any[];
  setMonthlyData: React.Dispatch<React.SetStateAction<any[]>>;
};
export const Dashboard: React.FC<DashboardProps> = ({categoryData, setCategoryData, monthlyData, setMonthlyData}) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);

  // Form states
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Food');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeSource, setIncomeSource] = useState('');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expensesResult, incomeResult] = await Promise.all([
        supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('income')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
      ]);

      if (expensesResult.data) setExpenses(expensesResult.data);
      if (incomeResult.data) setIncome(incomeResult.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([
          {
            user_id: user.id,
            amount: parseFloat(expenseAmount),
            category: expenseCategory,
            description: expenseDescription,
            date: new Date().toISOString().split('T')[0]
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setExpenses([data, ...expenses]);
      setExpenseAmount('');
      setExpenseDescription('');
      setShowExpenseForm(false);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const addIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('income')
        .insert([
          {
            user_id: user.id,
            amount: parseFloat(incomeAmount),
            source: incomeSource,
            date: new Date().toISOString().split('T')[0]
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setIncome([data, ...income]);
      setIncomeAmount('');
      setIncomeSource('');
      setShowIncomeForm(false);
    } catch (error) {
      console.error('Error adding income:', error);
    }
  };

  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remainingBalance = totalIncome - totalExpenses;
  const spentPercentage = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const isWarning = spentPercentage >= 80;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */
      /*<div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Track your finances and spending habits</p>
      </div>

      {/* Stats Cards */
      /*<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Income</p>
              <p className="text-2xl font-bold">₹{totalIncome.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Total Expenses</p>
              <p className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-6 text-white ${
            remainingBalance >= 0
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
              : 'bg-gradient-to-r from-orange-500 to-red-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Remaining Balance</p>
              <p className="text-2xl font-bold">₹{remainingBalance.toLocaleString()}</p>
            </div>
            <Wallet className="w-8 h-8 text-white/70" />
          </div>
        </motion.div>
      </div>

      {/* Warning Alert */
      /*{isWarning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center space-x-3"
        >
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-800">Spending Alert!</h3>
            <p className="text-amber-700 text-sm">
              You've spent {spentPercentage.toFixed(1)}% of your income. Consider reviewing your expenses.
            </p>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */
      /*<div className="flex flex-col sm:flex-row gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowExpenseForm(true)}
          className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Expense
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowIncomeForm(true)}
          className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Income
        </motion.button>
      </div>

      {/* Recent Expenses */
      /*<div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Expenses</h2>
        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No expenses yet. Add your first expense to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.slice(0, 5).map((expense, index) => {
              const category = categories.find(c => c.name === expense.category);
              return (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: category?.color }}
                    >
                      {category?.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{expense.description}</p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Tag className="w-4 h-4 mr-1" />
                        {expense.category}
                        <Calendar className="w-4 h-4 ml-3 mr-1" />
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-red-600">-₹{expense.amount.toLocaleString()}</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Expense Form Modal */
      /*{showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Expense</h2>
            <form onSubmit={addExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.name} value={category.name}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter description"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExpenseForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Income Form Modal */
      /*{showIncomeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Income</h2>
            <form onSubmit={addIncome} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                <input
                  type="text"
                  value={incomeSource}
                  onChange={(e) => setIncomeSource(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Salary, Freelance, Investment"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowIncomeForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Income
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};*/
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  AlertTriangle,
  Calendar,
  Tag,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Expense, Income } from '../../types';

const categories = [
  { name: 'Food', color: '#EF4444', icon: '🍕' },
  { name: 'Transport', color: '#3B82F6', icon: '🚗' },
  { name: 'Entertainment', color: '#8B5CF6', icon: '🎬' },
  { name: 'Shopping', color: '#F59E0B', icon: '🛍' },
  { name: 'Bills', color: '#10B981', icon: '📄' },
  { name: 'Healthcare', color: '#EF4444', icon: '🏥' },
  { name: 'Education', color: '#6366F1', icon: '📚' },
  { name: 'Other', color: '#6B7280', icon: '📦' },
];

type DashboardProps = {
  categoryData: any[];
  setCategoryData: React.Dispatch<React.SetStateAction<any[]>>;
  monthlyData: any[];
  setMonthlyData: React.Dispatch<React.SetStateAction<any[]>>;
};

export const Dashboard: React.FC<DashboardProps> = ({
  categoryData,
  setCategoryData,
  monthlyData,
  setMonthlyData,
}) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);

  // Form states
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Food');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeSource, setIncomeSource] = useState('');

  // Fix: transform expenses for charts to expected keys and colors
  const transformExpensesToCategoryData = (expenses: Expense[]) => {
    const categoryMap: Record<string, number> = {};
    expenses.forEach(exp => {
      categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount;
    });
    return Object.entries(categoryMap).map(([category, amount]) => {
      const categoryInfo = categories.find(c => c.name === category);
      return {
        category,
        amount,
        color: categoryInfo ? categoryInfo.color : '#888888'
      };
    });
  };

  // Monthly income data transformation - no change needed
  const transformIncomeToMonthlyData = (income: Income[]) => {
    const monthMap: Record<string, number> = {};
    income.forEach(inc => {
      const month = new Date(inc.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthMap[month] = (monthMap[month] || 0) + inc.amount;
    });
    return Object.entries(monthMap).map(([month, amount]) => ({ month, amount }));
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expensesResult, incomeResult] = await Promise.all([
        supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('income')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
      ]);

      if (expensesResult.data) {
        setExpenses(expensesResult.data);
        setCategoryData(transformExpensesToCategoryData(expensesResult.data));
      }
      if (incomeResult.data) {
        setIncome(incomeResult.data);
        setMonthlyData(transformIncomeToMonthlyData(incomeResult.data));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([
          {
            user_id: user.id,
            amount: parseFloat(expenseAmount),
            category: expenseCategory,
            description: expenseDescription,
            date: new Date().toISOString().split('T')[0]
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newExpenses = [data, ...expenses];
      setExpenses(newExpenses);
      setCategoryData(transformExpensesToCategoryData(newExpenses));

      setExpenseAmount('');
      setExpenseDescription('');
      setShowExpenseForm(false);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const addIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('income')
        .insert([
          {
            user_id: user.id,
            amount: parseFloat(incomeAmount),
            source: incomeSource,
            date: new Date().toISOString().split('T')[0]
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newIncome = [data, ...income];
      setIncome(newIncome);
      setMonthlyData(transformIncomeToMonthlyData(newIncome));

      setIncomeAmount('');
      setIncomeSource('');
      setShowIncomeForm(false);
    } catch (error) {
      console.error('Error adding income:', error);
    }
  };

  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remainingBalance = totalIncome - totalExpenses;
  const spentPercentage = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const isWarning = spentPercentage >= 80;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Track your finances and spending habits</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Income</p>
              <p className="text-2xl font-bold">₹{totalIncome.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Total Expenses</p>
              <p className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-6 text-white ${
            remainingBalance >= 0
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
              : 'bg-gradient-to-r from-orange-500 to-red-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Remaining Balance</p>
              <p className="text-2xl font-bold">₹{remainingBalance.toLocaleString()}</p>
            </div>
            <Wallet className="w-8 h-8 text-white/70" />
          </div>
        </motion.div>
      </div>

      {/* Warning Alert */}
      {isWarning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center space-x-3"
        >
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-800">Spending Alert!</h3>
            <p className="text-amber-700 text-sm">
              You've spent {spentPercentage.toFixed(1)}% of your income. Consider reviewing your expenses.
            </p>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowExpenseForm(true)}
          className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Expense
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowIncomeForm(true)}
          className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Income
        </motion.button>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Expenses</h2>
        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No expenses yet. Add your first expense to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.slice(0, 5).map((expense, index) => {
              const category = categories.find(c => c.name === expense.category);
              return (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: category?.color }}
                    >
                      {category?.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{expense.description}</p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Tag className="w-4 h-4 mr-1" />
                        {expense.category}
                        <Calendar className="w-4 h-4 ml-3 mr-1" />
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-red-600">-₹{expense.amount.toLocaleString()}</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Expense</h2>
            <form onSubmit={addExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.name} value={category.name}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter description"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExpenseForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Income Form Modal */}
      {showIncomeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Income</h2>
            <form onSubmit={addIncome} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                <input
                  type="text"
                  value={incomeSource}
                  onChange={(e) => setIncomeSource(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Salary, Freelance, Investment"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowIncomeForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Income
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};