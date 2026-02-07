import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Item {
  id: string;
  name: string;
}

interface Props {
  items: Item[];
  value?: Item | null;
  placeholder: string;
  onSelect: (item: Item) => void;
  onCreate: (name: string) => Promise<Item>;
}

export function CreatableCombobox({
  items,
  value,
  placeholder,
  onSelect,
  onCreate,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = items && items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const exactMatch = items && items.find(
    (i) => i.name.toLowerCase() === search.toLowerCase()
  );

  async function handleCreate() {
    const newItem = await onCreate(search);
    onSelect(newItem);
    setOpen(false);
    setSearch("");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="justify-between"
        >
          {value?.name || placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-2 space-y-2">
        <Input
          placeholder="Digite para buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="max-h-48 overflow-y-auto space-y-1">
          {filtered && filtered.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                onSelect(item);
                setOpen(false);
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value?.id === item.id ? "opacity-100" : "opacity-0"
                )}
              />
              {item.name}
            </Button>
          ))}

          {search && !exactMatch && (
            <Button
              variant="ghost"
              className="w-full justify-start text-primary"
              onClick={handleCreate}
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar "{search}"
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
