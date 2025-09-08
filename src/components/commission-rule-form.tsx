
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
    rate: 0,
};

export default function CommissionRuleForm({ rule, onSubmit, onCancel }: CommissionRuleFormProps) {
    const [formData, setFormData] = useState<CommissionRuleFormData>(defaultFormData);

    useEffect(() => {
        if (rule) {
            setFormData({ type: rule.type, name: rule.name, rate: rule.rate });
        } else {
            setFormData(defaultFormData);
        }
    }, [rule]);

    const uniqueVendors = useMemo(() => {
        return [...new Set(initialOrders.map(order => order.dispatcher))];
    }, []);

    const nameOptions = useMemo(() => {
        switch (formData.type) {
            case 'Vendedor':
                return uniqueVendors;
            case 'Cliente':
                return initialCustomers.map(c => c.name);
            case 'Producto':
                // This would be populated from recipes in a real scenario
                return ['PAN GUAGUA BLANCA 16X16', 'PAN LINAZA 500 GRS'];
            case 'General':
                return ['Base']; // Predefined for the general base rate
            default:
                return [];
        }
    }, [formData.type, uniqueVendors]);
    
    useEffect(() => {
        // Reset name when type changes if it's not in the new options list
        if (!nameOptions.includes(formData.name)) {
            setFormData(prev => ({...prev, name: ''}));
        }
    }, [nameOptions, formData.name]);


    const handleChange = (field: keyof CommissionRuleFormData, value: string | number) => {
        if (field === 'rate') {
             setFormData(prev => ({ ...prev, rate: Number(value) / 100 }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value as any }));
        }
    };
    
    const handleTypeChange = (value: CommissionRule['type']) => {
        setFormData({ type: value, name: '', rate: 0 });
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
                        <SelectItem value="Producto" disabled>Por Producto (Próximamente)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1">
                <Label htmlFor="name">Aplica a</Label>
                <Select value={formData.name} onValueChange={(value) => handleChange('name', value)} required>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                       {nameOptions.map(opt => (
                           <SelectItem key={opt} value={opt}>{opt}</SelectItem>
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
                    onChange={(e) => handleChange('rate', e.target.value)}
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
