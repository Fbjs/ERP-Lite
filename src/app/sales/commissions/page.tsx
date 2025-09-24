
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, Calculator, User, Calendar as CalendarIcon, Info, ChevronDown, ChevronRight } from 'lucide-react';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


type CommissionDetail = {
    orderId: string;
    orderDate: string;
    customerName: string;
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
    const [openVendors, setOpenVendors] = useState<Record<string, boolean>>({});

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
                    
                    const matchingRules = initialCommissionRules
                        .map(rule => {
                            let score = 0;
                            if (rule.vendor === vendor) { score += 4; }
                            if (rule.productFamily === productFamily) { score += 2; }
                            if (rule.locationId === locationId) { score += 1; }

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

                    if (itemCommission > 0) {
                        vendorData.totalSales += itemSaleAmount;
                        vendorData.totalCommission += itemCommission;
                        vendorData.details.push({
                            orderId: order.id,
                            orderDate: order.date,
                            customerName: order.customer,
                            productName: recipe?.name || 'N/A',
                            saleAmount: itemSaleAmount,
                            appliedRate,
                            commissionAmount: itemCommission,
                            ruleApplied: ruleApplied,
                        });
                    }
                });
            }
        });

        const results: CommissionResult[] = Array.from(resultsMap.entries())
            .map(([vendor, data]) => ({ vendor, ...data }))
            .filter(r => r.details.length > 0);

        setCommissionData(results);
        if(results.length > 0) {
            setOpenVendors(results.reduce((acc, v) => ({...acc, [v.vendor]: true}), {}));
        }

        toast({
            title: "Comisiones Calculadas",
            description: `Se han calculado las comisiones para el período ${format(startDate, 'MMMM yyyy', {locale: es})}.`
        });
    };

    const toggleVendor = (vendor: string) => {
        setOpenVendors(prev => ({...prev, [vendor]: !prev[vendor]}));
    };


    return (
        <AppLayout pageTitle="Índice de Comisiones">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Índice de Comisiones</CardTitle>
                            <CardDescription className="font-body">
                                Calcula y desglosa las comisiones por vendedor para un período específico.
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
                    
                    <div className="space-y-4">
                         {commissionData.length > 0 ? commissionData.map(data => (
                            <Collapsible key={data.vendor} open={openVendors[data.vendor]} onOpenChange={() => toggleVendor(data.vendor)}>
                                <CollapsibleTrigger asChild>
                                    <div className="flex items-center justify-between p-3 bg-secondary rounded-lg cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            {openVendors[data.vendor] ? <ChevronDown className="h-5 w-5"/> : <ChevronRight className="h-5 w-5"/>}
                                            <span className="font-bold text-lg">{data.vendor}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary">{formatCurrency(data.totalCommission)}</p>
                                            <p className="text-xs text-muted-foreground">Total Comisión</p>
                                        </div>
                                    </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="py-2 pl-4">
                                     <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Día</TableHead>
                                                <TableHead>N° Doc</TableHead>
                                                <TableHead>Cliente</TableHead>
                                                <TableHead>Producto</TableHead>
                                                <TableHead className="text-right">Valor Afecto</TableHead>
                                                <TableHead className="text-right">Comisión</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.details.map((detail, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{format(parseISO(detail.orderDate), 'dd')}</TableCell>
                                                    <TableCell>{detail.orderId}</TableCell>
                                                    <TableCell>{detail.customerName}</TableCell>
                                                    <TableCell>{detail.productName}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(detail.saleAmount)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span className="cursor-pointer font-semibold">{formatCurrency(detail.commissionAmount)}</span>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Regla: {detail.ruleApplied}</p>
                                                                    <p>Tasa: {(detail.appliedRate * 100).toFixed(2)}%</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow className="font-bold bg-secondary/50">
                                                <TableCell colSpan={4} className="text-right">Total Vendedor</TableCell>
                                                <TableCell className="text-right">{formatCurrency(data.totalSales)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(data.totalCommission)}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </CollapsibleContent>
                            </Collapsible>
                         )) : (
                            <div className="h-24 flex items-center justify-center text-center text-muted-foreground">
                                <p>Selecciona un período y haz clic en "Calcular Comisiones" para ver los resultados.</p>
                            </div>
                         )}
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

