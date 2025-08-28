
"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Recipe, ProductFormat } from '@/app/recipes/page';
import { PlusCircle, Trash2, Calendar as CalendarIcon, ChevronsUpDown, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Customer } from '@/app/admin/customers/page';
import { Textarea } from './ui/textarea';


type OrderItem = {
    recipeId: string;
    formatSku: string;
    quantity: number;
};

export type OrderFormData = {
    customer: string;
    deliveryDate: string;
    items: OrderItem[];
    dispatcher: string;
    comments: string;
};

type SalesOrderFormProps = {
  onSubmit: (data: OrderFormData) => void;
  onCancel: () => void;
  recipes: Recipe[];
  customers: Customer[];
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

export default function SalesOrderForm({ onSubmit, onCancel, recipes, customers }: SalesOrderFormProps) {
  const [customer, setCustomer] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(addDays(new Date(), 3));
  const [items, setItems] = useState<OrderItem[]>([{ recipeId: '', formatSku: '', quantity: 1 }]);
  const [dispatcher, setDispatcher] = useState('');
  const [comments, setComments] = useState('');
  const [openCustomerCombobox, setOpenCustomerCombobox] = useState(false);
  const [openProductCombobox, setOpenProductCombobox] = useState<number | null>(null);

  const dispatchers = ['RENE', 'MARCELO', 'RODRIGO', 'EXTERNO'];

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items];
    const oldItem = newItems[index];
    
    if (field === 'recipeId') {
        // Reset formatSku when recipe changes
        newItems[index] = { ...oldItem, recipeId: value as string, formatSku: '' };
    } else if (field === 'quantity') {
        newItems[index] = { ...oldItem, quantity: Number(value) };
    } else {
        newItems[index] = { ...oldItem, [field]: value };
    }
    setItems(newItems);
  };

  const getAvailableFormats = (recipeId: string): ProductFormat[] => {
    const recipe = recipes.find(r => r.id === recipeId);
    return recipe?.formats || [];
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
    if (!deliveryDate) {
        alert("Por favor, selecciona una fecha de entrega.");
        return;
    }
    onSubmit({ customer, deliveryDate: format(deliveryDate, 'yyyy-MM-dd'), items, dispatcher, comments });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 py-4 font-body max-h-[70vh] overflow-y-auto px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="customer">Cliente</Label>
                <Popover open={openCustomerCombobox} onOpenChange={setOpenCustomerCombobox}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCustomerCombobox}
                            className="w-full justify-between font-normal"
                        >
                            {customer
                                ? customers.find((c) => c.name === customer)?.name
                                : "Selecciona un cliente..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                            <CommandInput placeholder="Buscar cliente..." />
                            <CommandEmpty>No se encontró el cliente.</CommandEmpty>
                            <CommandList>
                                <CommandGroup>
                                    {customers.map((c) => (
                                        <CommandItem
                                            key={c.id}
                                            value={c.name}
                                            onSelect={(currentValue) => {
                                                setCustomer(customers.find(c => c.name.toLowerCase() === currentValue.toLowerCase())?.name || '');
                                                setOpenCustomerCombobox(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    customer === c.name ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {c.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
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
                const availableFormats = getAvailableFormats(item.recipeId);
                return (
                 <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <Popover open={openProductCombobox === index} onOpenChange={(isOpen) => setOpenProductCombobox(isOpen ? index : null)}>
                        <PopoverTrigger asChild>
                             <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openProductCombobox === index}
                                className="col-span-5 justify-between font-normal"
                            >
                                {item.recipeId
                                    ? recipes.find((r) => r.id === item.recipeId)?.name
                                    : "Producto"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                             <Command>
                                <CommandInput placeholder="Buscar producto..." />
                                <CommandEmpty>No se encontró el producto.</CommandEmpty>
                                <CommandList>
                                     <CommandGroup>
                                        {recipes.map(recipe => (
                                            <CommandItem
                                                key={recipe.id}
                                                value={recipe.name}
                                                onSelect={() => {
                                                    handleItemChange(index, 'recipeId', recipe.id);
                                                    setOpenProductCombobox(null);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        item.recipeId === recipe.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {recipe.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                     <Select value={item.formatSku} onValueChange={(value) => handleItemChange(index, 'formatSku', value)} disabled={!item.recipeId}>
                        <SelectTrigger className="col-span-4">
                            <SelectValue placeholder="Formato" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableFormats.map(format => (
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
        <Button type="submit">Crear Orden</Button>
      </DialogFooter>
    </form>
  );
}
