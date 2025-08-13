"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState, useRef, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductionOrderForm from '@/components/production-order-form';
import { useToast } from '@/hooks/use-toast';
import { initialRecipes, Recipe } from '@/app/recipes/page';
import { InventoryItem, initialInventoryItems } from '@/app/inventory/page';
import Logo from '@/components/logo';


type Order = {
    id: string;
    product: string;
    quantity: number;
    status: 'En Progreso' | 'Completado' | 'En Cola';
    stage: string;
    date: string;
};

export const initialOrders: Order[] = [
  { id: 'PROD021', product: 'Pain au Levain', quantity: 200, status: 'En Progreso', stage: 'Horneando', date: '2023-10-28' },
  { id: 'PROD022', product: 'Baguette Tradition', quantity: 500, status: 'Completado', stage: 'Empaquetado', date: '2023-10-28' },
  { id: 'PROD023', product: 'Croissant au Beurre', quantity: 1000, status: 'En Cola', stage: 'Mezclando', date: '2023-10-29' },
  { id: 'PROD024', product: 'Ciabatta', quantity: 150, status: 'En Progreso', stage: 'Fermentando', date: '2023-10-28' },
];

export default function ProductionPage() {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [isNewOrderModalOpen, setNewOrderModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isUpdateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [updatedStatus, setUpdatedStatus] = useState<Order['status']>('En Cola');
    const [updatedStage, setUpdatedStage] = useState('');
    const detailsModalContentRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

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

    const handleOpenUpdateStatus = (order: Order) => {
        setSelectedOrder(order);
        setUpdatedStatus(order.status);
        setUpdatedStage(order.stage);
        setUpdateStatusModalOpen(true);
    };

    const handleCreateOrder = (newOrderData: Omit<Order, 'id' | 'status' | 'date'>) => {
      const newOrder: Order = {
        ...newOrderData,
        id: `PROD${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
        status: 'En Cola',
        date: new Date().toISOString().split('T')[0],
      };
      setOrders(prev => [newOrder, ...prev]);
      setNewOrderModalOpen(false);
      toast({
          title: "Orden Creada",
          description: `La orden de producción para ${newOrder.quantity}x ${newOrder.product} ha sido creada.`,
      });
    }

    const handleUpdateOrder = () => {
        if (!selectedOrder) return;
        
        const originalStatus = selectedOrder.status;
        const newStatus = updatedStatus;

        setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: updatedStatus, stage: updatedStage } : o));
        
        toast({
            title: "Orden Actualizada",
            description: `La orden ${selectedOrder.id} ha sido actualizada.`,
        });

        if (newStatus === 'Completado' && originalStatus !== 'Completado') {
            const recipe = initialRecipes.find(r => r.name === selectedOrder.product);
            if(recipe) {
                toast({
                    title: "Simulación de Inventario",
                    description: `El stock del producto terminado '${selectedOrder.product}' y sus materias primas ha sido actualizado.`,
                });
            } else {
                 toast({
                    variant: "destructive",
                    title: "Receta no encontrada",
                    description: `No se encontró una receta para '${selectedOrder.product}'. El inventario no fue ajustado.`,
                });
            }
        }

        setUpdateStatusModalOpen(false);
        setSelectedOrder(null);
    }

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


  return (
    <AppLayout pageTitle="Producción">
      <Card>
        <CardHeader>
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <CardTitle className="font-headline">Órdenes de Producción</CardTitle>
                    <CardDescription className="font-body">Rastrea y gestiona las órdenes de producción.</CardDescription>
                </div>
                <Button onClick={() => setNewOrderModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nueva Orden
                </Button>
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
                <TableHead>Etapa Actual</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell data-label="ID de Orden" className="font-medium">{order.id}</TableCell>
                  <TableCell data-label="Producto">{order.product}</TableCell>
                  <TableCell data-label="Cantidad">{order.quantity}</TableCell>
                  <TableCell data-label="Estado">
                    <Badge variant={order.status === 'Completado' ? 'default' : order.status === 'En Progreso' ? 'secondary' : 'outline'}>{order.status}</Badge>
                  </TableCell>
                  <TableCell data-label="Etapa">{order.stage}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleOpenDetails(order)}>Ver Detalles</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenUpdateStatus(order)}>Actualizar Estado</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Nueva Orden */}
      <Dialog open={isNewOrderModalOpen} onOpenChange={setNewOrderModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Crear Nueva Orden de Producción</DialogTitle>
            <DialogDescription className="font-body">
              Completa los detalles para crear una nueva orden.
            </DialogDescription>
          </DialogHeader>
          <ProductionOrderForm
            onSubmit={handleCreateOrder}
            onCancel={() => setNewOrderModalOpen(false)}
            />
        </DialogContent>
      </Dialog>

      {/* Modal Ver Detalles */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setDetailsModalOpen}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="font-headline">Detalle de Orden: {selectedOrder?.id}</DialogTitle>
                    <DialogDescription className="font-body">
                        Creada el {selectedOrder ? new Date(selectedOrder.date).toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'short' }) : ''}
                    </DialogDescription>
                </DialogHeader>
                {selectedOrder && (
                    <div className="max-h-[75vh] overflow-y-auto p-1">
                        <div ref={detailsModalContentRef} className="p-6 bg-white text-black font-body text-xs space-y-2">
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
                                </div>
                                <div className="text-right">
                                    <p><span className="font-semibold">Fecha:</span> {new Date(selectedOrder.date).toLocaleDateString('es-CL')}</p>
                                    <p><span className="font-semibold">Hora:</span> {new Date(selectedOrder.date).toLocaleTimeString('es-CL')}</p>
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

      {/* Modal Actualizar Estado */}
      <Dialog open={isUpdateStatusModalOpen} onOpenChange={setUpdateStatusModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Actualizar Orden: {selectedOrder?.id}</DialogTitle>
             <DialogDescription className="font-body">
              Modifica el estado y la etapa actual de la orden de producción.
            </DialogDescription>
          </DialogHeader>
            <div className="grid gap-4 py-4 font-body">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Estado</Label>
                    <Select value={updatedStatus} onValueChange={(value) => setUpdatedStatus(value as Order['status'])}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="En Cola">En Cola</SelectItem>
                            <SelectItem value="En Progreso">En Progreso</SelectItem>
                            <SelectItem value="Completado">Completado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="stage" className="text-right">Etapa</Label>
                    <Input id="stage" value={updatedStage} onChange={(e) => setUpdatedStage(e.target.value)} className="col-span-3"/>
                </div>
            </div>
           <DialogFooter>
                <Button variant="outline" onClick={() => setUpdateStatusModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleUpdateOrder}>Guardar Cambios</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
