
'use client';

import { useState, useMemo, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { initialRecipes, Recipe } from '@/app/recipes/page';
import { initialInventoryItems } from '@/app/inventory/page';
import { initialOrders as allSalesOrders } from '@/app/sales/page';
import { DateRange } from 'react-day-picker';
import { format, eachDayOfInterval, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Download, FileSpreadsheet, PlusCircle } from 'lucide-react';
import { Label } from './ui/label';
import { DialogFooter } from './ui/dialog';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import Logo from './logo';


export type ProductionNeed = {
    recipe: Recipe;
    inventoryStock: number;
    demands: { date: Date; quantity: number }[];
    totalDemand: number;
    netToProduce: number;
};

type ProductionPlannerProps = {
    onCreateOrders: (needs: ProductionNeed[]) => void;
    onCreateSingleOrder: (productName: string, quantity: number) => void;
};

export default function ProductionPlanner({ onCreateOrders, onCreateSingleOrder }: ProductionPlannerProps) {
    const today = new Date(2025, 8, 1); // Set to Sept 1st for consistency
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: today,
        to: addDays(today, 2),
    });
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();


    const planningDays = useMemo(() => {
        if (!dateRange?.from || !dateRange.to) return [];
        return eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    }, [dateRange]);

    const productionNeeds = useMemo(() => {
        if (planningDays.length === 0) return [];

        const needsMap = new Map<string, ProductionNeed>();

        // Initialize map with all recipes
        initialRecipes.forEach(recipe => {
            const inventoryItem = initialInventoryItems.find(
                invItem => invItem.category === 'Producto Terminado' && invItem.sku === recipe.id
            );
            const inventoryStock = inventoryItem?.stock || 0;

            needsMap.set(recipe.id, {
                recipe,
                inventoryStock,
                demands: planningDays.map(day => ({ date: day, quantity: 0 })),
                totalDemand: 0,
                netToProduce: 0,
            });
        });

        // Populate demands from sales orders
        const pendingSalesOrders = allSalesOrders.filter(order =>
            order.status === 'Pendiente' || order.status === 'En Preparación'
        );

        pendingSalesOrders.forEach(order => {
            const deliveryDate = new Date(order.deliveryDate + 'T00:00:00'); // Ensure local timezone
            const demandDay = planningDays.find(d => format(d, 'yyyy-MM-dd') === format(deliveryDate, 'yyyy-MM-dd'));
            if (demandDay) {
                order.items.forEach(item => {
                    if (needsMap.has(item.recipeId)) {
                        const need = needsMap.get(item.recipeId)!;
                        const dayDemand = need.demands.find(d => d.date === demandDay);
                        if (dayDemand) {
                            dayDemand.quantity += item.quantity;
                        }
                    }
                });
            }
        });
        
        // Calculate totals
        needsMap.forEach(need => {
            need.totalDemand = need.demands.reduce((acc, curr) => acc + curr.quantity, 0);
            need.netToProduce = Math.max(0, need.totalDemand - need.inventoryStock);
        });

        return Array.from(needsMap.values());

    }, [planningDays]);
    
    const totals = useMemo(() => {
        const dailyTotals = planningDays.map(day => 
            productionNeeds.reduce((acc, need) => {
                const dayDemand = need.demands.find(d => format(d.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
                return acc + (dayDemand?.quantity || 0);
            }, 0)
        );
        return dailyTotals;
    }, [productionNeeds, planningDays]);

    const handleCreateOrders = () => {
        const needsToProduce = productionNeeds.filter(n => n.netToProduce > 0);
        onCreateOrders(needsToProduce);
    }
    
    const handleDownloadPdf = async () => {
        const input = reportRef.current;
        if (input) {
            const canvas = await html2canvas(input, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('l', 'px', 'a3');
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

            pdf.addImage(imgData, 'PNG', xOffset, 10, pdfImageWidth, pdfImageHeight);
            pdf.save(`plan-produccion-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
            
            toast({
                title: "PDF Descargado",
                description: "El plan de producción ha sido descargado.",
            });
        }
    };
    
    const handleDownloadExcel = () => {
        const dataForSheet = productionNeeds.map(need => {
            const row: {[key: string]: any} = {
                'Producto': need.recipe.name,
                'Stock Sobrante': need.inventoryStock,
            };
            need.demands.forEach(demand => {
                row[`Pedido ${format(demand.date, 'EEE dd')}`] = demand.quantity || '';
            });
            row['A Producir'] = need.netToProduce || '';
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "PlanProduccion");
        XLSX.writeFile(workbook, `plan-produccion-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);

        toast({
            title: "Excel Descargado",
            description: "El plan de producción ha sido descargado.",
        });
    };

    return (
        <div className="space-y-4 font-body">
             <div ref={reportRef} className="fixed -left-[9999px] top-0 bg-white text-black p-4 font-body" style={{ width: '1600px' }}>
                 <header className="flex justify-between items-start mb-4 border-b-2 border-gray-800 pb-2">
                    <div className="flex items-center gap-3">
                        <Logo className="w-24" />
                        <div>
                            <h1 className="text-xl font-bold font-headline text-gray-800">Planificador de Producción</h1>
                            <p className="text-xs text-gray-500">Panificadora Vollkorn</p>
                        </div>
                    </div>
                     <div className="text-right text-xs">
                         <p><span className="font-semibold">Período:</span> {dateRange?.from ? format(dateRange.from, "P", { locale: es }) : ''} a {dateRange?.to ? format(dateRange.to, "P", { locale: es }) : 'Ahora'}</p>
                     </div>
                </header>
                 <Table className="w-full text-xs">
                    <TableHeader className="bg-gray-100">
                        <TableRow>
                            <TableHead className="p-1 font-bold">Producto</TableHead>
                            <TableHead className="p-1 font-bold text-center">Stock Sobrante</TableHead>
                             {planningDays.map(day => (
                                <TableHead key={day.toISOString()} className="p-1 font-bold text-center">
                                    Pedido {format(day, 'EEE dd', { locale: es })}
                                </TableHead>
                            ))}
                            <TableHead className="p-1 font-bold text-center">A Producir</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {productionNeeds.map(need => (
                            <TableRow key={need.recipe.id}>
                                <TableCell className="p-1">{need.recipe.name}</TableCell>
                                <TableCell className="p-1 text-center">{need.inventoryStock}</TableCell>
                                {need.demands.map((demand, index) => (
                                    <TableCell key={index} className="p-1 text-center">
                                        {demand.quantity > 0 ? demand.quantity : ''}
                                    </TableCell>
                                ))}
                                <TableCell className="p-1 text-center font-bold">{need.netToProduce > 0 ? need.netToProduce : ''}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex flex-wrap items-end gap-4 p-4 border rounded-lg bg-secondary/30">
                <div className="space-y-2">
                    <Label>Rango de Fechas de Entrega a Planificar</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-[300px] justify-start text-left font-normal",
                                    !dateRange && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "LLL dd, y", { locale: es })} -{" "}
                                            {format(dateRange.to, "LLL dd, y", { locale: es })}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y", { locale: es })
                                    )
                                ) : (
                                    <span>Selecciona un rango</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                                locale={es}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                 <div className="flex items-end gap-2">
                    <Button variant="outline" onClick={handleDownloadExcel}><FileSpreadsheet className="mr-2 h-4 w-4" /> Excel</Button>
                    <Button variant="outline" onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" /> PDF</Button>
                </div>
            </div>
            <div className="max-h-[60vh] overflow-auto border rounded-lg">
                <Table>
                    <TableHeader className="sticky top-0 bg-secondary z-10">
                        <TableRow>
                            <TableHead className="w-1/4">Producto</TableHead>
                            <TableHead className="text-center">Stock Sobrante</TableHead>
                            {planningDays.map(day => (
                                <TableHead key={day.toISOString()} className="text-center">
                                    Pedido {format(day, 'EEE dd', { locale: es })}
                                </TableHead>
                            ))}
                            <TableHead className="text-center font-bold text-primary">Cálculo a Producir</TableHead>
                            <TableHead className="text-center">Moldes</TableHead>
                            <TableHead className="text-center">Nº OPs</TableHead>
                            <TableHead className="text-center">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {productionNeeds.length > 0 ? productionNeeds.map(need => (
                            <TableRow key={need.recipe.id}>
                                <TableCell className="font-medium text-xs">{need.recipe.name}</TableCell>
                                <TableCell className="text-center">{need.inventoryStock}</TableCell>
                                {need.demands.map((demand, index) => (
                                    <TableCell key={index} className="text-center">
                                        {demand.quantity > 0 ? demand.quantity : ''}
                                    </TableCell>
                                ))}
                                <TableCell className="text-center font-bold text-primary">
                                    {need.netToProduce > 0 ? need.netToProduce : ''}
                                </TableCell>
                                <TableCell className="text-center">{need.recipe.capacityPerMold || ''}</TableCell>
                                <TableCell className="text-center">
                                     {need.netToProduce > 0 ? (Math.ceil(need.netToProduce / (need.recipe.capacityPerMold || need.netToProduce))) : ''}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onCreateSingleOrder(need.recipe.name, need.netToProduce || 1)}
                                    >
                                        <PlusCircle className="h-4 w-4 text-green-600" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={8 + planningDays.length} className="text-center h-24">
                                    No hay pedidos de venta para el rango seleccionado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                     <tfoot className="sticky bottom-0 bg-secondary z-10">
                        <TableRow className="font-bold">
                            <TableHead>Total Pedidos</TableHead>
                            <TableHead></TableHead>
                            {totals.map((total, index) => (
                                <TableHead key={index} className="text-center">{total > 0 ? total : ''}</TableHead>
                            ))}
                            <TableHead colSpan={4}></TableHead>
                        </TableRow>
                    </tfoot>
                </Table>
            </div>
            <DialogFooter>
                <Button onClick={handleCreateOrders} disabled={productionNeeds.every(n => n.netToProduce === 0)}>
                    Crear Órdenes de Producción Sugeridas
                </Button>
            </DialogFooter>
        </div>
    );
}
