import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { helpers } from '@/utils/helpers';

interface BudgetProgress {
  categoryName: string;
  color?: string;
  limit: number;
  spent: number;
  percentage: number;
  status: 'exceeded' | 'on_track' | 'attention' | 'no_spending';
}

interface BudgetProgressListProps {
  budgets: BudgetProgress[];
}

const statusMap = {
  excedido: { label: 'Excedido', variant: 'destructive' },
  dentro: { label: 'Dentro', variant: 'default' },
  atencao: { label: 'Atenção', variant: 'warning' },
  sem_gastos: { label: 'Sem gastos', variant: 'secondary' },
} as const;

export const BudgetProgressList = ({ budgets }: BudgetProgressListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso dos Orçamentos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.map((budget, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {budget.color && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: budget.color }} />}
                <span className="font-medium">{budget.categoryName}</span>
              </div>
              <Badge variant={statusMap[budget.status].variant as any}>
                {statusMap[budget.status].label}
              </Badge>
            </div>
            <Progress value={budget.percentage} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Gasto: {helpers.formatCurrency(budget.spent)}</span>
              <span>Limite: {helpers.formatCurrency(budget.limit)}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};