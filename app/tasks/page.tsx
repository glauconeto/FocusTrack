import { TaskList } from "@/components/tasks/task-list";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getWeekBounds, getPreviousWeek, getNextWeek } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getTasksData(weekStart: Date, weekEnd: Date) {
  const tasks = await prisma.task.findMany({
    where: {
      weekStart: { gte: weekStart },
      weekEnd: { lte: weekEnd },
    },
    orderBy: { createdAt: "desc" },
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return {
    tasks,
    stats: {
      completedCount,
      totalCount,
      progress
    }
  };
}

export default async function TasksPage({
  searchParams
}: {
  searchParams: { week?: string };
}) {
  const weekParam = searchParams.week;
  let weekStart, weekEnd;

  if (weekParam) {
    const date = new Date(weekParam);
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    weekStart = new Date(date.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
  } else {
    ({ weekStart, weekEnd } = getWeekBounds());
  }

  const { tasks, stats } = await getTasksData(weekStart, weekEnd);
  const previousWeek = getPreviousWeek(weekStart);
  const nextWeek = getNextWeek(weekStart);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Metas Semanais</h1>
          <p className="text-gray-600 mt-1">
            {formatDate(weekStart)} - {formatDate(weekEnd)}
          </p>
        </div>
        <Link href="/">
          <Button variant="secondary">Voltar ao Dashboard</Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 justify-center">
        <Link href={`/tasks?week=${previousWeek.toISOString()}`}>
          <Button variant="secondary" className="flex items-center gap-2">
            ← Semana Anterior
          </Button>
        </Link>
        <Link href={`/tasks`}>
          <Button variant="primary">Semana Atual</Button>
        </Link>
        <Link href={`/tasks?week=${nextWeek.toISOString()}`}>
          <Button variant="secondary" className="flex items-center gap-2">
            Próxima Semana →
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.totalCount}</p>
              <p className="text-gray-600">Total de Metas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.completedCount}</p>
              <p className="text-gray-600">Concluídas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{Math.round(stats.progress)}%</p>
              <p className="text-gray-600">Progresso</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.totalCount > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Progresso da Semana</h2>
              <span className="text-sm text-gray-600">
                {stats.completedCount} de {stats.totalCount} metas concluídas
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>0%</span>
                <span className="font-medium">{Math.round(stats.progress)}%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Minhas Metas</h2>
        </CardHeader>
        <CardContent>
          <TaskList tasks={tasks} weekBounds={{ weekStart, weekEnd }} />
        </CardContent>
      </Card>
    </div>
  );
}
