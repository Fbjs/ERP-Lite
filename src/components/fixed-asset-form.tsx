
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';

export type FixedAssetFormData = {
    name: string;
    acquisitionDate: string;
    cost: number;
    usefulLifeYears: number;
};

type FixedAssetFormProps = {
    initialData?: FixedAssetFormData | null;
    onSubmit: (data: FixedAssetFormData) => void;
    onCancel: () => void;
};

const defaultFormData: FixedAssetFormData = {
    name: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    cost: 0,
    usefulLifeYears: 0,
};

export default function FixedAssetForm({ initialData, onSubmit, onCancel }: FixedAssetFormProps) {
    const [formData, setFormData] = useState<FixedAssetFormData>(defaultFormData);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData(defaultFormData);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-1">
                <Label htmlFor="name">Nombre del Activo</Label>
                <Input id="name" value={formData.name} onChange={handleChange} required placeholder="Ej: Horno Industrial"/>
            </div>
             <div className="space-y-1">
                <Label htmlFor="acquisitionDate">Fecha de Adquisición</Label>
                <Input id="acquisitionDate" type="date" value={formData.acquisitionDate} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="cost">Costo Original</Label>
                    <Input id="cost" type="number" value={formData.cost || ''} onChange={handleChange} required placeholder="CLP"/>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="usefulLifeYears">Vida Útil (años)</Label>
                    <Input id="usefulLifeYears" type="number" value={formData.usefulLifeYears || ''} onChange={handleChange} required placeholder="Ej: 10"/>
                </div>
            </div>
            <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit">
                    {initialData ? 'Guardar Cambios' : 'Añadir Activo'}
                </Button>
            </DialogFooter>
        </form>
    );
}
