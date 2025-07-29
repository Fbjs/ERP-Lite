
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InventoryItem } from '@/app/inventory/page';

type InventoryItemFormData = Omit<InventoryItem, 'sku'>;

type InventoryItemFormProps = {
  onSubmit: (data: InventoryItemFormData) => void;
  onCancel: () => void;
  initialData?: InventoryItemFormData;
};

export default function InventoryItemForm({ onSubmit, onCancel, initialData }: InventoryItemFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryItem['category']>('Materia Prima');
  const [stock, setStock] = useState(0);
  const [unit, setUnit] = useState('');
  const [location, setLocation] = useState('');

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCategory(initialData.category || 'Materia Prima');
      setStock(initialData.stock || 0);
      setUnit(initialData.unit || '');
      setLocation(initialData.location || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, category, stock, unit, location });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 font-body">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Nombre</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="category" className="text-right">Categoría</Label>
        <Select value={category} onValueChange={(value: InventoryItem['category']) => setCategory(value)}>
            <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="Materia Prima">Materia Prima</SelectItem>
                <SelectItem value="Insumo">Insumo</SelectItem>
                <SelectItem value="Producto Terminado">Producto Terminado</SelectItem>
            </SelectContent>
        </Select>
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="stock" className="text-right">Stock Inicial</Label>
        <Input id="stock" type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} className="col-span-3" required />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="unit" className="text-right">Unidad</Label>
        <Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="col-span-3" placeholder="ej: kg, unidades, L" required />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="location" className="text-right">Ubicación</Label>
        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="col-span-3" placeholder="ej: Bodega A-1" required />
      </div>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{isEditing ? 'Guardar Cambios' : 'Crear Ítem'}</Button>
      </DialogFooter>
    </form>
  );
}
