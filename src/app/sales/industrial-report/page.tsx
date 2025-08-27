
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft } from 'lucide-react';
import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Link from 'next/link';

type ReportData = {
    customer: string;
    purchaseOrder: string;
    orderDate: string;
    deliveryDate: string;
    whiteBread: number | null;
    wholeWheatBread: number | null;
    product: string;
    productDetail: string; // Formato de entrega
    dispatcher: string;
    comments: string;
};

const reportData: ReportData[] = [
    { customer: 'Hotel Holiday Inn - Pudahuel', purchaseOrder: 'FACT', orderDate: '27-02-2025', deliveryDate: 'N/A', whiteBread: null, wholeWheatBread: 10, product: 'GUAGUA INTEGRAL 13X13', productDetail: 'S/O - 11 mm', dispatcher: '', comments: '' },
    { customer: 'Hotel Holiday Inn - Pudahuel', purchaseOrder: 'FACT', orderDate: '08-10-2024', deliveryDate: '11-10-2024', whiteBread: 18, wholeWheatBread: null, product: 'GUAGUA BLANCA 14X14', productDetail: 'S/O - 9,5 mm', dispatcher: 'RENE', comments: 'AGREGAR COSTO DE DESPACHO FACT. MENOR' },
    { customer: 'Hotel Holiday Inn - Pudahuel', purchaseOrder: 'FACT', orderDate: '08-10-2024', deliveryDate: '11-10-2024', whiteBread: 8, wholeWheatBread: null, product: 'GUAGUA BLANCA 13x13', productDetail: 'S/O - 9,5 mm', dispatcher: '', comments: '' },
    { customer: 'Hotel Holiday Inn - Pudahuel', purchaseOrder: 'FACT', orderDate: '08-10-2024', deliveryDate: '11-10-2024', whiteBread: null, wholeWheatBread: 8, product: 'GUAGUA MULTICEREAL 14X10', productDetail: 'C/O - 9,5 mm', dispatcher: '', comments: '' },
    { customer: 'CAFÉ FILOMENA SPA', purchaseOrder: 'FACT', orderDate: '30-12-2024', deliveryDate: '03-01-2025', whiteBread: 3, wholeWheatBread: null, product: 'GUAGUA BLANCA 16X16', productDetail: 'S/O - 11 mm', dispatcher: 'MARCELO', comments: 'Direccion: Los clarines 3136 depto 603- Macul' },
];

export default function IndustrialReportPage() {
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const handleDownloadPdf = async () => {
        const input = reportRef.current;
        if (input) {
            const canvas = await html2canvas(input, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('l', 'px', 'a4'); // Landscape
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;

            let pdfImageWidth = pdfWidth - 40;
            let pdfImageHeight = pdfImageWidth / ratio;

            if (pdfImageHeight > pdfHeight - 40) {
              pdfImageHeight = pdfHeight - 40;
              pdfImageWidth = pdfImageHeight * ratio;
            }
            
            const xOffset = (pdfWidth - pdfImageWidth) / 2;
            const yOffset = (pdfHeight - pdfImageHeight) / 2;

            pdf.addImage(imgData, 'PNG', xOffset, yOffset, pdfImageWidth, pdfImageHeight);
            pdf.save(`reporte-producto-industrial-${new Date().toISOString().split('T')[0]}.pdf`);
            
            toast({
                title: "PDF Descargado",
                description: "El reporte de producto industrial ha sido descargado.",
            });
        }
    };

    return (
        <AppLayout pageTitle="Reporte de Producto Industrial">
             <div className="fixed -left-[9999px] top-0 p-4 bg-white text-black" style={{ width: '1100px'}}>
                <div ref={reportRef} className="p-4">
                     <h2 className="text-xl font-bold font-headline mb-4 text-center">Producto Industrial</h2>
                     <Table className="text-xs border">
                        <TableHeader className="bg-gray-100">
                            <TableRow>
                                <TableHead className="border p-1">CLIENTE</TableHead>
                                <TableHead className="border p-1">ORDEN DE COMPRA</TableHead>
                                <TableHead className="border p-1">F.PEDIDO</TableHead>
                                <TableHead className="border p-1">F.ENTREGA</TableHead>
                                <TableHead className="border p-1">BLANCA</TableHead>
                                <TableHead className="border p-1">INTEGRALES</TableHead>
                                <TableHead className="border p-1">PRODUCTO</TableHead>
                                <TableHead className="border p-1">DETALLE PRODUCTO</TableHead>
                                <TableHead className="border p-1">ENCARGADO DE DESPACHO</TableHead>
                                <TableHead className="border p-1">COMENTARIOS</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportData.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell className="border p-1 font-semibold">{row.customer}</TableCell>
                                    <TableCell className="border p-1">{row.purchaseOrder}</TableCell>
                                    <TableCell className="border p-1">{row.orderDate}</TableCell>
                                    <TableCell className="border p-1">{row.deliveryDate}</TableCell>
                                    <TableCell className="border p-1 text-center">{row.whiteBread}</TableCell>
                                    <TableCell className="border p-1 text-center">{row.wholeWheatBread}</TableCell>
                                    <TableCell className="border p-1">{row.product}</TableCell>
                                    <TableCell className="border p-1">{row.productDetail}</TableCell>
                                    <TableCell className="border p-1">{row.dispatcher}</TableCell>
                                    <TableCell className="border p-1">{row.comments}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
             </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="font-headline">Reporte de Producto Industrial</CardTitle>
                            <CardDescription className="font-body">Vista detallada de los pedidos industriales.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                             <Button asChild variant="outline">
                                <Link href="/sales">
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
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>OC</TableHead>
                                    <TableHead>F. Pedido</TableHead>
                                    <TableHead>Blanca</TableHead>
                                    <TableHead>Integrales</TableHead>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Formato Entrega</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {reportData.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{row.customer}</TableCell>
                                        <TableCell>{row.purchaseOrder}</TableCell>
                                        <TableCell>{row.orderDate}</TableCell>
                                        <TableCell className="text-center">{row.whiteBread || '-'}</TableCell>
                                        <TableCell className="text-center">{row.wholeWheatBread || '-'}</TableCell>
                                        <TableCell>{row.product}</TableCell>
                                        <TableCell>{row.productDetail}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

