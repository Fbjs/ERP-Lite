
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Download, Calendar as CalendarIcon } from 'lucide-react';
import { useState, useMemo, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Logo from '@/components/logo';

type SaleDocument = {
    id: number;
    date: string;
    docType: string;
    folio: string;
    client: string;
    rut: string;
    net: number;
    tax: number;
    total: number;
};

const initialSales: SaleDocument[] = [
    { id: 1, date: '2025-07-15', docType: 'Factura Electrónica', folio: '101', client: 'Panaderia San Jose', rut: '76.111.222-3', net: 378151, tax: 71849, total: 450000 },
    { id: 2, date: '2025-07-20', docType: 'Factura Electrónica', folio: '102', client: 'Cafe Central', rut: '77.222.333-4', net: 1008824, tax: 191676, total: 1200500 },
    { id: 3, date: '2025-07-10', docType: 'Factura Electrónica', folio: '103', client: 'Supermercado del Sur', rut: '78.333.444-5', net: 735294, tax: 139706, total: 875000 },
    { id: 4, date: '2025-07-25', docType: 'Nota de Crédito', folio: '21', client: 'Cafe Central', rut: '77.222.333-4', net: -84034, tax: -15966, total: -100000 },
];

const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CL');
}


export default function SalesLedgerPage() {
    const { toast } = useToast();
    const reportContentRef = useRef<HTMLDivElement>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subMonths(new Date(2025, 6, 29), 1),
        to: new Date(2025, 6, 29)
    });

    const filteredSales = useMemo(() => {
        if (!dateRange?.from) return initialSales;
        const fromDate = dateRange.from;
        const toDate = dateRange.to || fromDate;

        return initialSales.filter(doc => {
            const docDate = new Date(doc.date);
            return docDate >= fromDate && docDate <= toDate;
        });
    }, [dateRange]);

    const totals = useMemo(() => {
        return filteredSales.reduce((acc, doc) => {
            acc.net += doc.net;
            acc.tax += doc.tax;
            acc.total += doc.total;
            return acc;
        }, { net: 0, tax: 0, total: 0 });
    }, [filteredSales]);

    const handleDownloadPdf = async () => {
        const input = reportContentRef.current;
        if (input) {
            const { default: jsPDF } = await import('jspdf');
            const { default: html2canvas } = await import('html2canvas');
            
            const canvas = await html2canvas(input, { scale: 2, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('l', 'px', 'a4'); // 'l' for landscape
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;

            let pdfImageWidth = pdfWidth - 20;
            let pdfImageHeight = pdfImageWidth / ratio;
            
            if (pdfImageHeight > pdfHeight - 20) {
              pdfImageHeight = pdfHeight - 20;
              pdfImageWidth = pdfImageHeight * ratio;
            }

            const xOffset = (pdfWidth - pdfImageWidth) / 2;

            pdf.addImage(imgData, 'PNG', xOffset, 10, pdfImageWidth, pdfImageHeight);
            pdf.save(`libro-ventas-${new Date().toISOString().split('T')[0]}.pdf`);
            
            toast({
                title: "PDF Descargado",
                description: "El libro de ventas ha sido descargado.",
            });
        }
    };


    return (
        <AppLayout pageTitle="Libro de Ventas">
            <div ref={reportContentRef} className="fixed -left-[9999px] top-0 bg-white text-black p-4 font-body" style={{ width: '11in', minHeight: '8.5in' }}>
                 <header className="flex justify-between items-center mb-4 border-b-2 border-gray-800 pb-2">
                    <div className="flex items-center gap-3">
                        <Logo className="w-24" />
                        <div>
                            <h1 className="text-xl font-bold font-headline text-gray-800">Libro de Ventas</h1>
                            <p className="text-xs text-gray-500">Panificadora Vollkorn - 76.123.456-7</p>
                        </div>
                    </div>
                    <div className="text-right text-xs">
                        <p><span className="font-semibold">Período:</span> {dateRange?.from ? format(dateRange.from, "P", { locale: es }) : ''} a {dateRange?.to ? format(dateRange.to, "P", { locale: es }) : 'Ahora'}</p>
                        <p><span className="font-semibold">Fecha de Emisión:</span> {format(new Date(), "P p", { locale: es })}</p>
                    </div>
                </header>
                <Table className="w-full text-xs">
                    <TableHeader className="bg-gray-100">
                        <TableRow>
                            <TableHead className="p-1 text-left font-bold text-gray-700">Fecha</TableHead>
                            <TableHead className="p-1 text-left font-bold text-gray-700">Tipo Doc.</TableHead>
                            <TableHead className="p-1 text-left font-bold text-gray-700">Folio</TableHead>
                            <TableHead className="p-1 text-left font-bold text-gray-700">Cliente</TableHead>
                            <TableHead className="p-1 text-left font-bold text-gray-700">RUT</TableHead>
                            <TableHead className="p-1 text-right font-bold text-gray-700">Neto</TableHead>
                            <TableHead className="p-1 text-right font-bold text-gray-700">IVA</TableHead>
                            <TableHead className="p-1 text-right font-bold text-gray-700">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSales.map((doc) => (
                            <TableRow key={doc.id} className="border-b border-gray-200">
                                <TableCell className="p-1">{format(new Date(doc.date), "P", { locale: es })}</TableCell>
                                <TableCell className="p-1">{doc.docType}</TableCell>
                                <TableCell className="p-1">{doc.folio}</TableCell>
                                <TableCell className="p-1">{doc.client}</TableCell>
                                <TableCell className="p-1">{doc.rut}</TableCell>
                                <TableCell className="p-1 text-right">{formatCurrency(doc.net)}</TableCell>
                                <TableCell className="p-1 text-right">{formatCurrency(doc.tax)}</TableCell>
                                <TableCell className="p-1 text-right">{formatCurrency(doc.total)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                     <TableFooter>
                        <TableRow className="bg-gray-100 font-bold">
                            <TableCell colSpan={5} className="text-right p-1">Totales</TableCell>
                            <TableCell className="text-right p-1">{formatCurrency(totals.net)}</TableCell>
                            <TableCell className="text-right p-1">{formatCurrency(totals.tax)}</TableCell>
                            <TableCell className="text-right p-1">{formatCurrency(totals.total)}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
                 <footer className="text-center text-xs text-gray-400 border-t pt-2 mt-4">
                    <p>Reporte generado por Vollkorn ERP.</p>
                </footer>
            </div>
            
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Libro de Ventas</CardTitle>
                            <CardDescription className="font-body">Consulta los documentos de venta emitidos en un período.</CardDescription>
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
                                            {format(dateRange.from, "LLL dd, y")} -{" "}
                                            {format(dateRange.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(dateRange.from, "LLL dd, y")
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
                            <Button onClick={handleDownloadPdf}>
                                <Download className="mr-2 h-4 w-4" />
                                Descargar PDF
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Tipo Doc.</TableHead>
                                <TableHead>Folio</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>RUT</TableHead>
                                <TableHead className="text-right">Neto</TableHead>
                                <TableHead className="text-right">IVA</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSales.map(doc => (
                                <TableRow key={doc.id}>
                                    <TableCell>{format(new Date(doc.date), "P", { locale: es })}</TableCell>
                                    <TableCell>{doc.docType}</TableCell>
                                    <TableCell>{doc.folio}</TableCell>
                                    <TableCell>{doc.client}</TableCell>
                                    <TableCell>{doc.rut}</TableCell>
                                    <TableCell className="text-right">${formatCurrency(doc.net)}</TableCell>
                                    <TableCell className="text-right">${formatCurrency(doc.tax)}</TableCell>
                                    <TableCell className="text-right">${formatCurrency(doc.total)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={5} className="text-right font-bold">TOTALES</TableCell>
                                <TableCell className="text-right font-bold">${formatCurrency(totals.net)}</TableCell>
                                <TableCell className="text-right font-bold">${formatCurrency(totals.tax)}</TableCell>
                                <TableCell className="text-right font-bold">${formatCurrency(totals.total)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    )
}

    