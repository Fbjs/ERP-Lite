
"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Download, Calendar as CalendarIcon, DollarSign, FileCheck, Clock, Ban, Truck, FileBarChart, NotebookText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState, useRef, useMemo, useEffect } from 'react';
import SalesOrderForm, { OrderFormData } from '@/components/sales-order-form';
import { Recipe, initialRecipes } from '@/app/recipes/page';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, subMonths, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initialCustomers } from '@/app/admin/customers/page';
import Logo from '@/components/logo';

export type OrderItem = {
  recipeId: string;
  formatSku: string;
  quantity: number;
};

export type Order = {
  id: string;
  customer: string;
  amount: number;
  status: 'Completado' | 'Pendiente' | 'Enviado' | 'Cancelado' | 'En Preparación';
  date: string;
  deliveryDate: string;
  items: OrderItem[];
  dispatcher: string;
  comments: string;
};

export type SalespersonRequestItem = {
    client: string;
    product: string;
    quantity: number;
    type: string; // Corresponde a la columna TIPO del reporte (ej: PROD, MERMA)
    itemType: string; // Corresponde a la columna ITEM del reporte (ej: FACT, BOLETA, CONFIRMADO)
    deliveryAddress: string;
    comments: string;
};

export type SalespersonRequest = {
  id: string;
  salesperson: string; // Corresponde a 'Responsable'
  deliveryPerson: string; // Corresponde a 'Entrega'
  responsiblePerson: string; // Corresponde a 'Registro del'
  date: string; // F. PEDIDO
  deliveryDate: string; // F. ENTREGA
  status: 'Pendiente' | 'Despachado';
  items: SalespersonRequestItem[];
  // Simulación de valor para el resumen
  amount: number;
};


export const initialOrders: Order[] = [
    { id: 'SALE881', customer: 'Cafe Central', amount: 270000, status: 'Completado', date: '2025-07-27', deliveryDate: '2025-07-28', items: [{ recipeId: 'TIPA0500', formatSku: 'TIPA0500-40K', quantity: 75 }], dispatcher: 'RENE', comments: 'Entregar por acceso de servicio.' },
    { id: 'SALE882', customer: 'Supermercado del Sur', amount: 820000, status: 'Pendiente', date: '2025-07-28', deliveryDate: '2025-07-30', items: [{ recipeId: 'CRUT11MM', formatSku: 'CRUT11MM-U10', quantity: 200 }], dispatcher: 'MARCELO', comments: '' },
    { id: 'SALE883', customer: 'Panaderia San Jose', amount: 330000, status: 'Enviado', date: '2025-07-28', deliveryDate: '2025-07-29', items: [{ recipeId: 'GUABCO16', formatSku: 'GUABCO16-9.5', quantity: 80 }], dispatcher: 'RENE', comments: 'Horario de entrega estricto: 8am-10am' },
    { id: 'SALE884', customer: 'Cafe Central', amount: 150000, status: 'Cancelado', date: '2025-07-29', deliveryDate: '2025-07-30', items: [{ recipeId: 'CERE0003', formatSku: 'CERE0003-500G', quantity: 30 }], dispatcher: 'RENE', comments: 'Cliente cancela por sobrestock.' },
    { id: 'SALE885', customer: 'Supermercado del Sur', amount: 550000, status: 'En Preparación', date: '2025-07-30', deliveryDate: '2025-08-01', items: [{ recipeId: 'GUAINT16', formatSku: 'GUAINT16-7', quantity: 120 }], dispatcher: 'MARCELO', comments: 'Preparar en cajas especiales.' },
    { id: 'SALE886', customer: 'Panaderia San Jose', amount: 184000, status: 'Pendiente', date: '2025-07-31', deliveryDate: '2025-08-02', items: [{ recipeId: 'RALLADBCO', formatSku: 'RALLADBCO-10K', quantity: 40 }], dispatcher: 'RENE', comments: '' },
    { id: 'SALE887', customer: 'Cafe Central', amount: 440000, status: 'Enviado', date: '2025-07-31', deliveryDate: '2025-08-01', items: [{ recipeId: 'GUIN1432', formatSku: 'GUIN1432-1K', quantity: 100 }], dispatcher: 'MARCELO', comments: 'Facturar a RUT diferente.' },
    { id: 'SALE888', customer: 'Supermercado del Sur', amount: 615000, status: 'Completado', date: '2025-08-01', deliveryDate: '2025-08-02', items: [{ recipeId: 'GUBL1332', formatSku: 'GUBL1332-11', quantity: 150 }], dispatcher: 'RENE', comments: '' },
    { id: 'SALE889', customer: 'Panaderia San Jose', amount: 205000, status: 'Pendiente', date: '2025-08-02', deliveryDate: '2025-08-04', items: [{ recipeId: 'GUABCO16', formatSku: 'GUABCO16-9.5', quantity: 50 }], dispatcher: 'RENE', comments: '' },
    { id: 'SALE890', customer: 'Supermercado del Sur', amount: 984000, status: 'En Preparación', date: '2025-08-02', deliveryDate: '2025-08-05', items: [{ recipeId: 'CRUT11MM', formatSku: 'CRUT11MM-U10', quantity: 240 }], dispatcher: 'MARCELO', comments: 'Necesita 2 guías de despacho.' },
    { id: 'SALE891', customer: 'Cafe Central', amount: 123000, status: 'Pendiente', date: '2025-08-03', deliveryDate: '2025-08-04', items: [{ recipeId: 'CERE0003', formatSku: 'CERE0003-500G', quantity: 25 }], dispatcher: 'RENE', comments: '' },
];

export const initialSalespersonRequests: SalespersonRequest[] = [
    { id: 'PED001', salesperson: 'FRANCISCA', deliveryPerson: 'RODRIGO', responsiblePerson: 'FRANCISCA', date: '2025-08-29', deliveryDate: '2025-08-29', status: 'Despachado', items: [
        { client: 'LORENA AGUILAR', product: 'GUAGUA INTEGRAL 13X13', quantity: 94, type: 'MERMA', itemType: 'BOLETA', deliveryAddress: 'AGREGAR COSTO DE DESPACHO (SI ES MENOR A 30.000 LA FACTURA)', comments: 'Entregar de 9 a 12'},
        { client: 'LORENA AGUILAR', product: 'PAN SIN GLUTEN', quantity: 20, type: 'MERMA', itemType: 'BOLETA', deliveryAddress: 'AGREGAR COSTO DE DESPACHO (SI ES MENOR A 30.000 LA FACTURA)', comments: ''},
    ], amount: 350000},
    { id: 'PED002', salesperson: 'VENDEDOR 2', deliveryPerson: 'MARCELO', responsiblePerson: 'VENDEDOR 2', date: '2025-07-29', deliveryDate: '2025-07-30', status: 'Pendiente', items: [
        { client: 'BETTER FOOD', product: 'CRUTONES 7mm', quantity: 10, type: 'PROD', itemType: 'FACTURA', deliveryAddress: 'Av. Vitacura 5000', comments: '' }
    ], amount: 80000},
];


export default function SalesPage() {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [salespersonRequests, setSalespersonRequests] = useState<SalespersonRequest[]>(initialSalespersonRequests);
    const [recipes] = useState<Recipe[]>(initialRecipes);
    const [isNewOrderModalOpen, setNewOrderModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isUpdateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [updatedStatus, setUpdatedStatus] = useState<Order['status']>('Pendiente');
    const detailsModalContentRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [requestDateRange, setRequestDateRange] = useState<DateRange | undefined>(undefined);

    useEffect(() => {
        // Set initial date ranges only on the client to avoid hydration mismatch
        setDateRange({
            from: subMonths(new Date(), 1),
            to: new Date()
        });
        setRequestDateRange({
            from: subMonths(new Date(), 1),
            to: addDays(new Date(), 30)
        });
    }, []);

    const filteredOrders = useMemo(() => {
        if (!dateRange?.from) return [];
        const fromDate = dateRange.from;
        const toDate = dateRange.to || fromDate;

        return orders.filter(order => {
            const orderDate = parseISO(order.date);
            return orderDate >= fromDate && orderDate <= toDate;
        });
    }, [orders, dateRange]);
    
    const filteredRequests = useMemo(() => {
        if (!requestDateRange?.from) return [];
        const fromDate = requestDateRange.from;
        const toDate = requestDateRange.to || fromDate;

        return salespersonRequests.filter(req => {
            const reqDate = parseISO(req.date);
            return reqDate >= fromDate && reqDate <= toDate;
        });
    }, [salespersonRequests, requestDateRange]);


    const summaryTotals = useMemo(() => {
        return {
            completed: filteredOrders.filter(o => o.status === 'Completado').reduce((acc, o) => acc + o.amount, 0),
            pending: filteredOrders.filter(o => ['Pendiente', 'En Preparación'].includes(o.status)).reduce((acc, o) => acc + o.amount, 0),
            shipped: filteredOrders.filter(o => o.status === 'Enviado').reduce((acc, o) => acc + o.amount, 0),
            cancelled: filteredOrders.filter(o => o.status === 'Cancelado').reduce((acc, o) => acc + o.amount, 0),
            total: filteredOrders.filter(o => o.status !== 'Cancelado').reduce((acc, o) => acc + o.amount, 0),
        }
    }, [filteredOrders]);

     const requestSummaryTotals = useMemo(() => {
        return {
            total: filteredRequests.reduce((acc, r) => acc + r.amount, 0),
            dispatched: filteredRequests.filter(r => r.status === 'Despachado').reduce((acc, r) => acc + r.amount, 0),
            pending: filteredRequests.filter(r => r.status === 'Pendiente').reduce((acc, r) => acc + r.amount, 0),
        };
    }, [filteredRequests]);


    const getOrderDetailsAsString = (items: OrderItem[]): string => {
        return items.map(item => {
            const recipe = recipes.find(r => r.id === item.recipeId);
            const format = recipe?.formats.find(f => f.sku === item.formatSku);
            return `${item.quantity} x ${recipe?.name || 'Ítem no encontrado'} (${format?.name || 'Formato no especificado'})`;
        }).join(', ');
    };
    
    const getOrderDetailsAsTable = (items: OrderItem[]) => {
        return items.map(item => {
            const recipe = recipes.find(r => r.id === item.recipeId);
            const format = recipe?.formats.find(f => f.sku === item.formatSku);
            const cost = format?.cost || 0;
            const subtotal = item.quantity * cost;

            return {
                sku: format?.sku || 'N/A',
                description: `${recipe?.name || 'N/A'} - ${format?.name || 'N/A'}`,
                quantity: item.quantity,
                unitPrice: cost,
                subtotal: subtotal
            };
        });
    };

    const handleCreateOrder = (newOrderData: OrderFormData) => {
        
        let totalAmount = 0;
        
        newOrderData.items.forEach(item => {
            const recipe = recipes.find(r => r.id === item.recipeId);
            const format = recipe?.formats.find(f => f.sku === item.formatSku);
            if (recipe && format) {
                totalAmount += item.quantity * format.cost;
            }
        });

        const newOrder: Order = {
            id: `SALE${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
            status: 'Pendiente',
            date: new Date().toISOString().split('T')[0],
            deliveryDate: newOrderData.deliveryDate,
            customer: newOrderData.customer,
            items: newOrderData.items,
            amount: totalAmount,
            dispatcher: newOrderData.dispatcher,
            comments: newOrderData.comments,
        };
        setOrders(prev => [newOrder, ...prev]);
        setNewOrderModalOpen(false);
        toast({
            title: "Orden de Venta Creada",
            description: `Se ha creado una nueva orden para ${newOrder.customer}.`,
        });
    };

    const handleOpenDetails = (order: Order) => {
        setSelectedOrder(order);
        setDetailsModalOpen(true);
    };

    const handleOpenUpdateStatus = (order: Order) => {
        setSelectedOrder(order);
        setUpdatedStatus(order.status);
        setUpdateStatusModalOpen(true);
    };

    const handleUpdateOrderStatus = () => {
        if (!selectedOrder) return;

        setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: updatedStatus } : o));
        
        toast({
            title: "Estado de Orden Actualizado",
            description: `La orden ${selectedOrder.id} ha sido actualizada a "${updatedStatus}".`,
        });

        if(updatedStatus === 'Enviado') {
             toast({
                title: "Simulación de Inventario",
                description: `El stock de los productos de la orden ${selectedOrder.id} ha sido descontado del inventario.`,
            });
        }

        setUpdateStatusModalOpen(false);
        setSelectedOrder(null);
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
            pdf.save(`orden-venta-${selectedOrder?.id}.pdf`);
            toast({
                title: "PDF Descargado",
                description: `La orden de venta ${selectedOrder?.id} ha sido descargada.`,
            });
        }
    };


  return (
    <AppLayout pageTitle="Ventas">
        <Tabs defaultValue="industrial">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Gestión de Ventas</CardTitle>
                            <CardDescription className="font-body">Ingresa y gestiona las órdenes de venta y los pedidos de los vendedores.</CardDescription>
                        </div>
                        <TabsList>
                            <TabsTrigger value="industrial">Ventas Industriales</TabsTrigger>
                            <TabsTrigger value="salesperson">Pedidos Generales</TabsTrigger>
                        </TabsList>
                    </div>
                </CardHeader>
            </Card>

            <TabsContent value="industrial" className="space-y-6 mt-6">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                    "w-full sm:w-[300px] justify-start text-left font-normal",
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
                         <Button asChild variant="outline">
                            <Link href={`/sales/industrial-report?from=${dateRange?.from?.toISOString()}&to=${dateRange?.to?.toISOString()}`}>
                                <FileBarChart className="mr-2 h-4 w-4" />
                                Ver Reporte Industrial
                            </Link>
                        </Button>
                    </div>
                    <Button onClick={() => setNewOrderModalOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nueva Orden Industrial
                    </Button>
                </div>
                
                {dateRange?.from && (
                    <div>
                        <h3 className="text-lg font-headline font-semibold mb-4">
                            Resumen para el Período Seleccionado
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total en Ventas</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">${summaryTotals.total.toLocaleString('es-CL')}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Completadas</CardTitle>
                                    <FileCheck className="h-4 w-4 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">${summaryTotals.completed.toLocaleString('es-CL')}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pendientes y en Prep.</CardTitle>
                                    <Clock className="h-4 w-4 text-yellow-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-yellow-500">${(summaryTotals.pending).toLocaleString('es-CL')}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
                                    <Ban className="h-4 w-4 text-red-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">${summaryTotals.cancelled.toLocaleString('es-CL')}</div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Listado de Órdenes de Venta</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <Table className="responsive-table">
                        <TableHeader>
                        <TableRow>
                            <TableHead>ID de Orden</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                            <TableHead>Fecha Entrega</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead><span className="sr-only">Acciones</span></TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredOrders.map((order) => (
                            <TableRow key={order.id}>
                            <TableCell data-label="ID Orden" className="font-medium">{order.id}</TableCell>
                            <TableCell data-label="Cliente">{order.customer}</TableCell>
                            <TableCell data-label="Monto" className="text-left sm:text-right">${order.amount.toLocaleString('es-CL')}</TableCell>
                            <TableCell data-label="Fecha Entrega">{format(parseISO(order.deliveryDate), 'P', { locale: es })}</TableCell>
                            <TableCell data-label="Estado">
                                <Badge 
                                    variant={
                                        order.status === 'Completado' ? 'default' :
                                        order.status === 'Enviado' ? 'secondary' :
                                        order.status === 'Cancelado' ? 'destructive' :
                                        'outline'
                                    }
                                >
                                    {order.status}
                                </Badge>
                            </TableCell>
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
                                    <DropdownMenuItem onClick={() => handleOpenDetails(order)}>Ver Orden</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleOpenUpdateStatus(order)}>Actualizar Estado</DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                    <Link href={`/accounting/invoicing?client=${encodeURIComponent(order.customer)}&amount=${order.amount}&details=${encodeURIComponent(getOrderDetailsAsString(order.items))}`}>
                                            Generar Factura
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="salesperson" className="space-y-6 mt-6">
                 <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date-request"
                                    variant={"outline"}
                                    className={cn(
                                    "w-full sm:w-[300px] justify-start text-left font-normal",
                                    !requestDateRange && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {requestDateRange?.from ? (
                                    requestDateRange.to ? (
                                        <>
                                        {format(requestDateRange.from, "LLL dd, y", { locale: es })} -{" "}
                                        {format(requestDateRange.to, "LLL dd, y", { locale: es })}
                                        </>
                                    ) : (
                                        format(requestDateRange.from, "LLL dd, y", { locale: es })
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
                                    defaultMonth={requestDateRange?.from}
                                    selected={requestDateRange}
                                    onSelect={setRequestDateRange}
                                    numberOfMonths={2}
                                    locale={es}
                                />
                            </PopoverContent>
                        </Popover>
                        <Button asChild variant="outline">
                            <Link href={`/sales/daily-vendor-report`}>
                                <NotebookText className="mr-2 h-4 w-4" />
                                Reporte Diario por Vendedor
                            </Link>
                        </Button>
                         <Button asChild variant="outline">
                            <Link href={`/sales/general-report?from=${requestDateRange?.from?.toISOString()}&to=${requestDateRange?.to?.toISOString()}`}>
                                <FileBarChart className="mr-2 h-4 w-4" />
                                Ver Reporte General
                            </Link>
                        </Button>
                    </div>
                    <Button onClick={() => setNewOrderModalOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nuevo Pedido General
                    </Button>
                </div>
                 {requestDateRange?.from && (
                    <div>
                        <h3 className="text-lg font-headline font-semibold mb-4">
                            Resumen de Pedidos Generales
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total en Pedidos</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">${requestSummaryTotals.total.toLocaleString('es-CL')}</div>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Despachado</CardTitle>
                                    <Truck className="h-4 w-4 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">${requestSummaryTotals.dispatched.toLocaleString('es-CL')}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Pendiente</CardTitle>
                                    <Clock className="h-4 w-4 text-yellow-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-yellow-500">${requestSummaryTotals.pending.toLocaleString('es-CL')}</div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Listado de Pedidos Generales</CardTitle>
                    </CardHeader>
                     <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID Pedido</TableHead>
                                    <TableHead>Responsable</TableHead>
                                    <TableHead>Fecha Pedido</TableHead>
                                    <TableHead>Fecha Entrega</TableHead>
                                    <TableHead>Líneas</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead><span className="sr-only">Acciones</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRequests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell>{req.id}</TableCell>
                                        <TableCell>{req.salesperson}</TableCell>
                                        <TableCell>{format(parseISO(req.date), 'P', { locale: es })}</TableCell>
                                        <TableCell>{format(parseISO(req.deliveryDate), 'P', { locale: es })}</TableCell>
                                        <TableCell>{req.items.length}</TableCell>
                                        <TableCell>
                                            <Badge variant={req.status === 'Despachado' ? 'default' : 'secondary'}>
                                                {req.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/sales/load-report?requestId=${req.id}`}>Generar Hoja de Carga</Link>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>

      {/* Modal Nueva Orden */}
      <Dialog open={isNewOrderModalOpen} onOpenChange={setNewOrderModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Crear Nueva Orden de Venta</DialogTitle>
            <DialogDescription className="font-body">
              Completa los detalles para crear una nueva orden.
            </DialogDescription>
          </DialogHeader>
          <SalesOrderForm
            onSubmit={handleCreateOrder}
            onCancel={() => setNewOrderModalOpen(false)}
            recipes={recipes}
            customers={initialCustomers}
            />
        </DialogContent>
      </Dialog>
      
      {/* Modal Ver Detalles */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Orden de Venta: {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="max-h-[75vh] overflow-y-auto p-1">
                <div ref={detailsModalContentRef} className="p-8 bg-white text-black font-body">
                    <header className="flex justify-between items-start mb-10 border-b pb-6">
                        <div className="flex items-center gap-3">
                            <Logo className="w-28 text-orange-600" />
                            <div>
                                <h1 className="text-2xl font-bold font-headline text-gray-800">Panificadora Vollkorn</h1>
                                <p className="text-sm text-gray-500">Avenida Principal 123, Santiago, Chile</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-4xl font-headline font-bold uppercase text-gray-700">Orden de Venta</h2>
                            <p className="text-sm text-gray-500">Nº: {selectedOrder.id}</p>
                        </div>
                    </header>

                    <section className="grid grid-cols-2 gap-8 mb-10 text-sm">
                        <div>
                            <h3 className="font-headline text-base font-semibold text-gray-600 mb-2 border-b pb-1">Cliente</h3>
                            <p className="font-bold text-gray-800">{selectedOrder.customer}</p>
                        </div>
                        <div className="text-right">
                             <div className="mb-2">
                                <span className="font-semibold text-gray-600">Fecha de Emisión: </span>
                                <span>{format(parseISO(selectedOrder.date), 'P', { locale: es })}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-600">Fecha de Entrega: </span>
                                <span>{format(parseISO(selectedOrder.deliveryDate), 'P', { locale: es })}</span>
                            </div>
                        </div>
                    </section>

                    <section className="mb-10">
                        <h3 className="font-headline text-lg font-semibold text-gray-700 mb-3">Detalle del Pedido</h3>
                        <Table className="w-full text-sm">
                            <TableHeader className="bg-gray-100">
                                <TableRow>
                                    <TableHead className="text-left font-bold text-gray-700 uppercase p-3">SKU</TableHead>
                                    <TableHead className="text-left font-bold text-gray-700 uppercase p-3">Descripción</TableHead>
                                    <TableHead className="text-right font-bold text-gray-700 uppercase p-3">Cantidad</TableHead>
                                    <TableHead className="text-right font-bold text-gray-700 uppercase p-3">Precio Unit.</TableHead>
                                    <TableHead className="text-right font-bold text-gray-700 uppercase p-3">Subtotal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {getOrderDetailsAsTable(selectedOrder.items).map((item, index) => (
                                    <TableRow key={index} className="border-b border-gray-200">
                                        <TableCell className="p-3 font-mono">{item.sku}</TableCell>
                                        <TableCell className="p-3">{item.description}</TableCell>
                                        <TableCell className="text-right p-3">{item.quantity}</TableCell>
                                        <TableCell className="text-right p-3">${item.unitPrice.toLocaleString('es-CL')}</TableCell>
                                        <TableCell className="text-right p-3">${item.subtotal.toLocaleString('es-CL')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow className="font-bold text-lg bg-gray-100">
                                    <TableCell colSpan={4} className="text-right p-3">TOTAL ORDEN</TableCell>
                                    <TableCell className="text-right p-3">${selectedOrder.amount.toLocaleString('es-CL')}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </section>
                    
                    {selectedOrder.comments && (
                         <section className="mb-10">
                            <h3 className="font-headline text-base font-semibold text-gray-600 mb-2">Comentarios Adicionales</h3>
                            <p className="text-sm border p-3 rounded-md bg-gray-50">{selectedOrder.comments}</p>
                        </section>
                    )}

                    <footer className="text-center text-xs text-gray-400 border-t pt-4 mt-12">
                        <p>Orden generada por {selectedOrder.dispatcher}. Gracias por su preferencia.</p>
                        <p>Documento generado por Vollkorn ERP el {format(new Date(), 'Pp', { locale: es })}</p>
                    </footer>
                </div>
            </div>
          )}
           <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>Cerrar</Button>
                <Button onClick={handleDownloadPdf}>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar PDF
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

       {/* Modal Actualizar Estado */}
      <Dialog open={isUpdateStatusModalOpen} onOpenChange={setUpdateStatusModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline">Actualizar Estado de la Orden</DialogTitle>
            <DialogDescription className="font-body">
              Selecciona el nuevo estado para la orden {selectedOrder?.id}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Estado</Label>
                <Select value={updatedStatus} onValueChange={(value: Order['status']) => setUpdatedStatus(value)}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="En Preparación">En Preparación</SelectItem>
                        <SelectItem value="Enviado">Enviado</SelectItem>
                        <SelectItem value="Completado">Completado</SelectItem>
                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateStatusModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdateOrderStatus}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </AppLayout>
  );
}
