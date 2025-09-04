
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BankAccount } from '@/app/admin/bank-accounts/page';

type BankAccountFormData = Omit<BankAccount, 'id'>;

type BankAccountFormProps = {
    account?: BankAccount | null;
    onSubmit: (data: BankAccountFormData) => void;
    onCancel: () => void;
};

const defaultFormData: BankAccountFormData = {
    banco: '',
    numeroCuenta: '',
    tipoCuenta: 'Corriente',
    moneda: 'CLP',
};

export default function BankAccountForm({ account, onSubmit, onCancel }: BankAccountFormProps) {
    const [formData, setFormData] = useState<BankAccountFormData>(defaultFormData);

    useEffect(() => {
        if (account) {
            setFormData(account);
        } else {
            setFormData(defaultFormData);
        }
    }, [account]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };
    
    const handleSelectChange = (field: keyof BankAccountFormData, value: string) => {
        setFormData({ ...formData, [field]: value as any });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-1">
                <Label htmlFor="banco">Nombre del Banco</Label>
                <Input id="banco" value={formData.banco} onChange={handleChange} required placeholder="Ej: BCI" />
            </div>
            <div className="space-y-1">
                <Label htmlFor="numeroCuenta">Número de Cuenta</Label>
                <Input id="numeroCuenta" value={formData.numeroCuenta} onChange={handleChange} required placeholder="Ej: 12345678" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="tipoCuenta">Tipo de Cuenta</Label>
                     <Select value={formData.tipoCuenta} onValueChange={(value) => handleSelectChange('tipoCuenta', value)} required>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Corriente">Corriente</SelectItem>
                            <SelectItem value="Vista">Vista</SelectItem>
                            <SelectItem value="Ahorro">Ahorro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="moneda">Moneda</Label>
                     <Select value={formData.moneda} onValueChange={(value) => handleSelectChange('moneda', value)} required>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CLP">CLP</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">{account ? 'Guardar Cambios' : 'Añadir Cuenta'}</Button>
            </DialogFooter>
        </form>
    );
}
