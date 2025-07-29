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
import SalesOrderForm, { OrderFormData } from '@/components/sales-order-form';
import { Recipe, initialRecipes } from '@/app/recipes/page';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

type Order = {
  id: string;
  customer: string;
  amount: number;
  status: 'Completado' | 'Pendiente' | 'Enviado' | 'Cancelado';
  date: string;
  details: string;
};


const initialOrders: Order[] = [
  { id: 'SALE881', customer: 'Cafe Del Sol', amount: 450.00, status: 'Completado', date: '2023-10-27', details: '100 Pan de Masa Madre, 50 Baguettes' },
  { id: 'SALE882', customer: 'La Esquina Market', amount: 1200.50, status: 'Pendiente', date: '2023-10-28', details: '200 Croissants, 150 Ciabattas' },
  { id: 'SALE883', customer: 'Hotel Grand Vista', amount: 875.00, status: 'Enviado', date: '2023-10-28', details: '50 Pain au Levain, 50 Baguette Tradition' },
  { id: 'SALE884', customer: 'Panaderia Central', amount: 320.75, status: 'Completado', date: '2023-10-26', details: '300 Pan de Centeno' },
];

export default function SalesPage() {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [recipes] = useState<Recipe[]>(initialRecipes);
    const [isNewOrderModalOpen, setNewOrderModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const detailsModalContentRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

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
       <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline">Órdenes de Venta</CardTitle>
                    <CardDescription className="font-body">Ingresa nuevas órdenes de venta y rastrea las existentes.</CardDescription>
                </div>
                <Button onClick={() => setNewOrderModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nueva Orden de Venta
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID de Orden</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>${order.amount.toLocaleString('es-CL')}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'Completado' ? 'default' : order.status === 'Enviado' ? 'secondary' : 'outline'}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString('es-CL')}</TableCell>
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
                        <DropdownMenuItem asChild>
                           <Link href={`/accounting?client=${encodeURIComponent(order.customer)}&amount=${order.amount}`}>
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
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 font-body mb-6">
                        <div><p className="font-semibold text-gray-600">ID Orden:</p><p>{selectedOrder.id}</p></div>
                        <div><p className="font-semibold text-gray-600">Fecha:</p><p>{new Date(selectedOrder.date).toLocaleDateString('es-ES')}</p></div>
                        <div><p className="font-semibold text-gray-600">Cliente:</p><p>{selectedOrder.customer}</p></div>
                        <div><p className="font-semibold text-gray-600">Monto Total:</p><p>${selectedOrder.amount.toLocaleString('es-CL')}</p></div>
                        <div className="col-span-2"><p className="font-semibold text-gray-600">Estado:</p><p>{selectedOrder.status}</p></div>
                        <div className="col-span-2"><p className="font-semibold text-gray-600">Detalles del Pedido:</p><p className="whitespace-pre-wrap">{selectedOrder.details}</p></div>
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
    </AppLayout>
  );
}
