
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { ArrowLeft, CheckCircle, FileSpreadsheet, Download, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo, useRef, useEffect } from 'react';
import { initialEmployees } from '../data';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import Logo from '@/components/logo';

type ComplianceStatus = 'Pagado' | 'Pendiente' | 'Atrasado';

type ComplianceRecord = {
    employeeId: string;
    employeeName: string;
    period: string;
    afpStatus: ComplianceStatus;
    healthStatus: ComplianceStatus;
    taxStatus: ComplianceStatus;
    totalPaid: number;
};

const generateComplianceData = (period: string): ComplianceRecord[] => {
    return initialEmployees.map(emp => {
        // Simulamos algunos estados para el ejemplo
        const rand = Math.random();
        let afpStatus: ComplianceStatus, healthStatus: ComplianceStatus;
        if (rand < 0.8) {
            afpStatus = 'Pagado';
            healthStatus = 'Pagado';
        } else if (rand < 0.9) {
            afpStatus = 'Pendiente';
            healthStatus = 'Pagado';
        } else {
            afpStatus = 'Atrasado';
            healthStatus = 'Atrasado';
        }

        const afpAmount = emp.salary * 0.11;
        const healthAmount = emp.salary * 0.07;

        return {
            employeeId: emp.id,
            employeeName: emp.name,
            period: period,
            afpStatus,
            healthStatus,
            taxStatus: emp.salary > 900000 ? 'Pagado' : 'Pagado',
            totalPaid: afpAmount + healthAmount + (emp.salary > 900000 ? (emp.salary - 900000) * 0.04 : 0),
        };
    });
};

const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
};

export default function CompliancePage() {
    const [period, setPeriod] = useState(format(new Date(), 'yyyy-MM'));
    const [records, setRecords] = useState<ComplianceRecord[]>([]);
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        setRecords(generateComplianceData(period));
    }, [period]);
    
    const summary = useMemo(() => {
        const totalRecords = records.length;
        const paidCount = records.filter(r => r.afpStatus === 'Pagado' && r.healthStatus === 'Pagado').length;
        const pendingCount = records.filter(r => r.afpStatus === 'Pendiente' || r.healthStatus === 'Pendiente').length;
        const overdueCount = records.filter(r => r.afpStatus === 'Atrasado' || r.healthStatus === 'Atrasado').length;
        
        return {
            totalRecords,
            paidPercentage: totalRecords > 0 ? (paidCount / totalRecords) * 100 : 0,
            pendingCount,
            overdueCount,
        };
    }, [records]);

    const handleDownloadExcel = () => {
        const dataForSheet = records.map(r => ({
            'Trabajador': r.employeeName,
            'Periodo': r.period,
            'Estado AFP': r.afpStatus,
            'Estado Salud': r.healthStatus,
            'Estado Impuestos': r.taxStatus,
            'Total Pagado': r.totalPaid,
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Cumplimiento");
        XLSX.writeFile(workbook, `reporte-cumplimiento-${period}.xlsx`);
        toast({ title: 'Excel Descargado', description: 'El reporte de cumplimiento ha sido exportado.' });
    };

    const handleDownloadPdf = async () => {
        const input = reportRef.current;
        if (!input) return;
        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'px', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, 0);
        pdf.save(`reporte-cumplimiento-${period}.pdf`);
        toast({ title: 'PDF Descargado', description: 'El reporte de cumplimiento ha sido descargado.' });
    };


    return (
        <AppLayout pageTitle="Cumplimiento Legal y Normativo">
             <div ref={reportRef} className="fixed -left-[9999px] top-0 bg-white text-black p-4 font-body" style={{ width: '11in' }}>
                <header className="flex justify-between items-start mb-4 border-b-2 border-gray-800 pb-2">
                    <div className="flex items-center gap-3">
                        <Logo className="w-24" />
                        <div>
                            <h1 className="text-xl font-bold font-headline text-gray-800">Reporte de Cumplimiento Normativo</h1>
                            <p className="text-xs text-gray-500">Panificadora Vollkorn</p>
                        </div>
                    </div>
                    <div className="text-right text-xs">
                        <p><span className="font-semibold">Período:</span> {format(new Date(period + '-02'), 'MMMM yyyy', { locale: es })}</p>
                    </div>
                </header>
                <Table className="w-full text-xs">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="p-1 font-bold">Trabajador</TableHead>
                            <TableHead className="p-1 font-bold text-center">Estado AFP</TableHead>
                            <TableHead className="p-1 font-bold text-center">Estado Salud</TableHead>
                            <TableHead className="p-1 font-bold text-center">Estado Impuestos</TableHead>
                            <TableHead className="p-1 font-bold text-right">Total Pagado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {records.map(rec => (
                            <TableRow key={rec.employeeId}>
                                <TableCell className="p-1">{rec.employeeName}</TableCell>
                                <TableCell className="p-1 text-center">{rec.afpStatus}</TableCell>
                                <TableCell className="p-1 text-center">{rec.healthStatus}</TableCell>
                                <TableCell className="p-1 text-center">{rec.taxStatus}</TableCell>
                                <TableCell className="p-1 text-right">{formatCurrency(rec.totalPaid)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cumplimiento General</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.paidPercentage.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">de trabajadores con cotizaciones al día</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{summary.pendingCount}</div>
                        <p className="text-xs text-muted-foreground">trabajadores con pagos por realizar</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pagos Atrasados</CardTitle>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{summary.overdueCount}</div>
                        <p className="text-xs text-muted-foreground">trabajadores con pagos fuera de plazo</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Control de Pagos Previsionales</CardTitle>
                            <CardDescription className="font-body">Revisa el estado de pago de las cotizaciones para un período específico.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button asChild variant="outline">
                                <Link href="/hr">
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
                            <Label htmlFor="period">Período de Consulta</Label>
                            <Input 
                                id="period"
                                type="month" 
                                value={period} 
                                onChange={(e) => setPeriod(e.target.value)} 
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <Button variant="outline" onClick={handleDownloadExcel}><FileSpreadsheet className="mr-2 h-4 w-4" /> Excel</Button>
                            <Button variant="outline" onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" /> PDF</Button>
                        </div>
                    </div>
                    
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Trabajador</TableHead>
                                <TableHead className="text-center">Estado AFP</TableHead>
                                <TableHead className="text-center">Estado Salud</TableHead>
                                <TableHead className="text-center">Estado Impuestos</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {records.map(rec => (
                                <TableRow key={rec.employeeId}>
                                    <TableCell className="font-medium">{rec.employeeName}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={rec.afpStatus === 'Pagado' ? 'default' : rec.afpStatus === 'Pendiente' ? 'secondary' : 'destructive'}>{rec.afpStatus}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                         <Badge variant={rec.healthStatus === 'Pagado' ? 'default' : rec.healthStatus === 'Pendiente' ? 'secondary' : 'destructive'}>{rec.healthStatus}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={rec.taxStatus === 'Pagado' ? 'default' : rec.taxStatus === 'Pendiente' ? 'secondary' : 'destructive'}>{rec.taxStatus}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                         <TableFooter>
                            <TableRow>
                                <TableCell colSpan={4} className="text-right font-semibold">Total Pagado en el Período:</TableCell>
                                <TableCell className="text-right font-bold">{formatCurrency(records.reduce((sum, r) => sum + r.totalPaid, 0))}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
