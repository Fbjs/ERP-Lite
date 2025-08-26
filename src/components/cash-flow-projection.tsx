'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Line, LineChart } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Lock, PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Calendar } from './ui/calendar';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';

type MonthlyCashFlowData = {
    month: string;
    monthDate: Date;
    initialBalance: number;
    collections: number;
    otherIncome: number;
    supplierPayments: number;
    salaries: number;
    operatingExpenses: number;
    futureExpenses: number;
};

type DailyCashFlowData = {
    date: Date;
    description: string;
    income: number;
    expense: number;
};

type FutureExpense = {
    date: Date;
    description: string;
    amount: number;
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
};

const initialMonthlyData: MonthlyCashFlowData[] = [
    { month: 'Junio', monthDate: new Date(2025, 5, 1), initialBalance: 5000000, collections: 3500000, otherIncome: 100000, supplierPayments: 1800000, salaries: 2500000, operatingExpenses: 400000, futureExpenses: 0 },
    { month: 'Julio', monthDate: new Date(2025, 6, 1), initialBalance: 0, collections: 4000000, otherIncome: 50000, supplierPayments: 2000000, salaries: 2500000, operatingExpenses: 450000, futureExpenses: 0 },
    { month: 'Agosto', monthDate: new Date(2025, 7, 1), initialBalance: 0, collections: 4200000, otherIncome: 75000, supplierPayments: 2100000, salaries: 2600000, operatingExpenses: 460000, futureExpenses: 0 },
    { month: 'Septiembre', monthDate: new Date(2025, 8, 1), initialBalance: 0, collections: 4100000, otherIncome: 60000, supplierPayments: 1900000, salaries: 2600000, operatingExpenses: 470000, futureExpenses: 0 },
    { month: 'Octubre', monthDate: new Date(2025, 9, 1), initialBalance: 0, collections: 4500000, otherIncome: 80000, supplierPayments: 2200000, salaries: 2650000, operatingExpenses: 480000, futureExpenses: 0 },
];

const initialDailyData: DailyCashFlowData[] = [
    { date: new Date('2025-07-01'), description: 'Cobro Factura F001', income: 450000, expense: 0 },
    { date: new Date('2025-07-01'), description: 'Pago arriendo oficina', income: 0, expense: 700000 },
    { date: new Date('2025-07-02'), description: 'Pago proveedor Harinas del Sur', income: 0, expense: 800000 },
    { date: new Date('2025-07-03'), description: 'Cobro Factura F003', income: 875000, expense: 0 },
    { date: new Date('2025-07-05'), description: 'Venta directa mesón', income: 150000, expense: 0 },
    { date: new Date('2025-07-05'), description: 'Pago servicio de luz', income: 0, expense: 120000 },
    { date: new Date('2025-07-07'), description: 'Cobro Factura F002', income: 1200500, expense: 0 },
];

export default function CashFlowProjection() {
    const [closedMonths, setClosedMonths] = useState<string[]>(['Junio']);
    const { toast } = useToast();
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(2025, 5, 1),
        to: new Date(2025, 10, 0)
    });
    const [futureExpenses, setFutureExpenses] = useState<FutureExpense[]>([]);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [newExpense, setNewExpense] = useState<{description: string, amount: string, date: string}>({description: '', amount: '', date: ''});


    const handleAddFutureExpense = () => {
        if (newExpense.description && newExpense.amount && newExpense.date) {
            setFutureExpenses(prev => [...prev, {
                description: newExpense.description,
                amount: parseFloat(newExpense.amount),
                date: new Date(newExpense.date + 'T00:00:00') // Avoid timezone issues
            }]);
            setNewExpense({description: '', amount: '', date: ''});
            setIsExpenseModalOpen(false);
            toast({ title: 'Gasto Futuro Añadido', description: 'El gasto ha sido incorporado a la proyección.' });
        }
    };
    
    const filteredMonthlyData = useMemo(() => {
         return initialMonthlyData.filter(d => 
            dateRange?.from && dateRange.to && isWithinInterval(d.monthDate, { start: dateRange.from, end: dateRange.to })
        );
    }, [dateRange]);


    const processedMonthlyData = useMemo(() => {
        let data = [...filteredMonthlyData];
        if (data.length === 0) return [];
        
        // Recalculate future expenses for each month in the filtered range
        data = data.map(monthData => {
            const monthStart = monthData.monthDate;
            const monthEnd = endOfMonth(monthStart);
            const totalFutureExpenses = futureExpenses
                .filter(exp => isWithinInterval(exp.date, { start: monthStart, end: monthEnd }))
                .reduce((acc, exp) => acc + exp.amount, 0);
            return { ...monthData, futureExpenses: totalFutureExpenses };
        });

        for (let i = 0; i < data.length; i++) {
            const current = data[i];
            const previous = i > 0 ? data[i - 1] : null;

            const totalIncome = current.collections + current.otherIncome;
            const totalExpenses = current.supplierPayments + current.salaries + current.operatingExpenses + current.futureExpenses;
            
            const initialBalance = previous 
                ? (previous as any).finalBalance
                : current.initialBalance; // Use the original initial balance for the first item in the range
            
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
    }, [filteredMonthlyData, futureExpenses]);

    const monthlyChartData = processedMonthlyData.map(d => ({
        name: d.month,
        Ingresos: (d as any).totalIncome,
        Egresos: (d as any).totalExpenses,
    }));

     const processedDailyData = useMemo(() => {
        if (!dateRange?.from) return [];

        const start = dateRange.from;
        const end = dateRange.to || start;

        const allDays = eachDayOfInterval({ start, end });

        const combinedDailyData: {date: Date, description: string, income: number, expense: number}[] = [
            ...initialDailyData.map(d => ({...d, date: new Date(d.date)})),
            ...futureExpenses.map(fe => ({
                date: fe.date,
                description: `(Gasto Futuro) ${fe.description}`,
                income: 0,
                expense: fe.amount
            }))
        ].sort((a,b) => a.date.getTime() - b.date.getTime());
        
        let runningBalance = processedMonthlyData[0]?.initialBalance || 0;
        let lastKnownBalanceDate = startOfMonth(processedMonthlyData[0]?.monthDate);

        return allDays.map(day => {
            const movementsForDay = combinedDailyData.filter(d => format(d.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
            if (movementsForDay.length > 0) {
                 const dailyTotalIncome = movementsForDay.reduce((acc, curr) => acc + curr.income, 0);
                 const dailyTotalExpense = movementsForDay.reduce((acc, curr) => acc + curr.expense, 0);
                 runningBalance += dailyTotalIncome - dailyTotalExpense;
            }
             return {
                date: day,
                day: format(day, 'dd/MM'),
                balance: runningBalance,
            };
        });

    }, [dateRange, processedMonthlyData, futureExpenses]);

    
    const handleCloseMonth = (month: string) => {
        setClosedMonths(prev => [...prev, month]);
        toast({
            title: `Mes de ${month} Cerrado`,
            description: `El saldo final ha sido confirmado y transferido como saldo inicial del siguiente mes.`,
        });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                             <CardTitle className="font-headline">Herramienta de Flujo de Caja</CardTitle>
                             <CardDescription className="font-body">
                                Analiza y proyecta el flujo de caja. Añade gastos futuros para simular escenarios.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn(
                                        "w-[300px] justify-start text-left font-normal",
                                        !dateRange && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                            {format(dateRange.from, "LLL dd, y", { locale: es })} -{" "}
                                            {format(dateRange.to, "LLL dd, y", { locale: es })}
                                            </>
                                        ) : (
                                            format(dateRange.from, "LLL dd, y", { locale: es })
                                        )
                                        ) : (
                                        <span>Selecciona un rango</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        numberOfMonths={2}
                                        locale={es}
                                    />
                                </PopoverContent>
                            </Popover>
                            <Button onClick={() => setIsExpenseModalOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Añadir Gasto Futuro
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Tabs defaultValue="monthly">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="monthly">Vista Mensual</TabsTrigger>
                    <TabsTrigger value="daily">Vista Diaria</TabsTrigger>
                </TabsList>
                <TabsContent value="monthly" className="space-y-6 mt-4">
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
                                        {processedMonthlyData.map(d => <TableHead key={d.month} className="text-right font-bold">{d.month}</TableHead>)}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow className="font-semibold bg-secondary/50">
                                        <TableCell>Saldo Inicial</TableCell>
                                        {processedMonthlyData.map(d => <TableCell key={d.month} className="text-right">{formatCurrency(d.initialBalance)}</TableCell>)}
                                    </TableRow>
                                    <TableRow className="bg-green-50/30"><TableCell colSpan={processedMonthlyData.length + 1} className="font-semibold text-green-700 p-2">Ingresos</TableCell></TableRow>
                                    <TableRow>
                                        <TableCell className="pl-6">Cobranza Clientes</TableCell>
                                        {processedMonthlyData.map(d => <TableCell key={d.month} className="text-right">{formatCurrency(d.collections)}</TableCell>)}
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="pl-6">Otros Ingresos</TableCell>
                                        {processedMonthlyData.map(d => <TableCell key={d.month} className="text-right">{formatCurrency(d.otherIncome)}</TableCell>)}
                                    </TableRow>
                                    <TableRow className="font-semibold">
                                        <TableCell className="pl-6">Total Ingresos</TableCell>
                                        {processedMonthlyData.map(d => <TableCell key={d.month} className="text-right text-green-600">{formatCurrency((d as any).totalIncome)}</TableCell>)}
                                    </TableRow>
                                    <TableRow className="bg-red-50/30"><TableCell colSpan={processedMonthlyData.length + 1} className="font-semibold text-red-700 p-2">Egresos</TableCell></TableRow>
                                    <TableRow>
                                        <TableCell className="pl-6">Pago Proveedores</TableCell>
                                        {processedMonthlyData.map(d => <TableCell key={d.month} className="text-right">{formatCurrency(d.supplierPayments)}</TableCell>)}
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="pl-6">Pago Sueldos</TableCell>
                                        {processedMonthlyData.map(d => <TableCell key={d.month} className="text-right">{formatCurrency(d.salaries)}</TableCell>)}
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="pl-6">Gastos Operacionales</TableCell>
                                        {processedMonthlyData.map(d => <TableCell key={d.month} className="text-right">{formatCurrency(d.operatingExpenses)}</TableCell>)}
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="pl-6">Gastos Futuros Proyectados</TableCell>
                                        {processedMonthlyData.map(d => <TableCell key={d.month} className="text-right">{formatCurrency(d.futureExpenses)}</TableCell>)}
                                    </TableRow>
                                    <TableRow className="font-semibold">
                                        <TableCell className="pl-6">Total Egresos</TableCell>
                                        {processedMonthlyData.map(d => <TableCell key={d.month} className="text-right text-red-600">{formatCurrency((d as any).totalExpenses)}</TableCell>)}
                                    </TableRow>
                                    <TableRow className="font-bold text-lg bg-secondary">
                                        <TableCell>Saldo Final de Caja</TableCell>
                                        {processedMonthlyData.map(d => <TableCell key={d.month} className="text-right">{formatCurrency((d as any).finalBalance)}</TableCell>)}
                                    </TableRow>
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell>Estado</TableCell>
                                        {processedMonthlyData.map(d => {
                                            const isClosed = closedMonths.includes(d.month);
                                            const canBeClosed = !isClosed && (processedMonthlyData.findIndex(m => m.month === d.month) === closedMonths.length);
                                            return (
                                                <TableCell key={d.month} className="text-right p-2">
                                                    {isClosed ? (
                                                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">Cerrado</Badge>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={!canBeClosed}
                                                            onClick={() => handleCloseMonth(d.month)}
                                                        >
                                                            <Lock className="mr-2 h-4 w-4" />
                                                            Cerrar Mes
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                </TableFooter>
                            </Table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">Gráfico de Flujo de Caja Mensual</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={monthlyChartData}>
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
                </TabsContent>
                <TabsContent value="daily" className="space-y-6 mt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">Detalle de Flujo de Caja Diario</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto h-96">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-bold">Fecha</TableHead>
                                        <TableHead className="text-right font-bold">Saldo</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow className="font-semibold bg-secondary/50">
                                        <TableCell>Saldo Inicial del Período</TableCell>
                                        <TableCell className="text-right">{formatCurrency(processedMonthlyData[0]?.initialBalance || 0)}</TableCell>
                                    </TableRow>
                                    {processedDailyData.map((d, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{d.day}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(d.balance)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                 <TableFooter>
                                    <TableRow className="font-bold text-lg bg-secondary">
                                        <TableCell>Saldo Final Proyectado</TableCell>
                                        <TableCell className="text-right">{formatCurrency(processedDailyData[processedDailyData.length - 1]?.balance || 0)}</TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">Evolución del Saldo Diario</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={processedDailyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${Number(value) / 1000000}M`} />
                                    <Tooltip
                                        contentStyle={{
                                            background: "hsl(var(--background))",
                                            border: "1px solid hsl(var(--border))",
                                            color: "hsl(var(--foreground))",
                                            fontFamily: "var(--font-body)",
                                            borderRadius: "var(--radius)"
                                        }}
                                        formatter={(value: number, name) => [formatCurrency(value), 'Saldo']}
                                    />
                                    <Legend wrapperStyle={{ fontFamily: "var(--font-body)" }} />
                                    <Line type="monotone" dataKey="balance" name="Saldo" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            
            <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-headline">Añadir Gasto Futuro</DialogTitle>
                        <DialogDescription className="font-body">
                            Ingresa un gasto para incluirlo en la proyección de flujo de caja.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="exp-desc" className="text-right">Descripción</Label>
                            <Input id="exp-desc" value={newExpense.description} onChange={(e) => setNewExpense(p => ({...p, description: e.target.value}))} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="exp-amount" className="text-right">Monto</Label>
                            <Input id="exp-amount" type="number" value={newExpense.amount} onChange={(e) => setNewExpense(p => ({...p, amount: e.target.value}))} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="exp-date" className="text-right">Fecha</Label>
                            <Input id="exp-date" type="date" value={newExpense.date} onChange={(e) => setNewExpense(p => ({...p, date: e.target.value}))} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExpenseModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleAddFutureExpense}>Añadir Gasto</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             {futureExpenses.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">Gastos Futuros Registrados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {futureExpenses.map((exp, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{exp.description}</TableCell>
                                        <TableCell>{format(exp.date, 'P', { locale: es })}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(exp.amount)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
