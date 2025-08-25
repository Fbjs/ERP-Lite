
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Textarea } from './ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

export type CreditNoteFormData = {
    client: string;
    amount: number;
    reason: string;
    originalInvoiceId: string;
};

type CreditNoteFormProps = {
  onSubmit: (data: CreditNoteFormData) => void;
  onCancel: () => void;
  invoices: { id: string; client: string; total: number }[];
};

export default function CreditNoteForm({ onSubmit, onCancel, invoices }: CreditNoteFormProps) {
  const [originalInvoiceId, setOriginalInvoiceId] = useState('');
  const [client, setClient] = useState('');
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState('');

  const handleInvoiceSelect = (invoiceId: string) => {
    const selectedInvoice = invoices.find(inv => inv.id === invoiceId);
    if (selectedInvoice) {
      setOriginalInvoiceId(selectedInvoice.id);
      setClient(selectedInvoice.client);
      setAmount(selectedInvoice.total);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ client, amount, reason, originalInvoiceId });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 font-body">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="originalInvoiceId" className="text-right">
          Factura Original
        </Label>
        <Select onValueChange={handleInvoiceSelect} value={originalInvoiceId}>
            <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona una factura..." />
            </SelectTrigger>
            <SelectContent>
                {invoices.map(inv => (
                    <SelectItem key={inv.id} value={inv.id}>
                        {inv.id} - {inv.client} (${inv.total.toLocaleString('es-CL')})
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>
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
          readOnly
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
        <Label htmlFor="reason" className="text-right pt-2">
          Motivo
        </Label>
        <Textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="col-span-3"
          placeholder="Ej: Anulación de factura, devolución de productos..."
          required
        />
      </div>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Crear Nota de Crédito</Button>
      </DialogFooter>
    </form>
  );
}
