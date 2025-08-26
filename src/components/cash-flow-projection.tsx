'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

type CashFlowData = {
    month: string;
    initialBalance: number;
    collections: number;
    otherIncome: number;
    supplierPayments: number;
    salaries: number;
    operatingExpenses: number;
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
};

const initialCashFlowData: CashFlowData[] = [
    { month: 'Junio', initialBalance: 5000000, collections: 3500000, otherIncome: 100000, supplierPayments: 1800000, salaries: 2500000, operatingExpenses: 400000 },
    // Proyecciones
    { month: 'Julio', initialBalance: 0, collections: 4000000, otherIncome: 50000, supplierPayments: 2000000, salaries: 2500000, operatingExpenses: 450000 },
    { month: 'Agosto', initialBalance: 0, collections: 4200000, otherIncome: 75000, supplierPayments: 2100000, salaries: 2600000, operatingExpenses: 460000 },
];

export default function CashFlowProjection() {
    
    const processedData = useMemo(() => {
        const data = [...initialCashFlowData];
        for (let i = 0; i < data.length; i++) {
            const current = data[i];
            const previous = i > 0 ? data[i - 1] : null;

            const totalIncome = current.collections + current.otherIncome;
            const totalExpenses = current.supplierPayments + current.salaries + current.operatingExpenses;
            
            const initialBalance = previous 
                ? (previous.initialBalance + (previous.collections + previous.otherIncome) - (previous.supplierPayments + previous.salaries + previous.operatingExpenses)) 
                : current.initialBalance;
            
            const finalBalance = initialBalance + totalIncome - totalExpenses;
            
            data[i] = {
                ...current,
                initialBalance,
                totalIncome,
                totalExpenses,
                finalBalance,
            } as any;
        }
        return data;
    }, []);

    const chartData = processedData.map(d => ({
        name: d.month,
        Ingresos: (d as any).totalIncome,
        Egresos: (d as any).totalExpenses,
    }));


    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Proyección de Flujo de Caja Mensual</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold">Concepto</TableHead>
                                {processedData.map(d => <TableHead key={d.month} className="text-right font-bold">{d.month}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="font-semibold bg-secondary/50">
                                <TableCell>Saldo Inicial</TableCell>
                                {processedData.map(d => <TableCell key={d.month} className="text-right">{formatCurrency(d.initialBalance)}</TableCell>)}
                            </TableRow>
                            <TableRow className="bg-green-50/30"><TableCell colSpan={processedData.length + 1} className="font-semibold text-green-700 p-2">Ingresos</TableCell></TableRow>
                            <TableRow>
                                <TableCell className="pl-6">Cobranza Clientes</TableCell>
                                {processedData.map(d => <TableCell key={d.month} className="text-right">{formatCurrency(d.collections)}</TableCell>)}
                            </TableRow>
                             <TableRow>
                                <TableCell className="pl-6">Otros Ingresos</TableCell>
                                {processedData.map(d => <TableCell key={d.month} className="text-right">{formatCurrency(d.otherIncome)}</TableCell>)}
                            </TableRow>
                             <TableRow className="font-semibold">
                                <TableCell className="pl-6">Total Ingresos</TableCell>
                                {processedData.map(d => <TableCell key={d.month} className="text-right text-green-600">{formatCurrency((d as any).totalIncome)}</TableCell>)}
                            </TableRow>
                            <TableRow className="bg-red-50/30"><TableCell colSpan={processedData.length + 1} className="font-semibold text-red-700 p-2">Egresos</TableCell></TableRow>
                            <TableRow>
                                <TableCell className="pl-6">Pago Proveedores</TableCell>
                                {processedData.map(d => <TableCell key={d.month} className="text-right">{formatCurrency(d.supplierPayments)}</TableCell>)}
                            </TableRow>
                             <TableRow>
                                <TableCell className="pl-6">Pago Sueldos</TableCell>
                                {processedData.map(d => <TableCell key={d.month} className="text-right">{formatCurrency(d.salaries)}</TableCell>)}
                            </TableRow>
                            <TableRow>
                                <TableCell className="pl-6">Gastos Operacionales</TableCell>
                                {processedData.map(d => <TableCell key={d.month} className="text-right">{formatCurrency(d.operatingExpenses)}</TableCell>)}
                            </TableRow>
                            <TableRow className="font-semibold">
                                <TableCell className="pl-6">Total Egresos</TableCell>
                                {processedData.map(d => <TableCell key={d.month} className="text-right text-red-600">{formatCurrency((d as any).totalExpenses)}</TableCell>)}
                            </TableRow>
                            <TableRow className="font-bold text-lg bg-secondary">
                                <TableCell>Saldo Final de Caja</TableCell>
                                {processedData.map(d => <TableCell key={d.month} className="text-right">{formatCurrency((d as any).finalBalance)}</TableCell>)}
                            </TableRow>
                        </TableBody>
                    </Table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Gráfico de Flujo de Caja</CardTitle>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${Number(value) / 1000000}M`} />
                            <Tooltip
                                contentStyle={{
                                    background: "hsl(var(--background))",
                                    border: "1px solid hsl(var(--border))",
                                    color: "hsl(var(--foreground))",
                                    fontFamily: "var(--font-body)",
                                    borderRadius: "var(--radius)"
                                }}
                                formatter={(value: number) => formatCurrency(value)}
                            />
                            <Legend wrapperStyle={{ fontFamily: "var(--font-body)" }} />
                            <Bar dataKey="Ingresos" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Egresos" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
