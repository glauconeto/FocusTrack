import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TaskList } from "@/components/tasks/task-list";
import { FinancesOverview } from "@/components/finances/finances-overview";
import { getWeekBounds } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { seedCategories } from "@/app/finances/actions/categories";

async function getDashboardData() {
  const { weekStart, weekEnd } = getWeekBounds();
  
  const [tasks, transactions, categoriesCount] = await Promise.all([
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
  };
}

export default async function DashboardPage() {
  const { tasks, transactions, summary, weekBounds } = await getDashboardData();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">FocusTrack</h1>
        <p className="text-gray-600 mt-1">Suas metas e finanças em um só lugar</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
      </div>
    </div>
  );
}
