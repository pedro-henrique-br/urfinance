import { useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

// Componentes
import { ExpenseTable } from '@/pages/expenses/ExpenseTable';
import { ExpenseForm } from '@/pages/expenses//ExpenseForm';
import { ExportButton } from '@/pages/expenses/ExportButton'; // opcional, similar ao de incomes

// Hooks
import { useExpenses } from '@/hooks/expenses//useExpenses';
import { useExpenseCategories } from '@/hooks/expenses/useExpenseCategories';
import { useExpenseTypes } from '@/hooks/expenses/useExpenseTypes';
import { useInstitutions } from '@/hooks/institution/useInstitution';

import { helpers } from '@/utils/helpers';
import type { Expense, ExpenseFormData } from '@/types/expenses';
import { ExpenseFilters } from './ExpenseFilters';
import { useExpenseFilters } from '@/hooks/expenses/useExpenseFilters';

export const Page = () => {
  const { expenses, loading, createExpense, updateExpense, deleteExpense } = useExpenses();
  const { filters, setFilters, filteredExpenses } = useExpenseFilters(expenses);
  const { categories, createCategory } = useExpenseCategories();
  const { types, createType } = useExpenseTypes();
  const { institutions, createInstitution } = useInstitutions();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Resumo (total pago, total a pagar)
  const summary = useMemo(() => {
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const paid = expenses.filter(e => e.is_paid).reduce((s, e) => s + e.amount, 0);
    const unpaid = total - paid;
    return { total, paid, unpaid };
  }, [expenses]);

  const handleCreateExpense = async (data: ExpenseFormData) => {
    const result = await createExpense(data);
    if (result.success) {
      setDialogOpen(false);
    }
  };

  const handleUpdateExpense = async (data: ExpenseFormData) => {
    if (editingExpense) {
      const result = await updateExpense(editingExpense.id, data);
      if (result.success) {
        setEditingExpense(null);
        setDialogOpen(false);
      } else {
        console.error('Erro ao atualizar:', result.error);
      }
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setDialogOpen(true);
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      await deleteExpense(id);
    }
  };

  const resetForm = () => setEditingExpense(null);

  const getFormData = (): ExpenseFormData | undefined => {
    if (!editingExpense) return undefined;
    return {
      description: editingExpense.description || '',
      amount: editingExpense.amount || 0,
      expense_type_id: editingExpense.expense_type_id || null,
      institution_id: editingExpense.institution_id || null,
      payment_type: editingExpense.payment_type || '',
      expense_date: editingExpense.expense_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      payment_date: editingExpense.payment_date?.split('T')[0] || '',
      is_paid: editingExpense.is_paid || false,
    };
  };

  return (
    <MainLayout title="Despesas" subtitle="Gerencie seus gastos">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{helpers.formatCurrency(summary.total.toFixed(2))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pago</p>
            <p className="text-2xl font-bold text-green-600">{helpers.formatCurrency(summary.paid.toFixed(2))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">A Pagar</p>
            <p className="text-2xl font-bold text-yellow-600">{helpers.formatCurrency(summary.unpaid.toFixed(2))}</p>
          </CardContent>
        </Card>
      </div>

      {/* Botões */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex-1 w-full sm:w-auto">
          <ExpenseFilters
            categories={categories || []}
            types={types || []}
            institutions={institutions || []}
            onFilterChange={setFilters}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
        <ExportButton expenses={expenses} fileName="minhas_despesas" />
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingExpense ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
            </DialogHeader>
            <ExpenseForm
              key={editingExpense ? editingExpense.id : 'create'}
              initialData={getFormData()}
              categories={categories || []}
              types={types || []}
              institutions={institutions || []}
              onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense}
              onCancel={() => { resetForm(); setDialogOpen(false); }}
              isLoading={loading}
              mode={editingExpense ? 'edit' : 'create'}
              onCreateCategory={createCategory}
              onCreateType={createType}
              onCreateInstitution={createInstitution}
            />
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <ExpenseTable
        expenses={filteredExpenses}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
        isLoading={loading}
      />
    </MainLayout>
  );
};