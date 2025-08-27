
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
import { initialSalespersonRequests, SalespersonRequest } from '@/app/sales/page';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Logo from '@/components/logo';

const reportProducts = [
    "Schwarzbrot", "Chocoso Centeno", "Grob", "Rustico Linaza", "Rustico Multi",
    "Roggenbrot", "Schrobtrot", "Integral Light", "Pan Int Rallado", "Landbrot 500",
    "Pumpernickel 500", "Crostini Oregano", "Sin Orilla 10x10.5", "Vollkorn Cracker",
    "G. Blancas 16x16", "G. Integral 16x16"
];

function LoadReportPageContent() {
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const requestId = searchParams.get('requestId');

    const requestData: SalespersonRequest | undefined = useMemo(() => {
        return initialSalespersonRequests.find(req => req.id === requestId);
    }, [requestId]);

    const reportTableData = useMemo(() => {
        if (!requestData) return [];
        return reportProducts.map(productName => {
            const requestedItem = requestData.items.find(item => item.product === productName);
            return {
                product: productName,
                requested: requestedItem ? requestedItem.quantity : null,
            };
        });
    }, [requestData]);

     const totalRequested = useMemo(() => {
        if (!requestData) return 0;
        return requestData.items.reduce((sum, item) => sum + item.quantity, 0);
    }, [requestData]);


    const handleDownloadPdf = async () => {
        const input = reportRef.current;
        if (input) {
            const canvas = await html2canvas(input, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('p', 'mm', 'a4');
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
            pdf.save(`registro-pedido-${requestData?.salesperson}-${requestData?.date}.pdf`);
            
            toast({
                title: "PDF Descargado",
                description: "El registro de pedido ha sido descargado.",
            });
        }
    };

    if (!requestData) {
        return (
             <AppLayout pageTitle="Error">
                <Card>
                    <CardHeader>
                        <CardTitle>Pedido no encontrado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>El ID del pedido no es válido o no se encontró.</p>
                        <Button asChild className="mt-4">
                            <Link href="/sales">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver a Ventas
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
             </AppLayout>
        );
    }

    return (
        <AppLayout pageTitle={`Pedido de ${requestData.salesperson}`}>
             <div className="fixed -left-[9999px] top-0 p-2 bg-white text-black" style={{ width: '210mm', height: '297mm' }}>
                <div ref={reportRef} className="p-4 border-2 border-black h-full flex flex-col">
                    <header className="grid grid-cols-3 gap-2 border-b-2 border-black pb-1">
                        <div className="col-span-1">
                            <Logo className="w-32" />
                        </div>
                        <div className="col-span-2 text-center">
                            <h2 className="text-xl font-bold font-headline">REGISTRO PEDIDO POR VENDEDOR</h2>
                            <div className="grid grid-cols-2 text-sm mt-1">
                                <p><span className="font-semibold">PREPARADO POR:</span></p>
                                <p><span className="font-semibold">ENTREGADO POR:</span></p>
                            </div>
                        </div>
                    </header>
                    <section className="grid grid-cols-3 gap-2 border-b-2 border-black py-1 text-sm">
                       <div className="col-span-1">
                            <p><span className="font-semibold">VENDEDOR:</span> {requestData.salesperson.toUpperCase()}</p>
                       </div>
                       <div className="col-span-1 border-x-2 border-black px-1">
                            <p><span className="font-semibold">FECHA:</span> {format(parseISO(requestData.date), 'dd-MM-yyyy')}</p>
                       </div>
                       <div className="col-span-1">
                            <p>Código: S.LOG.R.10</p>
                            <p>Versión: 03</p>
                            <p>Fecha: 28-01-2022</p>
                       </div>
                    </section>
                    <main className="flex-grow grid grid-cols-12 gap-1 text-xs">
                        <div className="col-span-4 border-r-2 border-black">
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow className="border-b-2 border-black">
                                        <TableHead className="h-auto p-1 font-bold text-black w-2/3">VENDEDOR</TableHead>
                                        <TableHead className="h-auto p-1 font-bold text-black text-center">(+/-) PED</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reportTableData.map(item => (
                                        <TableRow key={item.product}>
                                            <TableCell className="p-1 font-semibold border-b">{item.product.toUpperCase()}</TableCell>
                                            <TableCell className="p-1 text-center border-b font-bold">{item.requested}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell className="p-1 font-semibold">TOTAL</TableCell>
                                        <TableCell className="p-1 text-center font-bold">{totalRequested}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                        <div className="col-span-8">
                             <Table className="w-full h-full">
                                <TableHeader>
                                    <TableRow className="border-b-2 border-black">
                                        <TableHead colSpan={2} className="h-auto p-1 font-bold text-black text-center border-r">CAJAS DESPACHO</TableHead>
                                        <TableHead colSpan={6} className="h-auto p-1 font-bold text-black text-center">CAJAS RETORNO</TableHead>
                                    </TableRow>
                                    <TableRow>
                                        <TableHead className="h-auto p-1 font-bold text-black border-r">FACTURAS</TableHead>
                                        <TableHead className="h-auto p-1 font-bold text-black border-r">ENTREGA CANT</TableHead>
                                        <TableHead className="h-auto p-1 font-bold text-black border-r">FRANCISCA</TableHead>
                                        <TableHead className="h-auto p-1 font-bold text-black border-r">INTEGRAL</TableHead>
                                        <TableHead className="h-auto p-1 font-bold text-black border-r">CANT</TableHead>
                                        <TableHead className="h-auto p-1 font-bold text-black border-r">LOTE</TableHead>
                                        <TableHead className="h-auto p-1 font-bold text-black border-r">CANT</TableHead>
                                        <TableHead className="h-auto p-1 font-bold text-black">LOTE</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.from({ length: reportProducts.length + 1 }).map((_, rowIndex) => (
                                        <TableRow key={`row-${rowIndex}`}>
                                            {Array.from({ length: 8 }).map((_, colIndex) => (
                                                <TableCell key={`cell-${rowIndex}-${colIndex}`} className="p-1 border-b border-r h-[22px]"></TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </main>
                </div>
             </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="font-headline">Reporte de Carga de Vendedor: {requestData.salesperson}</CardTitle>
                            <CardDescription className="font-body">Pedido del {format(parseISO(requestData.date), "PPP", { locale: es })}</CardDescription>
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
                    <p className="text-lg font-semibold mb-4">Vista Previa del Reporte</p>
                    <div className="overflow-x-auto border rounded-lg p-4 bg-gray-50">
                         <div className="w-[1000px] h-[1414px] bg-white shadow-lg scale-[0.5] -translate-x-1/4 -translate-y-1/4">
                             <div ref={reportRef} className="p-4 border-2 border-black h-full flex flex-col">
                                <header className="grid grid-cols-3 gap-2 border-b-2 border-black pb-1">
                                    <div className="col-span-1">
                                        <Logo className="w-32" />
                                    </div>
                                    <div className="col-span-2 text-center">
                                        <h2 className="text-xl font-bold font-headline">REGISTRO PEDIDO POR VENDEDOR</h2>
                                        <div className="grid grid-cols-2 text-sm mt-1">
                                            <p><span className="font-semibold">PREPARADO POR:</span></p>
                                            <p><span className="font-semibold">ENTREGADO POR:</span></p>
                                        </div>
                                    </div>
                                </header>
                                <section className="grid grid-cols-3 gap-2 border-b-2 border-black py-1 text-sm">
                                   <div className="col-span-1">
                                        <p><span className="font-semibold">VENDEDOR:</span> {requestData.salesperson.toUpperCase()}</p>
                                   </div>
                                   <div className="col-span-1 border-x-2 border-black px-1">
                                        <p><span className="font-semibold">FECHA:</span> {format(parseISO(requestData.date), 'dd-MM-yyyy')}</p>
                                   </div>
                                   <div className="col-span-1">
                                        <p>Código: S.LOG.R.10</p>
                                        <p>Versión: 03</p>
                                        <p>Fecha: 28-01-2022</p>
                                   </div>
                                </section>
                                <main className="flex-grow grid grid-cols-12 gap-1 text-xs">
                                    <div className="col-span-4 border-r-2 border-black">
                                        <Table className="w-full">
                                            <TableHeader>
                                                <TableRow className="border-b-2 border-black">
                                                    <TableHead className="h-auto p-1 font-bold text-black w-2/3">VENDEDOR</TableHead>
                                                    <TableHead className="h-auto p-1 font-bold text-black text-center">(+/-) PED</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {reportTableData.map(item => (
                                                    <TableRow key={item.product}>
                                                        <TableCell className="p-1 font-semibold border-b">{item.product.toUpperCase()}</TableCell>
                                                        <TableCell className="p-1 text-center border-b font-bold">{item.requested}</TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow>
                                                    <TableCell className="p-1 font-semibold">TOTAL</TableCell>
                                                    <TableCell className="p-1 text-center font-bold">{totalRequested}</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <div className="col-span-8">
                                         <Table className="w-full h-full">
                                            <TableHeader>
                                                <TableRow className="border-b-2 border-black">
                                                    <TableHead colSpan={2} className="h-auto p-1 font-bold text-black text-center border-r">CAJAS DESPACHO</TableHead>
                                                    <TableHead colSpan={6} className="h-auto p-1 font-bold text-black text-center">CAJAS RETORNO</TableHead>
                                                </TableRow>
                                                <TableRow>
                                                    <TableHead className="h-auto p-1 font-bold text-black border-r">FACTURAS</TableHead>
                                                    <TableHead className="h-auto p-1 font-bold text-black border-r">ENTREGA CANT</TableHead>
                                                    <TableHead className="h-auto p-1 font-bold text-black border-r">FRANCISCA</TableHead>
                                                    <TableHead className="h-auto p-1 font-bold text-black border-r">INTEGRAL</TableHead>
                                                    <TableHead className="h-auto p-1 font-bold text-black border-r">CANT</TableHead>
                                                    <TableHead className="h-auto p-1 font-bold text-black border-r">LOTE</TableHead>
                                                    <TableHead className="h-auto p-1 font-bold text-black border-r">CANT</TableHead>
                                                    <TableHead className="h-auto p-1 font-bold text-black">LOTE</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {Array.from({ length: reportProducts.length + 1 }).map((_, rowIndex) => (
                                                    <TableRow key={`row-${rowIndex}`}>
                                                        {Array.from({ length: 8 }).map((_, colIndex) => (
                                                            <TableCell key={`cell-${rowIndex}-${colIndex}`} className="p-1 border-b border-r h-[22px]"></TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </main>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando reporte...</div>}>
      <LoadReportPageContent />
    </Suspense>
  );
}

    