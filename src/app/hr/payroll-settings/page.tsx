
'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

type PayrollSettings = {
    afpRate: number;
    healthRate: number;
    unemploymentInsuranceRate: number;
    monthlyTaxableTop: number;
    ufValue: number;
};

export const defaultPayrollSettings: PayrollSettings = {
    afpRate: 0.11, // 11% en promedio
    healthRate: 0.07, // 7%
    unemploymentInsuranceRate: 0.006, // 0.6% cargo trabajador
    monthlyTaxableTop: 84.3, // Tope Imponible AFP/Salud en UF
    ufValue: 37500, // Valor UF de ejemplo
};


export default function PayrollSettingsPage() {
    const [settings, setSettings] = useState<PayrollSettings>(defaultPayrollSettings);
    const { toast } = useToast();

    const handleSave = () => {
        // En una aplicación real, aquí guardarías los datos en una base de datos o API.
        console.log("Saving settings:", settings);
        toast({
            title: "Parámetros Guardados",
            description: "Las variables para el cálculo de la nómina han sido actualizadas.",
        });
    };
    
    const handleInputChange = (field: keyof PayrollSettings, value: string) => {
        setSettings(prev => ({...prev, [field]: Number(value)}));
    }

    return (
        <AppLayout pageTitle="Parámetros de Nómina">
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                     <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Parámetros para Cálculo de Nómina</CardTitle>
                            <CardDescription className="font-body">
                                Modifica las tasas y topes utilizados en el procesamiento de liquidaciones.
                            </CardDescription>
                        </div>
                         <div className="flex items-center gap-2">
                             <Button asChild variant="outline">
                                <Link href="/hr">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg">Cotizaciones Previsionales (%)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="afpRate">Tasa Cotización AFP (%)</Label>
                                <Input 
                                    id="afpRate" 
                                    type="number" 
                                    value={settings.afpRate * 100}
                                    onChange={(e) => handleInputChange('afpRate', String(Number(e.target.value) / 100))}
                                    step="0.01"
                                />
                                <p className="text-xs text-muted-foreground">Promedio del sistema. Cada AFP tiene su tasa.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="healthRate">Tasa Cotización Salud (%)</Label>
                                <Input 
                                    id="healthRate" 
                                    type="number" 
                                    value={settings.healthRate * 100}
                                    onChange={(e) => handleInputChange('healthRate', String(Number(e.target.value) / 100))}
                                    step="0.01"
                                />
                                 <p className="text-xs text-muted-foreground">7% legal para Fonasa o Isapre.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unemploymentInsuranceRate">Seguro Cesantía Trabajador (%)</Label>
                                <Input 
                                    id="unemploymentInsuranceRate" 
                                    type="number" 
                                    value={settings.unemploymentInsuranceRate * 100}
                                    onChange={(e) => handleInputChange('unemploymentInsuranceRate', String(Number(e.target.value) / 100))}
                                    step="0.01"
                                />
                                <p className="text-xs text-muted-foreground">0.6% para contratos indefinidos.</p>
                            </div>
                        </div>
                    </div>

                     <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg">Valores y Topes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="monthlyTaxableTop">Tope Imponible Mensual (UF)</Label>
                                <Input 
                                    id="monthlyTaxableTop" 
                                    type="number" 
                                    value={settings.monthlyTaxableTop}
                                    onChange={(e) => handleInputChange('monthlyTaxableTop', e.target.value)}
                                    step="0.1"
                                />
                                <p className="text-xs text-muted-foreground">Tope para AFP, Salud y Seguro de Cesantía.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ufValue">Valor UF del Mes</Label>
                                <Input 
                                    id="ufValue" 
                                    type="number" 
                                    value={settings.ufValue}
                                    onChange={(e) => handleInputChange('ufValue', e.target.value)}
                                    step="1"
                                />
                                 <p className="text-xs text-muted-foreground">Usar el valor del último día del mes.</p>
                            </div>
                        </div>
                    </div>
                     <div className="flex justify-end">
                        <Button onClick={handleSave}>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Cambios
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

