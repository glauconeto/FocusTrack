"use server";

import { prisma } from "@/lib/prisma";

const DEFAULT_CATEGORIES = [
  { name: "Salário", type: "INCOME" as const },
  { name: "Freelance", type: "INCOME" as const },
  { name: "Investimentos", type: "INCOME" as const },
  { name: "Outros Ganhos", type: "INCOME" as const },
  { name: "Alimentação", type: "EXPENSE" as const },
  { name: "Transporte", type: "EXPENSE" as const },
  { name: "Moradia", type: "EXPENSE" as const },
  { name: "Saúde", type: "EXPENSE" as const },
  { name: "Lazer", type: "EXPENSE" as const },
  { name: "Educação", type: "EXPENSE" as const },
  { name: "Outros Gastos", type: "EXPENSE" as const },
];

export async function seedCategories() {
  const existing = await prisma.category.count();
  if (existing > 0) return { message: "Categories already exist" };

  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES,
  });

  return { message: `Created ${DEFAULT_CATEGORIES.length} categories` };
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getCategoriesByType(type: "INCOME" | "EXPENSE") {
  return prisma.category.findMany({
    where: { type },
    orderBy: { name: "asc" },
  });
}
