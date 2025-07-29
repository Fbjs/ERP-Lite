"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Textarea } from './ui/textarea';

type OrderData = {
    customer: string;
    amount: number;
    details: string;
};

type SalesOrderFormProps = {
  onSubmit: (data: OrderData) => void;
  onCancel: () => void;
};

export default function SalesOrderForm({ onSubmit, onCancel }: SalesOrderFormProps) {
  const [customer, setCustomer] = useState('');
  const [amount, setAmount] = useState(0);
  const [details, setDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ customer, amount, details });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 font-body">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="customer" className="text-right">
          Cliente
        </Label>
        <Input
          id="customer"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          className="col-span-3"
          placeholder="Nombre del cliente"
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
          step="0.01"
          value={amount || ''}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="col-span-3"
          placeholder="Monto total de la venta"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="details" className="text-right mt-2">
          Detalles
        </Label>
        <Textarea
          id="details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="col-span-3 min-h-[100px]"
          placeholder="Ej: 100 Pan de Masa Madre, 50 Baguettes..."
          required
        />
      </div>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Crear Orden</Button>
      </DialogFooter>
    </form>
  );
}
