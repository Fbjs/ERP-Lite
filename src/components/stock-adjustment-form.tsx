
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { InventoryItem } from '@/app/inventory/page';

type StockAdjustmentFormProps = {
  onSubmit: (newStock: number) => void;
  onCancel: () => void;
  currentItem: InventoryItem;
};

export default function StockAdjustmentForm({ onSubmit, onCancel, currentItem }: StockAdjustmentFormProps) {
  const [newStock, setNewStock] = useState(currentItem.stock);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newStock);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 font-body">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="current-stock" className="text-right">Stock Actual</Label>
        <Input id="current-stock" value={`${currentItem.stock} ${currentItem.unit}`} className="col-span-3" disabled />
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="new-stock" className="text-right">Nuevo Stock</Label>
        <Input
          id="new-stock"
          type="number"
          value={newStock}
          onChange={(e) => setNewStock(Number(e.target.value))}
          className="col-span-3"
          required
        />
      </div>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Ajustar Stock</Button>
      </DialogFooter>
    </form>
  );
}
