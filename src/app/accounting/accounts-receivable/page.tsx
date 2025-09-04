
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, FileCheck, Clock, AlertTriangle, Users, DollarSign, ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';
import { initialOrders } from '@/app/sales/page';
import { differenceInDays, parseISO, addDays } from 'date-fns';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
};

const AccountsReceivablePage = () => {
    const receivableInvoices = useMemo(() => {
        return initialOrders
            .filter(order => order.status === 'Pendiente' || order.status === 'Enviado')
            .map(order => {
                const dueDate = addDays(parseISO(order.deliveryDate), 30); // Assume 30-day payment term
                const daysOverdue = differenceInDays(new Date(), dueDate);
                
                let agingCategory: 'Corriente' | '0-30 Días' | '31-60 Días' | '>60 Días' = 'Corriente';
                if (daysOverdue > 60) agingCategory = '>60 Días';
                else if (daysOverdue > 30) agingCategory = '31-60 Días';
                else if (daysOverdue > 0) agingCategory = '0-30 Días';

                return {
                    ...order,
                    dueDate: dueDate,
                    daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
                    agingCategory: agingCategory,
                };
            });
    }, []);
    
    const summary = useMemo(() => {
        const totalReceivable = receivableInvoices.reduce((acc, inv) => acc + inv.amount, 0);
        const byAging = receivableInvoices.reduce((acc, inv) => {
            acc[inv.agingCategory] = (acc[inv.agingCategory] || 0) + inv.amount;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalReceivable,
            current: byAging['Corriente'] || 0,
            due30: byAging['0-30 Días'] || 0,
            due60: byAging['31-60 Días'] || 0,
            dueOver60: byAging['>60 Días'] || 0,
        };
    }, [receivableInvoices]);
    
    const agingChartData = [
        { name: 'Corriente', value: summary.current },
        { name: '0-30 Días', value: summary.due30 },
        { name: '31-60 Días', value: summary.due60 },
        { name: '>60 Días', value: summary.dueOver60 },
    ];

    return (
        <AppLayout pageTitle="Cuentas por Cobrar">
            <div className="space-y-6">
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total por Cobrar</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.totalReceivable)}</div>
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
                
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex flex-wrap justify-between items-center gap-4">
                                <div>
                                    <CardTitle className="font-headline">Detalle de Cuentas por Cobrar</CardTitle>
                                    <CardDescription className="font-body">Listado de facturas pendientes de pago.</CardDescription>
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
                                            <TableHead>Cliente</TableHead>
                                            <TableHead>Factura / OV</TableHead>
                                            <TableHead>Fecha Vencimiento</TableHead>
                                            <TableHead className="text-right">Monto</TableHead>
                                            <TableHead>Estado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {receivableInvoices.map(inv => (
                                            <TableRow key={inv.id}>
                                                <TableCell>{inv.customer}</TableCell>
                                                <TableCell>{inv.id}</TableCell>
                                                <TableCell>{inv.dueDate.toLocaleDateString('es-CL')}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(inv.amount)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={inv.agingCategory === 'Corriente' ? 'default' : 'destructive'}>
                                                        {inv.agingCategory}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
                                            <TableCell className="text-right font-bold">{formatCurrency(summary.totalReceivable)}</TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Antigüedad de la Deuda</CardTitle>
                            <CardDescription>Distribución de las cuentas por cobrar.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={agingChartData} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{background: "hsl(var(--background))"}} formatter={(value: number) => formatCurrency(value)} />
                                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default AccountsReceivablePage;
