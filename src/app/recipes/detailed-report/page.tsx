
'use client';

import { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { initialRecipes, Ingredient } from '@/app/recipes/page';
import { initialInventoryItems } from '@/app/inventory/page';
import { initialPurchaseOrders } from '@/app/purchasing/orders/page';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Download, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Logo from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

// Helper to find the latest price for a raw material
const getLatestPrice = (itemName: string) => {
    let latestPrice = 0;
    let latestDate = new Date(0);

    initialPurchaseOrders.forEach(order => {
        if(new Date(order.date) > latestDate) {
            const item = order.items.find(i => i.name.toLowerCase() === itemName.toLowerCase());
            if (item) {
                latestPrice = item.price;
                latestDate = new Date(order.date);
            }
        }
    });
    return latestPrice;
};

// Helper to get ingredient details including cost
const getIngredientDetails = (ingredients: Ingredient[]) => {
    return ingredients.map(ing => {
        const itemInfo = initialInventoryItems.find(i => i.name.toLowerCase() === ing.name.toLowerCase());
        const price = getLatestPrice(ing.name);
        return {
            ...ing,
            code: itemInfo?.sku || 'N/A',
            classification: itemInfo?.category || 'Materia Prima',
            price: price,
            totalValue: ing.quantity * price,
        };
    });
};

export default function DetailedRecipesReport() {
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const [generationDate, setGenerationDate] = useState<Date | null>(null);

    useEffect(() => {
        setGenerationDate(new Date());
    }, []);

    const handleDownloadPdf = async () => {
        const input = reportRef.current;
        if (!input) return;

        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'px', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvas.width / canvas.height;

        const pdfImageHeight = pdfWidth / ratio;
        let currentPage = 0;
        const pageHeight = pdfHeight - 20;

        while (currentPage * pageHeight < canvasHeight) {
            if (currentPage > 0) {
                pdf.addPage();
            }
            const y = -(currentPage * pageHeight);
            pdf.addImage(imgData, 'PNG', 10, y, pdfWidth - 20, pdfImageHeight);
            currentPage++;
        }
        
        pdf.save(`reporte-detallado-recetas-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
        toast({ title: 'PDF Descargado', description: 'El reporte detallado de recetas ha sido descargado.' });
    };

    return (
        <AppLayout pageTitle="Reporte Detallado de Recetas">
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold font-headline">Índice de Fórmulas</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/recipes">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver a Recetas
                            </Link>
                        </Button>
                        <Button onClick={handleDownloadPdf}>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar PDF
                        </Button>
                    </div>
                </div>

                <div ref={reportRef} className="p-4 bg-white text-black font-body space-y-8">
                     <header className="flex justify-between items-center mb-4 border-b-2 border-gray-800 pb-2">
                        <div>
                            <h2 className="text-xl font-bold font-headline text-gray-800">Índice de Fórmulas</h2>
                            <p className="text-xs text-gray-500">Alimentos Vollkorn</p>
                        </div>
                        <div className="text-right text-xs">
                           {generationDate && <p><span className="font-semibold">Fecha:</span> {format(generationDate, 'dd-MM-yyyy HH:mm')}</p>}
                        </div>
                    </header>

                    {initialRecipes.map(recipe => {
                        const ingredients = getIngredientDetails(recipe.ingredients);
                        const totalCost = ingredients.reduce((acc, item) => acc + item.totalValue, 0);

                        return (
                            <div key={recipe.id} className="p-4 border rounded-lg break-inside-avoid">
                                <div className="text-sm mb-4">
                                    <p><strong className="w-20 inline-block">FAMILIA:</strong> {recipe.family}</p>
                                    <p><strong className="w-20 inline-block">Código:</strong> {recipe.id}</p>
                                    <p><strong className="w-20 inline-block">Producto:</strong> {recipe.name}</p>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-black font-semibold h-auto p-1">Producto</TableHead>
                                            <TableHead className="text-black font-semibold h-auto p-1">Descripción</TableHead>
                                            <TableHead className="text-black font-semibold h-auto p-1">Clasificación</TableHead>
                                            <TableHead className="text-black font-semibold h-auto p-1 text-center">Unidad</TableHead>
                                            <TableHead className="text-black font-semibold h-auto p-1 text-right">Cantidad</TableHead>
                                            <TableHead className="text-black font-semibold h-auto p-1 text-right">Precio Med</TableHead>
                                            <TableHead className="text-black font-semibold h-auto p-1 text-right">Valor Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ingredients.map((ing, index) => (
                                            <TableRow key={index} className="border-gray-300">
                                                <TableCell className="font-mono text-xs py-1 px-1">{ing.code}</TableCell>
                                                <TableCell className="py-1 px-1">{ing.name}</TableCell>
                                                <TableCell className="py-1 px-1">{ing.classification}</TableCell>
                                                <TableCell className="py-1 px-1 text-center">{ing.unit}</TableCell>
                                                <TableCell className="text-right py-1 px-1">{ing.quantity.toFixed(3)}</TableCell>
                                                <TableCell className="text-right py-1 px-1">${ing.price.toLocaleString('es-CL', {minimumFractionDigits: 2})}</TableCell>
                                                <TableCell className="text-right py-1 px-1 font-semibold">${ing.totalValue.toLocaleString('es-CL')}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                     <TableFooter>
                                        <TableRow className="font-bold">
                                            <TableCell colSpan={6} className="text-right py-1 px-1">Total Costo Receta</TableCell>
                                            <TableCell className="text-right py-1 px-1">${totalCost.toLocaleString('es-CL')}</TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}

