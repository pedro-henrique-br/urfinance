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

// Componentes de incomes
import { IncomeTable } from './IncomeTable';
import { IncomeForm } from './IncomeForm';
import { IncomeFilters } from './IncomeFilters';

// Hooks
import { useIncomes } from '@/hooks/incomes/useIncomes';
import { useIncomesCategories } from '@/hooks/incomes/useIncomesCategories';
import { useInstitutions } from '@/hooks/institution/useInstitution';

// Utilitários
import { helpers } from '@/utils/helpers';
import type { Income, IncomeFormData } from '@/types/income';

export const Page = () => {
  // Hooks de dados
  const { incomes, loading, createIncome, updateIncome, deleteIncome } = useIncomes();
  const { categories, createCategory } = useIncomesCategories();
  const { institutions, createInstitution } = useInstitutions();

  // Estados
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [filterReceived, setFilterReceived] = useState<'all' | 'received' | 'pending'>('all');

  // Calcular resumo
  const summary = useMemo(() => {
    const total = incomes.reduce((s, i) => s + i.amount, 0);
    const received = incomes
      .filter((i) => i.is_received)
      .reduce((s, i) => s + i.amount, 0);

    return {
      total,
      received,
      pending: total - received,
    };
  }, [incomes]);

  // Filtrar incomes
  const filteredIncomes = useMemo(() => {
    if (filterReceived === 'received')
      return incomes.filter((i) => i.is_received);
    if (filterReceived === 'pending')
      return incomes.filter((i) => !i.is_received);
    return incomes;
  }, [filterReceived, incomes]);

  // Manipular criação de income
  const handleCreateIncome = async (data: IncomeFormData) => {
    const result = await createIncome(data);
    if (result.success) {
      setDialogOpen(false);
    }
  };

  // Manipular edição de income
  const handleUpdateIncome = async (data: IncomeFormData) => {
    if (editingIncome) {
      const result = await updateIncome(editingIncome.id, data);
      if (result.success) {
        setEditingIncome(null);
        setDialogOpen(false);
      }
    }
  };

  // Manipular clique em editar
  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
    setDialogOpen(true);
  };

  // Manipular exclusão
  const handleDeleteIncome = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta entrada?')) {
      await deleteIncome(id);
    }
  };

  // Resetar formulário
  const resetForm = () => {
    setEditingIncome(null);
  };

  // Preparar dados para o formulário
  const getFormData = () => {
    if (!editingIncome) return undefined;
    
    return {
      description: editingIncome.description || '',
      payment_type: editingIncome.payment_type || '',
      amount: editingIncome.amount || 0,
      income_date: editingIncome.income_date || new Date().toISOString().split('T')[0],
      is_fixed: editingIncome.is_fixed || false,
      is_received: editingIncome.is_received || false,
      category_id: editingIncome.category_id || null,
      institution_id: editingIncome.institution_id || null,
    };
  };

  return (
    <MainLayout title="Entradas" subtitle="Gerencie suas fontes de renda">
      {/* Cards de resumo */}
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

      {/* Filtros e botão de nova entrada */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <IncomeFilters
          value={filterReceived}
          onChange={setFilterReceived}
        />

        <Dialog 
          open={dialogOpen} 
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nova Entrada
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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