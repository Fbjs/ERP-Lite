
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { initialSuppliers } from '@/app/admin/suppliers/page';
import { PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export type PurchaseOrderItem = {
    name: string;
    quantity: number;
    price: number;
};

export type PurchaseOrderData = {
    supplierId: string;
    date: string;
    deliveryDate: string;
    items: PurchaseOrderItem[];
};

type PurchaseOrderFormProps = {
    order?: any;
    onSubmit: (data: PurchaseOrderData) => void;
    onCancel: () => void;
};

const defaultItem: PurchaseOrderItem = { name: '', quantity: 1, price: 0 };

export default function PurchaseOrderForm({ order, onSubmit, onCancel }: PurchaseOrderFormProps) {
    const [supplierId, setSupplierId] = useState('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [deliveryDate, setDeliveryDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [items, setItems] = useState<PurchaseOrderItem[]>([defaultItem]);

    useEffect(() => {
        if (order) {
            setSupplierId(order.supplierId);
            setDate(order.date);
            setDeliveryDate(order.deliveryDate);
            setItems(order.items);
        } else {
            // Reset to default for new order
            setSupplierId('');
            setDate(format(new Date(), 'yyyy-MM-dd'));
            setDeliveryDate(format(new Date(), 'yyyy-MM-dd'));
            setItems([defaultItem]);
        }
    }, [order]);

    const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: string | number) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { ...defaultItem }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ supplierId, date, deliveryDate, items });
    };

    const totals = useMemo(() => {
        const net = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
        const tax = net * 0.19;
        const total = net + tax;
        return { net, tax, total };
    }, [items]);


    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1 col-span-3 md:col-span-1">
                    <Label htmlFor="supplierId">Proveedor</Label>
                    <Select value={supplierId} onValueChange={setSupplierId} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar proveedor" />
                        </SelectTrigger>
                        <SelectContent>
                            {initialSuppliers.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="date">Fecha de Emisión</Label>
                    <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="deliveryDate">Fecha de Entrega</Label>
                    <Input id="deliveryDate" type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} required />
                </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
                <Label className="font-semibold">Ítems de la Orden (precios netos)</Label>
                {items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        <Input
                            placeholder="Nombre del ítem"
                            value={item.name}
                            onChange={e => handleItemChange(index, 'name', e.target.value)}
                            className="flex-1"
                            required
                        />
                        <Input
                            type="number"
                            placeholder="Cantidad"
                            value={item.quantity || ''}
                            onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))}
                            className="w-24"
                            min="1"
                            required
                        />
                        <Input
                            type="number"
                            placeholder="Precio Unit. Neto"
                            value={item.price || ''}
                            onChange={e => handleItemChange(index, 'price', Number(e.target.value))}
                            className="w-32"
                            required
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={items.length <= 1}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={addItem} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Ítem
                </Button>
            </div>
            
             <div className="text-right space-y-2 mt-4">
                <div className="flex justify-end items-center gap-4">
                    <span className="text-sm font-medium">Neto:</span>
                    <span className="font-semibold w-32 text-right">${totals.net.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-end items-center gap-4">
                    <span className="text-sm font-medium">IVA (19%):</span>
                    <span className="font-semibold w-32 text-right">${totals.tax.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-end items-center gap-4 font-bold text-lg">
                    <span>Total:</span>
                    <span className="w-32 text-right">${totals.total.toLocaleString('es-CL')}</span>
                </div>
            </div>

            <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mx-2 -mb-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">{order ? 'Guardar Cambios' : 'Crear Orden'}</Button>
            </DialogFooter>
        </form>
    );
}
