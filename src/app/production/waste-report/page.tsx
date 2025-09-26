
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, ArrowLeft, Calendar as CalendarIcon, RefreshCcw } from 'lucide-react';
import { useMemo, useRef, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Link from 'next/link';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parse, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

// Data from the image
const wasteData = [
  { product: 'ZONNENBROT 750 GRS', produccion_2024: 20044, produccion_2025: 23147, total_merma: 137, devoluciones: 0, m1: 0, m2: 12, m3: 0, m4: 0, m5: 2, m6: 0, m7: 0, m8: 7, m9: 0, m10: 0, m11: 10, m12: 0, m13: 0, m14: 0, m15: 22, m16: 15, m17: 0, m18: 24, m19: 0, m20: 0, m21: 45, month: '2024-09-01' },
  { product: 'CROSTINI OREGANO AL OLIVA', produccion_2024: 2112, produccion_2025: 2815, total_merma: 6, devoluciones: 0, m1: 0, m2: 0, m3: 0, m4: 0, m5: 0, m6: 0, m7: 0, m8: 0, m9: 0, m10: 0, m11: 0, m12: 0, m13: 0, m14: 0, m15: 0, m16: 0, m17: 0, m18: 0, m19: 0, m20: 0, m21: 0, month: '2024-10-01' },
  { product: 'GROB 750 GRS', produccion_2024: 4550, produccion_2025: 4520, total_merma: 72, devoluciones: 0, m1: 1, m2: 0, m3: 0, m4: 22, m5: 23, m6: 2, m7: 0, m8: 0, m9: 0, m10: 0, m11: 12, m12: 0, m13: 0, m14: 8, m15: 14, m16: 0, m17: 0, m18: 2, m19: 0, m20: 0, m21: 0, month: '2024-10-01' },
  { product: 'RUSTICO LINAZA 500 GRS', produccion_2024: 6767, produccion_2025: 6797, total_merma: 30, devoluciones: 0, m1: 0, m2: 0, m3: 0, m4: 0, m5: 0, m6: 0, m7: 0, m8: 0, m9: 0, m10: 0, m11: 4, m12: 0, m13: 0, m14: 2, m15: 9, m16: 3, m17: 0, m18: 3, m19: 0, m20: 0, m21: 0, month: '2024-11-01' },
  { product: 'RUSTICO MULTICEREAL 500 GRS', produccion_2024: 3154, produccion_2025: 5419, total_merma: 59, devoluciones: 0, m1: 0, m2: 0, m3: 0, m4: 5, m5: 0, m6: 0, m7: 2, m8: 1, m9: 0, m10: 0, m11: 11, m12: 0, m13: 0, m14: 3, m15: 7, m16: 1, m17: 0, m18: 0, m19: 1, m20: 6, m21: 0, month: '2024-11-01' },
  { product: 'ROGGENBROT 600 GRS', produccion_2024: 3501, produccion_2025: 3511, total_merma: 15, devoluciones: 0, m1: 0, m2: 0, m3: 0, m4: 36, m5: 4, m6: 0, m7: 0, m8: 0, m9: 0, m10: 0, m11: 4, m12: 0, m13: 0, m14: 0, m15: 16, m16: 0, m17: 0, m18: 4, m19: 0, m20: 0, m21: 0, month: '2024-12-01' },
  { product: 'SCHROTBROT 500 GRS', produccion_2024: 5055, produccion_2025: 4935, total_merma: 111, devoluciones: 0, m1: 0, m2: 0, m3: 0, m4: 25, m5: 1, m6: 1, m7: 0, m8: 1, m9: 0, m10: 0, m11: 15, m12: 0, m13: 0, m14: 0, m15: 14, m16: 4, m17: 0, m18: 0, m19: 0, m20: 0, m21: 0, month: '2024-12-01' },
  { product: 'CHOCOSO CENTENO 500 GRS', produccion_2024: 286, produccion_2025: 108, total_merma: 54, devoluciones: 0, m1: 32, m2: 0, m3: 8, m4: 0, m5: 3, m6: 0, m7: 0, m8: 0, m9: 0, m10: 0, m11: 0, m12: 0, m13: 0, m14: 0, m15: 1, m16: 0, m17: 0, m18: 0, m19: 0, m20: 0, m21: 0, month: '2025-01-01' },
  { product: 'LANDBROT 500 GRS', produccion_2024: 5491, produccion_2025: 5616, total_merma: 240, devoluciones: 0, m1: 14, m2: 0, m3: 0, m4: 0, m5: 0, m6: 0, m7: 0, m8: 0, m9: 0, m10: 0, m11: 0, m12: 0, m13: 0, m14: 0, m15: 29, m16: 6, m17: 0, m18: 0, m19: 57, m20: 14, m21: 186, month: '2025-01-01' },
];

const wasteHeaders = [
    { key: 'm1', label: 'Reventado' }, { key: 'm2', label: 'Bajo Peso' }, { key: 'm3', label: 'Baja Altura' },
    { key: 'm4', label: 'Perforaciones' }, { key: 'm5', label: 'Agrietado' }, { key: 'm6', label: 'Quemado' },
    { key: 'm7', label: 'Crudo' }, { key: 'm8', label: 'Horneo Desuniforme' }, { key: 'm9', label: 'Corte o Detail' },
    { key: 'm10', label: 'Exceso Altura' }, { key: 'm11', label: 'Por Molde' }, { key: 'm12', label: 'Reb. No Homogenea' },
    { key: 'm13', label: 'Merma por Inidia' }, { key: 'm14', label: 'Con Metal' }, { key: 'm15', label: 'Rebanada Bota' },
    { key: 'm16', label: 'Caida' }, { key: 'm17', label: 'Tapas F/ Rebanada' }, { key: 'm18', label: 'Corte Irregular' },
    { key: 'm19', label: 'FK Sabor/Color/Olor' }, { key: 'm20', label: 'Contaminado' }, { key: 'm21', label: 'Vencimiento' },
];

const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
}

export default function WasteReportPage() {
    const { toast } = useToast();
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [selectedProduct, setSelectedProduct] = useState('all');

    useEffect(() => {
        const endDate = new Date();
        const startDate = subMonths(endDate, 6);
        setDateRange({ from: startDate, to: endDate });
    }, []);

    const productOptions = useMemo(() => ['all', ...Array.from(new Set(wasteData.map(item => item.product)))], []);
    
    const filteredData = useMemo(() => {
        let data = wasteData;

        if (dateRange?.from) {
            const fromDate = dateRange.from;
            const toDate = dateRange.to || fromDate;
            data = data.filter(item => {
                const itemDate = parse(item.month, 'yyyy-MM-dd', new Date());
                return itemDate >= fromDate && itemDate <= toDate;
            });
        }
        
        if (selectedProduct !== 'all') {
            data = data.filter(item => item.product === selectedProduct);
        }
        
        return data;

    }, [dateRange, selectedProduct]);

    const processedData = useMemo(() => {
        return filteredData.map(item => {
            const merma_producto = item.produccion_2025 > 0 ? item.total_merma / item.produccion_2025 : 0;
            const produccion_buena = item.produccion_2025 - item.total_merma;
            return {
                ...item,
                merma_producto,
                produccion_buena,
            };
        });
    }, [filteredData]);

    const totals = useMemo(() => {
        if (processedData.length === 0) return null;
        
        const totalRow: any = { product: 'TOTAL' };
        
        ['produccion_2025', 'total_merma', 'devoluciones', 'produccion_buena'].forEach(key => {
            totalRow[key] = processedData.reduce((acc, curr) => acc + (curr as any)[key], 0);
        });
        
        wasteHeaders.forEach(header => {
            totalRow[header.key] = processedData.reduce((acc, curr) => acc + (curr as any)[header.key], 0);
        });

        totalRow.merma_producto = totalRow.produccion_2025 > 0 ? totalRow.total_merma / totalRow.produccion_2025 : 0;
        
        return totalRow;
    }, [processedData]);

    const handleDownloadExcel = () => {
        const dataToExport = [...processedData, totals].filter(Boolean).map(item => {
            const row: any = {
                'Producto': item.product,
                'Producción Total': item.produccion_2025,
                'Producción Buena': item.produccion_buena,
                'Total Merma': item.total_merma,
                '% Merma': formatPercent(item.merma_producto),
            };
            wasteHeaders.forEach(h => {
                row[h.label] = (item as any)[h.key] > 0 ? (item as any)[h.key] : '';
            });
            return row;
        });
        
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte de Mermas");
        XLSX.writeFile(workbook, `reporte-mermas-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);

        toast({ title: 'Excel Descargado', description: 'El reporte de mermas se ha exportado a Excel.' });
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        
        doc.setFontSize(18);
        doc.text("Reporte de Calidad y Mermas de Producción", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Período: ${format(dateRange?.from || new Date(), 'P', { locale: es })} - ${format(dateRange?.to || new Date(), 'P', { locale: es })}`, 14, 30);
        
        const head = [['Producto', 'Prod. Total', 'Prod. Buena', 'Merma Total', '% Merma', ...wasteHeaders.map(h => h.label.substring(0, 10))]];
        
        const body = [...processedData, totals].filter(Boolean).map(item => [
            item.product,
            item.produccion_2025.toLocaleString('es-CL'),
            item.produccion_buena.toLocaleString('es-CL'),
            item.total_merma.toLocaleString('es-CL'),
            formatPercent(item.merma_producto),
            ...wasteHeaders.map(h => (item as any)[h.key] > 0 ? (item as any)[h.key] : ''),
        ]);

        (doc as any).autoTable({
            head: head,
            body: body,
            startY: 35,
            styles: { fontSize: 5, cellPadding: 1 },
            headStyles: { fillColor: [244, 245, 247], textColor: [23, 23, 23], fontStyle: 'bold' }
        });

        doc.save(`reporte-mermas-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
        toast({ title: 'PDF Descargado', description: 'El reporte de mermas se ha exportado a PDF.' });
    };

    const resetFilters = () => {
        const endDate = new Date();
        const startDate = subMonths(endDate, 6);
        setDateRange({ from: startDate, to: endDate });
        setSelectedProduct('all');
    }

    return (
        <AppLayout pageTitle="Reporte de Calidad y Mermas">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Reporte de Calidad y Mermas de Producción</CardTitle>
                            <CardDescription className="font-body">Análisis detallado de las pérdidas de producción por producto y causa.</CardDescription>
                        </div>
                         <div className="flex items-center gap-2">
                            <Button asChild variant="outline">
                                <Link href="/production">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver
                                </Link>
                            </Button>
                            <Button onClick={handleDownloadExcel}><FileSpreadsheet className="mr-2 h-4 w-4" /> Excel</Button>
                            <Button onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" /> PDF</Button>
                        </div>
                    </div>
                     <div className="flex flex-wrap gap-4 pt-6 border-t mt-4">
                        <div className="flex-1 min-w-[280px] space-y-2">
                            <Label>Rango de Fechas</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn("w-full justify-start text-left font-normal",!dateRange && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>{format(dateRange.from, "LLL dd, y", { locale: es })} - {format(dateRange.to, "LLL dd, y", { locale: es })}</>
                                        ) : ( format(dateRange.from, "LLL dd, y", { locale: es }))) : (<span>Selecciona un rango</span>)}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={es}/>
                                </PopoverContent>
                            </Popover>
                        </div>
                         <div className="flex-1 min-w-[300px] space-y-2">
                             <Label>Producto</Label>
                            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filtrar por producto..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los Productos</SelectItem>
                                    {productOptions.filter(p => p !== 'all').map(product => (
                                        <SelectItem key={product} value={product}>{product}</SelectItem>
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
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold sticky left-0 bg-secondary w-[250px] min-w-[250px]">Producto</TableHead>
                                <TableHead className="text-right font-bold">Producción Total</TableHead>
                                <TableHead className="text-right font-bold text-green-600">Producción Buena</TableHead>
                                <TableHead className="text-right font-bold text-red-600">Total Merma</TableHead>
                                <TableHead className="text-right font-bold">% Merma</TableHead>
                                {wasteHeaders.map(h => <TableHead key={h.key} className="text-right">{h.label}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {processedData.length > 0 ? processedData.map(item => (
                                <TableRow key={item.product}>
                                    <TableCell className="font-medium sticky left-0 bg-secondary">{item.product}</TableCell>
                                    <TableCell className="text-right">{item.produccion_2025}</TableCell>
                                    <TableCell className="text-right font-semibold text-green-600">{item.produccion_buena}</TableCell>
                                    <TableCell className="text-right font-semibold text-red-600">{item.total_merma}</TableCell>
                                    <TableCell className="text-right">{formatPercent(item.merma_producto)}</TableCell>
                                    {wasteHeaders.map(h => <TableCell key={h.key} className="text-right">{(item as any)[h.key] > 0 ? (item as any)[h.key] : ''}</TableCell>)}
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={wasteHeaders.length + 5} className="h-24 text-center">
                                        No se encontraron datos para los filtros seleccionados.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        {totals && (
                             <tfoot className="bg-secondary font-bold sticky bottom-0">
                                <TableRow>
                                    <TableCell className="sticky left-0 bg-secondary">TOTAL</TableCell>
                                    <TableCell className="text-right">{totals.produccion_2025}</TableCell>
                                    <TableCell className="text-right text-green-600">{totals.produccion_buena}</TableCell>
                                    <TableCell className="text-right text-red-600">{totals.total_merma}</TableCell>
                                    <TableCell className="text-right">{formatPercent(totals.merma_producto)}</TableCell>
                                    {wasteHeaders.map(h => <TableCell key={h.key} className="text-right">{(totals as any)[h.key] > 0 ? (totals as any)[h.key] : ''}</TableCell>)}
                                </TableRow>
                            </tfoot>
                        )}
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
