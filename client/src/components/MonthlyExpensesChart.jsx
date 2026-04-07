import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const MonthlyExpensesChart = ({ userId }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthlySummary();
  }, [userId]);

  const fetchMonthlySummary = async () => {
    try {
      setLoading(true);
      console.log('📊 [Chart] Fetching monthly summary for user:', userId);

      const response = await api.get('/budget/monthly-summary', {
        params: { user_id: userId }
      });

      console.log('📊 [Chart] Full response:', response); // ✅ Log entire response
      console.log('📊 [Chart] Response data:', response.data); // ✅ Log response.data
      console.log('📊 [Chart] Response data.data:', response.data.data); // ✅ Log response.data.data

      if (response.data.status === 'success') {
        console.log('✅ [Chart] Fetched monthly data:', response.data.data.length, 'months');
        setChartData(response.data.data);
      } else {
        console.log('❌ [Chart] Status is not success');
      }
    } catch (error) {
      console.error('❌ [Chart] Error fetching monthly summary:', error);
      toast.error('Failed to load monthly summary');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Monthly Summary</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Monthly Summary</h2>
        </div>
        <div className="flex items-center justify-center h-64 text-gray-400">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Monthly Summary</h2>
      </div>

      <div className="overflow-x-auto">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
              label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
            contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
            }}
            formatter={(value) => `$${value.toFixed(2)}`}
            labelStyle={{ color: '#fff' }}
            cursor={{ fill: 'transparent' }}
            />
            <Legend
              wrapperStyle={{ color: '#9CA3AF' }}
              iconType="square"
            />
            <Bar 
              dataKey="income" 
              fill="#10B981" 
              name="Income"
              radius={[8, 8, 0, 0]}
            />
            <Bar 
              dataKey="expense" 
              fill="#EF4444" 
              name="Expense"
              radius={[8, 8, 0, 0]}
            />
            <Bar 
              dataKey="balance" 
              fill="#3B82F6" 
              name="Balance"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        {chartData.length > 0 && (
          <>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
              <p className="text-lg font-bold text-green-600">
                ${chartData.reduce((sum, m) => sum + m.income, 0).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Expense</p>
              <p className="text-lg font-bold text-red-600">
                ${chartData.reduce((sum, m) => sum + m.expense, 0).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Balance</p>
              <p className="text-lg font-bold text-blue-600">
                ${chartData.reduce((sum, m) => sum + m.balance, 0).toFixed(2)}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MonthlyExpensesChart;