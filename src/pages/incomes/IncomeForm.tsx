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
import { Badge } from '@/components/ui/badge';
import { CreatableCombobox } from '@/components/CreatableCombobox';
import { ColorPicker } from './ColorPicker';
import type { IncomeFormData, IncomeCategory } from '@/types/income';

interface IncomeFormProps {
  initialData?: IncomeFormData;
  categories: IncomeCategory[];
  institutions: any[];
  onSubmit: (data: IncomeFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  onCreateCategory?: (name: string, color?: string) => Promise<IncomeCategory>;
  onCreateInstitution?: (name: string) => Promise<any>;
}

export const IncomeForm = ({
  initialData,
  categories = [],
  institutions = [],
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
  onCreateCategory,
  onCreateInstitution,
}: IncomeFormProps) => {
  const [form, setForm] = useState<IncomeFormData>({
    description: '',
    payment_type: '',
    amount: 0,
    income_date: new Date().toISOString().split('T')[0],
    is_fixed: false,
    is_received: false,
    category_id: null,
    institution_id: null,
    ...initialData,
  });

  const [selectedCategory, setSelectedCategory] = useState<IncomeCategory | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingCategoryName, setPendingCategoryName] = useState<string | null>(null);

const handleCreateCategory = async (name: string) => {
  if (!onCreateCategory) return null;
  try {
    const category = await onCreateCategory(name, newCategoryColor);
    setSelectedCategory(category);
    setForm({ ...form, category_id: category.id });
    setNewCategoryColor('#3B82F6');
    setShowColorPicker(false);
    return category;
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return null;
  }
};
  const renderCategoryItem = (category: IncomeCategory) => (
    <div className="flex items-center gap-2">
      {category.color && (
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: category.color }}
        />
      )}
      <span>{category.name}</span>
    </div>
  );

  useEffect(() => {
    if (initialData?.category_id && categories.length > 0) {
      const category = categories.find(c => c.id === initialData.category_id);
      setSelectedCategory(category || null);
    }

    if (initialData?.institution_id && institutions.length > 0) {
      const institution = institutions.find(i => i.id === initialData.institution_id);
      setSelectedInstitution(institution || null);
    }
  }, [initialData, categories, institutions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const onRequestCreateCategory = (name: string) => {
  setPendingCategoryName(name);
  setShowColorPicker(true);
};

const confirmCreateCategory = async () => {
  if (!pendingCategoryName || !onCreateCategory) return;
  try {
    const category = await onCreateCategory(pendingCategoryName, newCategoryColor);
    setSelectedCategory(category);
    setForm({ ...form, category_id: category.id });
    setNewCategoryColor('#3B82F6');
    setPendingCategoryName(null);
    setShowColorPicker(false);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
  }
};

const cancelCreateCategory = () => {
  setPendingCategoryName(null);
  setShowColorPicker(false);
  setNewCategoryColor('#3B82F6');
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
            placeholder="Ex: Salário, Freelance, Investimentos..."
          />
        </div>

        {/* Categoria */}
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <div className="space-y-2">
            <CreatableCombobox
              items={categories}
              value={selectedCategory}
              placeholder="Selecione uma categoria"
              renderItem={renderCategoryItem}
              onSelect={(item) => {
                setSelectedCategory(item);
                setForm({ ...form, category_id: item?.id || null });
              }}
              onCreate={onRequestCreateCategory}
              searchPlaceholder="Buscar ou criar categoria..."
            />

            {showColorPicker && pendingCategoryName && (
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

            {/* Preview da categoria */}
            {selectedCategory && (
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="outline"
                  className="flex items-center gap-2 px-3 py-1"
                  style={{
                    borderColor: selectedCategory.color || '#3B82F6',
                    color: selectedCategory.color || '#3B82F6'
                  }}
                >
                  {selectedCategory.color && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedCategory.color }}
                    />
                  )}
                  {selectedCategory.name}
                </Badge>
              </div>
            )}
          </div>
        </div>


        {/* Tipo de Pagamento */}
        <div className="space-y-2">
          <Label htmlFor="payment_type">Tipo de Pagamento</Label>
          <Input
            id="payment_type"
            value={form.payment_type}
            onChange={(e) => setForm({ ...form, payment_type: e.target.value })}
            placeholder="Ex: Transferência, Dinheiro, PIX..."
          />
        </div>

        {/* Instituição */}
        <div className="space-y-2">
          <Label htmlFor="institution">Instituição / Banco</Label>
          <CreatableCombobox
            items={institutions}
            value={selectedInstitution}
            renderItem={(item) => item.name}
            placeholder="Selecione uma instituição"
            onSelect={(item) => {
              setSelectedInstitution(item);
              setForm({ ...form, institution_id: item?.id || null });
            }}
            searchPlaceholder="Buscar ou criar instituição..."
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

        {/* Data */}
        <div className="space-y-2">
          <Label htmlFor="income_date">Data *</Label>
          <Input
            id="income_date"
            type="date"
            value={form.income_date}
            onChange={(e) => setForm({ ...form, income_date: e.target.value })}
            required
          />
        </div>

        {/* Tipo (Fixa/Variável) */}
        <div className="space-y-2">
          <Label htmlFor="is_fixed">Tipo</Label>
          <Select
            
            value={form.is_fixed ? 'fixed' : 'variable'}
            onValueChange={(v) => setForm({ ...form, is_fixed: v === 'fixed' })}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixa</SelectItem>
              <SelectItem value="variable">Variável</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status de Recebimento */}
        <div className="flex items-center space-x-2 pt-8">
          <Checkbox
            id="is_received"
            checked={form.is_received}
            onCheckedChange={(checked) =>
              setForm({ ...form, is_received: !!checked })
            }
          />
          <Label htmlFor="is_received" className="cursor-pointer">
            Já foi recebido?
          </Label>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : mode === 'edit' ? 'Atualizar' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
};