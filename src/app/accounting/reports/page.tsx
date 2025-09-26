'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { useMemo, useRef, useState, useEffect } from 'react';
import { initialSales } from '../sales-ledger/page';
import { initialPurchases } from '../purchase-ledger/page';
import { initialFees } from '../fees-ledger/page';
import { initialJournalEntries } from '../journal/page';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Download, FileSpreadsheet, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Logo from '@/components/logo';
import { format, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';


const formatCurrency = (value: number) => {
    if (value === 0) return '';
    return value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 });
};

const formatNumber = (value: number) => {
    return value.toLocaleString('es-CL', { minimumFractionDigits: 0 });
}

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

const financialIndicesData = [
  { month: 'ene-21', SOLVENCIA: 2.22, LIQUIDEZ: 1.17, ENDEUDAMIENTO: 0.82, TESORERIA: 2.39 },
  { month: 'feb-21', SOLVENCIA: 2.17, LIQUIDEZ: 1.12, ENDEUDAMIENTO: 0.86, TESORERIA: 2.10 },
  { month: 'mar-21', SOLVENCIA: 2.08, LIQUIDEZ: 1.08, ENDEUDAMIENTO: 0.93, TESORERIA: 1.90 },
  { month: 'abr-21', SOLVENCIA: 2.22, LIQUIDEZ: 1.19, ENDEUDAMIENTO: 1.19, TESORERIA: 2.40 },
  { month: 'may-21', SOLVENCIA: 1.85, LIQUIDEZ: 1.17, ENDEUDAMIENTO: 1.17, TESORERIA: 2.42 },
  { month: 'jun-21', SOLVENCIA: 1.89, LIQUIDEZ: 1.13, ENDEUDAMIENTO: 1.13, TESORERIA: 2.46 },
  { month: 'jul-21', SOLVENCIA: 1.91, LIQUIDEZ: 1.10, ENDEUDAMIENTO: 1.10, TESORERIA: 2.79 },
  { month: 'ago-21', SOLVENCIA: 1.96, LIQUIDEZ: 1.17, ENDEUDAMIENTO: 1.03, TESORERIA: 2.79 },
  { month: 'sep-21', SOLVENCIA: 2.05, LIQUIDEZ: 1.13, ENDEUDAMIENTO: 1.06, TESORERIA: 2.05 },
  { month: 'oct-21', SOLVENCIA: 2.13, LIQUIDEZ: 1.19, ENDEUDAMIENTO: 0.96, TESORERIA: 2.10 },
  { month: 'nov-21', SOLVENCIA: 2.00, LIQUIDEZ: 1.20, ENDEUDAMIENTO: 0.95, TESORERIA: 2.02 },
  { month: 'dic-21', SOLVENCIA: 1.81, LIQUIDEZ: 1.20, ENDEUDAMIENTO: 1.20, TESORERIA: 1.76 },
  { month: 'ene-22', SOLVENCIA: 1.83, LIQUIDEZ: 1.19, ENDEUDAMIENTO: 1.19, TESORERIA: 1.74 },
  { month: 'feb-22', SOLVENCIA: 1.81, LIQUIDEZ: 1.21, ENDEUDAMIENTO: 1.21, TESORERIA: 1.68 },
];

const incomeStatementData = {
    ingresos: [
        { account: '4.1.1.1001', name: 'Ventas Pan Centeno', amount: 88913860 },
        { account: '4.1.1.1002', name: 'Ventas Pan Integral', amount: 13315128 },
        { account: '4.1.1.1003', name: 'Ventas Pan Pasteleria', amount: 7506659 },
        { account: '4.1.1.6001', name: 'Ventas Pan Industrial', amount: 38889659 },
        { account: '4.1.1.7001', name: 'Ventas Pan Blanco', amount: 25563238 },
        { account: '4.1.1.8001', name: 'Ventas Subproductos', amount: 186144 },
        { account: '4.1.1.9001', name: 'Ventas Otros', amount: 38753 },
    ],
    costos: [
        { account: '3.2.1.0901', name: 'Costo Insumos Masa Madre', amount: -15227532 },
        { account: '3.2.1.1001', name: 'Costo Pan Centeno', amount: -17023548 },
        { account: '3.2.1.3001', name: 'Costo Pan Pasteleria', amount: -3662948 },
        { account: '3.2.1.5001', name: 'Costo Tostadas', amount: -1160383 },
        { account: '3.2.1.6001', name: 'Costo Pan Industrial', amount: -4141344 },
        { account: '3.2.1.7001', name: 'Costo Pan Blanco', amount: -8609033 },
        { account: '3.2.1.9001', name: 'Costo Otros', amount: 1272652 },
        { account: '3.2.1.9101', name: 'Costo ajuste inventario', amount: 19763304 },
    ],
    gastos: [
        { account: '3.2.1.0101', name: 'Remuneraciones', amount: -49613315 },
        { account: '3.2.1.0201', name: 'Otros Gastos Personal', amount: -9684141 },
        { account: '3.2.1.1101', name: 'Honorarios', amount: -2376213 },
        { account: '3.2.1.2501', name: 'Arriendos Pagados', amount: -3323137 },
        { account: '5.2.1.2401', name: 'Servicios de Limpieza e Higiene', amount: -2737523 },
    ],
    noOperacionales: {
        ingresos: [
            { account: '6.1.1.0201', name: 'Diferencias de Cambio', amount: 51455 },
            { account: '6.1.1.0301', name: 'Intereses Inversiones', amount: 1 },
            { account: '6.1.1.9001', name: 'Otros Ingresos Fuera Explot', amount: 51490 },
        ],
        egresos: [
            { account: '7.2.1.0101', name: 'Gastos Financieros', amount: -1783488 },
            { account: '7.2.1.9001', name: 'Otros Egresos Fuera Explot', amount: -1348580 },
        ]
    }
};

const calculateTotals = (data: typeof incomeStatementData) => {
    const totalIngresos = data.ingresos.reduce((acc, item) => acc + item.amount, 0);
    const totalCostos = data.costos.reduce((acc, item) => acc + item.amount, 0);
    const margenContribucion = totalIngresos + totalCostos;
    const totalGastos = data.gastos.reduce((acc, item) => acc + item.amount, 0);
    const resultadoOperacional = margenContribucion + totalGastos;

    const totalIngresosNoOp = data.noOperacionales.ingresos.reduce((acc, item) => acc + item.amount, 0);
    const totalEgresosNoOp = data.noOperacionales.egresos.reduce((acc, item) => acc + item.amount, 0);
    const resultadoNoOperacional = totalIngresosNoOp + totalEgresosNoOp;
    
    const resultadoAntesImpuesto = resultadoOperacional + resultadoNoOperacional;
    const impuestoRenta = resultadoAntesImpuesto > 0 ? -resultadoAntesImpuesto * 0.27 : 0; // Assuming 27% tax rate
    const resultadoDespuesImpuesto = resultadoAntesImpuesto + impuestoRenta;

    return {
        totalIngresos, totalCostos, margenContribucion, totalGastos, resultadoOperacional,
        totalIngresosNoOp, totalEgresosNoOp, resultadoNoOperacional,
        resultadoAntesImpuesto, impuestoRenta, resultadoDespuesImpuesto
    };
};

export default function ReportsPage() {
    const { toast } = useToast();
    const balanceReportRef = useRef<HTMLDivElement>(null);
    const incomeStatementRef = useRef<HTMLDivElement>(null);
    const [generationDate, setGenerationDate] = useState<Date | null>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

     useEffect(() => {
        setGenerationDate(new Date());
        setDateRange({
            from: new Date(2025, 0, 1),
            to: new Date(2025, 11, 31),
        });
    }, []);
    
    const incomeStatementTotals = useMemo(() => calculateTotals(incomeStatementData), []);


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

    const handleDownloadPdf = async (ref: React.RefObject<HTMLDivElement>, fileName: string, orientation: 'p' | 'l' = 'l') => {
        const input = ref.current;
        if (!input) return;

        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF(orientation, 'px', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const ratio = canvas.width / canvas.height;
        let newWidth = pdfWidth - 20;
        let newHeight = newWidth / ratio;
        if (newHeight > pdfHeight - 20) {
            newHeight = pdfHeight - 20;
            newWidth = newHeight * ratio;
        }
        const xOffset = (pdfWidth - newWidth) / 2;
        pdf.addImage(imgData, 'PNG', xOffset, 10, newWidth, newHeight);
        pdf.save(fileName);

        toast({
            title: "PDF Descargado",
            description: `Se ha descargado el reporte ${fileName}.`,
        });
    };

    const handleDownloadExcel = () => {
        const dataForSheet = eightColumnBalanceData.accounts.map(acc => ({
            'Cuenta': acc.account,
            'Debe': acc.sumDebit,
            'Haber': acc.sumCredit,
            'Saldo Deudor': acc.balanceDebit,
            'Saldo Acreedor': acc.balanceCredit,
            'Activo': acc.type === 'Activo' ? acc.balanceDebit : '',
            'Pasivo': (acc.type === 'Pasivo' || acc.type === 'Patrimonio') ? acc.balanceCredit : '',
            'Pérdida': acc.type === 'Resultado Perdida' ? acc.balanceDebit : '',
            'Ganancia': acc.type === 'Resultado Ganancia' ? acc.balanceCredit : '',
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Balance 8 Columnas");
        XLSX.writeFile(workbook, `Balance-8-Columnas-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);

        toast({ title: "Excel Descargado", description: "El Balance de 8 Columnas ha sido exportado." });
    };

    const renderPdfHeader = (title: string) => (
         <header className="flex justify-between items-start mb-4 border-b-2 border-gray-800 pb-2">
            <div className="flex items-center gap-3">
                <Logo className="w-24" />
                <div>
                    <h1 className="text-xl font-bold font-headline text-gray-800">{title}</h1>
                    <p className="text-xs text-gray-500">Panificadora Vollkorn</p>
                </div>
            </div>
            <div className="text-right text-xs">
                {generationDate && <p><span className="font-semibold">Fecha de Emisión:</span> {format(generationDate, "P p", { locale: es })}</p>}
                 {dateRange?.from && (
                        <p><span className="font-semibold">Período:</span> {format(dateRange.from, 'P', { locale: es })} a {dateRange.to ? format(dateRange.to, 'P', { locale: es }) : ''}</p>
                    )}
            </div>
        </header>
    );
    
    const renderIncomeStatementRows = (items: { account: string; name: string; amount: number }[]) => {
        return items.map(item => (
            <TableRow key={item.account}>
                <TableCell className="pl-8 text-muted-foreground text-xs">{item.account}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
            </TableRow>
        ));
    };

    return (
        <AppLayout pageTitle="Reportes Financieros">
             <div className="fixed -left-[9999px] top-0 bg-white text-black p-4 font-body" style={{ width: '1100px' }}>
                <div ref={balanceReportRef}>
                    {renderPdfHeader("Balance de 8 Columnas")}
                    <Table className="text-xs min-w-[1000px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead rowSpan={2} className="text-left align-bottom p-1">Cuenta</TableHead>
                                <TableHead colSpan={2} className="text-center p-1">Sumas</TableHead>
                                <TableHead colSpan={2} className="text-center p-1">Saldos</TableHead>
                                <TableHead colSpan={2} className="text-center p-1">Inventario</TableHead>
                                <TableHead colSpan={2} className="text-center p-1">Resultados</TableHead>
                            </TableRow>
                                <TableRow>
                                <TableHead className="text-right p-1">Debe</TableHead>
                                <TableHead className="text-right p-1">Haber</TableHead>
                                <TableHead className="text-right p-1">Deudor</TableHead>
                                <TableHead className="text-right p-1">Acreedor</TableHead>
                                <TableHead className="text-right p-1">Activo</TableHead>
                                <TableHead className="text-right p-1">Pasivo</TableHead>
                                <TableHead className="text-right p-1">Pérdida</TableHead>
                                <TableHead className="text-right p-1">Ganancia</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {eightColumnBalanceData.accounts.map(acc => (
                                <TableRow key={acc.account}>
                                    <TableCell className="p-1">{acc.account}</TableCell>
                                    <TableCell className="text-right p-1">{formatCurrency(acc.sumDebit)}</TableCell>
                                    <TableCell className="text-right p-1">{formatCurrency(acc.sumCredit)}</TableCell>
                                    <TableCell className="text-right p-1">{formatCurrency(acc.balanceDebit)}</TableCell>
                                    <TableCell className="text-right p-1">{formatCurrency(acc.balanceCredit)}</TableCell>
                                    <TableCell className="text-right p-1">{formatCurrency(acc.type === 'Activo' ? acc.balanceDebit : 0)}</TableCell>
                                    <TableCell className="text-right p-1">{formatCurrency((acc.type === 'Pasivo' || acc.type === 'Patrimonio') ? acc.balanceCredit : 0)}</TableCell>
                                    <TableCell className="text-right p-1">{formatCurrency(acc.type === 'Resultado Perdida' ? acc.balanceDebit : 0)}</TableCell>
                                    <TableCell className="text-right p-1">{formatCurrency(acc.type === 'Resultado Ganancia' ? acc.balanceCredit : 0)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
            
            <div className="fixed -left-[9999px] top-0 bg-white text-black p-4 font-body" style={{ width: '8.5in' }}>
                <div ref={incomeStatementRef}>
                    {renderPdfHeader("Estado de Resultados")}
                     <Table>
                        <TableBody>
                            <TableRow className="font-bold bg-gray-50"><TableCell>INGRESOS POR VENTAS</TableCell><TableCell></TableCell><TableCell className="text-right">{formatCurrency(incomeStatementTotals.totalIngresos)}</TableCell></TableRow>
                            {renderIncomeStatementRows(incomeStatementData.ingresos)}
                            <TableRow className="font-bold bg-gray-50"><TableCell>COSTOS DE VENTA</TableCell><TableCell></TableCell><TableCell className="text-right">{formatCurrency(incomeStatementTotals.totalCostos)}</TableCell></TableRow>
                            {renderIncomeStatementRows(incomeStatementData.costos)}
                            <TableRow className="font-bold text-base bg-secondary"><TableCell>MARGEN DE CONTRIBUCION</TableCell><TableCell></TableCell><TableCell className="text-right">{formatCurrency(incomeStatementTotals.margenContribucion)}</TableCell></TableRow>
                            <TableRow className="font-bold bg-gray-50"><TableCell>GASTOS OPERACIONALES</TableCell><TableCell></TableCell><TableCell className="text-right">{formatCurrency(incomeStatementTotals.totalGastos)}</TableCell></TableRow>
                            {renderIncomeStatementRows(incomeStatementData.gastos)}
                            <TableRow className="font-bold text-base bg-secondary"><TableCell>RESULTADO OPERACIONAL</TableCell><TableCell></TableCell><TableCell className="text-right">{formatCurrency(incomeStatementTotals.resultadoOperacional)}</TableCell></TableRow>
                            <TableRow className="font-bold bg-gray-50"><TableCell>INGRESOS NO OPERACIONALES</TableCell><TableCell></TableCell><TableCell className="text-right">{formatCurrency(incomeStatementTotals.totalIngresosNoOp)}</TableCell></TableRow>
                            {renderIncomeStatementRows(incomeStatementData.noOperacionales.ingresos)}
                             <TableRow className="font-bold bg-gray-50"><TableCell>EGRESOS NO OPERACIONALES</TableCell><TableCell></TableCell><TableCell className="text-right">{formatCurrency(incomeStatementTotals.totalEgresosNoOp)}</TableCell></TableRow>
                            {renderIncomeStatementRows(incomeStatementData.noOperacionales.egresos)}
                            <TableRow className="font-bold text-base bg-secondary"><TableCell>RESULTADO NO OPERACIONAL</TableCell><TableCell></TableCell><TableCell className="text-right">{formatCurrency(incomeStatementTotals.resultadoNoOperacional)}</TableCell></TableRow>
                            <TableRow className="font-bold text-lg bg-primary/20"><TableCell>RESULTADO ANTES DE IMPUESTO</TableCell><TableCell></TableCell><TableCell className="text-right">{formatCurrency(incomeStatementTotals.resultadoAntesImpuesto)}</TableCell></TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

             <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <CardTitle className="font-headline">Central de Reportes</CardTitle>
                                <CardDescription className="font-body">
                                    Visualiza y descarga los reportes financieros clave para la toma de decisiones.
                                </CardDescription>
                            </div>
                             <div className="flex items-center gap-2 flex-wrap">
                                 <div className="space-y-1.5">
                                    <Label>Período del Reporte</Label>
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
                                            <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={es} />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="flex items-end h-full">
                                    <Button asChild variant="outline">
                                        <Link href="/accounting">
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Volver
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
                
                <Tabs defaultValue="balance">
                    <TabsList>
                        <TabsTrigger value="balance">Balances</TabsTrigger>
                        <TabsTrigger value="income">Estado de Resultados</TabsTrigger>
                        <TabsTrigger value="indices">Indicadores Financieros</TabsTrigger>
                    </TabsList>
                    <TabsContent value="balance" className="space-y-6 mt-4">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="font-headline">Balance de 8 Columnas</CardTitle>
                                        <CardDescription className="font-body">Un desglose completo de sumas y saldos, y su clasificación.</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={handleDownloadExcel}><FileSpreadsheet className="mr-2 h-4 w-4"/>Excel</Button>
                                        <Button variant="outline" onClick={() => handleDownloadPdf(balanceReportRef, 'Balance-8-Columnas.pdf', 'l')}><Download className="mr-2 h-4 w-4"/>PDF</Button>
                                    </div>
                                </div>
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
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Balance General Clasificado</CardTitle>
                                <CardDescription className="font-body">Una fotografía de la posición financiera de la empresa.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-6">
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
                                    <Table>
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
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="income" className="mt-4">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="font-headline">Estado de Resultados</CardTitle>
                                        <CardDescription className="font-body">
                                            Un resumen de los ingresos y gastos durante un período específico.
                                        </CardDescription>
                                    </div>
                                    <Button variant="outline" onClick={() => handleDownloadPdf(incomeStatementRef, 'Estado-de-Resultados.pdf', 'p')}><Download className="mr-2 h-4 w-4"/>PDF</Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-1/6">Cuenta</TableHead>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead className="text-right">Monto</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow className="font-bold bg-gray-100 dark:bg-gray-800"><TableCell colSpan={2}>INGRESOS POR VENTAS</TableCell><TableCell className="text-right">{formatCurrency(incomeStatementTotals.totalIngresos)}</TableCell></TableRow>
                                        {renderIncomeStatementRows(incomeStatementData.ingresos)}

                                        <TableRow className="font-bold bg-gray-100 dark:bg-gray-800"><TableCell colSpan={2}>COSTOS DE VENTA</TableCell><TableCell className="text-right">{formatCurrency(incomeStatementTotals.totalCostos)}</TableCell></TableRow>
                                        {renderIncomeStatementRows(incomeStatementData.costos)}
                                        
                                        <TableRow className="font-bold text-base bg-secondary"><TableCell colSpan={2}>MARGEN DE CONTRIBUCION</TableCell><TableCell className="text-right">{formatCurrency(incomeStatementTotals.margenContribucion)}</TableCell></TableRow>
                                        
                                        <TableRow className="font-bold bg-gray-100 dark:bg-gray-800"><TableCell colSpan={2}>GASTOS OPERACIONALES</TableCell><TableCell className="text-right">{formatCurrency(incomeStatementTotals.totalGastos)}</TableCell></TableRow>
                                        {renderIncomeStatementRows(incomeStatementData.gastos)}
                                        
                                        <TableRow className="font-bold text-base bg-secondary"><TableCell colSpan={2}>RESULTADO OPERACIONAL</TableCell><TableCell className="text-right">{formatCurrency(incomeStatementTotals.resultadoOperacional)}</TableCell></TableRow>

                                        <TableRow className="font-bold bg-gray-100 dark:bg-gray-800"><TableCell colSpan={2}>INGRESOS NO OPERACIONALES</TableCell><TableCell className="text-right">{formatCurrency(incomeStatementTotals.totalIngresosNoOp)}</TableCell></TableRow>
                                        {renderIncomeStatementRows(incomeStatementData.noOperacionales.ingresos)}

                                        <TableRow className="font-bold bg-gray-100 dark:bg-gray-800"><TableCell colSpan={2}>EGRESOS NO OPERACIONALES</TableCell><TableCell className="text-right">{formatCurrency(incomeStatementTotals.totalEgresosNoOp)}</TableCell></TableRow>
                                        {renderIncomeStatementRows(incomeStatementData.noOperacionales.egresos)}

                                        <TableRow className="font-bold text-base bg-secondary"><TableCell colSpan={2}>RESULTADO NO OPERACIONAL</TableCell><TableCell className="text-right">{formatCurrency(incomeStatementTotals.resultadoNoOperacional)}</TableCell></TableRow>

                                        <TableRow className="font-bold text-lg bg-primary/20"><TableCell colSpan={2}>RESULTADO ANTES DE IMPUESTO</TableCell><TableCell className="text-right">{formatCurrency(incomeStatementTotals.resultadoAntesImpuesto)}</TableCell></TableRow>
                                        <TableRow><TableCell colSpan={2} className="pl-8">Impuesto a la Renta (27%)</TableCell><TableCell className="text-right">{formatCurrency(incomeStatementTotals.impuestoRenta)}</TableCell></TableRow>
                                        <TableRow className="font-bold text-xl bg-primary/30"><TableCell colSpan={2}>RESULTADO DESPUÉS DE IMPUESTO</TableCell><TableCell className="text-right">{formatCurrency(incomeStatementTotals.resultadoDespuesImpuesto)}</TableCell></TableRow>
                                    </TableBody>
                                </Table>
                                <p className="text-xs text-muted-foreground mt-4">* Los datos son para fines demostrativos.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                     <TabsContent value="indices" className="space-y-6 mt-4">
                         <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Evolución de Indicadores Financieros</CardTitle>
                                <CardDescription>Gráfico con la evolución de los principales ratios financieros desde Enero 2021.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={financialIndicesData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                                        <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 4]}/>
                                        <Tooltip
                                            contentStyle={{
                                                background: "hsl(var(--background))",
                                                border: "hsl(var(--border))",
                                                borderRadius: "var(--radius)"
                                            }}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="SOLVENCIA" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                                        <Line type="monotone" dataKey="LIQUIDEZ" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                                        <Line type="monotone" dataKey="ENDEUDAMIENTO" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                                        <Line type="monotone" dataKey="TESORERIA" stroke="hsl(var(--chart-4))" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Datos Históricos de Indicadores</CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Mes</TableHead>
                                            <TableHead className="text-center">Solvencia</TableHead>
                                            <TableHead className="text-center">Liquidez</TableHead>
                                            <TableHead className="text-center">Endeudamiento</TableHead>
                                            <TableHead className="text-center">Tesorería</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {financialIndicesData.map(d => (
                                            <TableRow key={d.month}>
                                                <TableCell className="font-medium">{d.month}</TableCell>
                                                <TableCell className="text-center">{d.SOLVENCIA.toFixed(2)}</TableCell>
                                                <TableCell className="text-center">{d.LIQUIDEZ.toFixed(2)}</TableCell>
                                                <TableCell className="text-center">{d.ENDEUDAMIENTO.toFixed(2)}</TableCell>
                                                <TableCell className="text-center">{d.TESORERIA.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
             </div>
        </AppLayout>
    );
}
