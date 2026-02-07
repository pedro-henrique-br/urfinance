import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';

type FilterValue = 'all' | 'received' | 'pending';

interface IncomeFiltersProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  className?: string;
}

export const IncomeFilters = ({ 
  value, 
  onChange,
  className = ''
}: IncomeFiltersProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`w-48 ${className}`}>
        <Filter className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Filtrar entradas" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas as entradas</SelectItem>
        <SelectItem value="received">Recebidas</SelectItem>
        <SelectItem value="pending">A receber</SelectItem>
      </SelectContent>
    </Select>
  );
};  