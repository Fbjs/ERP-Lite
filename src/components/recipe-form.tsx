
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Ingredient, Recipe } from '@/app/recipes/page';
import { Trash2, PlusCircle } from 'lucide-react';

type RecipeFormData = Omit<Recipe, 'id' | 'lastUpdated' | 'formats'>;

type RecipeFormProps = {
  onSubmit: (data: RecipeFormData) => void;
  onCancel: () => void;
  initialData?: Recipe | null;
};

const defaultIngredient: Ingredient = { name: '', quantity: 0, unit: '' };

export default function RecipeForm({ onSubmit, onCancel, initialData }: RecipeFormProps) {
  const [name, setName] = useState('');
  const [family, setFamily] = useState('');
  const [cost, setCost] = useState(0);
  const [ingredients, setIngredients] = useState<Ingredient[]>([defaultIngredient]);
  
  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setFamily(initialData.family || '');
      setCost(initialData.cost || 0);
      setIngredients(initialData.ingredients?.length > 0 ? initialData.ingredients : [defaultIngredient]);
    } else {
      setName('');
      setFamily('');
      setCost(0);
      setIngredients([defaultIngredient]);
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = initialData?.id || name.toUpperCase().replace(/\s/g, '_');
    onSubmit({ name, family, cost, ingredients });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 py-4 font-body max-h-[70vh] overflow-y-auto px-2">
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nombre Producto</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required placeholder="Ej: PAN LINAZA 500 GRS" />
        </div>
         <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="family" className="text-right">Familia</Label>
            <Input id="family" value={family} onChange={(e) => setFamily(e.target.value)} className="col-span-3" required placeholder="Ej: PAN CENTENO" />
        </div>
         <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cost" className="text-right">Costo</Label>
            <Input id="cost" type="number" value={cost || ''} onChange={(e) => setCost(Number(e.target.value))} className="col-span-3" required />
        </div>
        
        <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg">Receta Base (Ingredientes)</h3>
            {ingredients.map((ing, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <Input placeholder="Nombre Ingrediente" value={ing.name} onChange={(e) => handleIngredientChange(index, 'name', e.target.value)} className="col-span-5" required />
                    <Input type="number" placeholder="Cant." step="0.001" value={ing.quantity || ''} onChange={(e) => handleIngredientChange(index, 'quantity', Number(e.target.value))} className="col-span-3" required />
                    <Input placeholder="Unidad (kg, L, Un)" value={ing.unit} onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)} className="col-span-3" required />
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
