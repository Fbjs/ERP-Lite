
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Textarea } from './ui/textarea';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

export type JournalEntryLine = {
    account: string;
    debit: number;
    credit: number;
};

export type JournalEntryData = {
    date: Date;
    description: string;
    entries: JournalEntryLine[];
};

type JournalEntryFormProps = {
  onSubmit: (data: JournalEntryData) => void;
  onCancel: () => void;
};

export default function JournalEntryForm({ onSubmit, onCancel }: JournalEntryFormProps) {
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [entries, setEntries] = useState<JournalEntryLine[]>([
    { account: '', debit: 0, credit: 0 },
    { account: '', debit: 0, credit: 0 },
  ]);

  const handleEntryChange = (index: number, field: keyof JournalEntryLine, value: string | number) => {
    const newEntries = [...entries];
    if (typeof value === 'string') {
        newEntries[index][field] = value;
    } else {
        newEntries[index][field] = value || 0;
    }
    // Ensure only one of debit or credit has a value
    if (field === 'debit' && value > 0) newEntries[index].credit = 0;
    if (field === 'credit' && value > 0) newEntries[index].debit = 0;

    setEntries(newEntries);
  };

  const addEntryLine = () => {
    setEntries([...entries, { account: '', debit: 0, credit: 0 }]);
  };

  const removeEntryLine = (index: number) => {
    if (entries.length > 2) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const totalDebit = entries.reduce((sum, item) => sum + item.debit, 0);
  const totalCredit = entries.reduce((sum, item) => sum + item.credit, 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
        alert('El asiento no está balanceado. El total de débitos debe ser igual al total de créditos.');
        return;
    }
    onSubmit({ date, description, entries });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 font-body">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="date" className="text-right">
          Fecha
        </Label>
        <Input
          id="date"
          type="date"
          value={date.toISOString().split('T')[0]}
          onChange={(e) => setDate(new Date(e.target.value))}
          className="col-span-3"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="description" className="text-right pt-2">
          Glosa
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="col-span-3"
          placeholder="Descripción del asiento contable"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Detalle del Asiento</Label>
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-2/5">Cuenta Contable</TableHead>
                        <TableHead className="text-right">Debe</TableHead>
                        <TableHead className="text-right">Haber</TableHead>
                        <TableHead className="w-[50px]"><span className="sr-only">Borrar</span></TableHead>
                    </TableRow>
                </TableHeader>
                 <TableBody>
                    {entries.map((entry, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <Input
                                    value={entry.account}
                                    onChange={(e) => handleEntryChange(index, 'account', e.target.value)}
                                    placeholder="Ej: Banco, Caja, Ventas..."
                                    required
                                />
                            </TableCell>
                             <TableCell>
                                <Input
                                    type="number"
                                    value={entry.debit || ''}
                                    onChange={(e) => handleEntryChange(index, 'debit', parseFloat(e.target.value))}
                                    className="text-right"
                                />
                            </TableCell>
                             <TableCell>
                                <Input
                                    type="number"
                                    value={entry.credit || ''}
                                    onChange={(e) => handleEntryChange(index, 'credit', parseFloat(e.target.value))}
                                    className="text-right"
                                />
                            </TableCell>
                            <TableCell>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeEntryLine(index)}
                                    disabled={entries.length <= 2}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="p-2 border-t">
                 <Button type="button" variant="outline" size="sm" onClick={addEntryLine}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Añadir Línea
                </Button>
            </div>
             <div className="flex justify-end gap-4 p-4 border-t font-mono font-bold">
                <div className="w-1/4 text-right">${totalDebit.toLocaleString('es-CL')}</div>
                <div className="w-1/4 text-right">${totalCredit.toLocaleString('es-CL')}</div>
                <div className="w-[50px]"></div>
            </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!isBalanced}>Crear Asiento</Button>
      </DialogFooter>
    </form>
  );
}
