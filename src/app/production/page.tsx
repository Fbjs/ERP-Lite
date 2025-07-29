"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Detalles de la Orden: {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
             <div className="grid gap-4 py-4 font-body">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Producto:</Label>
                    <span className="col-span-3">{selectedOrder.product}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Cantidad:</Label>
                    <span className="col-span-3">{selectedOrder.quantity}</span>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Fecha:</Label>
                    <span className="col-span-3">{selectedOrder.date}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Estado:</Label>
                    <span className="col-span-3">
                         <Badge variant={selectedOrder.status === 'Completado' ? 'default' : selectedOrder.status === 'En Progreso' ? 'secondary' : 'outline'}>
                            {selectedOrder.status}
                        </Badge>
                    </span>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Etapa:</Label>
                    <span className="col-span-3">{selectedOrder.stage}</span>
                </div>
             </div>
          )}
           <DialogFooter>
                <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>Cerrar</Button>
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
