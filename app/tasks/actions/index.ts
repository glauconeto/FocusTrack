"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface CreateTaskInput {
  title: string;
  description?: string;
  weekStart: Date;
  weekEnd: Date;
}

export async function createTask(input: CreateTaskInput) {
  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      weekStart: input.weekStart,
      weekEnd: input.weekEnd,
    },
  });
  revalidatePath("/");
  return task;
}

export async function toggleTask(id: string): Promise<void> {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new Error("Task not found");
  
  await prisma.task.update({
    where: { id },
    data: { completed: !task.completed },
  });
  revalidatePath("/");
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath("/");
}

export async function getTasksByWeek(weekStart: Date, weekEnd: Date) {
  return prisma.task.findMany({
    where: {
      weekStart: { gte: weekStart },
      weekEnd: { lte: weekEnd },
    },
    orderBy: { createdAt: "desc" },
  });
}
