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
import type { Income } from '@/types/income';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';

interface IncomeTableProps {
  incomes: Income[];
  onEdit: (income: Income) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const IncomeTable = ({
  incomes,
  onEdit,
  onDelete,
  isLoading = false,
}: IncomeTableProps) => {
  if (isLoading) {
    return (
      <div className='flex justify-center mt-4'>
        <Spinner className='size-8' />
      </div>
    );
  }

  if (incomes.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="text-lg font-medium mb-2">
          Nenhuma entrada cadastrada
        </div>
        <p className="text-sm">
          Clique em "Nova Entrada" para adicionar sua primeira renda
        </p>
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
            <TableHead className="text-center">Pagamento</TableHead>
            <TableHead className="text-center">Instituição</TableHead>
            <TableHead className="text-center">Valor</TableHead>
            <TableHead className="text-center">Data</TableHead>
            <TableHead className="text-center">Fixa</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {incomes.map((income, index) => (
            <TableRow
              key={income.id}
              className={`
                transition-colors
                ${index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
                hover:bg-muted/60
              `}
            >
              <TableCell className="text-center font-medium">
                {income.description}
              </TableCell>

              <TableCell className="text-center">
                <div className="flex justify-center">
                  <Badge
                    variant="outline"
                    className="font-normal inline-flex items-center gap-1"
                    style={{
                      borderColor: income.income_categories?.color || '#6B7280',
                      color: income.income_categories?.color || '#6B7280'
                    }}
                  >
                    {income.income_categories?.color && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: income.income_categories.color }}
                      />
                    )}
                    {income.income_categories?.name || 'Sem categoria'}
                  </Badge>
                </div>
              </TableCell>

              <TableCell className="text-center text-muted-foreground">
                {income.payment_type || '-'}
              </TableCell>

              <TableCell className="text-center">
                {income.institutions?.name || '-'}
              </TableCell>

              <TableCell className="text-center font-semibold text-green-600">
                {helpers.formatCurrency(Number(income.amount).toFixed(2))}
              </TableCell>

              <TableCell className="text-center">
                {income?.income_date.split('T')[0] }
              </TableCell>

              <TableCell className="text-center">
                <div className="flex justify-center">
                  <Checkbox
                    checked={income.is_fixed}
                    disabled
                    className="cursor-default"
                  />
                </div>
              </TableCell>

              <TableCell className="text-center">
                <Badge
                  variant={income.is_received ? 'default' : 'secondary'}
                  className={income.is_received ? 'bg-green-500 hover:bg-green-600' : ''}
                >
                  {income.is_received ? 'Recebido' : 'A receber'}
                </Badge>
              </TableCell>

              <TableCell className="text-center">
                <div className="inline-flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEdit(income)}
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete(income.id)}
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};