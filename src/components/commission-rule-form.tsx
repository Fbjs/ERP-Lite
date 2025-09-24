
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CommissionRule } from '@/app/admin/commissions/page';
import type { Recipe } from '@/app/recipes/page';
import { initialCustomers } from '@/app/admin/customers/page';

type CommissionRuleFormData = Omit<CommissionRule, 'id'>;

type CommissionRuleFormProps = {
    rule?: CommissionRule | null;
    onSubmit: (data: CommissionRuleFormData) => void;
    onCancel: () => void;
    recipes: Recipe[];
    vendors: string[];
};

const defaultFormData: CommissionRuleFormData = {
    name: '',
    rate: 0,
    vendor: null,
    productFamily: null,
    locationId: null,
};

export default function CommissionRuleForm({ rule, onSubmit, onCancel, recipes, vendors }: CommissionRuleFormProps) {
    const [formData, setFormData] = useState<CommissionRuleFormData>(defaultFormData);

    useEffect(() => {
        if (rule) {
            setFormData({ name: rule.name, rate: rule.rate, vendor: rule.vendor, productFamily: rule.productFamily, locationId: rule.locationId });
        } else {
            setFormData(defaultFormData);
        }
    }, [rule]);

    const allLocations = useMemo(() => {
        const locations = new Set<string>();
        initialCustomers.forEach(c => {
            c.deliveryLocations.forEach(l => {
                if(l.name.toLowerCase().includes('jumbo')) {
                     locations.add(l.name);
                }
            })
        });
        return Array.from(locations);
    }, []);
    
    const productFamilies = ['Panes Retail', 'Panes guguas / industriales', 'Pan rallado'];

    const handleSelectChange = (field: keyof CommissionRuleFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value === 'all' ? null : value as any }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-1">
                <Label htmlFor="name">Nombre de la Regla</Label>
                <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={e => setFormData(p => ({...p, name: e.target.value}))} 
                    required 
                    placeholder="Ej: Bono producto estrella en Zona Norte"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="vendor">Vendedor (Opcional)</Label>
                    <Select value={formData.vendor || 'all'} onValueChange={value => handleSelectChange('vendor', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Vendedores</SelectItem>
                            {vendors.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="productFamily">Familia de Producto (Opcional)</Label>
                    <Select value={formData.productFamily || 'all'} onValueChange={value => handleSelectChange('productFamily', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las Familias</SelectItem>
                            {productFamilies.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-1">
                <Label htmlFor="locationId">Local Específico (Opcional)</Label>
                <Select value={formData.locationId || 'all'} onValueChange={value => handleSelectChange('locationId', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Locales</SelectItem>
                        {allLocations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            
            <div className="space-y-1">
                <Label htmlFor="rate">Tasa de Comisión (%)</Label>
                <Input 
                    id="rate" 
                    type="number"
                    value={formData.rate ? (formData.rate * 100) : ''}
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
