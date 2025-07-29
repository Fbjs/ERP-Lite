
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Textarea } from './ui/textarea';

export type InvoiceFormData = {
    client: string;
    amount: number;
    items: string;
};

type InvoiceFormProps = {
  onSubmit: (data: InvoiceFormData) => void;
  onCancel: () => void;
};

export default function InvoiceForm({ onSubmit, onCancel }: InvoiceFormProps) {
  const [client, setClient] = useState('');
  const [amount, setAmount] = useState(0);
  const [items, setItems] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ client, amount, items });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 font-body">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="client" className="text-right">
          Cliente
        </Label>
        <Input
          id="client"
          value={client}
          onChange={(e) => setClient(e.target.value)}
          className="col-span-3"
          required
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
