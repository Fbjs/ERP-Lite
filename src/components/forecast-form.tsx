'use client';

import { useState } from 'react';
import { useFlow } from '@genkit-ai/next/client';
import { productionVolumeForecast, ProductionVolumeForecastInput } from '@/ai/flows/production-volume-forecast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2 } from 'lucide-react';

export default function ForecastForm() {
    const [recentSales, setRecentSales] = useState('');
    const [inventory, setInventory] = useState('');
    const [flow, running] = useFlow(productionVolumeForecast);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const input: ProductionVolumeForecastInput = {
            recentSalesData: recentSales,
            currentInventoryLevels: inventory,
        };
        await flow(input);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="recent-sales" className="font-body">Recent Sales Data</Label>
                    <Textarea
                        id="recent-sales"
                        placeholder="e.g., Pain au Levain: 50 units, Baguette: 120 units..."
                        value={recentSales}
                        onChange={(e) => setRecentSales(e.target.value)}
                        required
                        className="min-h-[150px] font-body"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="inventory-levels" className="font-body">Current Inventory Levels</Label>
                    <Textarea
                        id="inventory-levels"
                        placeholder="e.g., Pain au Levain: 20 units, Baguette: 30 units..."
                        value={inventory}
                        onChange={(e) => setInventory(e.target.value)}
                        required
                        className="min-h-[150px] font-body"
                    />
                </div>
                <Button type="submit" disabled={running} className="w-full">
                    {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Generate Forecast
                </Button>
            </form>

            <div className="flex items-center justify-center">
                {running ? (
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="font-body">Generating forecast...</p>
                    </div>
                ) : flow.output ? (
                    <Card className="w-full bg-secondary">
                        <CardHeader>
                            <CardTitle className="font-headline">AI-Powered Forecast</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap font-body">{flow.output.forecast}</p>
                        </CardContent>
                    </Card>
                ) : (
                     <div className="flex flex-col items-center gap-4 text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg w-full h-full justify-center">
                        <Wand2 className="h-10 w-10 text-primary" />
                        <p className="font-body">Your production forecast will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
