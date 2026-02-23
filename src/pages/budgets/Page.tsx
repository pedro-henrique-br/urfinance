import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { BudgetTable } from './BudgetTable';
import { BudgetForm } from './BudgetForm';
import { useBudgets } from '@/hooks/expenses/useBudgets';
import { useExpenseCategories } from '@/hooks/expenses/useExpenseCategories';
import { useIncomes } from '@/hooks/incomes/useIncomes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const Page = () => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const { budgets, loading, createBudget, updateBudget, deleteBudget } = useBudgets(month, year);

  const { categories } = useExpenseCategories();
  const { incomes } = useIncomes();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);

  const existing = budgets.filter(b => b.id !== editingBudget?.id);

  console.log(existing)

  const handleCreate = async (data: any) => {
    const result: unknown = await createBudget(data);
    if (result) {
      setDialogOpen(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (editingBudget) {
      const result: unknown = await updateBudget(editingBudget.id, data);
      if (result) {
        setEditingBudget(null);
        setDialogOpen(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      await deleteBudget(id);
    }
  };

 const getFormData = () => {
  if (!editingBudget) return undefined;
  return {
    category_id: editingBudget.category_id,
    month: editingBudget.month,
    year: editingBudget.year,
    percentage: editingBudget.percentage,
    limit_amount: editingBudget.limit_amount,
    income_ids: editingBudget.income_sources?.map((s: any) => s.income_id) || [],
  };
};

  return (
    <MainLayout title="Orçamentos" subtitle="Gerencie seus limites por categoria">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Select
            value={month.toString()}
            onValueChange={(v) => setMonth(parseInt(v))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <SelectItem key={m} value={m.toString()}>
                  {new Date(2000, m - 1, 1).toLocaleString('pt-BR', { month: 'long' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={year.toString()}
            onValueChange={(v) => setYear(parseInt(v))}
          >
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i).map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingBudget(null); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Orçamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}</DialogTitle>
            </DialogHeader>
            <BudgetForm
              existingBudgets={existing}
              key={editingBudget ? editingBudget.id : 'create'}
              initialData={getFormData()}
              categories={categories || []}
              incomes={incomes}
              onSubmit={editingBudget ? handleUpdate : handleCreate}
              onCancel={() => { setEditingBudget(null); setDialogOpen(false); }}
              isLoading={loading}
              mode={editingBudget ? 'edit' : 'create'}
              month={month}
              year={year}
            />
          </DialogContent>
        </Dialog>
      </div>

      <BudgetTable
        budgets={budgets}
        onEdit={(budget) => { setEditingBudget(budget); setDialogOpen(true); }}
        onDelete={handleDelete}
        isLoading={loading}
      />
    </MainLayout>
  );
};