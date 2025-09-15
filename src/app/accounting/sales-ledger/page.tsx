
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Download, Calendar as CalendarIcon, RefreshCcw, ArrowLeft } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, subMonths, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Logo from '@/components/logo';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { initialOrders } from '@/app/sales/page';

type SaleDocument = {
    id: number;
    date: string;
    docType: 'Factura Electrónica' | 'Nota de Crédito';
    folio: string;
    client: string;
    rut: string;
    net: number;
    tax: number;
    total: number;
};

// Data Transformation
export const initialSales: SaleDocument[] = initialOrders.map((order, index) => {
    const isCreditNote = Math.random() < 0.1; // Simulate some credit notes
    const total = isCreditNote ? -Math.abs(order.amount) : order.amount;
    const net = total / 1.19;
    const tax = total - net;

    return {
        id: index + 1,
        date: order.date,
        docType: isCreditNote ? 'Nota de Crédito' : 'Factura Electrónica',
        folio: order.id.replace('SALE', ''),
        client: order.customer,
        rut: '76.111.222-3', // Placeholder RUT, as it's not in the sales order data
        net: Math.round(net),
        tax: Math.round(tax),
        total: Math.round(total),
    };
});

const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CL');
}


export default function SalesLedgerPage() {
    const { toast } = useToast();
    const reportContentRef = useRef<HTMLDivElement>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [selectedDocType, setSelectedDocType] = useState('all');
    const [selectedClient, setSelectedClient] = useState('all');
    const [generationDate, setGenerationDate] = useState<Date | null>(null);

     useEffect(() => {
        // Set initial date ranges only on the client to avoid hydration mismatch
        setDateRange({
            from: subMonths(new Date(), 1),
            to: new Date()
        });
        setGenerationDate(new Date());
    }, []);

    const uniqueDocTypes = useMemo(() => ['all', ...Array.from(new Set(initialSales.map(doc => doc.docType)))], []);
    const uniqueClients = useMemo(() => ['all', ...Array.from(new Set(initialSales.map(doc => doc.client)))], []);

    const filteredSales = useMemo(() => {
        let sales = initialSales;

        if (dateRange?.from) {
            const fromDate = dateRange.from;
            const toDate = dateRange.to || fromDate;
            sales = sales.filter(doc => {
                const docDate = parseISO(doc.date);
                return docDate >= fromDate && docDate <= toDate;
            });
        }
        
        if (selectedDocType !== 'all') {
            sales = sales.filter(doc => doc.docType === selectedDocType);
        }

        if (selectedClient !== 'all') {
            sales = sales.filter(doc => doc.client === selectedClient);
        }

        return sales;
    }, [dateRange, selectedDocType, selectedClient]);

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
    
    const resetFilters = () => {
        setDateRange({
            from: subMonths(new Date(), 1),
            to: new Date()
        });
        setSelectedDocType('all');
        setSelectedClient('all');
    };


    return (
        <AppLayout pageTitle="Libro de Ventas">
            <div ref={reportContentRef} className="fixed -left-[9999px] top-0 bg-white text-black p-4 font-body" style={{ width: '11in', minHeight: '8.5in' }}>
                 <header className="flex justify-between items-start mb-4 border-b-2 border-gray-800 pb-2">
                    <div className="flex items-center gap-3">
                        <Logo className="w-24" />
                        <div>
                            <h1 className="text-xl font-bold font-headline text-gray-800">Libro de Ventas</h1>
                            <p className="text-xs text-gray-500">Panificadora Vollkorn - 76.123.456-7</p>
                        </div>
                    </div>
                    <div className="text-right text-xs">
                        <p><span className="font-semibold">Período:</span> {dateRange?.from ? format(dateRange.from, "P", { locale: es }) : ''} a {dateRange?.to ? format(dateRange.to, "P", { locale: es }) : 'Ahora'}</p>
                        {generationDate && <p><span className="font-semibold">Fecha de Emisión:</span> {format(generationDate, "P p", { locale: es })}</p>}
                        <div className="mt-2 text-left bg-gray-50 p-2 rounded-md border border-gray-200">
                             <p><span className="font-semibold">Cant. Documentos:</span> {filteredSales.length}</p>
                             <p><span className="font-semibold">Total Neto:</span> ${formatCurrency(totals.net)}</p>
                             <p><span className="font-semibold">Total IVA:</span> ${formatCurrency(totals.tax)}</p>
                             <p><span className="font-semibold">Total Documentos:</span> ${formatCurrency(totals.total)}</p>
                        </div>
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
                                <TableCell className="p-1">{format(parseISO(doc.date), "P", { locale: es, timeZone: 'UTC' })}</TableCell>
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
                            <TableCell className="text-right p-1">${formatCurrency(totals.net)}</TableCell>
                            <TableCell className="text-right p-1">${formatCurrency(totals.tax)}</TableCell>
                            <TableCell className="text-right p-1">${formatCurrency(totals.total)}</TableCell>
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
                        <div className='flex items-center gap-2'>
                             <Button asChild variant="outline">
                                <Link href="/accounting">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver
                                </Link>
                            </Button>
                            <Button onClick={handleDownloadPdf}>
                                <Download className="mr-2 h-4 w-4" />
                                Descargar PDF
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b">
                         <div className="flex-1 min-w-[240px]">
                            <Label>Período</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn(
                                        "w-full justify-start text-left font-normal",
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
                                <PopoverContent className="w-auto p-0" align="start">
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
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <Label>Tipo Documento</Label>
                            <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filtrar por tipo..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los Tipos</SelectItem>
                                    {uniqueDocTypes.filter(d => d !== 'all').map(docType => (
                                        <SelectItem key={docType} value={docType}>{docType}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1 min-w-[240px]">
                             <Label>Cliente</Label>
                            <Select value={selectedClient} onValueChange={setSelectedClient}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filtrar por cliente..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los Clientes</SelectItem>
                                    {uniqueClients.filter(c => c !== 'all').map(client => (
                                        <SelectItem key={client} value={client}>{client}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button variant="ghost" onClick={resetFilters}>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Limpiar
                            </Button>
                        </div>
                    </div>
                    <ScrollArea className="h-[400px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Tipo Doc.</TableHead>
                                    <TableHead>Folio</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>RUT</TableHead>
                                    <TableHead className="text-right">Neto</TableHead>
                                    <TableHead className="text-right">IVA (19%)</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSales.length > 0 ? filteredSales.map(doc => (
                                    <TableRow key={doc.id}>
                                        <TableCell>{format(parseISO(doc.date), "P", { locale: es, timeZone: 'UTC' })}</TableCell>
                                        <TableCell>{doc.docType}</TableCell>
                                        <TableCell>{doc.folio}</TableCell>
                                        <TableCell>{doc.client}</TableCell>
                                        <TableCell>{doc.rut}</TableCell>
                                        <TableCell className="text-right">${formatCurrency(doc.net)}</TableCell>
                                        <TableCell className="text-right">${formatCurrency(doc.tax)}</TableCell>
                                        <TableCell className="text-right">${formatCurrency(doc.total)}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center h-24">No se encontraron documentos con los filtros seleccionados.</TableCell>
                                    </TableRow>
                                )}
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
                    </ScrollArea>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

    