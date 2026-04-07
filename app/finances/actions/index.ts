"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";

interface CreateTransactionInput {
  amount: number;
  type: "INCOME" | "EXPENSE";
  categoryId: string;
  description?: string;
  date?: Date;
}

export async function createTransaction(input: CreateTransactionInput) {
  const transaction = await prisma.transaction.create({
    data: {
      amount: new Prisma.Decimal(input.amount),
      type: input.type,
      categoryId: input.categoryId,
      description: input.description,
      date: input.date || new Date(),
    },
    include: { category: true },
  });
  revalidatePath("/");
  return transaction;
}

export async function deleteTransaction(id: string) {
  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/");
}

export async function getTransactions(limit?: number) {
  return prisma.transaction.findMany({
    include: { category: true },
    orderBy: { date: "desc" },
    take: limit,
  });
}

export async function getFinancialSummary() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [income, expense, totalIncome, totalExpense] = await Promise.all([
    prisma.transaction.aggregate({
      where: { type: "INCOME", date: { gte: firstDayOfMonth } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { type: "EXPENSE", date: { gte: firstDayOfMonth } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { type: "INCOME" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { type: "EXPENSE" },
      _sum: { amount: true },
    }),
  ]);

  return {
    month: {
      income: Number(income._sum.amount) || 0,
      expense: Number(expense._sum.amount) || 0,
      balance: (Number(income._sum.amount) || 0) - (Number(expense._sum.amount) || 0),
    },
    total: {
      income: Number(totalIncome._sum.amount) || 0,
      expense: Number(totalExpense._sum.amount) || 0,
      balance: (Number(totalIncome._sum.amount) || 0) - (Number(totalExpense._sum.amount) || 0),
    },
  };
}
