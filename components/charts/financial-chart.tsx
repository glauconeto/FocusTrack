"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface Transaction {
  id: string;
  amount: number | { toNumber(): number };
  type: "INCOME" | "EXPENSE";
  category: {
    name: string;
    type: "INCOME" | "EXPENSE";
  };
  description: string | null;
  date: Date;
}

interface FinancialChartProps {
  transactions: Transaction[];
  summary: {
    monthIncome: number;
    monthExpense: number;
  };
}

const COLORS = {
  income: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
  expense: ['#ef4444', '#f87171', '#fca5a5', '#fecaca'],
};

export function FinancialChart({ transactions, summary }: FinancialChartProps) {
  const incomeData = transactions
    .filter(t => t.type === "INCOME")
    .reduce((acc, t) => {
      const existing = acc.find(item => item.name === t.category.name);
      if (existing) {
        existing.value += Number(t.amount);
      } else {
        acc.push({ name: t.category.name, value: Number(t.amount) });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

  const expenseData = transactions
    .filter(t => t.type === "EXPENSE")
    .reduce((acc, t) => {
      const existing = acc.find(item => item.name === t.category.name);
      if (existing) {
        existing.value += Number(t.amount);
      } else {
        acc.push({ name: t.category.name, value: Number(t.amount) });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

  const monthlyData = [
    { name: 'Receitas', value: summary.monthIncome, fill: '#10b981' },
    { name: 'Despesas', value: summary.monthExpense, fill: '#ef4444' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
          <p className="text-sm font-medium">{`${label}: R$ ${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
          <p className="text-sm font-medium">{`${payload[0].name}: R$ ${payload[0].value.toFixed(2)}`}</p>
          <p className="text-xs text-gray-500">{`${((payload[0].percent || 0) * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Receitas */}
        {incomeData.length > 0 && (
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Receitas por Categoria</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={incomeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.income[index % COLORS.income.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gráfico de Pizza - Despesas */}
        {expenseData.length > 0 && (
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Despesas por Categoria</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.expense[index % COLORS.expense.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Gráfico de Barras - Resumo Mensal */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Mensal</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda de Cores */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600">Receitas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-600">Despesas</span>
        </div>
      </div>
    </div>
  );
}
