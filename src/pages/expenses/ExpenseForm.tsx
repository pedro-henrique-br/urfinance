import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreatableCombobox } from '@/components/CreatableCombobox';
import { ColorPicker } from '@/pages/incomes/ColorPicker';
import type { ExpenseFormData, ExpenseCategory, ExpenseType } from '@/types/expenses';
import { format } from 'date-fns';

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  categories: ExpenseCategory[];
  types: ExpenseType[];
  institutions: any[];
  onSubmit: (data: ExpenseFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  onCreateCategory?: (name: string, color?: string) => Promise<ExpenseCategory>;
  onCreateType?: (name: string, categoryId: string) => Promise<ExpenseType>; // categoryId obrigatório
  onCreateInstitution?: (name: string) => Promise<any>;
}

export const ExpenseForm = ({
  initialData,
  categories = [],
  types = [],
  institutions = [],
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
  onCreateCategory,
  onCreateType,
  onCreateInstitution,
}: ExpenseFormProps) => {
  const [form, setForm] = useState<ExpenseFormData>({
    description: '',
    amount: 0,
    expense_type_id: null,
    institution_id: null,
    payment_type: '',
    expense_date: format(new Date(), 'yyyy-MM-dd'),
    payment_date: '',
    is_paid: false,
    ...initialData,
  });

  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [selectedType, setSelectedType] = useState<ExpenseType | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);

  // Lista local de tipos para garantir que o tipo recém-criado apareça imediatamente
  const [localTypes, setLocalTypes] = useState<ExpenseType[]>(types);

  // Estados para criação de categoria
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');
  const [showCategoryColorPicker, setShowCategoryColorPicker] = useState(false);
  const [pendingCategoryName, setPendingCategoryName] = useState<string | null>(null);

  // Estados para criação de tipo
  const [showTypeCategorySelect, setShowTypeCategorySelect] = useState(false);
  const [pendingTypeName, setPendingTypeName] = useState<string | null>(null);

  // Sincroniza localTypes com a prop types
  useEffect(() => {
    setLocalTypes(types);
  }, [types]);

  // Sincroniza selectedCategory quando a lista de categorias é atualizada
  useEffect(() => {
    if (selectedCategory?.id && categories.length > 0) {
      const updatedCategory = categories.find(c => c.id === selectedCategory.id);
      if (updatedCategory && updatedCategory !== selectedCategory) {
        setSelectedCategory(updatedCategory);
      }
    }
  }, [categories, selectedCategory]);

  // Filtra tipos com base na categoria selecionada (usando localTypes)
  const filteredTypes = selectedCategory
    ? localTypes.filter(t => t.category_id === selectedCategory.id)
    : localTypes;

  // Preenche dados iniciais
  useEffect(() => {
    // Preenche tipo e categoria com base no initialData
    if (initialData?.expense_type_id && localTypes.length > 0) {
      const type = localTypes.find(t => String(t.id) === String(initialData.expense_type_id));
      setSelectedType(type || null);
      if (type?.category_id) {
        const category = categories.find(c => String(c.id) === String(type.category_id));
        setSelectedCategory(category || null);
      }
    }

    // Preenche instituição
    if (initialData?.institution_id && institutions.length > 0) {
      const institution = institutions.find(i => String(i.id) === String(initialData.institution_id));
      setSelectedInstitution(institution || null);
    }
  }, [initialData, localTypes, categories, institutions]);
  const renderCategoryItem = (category: ExpenseCategory) => (
    <div className="flex items-center gap-2">
      {category.color && (
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
      )}
      <span>{category.name}</span>
    </div>
  );

  const renderTypeItem = (type: ExpenseType) => (
    <div className="flex items-center gap-2">
      {type.expense_category?.color && (
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.expense_category.color }} />
      )}
      <span>{type.name}</span>
      {type.expense_category && (
        <span className="text-xs text-muted-foreground">({type.expense_category.name})</span>
      )}
    </div>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  // Criação de categoria
  const onRequestCreateCategory = (name: string) => {
    setPendingCategoryName(name);
    setShowCategoryColorPicker(true);
  };

  const confirmCreateCategory = async () => {
    if (!pendingCategoryName || !onCreateCategory) return;
    try {
      const category = await onCreateCategory(pendingCategoryName, newCategoryColor);
      setSelectedCategory(category);
      setShowCategoryColorPicker(false);
      setPendingCategoryName(null);
      setNewCategoryColor('#3B82F6');
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
    }
  };

  const cancelCreateCategory = () => {
    setShowCategoryColorPicker(false);
    setPendingCategoryName(null);
    setNewCategoryColor('#3B82F6');
  };

  // Criação de tipo (agora com categoria obrigatória)
  const onRequestCreateType = (name: string) => {
    setPendingTypeName(name);
    setShowTypeCategorySelect(true);
  };

  const confirmCreateType = async (categoryId: string) => {
    if (!pendingTypeName || !onCreateType) return;
    try {
      const type = await onCreateType(pendingTypeName, categoryId);
      // Adiciona à lista local imediatamente
      setLocalTypes(prev => [...prev, type]);
      setSelectedType(type);
      setForm({ ...form, expense_type_id: type.id });

      // Seleciona a categoria completa correspondente
      const fullCategory = categories.find(c => c.id === categoryId);
      if (fullCategory) {
        setSelectedCategory(fullCategory);
      }

      setShowTypeCategorySelect(false);
      setPendingTypeName(null);
    } catch (error) {
      console.error('Erro ao criar tipo:', error);
    }
  };

  const cancelCreateType = () => {
    setShowTypeCategorySelect(false);
    setPendingTypeName(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor="description">Descrição *</Label>
          <Input
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            placeholder="Ex: Supermercado, Aluguel, etc."
          />
        </div>

        {/* Valor */}
        <div className="space-y-2">
          <Label htmlFor="amount">Valor *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={form.amount || ''}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            required
            placeholder="0.00"
          />
        </div>

        {/* Categoria (para filtrar tipos) */}
        <div className="space-y-2">
          <Label>Categoria (opcional, para filtrar tipos)</Label>
          <CreatableCombobox
            items={categories}
            value={selectedCategory}
            placeholder="Filtrar por categoria"
            renderItem={renderCategoryItem}
            onSelect={(item) => {
              setSelectedCategory(item);
              // Se selecionar uma categoria, limpa o tipo selecionado se não pertencer a ela
              if (selectedType && selectedType.category_id !== item?.id) {
                setSelectedType(null);
                setForm({ ...form, expense_type_id: null });
              }
            }}
            onCreate={onCreateCategory ? onRequestCreateCategory : undefined}
            searchPlaceholder="Buscar categoria..."
          />
          {showCategoryColorPicker && pendingCategoryName && (
            <div className="p-3 border rounded-md bg-muted/30 space-y-3">
              <Label className="text-sm block">
                Cor da nova categoria: <span className="font-semibold">{pendingCategoryName}</span>
              </Label>
              <ColorPicker value={newCategoryColor} onChange={setNewCategoryColor} />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={cancelCreateCategory}>
                  Cancelar
                </Button>
                <Button type="button" size="sm" onClick={confirmCreateCategory}>
                  Criar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Tipo de Despesa */}
        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Despesa</Label>
          <CreatableCombobox
            items={filteredTypes}
            value={selectedType}
            placeholder="Selecione um tipo"
            renderItem={renderTypeItem}
            onSelect={(item) => {
              setSelectedType(item);
              setForm({ ...form, expense_type_id: item?.id || null });
            }}
            onCreate={onCreateType ? onRequestCreateType : undefined}
            searchPlaceholder="Buscar tipo..."
          />
          {showTypeCategorySelect && pendingTypeName && (
            <div className="p-3 border rounded-md bg-muted/30 space-y-3">
              <Label className="text-sm block">
                Selecione a categoria para "{pendingTypeName}" <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={(value) => confirmCreateType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        {cat.color && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />}
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={cancelCreateType}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Instituição */}
        <div className="space-y-2">
          <Label htmlFor="institution">Instituição / Banco</Label>
          <CreatableCombobox
            items={institutions}
            value={selectedInstitution}
            placeholder="Selecione uma instituição"
            onSelect={(item) => {
              setSelectedInstitution(item);
              setForm({ ...form, institution_id: item?.id || null });
            }}
            onCreate={onCreateInstitution}
            searchPlaceholder="Buscar instituição..."
          />
        </div>

        {/* Tipo de Pagamento */}
        <div className="space-y-2">
          <Label htmlFor="payment_type">Tipo de Pagamento</Label>
          <Input
            id="payment_type"
            value={form.payment_type}
            onChange={(e) => setForm({ ...form, payment_type: e.target.value })}
            placeholder="Ex: Crédito, Débito, PIX..."
          />
        </div>

        {/* Data da Despesa */}
        <div className="space-y-2">
          <Label htmlFor="expense_date">Data da Despesa *</Label>
          <Input
            id="expense_date"
            type="date"
            value={form.expense_date}
            onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
            required
          />
        </div>

        {/* Data de Pagamento */}
        <div className="space-y-2">
          <Label htmlFor="payment_date">Data de Pagamento</Label>
          <Input
            id="payment_date"
            type="date"
            value={form.payment_date}
            onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
          />
        </div>

        {/* Pago? */}
        <div className="flex items-center space-x-2 pt-8">
          <Checkbox
            id="is_paid"
            checked={form.is_paid}
            onCheckedChange={(checked) => setForm({ ...form, is_paid: !!checked })}
          />
          <Label htmlFor="is_paid" className="cursor-pointer">
            Já foi pago?
          </Label>
        </div>
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : mode === 'edit' ? 'Atualizar' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
};