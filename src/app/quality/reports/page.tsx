
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { initialOrders } from '@/app/production/page';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { ArrowLeft, CheckCircle, Percent, XCircle, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

// Simulando datos históricos de controles de calidad.
const qualityCheckHistory = [
    { date: '2025-04-15', approved: 28, rejected: 2 },
    { date: '2025-05-10', approved: 35, rejected: 3 },
    { date: '2025-06-20', approved: 40, rejected: 1 },
    { date: '2025-07-05', approved: 42, rejected: 2 },
];


const processHistoricalData = (data: typeof qualityCheckHistory) => {
    const monthlyData: { [key: string]: { approved: number, rejected: number } } = {};

    data.forEach(item => {
        const month = format(parseISO(item.date), 'yyyy-MM');
        if (!monthlyData[month]) {
            monthlyData[month] = { approved: 0, rejected: 0 };
        }
        monthlyData[month].approved += item.approved;
        monthlyData[month].rejected += item.rejected;
    });

    return Object.entries(monthlyData).map(([month, values]) => {
        const total = values.approved + values.rejected;
        return {
            month: format(parseISO(month), 'MMM yyyy', { locale: es }),
            "Tasa de Aprobación": (values.approved / total) * 100,
            "Tasa de Rechazo": (values.rejected / total) * 100,
            total,
            approved: values.approved,
            rejected: values.rejected
        };
    }).sort((a,b) => parseISO(a.month).getTime() - parseISO(b.month).getTime());
};

export default function QualityReportsPage() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subMonths(new Date(), 6),
        to: new Date()
    });

    const chartData = processHistoricalData(qualityCheckHistory);
    
    const summary = useMemo(() => {
        const totalApproved = chartData.reduce((acc, item) => acc + item.approved, 0);
        const totalRejected = chartData.reduce((acc, item) => acc + item.rejected, 0);
        const total = totalApproved + totalRejected;
        const approvalRate = total > 0 ? (totalApproved / total) * 100 : 0;
        return { total, totalApproved, totalRejected, approvalRate };
    }, [chartData]);


    return (
        <AppLayout pageTitle="Reportes de Calidad">
            <div className="space-y-6">
                 <Card>
                    <CardHeader>
                        <div className="flex flex-wrap justify-between items-center gap-4">
                             <div>
                                <CardTitle className="font-headline">Dashboard de Calidad</CardTitle>
                                <CardDescription className="font-body">Análisis histórico de las tasas de conformidad y no conformidad.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="date"
                                            variant={"outline"}
                                            className={cn("w-[300px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateRange?.from ? (dateRange.to ? (<>{format(dateRange.from, "LLL dd, y", { locale: es })} - {format(dateRange.to, "LLL dd, y", { locale: es })}</>) : (format(dateRange.from, "LLL dd, y", { locale: es }))) : (<span>Selecciona un rango</span>)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                        <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={es}/>
                                    </PopoverContent>
                                </Popover>
                                 <Button asChild variant="outline">
                                    <Link href="/quality">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Volver
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tasa de Aprobación General</CardTitle>
                            <Percent className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.approvalRate.toFixed(1)}%</div>
                            <p className="text-xs text-muted-foreground">de todos los lotes controlados</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Controles</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total}</div>
                            <p className="text-xs text-muted-foreground">lotes revisados en el período</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Lotes Aprobados</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{summary.totalApproved}</div>
                            <p className="text-xs text-muted-foreground">cumplieron con los estándares</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Lotes Rechazados</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{summary.totalRejected}</div>
                            <p className="text-xs text-muted-foreground">(No conformidades)</p>
                        </CardContent>
                    </Card>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Evolución de Tasas de Calidad</CardTitle>
                        <CardDescription>Comparación mensual de lotes aprobados vs. rechazados.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                                <Tooltip
                                    formatter={(value: number) => `${value.toFixed(2)}%`}
                                    contentStyle={{ background: "hsl(var(--background))", border: "hsl(var(--border))" }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="Tasa de Aprobación" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                                <Line type="monotone" dataKey="Tasa de Rechazo" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Datos Históricos</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mes</TableHead>
                                    <TableHead className="text-right">Controles Totales</TableHead>
                                    <TableHead className="text-right">Aprobados</TableHead>
                                    <TableHead className="text-right">Rechazados</TableHead>
                                    <TableHead className="text-right">Tasa Rechazo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {chartData.map(item => (
                                    <TableRow key={item.month}>
                                        <TableCell>{item.month}</TableCell>
                                        <TableCell className="text-right">{item.total}</TableCell>
                                        <TableCell className="text-right">{item.approved}</TableCell>
                                        <TableCell className="text-right">{item.rejected}</TableCell>
                                        <TableCell className="text-right font-semibold">{item['Tasa de Rechazo'].toFixed(2)}%</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
