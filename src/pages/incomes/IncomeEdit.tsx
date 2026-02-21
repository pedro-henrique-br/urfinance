import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreatableCombobox } from "@/components/CreatableCombobox";
import { useState, useEffect } from "react";

export const IncomeEdit = ({
  initialData,
  categories,
  institutions,
  onSave,
  onCancel,
}: any) => {
  const [form, setForm] = useState(initialData);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(initialData);
    setSelectedCategory(initialData?.income_categories ?? null);
    setSelectedInstitution(initialData?.institutions ?? null);
  }, [initialData]);

  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Descrição</Label>
          <Input
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Tipo de renda</Label>
          <CreatableCombobox
            renderItem={(item) => item.name}
            placeholder="Tipo de renda..."
            items={categories}
            value={selectedCategory}
            onSelect={(item) => {
              setSelectedCategory(item);
              setForm({ ...form, category_id: item?.id });
            }}
          />
        </div>

        <div>
          <Label>Pagamento</Label>
          <Input
            value={form.payment_type}
            onChange={(e) =>
              setForm({ ...form, payment_type: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Instituição</Label>
          <CreatableCombobox
            items={institutions}
            value={selectedInstitution}
            onSelect={(item) => {
              setSelectedInstitution(item);
              setForm({ ...form, institution_id: item?.id });
            }}
          />
        </div>

        <div>
          <Label>Valor</Label>
          <Input
            type="number"
            value={form.amount}
            onChange={(e) =>
              setForm({ ...form, amount: Number(e.target.value) })
            }
          />
        </div>

        <div>
          <Label>Data</Label>
          <Input
            type="date"
            value={form.income_date}
            onChange={(e) =>
              setForm({ ...form, income_date: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Tipo</Label>
          <Select
            value={form.is_fixed ? "fixed" : "variable"}
            onValueChange={(v) =>
              setForm({ ...form, is_fixed: v === "fixed" })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixa</SelectItem>
              <SelectItem value="variable">Variável</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <Checkbox
            checked={form.is_received}
            onCheckedChange={(v) =>
              setForm({ ...form, is_received: Boolean(v) })
            }
          />
          <Label>Recebido?</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={() => onSave(form)}>
          Salvar
        </Button>
      </div>
    </div>
  );
};
