"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductionOrderForm from '@/components/production-order-form';

type Order = {
    id: string;
    product: string;
    quantity: number;
    status: 'En Progreso' | 'Completado' | 'En Cola';
    stage: string;
    date: string;
};

const initialOrders: Order[] = [
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
    }

    const handleUpdateOrder = () => {
        if (!selectedOrder) return;
        setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: updatedStatus, stage: updatedStage } : o));
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
        }
    };


  return (
    <AppLayout pageTitle="Producción">
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
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
          <Table>
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
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.product}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'Completado' ? 'default' : order.status === 'En Progreso' ? 'secondary' : 'outline'}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{order.stage}</TableCell>
                  <TableCell>{order.date}</TableCell>
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
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Detalles de la Orden</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="max-h-[75vh] overflow-y-auto p-1">
                <div ref={detailsModalContentRef} className="p-6 bg-white text-black">
                    <div className="border-b-2 border-gray-200 pb-4 mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 font-headline">Orden de Producción: {selectedOrder.id}</h2>
                        <p className="text-sm text-gray-500 font-body">Vollkorn ERP</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 font-body mb-6">
                        <div>
                            <p className="font-semibold text-gray-600">Producto:</p>
                            <p>{selectedOrder.product}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-600">Cantidad:</p>
                            <p>{selectedOrder.quantity} unidades</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-600">Fecha de Emisión:</p>
                            <p>{new Date(selectedOrder.date).toLocaleDateString('es-ES')}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-600">Estado Actual:</p>
                            <p>
                                <Badge variant={selectedOrder.status === 'Completado' ? 'default' : selectedOrder.status === 'En Progreso' ? 'secondary' : 'outline'}>
                                    {selectedOrder.status}
                                </Badge>
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="font-semibold text-gray-600">Etapa de Producción:</p>
                            <p>{selectedOrder.stage}</p>
                        </div>
                    </div>
                    <div className="border-t-2 border-gray-200 pt-4 mt-4 text-center text-xs text-gray-500">
                        <p>Documento generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}</p>
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
