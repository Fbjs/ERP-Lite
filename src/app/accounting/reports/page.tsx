
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMemo } from 'react';
import { initialSales } from '../sales-ledger/page';
import { initialPurchases } from '../purchase-ledger/page';
import { initialFees } from '../fees-ledger/page';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AreaChart } from 'lucide-react';


const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
};

export default function ReportsPage() {
    
    const incomeStatementData = useMemo(() => {
        const totalSales = initialSales
            .filter(s => s.docType === 'Factura Electrónica')
            .reduce((acc, s) => acc + s.net, 0);
        
        const totalCreditNotes = initialSales
            .filter(s => s.docType === 'Nota de Crédito')
            .reduce((acc, s) => acc + s.net, 0); // net is negative

        const revenue = totalSales + totalCreditNotes;
        
        // Simulación del costo de ventas (60% de los ingresos)
        const costOfGoodsSold = revenue * 0.6;
        const grossProfit = revenue - costOfGoodsSold;

        const totalPurchases = initialPurchases
            .filter(p => p.docType === 'Factura Electrónica')
            .reduce((acc, p) => acc + p.net, 0);

        const totalFees = initialFees.reduce((acc, f) => acc + f.gross, 0);

        const operatingExpenses = totalPurchases + totalFees;
        const netIncome = grossProfit - operatingExpenses;

        return {
            revenue,
            costOfGoodsSold,
            grossProfit,
            operatingExpenses,
            netIncome
        };
    }, []);
    

    return (
        <AppLayout pageTitle="Reportes Financieros">
             <div className="space-y-6">
                <Card>
                    <CardHeader>
                         <CardTitle className="font-headline">Central de Reportes</CardTitle>
                        <CardDescription className="font-body">
                            Visualiza los reportes financieros clave para la toma de decisiones.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                           <Link href="/accounting/cash-flow">
                            <AreaChart className="mr-2 h-4 w-4"/>
                             Ver Flujo de Caja
                           </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Estado de Resultados</CardTitle>
                        <CardDescription className="font-body">
                           Un resumen de los ingresos y gastos durante un período específico.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                <TableRow className="font-bold text-base">
                                    <TableCell>Ingresos por Ventas</TableCell>
                                    <TableCell className="text-right">{formatCurrency(incomeStatementData.revenue)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="pl-8">Costo de Ventas (COGS)</TableCell>
                                    <TableCell className="text-right text-red-600">({formatCurrency(incomeStatementData.costOfGoodsSold)})</TableCell>
                                </TableRow>
                                <TableRow className="font-bold text-lg border-t-2 border-b-2 border-primary">
                                    <TableCell>Utilidad Bruta</TableCell>
                                    <TableCell className="text-right">{formatCurrency(incomeStatementData.grossProfit)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="pl-8">Gastos Operacionales</TableCell>
                                    <TableCell className="text-right text-red-600">({formatCurrency(incomeStatementData.operatingExpenses)})</TableCell>
                                </TableRow>
                                <TableRow className="font-bold text-xl bg-secondary">
                                    <TableCell>Utilidad Neta (Antes de Impuestos)</TableCell>
                                    <TableCell className="text-right">{formatCurrency(incomeStatementData.netIncome)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                         <p className="text-xs text-muted-foreground mt-4">* Los datos son para fines demostrativos y se basan en los movimientos de los libros de Ventas y Compras.</p>
                    </CardContent>
                </Card>
             </div>
        </AppLayout>
    );
}

