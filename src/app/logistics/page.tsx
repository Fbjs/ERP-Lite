"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const shipments = [
  { id: 'DSP001', order: 'SALE883', client: 'Hotel Grand Vista', vehicle: 'Patente XX-YY-ZZ', status: 'En Ruta' },
  { id: 'DSP002', order: 'SALE881', client: 'Cafe Del Sol', vehicle: 'Courier Externo', status: 'Entregado' },
  { id: 'DSP003', order: 'SALE882', client: 'La Esquina Market', vehicle: 'Sin Asignar', status: 'En Preparación' },
  { id: 'DSP004', order: 'SALE884', client: 'Panaderia Central', vehicle: 'Courier Externo', status: 'Entregado' },
];

export default function LogisticsPage() {
  return (
    <AppLayout pageTitle="Logística y Despacho">
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline">Gestión de Despachos</CardTitle>
                    <CardDescription className="font-body">Coordina la preparación y entrega de pedidos.</CardDescription>
                </div>
                <Button>
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
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
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
                  <TableCell>{shipment.order}</TableCell>
                  <TableCell>{shipment.client}</TableCell>
                  <TableCell>{shipment.vehicle}</TableCell>
                  <TableCell>
                    <Badge variant={shipment.status === 'Entregado' ? 'default' : 'secondary'}>
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
                        <DropdownMenuItem>Ver Guía de Despacho</DropdownMenuItem>
                        <DropdownMenuItem>Actualizar Estado</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
