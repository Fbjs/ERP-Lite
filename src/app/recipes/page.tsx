"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const recipes = [
  { id: 'REC001', name: 'Pain au Levain', ingredients: 5, cost: '$2.50', lastUpdated: '2023-10-26' },
  { id: 'REC002', name: 'Baguette Tradition', ingredients: 4, cost: '$1.80', lastUpdated: '2023-10-25' },
  { id: 'REC003', name: 'Croissant au Beurre', ingredients: 8, cost: '$3.10', lastUpdated: '2023-10-27' },
  { id: 'REC004', name: 'Ciabatta', ingredients: 4, cost: '$2.20', lastUpdated: '2023-10-24' },
];

export default function RecipesPage() {
  return (
    <AppLayout pageTitle="Recetas">
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline">Recetas</CardTitle>
                    <CardDescription className="font-body">Gestiona las recetas y costos de tus productos.</CardDescription>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nueva Receta
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID de Receta</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Ingredientes</TableHead>
                <TableHead>Costo por Unidad</TableHead>
                <TableHead>Última Actualización</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell className="font-medium">{recipe.id}</TableCell>
                  <TableCell>{recipe.name}</TableCell>
                  <TableCell>{recipe.ingredients}</TableCell>
                  <TableCell>{recipe.cost}</TableCell>
                  <TableCell>{recipe.lastUpdated}</TableCell>
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
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Eliminar</DropdownMenuItem>
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
