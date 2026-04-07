"use client";

import { useState, useTransition } from "react";
import { createTask, toggleTask, deleteTask } from "@/app/tasks/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  weekBounds: {
    weekStart: Date;
    weekEnd: Date;
  };
}

export function TaskList({ tasks, weekBounds }: TaskListProps) {
  const [isPending, startTransition] = useTransition();
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    startTransition(async () => {
      await createTask({
        title: newTaskTitle,
        weekStart: weekBounds.weekStart,
        weekEnd: weekBounds.weekEnd,
      });
      setNewTaskTitle("");
    });
  };

  const handleToggle = (id: string) => {
    startTransition(() => toggleTask(id));
  };

  const handleDelete = (id: string) => {
    startTransition(() => deleteTask(id));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Nova meta da semana..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
          disabled={isPending}
        />
        <Button onClick={handleAddTask} disabled={isPending}>
          Adicionar
        </Button>
      </div>

      {tasks.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{completedCount} de {tasks.length} concluídas</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Nenhuma meta ainda. Adicione sua primeira meta!
        </p>
      ) : (
        <ul className="space-y-2 max-h-80 overflow-y-auto">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task.id)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span
                className={`flex-1 ${
                  task.completed ? "line-through text-gray-400" : "text-gray-900"
                }`}
              >
                {task.title}
              </span>
              <button
                onClick={() => handleDelete(task.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
