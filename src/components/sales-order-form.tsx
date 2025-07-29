"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Recipe } from '@/app/recipes/page';
import { PlusCircle, Trash2 } from 'lucide-react';

type OrderItem = {
    recipeId: string;
    quantity: number;
};

export type OrderFormData = {
    customer: string;
    items: OrderItem[];
};

type SalesOrderFormProps = {
  onSubmit: (data: OrderFormData) => void;
  onCancel: () => void;
  recipes: Recipe[];
};

export default function SalesOrderForm({ onSubmit, onCancel, recipes }: SalesOrderFormProps) {
  const [customer, setCustomer] = useState('');
  const [items, setItems] = useState<OrderItem[]>([{ recipeId: '', quantity: 1 }]);

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items];
    if (field === 'quantity') {
        newItems[index][field] = Number(value);
    } else {
        newItems[index][field] = value as string;
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { recipeId: '', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ customer, items });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 py-4 font-body max-h-[70vh] overflow-y-auto px-2">
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customer" className="text-right">Cliente</Label>
            <Input
                id="customer"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="col-span-3"
                placeholder="Nombre del cliente"
                required
            />
        </div>
      
        <div className="space-y-4">
            <Label>Productos</Label>
            {items.map((item, index) => (
                 <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <Select value={item.recipeId} onValueChange={(value) => handleItemChange(index, 'recipeId', value)}>
                        <SelectTrigger className="col-span-7">
                            <SelectValue placeholder="Selecciona un producto" />
                        </SelectTrigger>
                        <SelectContent>
                            {recipes.map(recipe => (
                                <SelectItem key={recipe.id} value={recipe.id}>{recipe.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        type="number"
                        placeholder="Cant."
                        min="1"
                        value={item.quantity || ''}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="col-span-4"
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
        <Button type="submit">Crear Orden</Button>
      </DialogFooter>
    </form>
  );
}
