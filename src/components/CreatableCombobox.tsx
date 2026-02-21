"use client";

import * as React from "react";
import { Check, ChevronDown, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface CreatableComboboxProps<T> {
  items: T[];
  value: T | null;
  placeholder: string;
  renderItem: (item: T) => React.ReactNode;
  onSelect: (item: T | null) => void;
  onCreate?: (name: string) => Promise<T> | void;
  disabled?: boolean;
  searchPlaceholder?: string;
  className?: string;
}

export function CreatableCombobox<T extends { id: string; name: string }>({
  items,
  value,
  placeholder,
  renderItem,
  onSelect,
  onCreate,
  disabled = false,
  searchPlaceholder = "Buscar...",
  className,
}: CreatableComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!onCreate || !search.trim()) return;
    await onCreate(search);
    setSearch("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate">
            {value ? renderItem(value) : placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {/* Item de criação – sempre visível quando há texto e onCreate existe */}
            {search && onCreate && (
              <CommandItem
                onSelect={handleCreate}
                className="gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Criar "{search}"
              </CommandItem>
            )}
            <CommandGroup>
              {filteredItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => {
                    onSelect(item);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value?.id === item.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {renderItem(item)}
                </CommandItem>
              ))}
            </CommandGroup>
            {filteredItems.length === 0 && !search && (
              <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}