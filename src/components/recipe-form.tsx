"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Ingredient, Recipe } from '@/app/recipes/page';
import { Trash2, PlusCircle } from 'lucide-react';

type RecipeFormData = Omit<Recipe, 'lastUpdated'>;

type RecipeFormProps = {
  onSubmit: (data: RecipeFormData) => void;
  onCancel: () => void;
  initialData?: RecipeFormData;
};

export default function RecipeForm({ onSubmit, onCancel, initialData }: RecipeFormProps) {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [format, setFormat] = useState('');
  const [cost, setCost] = useState(0);
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', quantity: 0, unit: '' }]);
  
  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setSku(initialData.sku || '');
      setName(initialData.name || '');
      setFormat(initialData.format || '');
      setCost(initialData.cost || 0);
      setIngredients(initialData.ingredients && initialData.ingredients.length > 0 ? initialData.ingredients : [{ name: '', quantity: 0, unit: '' }]);
    }
  }, [initialData]);

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngredients = [...ingredients];
    if (field === 'quantity') {
        newIngredients[index][field] = Number(value);
    } else {
        newIngredients[index][field] = value as string;
    }
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: 0, unit: '' }]);
  };
  
  const removeIngredient = (index: number) => {
    if (ingredients.length <= 1) return; // Prevent removing the last ingredient
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ sku, name, format, cost, ingredients });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 py-4 font-body max-h-[70vh] overflow-y-auto px-2">
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sku" className="text-right">Cód. Producto (SKU)</Label>
            <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} className="col-span-3" required disabled={isEditing} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nombre</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="format" className="text-right">Formato de Entrega</Label>
            <Input id="format" value={format} onChange={(e) => setFormat(e.target.value)} className="col-span-3" placeholder="Ej: Unidad 700g, Bolsa 500g" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cost" className="text-right">Costo Unitario</Label>
            <Input id="cost" type="number" step="0.01" value={cost} onChange={(e) => setCost(Number(e.target.value))} className="col-span-3" required />
        </div>
        
        <div className="space-y-4">
            <Label>Ingredientes</Label>
            {ingredients.map((ing, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <Input 
                        placeholder="Nombre" 
                        value={ing.name} 
                        onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                        className="col-span-5"
                        required
                    />
                     <Input 
                        type="number"
                        placeholder="Cant." 
                        step="0.001"
                        value={ing.quantity || ''} 
                        onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                        className="col-span-3"
                        required
                    />
                     <Input 
                        placeholder="Unidad" 
                        value={ing.unit} 
                        onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                        className="col-span-3"
                        required
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(index)} className="col-span-1 h-8 w-8" disabled={ingredients.length <= 1}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="outline" onClick={addIngredient} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Ingrediente
            </Button>
        </div>

      <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mx-2 -mb-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{isEditing ? 'Guardar Cambios' : 'Guardar Receta'}</Button>
      </DialogFooter>
    </form>
  );
}
