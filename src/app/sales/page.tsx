
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
import SalespersonRequestForm, { SalespersonRequestFormData } from '@/components/salesperson-request-form';
import { initialCustomers } from '@/app/admin/customers/page';

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
    { id: 'SALE881', customer: 'Cafe Central', amount: 270000, status: 'Completado', date: '2025-07-27', deliveryDate: '2025-07-28', items: [{ recipeId: 'CERE0003', formatSku: 'CERE0003-7MM', quantity: 100 }], dispatcher: 'RENE', comments: 'Entregar por acceso de servicio.' },
    { id: 'SALE882', customer: 'Supermercado del Sur', amount: 820000, status: 'Pendiente', date: '2025-07-28', deliveryDate: '2025-07-30', items: [{ recipeId: 'CRUT11MM', formatSku: 'CRUT11MM', quantity: 200 }], dispatcher: 'MARCELO', comments: '' },
    { id: 'SALE883', customer: 'Panaderia San Jose', amount: 330000, status: 'Enviado', date: '2025-07-28', deliveryDate: '2025-07-29', items: [{ recipeId: 'TIPA2700', formatSku: 'TIPA2700', quantity: 50 }], dispatcher: 'RENE', comments: 'Horario de entrega estricto: 8am-10am' },
];

export const initialSalespersonRequests: SalespersonRequest[] = [
    { id: 'PED001', salesperson: 'FRANCISCA', deliveryPerson: 'RODRIGO', responsiblePerson: 'FRANCISCA', date: '2025-08-29', deliveryDate: '2025-08-29', status: 'Despachado', items: [
        { client: 'LORENA AGUILAR', product: 'PAN SCHWARZBROT 750 GRS', quantity: 94, type: 'MERMA', itemType: 'BOLETA', deliveryAddress: 'AGREGAR COSTO DE DESPACHO (SI ES MENOR A 30.000 LA FACTURA)'},
        { client: 'LORENA AGUILAR', product: 'PAN LINAZA 500 GRS', quantity: 20, type: 'MERMA', itemType: 'BOLETA', deliveryAddress: 'AGREGAR COSTO DE DESPACHO (SI ES MENOR A 30.000 LA FACTURA)'},
    ], amount: 350000},
    { id: 'PED002', salesperson: 'VENDEDOR 2', deliveryPerson: 'MARCELO', responsiblePerson: 'VENDEDOR 2', date: '2025-07-29', deliveryDate: '2025-07-30', status: 'Pendiente', items: [
        { client: 'BETTER FOOD', product: 'CRUTONES 1 K', quantity: 10, type: 'PROD', itemType: 'FACTURA', deliveryAddress: 'AGREGAR COSTO DE DESPACHO...' }
    ], amount: 80000},
];


export default function SalesPage() {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [salespersonRequests, setSalespersonRequests] = useState<SalespersonRequest[]>(initialSalespersonRequests);
    const [recipes] = useState<Recipe[]>(initialRecipes);
    const [isNewOrderModalOpen, setNewOrderModalOpen] = useState(false);
    const [isNewRequestModalOpen, setNewRequestModalOpen] = useState(false);
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

    const handleCreateOrder = (newOrderData: OrderFormData) => {
        
        let totalAmount = 0;
        
        newOrderData.items.forEach(item => {
            const recipe = recipes.find(r => r.id === item.recipeId);
            const format = recipe?.formats.find(f => f.sku === item.formatSku);
            if (recipe && format) {
                totalAmount += item.quantity * format.cost;
            } else if (recipe) {
                 totalAmount += item.quantity * recipe.cost; // Fallback to base recipe cost
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
    
    const handleCreateSalespersonRequest = (data: SalespersonRequestFormData) => {
        const SIMULATED_AVG_ITEM_PRICE = 2500;
        const totalAmount = data.items.reduce((acc, item) => acc + (item.quantity * SIMULATED_AVG_ITEM_PRICE), 0);

        const newRequest: SalespersonRequest = {
            id: `PED${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
            salesperson: data.salesperson,
            deliveryPerson: data.deliveryPerson,
            responsiblePerson: data.responsiblePerson,
            date: data.date,
            deliveryDate: data.deliveryDate,
            items: data.items,
            status: 'Pendiente',
            amount: totalAmount,
        };
        setSalespersonRequests(prev => [newRequest, ...prev]);
        setNewRequestModalOpen(false);
        toast({
            title: "Pedido General Creado",
            description: `Se ha registrado el pedido para ${data.salesperson}.`
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
                                    <Link href={`/accounting?client=${encodeURIComponent(order.customer)}&amount=${order.amount}&details=${encodeURIComponent(getOrderDetailsAsString(order.items))}`}>
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
                    <Button onClick={() => setNewRequestModalOpen(true)}>
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

      {/* Modal Nueva Orden Industrial */}
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
      
       {/* Modal Nuevo Pedido de Vendedor */}
       <Dialog open={isNewRequestModalOpen} onOpenChange={setNewRequestModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Crear Pedido General</DialogTitle>
            <DialogDescription className="font-body">
              Registra los productos solicitados por un vendedor para sus clientes.
            </DialogDescription>
          </DialogHeader>
           <SalespersonRequestForm
                onSubmit={handleCreateSalespersonRequest}
                onCancel={() => setNewRequestModalOpen(false)}
                recipes={recipes}
                customers={initialCustomers}
            />
        </DialogContent>
      </Dialog>
      
      {/* Modal Ver Detalles */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Detalles de la Orden: {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="max-h-[75vh] overflow-y-auto p-1">
                <div ref={detailsModalContentRef} className="p-6 bg-white text-black">
                    <div className="border-b-2 border-gray-200 pb-4 mb-4 text-center">
                        <h2 className="text-2xl font-bold text-gray-800 font-headline">Orden de Venta</h2>
                        <p className="text-sm text-gray-500 font-body">Vollkorn ERP</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 font-body mb-6">
                        <div><p className="font-semibold text-gray-600">ID Orden:</p><p>{selectedOrder.id}</p></div>
                        <div><p className="font-semibold text-gray-600">Fecha de Emisión:</p><p>{format(parseISO(selectedOrder.date), 'P', { locale: es })}</p></div>
                        <div><p className="font-semibold text-gray-600">Cliente:</p><p>{selectedOrder.customer}</p></div>
                        <div><p className="font-semibold text-gray-600">Fecha de Entrega:</p><p>{format(parseISO(selectedOrder.deliveryDate), 'P', { locale: es })}</p></div>
                        <div><p className="font-semibold text-gray-600">Monto Total:</p><p>${selectedOrder.amount.toLocaleString('es-CL')}</p></div>
                        <div><p className="font-semibold text-gray-600">Estado:</p><p>{selectedOrder.status}</p></div>
                        <div className="sm:col-span-2"><p className="font-semibold text-gray-600">Detalles del Pedido:</p><p className="whitespace-pre-wrap">{getOrderDetailsAsString(selectedOrder.items)}</p></div>
                    </div>
                    <div className="border-t-2 border-gray-200 pt-4 mt-4 text-center text-xs text-gray-500">
                        <p>Documento generado el {format(new Date(), 'P', { locale: es })}</p>
                    </div>
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
