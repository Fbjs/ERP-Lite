
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft } from 'lucide-react';
import { useRef, useMemo, Suspense } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { initialOrders } from '@/app/sales/page';
import { initialRecipes } from '@/app/recipes/page';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

type ReportRow = {
    orderDate: string;
    deliveryDate: string;
    customer: string;
    product: string;
    quantity: number;
    responsible: string;
    address: string;
    orderId: string;
};


function GeneralReportPageContent() {
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const searchParams = useSearchParams();

    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    const reportData: ReportRow[] = useMemo(() => {
        const filteredOrders = initialOrders.filter(order => {
            if (!fromDate || !toDate) return true;
            const orderDate = parseISO(order.date);
            return orderDate >= parseISO(fromDate) && orderDate <= parseISO(toDate);
        });

        const flattenedData = filteredOrders.flatMap(order => 
            order.items.map(item => {
                const recipe = initialRecipes.find(r => r.id === item.recipeId);
                return {
                    orderDate: order.date,
                    deliveryDate: order.deliveryDate,
                    customer: order.customer,
                    product: recipe?.name || 'Producto no encontrado',
                    quantity: item.quantity,
                    responsible: order.dispatcher,
                    address: order.deliveryAddress,
                    orderId: order.id,
                };
            })
        );

        return flattenedData;
    }, [fromDate, toDate]);

    const handleDownloadPdf = async () => {
        const input = reportRef.current;
        if (input) {
            const canvas = await html2canvas(input, { scale: 2, windowWidth: input.scrollWidth, windowHeight: input.scrollHeight });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('l', 'px', 'a3'); // Landscape, A3
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
            const yOffset = (pdfHeight - pdfImageHeight) / 2;

            pdf.addImage(imgData, 'PNG', xOffset, yOffset, pdfImageWidth, pdfImageHeight);
            pdf.save(`reporte-general-${new Date().toISOString().split('T')[0]}.pdf`);
            
            toast({
                title: "PDF Descargado",
                description: "El reporte general de pedidos ha sido descargado.",
            });
        }
    };

    return (
        <AppLayout pageTitle="Reporte General de Pedidos">
             <div className="fixed -left-[9999px] top-0 p-2 bg-white text-black" style={{ width: '1400px'}}>
                <div ref={reportRef} className="p-2">
                     <Table className="text-xs border">
                        <TableHeader className="bg-yellow-200 font-bold">
                            <TableRow>
                                <TableHead className="border p-1 w-[8%]">F. PEDIDO</TableHead>
                                <TableHead className="border p-1 w-[8%]">F. ENTREGA</TableHead>
                                <TableHead className="border p-1 w-[15%]">CLIENTE</TableHead>
                                <TableHead className="border p-1 w-[20%]">PRODUCTO</TableHead>
                                <TableHead className="border p-1 w-[5%] text-center">CANTIDAD</TableHead>
                                <TableHead className="border p-1 w-[10%]">RESPONSABLE</TableHead>
                                <TableHead className="border p-1 w-[34%]">DIRECCION</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportData.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell className="border p-1">{format(parseISO(row.orderDate), 'd-M-yy')}</TableCell>
                                    <TableCell className="border p-1">{format(parseISO(row.deliveryDate), 'd-M-yy')}</TableCell>
                                    <TableCell className="border p-1">{row.customer}</TableCell>
                                    <TableCell className="border p-1">{row.product}</TableCell>
                                    <TableCell className="border p-1 text-center">{row.quantity}</TableCell>
                                    <TableCell className="border p-1">{row.responsible}</TableCell>
                                    <TableCell className="border p-1">{row.address}</TableCell>
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
                            <CardTitle className="font-headline">Reporte General de Pedidos</CardTitle>
                            <CardDescription className="font-body">Vista consolidada de todos los items de pedidos para el período seleccionado.</CardDescription>
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
                                    <TableHead>F. Pedido</TableHead>
                                    <TableHead>F. Entrega</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Cantidad</TableHead>
                                    <TableHead>Responsable</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {reportData.length > 0 ? reportData.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{format(parseISO(row.orderDate), 'P', { locale: es })}</TableCell>
                                        <TableCell>{format(parseISO(row.deliveryDate), 'P', { locale: es })}</TableCell>
                                        <TableCell>{row.customer}</TableCell>
                                        <TableCell>{row.product}</TableCell>
                                        <TableCell>{row.quantity}</TableCell>
                                        <TableCell>{row.responsible}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">No hay datos para el período seleccionado.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando reporte...</div>}>
      <GeneralReportPageContent />
    </Suspense>
  );
}
