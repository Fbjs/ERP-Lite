
"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Download } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import RecipeForm from '@/components/recipe-form';
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export type Ingredient = {
    name: string;
    quantity: number;
    unit: string;
};

export type ProductFormat = {
  sku: string;
  name: string;
  cost: number;
};

export type Recipe = {
  id: string; // Internal ID for the recipe
  name: string; // Base product name
  ingredients: Ingredient[];
  formats: ProductFormat[];
  lastUpdated: string;
};

export const initialRecipes: Recipe[] = [
  { id: 'REC-001', name: 'Pain au Levain', ingredients: [{name: 'Harina de Trigo', quantity: 1, unit: 'kg'}, {name: 'Agua', quantity: 0.7, unit: 'L'}, {name: 'Masa Madre', quantity: 0.2, unit: 'kg'}, {name: 'Sal de Mar', quantity: 0.02, unit: 'kg'}], 
    formats: [
        { sku: 'PROD-PL-700', name: 'Unidad de 700g', cost: 2500 },
        { sku: 'PROD-PL-1400', name: 'Unidad de 1400g', cost: 4800 },
    ], 
    lastUpdated: '2023-10-26' 
  },
  { id: 'REC-002', name: 'Baguette Tradition', ingredients: [{name: 'Harina de Trigo', quantity: 1, unit: 'kg'}, {name: 'Agua', quantity: 0.65, unit: 'L'}, {name: 'Levadura Fresca', quantity: 0.01, unit: 'kg'}, {name: 'Sal de Mar', quantity: 0.02, unit: 'kg'}], 
    formats: [
        { sku: 'PROD-BG-250', name: 'Unidad de 250g', cost: 1800 },
    ],
    lastUpdated: '2023-10-25' },
  { id: 'REC-003', name: 'Croissant au Beurre', ingredients: [{name: 'Harina de Trigo', quantity: 1, unit: 'kg'}, {name: 'Mantequilla', quantity: 0.5, unit: 'kg'}, {name: 'Azucar', quantity: 0.1, unit: 'kg'}, {name: 'Leche', quantity: 0.4, unit: 'L'}], 
    formats: [
        { sku: 'PROD-CR-U', name: 'Unidad', cost: 3100 },
    ],
    lastUpdated: '2023-10-27' },
  { id: 'REC-004', name: 'Ciabatta', ingredients: [{name: 'Harina de Trigo', quantity: 1, unit: 'kg'}, {name: 'Agua', quantity: 0.8, unit: 'L'}, {name: 'Levadura Fresca', quantity: 0.005, unit: 'kg'}, {name: 'Sal de Mar', quantity: 0.02, unit: 'kg'}], 
    formats: [
        { sku: 'PROD-CB-300', name: 'Unidad de 300g', cost: 2200 },
    ],
    lastUpdated: '2023-10-24' },
  { id: 'REC-005', name: 'Pan Rallado', ingredients: [{name: 'Pan Sobrante', quantity: 1, unit: 'kg'}],
    formats: [
        { sku: 'PROD-PR-500', name: 'Bolsa 500g', cost: 1500 },
        { sku: 'PROD-PR-1000', name: 'Bolsa 1kg', cost: 2800 },
    ], 
    lastUpdated: '2023-10-28' 
  },
];

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const detailsModalContentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleCreateRecipe = (newRecipeData: Omit<Recipe, 'id' | 'lastUpdated'>) => {
    const newRecipe: Recipe = {
      ...newRecipeData,
      id: `REC-${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setRecipes(prev => [newRecipe, ...prev]);
    setFormModalOpen(false);
    toast({
        title: "Receta Creada",
        description: `La receta para ${newRecipe.name} ha sido creada.`,
    });
  };
  
  const handleUpdateRecipe = (updatedRecipeData: Omit<Recipe, 'id' | 'lastUpdated'>) => {
      if (!selectedRecipe) return;
      
      const updatedRecipe: Recipe = {
          ...updatedRecipeData,
          id: selectedRecipe.id,
          lastUpdated: new Date().toISOString().split('T')[0],
      };
      
      setRecipes(recipes.map(r => r.id === selectedRecipe.id ? updatedRecipe : r));
      setFormModalOpen(false);
      setSelectedRecipe(null);
      toast({
          title: "Receta Actualizada",
          description: `La receta para ${updatedRecipe.name} ha sido actualizada.`,
      });
  }

  const handleOpenDetails = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setDetailsModalOpen(true);
  };

  const handleOpenForm = (recipe: Recipe | null) => {
      setSelectedRecipe(recipe);
      setFormModalOpen(true);
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
        pdf.save(`receta-${selectedRecipe?.id}.pdf`);
        toast({
            title: "PDF Descargado",
            description: `La receta ${selectedRecipe?.name} ha sido descargada.`,
        });
    }
  };

  return (
    <AppLayout pageTitle="Recetas">
      <Card>
        <CardHeader>
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <CardTitle className="font-headline">Recetas y Productos</CardTitle>
                    <CardDescription className="font-body">Gestiona las recetas base y los distintos formatos de venta de tus productos.</CardDescription>
                </div>
                <Button onClick={() => handleOpenForm(null)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nueva Receta
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <Table className="responsive-table">
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Producto</TableHead>
                <TableHead>Formatos de Venta</TableHead>
                <TableHead>Nº Ingredientes</TableHead>
                <TableHead>Última Actualización</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipes.map((recipe) => (
                <TableRow key={recipe.id} className="hover:bg-muted/50">
                  <TableCell data-label="Nombre" className="font-medium">{recipe.name}</TableCell>
                  <TableCell data-label="Formatos">{recipe.formats.length}</TableCell>
                  <TableCell data-label="Nº Ingredientes">{recipe.ingredients.length}</TableCell>
                  <TableCell data-label="Actualizado">{recipe.lastUpdated}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleOpenDetails(recipe)}>Ver Detalles</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenForm(recipe)}>Editar</DropdownMenuItem>
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

      {/* Modal Nueva/Editar Receta */}
      <Dialog open={isFormModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedRecipe ? 'Editar Receta' : 'Crear Nueva Receta'}</DialogTitle>
            <DialogDescription className="font-body">
              {selectedRecipe ? 'Modifica los detalles de la receta y sus formatos de venta.' : 'Define el producto, sus ingredientes y los formatos de venta.'}
            </DialogDescription>
          </DialogHeader>
          <RecipeForm
            onSubmit={selectedRecipe ? handleUpdateRecipe : handleCreateRecipe}
            onCancel={() => setFormModalOpen(false)}
            initialData={selectedRecipe || undefined}
            />
        </DialogContent>
      </Dialog>
      
      {/* Modal Ver Detalles */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedRecipe?.name}</DialogTitle>
             <DialogDescription className="font-body">
                Ficha de Receta - {selectedRecipe?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedRecipe && (
             <div ref={detailsModalContentRef} className="max-h-[70vh] overflow-y-auto font-body p-1 bg-white text-black rounded-md">
                <div className="p-6">
                    <div className="mb-6 text-center">
                        <p className="font-semibold text-gray-600">Última Actualización:</p>
                        <p>{selectedRecipe.lastUpdated}</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="font-headline text-xl mb-2 border-b pb-2">Formatos de Venta</h3>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-black font-semibold">SKU</TableHead>
                                        <TableHead className="text-black font-semibold">Nombre Formato</TableHead>
                                        <TableHead className="text-right text-black font-semibold">Costo</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedRecipe.formats.map((format) => (
                                        <TableRow key={format.sku} className="border-gray-200">
                                            <TableCell className="font-mono">{format.sku}</TableCell>
                                            <TableCell className="font-medium">{format.name}</TableCell>
                                            <TableCell className="text-right">${format.cost.toLocaleString('es-CL')}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        
                        <div>
                            <h3 className="font-headline text-xl mb-2 border-b pb-2">Ingredientes Base</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-black font-semibold">Ingrediente</TableHead>
                                        <TableHead className="text-right text-black font-semibold">Cantidad</TableHead>
                                        <TableHead className="text-black font-semibold">Unidad</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedRecipe.ingredients.map((ing, index) => (
                                        <TableRow key={index} className="border-gray-200">
                                            <TableCell className="font-medium">{ing.name}</TableCell>
                                            <TableCell className="text-right">{ing.quantity}</TableCell>
                                            <TableCell>{ing.unit}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    
                    <div className="border-t-2 border-gray-200 pt-4 mt-6 text-center text-xs text-gray-500">
                        <p>Documento generado el {new Date().toLocaleDateString('es-ES')}</p>
                    </div>
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

    </AppLayout>
  );
}
