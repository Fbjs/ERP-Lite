
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { initialRecipes } from '@/app/recipes/page';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export type QualityParameterFormData = {
    productName: string;
    parameter: string;
    minValue: number | null;
    maxValue: number | null;
    unit: string;
};

type QualityParameterFormProps = {
    initialData?: QualityParameterFormData | null;
    onSubmit: (data: QualityParameterFormData) => void;
    onCancel: () => void;
};

const defaultFormData: QualityParameterFormData = {
    productName: '',
    parameter: '',
    minValue: null,
    maxValue: null,
    unit: '',
};

export default function QualityParameterForm({ initialData, onSubmit, onCancel }: QualityParameterFormProps) {
    const [formData, setFormData] = useState<QualityParameterFormData>(defaultFormData);

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
            [id]: type === 'number' ? (value === '' ? null : Number(value)) : value,
        }));
    };
    
    const handleSelectChange = (value: string) => {
        setFormData(prev => ({...prev, productName: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-1">
                <Label htmlFor="productName">Producto</Label>
                <Select value={formData.productName} onValueChange={handleSelectChange} required>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar producto..." />
                    </SelectTrigger>
                    <SelectContent>
                        {initialRecipes.map(recipe => (
                            <SelectItem key={recipe.id} value={recipe.name}>{recipe.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <Label htmlFor="parameter">Nombre del Parámetro</Label>
                <Input id="parameter" value={formData.parameter} onChange={handleChange} required placeholder="Ej: Humedad, pH, Color..."/>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="minValue">Valor Mínimo</Label>
                    <Input id="minValue" type="number" value={formData.minValue ?? ''} onChange={handleChange} placeholder="(Opcional)"/>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="maxValue">Valor Máximo</Label>
                    <Input id="maxValue" type="number" value={formData.maxValue ?? ''} onChange={handleChange} placeholder="(Opcional)"/>
                </div>
            </div>
             <div className="space-y-1">
                <Label htmlFor="unit">Unidad de Medida</Label>
                <Input id="unit" value={formData.unit} onChange={handleChange} required placeholder="gr, %, cm, etc."/>
            </div>
            <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">{initialData ? 'Guardar Cambios' : 'Añadir Parámetro'}</Button>
            </DialogFooter>
        </form>
    );
}

