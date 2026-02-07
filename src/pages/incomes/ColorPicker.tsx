import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Palette } from 'lucide-react';

const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#A855F7', // Fuchsia
  '#6B7280', // Gray
  '#FBBF24', // Amber
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
  value, 
  onChange,
  className = ''
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={`flex items-center gap-2 ${className}`}
        >
          <div 
            className="w-4 h-4 rounded-full border" 
            style={{ backgroundColor: value }}
          />
          <Palette className="h-4 w-4" />
          <span className="text-sm">{value.toUpperCase()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="space-y-3">
          <div className="grid grid-cols-7 gap-2">
            {DEFAULT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${value === color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                style={{ 
                  backgroundColor: color,
                  borderColor: value === color ? color : 'transparent'
                }}
                onClick={() => onChange(color)}
                title={color}
              />
            ))}
          </div>
          
          <div className="pt-3 border-t">
            <Label className="block text-sm font-medium mb-2">
              Cor personalizada
            </Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-10 h-10 cursor-pointer rounded border"
              />
              <Input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Componente Label auxiliar
const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <label className={`text-sm font-medium leading-none ${className}`}>
      {children}
    </label>
  );
};

// Componente Input auxiliar
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return (
    <input
      {...props}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${props.className || ''}`}
    />
  );
};