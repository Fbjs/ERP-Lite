
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Recipe, ProductFormat } from '@/app/recipes/page';
import { PlusCircle, Trash2 } from 'lucide-react';

type RequestItem = {
    product: string;
    quantity: number;
};

export type SalespersonRequestFormData = {
    salesperson: string;
    items: RequestItem[];
};

type SalespersonRequestFormProps = {
  onSubmit: (data: SalespersonRequestFormData) => void;
  onCancel: () => void;
  recipes: Recipe[];
};

export default function SalespersonRequestForm({ onSubmit, onCancel, recipes }: SalespersonRequestFormProps) {
  const [salesperson, setSalesperson] = useState('');
  const [items, setItems] = useState<RequestItem[]>([{ product: '', quantity: 1 }]);

  const handleItemChange = (index: number, field: keyof RequestItem, value: string | number) => {
    const newItems = [...items];
    const oldItem = newItems[index];
    
    if (field === 'quantity') {
        newItems[index] = { ...oldItem, quantity: Number(value) };
    } else {
        newItems[index] = { ...oldItem, [field]: value as string };
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { product: '', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ salesperson, items });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 py-4 font-body max-h-[70vh] overflow-y-auto px-2">
        <div className="space-y-2">
            <Label htmlFor="salesperson">Vendedor</Label>
            <Input
                id="salesperson"
                value={salesperson}
                onChange={(e) => setSalesperson(e.target.value)}
                placeholder="Nombre del vendedor"
                required
            />
        </div>
      
        <div className="space-y-4 border-t pt-4">
            <Label>Productos Solicitados</Label>
            {items.map((item, index) => (
                 <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <Select value={item.product} onValueChange={(value) => handleItemChange(index, 'product', value)}>
                        <SelectTrigger className="col-span-8">
                            <SelectValue placeholder="Selecciona un producto..." />
                        </SelectTrigger>
                        <SelectContent>
                            {recipes.map(recipe => (
                                <SelectItem key={recipe.id} value={recipe.name}>{recipe.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        type="number"
                        placeholder="Cant."
                        min="1"
                        value={item.quantity || ''}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="col-span-3"
                        required
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="col-span-1 h-8 w-8" disabled={items.length <= 1}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="outline" onClick={addItem} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Producto
            </Button>
        </div>

      <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mx-2 -mb-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Crear Pedido</Button>
      </DialogFooter>
    </form>
  );
}
