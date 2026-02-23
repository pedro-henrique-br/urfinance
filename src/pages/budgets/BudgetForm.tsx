import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import type { Income } from '@/types/income';
import type { ExpenseCategory } from '@/types/expenses';
import type { BudgetFormData, Budget } from '@/types/budget';
import { helpers } from '@/utils/helpers';

interface BudgetFormProps {
  categories: ExpenseCategory[];
  incomes: Income[];
  initialData?: Partial<BudgetFormData> & { id?: string }; // id opcional para edição
  existingBudgets?: Budget[]; // orçamentos já existentes (exceto o atual em edição)
  onSubmit: (data: BudgetFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

export const BudgetForm = ({
  categories,
  incomes,
  initialData,
  existingBudgets = [],
  onSubmit,
  onCancel,
  isLoading,
  mode = 'create',
}: BudgetFormProps) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const [form, setForm] = useState<BudgetFormData>({
    category_id: null,
    month: currentMonth,
    year: currentYear,
    percentage: null,
    limit_amount: null,
    income_ids: [],
    ...initialData,
  });

  const [usePercentage, setUsePercentage] = useState(!!initialData?.percentage);
  const [errors, setErrors] = useState<{ percentage?: string; limit?: string }>({});

  // Calcula o total das entradas selecionadas
  const selectedIncomesTotal = incomes
    .filter(inc => form.income_ids.includes(inc.id))
    .reduce((acc, inc) => acc + inc.amount, 0);

  // Calcula a soma dos percentuais já usados (excluindo o atual em edição)
  const usedPercentage = existingBudgets
    .filter(b => b.id !== initialData?.id)
    .reduce((sum, b) => sum + (b.percentage || 0), 0);

  // Calcula a soma dos valores fixos já usados
  const usedFixed = existingBudgets
    .filter(b => b.id !== initialData?.id)
    .reduce((sum, b) => sum + (b.limit_amount || 0), 0);

  useEffect(() => {
    const newErrors: { percentage?: string; limit?: string } = {};

    if (usePercentage) {
      if (form.percentage !== null) {
        if (form.percentage < 0) {
          newErrors.percentage = 'Percentual não pode ser negativo';
        } else {
          const totalAfterAdd = usedPercentage + form.percentage;
          if (totalAfterAdd > 100) {
            newErrors.percentage = `Total de percentuais ultrapassaria 100% (já usado: ${usedPercentage.toFixed(2)}%)`;
          }
        }
      }
    } else {
      if (form.limit_amount !== null) {
        if (form.limit_amount < 0) {
          newErrors.limit = 'Valor não pode ser negativo';
        } else {
          const totalAfterAdd = usedFixed + form.limit_amount;
          if (totalAfterAdd > selectedIncomesTotal) {
            newErrors.limit = `Valor total ultrapassaria a renda disponível (R$ ${helpers.formatCurrency(selectedIncomesTotal)})`;
          }
        }
      }
    }

    setErrors(newErrors);
  }, [form.percentage, form.limit_amount, usePercentage, usedPercentage, usedFixed, selectedIncomesTotal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) return;
    onSubmit(form);
  };

  const toggleIncome = (incomeId: string) => {
    setForm(prev => ({
      ...prev,
      income_ids: prev.income_ids.includes(incomeId)
        ? prev.income_ids.filter(id => id !== incomeId)
        : [...prev.income_ids, incomeId],
    }));
  };

  // Gerar lista de anos (ex: 5 anos atrás até 5 anos à frente)
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Categoria */}
        <div className="space-y-2">
          <Label>Categoria *</Label>
          <Select
            value={form.category_id || ''}
            onValueChange={(val) => setForm({ ...form, category_id: val })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center gap-2">
                    {cat.color && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />}
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mês */}
        <div className="space-y-2">
          <Label>Mês</Label>
          <Select
            value={form.month.toString()}
            onValueChange={(val) => setForm({ ...form, month: parseInt(val) })}
          >
            <SelectTrigger>
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
        </div>

        {/* Ano */}
        <div className="space-y-2">
          <Label>Ano</Label>
          <Select
            value={form.year.toString()}
            onValueChange={(val) => setForm({ ...form, year: parseInt(val) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tipo de limite: percentual ou valor fixo */}
        <div className="space-y-2 col-span-2">
          <div className="flex items-center gap-4">
            <Label>Usar percentual da renda?</Label>
            <input
              type="checkbox"
              checked={usePercentage}
              onChange={(e) => {
                setUsePercentage(e.target.checked);
                if (!e.target.checked) setForm({ ...form, percentage: null });
                else setForm({ ...form, limit_amount: null });
              }}
            />
          </div>
        </div>

        {usePercentage ? (
          <div className="space-y-2">
            <Label>Percentual (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.percentage || ''}
              onChange={(e) => setForm({ ...form, percentage: parseFloat(e.target.value) || null })}
              placeholder="Ex: 10"
              className={errors.percentage ? 'border-destructive' : ''}
            />
            {errors.percentage && (
              <p className="text-sm text-destructive">{errors.percentage}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Percentual já usado: {usedPercentage.toFixed(2)}% | Disponível: {(100 - usedPercentage).toFixed(2)}%
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Valor limite (R$)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.limit_amount || ''}
              onChange={(e) => setForm({ ...form, limit_amount: parseFloat(e.target.value) || null })}
              placeholder="0.00"
              className={errors.limit ? 'border-destructive' : ''}
            />
            {errors.limit && (
              <p className="text-sm text-destructive">{errors.limit}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Valor já usado: {helpers.formatCurrency(usedFixed)} | Disponível: {helpers.formatCurrency(selectedIncomesTotal - usedFixed)}
            </p>
          </div>
        )}
      </div>

      {/* Seleção de entradas */}
      <div className="space-y-3">
        <Label>Entradas que compõem a base de cálculo</Label>
        <Card>
          <CardContent className="p-4">
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {incomes.map((income) => (
                  <div key={income.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={income.id}
                      checked={form.income_ids.includes(income.id)}
                      onCheckedChange={() => toggleIncome(income.id)}
                    />
                    <Label htmlFor={income.id} className="flex-1 cursor-pointer">
                      {income.description} - {helpers.formatCurrency(income.amount.toFixed(2))} ({new Date(income.income_date).toLocaleDateString('pt-BR')})
                    </Label>
                  </div>
                ))}
                {incomes.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma entrada cadastrada no período.</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        {selectedIncomesTotal > 0 && (
          <p className="text-sm text-muted-foreground">
            Total selecionado: {helpers.formatCurrency(selectedIncomesTotal.toFixed(2))}
          </p>
        )}
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || Object.keys(errors).length > 0}>
          {isLoading ? 'Salvando...' : mode === 'edit' ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};