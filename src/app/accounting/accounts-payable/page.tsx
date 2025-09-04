
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, FileCheck, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';
import { differenceInDays, parseISO, addDays } from 'date-fns';
import { initialPurchases } from '../purchase-ledger/page';
import { initialFees } from '../fees-ledger/page';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
};

type PayableDocument = {
    id: string;
    type: 'Compra' | 'Honorario';
    supplier: string;
    issueDate: Date;
    dueDate: Date;
    amount: number;
    daysOverdue: number;
    agingCategory: 'Corriente' | '0-30 Días' | '31-60 Días' | '>60 Días';
};

const AccountsPayablePage = () => {

    const payableDocuments: PayableDocument[] = useMemo(() => {
        const purchasePayables = initialPurchases.map(p => {
            const issueDate = parseISO(p.date);
            const dueDate = addDays(issueDate, 30); // Assume 30 day term for purchases
             const daysOverdue = differenceInDays(new Date(), dueDate);
             let agingCategory: 'Corriente' | '0-30 Días' | '31-60 Días' | '>60 Días' = 'Corriente';
            if (daysOverdue > 60) agingCategory = '>60 Días';
            else if (daysOverdue > 30) agingCategory = '31-60 Días';
            else if (daysOverdue > 0) agingCategory = '0-30 Días';

            return {
                id: `P-${p.id}`,
                type: 'Compra',
                supplier: p.supplier,
                issueDate,
                dueDate,
                amount: p.total,
                daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
                agingCategory,
            } as PayableDocument;
        });

        const feePayables = initialFees.map(f => {
            const issueDate = parseISO(f.date);
            const dueDate = addDays(issueDate, 30); // Assume 30 day term for fees
            const daysOverdue = differenceInDays(new Date(), dueDate);
             let agingCategory: 'Corriente' | '0-30 Días' | '31-60 Días' | '>60 Días' = 'Corriente';
            if (daysOverdue > 60) agingCategory = '>60 Días';
            else if (daysOverdue > 30) agingCategory = '31-60 Días';
            else if (daysOverdue > 0) agingCategory = '0-30 Días';

            return {
                id: `H-${f.id}`,
                type: 'Honorario',
                supplier: f.issuer,
                issueDate,
                dueDate,
                amount: f.net, // We pay the net amount
                daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
                agingCategory,
            } as PayableDocument;
        });

        return [...purchasePayables, ...feePayables].sort((a,b) => a.dueDate.getTime() - b.dueDate.getTime());
    }, []);

    const summary = useMemo(() => {
        const totalPayable = payableDocuments.reduce((acc, doc) => acc + doc.amount, 0);
        const byAging = payableDocuments.reduce((acc, doc) => {
            acc[doc.agingCategory] = (acc[doc.agingCategory] || 0) + doc.amount;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalPayable,
            current: byAging['Corriente'] || 0,
            due30: byAging['0-30 Días'] || 0,
            due60: byAging['31-60 Días'] || 0,
            dueOver60: byAging['>60 Días'] || 0,
        };
    }, [payableDocuments]);

    return (
        <AppLayout pageTitle="Cuentas por Pagar">
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total por Pagar</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.totalPayable)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Corriente</CardTitle>
                            <FileCheck className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.current)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Vencido 0-30 Días</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-500">{formatCurrency(summary.due30)}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Vencido >30 Días</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.due60 + summary.dueOver60)}</div>
                        </CardContent>
                    </Card>
                </div>
                
                <Card>
                    <CardHeader>
                         <div className="flex flex-wrap justify-between items-center gap-4">
                             <div>
                                <CardTitle className="font-headline">Detalle de Cuentas por Pagar</CardTitle>
                                <CardDescription className="font-body">Listado de documentos de proveedores pendientes de pago.</CardDescription>
                            </div>
                            <Button asChild variant="outline">
                                <Link href="/accounting">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver
                                </Link>
                            </Button>
                         </div>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Proveedor</TableHead>
                                        <TableHead>Tipo Doc.</TableHead>
                                        <TableHead>Fecha Vencimiento</TableHead>
                                        <TableHead className="text-right">Monto</TableHead>
                                        <TableHead>Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payableDocuments.map(doc => (
                                        <TableRow key={doc.id}>
                                            <TableCell>{doc.supplier}</TableCell>
                                            <TableCell>{doc.type}</TableCell>
                                            <TableCell>{doc.dueDate.toLocaleDateString('es-CL')}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(doc.amount)}</TableCell>
                                            <TableCell>
                                                <Badge variant={doc.agingCategory === 'Corriente' ? 'default' : 'destructive'}>
                                                    {doc.agingCategory}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-right font-bold">Total por Pagar</TableCell>
                                        <TableCell className="text-right font-bold">{formatCurrency(summary.totalPayable)}</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default AccountsPayablePage;
