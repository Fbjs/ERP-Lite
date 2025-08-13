"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import type { Customer } from '@/app/admin/customers/page';

type CustomerFormData = Omit<Customer, 'id'>;

type CustomerFormProps = {
  customer?: Customer | null;
  onSubmit: (data: CustomerFormData) => void;
  onCancel: () => void;
};

const defaultFormData: CustomerFormData = {
    name: '',
    rut: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    priceList: 'General',
};

export default function CustomerForm({ customer, onSubmit, onCancel }: CustomerFormProps) {
    const [formData, setFormData] = useState<CustomerFormData>(defaultFormData);

    useEffect(() => {
        setFormData(customer || defaultFormData);
    }, [customer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <div className="space-y-1">
                <Label htmlFor="name">Nombre / Razón Social</Label>
                <Input id="name" value={formData.name} onChange={handleChange} required />
            </div>
             <div className="space-y-1">
                <Label htmlFor="rut">RUT</Label>
                <Input id="rut" value={formData.rut} onChange={handleChange} required />
            </div>
             <div className="space-y-1">
                <Label htmlFor="contactPerson">Persona de Contacto</Label>
                <Input id="contactPerson" value={formData.contactPerson} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>
            </div>
             <div className="space-y-1">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" value={formData.address} onChange={handleChange} required />
            </div>
            <div className="space-y-1">
                <Label htmlFor="priceList">Lista de Precios Asignada</Label>
                <Input id="priceList" value={formData.priceList} onChange={handleChange} required />
            </div>
             <DialogFooter className="sticky bottom-0 bg-background py-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">{customer ? 'Guardar Cambios' : 'Crear Cliente'}</Button>
            </DialogFooter>
        </form>
    );
};
