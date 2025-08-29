
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

type ReportRow = {
    customer: string;
    purchaseOrder: string;
    orderDate: string;
    deliveryDate: string;
    whiteBread: number | null;
    wholeWheatBread: number | null;
    product: string;
    productDetail: string;
    dispatcher: string;
    comments: string;
};

function IndustrialReportPageContent() {
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const searchParams = useSearchParams();

    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    const reportData: ReportRow[] = useMemo(() => {
        const filteredOrders = initialOrders.filter(order => {
            if (!fromDate || !toDate) return true; // Show all if no dates
            const orderDate = parseISO(order.date);
            return orderDate >= parseISO(fromDate) && orderDate <= parseISO(toDate);
        });

        const data: ReportRow[] = [];

        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                const recipe = initialRecipes.find(r => r.id === item.recipeId);
                const formatInfo = recipe?.formats.find(f => f.sku === item.formatSku);
                
                if (recipe) {
                    const isWhite = !recipe.family.toLowerCase().includes('integral') && !recipe.family.toLowerCase().includes('centeno');
                    const isWholeWheat = recipe.family.toLowerCase().includes('integral') || recipe.family.toLowerCase().includes('centeno');

                    data.push({
                        customer: order.customer,
                        purchaseOrder: 'FACT', // Placeholder
                        orderDate: format(parseISO(order.date), 'dd-MM-yyyy'),
                        deliveryDate: format(parseISO(order.deliveryDate), 'dd-MM-yyyy'),
                        whiteBread: isWhite ? item.quantity : null,
                        wholeWheatBread: isWholeWheat ? item.quantity : null,
                        product: recipe.name,
                        productDetail: formatInfo?.name || item.formatSku,
                        dispatcher: order.dispatcher,
                        comments: order.comments,
                    });
                }
            });
        });

        return data;
    }, [fromDate, toDate]);

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
                            <CardDescription className="font-body">Vista detallada de los pedidos industriales para el período seleccionado.</CardDescription>
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
                                    <TableHead>F. Pedido</TableHead>
                                    <TableHead>F. Entrega</TableHead>
                                    <TableHead>Blanca</TableHead>
                                    <TableHead>Integrales</TableHead>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Formato</TableHead>
                                    <TableHead>Encargado</TableHead>
                                    <TableHead>Comentarios</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {reportData.length > 0 ? reportData.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{row.customer}</TableCell>
                                        <TableCell>{row.orderDate}</TableCell>
                                        <TableCell>{row.deliveryDate}</TableCell>
                                        <TableCell className="text-center">{row.whiteBread || '-'}</TableCell>
                                        <TableCell className="text-center">{row.wholeWheatBread || '-'}</TableCell>
                                        <TableCell>{row.product}</TableCell>
                                        <TableCell>{row.productDetail}</TableCell>
                                        <TableCell>{row.dispatcher}</TableCell>
                                        <TableCell>{row.comments}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center h-24">No hay datos para el período seleccionado.</TableCell>
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
      <IndustrialReportPageContent />
    </Suspense>
  );
}
