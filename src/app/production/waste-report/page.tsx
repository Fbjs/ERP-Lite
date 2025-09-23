
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, ArrowLeft } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Link from 'next/link';

// Data from the image
const wasteData = [
  { product: 'ZONNENBROT 750 GRS', produccion_2024: 20044, produccion_2025: 23147, total_merma: 137, devoluciones: 0, m1: 0, m2: 12, m3: 0, m4: 0, m5: 2, m6: 0, m7: 0, m8: 7, m9: 0, m10: 0, m11: 10, m12: 0, m13: 0, m14: 0, m15: 22, m16: 15, m17: 0, m18: 24, m19: 0, m20: 0, m21: 45 },
  { product: 'CROSTINI OREGANO AL OLIVA', produccion_2024: 2112, produccion_2025: 2815, total_merma: 6, devoluciones: 0, m1: 0, m2: 0, m3: 0, m4: 0, m5: 0, m6: 0, m7: 0, m8: 0, m9: 0, m10: 0, m11: 0, m12: 0, m13: 0, m14: 0, m15: 0, m16: 0, m17: 0, m18: 0, m19: 0, m20: 0, m21: 0 },
  { product: 'GROB 750 GRS', produccion_2024: 4550, produccion_2025: 4520, total_merma: 72, devoluciones: 0, m1: 1, m2: 0, m3: 0, m4: 22, m5: 23, m6: 2, m7: 0, m8: 0, m9: 0, m10: 0, m11: 12, m12: 0, m13: 0, m14: 8, m15: 14, m16: 0, m17: 0, m18: 2, m19: 0, m20: 0, m21: 0 },
  { product: 'RUSTICO LINAZA 500 GRS', produccion_2024: 6767, produccion_2025: 6797, total_merma: 30, devoluciones: 0, m1: 0, m2: 0, m3: 0, m4: 0, m5: 0, m6: 0, m7: 0, m8: 0, m9: 0, m10: 0, m11: 4, m12: 0, m13: 0, m14: 2, m15: 9, m16: 3, m17: 0, m18: 3, m19: 0, m20: 0, m21: 0 },
  { product: 'RUSTICO MULTICEREAL 500 GRS', produccion_2024: 3154, produccion_2025: 5419, total_merma: 59, devoluciones: 0, m1: 0, m2: 0, m3: 0, m4: 5, m5: 0, m6: 0, m7: 2, m8: 1, m9: 0, m10: 0, m11: 11, m12: 0, m13: 0, m14: 3, m15: 7, m16: 1, m17: 0, m18: 0, m19: 1, m20: 6, m21: 0 },
  { product: 'ROGGENBROT 600 GRS', produccion_2024: 3501, produccion_2025: 3511, total_merma: 15, devoluciones: 0, m1: 0, m2: 0, m3: 0, m4: 36, m5: 4, m6: 0, m7: 0, m8: 0, m9: 0, m10: 0, m11: 4, m12: 0, m13: 0, m14: 0, m15: 16, m16: 0, m17: 0, m18: 4, m19: 0, m20: 0, m21: 0 },
  { product: 'SCHROTBROT 500 GRS', produccion_2024: 5055, produccion_2025: 4935, total_merma: 111, devoluciones: 0, m1: 0, m2: 0, m3: 0, m4: 25, m5: 1, m6: 1, m7: 0, m8: 1, m9: 0, m10: 0, m11: 15, m12: 0, m13: 0, m14: 0, m15: 14, m16: 4, m17: 0, m18: 0, m19: 0, m20: 0, m21: 0 },
  { product: 'CHOCOSO CENTENO 500 GRS', produccion_2024: 286, produccion_2025: 108, total_merma: 54, devoluciones: 0, m1: 32, m2: 0, m3: 8, m4: 0, m5: 3, m6: 0, m7: 0, m8: 0, m9: 0, m10: 0, m11: 0, m12: 0, m13: 0, m14: 0, m15: 1, m16: 0, m17: 0, m18: 0, m19: 0, m20: 0, m21: 0 },
  { product: 'LANDBROT 500 GRS', produccion_2024: 5491, produccion_2025: 5616, total_merma: 240, devoluciones: 0, m1: 14, m2: 0, m3: 0, m4: 0, m5: 0, m6: 0, m7: 0, m8: 0, m9: 0, m10: 0, m11: 0, m12: 0, m13: 0, m14: 0, m15: 29, m16: 6, m17: 0, m18: 0, m19: 57, m20: 14, m21: 186 },
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

    const processedData = useMemo(() => {
        return wasteData.map(item => {
            const merma_producto = item.produccion_2025 > 0 ? item.total_merma / item.produccion_2025 : 0;
            const merma_total = item.produccion_2025 > 0 ? (item.total_merma + item.devoluciones) / item.produccion_2025 : 0;
            return {
                ...item,
                merma_producto,
                merma_total
            };
        });
    }, []);

    const totals = useMemo(() => {
        const totalRow: any = { product: 'TOTAL' };
        wasteHeaders.forEach(h => totalRow[h.key] = 0);
        ['produccion_2024', 'produccion_2025', 'total_merma', 'devoluciones'].forEach(key => {
            totalRow[key] = processedData.reduce((acc, curr) => acc + (curr as any)[key], 0);
        });
        
        wasteHeaders.forEach(header => {
            totalRow[header.key] = processedData.reduce((acc, curr) => acc + (curr as any)[header.key], 0);
        });

        totalRow.merma_producto = totalRow.produccion_2025 > 0 ? totalRow.total_merma / totalRow.produccion_2025 : 0;
        totalRow.merma_total = totalRow.produccion_2025 > 0 ? (totalRow.total_merma + totalRow.devoluciones) / totalRow.produccion_2025 : 0;

        return totalRow;
    }, [processedData]);

    const handleDownload = () => {
         toast({ title: 'Descarga no implementada', description: 'Esta función estará disponible en una futura actualización.' });
    }

    return (
        <AppLayout pageTitle="Reporte de Mermas">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Reporte Mensual de Mermas</CardTitle>
                            <CardDescription className="font-body">Análisis detallado de las pérdidas de producción por producto y causa.</CardDescription>
                        </div>
                         <div className="flex items-center gap-2">
                            <Button asChild variant="outline">
                                <Link href="/production">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver
                                </Link>
                            </Button>
                            <Button onClick={handleDownload}><FileSpreadsheet className="mr-2 h-4 w-4" /> Excel</Button>
                            <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4" /> PDF</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold sticky left-0 bg-secondary">Producto</TableHead>
                                <TableHead className="text-right">Producción 2024</TableHead>
                                <TableHead className="text-right">Producción 2025</TableHead>
                                <TableHead className="text-right">Total Merma</TableHead>
                                <TableHead className="text-right">Merma/Prod.</TableHead>
                                <TableHead className="text-right">Devoluciones</TableHead>
                                <TableHead className="text-right">Merma/Total</TableHead>
                                {wasteHeaders.map(h => <TableHead key={h.key} className="text-right">{h.label}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {processedData.map(item => (
                                <TableRow key={item.product}>
                                    <TableCell className="font-medium sticky left-0 bg-secondary">{item.product}</TableCell>
                                    <TableCell className="text-right">{item.produccion_2024}</TableCell>
                                    <TableCell className="text-right">{item.produccion_2025}</TableCell>
                                    <TableCell className="text-right">{item.total_merma}</TableCell>
                                    <TableCell className="text-right">{formatPercent(item.merma_producto)}</TableCell>
                                    <TableCell className="text-right">{item.devoluciones}</TableCell>
                                    <TableCell className="text-right">{formatPercent(item.merma_total)}</TableCell>
                                    {wasteHeaders.map(h => <TableCell key={h.key} className="text-right">{(item as any)[h.key] > 0 ? (item as any)[h.key] : ''}</TableCell>)}
                                </TableRow>
                            ))}
                        </TableBody>
                         <tfoot className="bg-secondary font-bold">
                            <TableRow>
                                <TableCell className="sticky left-0 bg-secondary">TOTAL</TableCell>
                                <TableCell className="text-right">{totals.produccion_2024}</TableCell>
                                <TableCell className="text-right">{totals.produccion_2025}</TableCell>
                                <TableCell className="text-right">{totals.total_merma}</TableCell>
                                <TableCell className="text-right">{formatPercent(totals.merma_producto)}</TableCell>
                                <TableCell className="text-right">{totals.devoluciones}</TableCell>
                                <TableCell className="text-right">{formatPercent(totals.merma_total)}</TableCell>
                                {wasteHeaders.map(h => <TableCell key={h.key} className="text-right">{(totals as any)[h.key] > 0 ? (totals as any)[h.key] : ''}</TableCell>)}
                            </TableRow>
                        </tfoot>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}


    