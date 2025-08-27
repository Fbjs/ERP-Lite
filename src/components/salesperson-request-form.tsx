
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Recipe } from '@/app/recipes/page';
import { PlusCircle, Trash2, Calendar as CalendarIcon, ChevronsUpDown, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Customer } from '@/app/admin/customers/page';
import { SalespersonRequestItem } from '@/app/sales/page';

export type SalespersonRequestFormData = {
    salesperson: string;
    deliveryPerson: string;
    responsiblePerson: string;
    date: string;
    deliveryDate: string;
    items: SalespersonRequestItem[];
};

type SalespersonRequestFormProps = {
  onSubmit: (data: SalespersonRequestFormData) => void;
  onCancel: () => void;
  recipes: Recipe[];
  customers: Customer[];
};

const initialItem: SalespersonRequestItem = { client: '', product: '', quantity: 1, type: 'PROD', deliveryAddress: '' };

export default function SalespersonRequestForm({ onSubmit, onCancel, recipes, customers }: SalespersonRequestFormProps) {
  const [salesperson, setSalesperson] = useState('');
  const [deliveryPerson, setDeliveryPerson] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [items, setItems] = useState<SalespersonRequestItem[]>([initialItem]);
  
  const [openCombobox, setOpenCombobox] = useState<{type: 'customer' | 'product', index: number} | null>(null);
  
  const uniqueSalespersons = ['A.NORERO', 'VENDEDOR 2']; // Example data
  const uniqueDeliveryPersons = ['RODRIGO', 'MARCELO', 'RENE']; // Example data


  const handleItemChange = (index: number, field: keyof SalespersonRequestItem, value: string | number) => {
    const newItems = [...items];
    const oldItem = newItems[index];
    
    if (field === 'quantity') {
        newItems[index] = { ...oldItem, quantity: Number(value) };
    } else {
        newItems[index] = { ...oldItem, [field]: value as string };
    }
    
     if (field === 'client') {
        const customer = customers.find(c => c.name === value);
        if (customer && customer.deliveryLocations.length > 0) {
            newItems[index].deliveryAddress = customer.deliveryLocations[0].address;
        } else {
             newItems[index].deliveryAddress = '';
        }
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, initialItem]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !deliveryDate) {
        alert("Por favor, selecciona las fechas del pedido.");
        return;
    }
    onSubmit({ 
        salesperson, 
        deliveryPerson, 
        responsiblePerson, 
        date: format(date, 'yyyy-MM-dd'), 
        deliveryDate: format(deliveryDate, 'yyyy-MM-dd'),
        items 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 font-body max-h-[70vh] overflow-y-auto px-2">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="date">Fecha Pedido</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={es}/>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2">
                <Label htmlFor="deliveryDate">Fecha Entrega</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button id="deliveryDate" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !deliveryDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deliveryDate ? format(deliveryDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={deliveryDate} onSelect={setDeliveryDate} disabled={(d) => d < new Date()} initialFocus locale={es} />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="salesperson">Responsable</Label>
                <Input id="salesperson" value={salesperson} onChange={(e) => setSalesperson(e.target.value)} placeholder="Ej: A.NORERO" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="deliveryPerson">Entrega</Label>
                <Input id="deliveryPerson" value={deliveryPerson} onChange={(e) => setDeliveryPerson(e.target.value)} placeholder="Ej: RODRIGO" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="responsiblePerson">Registro</Label>
                <Input id="responsiblePerson" value={responsiblePerson} onChange={(e) => setResponsiblePerson(e.target.value)} placeholder="Ej: A.NORERO" required />
            </div>
        </div>
      
        <div className="space-y-4 border-t pt-4">
            <Label className="font-semibold text-lg">Items del Pedido</Label>
            {items.map((item, index) => (
                 <div key={index} className="p-4 border rounded-md space-y-4 relative">
                    {items.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => removeItem(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    )}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Cliente</Label>
                            <Popover open={openCombobox?.type === 'customer' && openCombobox.index === index} onOpenChange={(isOpen) => setOpenCombobox(isOpen ? {type: 'customer', index} : null)}>
                                <PopoverTrigger asChild>
                                     <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                                        {item.client || "Seleccionar cliente..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Buscar cliente..." />
                                        <CommandList><CommandEmpty>No encontrado.</CommandEmpty>
                                        <CommandGroup>
                                            {customers.map(c => <CommandItem key={c.id} value={c.name} onSelect={(val) => { handleItemChange(index, 'client', c.name); setOpenCombobox(null); }}>
                                                <Check className={cn("mr-2 h-4 w-4", item.client === c.name ? "opacity-100" : "opacity-0")} />{c.name}
                                            </CommandItem>)}
                                        </CommandGroup></CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label>Producto (Pan)</Label>
                             <Popover open={openCombobox?.type === 'product' && openCombobox.index === index} onOpenChange={(isOpen) => setOpenCombobox(isOpen ? {type: 'product', index} : null)}>
                                <PopoverTrigger asChild>
                                     <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                                        {item.product || "Seleccionar producto..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                     <Command>
                                        <CommandInput placeholder="Buscar producto..." />
                                        <CommandList><CommandEmpty>No encontrado.</CommandEmpty>
                                        <CommandGroup>
                                            {recipes.map(r => <CommandItem key={r.id} value={r.name} onSelect={() => { handleItemChange(index, 'product', r.name); setOpenCombobox(null); }}>
                                                <Check className={cn("mr-2 h-4 w-4", item.product === r.name ? "opacity-100" : "opacity-0")} />{r.name}
                                            </CommandItem>)}
                                        </CommandGroup></CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Cantidad</Label>
                            <Input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} required min="1" />
                        </div>
                         <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Input value={item.type} onChange={e => handleItemChange(index, 'type', e.target.value)} placeholder="Ej: PROD, MERMA" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Dirección / Comentarios</Label>
                        <Input value={item.deliveryAddress} onChange={e => handleItemChange(index, 'deliveryAddress', e.target.value)} />
                    </div>
                 </div>
            ))}
            <Button type="button" variant="outline" onClick={addItem} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Otro Item
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
