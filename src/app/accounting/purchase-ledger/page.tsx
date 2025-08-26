
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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PurchaseDocument = {
    id: number;
    date: string;
    docType: 'Factura Electrónica' | 'Nota de Crédito';
    folio: string;
    supplier: string;
    rut: string;
    net: number;
    tax: number;
    total: number;
};

export const initialPurchases: PurchaseDocument[] = [
    { id: 1, date: '2025-07-05', docType: 'Factura Electrónica', folio: '78901', supplier: 'Harinas del Sur S.A.', rut: '77.890.123-4', net: 672269, tax: 127731, total: 800000 },
    { id: 2, date: '2025-07-12', docType: 'Factura Electrónica', folio: '11223', supplier: 'Distribuidora Lácteos del Maule', rut: '76.543.210-9', net: 420168, tax: 79832, total: 500000 },
    { id: 3, date: '2025-07-18', docType: 'Factura Electrónica', folio: '45678', supplier: 'Insumos de Panadería ProPan', rut: '78.111.222-3', net: 252101, tax: 47899, total: 300000 },
    { id: 4, date: '2025-07-25', docType: 'Nota de Crédito', folio: '901', supplier: 'Harinas del Sur S.A.', rut: '77.890.123-4', net: -84034, tax: -15966, total: -100000 },
];

const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CL');
}


export default function PurchaseLedgerPage() {
    const { toast } = useToast();
    const reportContentRef = useRef<HTMLDivElement>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subMonths(new Date(2025, 6, 1), 1),
        to: new Date(2025, 7, 0)
    });
    const [selectedDocType, setSelectedDocType] = useState('all');
    const [selectedSupplier, setSelectedSupplier] = useState('all');

    const uniqueDocTypes = useMemo(() => ['all', ...Array.from(new Set(initialPurchases.map(doc => doc.docType)))], []);
    const uniqueSuppliers = useMemo(() => ['all', ...Array.from(new Set(initialPurchases.map(doc => doc.supplier)))], []);

    const filteredPurchases = useMemo(() => {
        let purchases = initialPurchases;

        if (dateRange?.from) {
            const fromDate = dateRange.from;
            const toDate = dateRange.to || fromDate;
            purchases = purchases.filter(doc => {
                const docDate = new Date(doc.date);
                return docDate >= fromDate && docDate <= toDate;
            });
        }
        
        if (selectedDocType !== 'all') {
            purchases = purchases.filter(doc => doc.docType === selectedDocType);
        }

        if (selectedSupplier !== 'all') {
            purchases = purchases.filter(doc => doc.supplier === selectedSupplier);
        }

        return purchases;
    }, [dateRange, selectedDocType, selectedSupplier]);

    const totals = useMemo(() => {
        return filteredPurchases.reduce((acc, doc) => {
            acc.net += doc.net;
            acc.tax += doc.tax;
            acc.total += doc.total;
            return acc;
        }, { net: 0, tax: 0, total: 0 });
    }, [filteredPurchases]);

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
            pdf.save(`libro-compras-${new Date().toISOString().split('T')[0]}.pdf`);
            
            toast({
                title: "PDF Descargado",
                description: "El libro de compras ha sido descargado.",
            });
        }
    };
    
    const resetFilters = () => {
        setDateRange({
            from: subMonths(new Date(2025, 6, 1), 1),
            to: new Date(2025, 7, 0)
        });
        setSelectedDocType('all');
        setSelectedSupplier('all');
    };


    return (
        <AppLayout pageTitle="Libro de Compras">
            <div ref={reportContentRef} className="fixed -left-[9999px] top-0 bg-white text-black p-4 font-body" style={{ width: '11in', minHeight: '8.5in' }}>
                 <header className="flex justify-between items-start mb-4 border-b-2 border-gray-800 pb-2">
                    <div className="flex items-center gap-3">
                        <Logo className="w-24" />
                        <div>
                            <h1 className="text-xl font-bold font-headline text-gray-800">Libro de Compras</h1>
                            <p className="text-xs text-gray-500">Panificadora Vollkorn - 76.123.456-7</p>
                        </div>
                    </div>
                    <div className="text-right text-xs">
                        <p><span className="font-semibold">Período:</span> {dateRange?.from ? format(dateRange.from, "P", { locale: es }) : ''} a {dateRange?.to ? format(dateRange.to, "P", { locale: es }) : 'Ahora'}</p>
                        <p><span className="font-semibold">Fecha de Emisión:</span> {format(new Date(), "P p", { locale: es })}</p>
                        <div className="mt-2 text-left bg-gray-50 p-2 rounded-md border border-gray-200">
                             <p><span className="font-semibold">Cant. Documentos:</span> {filteredPurchases.length}</p>
                             <p><span className="font-semibold">Total Neto:</span> {formatCurrency(totals.net)}</p>
                             <p><span className="font-semibold">Total IVA:</span> {formatCurrency(totals.tax)}</p>
                             <p><span className="font-semibold">Total Documentos:</span> {formatCurrency(totals.total)}</p>
                        </div>
                    </div>
                </header>
                <Table className="w-full text-xs">
                    <TableHeader className="bg-gray-100">
                        <TableRow>
                            <TableHead className="p-1 text-left font-bold text-gray-700">Fecha</TableHead>
                            <TableHead className="p-1 text-left font-bold text-gray-700">Tipo Doc.</TableHead>
                            <TableHead className="p-1 text-left font-bold text-gray-700">Folio</TableHead>
                            <TableHead className="p-1 text-left font-bold text-gray-700">Proveedor</TableHead>
                            <TableHead className="p-1 text-left font-bold text-gray-700">RUT</TableHead>
                            <TableHead className="p-1 text-right font-bold text-gray-700">Neto</TableHead>
                            <TableHead className="p-1 text-right font-bold text-gray-700">IVA</TableHead>
                            <TableHead className="p-1 text-right font-bold text-gray-700">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPurchases.map((doc) => (
                            <TableRow key={doc.id} className="border-b border-gray-200">
                                <TableCell className="p-1">{format(new Date(doc.date), "P", { locale: es })}</TableCell>
                                <TableCell className="p-1">{doc.docType}</TableCell>
                                <TableCell className="p-1">{doc.folio}</TableCell>
                                <TableCell className="p-1">{doc.supplier}</TableCell>
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
                            <CardTitle className="font-headline">Libro de Compras</CardTitle>
                            <CardDescription className="font-body">Consulta los documentos de compra recibidos en un período.</CardDescription>
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
                             <Label>Proveedor</Label>
                            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filtrar por proveedor..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los Proveedores</SelectItem>
                                    {uniqueSuppliers.filter(c => c !== 'all').map(supplier => (
                                        <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
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
                                <TableHead>Proveedor</TableHead>
                                <TableHead>RUT</TableHead>
                                <TableHead className="text-right">Neto</TableHead>
                                <TableHead className="text-right">IVA</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPurchases.length > 0 ? filteredPurchases.map(doc => (
                                <TableRow key={doc.id}>
                                    <TableCell>{format(new Date(doc.date), "P", { locale: es })}</TableCell>
                                    <TableCell>{doc.docType}</TableCell>
                                    <TableCell>{doc.folio}</TableCell>
                                    <TableCell>{doc.supplier}</TableCell>
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
                </CardContent>
            </Card>
        </AppLayout>
    )
}
