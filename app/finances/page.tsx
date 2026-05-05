import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FinancesOverview } from "@/components/finances/finances-overview";
import { FinancialChart } from "@/components/charts/financial-chart";
import { createTransaction, deleteTransaction, getTransactions, getFinancialSummary } from "@/app/finances/actions";
import { getCategoriesByType } from "@/app/finances/actions/categories";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

async function getFinancesData() {
  const [transactions, summary] = await Promise.all([
    getTransactions(50),
    getFinancialSummary(),
  ]);

  const incomeCategories = await getCategoriesByType("INCOME");
  const expenseCategories = await getCategoriesByType("EXPENSE");

  return {
    transactions,
    summary,
    incomeCategories,
    expenseCategories,
  };
}

export default async function FinancesPage() {
  const { transactions, summary, incomeCategories, expenseCategories } = await getFinancesData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finanças</h1>
          <p className="text-gray-600 mt-1">Gerencie suas receitas e despesas</p>
        </div>
        <Link href="/">
          <Button variant="secondary">Voltar ao Dashboard</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.month.income)}
              </p>
              <p className="text-gray-600 text-sm">Receitas do Mês</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.month.expense)}
              </p>
              <p className="text-gray-600 text-sm">Despesas do Mês</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className={`text-2xl font-bold ${summary.month.balance >= 0 ? "text-blue-600" : "text-orange-600"}`}>
                {formatCurrency(summary.month.balance)}
              </p>
              <p className="text-gray-600 text-sm">Saldo do Mês</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className={`text-2xl font-bold ${summary.total.balance >= 0 ? "text-purple-600" : "text-orange-600"}`}>
                {formatCurrency(summary.total.balance)}
              </p>
              <p className="text-gray-600 text-sm">Saldo Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Nova Transação</h2>
          </CardHeader>
          <CardContent>
            <FinancesOverview transactions={transactions.slice(0, 5)} summary={{ monthIncome: summary.month.income, monthExpense: summary.month.expense }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Categorias</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Receitas</h3>
                <div className="grid grid-cols-2 gap-2">
                  {incomeCategories.map((category) => (
                    <div
                      key={category.id}
                      className="p-2 bg-green-50 rounded-lg text-sm text-green-700 text-center"
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Despesas</h3>
                <div className="grid grid-cols-2 gap-2">
                  {expenseCategories.map((category) => (
                    <div
                      key={category.id}
                      className="p-2 bg-red-50 rounded-lg text-sm text-red-700 text-center"
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Visualização Financeira</h2>
        </CardHeader>
        <CardContent>
          <FinancialChart transactions={transactions} summary={{ monthIncome: summary.month.income, monthExpense: summary.month.expense }} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Histórico de Transações</h2>
            <span className="text-sm text-gray-600">
              {transactions.length} transações recentes
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhuma transação encontrada. Adicione sua primeira transação!
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        transaction.type === "INCOME" ? "bg-green-500" : "bg-red-500"
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.category.name}
                        </p>
                        {transaction.description && (
                          <p className="text-sm text-gray-500">{transaction.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${
                      transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                    }`}>
                      {transaction.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(Number(transaction.amount))}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
