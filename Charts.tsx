/*import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Expense } from '../../types';
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

const categoryColors = {
  'Food': '#EF4444',
  'Transport': '#3B82F6',
  'Entertainment': '#8B5CF6',
  'Shopping': '#F59E0B',
  'Bills': '#10B981',
  'Healthcare': '#EF4444',
  'Education': '#6366F1',
  'Other': '#6B7280',
};

export const Charts: React.FC = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'pie' | 'bar' | 'line'>('pie');

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: true });

      if (error) throw error;
      if (data) setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for charts
  const categoryData = expenses.reduce((acc: any[], expense) => {
    const existingCategory = acc.find(item => item.category === expense.category);
    if (existingCategory) {
      existingCategory.amount += expense.amount;
    } else {
      acc.push({
        category: expense.category,
        amount: expense.amount,
        color: categoryColors[expense.category as keyof typeof categoryColors] || '#6B7280'
      });
    }
    return acc;
  }, []);

  // Monthly expenses data
  const monthlyData = expenses.reduce((acc: any[], expense) => {
    const month = new Date(expense.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const existingMonth = acc.find(item => item.month === month);
    if (existingMonth) {
      existingMonth.amount += expense.amount;
    } else {
      acc.push({ month, amount: expense.amount });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="p-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Charts</h1>
          <p className="text-gray-600">Visualize your spending patterns</p>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Data Available</h3>
            <p className="text-gray-500">Add some expenses to see your charts come to life!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */
  

     /* <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Charts</h1>
        <p className="text-gray-600">Visualize your spending patterns and trends</p>
      </div>

      ector */
      /*
      <div className="flex flex-wrap gap-4">
        {[
          { id: 'pie', label: 'Pie Chart', icon: PieChartIcon },
          { id: 'bar', label: 'Bar Chart', icon: BarChart3 },
          { id: 'line', label: 'Trend Chart', icon: TrendingUp },
        ].map((chart) => {
          const Icon = chart.icon;
          return (
            <motion.button
              key={chart.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveChart(chart.id as any)}
              className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all ${
                activeChart === chart.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
              }`}
            >
              <Icon className="w-5 h-5 mr-2" />
              {chart.label}
            </motion.button>
          );
        })}
      </div>

      {/* Charts Container 
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Main Chart 
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 xl:col-span-2"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {activeChart === 'pie' && 'Expenses by Category'}
            {activeChart === 'bar' && 'Category Comparison'}
            {activeChart === 'line' && 'Monthly Spending Trend'}
          </h2>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              {activeChart === 'pie' && (
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="amount"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Amount']}
                    labelFormatter={(label) => `Category: ${label}`}
                  />
                  <Legend />
                </PieChart>
              )}

              {activeChart === 'bar' && (
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Amount']}
                  />
                  <Legend />
                  <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}

              {activeChart === 'line' && (
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Amount']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>

        /* Category Breakdown 
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {categoryData.map((category, index) => {
              const total = categoryData.reduce((sum, cat) => sum + cat.amount, 0);
              const percentage = ((category.amount / total) * 100).toFixed(1);
              
              return (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium text-gray-700">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{category.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{percentage}%</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>*/

        /* Statistics */
       /* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Expenses</span>
              <span className="font-bold text-gray-900">
                ₹{expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Number of Transactions</span>
              <span className="font-bold text-gray-900">{expenses.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average per Transaction</span>
              <span className="font-bold text-gray-900">
                ₹{(expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length).toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Highest Category</span>
              <span className="font-bold text-gray-900">
                {categoryData.sort((a, b) => b.amount - a.amount)[0]?.category || 'N/A'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};*/
import React, { useState } from 'react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  CartesianGrid, XAxis, YAxis,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type Props = {
  categoryData: any[];
  monthlyData: any[];
};

const Charts: React.FC<Props> = ({ categoryData, monthlyData }) => {
  const [activeChart, setActiveChart] = useState<'pie' | 'bar' | 'line'>('pie');

  const hasCategoryData = categoryData && categoryData.length > 0;
  const hasMonthlyData = monthlyData && monthlyData.length > 0;

  const renderNoData = () => (
    <div className="flex items-center justify-center h-full text-gray-500">
      No data available for this chart.
    </div>
  );

  return (
    <div className="p-4">
      {/* Chart type buttons */}
      <div className="mb-4 flex gap-2">
        <button onClick={() => setActiveChart('pie')} className="px-3 py-1 bg-blue-500 text-white rounded">Pie</button>
        <button onClick={() => setActiveChart('bar')} className="px-3 py-1 bg-blue-500 text-white rounded">Bar</button>
        <button onClick={() => setActiveChart('line')} className="px-3 py-1 bg-blue-500 text-white rounded">Line</button>
      </div>

      <div className="h-96">
        {activeChart === 'pie' && hasCategoryData && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="amount"
                nameKey="category"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Amount']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'bar' && hasCategoryData && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Amount']} />
              <Legend />
              <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'line' && hasMonthlyData && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Amount']} />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Fallback when no data */}
        {(activeChart === 'pie' && !hasCategoryData) ||
         (activeChart === 'bar' && !hasCategoryData) ||
         (activeChart === 'line' && !hasMonthlyData)
          ? renderNoData()
          : null}
      </div>
    </div>
  );
};

export default Charts;