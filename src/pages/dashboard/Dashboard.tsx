import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart';
import { ExpensePieChart } from '@/components/dashboard/ExpensePieChart';
import { BudgetProgressList } from '@/components/dashboard/BudgetProgressList';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const data = useDashboardData(month, year);

  // Enquanto carrega, mostra skeletons
  if (!data.totalIncome && !data.totalExpense) {
    return (
      <MainLayout title="Dashboard" subtitle="Visão geral das suas finanças">
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard" subtitle="Visão geral das suas finanças">
      <div className="space-y-6">
        {/* Seletor de mês/ano */}
        <div className="flex items-center gap-2">
          <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <SelectItem key={m} value={m.toString()}>
                  {new Date(2000, m - 1, 1).toLocaleString('pt-BR', { month: 'long' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025, 2026].map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cards de resumo */}
        <SummaryCards
          totalIncome={data.totalIncome}
          totalExpense={data.totalExpense}
          balance={data.balance}
          savingsRate={data.savingsRate}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IncomeExpenseChart income={data.totalIncome} expense={data.totalExpense} />
          <ExpensePieChart data={data.expenseByCategory} />
        </div>

        {data.budgetProgress.length > 0 && (
          <BudgetProgressList budgets={data.budgetProgress} />
        )}
      </div>
    </MainLayout>
  );
}