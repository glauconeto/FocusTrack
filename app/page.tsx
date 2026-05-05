import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TaskList } from "@/components/tasks/task-list";
import { FinancesOverview } from "@/components/finances/finances-overview";
import { SavingsGoals } from "@/components/savings/savings-goals";
import { getWeekBounds } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { seedCategories } from "@/app/finances/actions/categories";
import { getSavingsGoals, getSavingsSummary } from "@/app/savings/actions";

async function getDashboardData() {
  const { weekStart, weekEnd } = getWeekBounds();
  
  const [tasks, transactions, categoriesCount, savingsGoals, savingsSummary] = await Promise.all([
    prisma.task.findMany({
      where: {
        weekStart: { gte: weekStart },
        weekEnd: { lte: weekEnd },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaction.findMany({
      include: { category: true },
      orderBy: { date: "desc" },
      take: 10,
    }),
    prisma.category.count(),
    getSavingsGoals(),
    getSavingsSummary(),
  ]);

  if (categoriesCount === 0) {
    await seedCategories();
  }

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [monthIncome, monthExpense] = await Promise.all([
    prisma.transaction.aggregate({
      where: { type: "INCOME", date: { gte: firstDayOfMonth } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { type: "EXPENSE", date: { gte: firstDayOfMonth } },
      _sum: { amount: true },
    }),
  ]);

  return {
    tasks,
    transactions,
    summary: {
      monthIncome: Number(monthIncome._sum.amount) || 0,
      monthExpense: Number(monthExpense._sum.amount) || 0,
    },
    weekBounds: { weekStart, weekEnd },
    savingsGoals,
    savingsSummary,
  };
}

export default async function DashboardPage() {
  const { tasks, transactions, summary, weekBounds, savingsGoals, savingsSummary } = await getDashboardData();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">FocusTrack</h1>
        <p className="text-gray-600 mt-1">Suas metas e finanças em um só lugar</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Metas da Semana</h2>
              <a 
                href="/tasks" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver todas
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <TaskList tasks={tasks} weekBounds={weekBounds} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Finanças</h2>
              <a 
                href="/finances" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver todas
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <FinancesOverview 
              transactions={transactions} 
              summary={summary}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Metas de Economia</h2>
              <a 
                href="/savings" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver todas
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-lg font-bold text-purple-700">{savingsSummary.totalGoals}</p>
                  <p className="text-xs text-purple-600">Metas</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-700">{savingsSummary.completedGoals}</p>
                  <p className="text-xs text-green-600">Concluídas</p>
                </div>
              </div>
              <SavingsGoals goals={savingsGoals.slice(0, 3)} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
