"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import type { Customer, DeliveryLocation } from '@/app/admin/customers/page';
import { PlusCircle, Trash2 } from 'lucide-react';

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
    priceList: 'General',
    deliveryLocations: [{ id: `loc-${Date.now()}`, code: '', name: '', address: '', salesperson: '' }],
};

export default function CustomerForm({ customer, onSubmit, onCancel }: CustomerFormProps) {
    const [formData, setFormData] = useState<CustomerFormData>(defaultFormData);

    useEffect(() => {
        if (customer) {
             setFormData({
                ...customer,
                deliveryLocations: customer.deliveryLocations.length > 0 ? customer.deliveryLocations : defaultFormData.deliveryLocations
            });
        } else {
            setFormData(defaultFormData);
        }
    }, [customer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleLocationChange = (index: number, field: keyof Omit<DeliveryLocation, 'id'>, value: string) => {
        const newLocations = [...formData.deliveryLocations];
        newLocations[index][field] = value;
        setFormData({ ...formData, deliveryLocations: newLocations });
    };

    const addLocation = () => {
        setFormData({
            ...formData,
            deliveryLocations: [
                ...formData.deliveryLocations,
                { id: `loc-${Date.now()}`, code: '', name: '', address: '', salesperson: '' }
            ]
        });
    };

    const removeLocation = (index: number) => {
        if (formData.deliveryLocations.length <= 1) return;
        const newLocations = formData.deliveryLocations.filter((_, i) => i !== index);
        setFormData({ ...formData, deliveryLocations: newLocations });
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
                <Label htmlFor="contactPerson">Persona de Contacto Principal</Label>
                <Input id="contactPerson" value={formData.contactPerson} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <Label htmlFor="phone">Teléfono Principal</Label>
                    <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="email">Correo Principal</Label>
                    <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>
            </div>
            <div className="space-y-1">
                <Label htmlFor="priceList">Lista de Precios Asignada</Label>
                <Input id="priceList" value={formData.priceList} onChange={handleChange} required />
            </div>

            <div className="space-y-4 pt-4 border-t">
                <Label className="font-semibold text-lg">Locales de Entrega</Label>
                 {formData.deliveryLocations.map((location, index) => (
                    <div key={location.id} className="p-4 border rounded-md space-y-4 relative">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="space-y-1">
                                <Label htmlFor={`loc-code-${index}`}>Código</Label>
                                <Input id={`loc-code-${index}`} value={location.code} onChange={(e) => handleLocationChange(index, 'code', e.target.value)} required placeholder="Ej: BODEGA-STGO"/>
                            </div>
                             <div className="space-y-1 col-span-2">
                                <Label htmlFor={`loc-name-${index}`}>Nombre del Local</Label>
                                <Input id={`loc-name-${index}`} value={location.name} onChange={(e) => handleLocationChange(index, 'name', e.target.value)} required placeholder="Ej: Sucursal Centro"/>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor={`loc-address-${index}`}>Dirección de Entrega</Label>
                            <Input id={`loc-address-${index}`} value={location.address} onChange={(e) => handleLocationChange(index, 'address', e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor={`loc-salesperson-${index}`}>Vendedor Asignado</Label>
                            <Input id={`loc-salesperson-${index}`} value={location.salesperson} onChange={(e) => handleLocationChange(index, 'salesperson', e.target.value)} required placeholder="Nombre del vendedor"/>
                        </div>
                        {formData.deliveryLocations.length > 1 && (
                             <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeLocation(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        )}
                    </div>
                ))}
                 <Button type="button" variant="outline" onClick={addLocation} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Otro Local
                </Button>
            </div>

             <DialogFooter className="sticky bottom-0 bg-background py-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">{customer ? 'Guardar Cambios' : 'Crear Cliente'}</Button>
            </DialogFooter>
        </form>
    );
};
