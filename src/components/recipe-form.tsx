
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Ingredient, Recipe, ProductFormat } from '@/app/recipes/page';
import { Trash2, PlusCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { initialProductFamilies } from '../app/admin/product-families/page';
import { initialInventoryItems } from '@/app/inventory/page';
import { ComboboxInput } from './ui/combobox';
import { initialPurchaseOrders } from '@/app/purchasing/orders/page';

type RecipeFormData = Omit<Recipe, 'id' | 'lastUpdated'>;

type RecipeFormProps = {
  onSubmit: (data: RecipeFormData) => void;
  onCancel: () => void;
  initialData?: Recipe | null;
};

const defaultIngredient: Ingredient = { name: '', quantity: 0, unit: '' };
const defaultFormat: ProductFormat = { sku: '', name: '', cost: 0 };

// Helper to find the latest price for a raw material
const getLatestPrice = (itemName: string) => {
    let latestPrice = 0;
    let latestDate = new Date(0);

    initialPurchaseOrders.forEach(order => {
        if(new Date(order.date) > latestDate) {
            const item = order.items.find(i => i.name.toLowerCase() === itemName.toLowerCase());
            if (item) {
                latestPrice = item.price;
                latestDate = new Date(order.date);
            }
        }
    });
    return latestPrice;
};

export default function RecipeForm({ onSubmit, onCancel, initialData }: RecipeFormProps) {
  const [name, setName] = useState('');
  const [family, setFamily] = useState('');
  const [capacityPerMold, setCapacityPerMold] = useState<number | undefined>(undefined);
  const [ingredients, setIngredients] = useState<Ingredient[]>([defaultIngredient]);
  const [formats, setFormats] = useState<ProductFormat[]>([defaultFormat]);
  
  const isEditing = !!initialData;

  const rawMaterials = useMemo(() => 
      initialInventoryItems
          .filter(item => item.category === 'Materia Prima')
          .map(item => item.name)
  , []);
  
  const recipeCost = useMemo(() => {
    return ingredients.reduce((total, ingredient) => {
        const price = getLatestPrice(ingredient.name);
        return total + (price * ingredient.quantity);
    }, 0);
  }, [ingredients]);
  
   useEffect(() => {
    // Update format costs whenever recipeCost changes
    setFormats(prevFormats => prevFormats.map(f => ({ ...f, cost: recipeCost })));
  }, [recipeCost]);


  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setFamily(initialData.family || '');
      setCapacityPerMold(initialData.capacityPerMold)
      setIngredients(initialData.ingredients?.length > 0 ? initialData.ingredients : [defaultIngredient]);
       // The cost will be recalculated by the recipeCost memo, so we just set the format names/skus
      setFormats(initialData.formats?.length > 0 ? initialData.formats.map(f => ({...f, cost: 0})) : [defaultFormat]);
    } else {
      setName('');
      setFamily('');
      setCapacityPerMold(undefined);
      setIngredients([defaultIngredient]);
      setFormats([defaultFormat]);
    }
  }, [initialData]);

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };
  
  const addIngredient = () => setIngredients([...ingredients, { ...defaultIngredient }]);
  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) setIngredients(ingredients.filter((_, i) => i !== index));
  };
  
  const handleFormatChange = (index: number, field: keyof Omit<ProductFormat, 'cost'>, value: string | number) => {
    const newFormats = [...formats];
    newFormats[index] = { ...newFormats[index], [field]: value as string };
    setFormats(newFormats);
  };
  
  const addFormat = () => setFormats([...formats, { ...defaultFormat, cost: recipeCost }]);
  const removeFormat = (index: number) => {
    if (formats.length > 1) setFormats(formats.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, family, ingredients, formats, capacityPerMold });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 py-4 font-body max-h-[70vh] overflow-y-auto px-2">
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nombre Producto</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required placeholder="Ej: PAN LINAZA 500 GRS" />
        </div>
         <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="family" className="text-right">Familia</Label>
             <Select value={family} onValueChange={(value) => setFamily(value)} required>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona una familia..." />
                </SelectTrigger>
                <SelectContent>
                    {initialProductFamilies.map(fam => (
                        <SelectItem key={fam.id} value={fam.name}>{fam.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="capacityPerMold" className="text-right">Capacidad por Molde/Lote</Label>
            <Input id="capacityPerMold" type="number" value={capacityPerMold || ''} onChange={(e) => setCapacityPerMold(Number(e.target.value) || undefined)} className="col-span-3" placeholder="(Opcional)" />
        </div>
        
        <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg">Receta Base (Ingredientes)</h3>
            {ingredients.map((ing, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                       <ComboboxInput
                           options={rawMaterials}
                           value={ing.name}
                           onSelect={(value) => handleIngredientChange(index, 'name', value)}
                           placeholder="Ingrediente..."
                       />
                    </div>
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
        
        <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg">Formatos de Venta</h3>
            {formats.map((format, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <Input placeholder="SKU Formato" value={format.sku} onChange={(e) => handleFormatChange(index, 'sku', e.target.value)} className="col-span-3" required />
                    <Input placeholder="Nombre Formato" value={format.name} onChange={(e) => handleFormatChange(index, 'name', e.target.value)} className="col-span-5" required />
                    <Input type="number" placeholder="Costo" value={format.cost.toFixed(0)} className="col-span-3" required readOnly title="Costo calculado automáticamente"/>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeFormat(index)} className="col-span-1 h-8 w-8" disabled={formats.length <= 1}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="outline" onClick={addFormat} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Formato de Venta
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
