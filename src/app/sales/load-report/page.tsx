
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

function LoadReportPageContent() {
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const requestId = searchParams.get('requestId');

    const requestData: SalespersonRequest | undefined = useMemo(() => {
        return initialSalespersonRequests.find(req => req.id === requestId);
    }, [requestId]);

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

    const { items } = requestData;

    return (
        <AppLayout pageTitle={`Pedido de ${requestData.salesperson}`}>
             <div className="fixed -left-[9999px] top-0 p-2 bg-white text-black" style={{ width: '210mm' }}>
                <div ref={reportRef} className="p-4 border-2 border-black h-full flex flex-col">
                    <header className="grid grid-cols-12 gap-2 border-b-2 border-black pb-1 text-sm">
                        <div className="col-span-3 flex items-center">
                            <Logo className="w-32" />
                        </div>
                        <div className="col-span-9">
                            <h2 className="text-xl font-bold font-headline text-center">HOJA DE CARGA Y DESPACHO</h2>
                             <div className="grid grid-cols-2 text-xs mt-1 border-t border-b border-black py-1">
                                <p><span className="font-semibold">RESPONSABLE REGISTRO:</span> {requestData.responsiblePerson}</p>
                                <p><span className="font-semibold">ENTREGA:</span> {requestData.deliveryPerson}</p>
                                <p><span className="font-semibold">F. PEDIDO:</span> {format(parseISO(requestData.date), 'dd-MM-yyyy')}</p>
                                <p><span className="font-semibold">F. ENTREGA:</span> {format(parseISO(requestData.deliveryDate), 'dd-MM-yyyy')}</p>
                            </div>
                        </div>
                    </header>
                    <main className="flex-grow text-xs">
                        <Table className="w-full">
                            <TableHeader>
                                <TableRow className="border-b-2 border-black">
                                    <TableHead className="h-auto p-1 font-bold text-black border-r">ITEM</TableHead>
                                    <TableHead className="h-auto p-1 font-bold text-black border-r">CLIENTE</TableHead>
                                    <TableHead className="h-auto p-1 font-bold text-black border-r">PAN</TableHead>
                                    <TableHead className="h-auto p-1 font-bold text-black border-r text-center">CANTIDAD</TableHead>
                                    <TableHead className="h-auto p-1 font-bold text-black border-r">TIPO</TableHead>
                                    <TableHead className="h-auto p-1 font-bold text-black">DIRECCION/COMENTARIOS</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="p-1 border-r">{item.type.startsWith("FACT") || item.type.startsWith("BOLETA") ? item.type : ""}</TableCell>
                                        <TableCell className="p-1 border-r font-semibold">{item.client}</TableCell>
                                        <TableCell className="p-1 border-r">{item.product}</TableCell>
                                        <TableCell className="p-1 border-r text-center">{item.quantity}</TableCell>
                                        <TableCell className="p-1 border-r">{item.type}</TableCell>
                                        <TableCell className="p-1">{item.deliveryAddress}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </main>
                </div>
             </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="font-headline">Reporte de Carga: {requestData.id}</CardTitle>
                            <CardDescription className="font-body">Pedido de {requestData.salesperson} para el {format(parseISO(requestData.deliveryDate), "PPP", { locale: es })}</CardDescription>
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
                    <div className="overflow-x-auto border rounded-lg p-4 bg-gray-50 flex justify-center">
                         <div className="w-[210mm] h-[297mm] bg-white shadow-lg scale-[0.7] origin-top">
                           <div ref={reportRef} className="p-4 border-2 border-black h-full flex flex-col">
                                <header className="grid grid-cols-12 gap-2 border-b-2 border-black pb-1 text-sm">
                                    <div className="col-span-3 flex items-center">
                                        <Logo className="w-32" />
                                    </div>
                                    <div className="col-span-9">
                                        <h2 className="text-xl font-bold font-headline text-center">HOJA DE CARGA Y DESPACHO</h2>
                                        <div className="grid grid-cols-2 text-xs mt-1 border-t border-b border-black py-1">
                                            <p><span className="font-semibold">RESPONSABLE REGISTRO:</span> {requestData.responsiblePerson}</p>
                                            <p><span className="font-semibold">ENTREGA:</span> {requestData.deliveryPerson}</p>
                                            <p><span className="font-semibold">F. PEDIDO:</span> {format(parseISO(requestData.date), 'dd-MM-yyyy')}</p>
                                            <p><span className="font-semibold">F. ENTREGA:</span> {format(parseISO(requestData.deliveryDate), 'dd-MM-yyyy')}</p>
                                        </div>
                                    </div>
                                </header>
                                <main className="flex-grow text-xs">
                                    <Table className="w-full">
                                        <TableHeader>
                                            <TableRow className="border-b-2 border-black">
                                                <TableHead className="h-auto p-1 font-bold text-black border-r w-[10%]">ITEM</TableHead>
                                                <TableHead className="h-auto p-1 font-bold text-black border-r w-[15%]">CLIENTE</TableHead>
                                                <TableHead className="h-auto p-1 font-bold text-black border-r w-[15%]">PAN</TableHead>
                                                <TableHead className="h-auto p-1 font-bold text-black border-r text-center w-[5%]">CANT</TableHead>
                                                <TableHead className="h-auto p-1 font-bold text-black border-r w-[15%]">TIPO</TableHead>
                                                <TableHead className="h-auto p-1 font-bold text-black w-[40%]">DIRECCION/COMENTARIOS</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="p-1 border-r">{item.type.startsWith("FACT") || item.type.startsWith("BOLETA") ? item.type : ""}</TableCell>
                                                    <TableCell className="p-1 border-r font-semibold">{item.client}</TableCell>
                                                    <TableCell className="p-1 border-r">{item.product}</TableCell>
                                                    <TableCell className="p-1 border-r text-center">{item.quantity}</TableCell>
                                                    <TableCell className="p-1 border-r">{item.type}</TableCell>
                                                    <TableCell className="p-1">{item.deliveryAddress}</TableCell>
                                                </TableRow>
                                            ))}
                                             {/* Add empty rows to fill page */}
                                            {Array.from({ length: Math.max(0, 35 - items.length) }).map((_, index) => (
                                                <TableRow key={`empty-${index}`}>
                                                    <TableCell className="p-1 border-r h-6">&nbsp;</TableCell>
                                                    <TableCell className="p-1 border-r"></TableCell>
                                                    <TableCell className="p-1 border-r"></TableCell>
                                                    <TableCell className="p-1 border-r text-center"></TableCell>
                                                    <TableCell className="p-1 border-r"></TableCell>
                                                    <TableCell className="p-1"></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
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
