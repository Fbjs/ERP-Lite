
"use client";
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { initialEmployees, Employee, initialLeaveRequests } from '../data';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ArrowDown, ArrowUp, BarChart3, Clock, DollarSign, FileText, UserMinus, UserPlus, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// --- Simulated Data and Calculations ---
const totalEmployees = initialEmployees.length;
const newHiresLast3Months = 1; // Simulated
const departuresLast3Months = 0; // Simulated
const avgEmployees = totalEmployees - (newHiresLast3Months / 2) + (departuresLast3Months / 2);
const turnoverRate = avgEmployees > 0 ? (departuresLast3Months / avgEmployees) * 100 : 0;

const totalLeaveDays = initialLeaveRequests.reduce((acc, req) => acc + req.days, 0);
const absenteeismRate = totalLeaveDays / (totalEmployees * 22 * 3) * 100; // 22 work days, 3 months

const payrollCostByDept: { [key in Employee['department']]: number } = {
    'Producción': 0,
    'Ventas': 0,
    'Logística': 0,
    'Administración': 0,
    'Gerencia': 0,
};
initialEmployees.forEach(emp => {
    payrollCostByDept[emp.department] += emp.salary;
});

const chartData = Object.entries(payrollCostByDept).map(([name, cost]) => ({ name, 'Costo Total': cost }));
const totalPayrollCost = initialEmployees.reduce((acc, emp) => acc + emp.salary, 0);
const totalOvertimeHours = 45; // Simulated

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(value);
};

export default function HRReportsPage() {
    return (
        <AppLayout pageTitle="Indicadores y Reportes de RRHH">
            <div className="space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Dashboard de Recursos Humanos</CardTitle>
                        <CardDescription className="font-body">Métricas clave para la gestión del personal.</CardDescription>
                    </CardHeader>
                </Card>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rotación de Personal (Trimestral)</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{turnoverRate.toFixed(1)}%</div>
                            <p className="text-xs text-muted-foreground flex gap-4">
                                <span className="flex items-center text-green-600"><UserPlus className="h-3 w-3 mr-1"/> {newHiresLast3Months} Contratados</span>
                                <span className="flex items-center text-red-600"><UserMinus className="h-3 w-3 mr-1"/> {departuresLast3Months} Desvinculados</span>
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tasa de Ausentismo (Trimestral)</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{absenteeismRate.toFixed(1)}%</div>
                            <p className="text-xs text-muted-foreground">{totalLeaveDays} días de ausencia registrados en el período</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Costo Total Nómina Mensual</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(totalPayrollCost)}</div>
                            <p className="text-xs text-muted-foreground">Sueldos base, sin incluir bonos ni extras.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Horas Extras Acumuladas (Mes)</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalOvertimeHours} hrs</div>
                            <p className="text-xs text-muted-foreground">Total de horas extras registradas</p>
                        </CardContent>
                    </Card>
                </div>
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-1 lg:col-span-4">
                        <CardHeader>
                            <CardTitle className="font-headline">Costo de Nómina por Departamento</CardTitle>
                            <CardDescription>Distribución del costo de sueldos base por área.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${Number(value) / 1000000}M`} />
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        cursor={{ fill: 'hsl(var(--muted))' }}
                                        contentStyle={{
                                            background: "hsl(var(--background))",
                                            border: "hsl(var(--border))",
                                            borderRadius: "var(--radius)"
                                        }}
                                    />
                                    <Bar dataKey="Costo Total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="col-span-1 lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="font-headline">Reportes Detallados</CardTitle>
                             <CardDescription>Accede a los reportes detallados del área.</CardDescription>
                        </CardHeader>
                         <CardContent className="flex flex-col gap-4">
                            <Button asChild variant="outline" className="justify-start">
                                <Link href="/hr/staff">
                                    <Users className="mr-2 h-4 w-4"/>
                                    Nómina de Personal
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-start">
                                <Link href="/hr/contracts">
                                    <FileText className="mr-2 h-4 w-4"/>
                                    Reporte de Contratos
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-start">
                                <Link href="/hr/attendance">
                                    <Clock className="mr-2 h-4 w-4"/>
                                    Reporte de Asistencia
                                </Link>
                            </Button>
                             <Button asChild variant="outline" className="justify-start">
                                <Link href="/hr/leave">
                                    <BarChart3 className="mr-2 h-4 w-4"/>
                                    Reporte de Ausentismo
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
