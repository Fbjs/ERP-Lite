"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';

type OrderData = {
    product: string;
    quantity: number;
    stage: string;
};

type ProductionOrderFormProps = {
  onSubmit: (data: OrderData) => void;
  onCancel: () => void;
  initialData?: Partial<OrderData>;
};

export default function ProductionOrderForm({ onSubmit, onCancel, initialData = {} }: ProductionOrderFormProps) {
  const [product, setProduct] = useState(initialData.product || '');
  const [quantity, setQuantity] = useState(initialData.quantity || 0);
  const [stage, setStage] = useState(initialData.stage || 'Mezclando');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ product, quantity, stage });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 font-body">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="product" className="text-right">
          Producto
        </Label>
        <Input
          id="product"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          className="col-span-3"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="quantity" className="text-right">
          Cantidad
        </Label>
        <Input
          id="quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
          className="col-span-3"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="stage" className="text-right">
          Etapa Inicial
        </Label>
        <Input
          id="stage"
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="col-span-3"
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
