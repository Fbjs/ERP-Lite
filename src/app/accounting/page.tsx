"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

type Invoice = {
  id: string;
  client: string;
  date: string;
  total: string;
  status: 'Pagada' | 'Pendiente' | 'Vencida';
};

const initialInvoices: Invoice[] = [
  { id: 'F001', client: 'Panaderia San Jose', date: '2023-10-28', total: '$450.00', status: 'Pagada' },
  { id: 'F002', client: 'Cafe Central', date: '2023-10-28', total: '$1,200.50', status: 'Pendiente' },
  { id: 'F003', client: 'Supermercado del Sur', date: '2023-10-27', total: '$875.00', status: 'Pagada' },
  { id: 'F004', client: 'Restaurante El Tenedor', date: '2023-10-26', total: '$320.75', status: 'Vencida' },
];

export default function AccountingPage() {
    const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
    const searchParams = useSearchParams();
    const { toast } = useToast();

    useEffect(() => {
        const client = searchParams.get('client');
        const amount = searchParams.get('amount');

        if (client && amount) {
            const newInvoice: Invoice = {
                id: `F${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
                client,
                total: `$${parseFloat(amount).toLocaleString('es-CL')}`,
                date: new Date().toISOString().split('T')[0],
                status: 'Pendiente',
            };
            setInvoices(prev => [newInvoice, ...prev]);
            toast({
                title: "Factura Generada",
                description: `Se ha creado la factura para ${client}.`,
            });
            // Clean up URL to avoid creating invoice on refresh
            window.history.replaceState(null, '', '/accounting');
        }
    }, [searchParams, toast]);

  return (
    <AppLayout pageTitle="Contabilidad">
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline">Facturación y Cuentas</CardTitle>
                    <CardDescription className="font-body">Gestiona facturas, cuentas por pagar y cobrar.</CardDescription>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nueva Factura
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Factura No.</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString('es-CL')}</TableCell>
                  <TableCell>{invoice.total}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.status === 'Pagada' ? 'default' : invoice.status === 'Pendiente' ? 'secondary' : 'destructive'}>
                      {invoice.status}
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
                        <DropdownMenuItem>Ver Detalle</DropdownMenuItem>
                        <DropdownMenuItem>Enviar por Correo</DropdownMenuItem>
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
