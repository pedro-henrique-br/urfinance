import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { Expense } from '@/types/expenses';
import { helpers } from '@/utils/helpers';

interface ExportButtonProps {
  expenses: Expense[];
  fileName?: string;
}

export const ExportButton = ({ expenses, fileName = 'despesas' }: ExportButtonProps) => {
  const handleExport = () => {
    // Preparar os dados para exportação
    const dataToExport = expenses.map((expense, index) => {
      const category = expense.expense_type?.expense_category;
      return {
        '#': index + 1,
        'Descrição': expense.description,
        'Categoria': category?.name || 'Sem categoria',
        'Tipo': expense.expense_type?.name || '-',
        'Instituição': expense.institutions?.name || '-',
        'Valor': Number(expense.amount).toFixed(2),
        'Data Despesa': helpers.formatDate(expense.expense_date),
        'Data Pagamento': expense.payment_date ? helpers.formatDate(expense.payment_date) : '-',
        'Pago': expense.is_paid ? 'Sim' : 'Não',
      };
    });

    // Criar worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    // Ajustar largura das colunas
    const columnWidths = [
      { wch: 5 },   // #
      { wch: 30 },  // Descrição
      { wch: 20 },  // Categoria
      { wch: 20 },  // Tipo
      { wch: 20 },  // Instituição
      { wch: 15 },  // Valor
      { wch: 12 },  // Data Despesa
      { wch: 12 },  // Data Pagamento
      { wch: 8 },   // Pago
    ];
    worksheet['!cols'] = columnWidths;

    // Criar workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Despesas');

    // Gerar nome do arquivo com data atual
    const date = new Date();
    const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const finalFileName = `${fileName}_${dateStr}.xlsx`;

    // Exportar
    XLSX.writeFile(workbook, finalFileName);
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleExport}
      disabled={expenses.length === 0}
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Exportar Excel
    </Button>
  );
};