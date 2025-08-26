
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Ingredient, Recipe, ProductFormat } from '@/app/recipes/page';
import { Trash2, PlusCircle } from 'lucide-react';

type RecipeFormData = Omit<Recipe, 'id' | 'lastUpdated'>;

type RecipeFormProps = {
  onSubmit: (data: RecipeFormData) => void;
  onCancel: () => void;
  initialData?: Recipe | null;
};

const defaultFormat: ProductFormat = { sku: '', name: '', cost: 0 };
const defaultIngredient: Ingredient = { name: '', quantity: 0, unit: '' };

export default function RecipeForm({ onSubmit, onCancel, initialData }: RecipeFormProps) {
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([defaultIngredient]);
  const [formats, setFormats] = useState<ProductFormat[]>([defaultFormat]);
  
  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setIngredients(initialData.ingredients?.length > 0 ? initialData.ingredients : [defaultIngredient]);
      setFormats(initialData.formats?.length > 0 ? initialData.formats : [defaultFormat]);
    } else {
      setName('');
      setIngredients([defaultIngredient]);
      setFormats([defaultFormat]);
    }
  }, [initialData]);

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };
  
  const addIngredient = () => setIngredients([...ingredients, { name: '', quantity: 0, unit: '' }]);
  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) setIngredients(ingredients.filter((_, i) => i !== index));
  };
  
  const handleFormatChange = (index: number, field: keyof ProductFormat, value: string | number) => {
    const newFormats = [...formats];
    newFormats[index] = { ...newFormats[index], [field]: value };
    setFormats(newFormats);
  };

  const addFormat = () => setFormats([...formats, { sku: '', name: '', cost: 0 }]);
  const removeFormat = (index: number) => {
     if (formats.length > 1) setFormats(formats.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, ingredients, formats });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 py-4 font-body max-h-[70vh] overflow-y-auto px-2">
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nombre Producto</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required placeholder="Ej: Pan de Masa Madre" />
        </div>
        
        <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg">Formatos de Venta</h3>
            {formats.map((format, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <Input placeholder="SKU" value={format.sku} onChange={(e) => handleFormatChange(index, 'sku', e.target.value)} className="col-span-3" required />
                    <Input placeholder="Nombre Formato (Ej: Unidad 700g)" value={format.name} onChange={(e) => handleFormatChange(index, 'name', e.target.value)} className="col-span-5" required />
                    <Input type="number" placeholder="Costo" value={format.cost || ''} onChange={(e) => handleFormatChange(index, 'cost', Number(e.target.value))} className="col-span-3" required />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeFormat(index)} className="col-span-1 h-8 w-8" disabled={formats.length <= 1}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ))}
             <Button type="button" variant="outline" onClick={addFormat} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Formato
            </Button>
        </div>

        <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg">Ingredientes Base</h3>
            {ingredients.map((ing, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <Input placeholder="Nombre" value={ing.name} onChange={(e) => handleIngredientChange(index, 'name', e.target.value)} className="col-span-5" required />
                    <Input type="number" placeholder="Cant." step="0.001" value={ing.quantity || ''} onChange={(e) => handleIngredientChange(index, 'quantity', Number(e.target.value))} className="col-span-3" required />
                    <Input placeholder="Unidad" value={ing.unit} onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)} className="col-span-3" required />
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
