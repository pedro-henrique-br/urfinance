import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { ExpenseCategory, ExpenseType } from '@/types/expenses';

export interface ExpenseFilterState {
  search: string;
  categoryId: string | null;
  typeId: string | null;
  institutionId: string | null;
  paidStatus: 'all' | 'paid' | 'unpaid';
  startDate: Date | null;
  endDate: Date | null;
}

interface ExpenseFiltersProps {
  categories: ExpenseCategory[];
  types: ExpenseType[];
  institutions: any[];
  onFilterChange: (filters: ExpenseFilterState) => void;
  className?: string;
}

export const ExpenseFilters = ({
  categories,
  types,
  institutions,
  onFilterChange,
  className = ''
}: ExpenseFiltersProps) => {
  const [filters, setFilters] = useState<ExpenseFilterState>({
    search: '',
    categoryId: null,
    typeId: null,
    institutionId: null,
    paidStatus: 'all',
    startDate: null,
    endDate: null,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const handleFilterChange = (key: keyof ExpenseFilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const newFilters = {
      search: '',
      categoryId: null,
      typeId: null,
      institutionId: null,
      paidStatus: 'all',
      startDate: null,
      endDate: null,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.search !== '' ||
      filters.categoryId !== null ||
      filters.typeId !== null ||
      filters.institutionId !== null ||
      filters.paidStatus !== 'all' ||
      filters.startDate !== null ||
      filters.endDate !== null
    );
  };

  const formatDate = (date: Date | null) => {
    return date ? format(date, 'dd/MM/yyyy') : '';
  };

  const activeFiltersCount = [
    filters.search && 'Busca',
    filters.categoryId && 'Categoria',
    filters.typeId && 'Tipo',
    filters.institutionId && 'Instituição',
    filters.paidStatus !== 'all' && 'Status',
    filters.startDate && 'Data inicial',
    filters.endDate && 'Data final',
  ].filter(Boolean).length;

  // Filtrar tipos baseados na categoria selecionada
  const filteredTypes = filters.categoryId
    ? types.filter(t => t.category_id === filters.categoryId)
    : types;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Pesquisar por descrição..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pr-8"
          />
          {filters.search && (
            <button
              onClick={() => handleFilterChange('search', '')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 cursor-pointer text-red-500 hover:text-red-600" />
            </button>
          )}
        </div>

        <Button
          variant={hasActiveFilters() ? "default" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2 cursor-pointer"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {showFilters && (
        <div className="p-4 border rounded-lg bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Filtros Avançados</h3>
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs cursor-pointer"
              >
                Limpar todos
                <X className="ml-1 h-4 w-4 text-red-500 hover:text-red-600" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Categoria */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select
                value={filters.categoryId || 'all'}
                onValueChange={(value) => 
                  handleFilterChange('categoryId', value === 'all' ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        {category.color && (
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                        )}
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo (filtrado pela categoria) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select
                value={filters.typeId || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('typeId', value === 'all' ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {filteredTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        {type.expense_category?.color && (
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: type.expense_category.color }}
                          />
                        )}
                        {type.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Instituição */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Instituição</label>
              <Select
                value={filters.institutionId || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('institutionId', value === 'all' ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as instituições" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as instituições</SelectItem>
                  {institutions.map((institution) => (
                    <SelectItem key={institution.id} value={institution.id}>
                      {institution.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status de pagamento */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.paidStatus}
                onValueChange={(value: any) => handleFilterChange('paidStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="unpaid">Não pago</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data inicial */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Data da despesa inicial</label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? formatDate(filters.startDate) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.startDate || undefined}
                    onSelect={(date) => {
                      handleFilterChange('startDate', date);
                      setStartDateOpen(false);
                    }}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Data final */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Data da despesa final</label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate ? formatDate(filters.endDate) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.endDate || undefined}
                    onSelect={(date) => {
                      handleFilterChange('endDate', date);
                      setEndDateOpen(false);
                    }}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Tags de filtros ativos */}
          {hasActiveFilters() && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {filters.search && (
                <Badge variant="secondary" className="gap-1">
                  Busca: {filters.search}
                  <button
                    onClick={() => handleFilterChange('search', '')}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5 cursor-pointer text-red-500 hover:text-red-600" />
                  </button>
                </Badge>
              )}
              
              {filters.categoryId && (
                <Badge variant="secondary" className="gap-1">
                  Categoria: {categories.find(c => c.id === filters.categoryId)?.name}
                  <button
                    onClick={() => handleFilterChange('categoryId', null)}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5 cursor-pointer text-red-500 hover:text-red-600" />
                  </button>
                </Badge>
              )}
              
              {filters.typeId && (
                <Badge variant="secondary" className="gap-1">
                  Tipo: {types.find(t => t.id === filters.typeId)?.name}
                  <button
                    onClick={() => handleFilterChange('typeId', null)}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5 cursor-pointer text-red-500 hover:text-red-600" />
                  </button>
                </Badge>
              )}
              
              {filters.institutionId && (
                <Badge variant="secondary" className="gap-1">
                  Instituição: {institutions.find(i => i.id === filters.institutionId)?.name}
                  <button
                    onClick={() => handleFilterChange('institutionId', null)}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5 cursor-pointer text-red-500 hover:text-red-600" />
                  </button>
                </Badge>
              )}
              
              {filters.paidStatus !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Status: {filters.paidStatus === 'paid' ? 'Pago' : 'Não pago'}
                  <button
                    onClick={() => handleFilterChange('paidStatus', 'all')}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5 cursor-pointer text-red-500 hover:text-red-600" />
                  </button>
                </Badge>
              )}
              
              {filters.startDate && (
                <Badge variant="secondary" className="gap-1">
                  De: {formatDate(filters.startDate)}
                  <button
                    onClick={() => handleFilterChange('startDate', null)}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5 cursor-pointer text-red-500 hover:text-red-600" />
                  </button>
                </Badge>
              )}
              
              {filters.endDate && (
                <Badge variant="secondary" className="gap-1">
                  Até: {formatDate(filters.endDate)}
                  <button
                    onClick={() => handleFilterChange('endDate', null)}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5 cursor-pointer text-red-500 hover:text-red-600" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};