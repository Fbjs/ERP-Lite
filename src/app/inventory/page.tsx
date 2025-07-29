"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

const inventoryItems = [
  { sku: 'HAR-001', name: 'Harina de Trigo', category: 'Materia Prima', stock: 1500, unit: 'kg', location: 'Bodega A-1' },
  { sku: 'LEV-002', name: 'Levadura Fresca', category: 'Materia Prima', stock: 250, unit: 'kg', location: 'Refrigerador 2' },
  { sku: 'SAL-003', name: 'Sal de Mar', category: 'Materia Prima', stock: 500, unit: 'kg', location: 'Bodega A-2' },
  { sku: 'PROD-PL-01', name: 'Pain au Levain', category: 'Producto Terminado', stock: 50, unit: 'unidades', location: 'Zona Despacho' },
  { sku: 'PROD-BG-01', name: 'Baguette Tradition', category: 'Producto Terminado', stock: 120, unit: 'unidades', location: 'Zona Despacho' },
  { sku: 'INS-EM-01', name: 'Bolsas de Papel', category: 'Insumo', stock: 5000, unit: 'unidades', location: 'Estante B-3' },
];

export default function InventoryPage() {
  return (
    <AppLayout pageTitle="Gestión de Inventario">
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline">Inventario</CardTitle>
                    <CardDescription className="font-body">Consulta y gestiona el stock de materias primas, insumos y productos terminados.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="search" placeholder="Buscar producto..." className="pl-8 sm:w-[300px]" />
                    </div>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nuevo Ítem
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryItems.map((item) => (
                <TableRow key={item.sku}>
                  <TableCell className="font-medium">{item.sku}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell>{item.stock} {item.unit}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Menú de acciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem>Ajustar Stock</DropdownMenuItem>
                        <DropdownMenuItem>Ver Historial</DropdownMenuItem>
                        <DropdownMenuItem>Editar Ítem</DropdownMenuItem>
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
