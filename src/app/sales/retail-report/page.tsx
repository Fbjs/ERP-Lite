
'use client';

import { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileSpreadsheet } from 'lucide-react';
import { initialCustomers } from '@/app/admin/customers/page';
import { initialOrders } from '@/app/sales/page';
import { format, parseISO, getDaysInMonth } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

const RETAIL_CUSTOMERS = ['Supermercado del Sur', 'Panaderia San Jose', 'Cafe Central'];

const formatCurrency = (value: number | null) => {
    if (value === null || value === 0) return '';
    return value.toLocaleString('es-CL');
}

export default function RetailReportPage() {
    const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
    const { toast } = useToast();

    const reportData = useMemo(() => {
        const [year, monthIndex] = month.split('-').map(Number);
        const daysInMonth = getDaysInMonth(new Date(year, monthIndex - 1));
        const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        const customerGroups = initialCustomers
            .filter(c => RETAIL_CUSTOMERS.includes(c.name))
            .map(customer => {
                const locations = customer.deliveryLocations.map(location => {
                    const dailySales = daysArray.map(day => {
                        const dateStr = format(new Date(year, monthIndex - 1, day), 'yyyy-MM-dd');
                        const salesForDay = initialOrders.filter(o => 
                            o.locationId === location.id &&
                            o.deliveryDate === dateStr
                        ).reduce((sum, order) => sum + order.amount, 0);
                        return salesForDay;
                    });
                    const totalResult = dailySales.reduce((acc, sale) => acc + sale, 0);
                    return { ...location, dailySales, totalResult };
                });
                const totalResult = locations.reduce((acc, loc) => acc + loc.totalResult, 0);
                return { ...customer, locations, totalResult };
            });

        const totalResult = customerGroups.reduce((acc, group) => acc + group.totalResult, 0);

        return {
            customerGroups,
            days: daysArray,
            totalResult,
        };

    }, [month]);
    
    const handleDownloadExcel = () => {
        const wb = XLSX.utils.book_new();
        
        const headers = ["RAZON SOCIAL", "NOMBRE_LOCAL", ...reportData.days.map(String), "Total Result"];
        
        let data: (string | number | null)[][] = [];

        reportData.customerGroups.forEach(group => {
            group.locations.forEach(loc => {
                const row = [
                    group.name,
                    loc.name,
                    ...loc.dailySales.map(sale => sale || null),
                    loc.totalResult
                ];
                data.push(row);
            });
            // Add subtotal row
            data.push([group.name + ' Result', '', ...Array(reportData.days.length).fill(null), group.totalResult]);
        });
        
        // Add grand total row
        data.push(['Total Result', '', ...Array(reportData.days.length).fill(null), reportData.totalResult]);

        const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
        XLSX.utils.book_append_sheet(wb, ws, "Reporte Retail");
        XLSX.writeFile(wb, `reporte-retail-${month}.xlsx`);

        toast({ title: 'Excel Descargado', description: 'El reporte de ventas retail ha sido exportado.' });
    };

    return (
        <AppLayout pageTitle="Reporte de Ventas Retail">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Reporte de Ventas Retail</CardTitle>
                            <CardDescription className="font-body">Ventas por local agrupadas por razón social para el mes seleccionado.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button asChild variant="outline">
                                <Link href="/sales">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver
                                </Link>
                            </Button>
                            <Button variant="outline" onClick={handleDownloadExcel}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-end gap-4 pt-6 mt-4 border-t">
                        <div className="space-y-2">
                            <Label htmlFor="month">Mes</Label>
                            <Input
                                id="month"
                                type="month"
                                value={month}
                                onChange={e => setMonth(e.target.value)}
                                className="w-[200px]"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px] sticky left-0 bg-secondary">Razón Social</TableHead>
                                <TableHead className="w-[200px] sticky left-[200px] bg-secondary">Nombre Local</TableHead>
                                {reportData.days.map(day => (
                                    <TableHead key={day} className="text-center w-[100px]">{day}</TableHead>
                                ))}
                                <TableHead className="text-right w-[150px] sticky right-0 bg-secondary font-bold">Total Result</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportData.customerGroups.map(group => (
                                <React.Fragment key={group.id}>
                                    {group.locations.map(location => (
                                        <TableRow key={location.id}>
                                            <TableCell className="sticky left-0 bg-background">{group.name}</TableCell>
                                            <TableCell className="sticky left-[200px] bg-background">{location.name}</TableCell>
                                            {location.dailySales.map((sale, i) => (
                                                <TableCell key={i} className="text-right">{formatCurrency(sale)}</TableCell>
                                            ))}
                                            <TableCell className="text-right sticky right-0 bg-background font-semibold">{formatCurrency(location.totalResult)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="bg-secondary/70 font-bold">
                                         <TableCell colSpan={2} className="text-right sticky left-0 bg-secondary/70">{group.name} Result</TableCell>
                                         <TableCell colSpan={reportData.days.length}></TableCell>
                                         <TableCell className="text-right sticky right-0 bg-secondary/70">{formatCurrency(group.totalResult)}</TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))}
                        </TableBody>
                         <TableFooter>
                            <TableRow className="bg-primary/20 font-bold text-lg">
                                <TableCell colSpan={2} className="text-right sticky left-0 bg-primary/20">Total Result</TableCell>
                                <TableCell colSpan={reportData.days.length}></TableCell>
                                <TableCell className="text-right sticky right-0 bg-primary/20">{formatCurrency(reportData.totalResult)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
