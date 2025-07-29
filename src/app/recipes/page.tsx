"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import RecipeForm from '@/components/recipe-form';
import { useState } from 'react';

export type Ingredient = {
    name: string;
    quantity: number;
    unit: string;
};

export type Recipe = {
  id: string;
  name: string;
  ingredients: Ingredient[];
  cost: number;
  lastUpdated: string;
};

const initialRecipes: Recipe[] = [
  { id: 'REC001', name: 'Pain au Levain', ingredients: [{name: 'Harina', quantity: 1, unit: 'kg'}, {name: 'Agua', quantity: 0.7, unit: 'L'}, {name: 'Masa Madre', quantity: 0.2, unit: 'kg'}, {name: 'Sal', quantity: 0.02, unit: 'kg'}], cost: 2.50, lastUpdated: '2023-10-26' },
  { id: 'REC002', name: 'Baguette Tradition', ingredients: [{name: 'Harina', quantity: 1, unit: 'kg'}, {name: 'Agua', quantity: 0.65, unit: 'L'}, {name: 'Levadura', quantity: 0.01, unit: 'kg'}, {name: 'Sal', quantity: 0.02, unit: 'kg'}], cost: 1.80, lastUpdated: '2023-10-25' },
  { id: 'REC003', name: 'Croissant au Beurre', ingredients: [{name: 'Harina', quantity: 1, unit: 'kg'}, {name: 'Mantequilla', quantity: 0.5, unit: 'kg'}, {name: 'Azucar', quantity: 0.1, unit: 'kg'}, {name: 'Leche', quantity: 0.4, unit: 'L'}], cost: 3.10, lastUpdated: '2023-10-27' },
  { id: 'REC004', name: 'Ciabatta', ingredients: [{name: 'Harina', quantity: 1, unit: 'kg'}, {name: 'Agua', quantity: 0.8, unit: 'L'}, {name: 'Levadura', quantity: 0.005, unit: 'kg'}, {name: 'Sal', quantity: 0.02, unit: 'kg'}], cost: 2.20, lastUpdated: '2023-10-24' },
];

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [isNewRecipeModalOpen, setNewRecipeModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const handleCreateRecipe = (newRecipeData: Omit<Recipe, 'id' | 'lastUpdated'>) => {
    const newRecipe: Recipe = {
      ...newRecipeData,
      id: `REC${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setRecipes(prev => [newRecipe, ...prev]);
    setNewRecipeModalOpen(false);
  };

  const handleOpenDetails = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setDetailsModalOpen(true);
  };

  return (
    <AppLayout pageTitle="Recetas">
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline">Recetas</CardTitle>
                    <CardDescription className="font-body">Gestiona las recetas y costos de tus productos.</CardDescription>
                </div>
                <Button onClick={() => setNewRecipeModalOpen(true)}>
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
                <TableHead>Nº Ingredientes</TableHead>
                <TableHead>Costo por Unidad</TableHead>
                <TableHead>Última Actualización</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipes.map((recipe) => (
                <TableRow key={recipe.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => handleOpenDetails(recipe)}>
                  <TableCell className="font-medium">{recipe.id}</TableCell>
                  <TableCell>{recipe.name}</TableCell>
                  <TableCell>{recipe.ingredients.length}</TableCell>
                  <TableCell>${recipe.cost.toFixed(2)}</TableCell>
                  <TableCell>{recipe.lastUpdated}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenDetails(recipe)}>Ver Detalles</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Nueva Receta */}
      <Dialog open={isNewRecipeModalOpen} onOpenChange={setNewRecipeModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Crear Nueva Receta</DialogTitle>
            <DialogDescription className="font-body">
              Define el producto y sus ingredientes.
            </DialogDescription>
          </DialogHeader>
          <RecipeForm
            onSubmit={handleCreateRecipe}
            onCancel={() => setNewRecipeModalOpen(false)}
            />
        </DialogContent>
      </Dialog>
      
      {/* Modal Ver Detalles */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedRecipe?.name}</DialogTitle>
            <DialogDescription className="font-body">
             Lista de ingredientes y cantidades para una unidad.
            </DialogDescription>
          </DialogHeader>
          {selectedRecipe && (
             <div className="max-h-[60vh] overflow-y-auto font-body p-1">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ingrediente</TableHead>
                            <TableHead className="text-right">Cantidad</TableHead>
                            <TableHead>Unidad</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedRecipe.ingredients.map((ing, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{ing.name}</TableCell>
                                <TableCell className="text-right">{ing.quantity}</TableCell>
                                <TableCell>{ing.unit}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
             </div>
          )}
           <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>Cerrar</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </AppLayout>
  );
}
