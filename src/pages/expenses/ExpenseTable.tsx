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
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Trash2 } from 'lucide-react';
import { helpers } from '@/utils/helpers';
import type { Expense } from '@/types/expenses';
import { format, parseISO } from 'date-fns';

interface ExpenseTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const ExpenseTable = ({
  expenses,
  onEdit,
  onDelete,
  isLoading = false,
}: ExpenseTableProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center mt-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="text-lg font-medium mb-2">Nenhuma despesa cadastrada</div>
        <p className="text-sm">Clique em "Nova Despesa" para adicionar.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="text-center">Descrição</TableHead>
            <TableHead className="text-center">Categoria</TableHead>
            <TableHead className="text-center">Tipo</TableHead>
            <TableHead className="text-center">Instituição</TableHead>
            <TableHead className="text-center">Valor</TableHead>
            <TableHead className="text-center">Data Despesa</TableHead>
            <TableHead className="text-center">Data Pagamento</TableHead>
            <TableHead className="text-center">Data de Criação</TableHead>
            <TableHead className="text-center">Pago</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense, index) => {
            const category = expense.expense_type?.expense_category;
            return (
              <TableRow
                key={expense.id}
                className={`
                  transition-colors
                  ${index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
                  hover:bg-muted/60
                `}
              >
                <TableCell className="text-center font-medium">{expense.description}</TableCell>
                <TableCell className="text-center">
                  {category ? (
                    <Badge
                      variant="outline"
                      style={{ borderColor: category.color, color: category.color }}
                      className="inline-flex items-center gap-1"
                    >
                      {category.color && (
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                      )}
                      {category.name}
                    </Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {category ? (
                    <Badge
                      variant="default"
                      style={{ background: category?.color }}
                      className="inline-flex items-center gap-1"
                    >
                      {expense?.expense_type?.name}
                    </Badge>
                  ) : ("-")}
                </TableCell>
                <TableCell className="text-center">{expense.institutions?.name || '-'}</TableCell>
                <TableCell className="text-center font-semibold text-red-600">
                  {helpers.formatCurrency(Number(expense.amount).toFixed(2))}
                </TableCell>
                <TableCell className="text-center">
                  {expense.expense_date ? format(parseISO(expense.expense_date.split('T')[0]), 'dd/MM/yyyy') : '-'}
                </TableCell>
                <TableCell className="text-center">
                  {expense.payment_date ? format(parseISO(expense.payment_date.split('T')[0]), 'dd/MM/yyyy') : '-'}
                </TableCell>
                <TableCell className="text-center">
                  {expense.created_at ? format(parseISO(expense.created_at.split('T')[0]), 'dd/MM/yyyy') : '-'}
                </TableCell>
                <TableCell className="text-center">
                  <Checkbox checked={expense.is_paid} disabled className="cursor-default" />
                </TableCell>
                <TableCell className="text-center">
                  <div className="inline-flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => onEdit(expense)} title="Editar">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onDelete(expense.id)} title="Excluir">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};