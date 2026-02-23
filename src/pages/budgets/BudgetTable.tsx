import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { helpers } from '@/utils/helpers';
import type { BudgetWithStats } from '@/types/budget';

interface BudgetTableProps {
  budgets: BudgetWithStats[];
  onEdit: (budget: BudgetWithStats) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const getStatusBadge = (status: BudgetWithStats['status']) => {
  switch (status) {
    case 'excedido':
      return <Badge variant="destructive">EXCEDIDO</Badge>;
    case 'atencao':
      return <Badge variant="warning" className="bg-yellow-500">ATENÇÃO</Badge>;
    case 'dentro':
      return <Badge variant="success" className="bg-green-500">DENTRO DO PLANEJADO</Badge>;
    case 'sem_gastos':
      return <Badge variant="secondary">SEM GASTOS</Badge>;
  }
};

export const BudgetTable = ({
  budgets,
  onEdit,
  onDelete,
  isLoading = false,
}: BudgetTableProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center mt-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="text-lg font-medium mb-2">Nenhum orçamento definido</div>
        <p className="text-sm">Clique em "Novo Orçamento" para começar.</p>
      </div>
    );
  }

  // Calcular totais
  let totalLimite = 0;
  let totalGasto = 0;
  let totalSaldo = 0;
  let totalPercentual = 0;

  budgets.forEach(budget => {
    // Soma das entradas selecionadas (para calcular limite)
    const totalIncome = budget.income_sources?.reduce(
      (acc, src) => acc + (src.income?.amount || 0),
      0
    ) || 0;

    const limitValue = budget.limit_amount ?? 
      (budget.percentage ? (totalIncome * budget.percentage) / 100 : 0);

    totalLimite += limitValue;
    totalGasto += budget.spent;
    totalSaldo += budget.balance;

    // Soma dos percentuais (se houver)
    if (budget.percentage) {
      totalPercentual += budget.percentage;
    } else if (budget.limit_amount && totalIncome > 0) {
      // Se for valor fixo, calcula o percentual equivalente em relação à renda do budget
      totalPercentual += (budget.limit_amount / totalIncome) * 100;
    }
  });

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="text-center">Categoria</TableHead>
            <TableHead className="text-center">Percentual</TableHead>
            <TableHead className="text-center">Valor Limite</TableHead>
            <TableHead className="text-center">Gasto</TableHead>
            <TableHead className="text-center">Saldo</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {budgets.map((budget) => {
            const totalIncome = budget.income_sources?.reduce(
              (acc, src) => acc + (src.income?.amount || 0),
              0
            ) || 0;

            const limitValue = budget.limit_amount ?? 
              (budget.percentage ? (totalIncome * budget.percentage) / 100 : 0);

            const percentageValue = budget.percentage ?? 
              (budget.limit_amount && totalIncome > 0 
                ? (budget.limit_amount / totalIncome) * 100 
                : null);

            return (
              <TableRow key={budget.id}>
                <TableCell className="text-center font-medium">
                  <div className="flex items-center justify-center">
                    <Badge
                      variant="outline"
                      style={{ borderColor: budget.expense_category.color, color: budget.expense_category.color }}
                      className="inline-flex items-center gap-1"
                    >
                      {budget.expense_category.color && (
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: budget.expense_category.color }} />
                      )}
                      {budget.expense_category?.name || ''}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {percentageValue !== null
                    ? `${percentageValue.toFixed(2)}%`
                    : '-'
                  }
                </TableCell>
                <TableCell className="text-center">
                  {helpers.formatCurrency(limitValue)}
                </TableCell>
                <TableCell className="text-center text-red-600">
                  {helpers.formatCurrency(budget.spent)}
                </TableCell>
                <TableCell className={`text-center font-semibold ${
                  budget.balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {helpers.formatCurrency(budget.balance)}
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(budget.status)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="inline-flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => onEdit(budget)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onDelete(budget.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <tfoot className="bg-muted font-bold">
          <TableRow>
            <TableCell className="text-center font-bold" colSpan={1}>Totais</TableCell>
            <TableCell className="text-center">
              {totalPercentual.toFixed(2)}%
            </TableCell>
            <TableCell className="text-center">
              {helpers.formatCurrency(totalLimite)}
            </TableCell>
            <TableCell className="text-center text-red-600">
              {helpers.formatCurrency(totalGasto)}
            </TableCell>
            <TableCell className={`text-center font-semibold ${
              totalSaldo >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {helpers.formatCurrency(totalSaldo)}
            </TableCell>
            <TableCell className="text-center" colSpan={2}></TableCell>
          </TableRow>
        </tfoot>
      </Table>
    </div>
  );
};