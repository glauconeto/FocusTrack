"use client";

import { useState, useTransition } from "react";
import { createTransaction, deleteTransaction } from "@/app/finances/actions";
import { getCategories } from "@/app/finances/actions/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

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

interface FinancesOverviewProps {
  transactions: Transaction[];
  summary: {
    monthIncome: number;
    monthExpense: number;
  };
}

export function FinancesOverview({ transactions, summary }: FinancesOverviewProps) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");

  const balance = summary.monthIncome - summary.monthExpense;

  const handleSubmit = () => {
    if (!amount || !categoryId) return;
    startTransition(async () => {
      await createTransaction({
        amount: parseFloat(amount),
        type,
        categoryId,
        description: description || undefined,
      });
      setAmount("");
      setDescription("");
      setShowForm(false);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(() => deleteTransaction(id));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Entradas</p>
          <p className="text-lg font-bold text-green-700">
            {formatCurrency(summary.monthIncome)}
          </p>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-red-600 font-medium">Saídas</p>
          <p className="text-lg font-bold text-red-700">
            {formatCurrency(summary.monthExpense)}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${balance >= 0 ? "bg-blue-50" : "bg-orange-50"}`}>
          <p className="text-sm text-gray-600 font-medium">Saldo</p>
          <p className={`text-lg font-bold ${balance >= 0 ? "text-blue-700" : "text-orange-700"}`}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      <Button onClick={() => setShowForm(!showForm)} variant="secondary" className="w-full">
        {showForm ? "Cancelar" : "+ Nova Transação"}
      </Button>

      {showForm && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("INCOME")}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                type === "INCOME"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Entrada
            </button>
            <button
              type="button"
              onClick={() => setType("EXPENSE")}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                type === "EXPENSE"
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Saída
            </button>
          </div>
          <Input
            type="number"
            placeholder="Valor"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300"
          >
            <option value="">Selecione a categoria</option>
          </select>
          <Input
            placeholder="Descrição (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button onClick={handleSubmit} disabled={isPending} className="w-full">
            Salvar
          </Button>
        </div>
      )}

      {transactions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Nenhuma transação ainda.
        </p>
      ) : (
        <ul className="space-y-2 max-h-60 overflow-y-auto">
          {transactions.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {t.category.name}
                </p>
                {t.description && (
                  <p className="text-sm text-gray-500">{t.description}</p>
                )}
              </div>
              <div className="text-right">
                <p className={`font-bold ${t.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                  {t.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(Number(t.amount))}
                </p>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-xs transition-opacity"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
