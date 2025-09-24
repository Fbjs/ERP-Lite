
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
    demands: {
        general: { date: Date; quantity: number }[];
        industrial: { date: Date; quantity: number }[];
    };
    totalDemand: number;
    netToProduce: number;
};


type ProductionPlannerProps = {
    onCreateOrders: (needs: ProductionNeed[]) => void;
    onCreateSingleOrder: (productName: string, quantity: number) => void;
};

const INDUSTRIAL_CUSTOMERS = ['SUPERMERCADO DEL SUR'];

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

    const productionNeeds = useMemo((): ProductionNeed[] => {
        if (planningDays.length === 0) return [];

        const needsMap = new Map<string, ProductionNeed>();

        initialRecipes.forEach(recipe => {
            const inventoryItem = initialInventoryItems.find(
                invItem => invItem.category === 'Producto Terminado' && invItem.name.toUpperCase() === recipe.name.toUpperCase()
            );
            const inventoryStock = inventoryItem?.stock || 0;

            needsMap.set(recipe.id, {
                recipe,
                inventoryStock,
                demands: {
                    general: planningDays.map(day => ({ date: day, quantity: 0 })),
                    industrial: planningDays.map(day => ({ date: day, quantity: 0 })),
                },
                totalDemand: 0,
                netToProduce: 0,
            });
        });
        
        const pendingSalesOrders = allSalesOrders.filter(order =>
            order.status === 'Pendiente' || order.status === 'En Preparación'
        );

        pendingSalesOrders.forEach(order => {
            const deliveryDate = new Date(order.deliveryDate + 'T00:00:00');
            const demandDayIndex = planningDays.findIndex(d => format(d, 'yyyy-MM-dd') === format(deliveryDate, 'yyyy-MM-dd'));

            if (demandDayIndex !== -1) {
                const isIndustrial = INDUSTRIAL_CUSTOMERS.includes(order.customer.toUpperCase());
                
                order.items.forEach(item => {
                    if (needsMap.has(item.recipeId)) {
                        const need = needsMap.get(item.recipeId)!;
                        const demandType = isIndustrial ? 'industrial' : 'general';
                        need.demands[demandType][demandDayIndex].quantity += item.quantity;
                    }
                });
            }
        });

        needsMap.forEach(need => {
            const totalGeneralDemand = need.demands.general.reduce((acc, curr) => acc + curr.quantity, 0);
            const totalIndustrialDemand = need.demands.industrial.reduce((acc, curr) => acc + curr.quantity, 0);
            need.totalDemand = totalGeneralDemand + totalIndustrialDemand;
            need.netToProduce = Math.max(0, need.totalDemand - need.inventoryStock);
        });

        return Array.from(needsMap.values()).filter(n => n.totalDemand > 0 || n.inventoryStock > 0);

    }, [planningDays]);
    
    const totals = useMemo(() => {
        const dailyTotals = {
            general: planningDays.map(() => 0),
            industrial: planningDays.map(() => 0),
        };

        productionNeeds.forEach(need => {
            planningDays.forEach((day, index) => {
                dailyTotals.general[index] += need.demands.general[index].quantity;
                dailyTotals.industrial[index] += need.demands.industrial[index].quantity;
            });
        });

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
        const dataForSheet = productionNeeds.flatMap(need => {
             const generalRow: {[key: string]: any} = {
                'Producto': need.recipe.name,
                'Tipo Demanda': 'General',
                'Stock Sobrante': need.inventoryStock,
            };
            const industrialRow: {[key: string]: any} = {
                'Producto': need.recipe.name,
                'Tipo Demanda': 'Industrial',
                'Stock Sobrante': '',
            };
             planningDays.forEach((day, index) => {
                generalRow[`Pedido ${format(day, 'EEE dd')}`] = need.demands.general[index].quantity || '';
                industrialRow[`Pedido ${format(day, 'EEE dd')}`] = need.demands.industrial[index].quantity || '';
            });
            generalRow['A Producir'] = need.netToProduce || '';
            industrialRow['A Producir'] = '';

            return [generalRow, industrialRow];
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
                            <TableHead className="p-1 font-bold w-1/4">Producto</TableHead>
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
                            <>
                            <TableRow key={`${need.recipe.id}-general`} className="bg-blue-50">
                                <TableCell className="p-1 pl-4 text-xs italic">General</TableCell>
                                <TableCell className="p-1 text-center">{need.inventoryStock}</TableCell>
                                {need.demands.general.map((demand, index) => <TableCell key={index} className="p-1 text-center">{demand.quantity > 0 ? demand.quantity : ''}</TableCell>)}
                                <TableCell rowSpan={3} className="p-1 text-center align-middle font-bold text-lg text-blue-600">{need.netToProduce > 0 ? need.netToProduce : ''}</TableCell>
                            </TableRow>
                             <TableRow key={`${need.recipe.id}-industrial`} className="bg-yellow-50">
                                <TableCell className="p-1 pl-4 text-xs italic">Industrial</TableCell>
                                <TableCell className="p-1 text-center"></TableCell>
                                {need.demands.industrial.map((demand, index) => <TableCell key={index} className="p-1 text-center">{demand.quantity > 0 ? demand.quantity : ''}</TableCell>)}
                            </TableRow>
                             <TableRow key={`${need.recipe.id}-total`} className="bg-gray-200 font-bold">
                                <TableCell className="p-1">{need.recipe.name}</TableCell>
                                <TableCell className="p-1 text-center"></TableCell>
                                {planningDays.map((day, index) => <TableCell key={index} className="p-1 text-center">{ (need.demands.general[index].quantity + need.demands.industrial[index].quantity) || '' }</TableCell>)}
                            </TableRow>
                            </>
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
                            <TableHead className="text-center">Stock</TableHead>
                            {planningDays.map(day => (
                                <TableHead key={day.toISOString()} className="text-center">
                                    Pedido {format(day, 'EEE dd', { locale: es })}
                                </TableHead>
                            ))}
                            <TableHead className="text-center font-bold text-primary">A Producir</TableHead>
                            <TableHead className="text-center">Moldes</TableHead>
                            <TableHead className="text-center">OPs</TableHead>
                            <TableHead className="text-center">Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                     <TableBody>
                        {productionNeeds.length > 0 ? productionNeeds.map(need => (
                            <React.Fragment key={need.recipe.id}>
                               <TableRow className="text-sm">
                                    <TableCell className="font-medium text-xs pl-8 italic">General</TableCell>
                                    <TableCell className="text-center">{need.inventoryStock}</TableCell>
                                     {need.demands.general.map((demand, index) => <TableCell key={index} className="text-center">{demand.quantity > 0 ? demand.quantity : ''}</TableCell>)}
                                    <TableCell rowSpan={3} className="text-center align-middle font-bold text-lg text-primary">{need.netToProduce > 0 ? need.netToProduce : ''}</TableCell>
                                    <TableCell rowSpan={3} className="text-center align-middle">{need.recipe.capacityPerMold || ''}</TableCell>
                                    <TableCell rowSpan={3} className="text-center align-middle">{need.netToProduce > 0 ? (Math.ceil(need.netToProduce / (need.recipe.capacityPerMold || need.netToProduce))) : ''}</TableCell>
                                    <TableCell rowSpan={3} className="text-center align-middle">
                                         <Button variant="ghost" size="icon" onClick={() => onCreateSingleOrder(need.recipe.name, need.netToProduce || 1)} disabled={!need.netToProduce || need.netToProduce <= 0}>
                                            <PlusCircle className="h-4 w-4 text-green-600" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow className="text-sm bg-yellow-50/50">
                                    <TableCell className="font-medium text-xs pl-8 italic">Industrial</TableCell>
                                    <TableCell></TableCell>
                                    {need.demands.industrial.map((demand, index) => <TableCell key={index} className="text-center">{demand.quantity > 0 ? demand.quantity : ''}</TableCell>)}
                                </TableRow>
                                <TableRow className="bg-secondary/70">
                                    <TableCell className="font-bold text-xs">{need.recipe.name}</TableCell>
                                    <TableCell></TableCell>
                                    {planningDays.map((day, index) => <TableCell key={index} className="text-center font-bold">{(need.demands.general[index].quantity + need.demands.industrial[index].quantity) || ''}</TableCell>)}
                                </TableRow>
                            </React.Fragment>
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
                            <TableHead>Total General</TableHead>
                            <TableHead></TableHead>
                            {totals.general.map((total, index) => (
                                <TableHead key={index} className="text-center">{total > 0 ? total : ''}</TableHead>
                            ))}
                            <TableHead colSpan={4}></TableHead>
                        </TableRow>
                        <TableRow className="font-bold bg-yellow-50/50">
                            <TableHead>Total Industrial</TableHead>
                            <TableHead></TableHead>
                            {totals.industrial.map((total, index) => (
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
