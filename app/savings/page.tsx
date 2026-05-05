import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SavingsGoals } from "@/components/savings/savings-goals";
import { getSavingsGoals, getSavingsSummary } from "@/app/savings/actions";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

async function getSavingsData() {
  const [goals, summary] = await Promise.all([
    getSavingsGoals(),
    getSavingsSummary(),
  ]);

  return { goals, summary };
}

export default async function SavingsPage() {
  const { goals, summary } = await getSavingsData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Metas de Economia</h1>
          <p className="text-gray-600 mt-1">Acompanhe seus objetivos financeiros</p>
        </div>
        <Link href="/">
          <Button variant="secondary">Voltar ao Dashboard</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{summary.totalGoals}</p>
              <p className="text-gray-600 text-sm">Total de Metas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{summary.completedGoals}</p>
              <p className="text-gray-600 text-sm">Metas Concluídas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(summary.totalCurrent)}
              </p>
              <p className="text-gray-600 text-sm">Economia Atual</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(summary.totalTarget)}
              </p>
              <p className="text-gray-600 text-sm">Meta Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {summary.totalGoals > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Progresso Geral</h2>
              <span className="text-sm text-gray-600">
                {Math.round(summary.overallProgress)}% concluído
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${Math.min(summary.overallProgress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>0%</span>
                <span className="font-medium">{Math.round(summary.overallProgress)}%</span>
                <span>100%</span>
              </div>
              <div className="pt-2 text-center">
                <p className="text-sm text-gray-600">
                  {formatCurrency(summary.totalCurrent)} de {formatCurrency(summary.totalTarget)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Faltam {formatCurrency(summary.totalTarget - summary.totalCurrent)} para atingir todas as metas
                </p>
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
          <SavingsGoals goals={goals} />
        </CardContent>
      </Card>
    </div>
  );
}
