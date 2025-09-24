
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Customer, DeliveryLocation } from '@/app/admin/customers/page';
import { Textarea } from './ui/textarea';
import { Recipe, initialRecipes } from '@/app/recipes/page';
import { PlusCircle, Trash2 } from 'lucide-react';
import { addDays, format } from 'date-fns';

export type InvoiceItem = {
  recipeId: string;
  formatSku: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceFormData = {
    customerId: string;
    locationId: string;
    salesperson: string;
    deliveryDate: string;
    items: InvoiceItem[];
    purchaseOrderNumber?: string;
};

type InvoiceFormProps = {
  onSubmit: (data: InvoiceFormData) => void;
  onCancel: () => void;
  customers: Customer[];
  recipes: Recipe[];
};

export default function InvoiceForm({ onSubmit, onCancel, customers, recipes }: InvoiceFormProps) {
  const [customerId, setCustomerId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [salesperson, setSalesperson] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ recipeId: '', formatSku: '', quantity: 1, unitPrice: 0 }]);
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));

  const [availableLocations, setAvailableLocations] = useState<DeliveryLocation[]>([]);

  useEffect(() => {
    if (customerId) {
      const selectedCustomer = customers.find(c => c.id === customerId);
      setAvailableLocations(selectedCustomer?.deliveryLocations || []);
      setLocationId('');
      setSalesperson('');
    } else {
      setAvailableLocations([]);
    }
  }, [customerId, customers]);

  useEffect(() => {
    if (locationId) {
      const selectedLocation = availableLocations.find(l => l.id === locationId);
      setSalesperson(selectedLocation?.salesperson || '');
    }
  }, [locationId, availableLocations]);
  
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    const oldItem = newItems[index];

    let newItem = { ...oldItem, [field]: value };

    if (field === 'recipeId') {
        newItem.formatSku = '';
        newItem.unitPrice = 0;
    }

    if (field === 'formatSku') {
        const recipe = recipes.find(r => r.id === newItem.recipeId);
        const format = recipe?.formats.find(f => f.sku === value);
        newItem.unitPrice = format?.cost || 0;
    }
    
    newItems[index] = newItem;
    setItems(newItems);
  };
  
  const addItem = () => {
    setItems([...items, { recipeId: '', formatSku: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !locationId) {
        alert('Por favor, selecciona un cliente y un local de entrega.');
        return;
    }
    onSubmit({ customerId, locationId, salesperson, items, purchaseOrderNumber, deliveryDate });
  };
  
  const availableFormats = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    return recipe?.formats || [];
  };
  
  const totals = useMemo(() => {
    const neto = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const iva = neto * 0.19;
    const total = neto + iva;
    return { neto, iva, total };
  }, [items]);

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 font-body max-h-[70vh] overflow-y-auto pr-4">
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label>Cliente</Label>
                     <Select onValueChange={setCustomerId} value={customerId} required>
                        <SelectTrigger><SelectValue placeholder="Selecciona un cliente..." /></SelectTrigger>
                        <SelectContent>{customers.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                    </Select>
                </div>
                 <div className="space-y-1">
                    <Label>Local Entrega</Label>
                    <Select onValueChange={setLocationId} value={locationId} required disabled={!customerId}>
                        <SelectTrigger><SelectValue placeholder="Selecciona un local..." /></SelectTrigger>
                        <SelectContent>{availableLocations.map(l => (<SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>))}</SelectContent>
                    </Select>
                </div>
            </div>
             <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                    <Label>Vendedor</Label>
                    <Input value={salesperson} onChange={(e) => setSalesperson(e.target.value)} required readOnly />
                </div>
                 <div className="space-y-1">
                    <Label>Nº Orden Compra (Opcional)</Label>
                    <Input value={purchaseOrderNumber} onChange={(e) => setPurchaseOrderNumber(e.target.value)} />
                </div>
                <div className="space-y-1">
                    <Label>Fecha de Entrega</Label>
                    <Input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} required />
                </div>
            </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
            <Label className="font-semibold">Ítems de la Factura (precios netos)</Label>
            {items.map((item, index) => (
                 <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <Select onValueChange={(value) => handleItemChange(index, 'recipeId', value)} value={item.recipeId}>
                        <SelectTrigger className="col-span-4"><SelectValue placeholder="Producto"/></SelectTrigger>
                        <SelectContent>{recipes.map(r => (<SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>))}</SelectContent>
                    </Select>
                    <Select onValueChange={(value) => handleItemChange(index, 'formatSku', value)} value={item.formatSku} disabled={!item.recipeId}>
                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Formato"/></SelectTrigger>
                        <SelectContent>{availableFormats(item.recipeId).map(f => (<SelectItem key={f.sku} value={f.sku}>{f.name}</SelectItem>))}</SelectContent>
                    </Select>
                    <Input type="number" placeholder="Cant." value={item.quantity || ''} onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))} className="col-span-2 text-center" required />
                    <Input type="number" placeholder="P. Unit" value={item.unitPrice || ''} onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))} className="col-span-2 text-right" required readOnly/>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="col-span-1" disabled={items.length <= 1}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
            ))}
             <Button type="button" variant="outline" onClick={addItem} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Añadir Producto
            </Button>
        </div>
        <div className="text-right space-y-1 mt-4">
            <div className="flex justify-end items-center gap-4">
                <span className="text-sm font-medium">Neto:</span>
                <span className="font-semibold w-32 text-right">${totals.neto.toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-end items-center gap-4">
                <span className="text-sm font-medium">IVA (19%):</span>
                <span className="font-semibold w-32 text-right">${totals.iva.toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-end items-center gap-4 font-bold text-lg">
                <span>Total:</span>
                <span className="w-32 text-right">${totals.total.toLocaleString('es-CL')}</span>
            </div>
        </div>
      <DialogFooter className="mt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Crear Factura</Button>
      </DialogFooter>
    </form>
  );
}
