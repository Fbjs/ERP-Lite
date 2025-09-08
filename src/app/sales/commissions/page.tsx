
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, Calculator, User, Calendar as CalendarIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { initialOrders, Order } from '@/app/sales/page';
import { format, parse, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

type CommissionResult = {
    vendor: string;
    totalSales: number;
    commissionRate: number;
    commissionAmount: number;
};

const COMMISSION_RATES: { [key: string]: number } = {
    'RENE': 0.02,
    'MARCELO': 0.025,
    'RODRIGO': 0.02,
    'EXTERNO': 0.01,
    'default': 0.015,
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
};

export default function CommissionsPage() {
    const { toast } = useToast();
    const [period, setPeriod] = useState(format(new Date(), 'yyyy-MM'));
    const [selectedVendor, setSelectedVendor] = useState<string>('all');
    const [commissionData, setCommissionData] = useState<CommissionResult[]>([]);

    const uniqueVendors = useMemo(() => {
        return ['all', ...Array.from(new Set(initialOrders.map(order => order.dispatcher)))];
    }, []);

    const handleCalculateCommissions = () => {
        const [year, month] = period.split('-').map(Number);
        const startDate = startOfMonth(new Date(year, month - 1));
        const endDate = endOfMonth(new Date(year, month - 1));

        const vendorsToCalculate = selectedVendor === 'all' 
            ? uniqueVendors.filter(v => v !== 'all') 
            : [selectedVendor];

        const results: CommissionResult[] = vendorsToCalculate.map(vendor => {
            const vendorSales = initialOrders.filter(order => {
                const orderDate = parse(order.date, 'yyyy-MM-dd', new Date());
                return order.dispatcher === vendor 
                    && order.status === 'Completado' 
                    && orderDate >= startDate && orderDate <= endDate;
            });
            
            const totalSales = vendorSales.reduce((acc, order) => acc + order.amount, 0);
            const commissionRate = COMMISSION_RATES[vendor] || COMMISSION_RATES['default'];
            const commissionAmount = totalSales * commissionRate;

            return {
                vendor,
                totalSales,
                commissionRate,
                commissionAmount,
            };
        });

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
                                Selecciona un período y un vendedor para calcular las comisiones.
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
                                <TableHead className="text-center">Tasa Comisión</TableHead>
                                <TableHead className="text-right">Monto Comisión</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {commissionData.length > 0 ? commissionData.map(data => (
                                <TableRow key={data.vendor}>
                                    <TableCell className="font-medium">{data.vendor}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(data.totalSales)}</TableCell>
                                    <TableCell className="text-center">{(data.commissionRate * 100).toFixed(1)}%</TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(data.commissionAmount)}</TableCell>
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
                                    <TableCell></TableCell>
                                    <TableCell className="text-right">{formatCurrency(commissionData.reduce((acc, curr) => acc + curr.commissionAmount, 0))}</TableCell>
                                </TableRow>
                            </TableFooter>
                         )}
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
