
"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Download, Wheat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState, useRef } from 'react';
import ShipmentForm from '@/components/shipment-form';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


type Shipment = {
  id: string;
  order: string;
  client: string;
  address: string;
  details: string;
  vehicle: string;
  status: 'En Preparación' | 'En Ruta' | 'Entregado' | 'Cancelado';
};

const initialShipments: Shipment[] = [
  { id: 'DSP001', order: 'SALE883', client: 'Hotel Grand Vista', address: 'Avenida del Mar 456, Valparaíso', details: '50 Pain au Levain, 50 Baguette Tradition', vehicle: 'Patente XX-YY-ZZ', status: 'En Ruta' },
  { id: 'DSP002', order: 'SALE881', client: 'Cafe Del Sol', address: 'Calle Sol 123, Santiago', details: '100 Pan de Masa Madre, 50 Baguettes', vehicle: 'Courier Externo', status: 'Entregado' },
  { id: 'DSP003', order: 'SALE882', client: 'La Esquina Market', address: 'Pasaje Las Flores 78, Rancagua', details: '200 Croissants, 150 Ciabattas', vehicle: 'Sin Asignar', status: 'En Preparación' },
  { id: 'DSP004', order: 'SALE884', client: 'Panaderia Central', address: 'Plaza de Armas 20, Talca', details: '300 Pan de Centeno', vehicle: 'Courier Externo', status: 'Entregado' },
];

export default function LogisticsPage() {
    const [shipments, setShipments] = useState<Shipment[]>(initialShipments);
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isUpdateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
    const [updatedStatus, setUpdatedStatus] = useState<Shipment['status']>('En Preparación');
    const { toast } = useToast();
    const detailsModalContentRef = useRef<HTMLDivElement>(null);

    const handleOpenForm = (shipment: Shipment | null) => {
        setSelectedShipment(shipment);
        setFormModalOpen(true);
    };

    const handleOpenDetails = (shipment: Shipment) => {
        setSelectedShipment(shipment);
        setDetailsModalOpen(true);
    };

    const handleOpenUpdateStatus = (shipment: Shipment) => {
        setSelectedShipment(shipment);
        setUpdatedStatus(shipment.status);
        setUpdateStatusModalOpen(true);
    };

    const handleCreateShipment = (data: Omit<Shipment, 'id' | 'status'>) => {
        const newShipment: Shipment = {
            id: `DSP${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
            ...data,
            status: 'En Preparación',
        };
        setShipments(prev => [newShipment, ...prev]);
        setFormModalOpen(false);
        toast({
            title: "Despacho Creado",
            description: `Se ha creado el despacho para la orden ${newShipment.order}.`,
        });
    };
    
    const handleUpdateStatus = () => {
        if (!selectedShipment) return;
        setShipments(shipments.map(s => s.id === selectedShipment.id ? { ...s, status: updatedStatus } : s));
        setUpdateStatusModalOpen(false);
        toast({
            title: "Estado Actualizado",
            description: `El estado del despacho ${selectedShipment.id} es ahora: ${updatedStatus}.`,
        });
        setSelectedShipment(null);
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
            pdf.save(`guia-despacho-${selectedShipment?.id}.pdf`);
            toast({
                title: "PDF Descargado",
                description: `La guía de despacho ${selectedShipment?.id} ha sido descargada.`,
            });
        }
    };


  return (
    <AppLayout pageTitle="Logística y Despacho">
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline">Gestión de Despachos</CardTitle>
                    <CardDescription className="font-body">Coordina la preparación y entrega de pedidos.</CardDescription>
                </div>
                <Button onClick={() => handleOpenForm(null)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuevo Despacho
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Despacho ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-medium">{shipment.id}</TableCell>
                  <TableCell>{shipment.client}</TableCell>
                  <TableCell>{shipment.address}</TableCell>
                  <TableCell>{shipment.vehicle}</TableCell>
                  <TableCell>
                    <Badge variant={
                        shipment.status === 'Entregado' ? 'default' :
                        shipment.status === 'En Ruta' ? 'secondary' :
                        shipment.status === 'Cancelado' ? 'destructive' :
                        'outline'
                    }>
                      {shipment.status}
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
                        <DropdownMenuItem onClick={() => handleOpenDetails(shipment)}>Ver Guía de Despacho</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenUpdateStatus(shipment)}>Actualizar Estado</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Modal Nuevo Despacho */}
      <Dialog open={isFormModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline">Nuevo Despacho</DialogTitle>
            <DialogDescription className="font-body">
              Completa los detalles para crear un nuevo despacho.
            </DialogDescription>
          </DialogHeader>
          <ShipmentForm
            onSubmit={handleCreateShipment}
            onCancel={() => { setFormModalOpen(false); setSelectedShipment(null); }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Modal Ver Guía */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Guía de Despacho: {selectedShipment?.id}</DialogTitle>
          </DialogHeader>
          {selectedShipment && (
             <div className="max-h-[75vh] overflow-y-auto p-1">
                <div ref={detailsModalContentRef} className="p-8 bg-white text-black font-body">
                    <header className="flex justify-between items-start mb-10 border-b-2 border-gray-800 pb-4">
                        <div className="flex items-center gap-3">
                            <Wheat className="w-12 h-12 text-orange-600" />
                            <div>
                                <h1 className="text-2xl font-bold font-headline text-gray-800">Panificadora Vollkorn</h1>
                                <p className="text-sm text-gray-500">Avenida Principal 123, Santiago, Chile</p>
                                <p className="text-sm text-gray-500">RUT: 76.123.456-7</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-headline font-bold uppercase text-gray-700">Guía de Despacho</h2>
                            <p className="text-sm text-gray-600 font-semibold">Nº: {selectedShipment.id}</p>
                            <p className="text-sm text-gray-500">Fecha Emisión: {new Date().toLocaleDateString('es-ES')}</p>
                        </div>
                    </header>

                    <section className="grid grid-cols-2 gap-8 mb-10">
                        <div>
                            <h3 className="font-headline text-base font-semibold text-gray-600 mb-2 border-b pb-1">Remitente:</h3>
                            <p className="font-bold text-gray-800 text-sm">Panificadora Vollkorn</p>
                            <p className="text-sm text-gray-700">Avenida Principal 123, Santiago, Chile</p>
                        </div>
                        <div>
                            <h3 className="font-headline text-base font-semibold text-gray-600 mb-2 border-b pb-1">Destinatario:</h3>
                            <p className="font-bold text-gray-800 text-sm">{selectedShipment.client}</p>
                            <p className="text-sm text-gray-700">{selectedShipment.address}</p>
                        </div>
                    </section>
                    
                    <section className="grid grid-cols-3 gap-4 mb-10 text-sm">
                        <div className="bg-gray-50 p-2 rounded-md border">
                            <p className="font-semibold text-gray-600">Nº Orden de Venta:</p>
                            <p>{selectedShipment.order}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-md border">
                            <p className="font-semibold text-gray-600">Vehículo:</p>
                            <p>{selectedShipment.vehicle}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-md border">
                            <p className="font-semibold text-gray-600">Estado Actual:</p>
                            <p>{selectedShipment.status}</p>
                        </div>
                    </section>

                    <section className="mb-10">
                         <h3 className="font-headline text-lg font-semibold text-gray-700 mb-3">Detalle de Productos</h3>
                         <Table className="w-full text-sm">
                            <TableHeader className="bg-gray-100">
                                <TableRow>
                                    <TableHead className="text-left font-bold text-gray-700 uppercase p-3">Descripción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="border-b border-gray-200">
                                    <TableCell className="p-3 whitespace-pre-wrap">{selectedShipment.details}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </section>
                    
                    <section className="flex justify-end mt-16">
                        <div className="w-1/2 text-center">
                            <div className="border-t-2 border-gray-400 pt-2">
                                <p className="font-semibold text-gray-700">Recibí Conforme</p>
                                <p className="text-xs text-gray-500 mt-1">(Nombre, RUT y Firma)</p>
                            </div>
                        </div>
                    </section>

                    <footer className="text-center text-xs text-gray-400 border-t pt-4 mt-12">
                        <p>Gracias por su preferencia. Documento generado por Vollkorn ERP.</p>
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
            <DialogTitle className="font-headline">Actualizar Estado del Despacho</DialogTitle>
            <DialogDescription className="font-body">
              Selecciona el nuevo estado para el despacho {selectedShipment?.id}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Estado</Label>
                <Select value={updatedStatus} onValueChange={(value: Shipment['status']) => setUpdatedStatus(value)}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="En Preparación">En Preparación</SelectItem>
                        <SelectItem value="En Ruta">En Ruta</SelectItem>
                        <SelectItem value="Entregado">Entregado</SelectItem>
                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateStatusModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdateStatus}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
