"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";

interface CreateSavingsGoalInput {
  name: string;
  targetAmount: number;
}

export async function createSavingsGoal(input: CreateSavingsGoalInput) {
  const goal = await prisma.savingsGoal.create({
    data: {
      name: input.name,
      targetAmount: new Prisma.Decimal(input.targetAmount),
    },
  });
  revalidatePath("/");
  return goal;
}

export async function updateSavingsGoalProgress(id: string, amount: number) {
  const goal = await prisma.savingsGoal.findUnique({ where: { id } });
  if (!goal) throw new Error("Savings goal not found");
  
  const newCurrentAmount = goal.currentAmount.add(new Prisma.Decimal(amount));
  
  await prisma.savingsGoal.update({
    where: { id },
    data: { currentAmount: newCurrentAmount },
  });
  revalidatePath("/");
}

export async function deleteSavingsGoal(id: string) {
  await prisma.savingsGoal.delete({ where: { id } });
  revalidatePath("/");
}

export async function getSavingsGoals() {
  return prisma.savingsGoal.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getSavingsGoal(id: string) {
  return prisma.savingsGoal.findUnique({ where: { id } });
}

export async function getSavingsSummary() {
  const goals = await prisma.savingsGoal.findMany();
  
  const totalTarget = goals.reduce((sum, goal) => 
    sum.add(goal.targetAmount), new Prisma.Decimal(0)
  );
  const totalCurrent = goals.reduce((sum, goal) => 
    sum.add(goal.currentAmount), new Prisma.Decimal(0)
  );
  
  const completedGoals = goals.filter(goal => 
    goal.currentAmount.greaterThanOrEqualTo(goal.targetAmount)
  ).length;
  
  return {
    totalGoals: goals.length,
    completedGoals,
    totalTarget: Number(totalTarget),
    totalCurrent: Number(totalCurrent),
    overallProgress: totalTarget.greaterThan(0) 
      ? totalCurrent.div(totalTarget).toNumber() * 100 
      : 0,
  };
}
