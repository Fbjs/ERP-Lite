
"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Download, FilePlus, Calendar as CalendarIcon, FileSpreadsheet, AreaChart, Warehouse, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState, useRef, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react';
import ProductionOrderForm, { ProductionOrderData } from '@/components/production-order-form';
import { useToast } from '@/hooks/use-toast';
import { initialRecipes, Recipe } from '@/app/recipes/page';
import { initialInventoryItems } from '@/app/inventory/page';
import Logo from '@/components/logo';
import { initialOrders as allSalesOrders, OrderItem as SalesOrderItem, Order as SalesOrder } from '@/app/sales/page';
import { DateRange } from 'react-day-picker';
import { format, addDays, startOfToday, parseISO, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import ProductionPlanner, { ProductionNeed } from '@/components/production-planner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Link from 'next/link';


export type ProcessControl = {
    hydratedInput: string;
    mixStartDate: string;
    mixEndDate: string;
    waterKg: number;
    waterTemp: number;
    motherMassKg: number;
    motherMassTemp: number;
    doughMixer: string;
    mixStartTime: string;
    slowSpeedMin: number;
    fastSpeedMin: number;
    mixFinishTime: string;
    brothTemp: number;
    doughTemp: number;
    mixObservations: string;
};

export type PortioningControl = {
    startTime: string;
    rawCut1Gr: number;
    rawCut2Gr: number;
    leftoverDoughGr: number;
    endTime: string;
    numCarts: number;
    roomTemp: number;
    observations: string;
};

export type FermentationControl = {
    chamber: string;
    entryTime: string;
    exitTime: string;
    totalTimeMin: number;
    chamberTemp: number;
    chamberRh: number;
};

export type BakingControl = {
    oven: string;
    numFloors: number;
    loadStartTime: string;
    unloadEndTime: string;
    bakingTime: number;
    ovenTemp: number;
    observations: string;
};

export type BakingRecord = {
    ovenTemp: number;
    thermalCenterTemp: number;
    correctiveAction: string;
    verification: string;
    observations: string;
};

export type Waste = {
    type: 'Por Forma' | 'Por Calidad' | 'Otro';
    quantity: number;
    reason: string;
};

export type Order = {
    id: string;
    product: string;
    quantity: number;
    status: 'En Progreso' | 'Completado' | 'En Cola';
    date: string;
    charge: string,
    turn: string,
    operator: string,
    responsibles: {
        fractionation: string,
        production: string,
        cooking: string,
    },
    staff: {
        rut: string;
        name: string;
        startTime: string;
        endTime: string;
    }[];
    processControl: ProcessControl;
    portioningControl: PortioningControl;
    fermentationControl: FermentationControl;
    bakingControl: BakingControl;
    bakingRecord: BakingRecord;
    waste: Waste[];
    salesOrderId?: string;
};


const emptyProcessControl: ProcessControl = {
    hydratedInput: '',
    mixStartDate: '',
    mixEndDate: '',
    waterKg: 0,
    waterTemp: 0,
    motherMassKg: 0,
    motherMassTemp: 0,
    doughMixer: '',
    mixStartTime: '',
    slowSpeedMin: 0,
    fastSpeedMin: 0,
    mixFinishTime: '',
    brothTemp: 0,
    doughTemp: 0,
    mixObservations: ''
};

const emptyPortioningControl: PortioningControl = {
    startTime: '', rawCut1Gr: 0, rawCut2Gr: 0, leftoverDoughGr: 0, endTime: '',
    numCarts: 0, roomTemp: 0, observations: ''
};

const emptyFermentationControl: FermentationControl = {
    chamber: '', entryTime: '', exitTime: '', totalTimeMin: 0, chamberTemp: 0, chamberRh: 0
};

const emptyBakingControl: BakingControl = {
    oven: '', numFloors: 0, loadStartTime: '', unloadEndTime: '', bakingTime: 0,
    ovenTemp: 0, observations: ''
};

const emptyBakingRecord: BakingRecord = {
    ovenTemp: 0, thermalCenterTemp: 0, correctiveAction: '', verification: '', observations: ''
};


export const initialOrders: Order[] = [
  { id: 'PROD021', product: 'PAN LINAZA 500 GRS', quantity: 80, status: 'En Progreso', date: '2025-08-28', charge: 'Amasado', turn: 'Mañana', operator: 'Juan Pérez', responsibles: { fractionation: 'Juan Pérez', production: 'Juan Pérez', cooking: 'Juan Pérez' }, staff: [], processControl: emptyProcessControl, portioningControl: emptyPortioningControl, fermentationControl: emptyFermentationControl, bakingControl: emptyBakingControl, bakingRecord: emptyBakingRecord, waste: [] },
  { id: 'PROD022', product: 'PAN GUAGUA BLANCA 16X16', quantity: 200, status: 'Completado', date: '2025-08-28', charge: 'Amasado', turn: 'Mañana', operator: 'Juan Pérez', responsibles: { fractionation: 'Juan Pérez', production: 'Juan Pérez', cooking: 'Juan Pérez' }, staff: [], processControl: emptyProcessControl, portioningControl: emptyPortioningControl, fermentationControl: emptyFermentationControl, bakingControl: emptyBakingControl, bakingRecord: emptyBakingRecord, waste: [{ type: 'Por Forma', quantity: 10, reason: 'Mal formado' }] },
  { id: 'PROD023', product: 'CRUTONES HOREADOS 1KG 11mm', quantity: 120, status: 'En Cola', date: '2025-08-29', charge: 'Amasado', turn: 'Mañana', operator: 'Juan Pérez', responsibles: { fractionation: 'Juan Pérez', production: 'Juan Pérez', cooking: 'Juan Pérez' }, staff: [], processControl: emptyProcessControl, portioningControl: emptyPortioningControl, fermentationControl: emptyFermentationControl, bakingControl: emptyBakingControl, bakingRecord: emptyBakingRecord, waste: [] },
  { id: 'PROD024', product: 'TOSTADAS CROSTINI OREGANO', quantity: 150, status: 'En Progreso', date: '2025-08-28', charge: 'Amasado', turn: 'Mañana', operator: 'Juan Pérez', responsibles: { fractionation: 'Juan Pérez', production: 'Juan Pérez', cooking: 'Juan Pérez' }, staff: [], processControl: emptyProcessControl, portioningControl: emptyPortioningControl, fermentationControl: emptyFermentationControl, bakingControl: emptyBakingControl, bakingRecord: emptyBakingRecord, waste: [] },
];

// Simulamos la capacidad máxima de unidades por orden de producción
const MAX_UNITS_PER_PRODUCTION_ORDER = 200;


const ProductionPage = forwardRef(({handleOpenFormProp, prefilledProduct}: {handleOpenFormProp?: (order: Order | null, product?: string) => void, prefilledProduct?: string}, ref) => {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isPlannerModalOpen, setPlannerModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [prefilledData, setPrefilledData] = useState<{product?: string, quantity?: number}>({});
    const detailsModalContentRef = useRef<HTMLDivElement>(null);
    const reportContentRef = useRef<HTMLDivElement>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const { toast } = useToast();
    
    useImperativeHandle(ref, () => ({
        handleOpenForm: (order: Order | null, product?: string, quantity?: number) => {
            handleOpenForm(order, product, quantity);
        }
    }));

    useEffect(() => {
        if(prefilledProduct && handleOpenFormProp){
            handleOpenFormProp(null, prefilledProduct)
        }
    },[prefilledProduct, handleOpenFormProp]);
    
    useEffect(() => {
        setDateRange({
            from: subMonths(new Date(), 1),
            to: new Date()
        });
    }, []);

    const filteredOrders = useMemo(() => {
        if (!dateRange?.from) return orders;
        const fromDate = dateRange.from;
        const toDate = dateRange.to || fromDate;

        return orders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= fromDate && orderDate <= toDate;
        });
    }, [orders, dateRange]);


    const selectedOrderRecipe = useMemo(() => {
        if (!selectedOrder) return null;
        return initialRecipes.find(r => r.name === selectedOrder.product) || null;
    }, [selectedOrder]);

    const requiredMaterials = useMemo(() => {
        if (!selectedOrder || !selectedOrderRecipe) return [];
        
        return selectedOrderRecipe.ingredients.map(ingredient => {
            const inventoryItem = initialInventoryItems.find(item => item.name.toLowerCase() === ingredient.name.toLowerCase());
            return {
                sku: inventoryItem?.sku || 'N/A',
                name: ingredient.name,
                requiredQuantity: ingredient.quantity * selectedOrder.quantity,
                unit: ingredient.unit,
                category: inventoryItem?.category || 'N/A',
                availableStock: inventoryItem?.stock || 0,
            };
        });

    }, [selectedOrder, selectedOrderRecipe]);
    
    const handleOpenDetails = (order: Order) => {
        setSelectedOrder(order);
        setDetailsModalOpen(true);
    };

    const handleOpenForm = (order: Order | null, product?: string, quantity?: number) => {
        setSelectedOrder(order);
        setPrefilledData({ product, quantity });
        setFormModalOpen(true);
    };

    const handleFormSubmit = (data: ProductionOrderData) => {
        if (selectedOrder) {
            // Editing existing order
            const updatedOrder: Order = { ...selectedOrder, ...data };
            setOrders(orders.map(o => o.id === selectedOrder.id ? updatedOrder : o));
            toast({
                title: "Orden Actualizada",
                description: `La orden de producción ${selectedOrder.id} ha sido actualizada.`,
            });

             if (updatedOrder.status === 'Completado' && selectedOrder.status !== 'Completado') {
                toast({
                    title: "Simulación de Inventario",
                    description: `El stock del producto terminado '${updatedOrder.product}' y sus materias primas ha sido actualizado.`,
                });
            }

        } else {
            // Creating new order
            const newOrder: Order = {
                id: `PROD${Date.now() % 1000}`,
                date: new Date().toISOString().split('T')[0],
                ...data,
            };
            setOrders(prev => [newOrder, ...prev]);
            toast({
                title: "Orden Creada",
                description: `La orden para ${newOrder.quantity}x ${newOrder.product} ha sido creada.`,
            });
        }
        setFormModalOpen(false);
        setSelectedOrder(null);
        setPrefilledData({});
    };

     const handleCreateOrdersFromPlanner = (needs: ProductionNeed[]) => {
        const newOrders: Order[] = [];
        const productionDate = format(new Date(), 'yyyy-MM-dd');

        // Create a single placeholder sales order for this production batch
        const newSalesOrderId = `SALE-PROD-${Date.now()}`;
        const newSalesOrder: SalesOrder = {
            id: newSalesOrderId,
            customerId: 'INTERNAL-PROD',
            locationId: 'BODEGA-CENTRAL',
            customer: 'Producción Interna (Planificador)',
            amount: 0, // Amount can be calculated later or irrelevant for internal
            status: 'Completado', // Marked as completed as it's an internal order
            date: productionDate,
            deliveryDate: productionDate,
            deliveryAddress: 'Bodega Principal',
            items: [],
            dispatcher: 'SISTEMA',
            comments: `Orden de venta generada automáticamente desde el planificador de producción.`
        };

        needs.forEach(need => {
            if (need.netToProduce > 0) {
                 const capacity = need.recipe.capacityPerMold || need.netToProduce;
                 let remainingToProduce = need.netToProduce;
                 
                 while(remainingToProduce > 0) {
                     const quantityForThisOrder = Math.min(remainingToProduce, capacity);
                     
                     const newOrder: Order = {
                        id: `PROD${Date.now() % 1000}-${Math.random()}`,
                        product: need.recipe.name,
                        quantity: quantityForThisOrder,
                        status: 'En Cola',
                        date: productionDate,
                        charge: '', turn: '', operator: '',
                        responsibles: { fractionation: '', production: '', cooking: '' },
                        staff: [], processControl: emptyProcessControl, portioningControl: emptyPortioningControl,
                        fermentationControl: emptyFermentationControl, bakingControl: emptyBakingControl,
                        bakingRecord: emptyBakingRecord, waste: [],
                        salesOrderId: newSalesOrderId,
                    };
                    newOrders.push(newOrder);

                    // Add item to the master sales order
                    const recipeFormat = need.recipe.formats[0];
                    if (recipeFormat) {
                        newSalesOrder.items.push({
                            recipeId: need.recipe.id,
                            formatSku: recipeFormat.sku,
                            quantity: quantityForThisOrder,
                            lote: '',
                        });
                        newSalesOrder.amount += quantityForThisOrder * recipeFormat.cost;
                    }
                    remainingToProduce -= quantityForThisOrder;
                 }
            }
        });

        if (newOrders.length > 0) {
            setOrders(prev => [...newOrders, ...prev]);
            // In a real app, you would also save the newSalesOrder to your sales data state
            console.log("Generated linked sales order:", newSalesOrder);
            toast({
                title: `${newOrders.length} Órdenes de Producción Creadas`,
                description: `Las órdenes se han añadido a la cola y se ha generado la orden de venta ${newSalesOrderId}.`
            });
        } else {
             toast({
                title: 'No se Requieren Órdenes Nuevas',
                description: 'La demanda para el período seleccionado puede ser cubierta con el stock disponible.'
            });
        }
        setPlannerModalOpen(false);
    };
    
    const handleCreateSingleOrderFromPlanner = (productName: string, quantity: number) => {
        setPlannerModalOpen(false);
        // A short delay to allow the planner modal to close before opening the form modal
        setTimeout(() => {
            handleOpenForm(null, productName, quantity);
        }, 100);
    };


    const handleDownloadPdf = async () => {
        const input = detailsModalContentRef.current;
        if (input) {
            const { default: jsPDF } = await import('jspdf');
            const { default: html2canvas } = await import('html2canvas');
            
            const canvas = await html2canvas(input, { scale: 2, backgroundColor: null });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'px', 'a4');
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
            pdf.save(`orden-${selectedOrder?.id}.pdf`);

            toast({
                title: "PDF Descargado",
                description: `La orden de producción ${selectedOrder?.id} ha sido descargada.`,
            });
        }
    };
    
    const handleExportExcel = () => {
        const dataForSheet = filteredOrders.map(o => ({
            'ID Orden': o.id,
            'Producto': o.product,
            'Cantidad': o.quantity,
            'Estado': o.status,
            'Fecha': format(parseISO(o.date), 'P', { locale: es }),
            'Turno': o.turn,
            'Operador': o.operator,
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Produccion");
        XLSX.writeFile(workbook, `reporte-produccion-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);

        toast({ title: "Archivo Generado", description: "Se ha exportado el reporte de producción a Excel." });
    };


  return (
    <AppLayout pageTitle="Producción">
        <div ref={reportContentRef} className="fixed -left-[9999px] top-0 bg-white text-black p-8 font-body" style={{ width: '8.5in', minHeight: '11in'}}>
          <header className="flex justify-between items-center mb-8 border-b-2 border-gray-800 pb-4">
              <div>
                  <h1 className="text-3xl font-bold font-headline text-gray-800">Reporte de Producción</h1>
                  <p className="text-sm text-gray-500">Panificadora Vollkorn</p>
              </div>
          </header>

          <main>
              <Table className="w-full text-sm">
                  <TableHeader className="bg-gray-100">
                      <TableRow>
                          <TableHead className="text-left font-bold text-gray-700 uppercase p-3">ID Orden</TableHead>
                          <TableHead className="text-left font-bold text-gray-700 uppercase p-3">Producto</TableHead>
                          <TableHead className="text-right font-bold text-gray-700 uppercase p-3">Cantidad</TableHead>
                          <TableHead className="text-left font-bold text-gray-700 uppercase p-3">Estado</TableHead>
                          <TableHead className="text-left font-bold text-gray-700 uppercase p-3">Fecha</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {filteredOrders.map((order) => (
                          <TableRow key={order.id} className="border-b border-gray-200">
                              <TableCell className="p-3">{order.id}</TableCell>
                              <TableCell className="p-3">{order.product}</TableCell>
                              <TableCell className="text-right p-3">{order.quantity}</TableCell>
                              <TableCell className="p-3">{order.status}</TableCell>
                              <TableCell className="p-3">{new Date(order.date + 'T00:00:00').toLocaleDateString('es-CL', { timeZone: 'UTC' })}</TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </main>
          <footer className="text-center text-xs text-gray-400 border-t pt-4 mt-8">
              <p>Reporte generado por Vollkorn ERP.</p>
          </footer>
      </div>

      <Card>
        <CardHeader>
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <CardTitle className="font-headline">Órdenes de Producción</CardTitle>
                    <CardDescription className="font-body">Rastrea y gestiona las órdenes de producción.</CardDescription>
                </div>
                 <div className="flex items-center gap-2">
                    <Button asChild variant="secondary">
                        <Link href="/inventory">
                            <Warehouse className="mr-2 h-4 w-4" />
                            Ver Inventario
                        </Link>
                    </Button>
                     <Button asChild variant="secondary">
                        <Link href="/production/waste-report">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Reporte de Mermas
                        </Link>
                    </Button>
                    <Button asChild variant="secondary">
                        <Link href="/production/consumption-report">
                            <AreaChart className="mr-2 h-4 w-4" />
                            Reporte de Consumo
                        </Link>
                    </Button>
                    <Button variant="outline" onClick={() => setPlannerModalOpen(true)}>
                        <FilePlus className="mr-2 h-4 w-4" />
                        Planificador de Producción
                    </Button>
                    <Button onClick={() => handleOpenForm(null)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nueva Orden Manual
                    </Button>
                </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
                 <div className="flex-1 min-w-[280px]">
                    <Label>Rango de Fechas</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
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
                     <Button variant="outline" onClick={handleExportExcel} disabled={filteredOrders.length === 0}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                    </Button>
                    <Button variant="outline" onClick={handleDownloadPdf} disabled={filteredOrders.length === 0}>
                        <Download className="mr-2 h-4 w-4" /> PDF
                    </Button>
                 </div>
            </div>
        </CardHeader>
        <CardContent>
          <Table className="responsive-table">
            <TableHeader>
              <TableRow>
                <TableHead>ID de Orden</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell data-label="ID de Orden" className="font-medium">{order.id}</TableCell>
                  <TableCell data-label="Producto">{order.product}</TableCell>
                  <TableCell data-label="Cantidad">{order.quantity}</TableCell>
                  <TableCell data-label="Estado">
                    <Badge variant={order.status === 'Completado' ? 'default' : order.status === 'En Progreso' ? 'secondary' : 'outline'}>{order.status}</Badge>
                  </TableCell>
                  <TableCell data-label="Fecha">{new Date(order.date + 'T00:00:00').toLocaleDateString('es-CL', { timeZone: 'UTC' })}</TableCell>
                   <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenDetails(order)}>Ver Ficha</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenForm(order)}>Editar Orden</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Nueva/Editar Orden */}
      <Dialog open={isFormModalOpen} onOpenChange={(isOpen) => {
            if (!isOpen) {
                setSelectedOrder(null);
                 setPrefilledData({});
            }
            setFormModalOpen(isOpen);
      }}>
        <DialogContent className="sm:max-w-4xl p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="font-headline">{selectedOrder ? 'Editar Orden de Producción' : 'Crear Nueva Orden de Producción'}</DialogTitle>
            <DialogDescription className="font-body">
              {selectedOrder ? `Editando la orden ${selectedOrder.id}` : 'Completa los detalles para crear una nueva orden.'}
            </DialogDescription>
          </DialogHeader>
          <ProductionOrderForm
            onSubmit={handleFormSubmit}
            onCancel={() => { setFormModalOpen(false); setSelectedOrder(null); setPrefilledData({}); }}
            initialData={selectedOrder}
            prefilledData={prefilledData}
            />
        </DialogContent>
      </Dialog>

       {/* Modal Planificador de Producción */}
      <Dialog open={isPlannerModalOpen} onOpenChange={setPlannerModalOpen}>
        <DialogContent className="max-w-7xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Planificador de Producción Diaria</DialogTitle>
            <DialogDescription className="font-body">
                Revisa la demanda de los pedidos de venta y el stock disponible para calcular las necesidades de producción.
            </DialogDescription>
          </DialogHeader>
          <ProductionPlanner 
            onCreateOrders={handleCreateOrdersFromPlanner}
            onCreateSingleOrder={handleCreateSingleOrderFromPlanner}
          />
        </DialogContent>
      </Dialog>


      {/* Modal Ver Detalles */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setDetailsModalOpen}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="font-headline">Detalle de Orden: {selectedOrder?.id}</DialogTitle>
                    <DialogDescription className="font-body">
                        Creada el {selectedOrder ? new Date(selectedOrder.date + 'T00:00:00').toLocaleString('es-CL', { timeZone: 'UTC', dateStyle: 'long' }) : ''}
                    </DialogDescription>
                </DialogHeader>
                {selectedOrder && (
                    <div className="max-h-[75vh] overflow-y-auto p-1">
                        <div ref={detailsModalContentRef} className="p-6 bg-white text-black font-body text-xs space-y-2" style={{ width: '8.5in', minHeight: '11in'}}>
                            <header className="flex justify-between items-start mb-4 border-b-2 border-gray-800 pb-2">
                                <div className="flex items-center gap-3">
                                    <Logo className="w-28 text-orange-600" />
                                    <div>
                                        <h1 className="text-xl font-bold font-headline text-gray-800">Alimentos Vollkorn</h1>
                                        <p className="text-xs text-gray-500">Casa Matriz</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-2xl font-headline font-bold uppercase text-gray-700">Orden de Producción</h2>
                                    <p className="text-sm text-gray-600 font-semibold">Nº: {selectedOrder.id}</p>
                                </div>
                            </header>

                             {/* DETALLES DE ORDEN */}
                            <div className="border border-gray-400 p-2 rounded-md grid grid-cols-2 gap-x-4">
                                <div>
                                    <p><span className="font-semibold">Producto a Fabricar:</span> {selectedOrder.product}</p>
                                    <p><span className="font-semibold">Clasificación:</span> Producto Terminado</p>
                                    <p><span className="font-semibold">Cantidad:</span> {selectedOrder.quantity} unidades</p>
                                    {selectedOrder.salesOrderId && <p><span className="font-semibold">Orden de Venta:</span> {selectedOrder.salesOrderId}</p>}
                                </div>
                                <div className="text-right">
                                    <p><span className="font-semibold">Fecha:</span> {new Date(selectedOrder.date + 'T00:00:00').toLocaleDateString('es-CL', { timeZone: 'UTC' })}</p>
                                    <p><span className="font-semibold">Hora:</span> {new Date(selectedOrder.date + 'T00:00:00').toLocaleTimeString('es-CL', { timeZone: 'UTC' })}</p>
                                </div>
                            </div>

                             {/* MATERIALES REQUERIDOS */}
                            <div className="border border-gray-400 p-2 rounded-md">
                                <h3 className="text-sm font-bold text-center mb-2 font-headline">LISTA DE MATERIALES</h3>
                                {selectedOrderRecipe ? (
                                    <Table className="w-full text-xs">
                                        <TableHeader><TableRow>
                                            <TableHead className="text-left font-bold text-gray-700 h-6 px-1">Código</TableHead>
                                            <TableHead className="text-left font-bold text-gray-700 h-6 px-1">Descripción</TableHead>
                                            <TableHead className="text-right font-bold text-gray-700 h-6 px-1">Unidad</TableHead>
                                            <TableHead className="text-left font-bold text-gray-700 h-6 px-1">Clasificación</TableHead>
                                            <TableHead className="text-right font-bold text-gray-700 h-6 px-1">Cantidad</TableHead>
                                        </TableRow></TableHeader>
                                        <TableBody>
                                            {requiredMaterials.map(material => (
                                                <TableRow key={material.sku}>
                                                    <TableCell className="py-1 px-1">{material.sku}</TableCell>
                                                    <TableCell className="py-1 px-1">{material.name}</TableCell>
                                                    <TableCell className="text-right py-1 px-1">{material.unit}</TableCell>
                                                    <TableCell className="py-1 px-1">{material.category}</TableCell>
                                                    <TableCell className="text-right py-1 px-1">{material.requiredQuantity.toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-center text-gray-500 py-4">No se encontró una receta para este producto.</p>
                                )}
                            </div>

                             {/* DOTACION DE PERSONAL */}
                            <div className="border border-gray-400 p-2 rounded-md">
                                <h3 className="text-sm font-bold text-center mb-2 font-headline">DOTACIÓN DE PERSONAL</h3>
                                 <Table className="w-full text-xs">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-left font-bold text-gray-700 h-6 px-1">Rut/Sec</TableHead>
                                            <TableHead className="text-left font-bold text-gray-700 h-6 px-1">Ap. Paterno</TableHead>
                                            <TableHead className="text-left font-bold text-gray-700 h-6 px-1">Ap. Materno</TableHead>
                                            <TableHead className="text-left font-bold text-gray-700 h-6 px-1">Nombres</TableHead>
                                            <TableHead className="text-right font-bold text-gray-700 h-6 px-1">Hora Inicio</TableHead>
                                            <TableHead className="text-right font-bold text-gray-700 h-6 px-1">Hora Término</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[...Array(4)].map((_, i) => (
                                             <TableRow key={i}>
                                                <TableCell className="py-2 border-b"><div className="h-4"></div></TableCell>
                                                <TableCell className="py-2 border-b"><div className="h-4"></div></TableCell>
                                                <TableCell className="py-2 border-b"><div className="h-4"></div></TableCell>
                                                <TableCell className="py-2 border-b"><div className="h-4"></div></TableCell>
                                                <TableCell className="py-2 border-b"><div className="h-4"></div></TableCell>
                                                <TableCell className="py-2 border-b"><div className="h-4"></div></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            
                            {/* MEZCLADO - AMASADO */}
                             <div className="border border-gray-400 p-2 rounded-md mt-4">
                                <h3 className="text-sm font-bold text-center mb-2 font-headline">REGISTRO DE CONTROL DE PROCESO</h3>
                                <h4 className="font-semibold font-headline">MEZCLADO - AMASADO</h4>
                                <div className="grid grid-cols-4 gap-x-4 gap-y-1">
                                    <div className="col-span-1"><p className="font-semibold">Insumo Hidratado:</p><div className="border-b h-4"></div></div>
                                    <div className="col-span-1"><p className="font-semibold">Hora y Fecha Inicio:</p><div className="border-b h-4"></div></div>
                                    <div className="col-span-1"><p className="font-semibold">Hora de Término:</p><div className="border-b h-4"></div></div>
                                    <div className="col-span-1"><p className="font-semibold">Agua (Kg):</p><div className="border-b h-4"></div></div>
                                </div>
                                <div className="grid grid-cols-4 gap-x-4 gap-y-1 mt-1">
                                    <div className="col-span-1"><p className="font-semibold">T° Agua (°C):</p><div className="border-b h-4"></div></div>
                                    <div className="col-span-3 grid grid-cols-2 gap-x-4">
                                        <div className="space-y-1"><p className="font-semibold">Masa Madre:</p><div className="border-b h-4"></div></div>
                                        <div className="space-y-1"><p className="font-semibold">T° Masa Madre (°C):</p><div className="border-b h-4"></div></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-5 gap-x-2 gap-y-1 mt-2 border-t pt-1">
                                     <div className="col-span-1"><p className="font-semibold">Amasadora:</p><div className="border-b h-4"></div></div>
                                     <div className="col-span-1"><p className="font-semibold">Hora Inicio:</p><div className="border-b h-4"></div></div>
                                     <div className="col-span-1"><p className="font-semibold">Vel. Lenta (min):</p><div className="border-b h-4"></div></div>
                                     <div className="col-span-1"><p className="font-semibold">Vel. Rápida (min):</p><div className="border-b h-4"></div></div>
                                     <div className="col-span-1"><p className="font-semibold">Hora Término:</p><div className="border-b h-4"></div></div>
                                     <div className="col-span-1"><p className="font-semibold">T° Caldo (°C):</p><div className="border-b h-4"></div></div>
                                     <div className="col-span-1"><p className="font-semibold">T° Masa (°C):</p><div className="border-b h-4"></div></div>
                                </div>
                                <div className="mt-1"><p className="font-semibold">Observaciones:</p><div className="border-b h-4"></div></div>
                            </div>
                            
                            {/* PORCIONADO / FORMADO */}
                            <div className="border border-gray-400 p-2 rounded-md">
                                <h4 className="font-semibold font-headline">PORCIONADO - OVILLADO - FORMADO - MOLDEADO</h4>
                                <div className="grid grid-cols-4 gap-x-4 gap-y-1">
                                    <div><p className="font-semibold">Hora Inicio:</p><div className="border-b h-4"></div></div>
                                    <div><p className="font-semibold">Corte Crudo 1 (gr):</p><div className="border-b h-4"></div></div>
                                    <div><p className="font-semibold">Corte Crudo 2 (gr):</p><div className="border-b h-4"></div></div>
                                    <div><p className="font-semibold">Masa Sobrante (gr):</p><div className="border-b h-4"></div></div>
                                    <div><p className="font-semibold">Hora Término:</p><div className="border-b h-4"></div></div>
                                    <div><p className="font-semibold">N° de Carros:</p><div className="border-b h-4"></div></div>
                                    <div><p className="font-semibold">T° Sala (°C):</p><div className="border-b h-4"></div></div>
                                </div>
                                <div className="mt-1"><p className="font-semibold">Observaciones:</p><div className="border-b h-4"></div></div>
                            </div>
                            
                            {/* FERMENTADO */}
                             <div className="border border-gray-400 p-2 rounded-md">
                                <h4 className="font-semibold font-headline">FERMENTADO</h4>
                                <div className="grid grid-cols-4 gap-x-4 gap-y-1">
                                    <div><p className="font-semibold">Cámara:</p><div className="border-b h-4"></div></div>
                                    <div><p className="font-semibold">Hora Entrada:</p><div className="border-b h-4"></div></div>
                                    <div><p className="font-semibold">Hora Salida:</p><div className="border-b h-4"></div></div>
                                    <div><p className="font-semibold">Tiempo Total (Min):</p><div className="border-b h-4"></div></div>
                                    <div className="col-span-2"><p className="font-semibold">Cámara T°C / HR (%):</p><div className="border-b h-4"></div></div>
                                </div>
                            </div>

                            {/* HORNEADO */}
                            <div className="border border-gray-400 p-2 rounded-md">
                                <h4 className="font-semibold font-headline">HORNEADO</h4>
                                <div className="grid grid-cols-4 gap-x-4 gap-y-1">
                                     <div><p className="font-semibold">Horno:</p><div className="border-b h-4"></div></div>
                                     <div><p className="font-semibold">N° de Pisos:</p><div className="border-b h-4"></div></div>
                                     <div><p className="font-semibold">Hora Inicio Carga:</p><div className="border-b h-4"></div></div>
                                     <div><p className="font-semibold">Hora Término Descarga:</p><div className="border-b h-4"></div></div>
                                     <div className="col-span-2"><p className="font-semibold">Tiempo Cocción / T° Horno:</p><div className="border-b h-4"></div></div>
                                </div>
                                <div className="mt-1"><p className="font-semibold">Observaciones:</p><div className="border-b h-4"></div></div>
                            </div>

                            {/* REGISTRO HORNEO (PCC2) */}
                            <div className="border border-gray-400 p-2 rounded-md">
                                <h4 className="font-semibold font-headline">REGISTRO HORNEO (PCC2)</h4>
                                <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                                     <div><p className="font-semibold">T° Horno (°C):</p><div className="border-b h-4"></div></div>
                                     <div><p className="font-semibold">T° Centro Térmico (°C):</p><div className="border-b h-4"></div></div>
                                     <div><p className="font-semibold">Acción Correctiva:</p><div className="border-b h-4"></div></div>
                                </div>
                                <div className="mt-1"><p className="font-semibold">Verificación:</p><div className="border-b h-4"></div></div>
                                <div className="mt-1"><p className="font-semibold">Observaciones:</p><div className="border-b h-4"></div></div>
                            </div>
                             {/* CONTROL DE MERMAS */}
                            {selectedOrder.waste.length > 0 && (
                                <div className="border border-gray-400 p-2 rounded-md">
                                    <h3 className="text-sm font-bold text-center mb-2 font-headline">CONTROL DE MERMAS</h3>
                                    <Table className="w-full text-xs">
                                        <TableHeader><TableRow>
                                            <TableHead className="text-left font-bold text-gray-700 h-6 px-1">Tipo</TableHead>
                                            <TableHead className="text-right font-bold text-gray-700 h-6 px-1">Cantidad</TableHead>
                                            <TableHead className="text-left font-bold text-gray-700 h-6 px-1">Razón</TableHead>
                                        </TableRow></TableHeader>
                                        <TableBody>
                                            {selectedOrder.waste.map((w, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="py-1 px-1">{w.type}</TableCell>
                                                    <TableCell className="text-right py-1 px-1">{w.quantity}</TableCell>
                                                    <TableCell className="py-1 px-1">{w.reason}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {/* FIRMAS */}
                            <footer className="grid grid-cols-2 gap-4 mt-12 text-center">
                                 <div>
                                    <div className="border-t-2 border-gray-400 pt-2 w-48 mx-auto">
                                        <p className="font-semibold text-gray-700">V.B. Supervisor</p>
                                    </div>
                                </div>
                                <div>
                                    <div className="border-t-2 border-gray-400 pt-2 w-48 mx-auto">
                                        <p className="font-semibold text-gray-700">V.B. Jefe de Turno</p>
                                    </div>
                                </div>
                            </footer>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>Cerrar</Button>
                    <Button onClick={handleDownloadPdf}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </AppLayout>
  );
})

ProductionPage.displayName = 'ProductionPage';

export default ProductionPage;
