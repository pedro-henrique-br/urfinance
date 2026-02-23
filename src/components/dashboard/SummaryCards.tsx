import { Card, CardContent } from '@/components/ui/card';
import { helpers } from '@/utils/helpers';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
}

export const SummaryCards = ({ totalIncome, totalExpense, balance, savingsRate }: SummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Total de Entradas</p>
          <p className="text-2xl font-bold text-green-600">{helpers.formatCurrency(totalIncome)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Total de Despesas</p>
          <p className="text-2xl font-bold text-red-600">{helpers.formatCurrency(totalExpense)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Saldo</p>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {helpers.formatCurrency(balance)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Taxa de Poupança</p>
          <p className={`text-2xl font-bold ${savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {savingsRate.toFixed(2)}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
};