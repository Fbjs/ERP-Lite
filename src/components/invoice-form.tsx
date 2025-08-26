"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Customer, DeliveryLocation } from '@/app/admin/customers/page';

export type InvoiceFormData = {
    customerId: string;
    locationId: string;
    salesperson: string;
    amount: number;
    items: string;
};

type InvoiceFormProps = {
  onSubmit: (data: InvoiceFormData) => void;
  onCancel: () => void;
  customers: Customer[];
};

export default function InvoiceForm({ onSubmit, onCancel, customers }: InvoiceFormProps) {
  const [customerId, setCustomerId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [salesperson, setSalesperson] = useState('');
  const [amount, setAmount] = useState(0);
  const [items, setItems] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !locationId) {
        // Optionally, add a toast notification for the user
        alert('Por favor, selecciona un cliente y un local de entrega.');
        return;
    }
    onSubmit({ customerId, locationId, salesperson, amount, items });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 font-body">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="customerId" className="text-right">
          Cliente
        </Label>
        <Select onValueChange={setCustomerId} value={customerId} required>
            <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona un cliente..." />
            </SelectTrigger>
            <SelectContent>
                {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} ({customer.rut})
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>

      {customerId && (
         <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="locationId" className="text-right">
                Local Entrega
            </Label>
            <Select onValueChange={setLocationId} value={locationId} required>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona un local..." />
                </SelectTrigger>
                <SelectContent>
                    {availableLocations.map(location => (
                        <SelectItem key={location.id} value={location.id}>
                            {location.name} ({location.code})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      )}

       <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="salesperson" className="text-right">
                Vendedor
            </Label>
            <Input
                id="salesperson"
                value={salesperson}
                onChange={(e) => setSalesperson(e.target.value)}
                className="col-span-3"
                required
                disabled={!locationId}
            />
        </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="amount" className="text-right">
          Monto
        </Label>
        <Input
          id="amount"
          type="number"
          value={amount || ''}
          onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          className="col-span-3"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="items" className="text-right pt-2">
          Detalles
        </Label>
        <Textarea
          id="items"
          value={items}
          onChange={(e) => setItems(e.target.value)}
          className="col-span-3"
          placeholder="Ej: 100 x Pan de Masa Madre..."
          required
        />
      </div>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Crear Factura</Button>
      </DialogFooter>
    </form>
  );
}
