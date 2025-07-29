"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const orders = [
  { id: 'SALE881', customer: 'Cafe Del Sol', amount: '$450.00', status: 'Completado', date: '2023-10-27' },
  { id: 'SALE882', customer: 'La Esquina Market', amount: '$1,200.50', status: 'Pendiente', date: '2023-10-28' },
  { id: 'SALE883', customer: 'Hotel Grand Vista', amount: '$875.00', status: 'Enviado', date: '2023-10-28' },
  { id: 'SALE884', customer: 'Panaderia Central', amount: '$320.75', status: 'Completado', date: '2023-10-26' },
];

export default function SalesPage() {
  return (
    <AppLayout pageTitle="Órdenes de Venta">
       <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline">Órdenes de Venta</CardTitle>
                    <CardDescription className="font-body">Ingresa nuevas órdenes de venta y rastrea las existentes.</CardDescription>
                </div>
                <Button>
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
                  <TableCell>{order.amount}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'Completado' ? 'default' : 'secondary'}>{order.status}</Badge>
                  </TableCell>
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
                        <DropdownMenuItem>Ver Orden</DropdownMenuItem>
                        <DropdownMenuItem>Generar Factura</DropdownMenuItem>
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
