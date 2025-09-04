
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { useMemo } from 'react';
import { initialSales } from '../sales-ledger/page';
import { initialPurchases } from '../purchase-ledger/page';
import { initialFees } from '../fees-ledger/page';
import { initialJournalEntries } from '../journal/page';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AreaChart, ArrowLeft } from 'lucide-react';


const formatCurrency = (value: number) => {
    if (value === 0) return '';
    return value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 });
};

type AccountType = 'Activo' | 'Pasivo' | 'Patrimonio' | 'Resultado Ganancia' | 'Resultado Perdida';

const chartOfAccounts: { [key: string]: AccountType } = {
    'Banco': 'Activo',
    'Clientes': 'Activo',
    'Gasto por Arriendo': 'Resultado Perdida',
    'Gasto Agua': 'Resultado Perdida',
    'Gasto Luz': 'Resultado Perdida',
    'Ventas': 'Resultado Ganancia',
    'IVA Débito Fiscal': 'Pasivo',
    'Proveedores': 'Pasivo',
    'Sueldos por Pagar': 'Pasivo',
    'Ingresos Financieros': 'Resultado Ganancia',
    'Gastos Bancarios': 'Resultado Perdida',
};

export default function ReportsPage() {
    
    const incomeStatementData = useMemo(() => {
        const totalSales = initialSales
            .filter(s => s.docType === 'Factura Electrónica')
            .reduce((acc, s) => acc + s.net, 0);
        
        const totalCreditNotes = initialSales
            .filter(s => s.docType === 'Nota de Crédito')
            .reduce((acc, s) => acc + s.net, 0); 

        const revenue = totalSales + totalCreditNotes;
        
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

    const eightColumnBalanceData = useMemo(() => {
        const ledger: { [key: string]: { debit: number, credit: number } } = {};

        initialJournalEntries.forEach(entry => {
            entry.entries.forEach(line => {
                if (!ledger[line.account]) {
                    ledger[line.account] = { debit: 0, credit: 0 };
                }
                ledger[line.account].debit += line.debit;
                ledger[line.account].credit += line.credit;
            });
        });
        
        const accounts = Object.entries(ledger).map(([account, sums]) => {
            const balance = sums.debit - sums.credit;
            const type = chartOfAccounts[account] || 'Sin Clasificar';
            return {
                account,
                sumDebit: sums.debit,
                sumCredit: sums.credit,
                balanceDebit: balance > 0 ? balance : 0,
                balanceCredit: balance < 0 ? -balance : 0,
                type,
            };
        });

        const totals = accounts.reduce((acc, curr) => {
            acc.sumDebit += curr.sumDebit;
            acc.sumCredit += curr.sumCredit;
            acc.balanceDebit += curr.balanceDebit;
            acc.balanceCredit += curr.balanceCredit;
            if (curr.type === 'Activo') acc.asset += curr.balanceDebit;
            if (curr.type === 'Pasivo') acc.liability += curr.balanceCredit;
            if (curr.type === 'Patrimonio') acc.equity += curr.balanceCredit;
            if (curr.type === 'Resultado Perdida') acc.loss += curr.balanceDebit;
            if (curr.type === 'Resultado Ganancia') acc.gain += curr.balanceCredit;
            return acc;
        }, { sumDebit: 0, sumCredit: 0, balanceDebit: 0, balanceCredit: 0, asset: 0, liability: 0, equity: 0, loss: 0, gain: 0 });
        
        const resultOfThePeriod = totals.gain - totals.loss;

        return { accounts, totals, resultOfThePeriod };

    }, []);

    return (
        <AppLayout pageTitle="Reportes Financieros">
             <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <CardTitle className="font-headline">Central de Reportes</CardTitle>
                                <CardDescription className="font-body">
                                    Visualiza los reportes financieros clave para la toma de decisiones.
                                </CardDescription>
                            </div>
                             <div className="flex items-center gap-2">
                                <Button asChild variant="outline">
                                    <Link href="/accounting">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Volver
                                    </Link>
                                </Button>
                                <Button asChild>
                                   <Link href="/accounting/cash-flow">
                                    <AreaChart className="mr-2 h-4 w-4"/>
                                     Ver Flujo de Caja
                                   </Link>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Balance de 8 Columnas</CardTitle>
                         <CardDescription className="font-body">Un desglose completo de sumas y saldos, y su clasificación.</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <Table className="text-xs min-w-[1000px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead rowSpan={2} className="text-left align-bottom">Cuenta</TableHead>
                                    <TableHead colSpan={2} className="text-center">Sumas</TableHead>
                                    <TableHead colSpan={2} className="text-center">Saldos</TableHead>
                                    <TableHead colSpan={2} className="text-center">Inventario</TableHead>
                                    <TableHead colSpan={2} className="text-center">Resultados</TableHead>
                                </TableRow>
                                 <TableRow>
                                    <TableHead className="text-right">Debe</TableHead>
                                    <TableHead className="text-right">Haber</TableHead>
                                    <TableHead className="text-right">Deudor</TableHead>
                                    <TableHead className="text-right">Acreedor</TableHead>
                                    <TableHead className="text-right">Activo</TableHead>
                                    <TableHead className="text-right">Pasivo</TableHead>
                                    <TableHead className="text-right">Pérdida</TableHead>
                                    <TableHead className="text-right">Ganancia</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {eightColumnBalanceData.accounts.map(acc => (
                                    <TableRow key={acc.account}>
                                        <TableCell>{acc.account}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(acc.sumDebit)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(acc.sumCredit)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(acc.balanceDebit)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(acc.balanceCredit)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(acc.type === 'Activo' ? acc.balanceDebit : 0)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(acc.type === 'Pasivo' || acc.type === 'Patrimonio' ? acc.balanceCredit : 0)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(acc.type === 'Resultado Perdida' ? acc.balanceDebit : 0)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(acc.type === 'Resultado Ganancia' ? acc.balanceCredit : 0)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                             <TableFooter>
                                <TableRow className="font-bold bg-secondary">
                                    <TableCell>Totales</TableCell>
                                    <TableCell className="text-right">{formatCurrency(eightColumnBalanceData.totals.sumDebit)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(eightColumnBalanceData.totals.sumCredit)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(eightColumnBalanceData.totals.balanceDebit)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(eightColumnBalanceData.totals.balanceCredit)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(eightColumnBalanceData.totals.asset)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(eightColumnBalanceData.totals.liability + eightColumnBalanceData.totals.equity)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(eightColumnBalanceData.totals.loss)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(eightColumnBalanceData.totals.gain)}</TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell colSpan={7} className="text-right font-semibold">Resultado del Ejercicio</TableCell>
                                    <TableCell className="text-right font-semibold">{formatCurrency(eightColumnBalanceData.resultOfThePeriod > 0 ? 0 : -eightColumnBalanceData.resultOfThePeriod)}</TableCell>
                                    <TableCell className="text-right font-semibold">{formatCurrency(eightColumnBalanceData.resultOfThePeriod > 0 ? eightColumnBalanceData.resultOfThePeriod : 0)}</TableCell>
                                </TableRow>
                                <TableRow className="font-bold text-base bg-secondary">
                                    <TableCell colSpan={7} className="text-right">Sumas Iguales</TableCell>
                                    <TableCell className="text-right">{formatCurrency(eightColumnBalanceData.totals.loss + (eightColumnBalanceData.resultOfThePeriod < 0 ? -eightColumnBalanceData.resultOfThePeriod : 0))}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(eightColumnBalanceData.totals.gain + (eightColumnBalanceData.resultOfThePeriod > 0 ? eightColumnBalanceData.resultOfThePeriod : 0))}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                         <p className="text-xs text-muted-foreground mt-4">* Los datos se basan en los movimientos del Libro Diario.</p>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
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

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Balance General Clasificado</CardTitle>
                            <CardDescription className="font-body">Una fotografía de la posición financiera de la empresa.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-bold text-lg text-primary">ACTIVOS</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {eightColumnBalanceData.accounts.filter(a => a.type === 'Activo').map(acc => (
                                        <TableRow key={acc.account}><TableCell>{acc.account}</TableCell><TableCell className="text-right">{formatCurrency(acc.balanceDebit)}</TableCell></TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow className="font-bold text-base bg-secondary/50"><TableCell>TOTAL ACTIVOS</TableCell><TableCell className="text-right">{formatCurrency(eightColumnBalanceData.totals.asset)}</TableCell></TableRow>
                                </TableFooter>
                            </Table>
                             <Table className="mt-4">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-bold text-lg text-primary">PASIVOS Y PATRIMONIO</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow><TableCell colSpan={2} className="font-semibold text-muted-foreground">Pasivos</TableCell></TableRow>
                                     {eightColumnBalanceData.accounts.filter(a => a.type === 'Pasivo').map(acc => (
                                        <TableRow key={acc.account}><TableCell className="pl-6">{acc.account}</TableCell><TableCell className="text-right">{formatCurrency(acc.balanceCredit)}</TableCell></TableRow>
                                    ))}
                                     <TableRow><TableCell colSpan={2} className="font-semibold text-muted-foreground pt-4">Patrimonio</TableCell></TableRow>
                                    <TableRow><TableCell className="pl-6">Resultado del Ejercicio</TableCell><TableCell className="text-right">{formatCurrency(eightColumnBalanceData.resultOfThePeriod)}</TableCell></TableRow>
                                </TableBody>
                                <TableFooter>
                                    <TableRow className="font-bold text-base bg-secondary/50"><TableCell>TOTAL PASIVO Y PATRIMONIO</TableCell><TableCell className="text-right">{formatCurrency(eightColumnBalanceData.totals.liability + eightColumnBalanceData.resultOfThePeriod)}</TableCell></TableRow>
                                </TableFooter>
                            </Table>
                        </CardContent>
                    </Card>

                </div>
             </div>
        </AppLayout>
    );
}
