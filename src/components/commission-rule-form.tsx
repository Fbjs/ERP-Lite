
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CommissionRule } from '@/app/admin/commissions/page';
import { initialCustomers } from '@/app/admin/customers/page';
import { initialOrders } from '@/app/sales/page';

type CommissionRuleFormData = Omit<CommissionRule, 'id'>;

type CommissionRuleFormProps = {
    rule?: CommissionRule | null;
    onSubmit: (data: CommissionRuleFormData) => void;
    onCancel: () => void;
};

const defaultFormData: CommissionRuleFormData = {
    type: 'Vendedor',
    name: '',
    targetName: '',
    rate: 0,
};

export default function CommissionRuleForm({ rule, onSubmit, onCancel }: CommissionRuleFormProps) {
    const [formData, setFormData] = useState<CommissionRuleFormData>(defaultFormData);

    useEffect(() => {
        if (rule) {
            setFormData({ type: rule.type, name: rule.name, targetName: rule.targetName, rate: rule.rate });
        } else {
            setFormData(defaultFormData);
        }
    }, [rule]);

    const uniqueVendors = useMemo(() => {
        return [...new Set(initialOrders.map(order => order.dispatcher))];
    }, []);

    const allLocations = useMemo(() => {
        return initialCustomers.flatMap(c => c.deliveryLocations.map(l => ({ ...l, customerName: c.name })));
    }, []);

    const nameOptions = useMemo(() => {
        switch (formData.type) {
            case 'Vendedor':
                return uniqueVendors.map(v => ({ value: v, label: v }));
            case 'Cliente':
                return initialCustomers.map(c => ({ value: c.id, label: c.name }));
            case 'Local':
                 return allLocations.map(l => ({ value: l.id, label: `${l.customerName} - ${l.name}` }));
            case 'Producto':
                // This would be populated from recipes in a real scenario
                return [{ value: 'GUABCO16', label: 'PAN GUAGUA BLANCA 16X16'}, { value: 'CERE0003', label: 'PAN LINAZA 500 GRS'}];
            case 'General':
                return [{ value: 'Base', label: 'Tasa Base General' }]; // Predefined for the general base rate
            default:
                return [];
        }
    }, [formData.type, uniqueVendors, allLocations]);
    
    useEffect(() => {
        const currentOptionExists = nameOptions.some(opt => opt.value === formData.name);
        if (!currentOptionExists) {
            setFormData(prev => ({...prev, name: '', targetName: ''}));
        }
    }, [nameOptions, formData.name]);


    const handleTargetChange = (value: string) => {
        const selectedOption = nameOptions.find(opt => opt.value === value);
        setFormData(prev => ({
            ...prev,
            name: value,
            targetName: selectedOption ? selectedOption.label : ''
        }));
    };
    
    const handleTypeChange = (value: CommissionRule['type']) => {
        setFormData({ type: value, name: '', targetName: '', rate: 0 });
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-1">
                <Label htmlFor="type">Tipo de Regla</Label>
                <Select value={formData.type} onValueChange={handleTypeChange} required>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="General">General (Base)</SelectItem>
                        <SelectItem value="Vendedor">Por Vendedor</SelectItem>
                        <SelectItem value="Cliente">Por Cliente</SelectItem>
                        <SelectItem value="Local">Por Local de Entrega</SelectItem>
                        <SelectItem value="Producto" disabled>Por Producto (Próximamente)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1">
                <Label htmlFor="name">Aplica a</Label>
                <Select value={formData.name} onValueChange={handleTargetChange} required>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                       {nameOptions.map(opt => (
                           <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                       ))}
                    </SelectContent>
                </Select>
            </div>
            
            <div className="space-y-1">
                <Label htmlFor="rate">Tasa de Comisión (%)</Label>
                <Input 
                    id="rate" 
                    type="number"
                    value={formData.rate ? (formData.rate * 100).toFixed(2) : ''}
                    onChange={(e) => setFormData(p => ({...p, rate: Number(e.target.value) / 100}))}
                    required 
                    placeholder="Ej: 2.5"
                    step="0.01"
                />
            </div>

            <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">{rule ? 'Guardar Cambios' : 'Añadir Regla'}</Button>
            </DialogFooter>
        </form>
    );
}
