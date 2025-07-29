'use client';

import { useState } from 'react';
import { productionVolumeForecast, ProductionVolumeForecastOutput } from '@/ai/flows/production-volume-forecast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ForecastForm() {
    const [recentSales, setRecentSales] = useState('');
    const [inventory, setInventory] = useState('');
    const [running, setRunning] = useState(false);
    const [flowOutput, setFlowOutput] = useState<ProductionVolumeForecastOutput | null>(null);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setRunning(true);
        setFlowOutput(null);

        try {
            const result = await productionVolumeForecast({
                recentSalesData: recentSales,
                currentInventoryLevels: inventory,
            });
            setFlowOutput(result);
        } catch (error) {
            console.error(error);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Ocurrió un error al generar el pronóstico.",
            })
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="recent-sales" className="font-body">Datos de Ventas Recientes</Label>
                    <Textarea
                        id="recent-sales"
                        placeholder="ej., Pan de Masa Madre: 50 unidades, Baguette: 120 unidades..."
                        value={recentSales}
                        onChange={(e) => setRecentSales(e.target.value)}
                        required
                        className="min-h-[150px] font-body"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="inventory-levels" className="font-body">Niveles de Inventario Actuales</Label>
                    <Textarea
                        id="inventory-levels"
                        placeholder="ej., Pan de Masa Madre: 20 unidades, Baguette: 30 unidades..."
                        value={inventory}
                        onChange={(e) => setInventory(e.target.value)}
                        required
                        className="min-h-[150px] font-body"
                    />
                </div>
                <Button type="submit" disabled={running} className="w-full">
                    {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Generar Pronóstico
                </Button>
            </form>

            <div className="flex items-center justify-center">
                {running && !flowOutput ? (
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="font-body">Generando pronóstico...</p>
                    </div>
                ) : flowOutput ? (
                    <Card className="w-full bg-secondary">
                        <CardHeader>
                            <CardTitle className="font-headline">Pronóstico con IA</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap font-body">{flowOutput.forecast}</p>
                        </CardContent>
                    </Card>
                ) : (
                     <div className="flex flex-col items-center gap-4 text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg w-full h-full justify-center">
                        <Wand2 className="h-10 w-10 text-primary" />
                        <p className="font-body">Tu pronóstico de producción aparecerá aquí.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
