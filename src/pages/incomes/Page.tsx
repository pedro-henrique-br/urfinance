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

import { IncomeTable } from './IncomeTable';
import { IncomeForm } from './IncomeForm';
import { IncomeFilters, type FilterState } from './IncomeFilters';

import { useIncomes } from '@/hooks/incomes/useIncomes';
import { useIncomesCategories } from '@/hooks/incomes/useIncomesCategories';
import { useInstitutions } from '@/hooks/institution/useInstitution';

import { helpers } from '@/utils/helpers';
import type { Income, IncomeFormData } from '@/types/income';
import { ExportIncomesButton } from './ExportIncomesButton';

export const Page = () => {
  const { incomes, loading, createIncome, updateIncome, deleteIncome } = useIncomes();
  const { categories, createCategory } = useIncomesCategories();
  const { institutions, createInstitution } = useInstitutions();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categoryId: null,
    institutionId: null,
    status: 'all',
    startDate: null,
    endDate: null,
    fixedType: 'all',
  });

  const filteredIncomes = useMemo(() => {
    return incomes.filter(income => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const descriptionMatch = income.description.toLowerCase().includes(searchLower);
        if (!descriptionMatch) return false;
      }

      if (filters.categoryId && income.category_id !== filters.categoryId) {
        return false;
      }

      if (filters.institutionId && income.institution_id !== filters.institutionId) {
        return false;
      }

      if (filters.status === 'received' && !income.is_received) return false;
      if (filters.status === 'pending' && income.is_received) return false;

      if (filters.fixedType === 'fixed' && !income.is_fixed) return false;
      if (filters.fixedType === 'variable' && income.is_fixed) return false;

      if (filters.startDate) {
        const incomeDate = new Date(income.income_date);
        if (incomeDate < filters.startDate) return false;
      }

      if (filters.endDate) {
        const incomeDate = new Date(income.income_date);
        if (incomeDate > filters.endDate) return false;
      }

      return true;
    });
  }, [incomes, filters]);

  const summary = useMemo(() => {
    const total = filteredIncomes.reduce((s, i) => s + i.amount, 0);
    const received = filteredIncomes
      .filter((i) => i.is_received)
      .reduce((s, i) => s + i.amount, 0);

    return {
      total,
      received,
      pending: total - received,
    };
  }, [filteredIncomes]);

  const handleCreateIncome = async (data: IncomeFormData) => {
    const result = await createIncome(data);
    if (result.success) {
      setDialogOpen(false);
    }
  };

  const handleUpdateIncome = async (data: IncomeFormData) => {
    if (editingIncome) {
      const result = await updateIncome(editingIncome.id, data);
      if (result.success) {
        setEditingIncome(null);
        setDialogOpen(false);
      }
    }
  };

  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
    setDialogOpen(true);
  };

  const handleDeleteIncome = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta entrada?')) {
      await deleteIncome(id);
    }
  };

  const resetForm = () => {
    setEditingIncome(null);
  };

  const getFormData = () => {
    if (!editingIncome) return undefined;

    return {
      description: editingIncome.description || '',
      payment_type: editingIncome.payment_type || '',
      amount: editingIncome.amount || 0,
      income_date: editingIncome.income_date
        ? editingIncome.income_date.split('T')[0]
        : new Date().toISOString().split('T')[0],
      is_fixed: editingIncome.is_fixed || false,
      is_received: editingIncome.is_received || false,
      category_id: editingIncome.category_id || null,
      institution_id: editingIncome.institution_id || null,
    };
  };

  if (loading && incomes.length === 0) {
    return (
      <MainLayout title="Entradas" subtitle="Gerencie suas fontes de renda">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando entradas...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Entradas" subtitle="Gerencie suas fontes de renda">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">
              {helpers.formatCurrency(summary.total.toFixed(2))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Recebidas</p>
            <p className="text-2xl font-bold text-green-600">
              {helpers.formatCurrency(summary.received.toFixed(2))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">A Receber</p>
            <p className="text-2xl font-bold text-yellow-600">
              {helpers.formatCurrency(summary.pending.toFixed(2))}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <IncomeFilters
              categories={categories || []}
              institutions={institutions || []}
              onFilterChange={setFilters}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <ExportIncomesButton
              incomes={filteredIncomes}
              fileName="minhas_entradas"
            />

            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Entrada
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                <DialogHeader>
                  <DialogTitle>
                    {editingIncome ? 'Editar Entrada' : 'Nova Entrada'}
                  </DialogTitle>
                </DialogHeader>

                <IncomeForm
                  initialData={getFormData()}
                  categories={categories || []}
                  institutions={institutions || []}
                  onSubmit={editingIncome ? handleUpdateIncome : handleCreateIncome}
                  onCancel={() => {
                    resetForm();
                    setDialogOpen(false);
                  }}
                  isLoading={loading}
                  mode={editingIncome ? 'edit' : 'create'}
                  onCreateCategory={createCategory}
                  onCreateInstitution={createInstitution}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Info de resultados */}
        {!loading && filteredIncomes.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredIncomes.length} de {incomes.length} entradas
          </div>
        )}
      </div>

      {/* Tabela de incomes */}
      <IncomeTable
        incomes={filteredIncomes}
        onEdit={handleEditIncome}
        onDelete={handleDeleteIncome}
        isLoading={loading}
      />
    </MainLayout>
  );
};