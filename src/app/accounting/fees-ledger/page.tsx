
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Download, Calendar as CalendarIcon, RefreshCcw } from 'lucide-react';
import { useState, useMemo, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Logo from '@/components/logo';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type FeeDocument = {
    id: number;
    date: string;
    docType: 'Boleta de Honorarios';
    folio: string;
    issuer: string;
    rut: string;
    gross: number;
    retention: number;
    net: number;
};

const initialFees: FeeDocument[] = [
    { id: 1, date: '2025-07-31', docType: 'Boleta de Honorarios', folio: '501', issuer: 'Servicios de Diseño SPA', rut: '76.444.555-6', gross: 500000, retention: 66875, net: 433125 },
    { id: 2, date: '2025-07-31', docType: 'Boleta de Honorarios', folio: '88', issuer: 'Consultoría Legal Ltda.', rut: '77.123.123-1', gross: 1200000, retention: 160500, net: 1039500 },
];

const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CL');
}


export default function FeesLedgerPage() {
    const { toast } = useToast();
    const reportContentRef = useRef<HTMLDivElement>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subMonths(new Date(2025, 6, 1), 1),
        to: new Date(2025, 7, 0)
    });
    const [selectedIssuer, setSelectedIssuer] = useState('all');

    const uniqueIssuers = useMemo(() => ['all', ...Array.from(new Set(initialFees.map(doc => doc.issuer)))], []);

    const filteredFees = useMemo(() => {
        let fees = initialFees;

        if (dateRange?.from) {
            const fromDate = dateRange.from;
            const toDate = dateRange.to || fromDate;
            fees = fees.filter(doc => {
                const docDate = new Date(doc.date);
                return docDate >= fromDate && docDate <= toDate;
            });
        }
        
        if (selectedIssuer !== 'all') {
            fees = fees.filter(doc => doc.issuer === selectedIssuer);
        }

        return fees;
    }, [dateRange, selectedIssuer]);

    const totals = useMemo(() => {
        return filteredFees.reduce((acc, doc) => {
            acc.gross += doc.gross;
            acc.retention += doc.retention;
            acc.net += doc.net;
            return acc;
        }, { gross: 0, retention: 0, net: 0 });
    }, [filteredFees]);

    const handleDownloadPdf = async () => {
        const input = reportContentRef.current;
        if (input) {
            const { default: jsPDF } = await import('jspdf');
            const { default: html2canvas } = await import('html2canvas');
            
            const canvas = await html2canvas(input, { scale: 2, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('l', 'px', 'a4');
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
            pdf.save(`libro-honorarios-${new Date().toISOString().split('T')[0]}.pdf`);
            
            toast({
                title: "PDF Descargado",
                description: "El libro de honorarios ha sido descargado.",
            });
        }
    };
    
    const resetFilters = () => {
        setDateRange({
            from: subMonths(new Date(2025, 6, 1), 1),
            to: new Date(2025, 7, 0)
        });
        setSelectedIssuer('all');
    };


    return (
        <AppLayout pageTitle="Libro de Honorarios">
            <div ref={reportContentRef} className="fixed -left-[9999px] top-0 bg-white text-black p-4 font-body" style={{ width: '11in', minHeight: '8.5in' }}>
                 <header className="flex justify-between items-start mb-4 border-b-2 border-gray-800 pb-2">
                    <div className="flex items-center gap-3">
                        <Logo className="w-24" />
                        <div>
                            <h1 className="text-xl font-bold font-headline text-gray-800">Libro de Honorarios</h1>
                            <p className="text-xs text-gray-500">Panificadora Vollkorn - 76.123.456-7</p>
                        </div>
                    </div>
                    <div className="text-right text-xs">
                        <p><span className="font-semibold">Período:</span> {dateRange?.from ? format(dateRange.from, "P", { locale: es }) : ''} a {dateRange?.to ? format(dateRange.to, "P", { locale: es }) : 'Ahora'}</p>
                        <p><span className="font-semibold">Fecha de Emisión:</span> {format(new Date(), "P p", { locale: es })}</p>
                        <div className="mt-2 text-left bg-gray-50 p-2 rounded-md border border-gray-200">
                             <p><span className="font-semibold">Cant. Documentos:</span> {filteredFees.length}</p>
                             <p><span className="font-semibold">Total Bruto:</span> {formatCurrency(totals.gross)}</p>
                             <p><span className="font-semibold">Total Retención:</span> {formatCurrency(totals.retention)}</p>
                             <p><span className="font-semibold">Total Líquido:</span> {formatCurrency(totals.net)}</p>
                        </div>
                    </div>
                </header>
                <Table className="w-full text-xs">
                    <TableHeader className="bg-gray-100">
                        <TableRow>
                            <TableHead className="p-1 text-left font-bold text-gray-700">Fecha</TableHead>
                            <TableHead className="p-1 text-left font-bold text-gray-700">Tipo Doc.</TableHead>
                            <TableHead className="p-1 text-left font-bold text-gray-700">Folio</TableHead>
                            <TableHead className="p-1 text-left font-bold text-gray-700">Emisor</TableHead>
                            <TableHead className="p-1 text-left font-bold text-gray-700">RUT</TableHead>
                            <TableHead className="p-1 text-right font-bold text-gray-700">Bruto</TableHead>
                            <TableHead className="p-1 text-right font-bold text-gray-700">Retención (13.75%)</TableHead>
                            <TableHead className="p-1 text-right font-bold text-gray-700">Líquido</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredFees.map((doc) => (
                            <TableRow key={doc.id} className="border-b border-gray-200">
                                <TableCell className="p-1">{format(new Date(doc.date), "P", { locale: es })}</TableCell>
                                <TableCell className="p-1">{doc.docType}</TableCell>
                                <TableCell className="p-1">{doc.folio}</TableCell>
                                <TableCell className="p-1">{doc.issuer}</TableCell>
                                <TableCell className="p-1">{doc.rut}</TableCell>
                                <TableCell className="p-1 text-right">{formatCurrency(doc.gross)}</TableCell>
                                <TableCell className="p-1 text-right">{formatCurrency(doc.retention)}</TableCell>
                                <TableCell className="p-1 text-right">{formatCurrency(doc.net)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                     <TableFooter>
                        <TableRow className="bg-gray-100 font-bold">
                            <TableCell colSpan={5} className="text-right p-1">Totales</TableCell>
                            <TableCell className="text-right p-1">{formatCurrency(totals.gross)}</TableCell>
                            <TableCell className="text-right p-1">{formatCurrency(totals.retention)}</TableCell>
                            <TableCell className="text-right p-1">{formatCurrency(totals.net)}</TableCell>
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
                            <CardTitle className="font-headline">Libro de Honorarios</CardTitle>
                            <CardDescription className="font-body">Consulta las boletas de honorarios recibidas en un período.</CardDescription>
                        </div>
                         <Button onClick={handleDownloadPdf}>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar PDF
                        </Button>
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
                        <div className="flex-1 min-w-[240px]">
                            <Label>Emisor</Label>
                            <Select value={selectedIssuer} onValueChange={setSelectedIssuer}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filtrar por emisor..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los Emisores</SelectItem>
                                    {uniqueIssuers.filter(c => c !== 'all').map(issuer => (
                                        <SelectItem key={issuer} value={issuer}>{issuer}</SelectItem>
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Tipo Doc.</TableHead>
                                <TableHead>Folio</TableHead>
                                <TableHead>Emisor</TableHead>
                                <TableHead className="text-right">Bruto</TableHead>
                                <TableHead className="text-right">Retención</TableHead>
                                <TableHead className="text-right">Líquido</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredFees.length > 0 ? filteredFees.map(doc => (
                                <TableRow key={doc.id}>
                                    <TableCell>{format(new Date(doc.date), "P", { locale: es })}</TableCell>
                                    <TableCell>{doc.docType}</TableCell>
                                    <TableCell>{doc.folio}</TableCell>
                                    <TableCell>{doc.issuer}</TableCell>
                                    <TableCell className="text-right">${formatCurrency(doc.gross)}</TableCell>
                                    <TableCell className="text-right">${formatCurrency(doc.retention)}</TableCell>
                                    <TableCell className="text-right">${formatCurrency(doc.net)}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24">No se encontraron documentos con los filtros seleccionados.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={4} className="text-right font-bold">TOTALES</TableCell>
                                <TableCell className="text-right font-bold">${formatCurrency(totals.gross)}</TableCell>
                                <TableCell className="text-right font-bold">${formatCurrency(totals.retention)}</TableCell>
                                <TableCell className="text-right font-bold">${formatCurrency(totals.net)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    )
}
