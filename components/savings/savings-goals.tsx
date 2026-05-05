"use client";

import { useState, useTransition } from "react";
import { createSavingsGoal, updateSavingsGoalProgress, deleteSavingsGoal } from "@/app/savings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number | { toNumber(): number };
  currentAmount: number | { toNumber(): number };
  createdAt: Date;
  updatedAt: Date;
}

interface SavingsGoalsProps {
  goals: SavingsGoal[];
}

export function SavingsGoals({ goals }: SavingsGoalsProps) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [showAddProgress, setShowAddProgress] = useState<string | null>(null);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [progressAmount, setProgressAmount] = useState("");

  const handleCreateGoal = () => {
    if (!newGoalName.trim() || !newGoalTarget) return;
    startTransition(async () => {
      await createSavingsGoal({
        name: newGoalName,
        targetAmount: parseFloat(newGoalTarget),
      });
      setNewGoalName("");
      setNewGoalTarget("");
      setShowForm(false);
    });
  };

  const handleAddProgress = (goalId: string) => {
    if (!progressAmount) return;
    startTransition(async () => {
      await updateSavingsGoalProgress(goalId, parseFloat(progressAmount));
      setProgressAmount("");
      setShowAddProgress(null);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(() => deleteSavingsGoal(id));
  };

  const getProgress = (goal: SavingsGoal) => {
    const current = Number(goal.currentAmount);
    const target = Number(goal.targetAmount);
    return target > 0 ? (current / target) * 100 : 0;
  };

  const isCompleted = (goal: SavingsGoal) => {
    return Number(goal.currentAmount) >= Number(goal.targetAmount);
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowForm(!showForm)} variant="secondary" className="w-full">
        {showForm ? "Cancelar" : "+ Nova Meta de Economia"}
      </Button>

      {showForm && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <Input
            placeholder="Nome da meta (ex: Férias, Emergency Fund)"
            value={newGoalName}
            onChange={(e) => setNewGoalName(e.target.value)}
            disabled={isPending}
          />
          <Input
            type="number"
            placeholder="Valor alvo"
            value={newGoalTarget}
            onChange={(e) => setNewGoalTarget(e.target.value)}
            step="0.01"
            disabled={isPending}
          />
          <Button onClick={handleCreateGoal} disabled={isPending} className="w-full">
            Criar Meta
          </Button>
        </div>
      )}

      {goals.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Nenhuma meta de economia ainda. Crie sua primeira meta!
        </p>
      ) : (
        <ul className="space-y-4">
          {goals.map((goal) => {
            const progress = getProgress(goal);
            const completed = isCompleted(goal);
            
            return (
              <li
                key={goal.id}
                className={`p-4 rounded-lg border-2 ${
                  completed ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-semibold text-lg ${
                        completed ? "text-green-700" : "text-gray-900"
                      }`}>
                        {goal.name}
                        {completed && " ✅"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(Number(goal.currentAmount))} de {formatCurrency(Number(goal.targetAmount))}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progresso</span>
                      <span className={`font-medium ${
                        completed ? "text-green-600" : "text-blue-600"
                      }`}>
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          completed 
                            ? "bg-green-500" 
                            : "bg-gradient-to-r from-blue-500 to-purple-500"
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {!completed && (
                    <div className="flex gap-2">
                      {showAddProgress === goal.id ? (
                        <div className="flex gap-2 flex-1">
                          <Input
                            type="number"
                            placeholder="Valor a adicionar"
                            value={progressAmount}
                            onChange={(e) => setProgressAmount(e.target.value)}
                            step="0.01"
                            className="flex-1"
                          />
                          <Button
                            onClick={() => handleAddProgress(goal.id)}
                            disabled={isPending}
                            size="sm"
                          >
                            Adicionar
                          </Button>
                          <Button
                            onClick={() => setShowAddProgress(null)}
                            variant="secondary"
                            size="sm"
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setShowAddProgress(goal.id)}
                          variant="secondary"
                          size="sm"
                          className="w-full"
                        >
                          + Adicionar Progresso
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
