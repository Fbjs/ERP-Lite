
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InventoryItem } from '@/app/inventory/page';
import { Checkbox } from './ui/checkbox';

type InventoryItemFormData = Omit<InventoryItem, 'sku'>;

type InventoryItemFormProps = {
  onSubmit: (data: InventoryItemFormData) => void;
  onCancel: () => void;
  initialData?: InventoryItem | null;
};

const defaultFormData: InventoryItemFormData = {
  name: '',
  family: 'ADITIVOS',
  category: 'Materia Prima',
  stock: 0,
  unit: 'kg',
  purchaseUnit: 'kg',
  conversionFactor: 1,
  inactive: false,
  location: '',
};

export default function InventoryItemForm({ onSubmit, onCancel, initialData }: InventoryItemFormProps) {
  const [formData, setFormData] = useState<InventoryItemFormData>(defaultFormData);

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
        setFormData(defaultFormData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
        ...prev,
        [id]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleSelectChange = (field: keyof InventoryItemFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 font-body">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Nombre</Label>
        <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" required />
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="family" className="text-right">Familia</Label>
        <Select value={formData.family} onValueChange={(value: InventoryItem['family']) => handleSelectChange('family', value)}>
            <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
            <SelectContent>
                <SelectItem value="ACEITES Y GRA">ACEITES Y GRA</SelectItem>
                <SelectItem value="ADITIVOS">ADITIVOS</SelectItem>
                <SelectItem value="ENDULZANTES">ENDULZANTES</SelectItem>
                <SelectItem value="ENVASADO">ENVASADO</SelectItem>
                <SelectItem value="HARINAS">HARINAS</SelectItem>
                <SelectItem value="MASA MADRE">MASA MADRE</SelectItem>
                <SelectItem value="SEMILLAS">SEMILLAS</SelectItem>
                <SelectItem value="PRODUCTO TERMINADO">PRODUCTO TERMINADO</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="category" className="text-right">Categoría</Label>
        <Select value={formData.category} onValueChange={(value: InventoryItem['category']) => handleSelectChange('category', value)}>
            <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
            <SelectContent>
                <SelectItem value="Materia Prima">Materia Prima</SelectItem>
                <SelectItem value="Insumo">Insumo</SelectItem>
                <SelectItem value="Producto Terminado">Producto Terminado</SelectItem>
                <SelectItem value="ENVASADO">Envasado</SelectItem>
            </SelectContent>
        </Select>
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="stock" className="text-right">Stock Inicial</Label>
        <Input id="stock" type="number" value={formData.stock} onChange={handleChange} className="col-span-3" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Unidad Consumo</Label><Input id="unit" value={formData.unit} onChange={handleChange} required/></div>
            <div className="space-y-1"><Label>Unidad Compra</Label><Input id="purchaseUnit" value={formData.purchaseUnit} onChange={handleChange} required/></div>
      </div>
        <div className="space-y-1">
            <Label>Factor de Conversión</Label>
            <Input id="conversionFactor" type="number" value={formData.conversionFactor || ''} onChange={handleChange} placeholder="De Compra a Consumo"/>
        </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="location" className="text-right">Ubicación</Label>
        <Input id="location" value={formData.location} onChange={handleChange} className="col-span-3" placeholder="ej: Bodega A-1" required />
      </div>
      <div className="flex items-center space-x-2 justify-end">
        <Checkbox id="inactive" checked={formData.inactive} onCheckedChange={(checked) => handleSelectChange('inactive', !!checked)} />
        <Label htmlFor="inactive">Marcar como inactivo</Label>
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
