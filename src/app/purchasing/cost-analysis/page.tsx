
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileSpreadsheet, Calendar as CalendarIcon, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState, useRef, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { format, parseISO, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

type CostData = {
    periodo: string;
    codigoProducto: string;
    descripcionProducto: string;
    familiaProducto: string;
    cantidadEntrada: number | null;
    precioMedioEntradas: number | null;
    totalEntradas: number | null;
    cantidadSalida: number | null;
    precioMedioSalidas: number | null;
    totalSalidas: number | null;
};

const initialCostData: CostData[] = [
    { periodo: '202505', codigoProducto: 'ACE-MAR', descripcionProducto: 'ACEITE DE MARAVILLA', familiaProducto: 'ACEITES Y GRA', cantidadEntrada: 0, precioMedioEntradas: null, totalEntradas: 0, cantidadSalida: 158.28, precioMedioSalidas: 1931.36, totalSalidas: 305714.03 },
    { periodo: '202505', codigoProducto: 'ACE-OLI', descripcionProducto: 'ACEITE OLIVA', familiaProducto: 'ACEITES Y GRA', cantidadEntrada: 43.70, precioMedioEntradas: 7165.78, totalEntradas: 313145, cantidadSalida: 12, precioMedioSalidas: 7165.78, totalSalidas: 85989.46 },
    { periodo: '202505', codigoProducto: 'AGUA', descripcionProducto: 'AGUA', familiaProducto: 'ADITIVOS', cantidadEntrada: 0, precioMedioEntradas: null, totalEntradas: 0, cantidadSalida: 13180.15, precioMedioSalidas: 2.89, totalSalidas: 38167.10 },
    { periodo: '202505', codigoProducto: 'ALC-HOL', descripcionProducto: 'ALCOHOL 96 GRADO ALIMENTICIO', familiaProducto: 'ENVASADO', cantidadEntrada: 200, precioMedioEntradas: 1905.72, totalEntradas: 381144, cantidadSalida: 126.74, precioMedioSalidas: 1905.72, totalSalidas: 241531.26 },
    { periodo: '202505', codigoProducto: 'ALMMAN', descripcionProducto: 'PHYBOPLUS 2 ALMIDON DE MANDIOCA', familiaProducto: 'ADITIVOS', cantidadEntrada: 250, precioMedioEntradas: 4141.11, totalEntradas: 1035279, cantidadSalida: 101.86, precioMedioSalidas: 4141.11, totalSalidas: 421816 },
    { periodo: '202505', codigoProducto: 'AVE-ESP', descripcionProducto: 'AVENA ESPOLVOREADA', familiaProducto: 'SEMILLAS', cantidadEntrada: 100, precioMedioEntradas: 749.90, totalEntradas: 74990, cantidadSalida: 0, precioMedioSalidas: null, totalSalidas: 0 },
    { periodo: '202505', codigoProducto: 'AZU-CAR', descripcionProducto: 'AZUCAR', familiaProducto: 'ENDULZANTES', cantidadEntrada: 375, precioMedioEntradas: 849.97, totalEntradas: 318742, cantidadSalida: 126.94, precioMedioSalidas: 849.97, totalSalidas: 107904.45 },
    { periodo: '202505', codigoProducto: 'CEN-SCH', descripcionProducto: 'BOLSAS CENTENO SCHWARZBROT', familiaProducto: 'ENVASADO', cantidadEntrada: 98600, precioMedioEntradas: 31.56, totalEntradas: 3111954, cantidadSalida: 12350, precioMedioSalidas: 31.56, totalSalidas: 389783.28 },
    { periodo: '202505', codigoProducto: 'INT-FUE', descripcionProducto: 'HARINA INTEGRAL TRIGO FUERTE', familiaProducto: 'HARINAS', cantidadEntrada: 1000, precioMedioEntradas: 503.55, totalEntradas: 503553, cantidadSalida: 1691.81, precioMedioSalidas: 503.55, totalSalidas: 851919.56 },
    { periodo: '202505', codigoProducto: 'INT-LIG', descripcionProducto: 'BOLSAS INTEGRAL LIGHT', familiaProducto: 'ENVASADO', cantidadEntrada: 64900, precioMedioEntradas: 39.74, totalEntradas: 2579216, cantidadSalida: 1760, precioMedioSalidas: 39.74, totalSalidas: 69944.85 },
];


const formatCurrency = (value: number | null) => {
  if (value === null || isNaN(value)) return '';
  return value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 });
};

const formatNumber = (value: number | null) => {
  if (value === null || isNaN(value)) return '';
  return value.toLocaleString('es-CL', { minimumFractionDigits: 2 });
};


export default function CostAnalysisPage() {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    useEffect(() => {
        setDateRange({
            from: new Date(2025, 4, 1),
            to: new Date(2025, 4, 31)
        });
    }, []);
    
    const filteredData = useMemo(() => {
        let data = initialCostData;
        if (searchQuery) {
            data = data.filter(item => 
                item.descripcionProducto.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.codigoProducto.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        // Date filtering can be added here if period format is changed to a date
        return data;
    }, [searchQuery, dateRange]);

    const handleDownloadPdf = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(14);
        doc.text("Análisis de Costos de Compra", 14, 22);

        (doc as any).autoTable({
            head: [['Periodo', 'Código', 'Descripción', 'Entradas (Cant)', 'Entradas (Total)', 'Salidas (Cant)', 'Salidas (Total)']],
            body: filteredData.map(item => [
                item.periodo,
                item.codigoProducto,
                item.descripcionProducto,
                item.cantidadEntrada,
                formatCurrency(item.totalEntradas),
                item.cantidadSalida,
                formatCurrency(item.totalSalidas),
            ]),
            startY: 30,
            styles: { fontSize: 8 }
        });

        doc.save(`analisis-costos-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
        toast({ title: 'PDF Descargado', description: 'El análisis de costos ha sido descargado.' });
    };

     const handleDownloadExcel = () => {
        const dataForSheet = filteredData.map(item => ({
            'Periodo': item.periodo,
            'Codigo Producto': item.codigoProducto,
            'Descripcion Producto': item.descripcionProducto,
            'Familia Producto': item.familiaProducto,
            'Cantidad Entrada': item.cantidadEntrada,
            'Precio Medio Entradas': item.precioMedioEntradas,
            'Total Entradas': item.totalEntradas,
            'Cantidad Salida': item.cantidadSalida,
            'Precio Medio Salidas': item.precioMedioSalidas,
            'Total Salidas': item.totalSalidas,
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "AnalisisCostos");
        XLSX.writeFile(workbook, `analisis-costos-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);

        toast({ title: 'Excel Descargado', description: 'El análisis de costos ha sido exportado a Excel.' });
    };
    
    return (
        <AppLayout pageTitle="Análisis de Costos de Compra">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Análisis de Costos de Compra</CardTitle>
                            <CardDescription className="font-body">Revisa los costos ponderados de entradas y salidas de inventario.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline">
                                <Link href="/purchasing">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver
                                </Link>
                            </Button>
                            <Button variant="outline" onClick={handleDownloadExcel}><FileSpreadsheet className="mr-2 h-4 w-4" /> Excel</Button>
                            <Button variant="outline" onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" /> PDF</Button>
                        </div>
                    </div>
                     <div className="flex flex-wrap gap-4 pt-6 mt-4 border-t">
                        <div className="flex-1 min-w-[280px] space-y-2">
                             <Label>Período</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                            dateRange.to ? (<>{format(dateRange.from, "LLL, yyyy")} - {format(dateRange.to, "LLL, yyyy")}</>) : (format(dateRange.from, "LLL, yyyy")))
                                            : (<span>Selecciona un rango</span>)
                                        }
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={es}/>
                                </PopoverContent>
                            </Popover>
                        </div>
                         <div className="flex-1 min-w-[300px] space-y-2">
                            <Label>Filtrar por Producto</Label>
                            <Input placeholder="Buscar por código o descripción..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <div className="flex items-end">
                            <Button variant="ghost" onClick={() => setSearchQuery('')}>
                                <RefreshCcw className="mr-2 h-4 w-4" /> Limpiar
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="sticky left-0 bg-secondary w-1/4">Descripción</TableHead>
                                <TableHead className="text-right">Cant. Entrada</TableHead>
                                <TableHead className="text-right">P.M. Entrada</TableHead>
                                <TableHead className="text-right">Total Entradas</TableHead>
                                <TableHead className="text-right">Cant. Salida</TableHead>
                                <TableHead className="text-right">P.M. Salida</TableHead>
                                <TableHead className="text-right">Total Salidas</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map(item => (
                                <TableRow key={item.codigoProducto}>
                                    <TableCell className="font-medium sticky left-0 bg-secondary">{item.descripcionProducto}</TableCell>
                                    <TableCell className="text-right">{formatNumber(item.cantidadEntrada)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.precioMedioEntradas)}</TableCell>
                                    <TableCell className="text-right font-semibold">{formatCurrency(item.totalEntradas)}</TableCell>
                                    <TableCell className="text-right">{formatNumber(item.cantidadSalida)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.precioMedioSalidas)}</TableCell>
                                    <TableCell className="text-right font-semibold">{formatCurrency(item.totalSalidas)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     {filteredData.length === 0 && <p className="text-center p-8 text-muted-foreground">No se encontraron datos.</p>}
                </CardContent>
            </Card>
        </AppLayout>
    );
}
