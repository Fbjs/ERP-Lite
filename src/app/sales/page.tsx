
"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Download, Calendar as CalendarIcon, DollarSign, FileCheck, Clock, Ban, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState, useRef, useMemo } from 'react';
import SalesOrderForm, { OrderFormData } from '@/components/sales-order-form';
import { Recipe, initialRecipes } from '@/app/recipes/page';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';


type Order = {
  id: string;
  customer: string;
  amount: number;
  status: 'Completado' | 'Pendiente' | 'Enviado' | 'Cancelado' | 'En Preparación';
  date: string;
  details: string;
};


export const initialOrders: Order[] = [
  { id: 'SALE881', customer: 'Cafe Del Sol', amount: 450.00, status: 'Completado', date: '2025-07-27', details: '100 x Pan de Masa Madre, 50 x Baguettes' },
  { id: 'SALE882', customer: 'La Esquina Market', amount: 1200.50, status: 'Pendiente', date: '2025-07-28', details: '200 x Croissants, 150 x Ciabattas' },
  { id: 'SALE883', customer: 'Hotel Grand Vista', amount: 875.00, status: 'Enviado', date: '2025-07-28', details: '50 x Pain au Levain, 50 x Baguette Tradition' },
  { id: 'SALE884', customer: 'Panaderia Central', amount: 320.75, status: 'Completado', date: '2025-07-26', details: '300 x Pan de Centeno' },
  { id: 'SALE885', customer: 'Supermercado del Sur', amount: 950.00, status: 'Cancelado', date: '2025-07-25', details: '500 x Pan de Molde' },
  { id: 'SALE886', customer: 'Restaurante El Tenedor', amount: 210.00, status: 'En Preparación', date: '2025-07-29', details: '100 x Bagels' },
];

export default function SalesPage() {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [recipes] = useState<Recipe[]>(initialRecipes);
    const [isNewOrderModalOpen, setNewOrderModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isUpdateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [updatedStatus, setUpdatedStatus] = useState<Order['status']>('Pendiente');
    const detailsModalContentRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subMonths(new Date(2025, 6, 29), 1),
        to: new Date(2025, 6, 29)
    });

    const filteredOrders = useMemo(() => {
        if (!dateRange?.from) return orders;
        const fromDate = dateRange.from;
        const toDate = dateRange.to || fromDate;

        return orders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= fromDate && orderDate <= toDate;
        });
    }, [orders, dateRange]);

    const summaryTotals = useMemo(() => {
        return {
            completed: filteredOrders.filter(o => o.status === 'Completado').reduce((acc, o) => acc + o.amount, 0),
            pending: filteredOrders.filter(o => ['Pendiente', 'En Preparación'].includes(o.status)).reduce((acc, o) => acc + o.amount, 0),
            shipped: filteredOrders.filter(o => o.status === 'Enviado').reduce((acc, o) => acc + o.amount, 0),
            cancelled: filteredOrders.filter(o => o.status === 'Cancelado').reduce((acc, o) => acc + o.amount, 0),
            total: filteredOrders.filter(o => o.status !== 'Cancelado').reduce((acc, o) => acc + o.amount, 0),
        }
    }, [filteredOrders]);


    const handleCreateOrder = (newOrderData: OrderFormData) => {
        
        const details = newOrderData.items
            .map(item => {
                const recipe = recipes.find(r => r.id === item.recipeId);
                return `${item.quantity} x ${recipe ? recipe.name : 'Producto Desconocido'}`;
            })
            .join(', ');

        const amount = newOrderData.items.reduce((total, item) => {
            const recipe = recipes.find(r => r.id === item.recipeId);
            return total + (item.quantity * (recipe?.cost || 0));
        }, 0);

        const newOrder: Order = {
            id: `SALE${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
            status: 'Pendiente',
            date: new Date().toISOString().split('T')[0],
            customer: newOrderData.customer,
            details,
            amount,
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
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Órdenes de Venta</CardTitle>
                            <CardDescription className="font-body">Ingresa nuevas órdenes de venta y rastrea las existentes.</CardDescription>
                        </div>
                        <div className="flex items-center flex-wrap gap-2">
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
                                <PopoverContent className="w-auto p-0" align="end">
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
                            <Button onClick={() => setNewOrderModalOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Nueva Orden
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

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
                <CardDescription className="font-body">
                    {dateRange?.from ? 'Mostrando órdenes para el período seleccionado.' : 'Mostrando todas las órdenes.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="responsive-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>ID de Orden</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead><span className="sr-only">Acciones</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell data-label="ID Orden" className="font-medium">{order.id}</TableCell>
                      <TableCell data-label="Cliente">{order.customer}</TableCell>
                      <TableCell data-label="Monto" className="text-left sm:text-right">${order.amount.toLocaleString('es-CL')}</TableCell>
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
                      <TableCell data-label="Fecha">{new Date(order.date).toLocaleDateString('es-CL')}</TableCell>
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
                               <Link href={`/accounting?client=${encodeURIComponent(order.customer)}&amount=${order.amount}&details=${encodeURIComponent(order.details)}`}>
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
        </div>

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
                        <div><p className="font-semibold text-gray-600">Fecha:</p><p>{new Date(selectedOrder.date).toLocaleDateString('es-ES')}</p></div>
                        <div><p className="font-semibold text-gray-600">Cliente:</p><p>{selectedOrder.customer}</p></div>
                        <div><p className="font-semibold text-gray-600">Monto Total:</p><p>${selectedOrder.amount.toLocaleString('es-CL')}</p></div>
                        <div className="sm:col-span-2"><p className="font-semibold text-gray-600">Estado:</p><p>{selectedOrder.status}</p></div>
                        <div className="sm:col-span-2"><p className="font-semibold text-gray-600">Detalles del Pedido:</p><p className="whitespace-pre-wrap">{selectedOrder.details}</p></div>
                    </div>
                    <div className="border-t-2 border-gray-200 pt-4 mt-4 text-center text-xs text-gray-500">
                        <p>Documento generado el {new Date().toLocaleDateString('es-ES')}</p>
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
