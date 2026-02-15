import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { Income } from '@/types/income';
import { helpers } from '@/utils/helpers';

interface ExportButtonProps {
  incomes: Income[];
  fileName?: string;
}

export const ExportIncomesButton = ({ incomes, fileName = 'entradas' }: ExportButtonProps) => {
  const handleExport = () => {
    const dataToExport = incomes.map((income, index) => ({
      '#': index + 1,
      'Descrição': income.description,
      'Categoria': income.income_categories?.name || 'Sem categoria',
      'Pagamento': income.payment_type || '-',
      'Instituição': income.institutions?.name || '-',
      'Valor': Number(income.amount).toFixed(2),
      'Data': helpers.formatDate(income.income_date),
      'Fixa': income.is_fixed ? 'Sim' : 'Não',
      'Status': income.is_received ? 'Recebido' : 'A receber',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    const columnWidths = [
      { wch: 5 },   
      { wch: 30 },  
      { wch: 20 },  
      { wch: 15 },  
      { wch: 20 },  
      { wch: 15 },  
      { wch: 12 },  
      { wch: 8 },   
      { wch: 12 },  
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Entradas');

    const date = new Date();
    const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const finalFileName = `${fileName}_${dateStr}.xlsx`;

    
    XLSX.writeFile(workbook, finalFileName);
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleExport}
      disabled={incomes.length === 0}
      className="gap-2 cursor-pointer"
    >
      <Download className="h-4 w-4" />
      Exportar Excel
    </Button>
  );
};