
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Link from 'next/link';
import { initialSalespersonRequests, SalespersonRequest } from '@/app/sales/page';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Logo from '@/components/logo';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PRODUCT_LIST = [
    "PAN BCO SIN GLUTEN", "PAN BLANCO SIN ORILLAS 10X105", "PAN LINAZA 500 GRS",
    "PAN CHOCOSO CENTENO 500 GRS", "PAN SCHWARZBROT 750 GRS", "PAN GROB 100 INTEGRAL 750 GRS",
    "PAN ROGGENBROT 600 GRS", "PAN MULTICEREAL 500 GRS", "PAN LANDBROT 500 GRS", "PAN PRUEBA",
    "PAN GUAGUA BLANCA 16X16", "PAN GUAGUA INTEGRAL 16X16", "PAN GUAGUA MULTICEREAL 14X10",
    "PAN GUAGUA BLANCA 13X13", "PAN GUAGUA BLANCA 14X14", "PAN GUAGUA INTEGRAL 13X13",
    "PAN GUAGUA INTEGRAL MORENA 14X14", "PAN GUAGUA MULTICEREAL 14X10", "PAN MIGA DE ARGENTINO",
    "PAN INTEGRAL LIGHT 550 GRS", "PAN SCHROTBROT 100 INTEGRAL 550 GRS",
    "PAN PUMPERNICKEL 500 GRS", "PAN PUMPERNICKEL 1 K", "TOSTADAS CROSTINI MERKEN",
    "TOSTADAS CROSTINI OREGANO", "CRUTONES HOREADOS 1KG 11mm", "CRUTON HORNEADO 5KG 11MM",
    "CRUTONES HORNEADOS 1KG 7mm", "CRUTONES HORNEADOS 5KG 7mm", "CRUTONES 1 K",
    "TOSTADAS VOLLKORN CRACKER", "PAN RALLADO INTEGRAL 500 GRS", "PAN RALLADO 1 K",
    "PAN RALLADO 5 KG", "TOSTADAS COCKTAIL"
];


function DailyVendorReportContent() {
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedVendor, setSelectedVendor] = useState<string>('');

    const uniqueVendors = useMemo(() => {
        return [...new Set(initialSalespersonRequests.map(req => req.salesperson))];
    }, []);

    const reportData = useMemo(() => {
        if (!selectedDate || !selectedVendor) {
            return {
                vendor: '',
                preparedBy: '',
                deliveredBy: '',
                date: '',
                products: PRODUCT_LIST.map(p => ({ name: p, quantity: 0 })),
                total: 0
            };
        }

        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        
        const vendorRequests = initialSalespersonRequests.filter(req => 
            req.salesperson === selectedVendor && req.date === formattedDate
        );
        
        if (vendorRequests.length === 0) {
             return {
                vendor: selectedVendor,
                preparedBy: '',
                deliveredBy: '',
                date: format(selectedDate, 'dd-MM-yyyy'),
                products: PRODUCT_LIST.map(p => ({ name: p, quantity: 0 })),
                total: 0
            };
        }

        const productMap = new Map<string, number>();
        PRODUCT_LIST.forEach(p => productMap.set(p, 0));

        vendorRequests.forEach(req => {
            req.items.forEach(item => {
                if (productMap.has(item.product.toUpperCase())) {
                    productMap.set(item.product.toUpperCase(), (productMap.get(item.product.toUpperCase()) || 0) + item.quantity);
                }
            });
        });

        const products = PRODUCT_LIST.map(name => ({
            name,
            quantity: productMap.get(name) || 0,
        }));
        
        const total = products.reduce((acc, curr) => acc + curr.quantity, 0);
        
        return {
            vendor: selectedVendor,
            preparedBy: '', // This would come from the request if available
            deliveredBy: vendorRequests[0]?.deliveryPerson || '',
            date: format(selectedDate, 'dd-MM-yyyy'),
            products,
            total,
        };

    }, [selectedDate, selectedVendor]);

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
            pdf.save(`registro-pedido-${reportData.vendor}-${reportData.date}.pdf`);
            
            toast({
                title: "PDF Descargado",
                description: "El registro de pedido del vendedor ha sido descargado.",
            });
        }
    };

    return (
        <AppLayout pageTitle="Reporte Diario por Vendedor">
             <div className="fixed -left-[9999px] top-0 p-2 bg-white text-black font-sans" style={{ width: '210mm' }}>
                <div ref={reportRef} className="p-4 border-2 border-black h-full flex flex-col" style={{height: '297mm'}}>
                    <header className="grid grid-cols-2 gap-2 border-b-2 border-black pb-2 text-sm">
                        <div className="flex items-center">
                            <Logo className="w-40" />
                        </div>
                        <div className="border border-black p-1">
                            <h2 className="text-lg font-bold font-headline text-center">REGISTRO PEDIDO POR VENDEDOR</h2>
                             <div className="grid grid-cols-2 text-xs mt-1 border-t border-b border-black py-1">
                                <p><span className="font-semibold">VENDEDOR:</span> {reportData.vendor}</p>
                                <p><span className="font-semibold">FECHA:</span> {reportData.date}</p>
                                <p><span className="font-semibold">PREPARADO POR:</span> {reportData.preparedBy}</p>
                                <p><span className="font-semibold">ENTREGADO POR:</span> {reportData.deliveredBy}</p>
                            </div>
                        </div>
                    </header>
                    <main className="flex-grow text-xs mt-2">
                        <Table className="w-full border-collapse border-2 border-black">
                            <TableHeader>
                                <TableRow className="border-b-2 border-black">
                                    <TableHead rowSpan={2} className="h-auto p-1 font-bold text-black border-r-2 border-black w-1/4 align-bottom">VENDEDOR</TableHead>
                                    <TableHead rowSpan={2} className="h-auto p-1 font-bold text-black border-r-2 border-black text-center">(+/-)</TableHead>
                                    <TableHead rowSpan={2} className="h-auto p-1 font-bold text-black border-r-2 border-black text-center">PED</TableHead>
                                    <TableHead colSpan={3} className="h-auto p-1 font-bold text-black border-b-2 border-black text-center">CAJAS DESPACHO</TableHead>
                                    <TableHead colSpan={6} className="h-auto p-1 font-bold text-black border-b-2 border-r-2 border-black text-center">CAJAS RETORNO</TableHead>
                                </TableRow>
                                <TableRow>
                                    <TableHead className="h-auto p-1 font-bold text-black border-r-2 border-black text-center">FACTURAS</TableHead>
                                    <TableHead className="h-auto p-1 font-bold text-black border-r-2 border-black text-center" colSpan={2}>ENTREGA</TableHead>
                                    <TableHead className="h-auto p-1 font-bold text-black border-r-2 border-black text-center" colSpan={2}> </TableHead>
                                    <TableHead className="h-auto p-1 font-bold text-black border-r-2 border-black text-center" colSpan={2}> </TableHead>
                                    <TableHead className="h-auto p-1 font-bold text-black border-r-2 border-black text-center" colSpan={2}> </TableHead>
                                </TableRow>
                                <TableRow>
                                    <TableHead className="h-auto p-1 font-bold text-black border-y-2 border-black">{reportData.vendor}</TableHead>
                                    <TableHead className="h-auto p-1 font-bold text-black border-2 border-black"></TableHead>
                                    <TableHead className="h-auto p-1 font-bold text-black border-2 border-black"></TableHead>
                                    <TableHead className="h-auto p-1 font-bold text-black border-2 border-black"></TableHead>
                                    <TableHead className="h-auto p-1 font-bold text-black border-y-2 border-r-2 border-black text-center">CANT</TableHead>
                                    <TableHead className="h-auto p-1 font-bold text-black border-y-2 border-r-2 border-black text-center">LOTE</TableHead>
                                    <TableHead className="h-auto p-1 font-bold text-black border-y-2 border-r-2 border-black text-center">CANT</TableHead>
                                    <TableHead className="h-auto p-1 font-bold text-black border-y-2 border-r-2 border-black text-center">LOTE</TableHead>
                                    <TableHead className="h-auto p-1 font-bold text-black border-y-2 border-r-2 border-black text-center">CANT</TableHead>
                                    <TableHead className="h-auto p-1 font-bold text-black border-y-2 border-r-2 border-black text-center">LOTE</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reportData.products.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="p-1 border-b border-black">{item.name}</TableCell>
                                        <TableCell className="p-1 border-2 border-black text-center"></TableCell>
                                        <TableCell className="p-1 border-2 border-black text-center h-6">{item.quantity || ''}</TableCell>
                                        <TableCell className="p-1 border-2 border-black text-center"></TableCell>
                                        <TableCell className="p-1 border-2 border-black text-center"></TableCell>
                                        <TableCell className="p-1 border-2 border-black text-center"></TableCell>
                                        <TableCell className="p-1 border-2 border-black text-center"></TableCell>
                                        <TableCell className="p-1 border-2 border-black text-center"></TableCell>
                                        <TableCell className="p-1 border-2 border-black text-center"></TableCell>
                                        <TableCell className="p-1 border-2 border-black text-center"></TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell className="p-1 text-right font-bold">TOTAL</TableCell>
                                    <TableCell className="p-1 border-2 border-black"></TableCell>
                                    <TableCell className="p-1 border-2 border-black text-center font-bold">{reportData.total}</TableCell>
                                    <TableCell className="p-1 border-2 border-black"></TableCell>
                                    <TableCell className="p-1 border-2 border-black"></TableCell>
                                    <TableCell className="p-1 border-2 border-black"></TableCell>
                                    <TableCell className="p-1 border-2 border-black"></TableCell>
                                    <TableCell className="p-1 border-2 border-black"></TableCell>
                                    <TableCell className="p-1 border-2 border-black"></TableCell>
                                    <TableCell className="p-1 border-2 border-black"></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </main>
                     <footer className="text-xs text-right mt-2">
                        <p>Código: S. FOR. 10.9</p>
                        <p>Versión: 22</p>
                        <p>Fecha: 28-01-2022</p>
                    </footer>
                </div>
             </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="font-headline">Reporte Diario por Vendedor</CardTitle>
                            <CardDescription className="font-body">Genera la hoja de pedido consolidado para un vendedor y fecha específicos.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                             <Button asChild variant="outline">
                                <Link href="/sales">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver
                                </Link>
                            </Button>
                            <Button onClick={handleDownloadPdf} disabled={!selectedVendor || !selectedDate}>
                                <Download className="mr-2 h-4 w-4" />
                                Descargar PDF
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-secondary/50">
                        <div className="flex-1 min-w-[250px] space-y-2">
                             <Label>Vendedor</Label>
                              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un vendedor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {uniqueVendors.map(vendor => (
                                        <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1 min-w-[250px] space-y-2">
                            <Label>Fecha del Pedido</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !selectedDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    initialFocus
                                    locale={es}
                                />
                                </PopoverContent>
                            </Popover>
                        </div>
                     </div>
                    <p className="text-lg font-semibold mb-2">Vista Previa del Reporte</p>
                    <div className="overflow-x-auto border rounded-lg p-4 bg-gray-50 flex justify-center">
                         <div className="w-full max-w-[210mm] bg-white shadow-lg scale-[1] origin-top">
                           <div className="p-4 border-2 border-black h-full flex flex-col">
                                <header className="grid grid-cols-2 gap-2 border-b-2 border-black pb-2 text-sm">
                                    <div className="flex items-center">
                                        <Logo className="w-40" />
                                    </div>
                                    <div className="border border-black p-1">
                                        <h2 className="text-lg font-bold font-headline text-center">REGISTRO PEDIDO POR VENDEDOR</h2>
                                        <div className="grid grid-cols-2 text-xs mt-1 border-t border-b border-black py-1">
                                             <p><span className="font-semibold">VENDEDOR:</span> {reportData.vendor}</p>
                                             <p><span className="font-semibold">FECHA:</span> {reportData.date}</p>
                                             <p><span className="font-semibold">PREPARADO POR:</span> {reportData.preparedBy}</p>
                                             <p><span className="font-semibold">ENTREGADO POR:</span> {reportData.deliveredBy}</p>
                                        </div>
                                    </div>
                                </header>
                                 <main className="flex-grow text-xs mt-2">
                                    <Table className="w-full border-collapse border-2 border-black">
                                        <TableHeader>
                                            <TableRow className="border-b-2 border-black">
                                                <TableHead rowSpan={2} className="h-auto p-1 font-bold text-black border-r-2 border-black w-1/3 align-bottom text-center">PRODUCTO</TableHead>
                                                <TableHead rowSpan={2} className="h-auto p-1 font-bold text-black border-r-2 border-black text-center w-[5%]">(+/-)</TableHead>
                                                <TableHead rowSpan={2} className="h-auto p-1 font-bold text-black border-r-2 border-black text-center w-[5%]">PED</TableHead>
                                                <TableHead colSpan={3} className="h-auto p-1 font-bold text-black border-b-2 border-black text-center">CAJAS DESPACHO</TableHead>
                                            </TableRow>
                                            <TableRow>
                                                <TableHead className="h-auto p-1 font-bold text-black border-r-2 border-black text-center">FACTURAS</TableHead>
                                                <TableHead className="h-auto p-1 font-bold text-black border-r-2 border-black text-center" colSpan={2}>ENTREGA</TableHead>
                                            </TableRow>
                                             <TableRow>
                                                <TableHead className="h-auto p-1 font-bold text-black border-y-2 border-black"></TableHead>
                                                <TableHead className="h-auto p-1 font-bold text-black border-2 border-black"></TableHead>
                                                <TableHead className="h-auto p-1 font-bold text-black border-2 border-black"></TableHead>
                                                <TableHead className="h-auto p-1 font-bold text-black border-2 border-black"></TableHead>
                                                <TableHead className="h-auto p-1 font-bold text-black border-y-2 border-r-2 border-black text-center">CANT</TableHead>
                                                <TableHead className="h-auto p-1 font-bold text-black border-y-2 border-r-2 border-black text-center">LOTE</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reportData.products.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="p-1 border-b border-black">{item.name}</TableCell>
                                                    <TableCell className="p-1 border-2 border-black text-center"></TableCell>
                                                    <TableCell className="p-1 border-2 border-black text-center h-6">{item.quantity || ''}</TableCell>
                                                    <TableCell className="p-1 border-2 border-black text-center"></TableCell>
                                                    <TableCell className="p-1 border-2 border-black text-center"></TableCell>
                                                    <TableCell className="p-1 border-2 border-black text-center"></TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow>
                                                <TableCell className="p-1 text-right font-bold">TOTAL</TableCell>
                                                <TableCell className="p-1 border-2 border-black"></TableCell>
                                                <TableCell className="p-1 border-2 border-black text-center font-bold">{reportData.total}</TableCell>
                                                <TableCell className="p-1 border-2 border-black"></TableCell>
                                                <TableCell className="p-1 border-2 border-black"></TableCell>
                                                <TableCell className="p-1 border-2 border-black"></TableCell>
                                            </TableRow>
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
      <DailyVendorReportContent />
    </Suspense>
  );
}
