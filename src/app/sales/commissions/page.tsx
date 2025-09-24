
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, Calculator, User, Calendar as CalendarIcon, Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { initialOrders } from '@/app/sales/page';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { initialCommissionRules } from '@/app/admin/commissions/page';
import { initialRecipes } from '@/app/recipes/page';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


type CommissionDetail = {
    orderId: string;
    productName: string;
    saleAmount: number;
    appliedRate: number;
    commissionAmount: number;
    ruleApplied: string;
};

type CommissionResult = {
    vendor: string;
    totalSales: number;
    totalCommission: number;
    details: CommissionDetail[];
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
};

// Map product families to the categories from the commission table
const getProductFamily = (recipeFamily: string): 'Panes Retail' | 'Panes guguas / industriales' | 'Pan rallado' | null => {
    const familyLower = recipeFamily.toLowerCase();
    if (familyLower.includes('blanco') || familyLower.includes('centeno') || familyLower.includes('pasteleria')) {
        return 'Panes Retail';
    }
    if (familyLower.includes('industrial')) {
        return 'Panes guguas / industriales';
    }
    if (familyLower.includes('tostadas')) {
        return 'Pan rallado';
    }
    return null;
}


export default function CommissionsPage() {
    const { toast } = useToast();
    const [period, setPeriod] = useState(format(new Date(), 'yyyy-MM'));
    const [selectedVendor, setSelectedVendor] = useState<string>('all');
    const [commissionData, setCommissionData] = useState<CommissionResult[]>([]);

    const uniqueVendors = useMemo(() => {
        const vendorNames = initialCommissionRules.map(rule => rule.vendor).filter(Boolean);
        return ['all', ...Array.from(new Set(vendorNames as string[]))];
    }, []);


    const handleCalculateCommissions = () => {
        const [year, month] = period.split('-').map(Number);
        const startDate = startOfMonth(new Date(year, month - 1));
        const endDate = endOfMonth(new Date(year, month - 1));

        const vendorsToCalculate = selectedVendor === 'all' 
            ? uniqueVendors.filter(v => v !== 'all') 
            : [selectedVendor];
        
        const resultsMap = new Map<string, { totalSales: number, totalCommission: number, details: CommissionDetail[] }>();
        vendorsToCalculate.forEach(vendor => {
            resultsMap.set(vendor, { totalSales: 0, totalCommission: 0, details: [] });
        });

        const ordersInPeriod = initialOrders.filter(order => {
            const orderDate = parseISO(order.date);
            return order.status === 'Completado' && orderDate >= startDate && orderDate <= endDate;
        });

        ordersInPeriod.forEach(order => {
            if (resultsMap.has(order.dispatcher)) {
                const vendorData = resultsMap.get(order.dispatcher)!;

                order.items.forEach(item => {
                    const recipe = initialRecipes.find(r => r.id === item.recipeId);
                    if(!recipe) return;

                    const formatInfo = recipe?.formats.find(f => f.sku === item.formatSku);
                    const itemSaleAmount = (formatInfo?.cost || 0) * item.quantity;
                    
                    const productFamily = getProductFamily(recipe.family);
                    const vendor = order.dispatcher;
                    const locationId = order.locationId;
                    
                    // Find the best matching rule
                    const matchingRules = initialCommissionRules
                        .map(rule => {
                            let score = 0;
                            let matches = 0;
                            if (rule.vendor === vendor) { score += 4; matches++; }
                            if (rule.productFamily === productFamily) { score += 2; matches++; }
                            if (rule.locationId === locationId) { score += 1; matches++; }

                            // If a specific field is set but doesn't match, this rule is not applicable.
                            if ((rule.vendor && rule.vendor !== vendor) || 
                                (rule.productFamily && rule.productFamily !== productFamily) ||
                                (rule.locationId && rule.locationId !== locationId)) {
                                return { rule, score: -1 }; 
                            }
                            
                            return { rule, score };
                        })
                        .filter(m => m.score >= 0)
                        .sort((a, b) => b.score - a.score);

                    const bestMatch = matchingRules[0];
                    const appliedRate = bestMatch ? bestMatch.rule.rate : 0;
                    const ruleApplied = bestMatch ? bestMatch.rule.name : 'Sin Regla';
                    
                    const itemCommission = itemSaleAmount * appliedRate;

                    vendorData.totalSales += itemSaleAmount;
                    vendorData.totalCommission += itemCommission;
                    vendorData.details.push({
                        orderId: order.id,
                        productName: recipe?.name || 'N/A',
                        saleAmount: itemSaleAmount,
                        appliedRate,
                        commissionAmount: itemCommission,
                        ruleApplied: ruleApplied,
                    });
                });
            }
        });

        const results: CommissionResult[] = Array.from(resultsMap.entries()).map(([vendor, data]) => ({
            vendor,
            ...data
        }));

        setCommissionData(results);
        toast({
            title: "Comisiones Calculadas",
            description: `Se han calculado las comisiones para el período ${format(startDate, 'MMMM yyyy', {locale: es})}.`
        });
    };


    return (
        <AppLayout pageTitle="Cálculo de Comisiones">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Cálculo de Comisiones por Venta</CardTitle>
                            <CardDescription className="font-body">
                                Selecciona un período y un vendedor para calcular las comisiones basadas en las reglas definidas.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button asChild variant="outline">
                                <Link href="/sales">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b">
                        <div className="flex-1 min-w-[200px] space-y-2">
                            <Label htmlFor="period">Período</Label>
                            <Input 
                                id="period"
                                type="month" 
                                value={period} 
                                onChange={(e) => setPeriod(e.target.value)} 
                            />
                        </div>
                         <div className="flex-1 min-w-[200px] space-y-2">
                            <Label htmlFor="vendor">Vendedor</Label>
                             <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                                <SelectTrigger id="vendor">
                                    <SelectValue placeholder="Seleccionar vendedor" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los Vendedores</SelectItem>
                                    {uniqueVendors.filter(v => v !== 'all').map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button onClick={handleCalculateCommissions}>
                                <Calculator className="mr-2 h-4 w-4" />
                                Calcular Comisiones
                            </Button>
                        </div>
                    </div>
                    
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vendedor</TableHead>
                                <TableHead className="text-right">Total Ventas (Completadas)</TableHead>
                                <TableHead className="text-right">Monto Comisión</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {commissionData.length > 0 ? commissionData.map(data => (
                                <TableRow key={data.vendor}>
                                    <TableCell className="font-medium">{data.vendor}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(data.totalSales)}</TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(data.totalCommission)}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        Selecciona un período y haz clic en "Calcular Comisiones" para ver los resultados.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                         {commissionData.length > 0 && (
                            <TableFooter>
                                <TableRow className="font-bold">
                                    <TableCell>Total</TableCell>
                                    <TableCell className="text-right">{formatCurrency(commissionData.reduce((acc, curr) => acc + curr.totalSales, 0))}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(commissionData.reduce((acc, curr) => acc + curr.totalCommission, 0))}</TableCell>
                                </TableRow>
                            </TableFooter>
                         )}
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
