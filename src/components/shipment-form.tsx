
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Textarea } from './ui/textarea';

type ShipmentFormData = {
    order: string;
    client: string;
    address: string;
    details: string;
    vehicle: string;
};

type ShipmentFormProps = {
  onSubmit: (data: ShipmentFormData) => void;
  onCancel: () => void;
};

export default function ShipmentForm({ onSubmit, onCancel }: ShipmentFormProps) {
  const [order, setOrder] = useState('');
  const [client, setClient] = useState('');
  const [address, setAddress] = useState('');
  const [details, setDetails] = useState('');
  const [vehicle, setVehicle] = useState('');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ order, client, address, details, vehicle });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 font-body">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="order" className="text-right">
          Nº Orden
        </Label>
        <Input
          id="order"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="col-span-3"
          placeholder="Ej: SALE881"
          required
        />
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
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="address" className="text-right">
          Dirección
        </Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="col-span-3"
          placeholder="Dirección de despacho"
          required
        />
      </div>
       <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="details" className="text-right pt-2">
          Detalle
        </Label>
        <Textarea
          id="details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="col-span-3"
          placeholder="Ej: 100 x Pan de Masa Madre..."
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="vehicle" className="text-right">
          Vehículo
        </Label>
        <Input
          id="vehicle"
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
          className="col-span-3"
          placeholder="Ej: Patente XX-YY-ZZ, Courier"
          required
        />
      </div>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Crear Despacho</Button>
      </DialogFooter>
    </form>
  );
}

    