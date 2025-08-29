
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Recipe } from '@/app/recipes/page';
import { PlusCircle, Trash2, Calendar as CalendarIcon, ChevronsUpDown, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { format, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Customer, DeliveryLocation } from '@/app/admin/customers/page';
import { Textarea } from './ui/textarea';
import type { Order } from '@/app/sales/page';


type OrderItem = {
  recipeId: string;
  formatSku: string;
  quantity: number;
};

export type OrderFormData = {
    customerId: string;
    locationId: string;
    deliveryAddress: string;
    deliveryDate: string;
    items: OrderItem[];
    dispatcher: string;
    comments: string;
};

export type SalesOrderFormProps = {
  onSubmit: (data: OrderFormData) => void;
  onCancel: () => void;
  recipes: Recipe[];
  customers: Customer[];
  initialData?: Order | null;
};

const ComboboxInput = ({ value, onSelect, placeholder, options }: { value: string, onSelect: (value: string) => void, placeholder: string, options: string[] }) => {
    const [open, setOpen] = useState(false);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                    {value || placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder={`Buscar ${placeholder.toLowerCase()}...`} />
                    <CommandList>
                        <CommandEmpty>No encontrado.</CommandEmpty>
                        <CommandGroup>
                            {options.map(option => (
                                <CommandItem key={option} value={option} onSelect={(currentValue) => { onSelect(currentValue.toUpperCase()); setOpen(false); }}>
                                    <Check className={cn("mr-2 h-4 w-4", value === option ? "opacity-100" : "opacity-0")} />
                                    {option}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default function SalesOrderForm({ onSubmit, onCancel, recipes, customers, initialData }: SalesOrderFormProps) {
  const [customerId, setCustomerId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(addDays(new Date(), 3));
  const [items, setItems] = useState<OrderItem[]>([{ recipeId: '', formatSku: '', quantity: 1 }]);
  const [dispatcher, setDispatcher] = useState('');
  const [comments, setComments] = useState('');

  const [availableLocations, setAvailableLocations] = useState<DeliveryLocation[]>([]);

  const dispatchers = ['RENE', 'MARCELO', 'RODRIGO', 'EXTERNO'];

  useEffect(() => {
    if (initialData) {
        setCustomerId(initialData.customerId);
        const customer = customers.find(c => c.id === initialData.customerId);
        if (customer) {
            setAvailableLocations(customer.deliveryLocations || []);
            const location = customer.deliveryLocations.find(l => l.address === initialData.deliveryAddress);
            if (location) {
                setLocationId(location.id);
            }
        }
        setDeliveryDate(parseISO(initialData.deliveryDate));
        setItems(initialData.items);
        setDispatcher(initialData.dispatcher);
        setComments(initialData.comments);
    } else {
        // Reset form to default state for new order
        setCustomerId('');
        setLocationId('');
        setAvailableLocations([]);
        setDeliveryDate(addDays(new Date(), 3));
        setItems([{ recipeId: '', formatSku: '', quantity: 1 }]);
        setDispatcher('');
        setComments('');
    }
  }, [initialData, customers]);

  useEffect(() => {
    if (customerId) {
      const selectedCustomer = customers.find(c => c.id === customerId);
      setAvailableLocations(selectedCustomer?.deliveryLocations || []);
      // When customer changes, reset location only if it's not part of an edit flow initial load
      if (!initialData || customerId !== initialData.customerId) {
        setLocationId('');
      }
    } else {
      setAvailableLocations([]);
    }
  }, [customerId, customers, initialData]);

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items];
    const oldItem = newItems[index];
    
    if (field === 'quantity') {
        newItems[index] = { ...oldItem, quantity: Number(value) };
    } else {
        newItems[index] = { ...oldItem, [field]: value as string };
    }
    
    if(field === 'recipeId') {
        newItems[index].formatSku = '';
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { recipeId: '', formatSku: '', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryDate || !customerId || !locationId) {
        alert("Por favor, completa todos los campos requeridos: Cliente, Local de entrega y Fecha de entrega.");
        return;
    }
    const location = availableLocations.find(l => l.id === locationId);
    onSubmit({ 
        customerId, 
        locationId,
        deliveryAddress: location?.address || 'N/A', 
        deliveryDate: format(deliveryDate, 'yyyy-MM-dd'), 
        items, 
        dispatcher, 
        comments 
    });
  };
  
  const availableFormats = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    return recipe?.formats || [];
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 py-4 font-body max-h-[70vh] overflow-y-auto px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="customer">Cliente</Label>
                 <Select onValueChange={setCustomerId} value={customerId} required>
                    <SelectTrigger><SelectValue placeholder="Selecciona un cliente..." /></SelectTrigger>
                    <SelectContent>
                        {customers.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="locationId">Local de Entrega</Label>
                 <Select onValueChange={setLocationId} value={locationId} required disabled={!customerId}>
                    <SelectTrigger><SelectValue placeholder="Selecciona un local..." /></SelectTrigger>
                    <SelectContent>
                        {availableLocations.map(l => (
                            <SelectItem key={l.id} value={l.id}>{l.name} - {l.address}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="deliveryDate">Fecha de Entrega</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="deliveryDate"
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !deliveryDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deliveryDate ? format(deliveryDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={deliveryDate}
                        onSelect={setDeliveryDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        locale={es}
                    />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
      
        <div className="space-y-4 border-t pt-4">
            <Label>Productos</Label>
            {items.map((item, index) => {
                return (
                 <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <Select onValueChange={(value) => handleItemChange(index, 'recipeId', value)} value={item.recipeId}>
                        <SelectTrigger className="col-span-5">
                            <SelectValue placeholder="Producto/Receta"/>
                        </SelectTrigger>
                        <SelectContent>
                            {recipes.map(recipe => (
                                <SelectItem key={recipe.id} value={recipe.id}>{recipe.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <Select onValueChange={(value) => handleItemChange(index, 'formatSku', value)} value={item.formatSku} disabled={!item.recipeId}>
                        <SelectTrigger className="col-span-4">
                            <SelectValue placeholder="Formato"/>
                        </SelectTrigger>
                        <SelectContent>
                            {availableFormats(item.recipeId).map(format => (
                                <SelectItem key={format.sku} value={format.sku}>{format.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Input
                        type="number"
                        placeholder="Cant."
                        min="1"
                        value={item.quantity || ''}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="col-span-2"
                        required
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="col-span-1 h-8 w-8" disabled={items.length <= 1}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
                )
            })}
            <Button type="button" variant="outline" onClick={addItem} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Producto
            </Button>
        </div>

        <div className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="dispatcher">Responsable de Entrega</Label>
                    <ComboboxInput 
                        value={dispatcher} 
                        onSelect={setDispatcher} 
                        placeholder="Seleccionar..." 
                        options={dispatchers} 
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="comments">Comentarios</Label>
                    <Textarea 
                        id="comments"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Instrucciones especiales, horarios, etc."
                    />
                </div>
            </div>
        </div>


      <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mx-2 -mb-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{initialData ? 'Guardar Cambios' : 'Crear Orden'}</Button>
      </DialogFooter>
    </form>
  );
}
