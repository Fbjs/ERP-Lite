'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Upload } from 'lucide-react';

// Datos iniciales de la empresa (simulación)
const initialCompanyData = {
    name: 'Panificadora Vollkorn SPA',
    rut: '76.123.456-7',
    activity: 'Elaboración de productos de panadería',
    address: 'Avenida Principal 123',
    commune: 'Santiago',
    city: 'Santiago',
    phone: '+56 2 2123 4567',
    email: 'contacto@vollkorn.cl',
};


export default function CompaniesPage() {
    const [companyData, setCompanyData] = useState(initialCompanyData);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setCompanyData(prev => ({ ...prev, [id]: value }));
    };

    const handleSaveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulación de guardado
        setTimeout(() => {
            setIsSaving(false);
            toast({
                title: 'Datos Guardados',
                description: 'La información de la empresa ha sido actualizada correctamente.',
            });
        }, 1000);
    };

    return (
        <AppLayout pageTitle="Mantenedor de Empresas">
            <form onSubmit={handleSaveChanges}>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Datos de la Empresa</CardTitle>
                        <CardDescription className="font-body">
                            Esta información se utilizará para la facturación y otros documentos oficiales.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Razón Social</Label>
                                <Input id="name" value={companyData.name} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rut">RUT</Label>
                                <Input id="rut" value={companyData.rut} onChange={handleInputChange} />
                            </div>
                        </div>

                         <div className="space-y-2">
                            <Label htmlFor="activity">Giro</Label>
                            <Input id="activity" value={companyData.activity} onChange={handleInputChange} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Input id="address" value={companyData.address} onChange={handleInputChange} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="commune">Comuna</Label>
                                <Input id="commune" value={companyData.commune} onChange={handleInputChange} />
                            </div>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="city">Ciudad</Label>
                                <Input id="city" value={companyData.city} onChange={handleInputChange} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input id="phone" value={companyData.phone} onChange={handleInputChange} />
                            </div>
                        </div>
                        
                         <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input id="email" type="email" value={companyData.email} onChange={handleInputChange} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="logo">Logo de la Empresa</Label>
                             <div className="flex items-center gap-4">
                                <Input id="logo" type="file" className="max-w-xs" />
                                <span className="text-sm text-muted-foreground">Sube el logo que aparecerá en las facturas.</span>
                            </div>
                        </div>
                        
                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </AppLayout>
    );
}
