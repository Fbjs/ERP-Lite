
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
  id: string; // Internal ID for the recipe, corresponds to "Nombre FAMILIA"
  name: string; // "Nombre FAMILIA"
  ingredients: Ingredient[];
  formats: ProductFormat[]; // Each format is a specific product from "nombre producto"
  lastUpdated: string;
};

export const initialRecipes: Recipe[] = [
  {
    id: 'PAN_BLANCO',
    name: 'PAN BLANCO',
    ingredients: [
      { name: 'Harina de Trigo', quantity: 1, unit: 'kg' },
      { name: 'Agua', quantity: 0.6, unit: 'L' },
      { name: 'Levadura Fresca', quantity: 0.02, unit: 'kg'},
      { name: 'Sal de Mar', quantity: 0.02, unit: 'kg'}
    ],
    formats: [
      { sku: '400100', name: 'PAN BCO SIN GLUTEN', cost: 2100 },
      { sku: 'PSO10X10', name: 'PAN BLANCO SIN ORILLAS 10X105', cost: 1900 },
    ],
    lastUpdated: '2023-10-28',
  },
  {
    id: 'PAN_CENTENO',
    name: 'PAN CENTENO',
    ingredients: [
      { name: 'Harina de Centeno', quantity: 1, unit: 'kg' },
      { name: 'Agua', quantity: 0.75, unit: 'L' },
      { name: 'Levadura Fresca', quantity: 0.02, unit: 'kg'},
      { name: 'Sal de Mar', quantity: 0.02, unit: 'kg'}
    ],
    formats: [
      { sku: 'CERE0003', name: 'PAN LINAZA 500 GRS', cost: 2600 },
      { sku: 'CERE0027', name: 'PAN CHOCOSO CENTENO 500 GRS', cost: 2800 },
      { sku: 'CERE0041', name: 'PAN SCHWARZBROT 750 GRS', cost: 3100 },
      { sku: 'CERE0058', name: 'PAN GROB 100 INTEGRAL 750 GRS', cost: 3300 },
      { sku: 'CERE0065', name: 'PAN ROGGENBROT 600 GRS', cost: 2900 },
      { sku: 'CERE0188', name: 'PAN MULTICEREAL 500 GRS', cost: 2700 },
      { sku: 'CERE0607', name: 'PAN LANDBROT 500 GRS', cost: 2700 },
      { sku: 'PANPRUEBA', name: 'PAN PRUEBA', cost: 1100 },
    ],
    lastUpdated: '2023-10-28',
  },
  {
    id: 'PAN_INDUSTRIAL',
    name: 'PAN INDUSTRIAL',
    ingredients: [
      { name: 'Harina de Trigo', quantity: 1, unit: 'kg' },
      { name: 'Agua', quantity: 0.65, unit: 'L' },
      { name: 'Levadura Fresca', quantity: 0.025, unit: 'kg'},
      { name: 'Sal de Mar', quantity: 0.018, unit: 'kg'}
    ],
    formats: [
      { sku: 'GUABCO16', name: 'PAN GUAGUA BLANCA 16X16', cost: 4100 },
      { sku: 'GUAINT16', name: 'PAN GUAGUA INTEGRAL 16X16', cost: 4300 },
      { sku: 'GUAMUL1410', name: 'PAN GUAGUA MULTICEREAL 14X10', cost: 4600 },
      { sku: 'GUBL1332', name: 'PAN GUAGUA BLANCA 13X13', cost: 3900 },
      { sku: 'GUBL1432', name: 'PAN GUAGUA BLANCA 14X14', cost: 4000 },
      { sku: 'GUIN1332', name: 'PAN GUAGUA INTEGRAL 13X13', cost: 4200 },
      { sku: 'GUIN1432', name: 'PAN GUAGUA INTEGRAL MORENA 14X14', cost: 4400 },
      { sku: 'GUMC1438', name: 'PAN GUAGUA MULTICEREAL 14X10', cost: 4600 },
      { sku: 'MIGAARG22', name: 'PAN MIGA DE ARGENTINO', cost: 3600 },
      { sku: 'PANMUL1410', name: 'PAN GUAGUA MULTICEREAL 14X10', cost: 4600 },
    ],
    lastUpdated: '2023-10-28',
  },
  {
    id: 'PAN_INTEGRAL',
    name: 'PAN INTEGRAL',
    ingredients: [
      { name: 'Harina Integral', quantity: 1, unit: 'kg' },
      { name: 'Agua', quantity: 0.8, unit: 'L' },
      { name: 'Levadura Fresca', quantity: 0.02, unit: 'kg'},
      { name: 'Sal de Mar', quantity: 0.02, unit: 'kg'}
    ],
    formats: [
      { sku: 'ININ0232', name: 'PAN INTEGRAL LIGHT 550 GRS', cost: 2500 },
      { sku: 'SCHINT10', name: 'PAN SCHROTBROT 100 INTEGRAL 550 GRS', cost: 2900 },
    ],
    lastUpdated: '2023-10-28',
  },
  {
    id: 'PASTELERIA',
    name: 'PASTELERIA',
    ingredients: [
      { name: 'Harina de Trigo', quantity: 1, unit: 'kg' },
      { name: 'Azucar', quantity: 0.5, unit: 'kg' },
      { name: 'Levadura Fresca', quantity: 0.05, unit: 'kg'}
    ],
    formats: [
      { sku: 'TIPA0500', name: 'PAN PUMPERNICKEL 500 GRS', cost: 3600 },
      { sku: 'TIPA2700', name: 'PAN PUMPERNICKEL 1 K', cost: 6600 },
    ],
    lastUpdated: '2023-10-28',
  },
  {
    id: 'TOSTADAS',
    name: 'TOSTADAS',
    ingredients: [{ name: 'Pan Sobrante', quantity: 1, unit: 'kg' }],
    formats: [
      { sku: 'CROSMOL', name: 'TOSTADAS CROSTINI MERKEN', cost: 1600 },
      { sku: 'CROSOOL', name: 'TOSTADAS CROSTINI OREGANO', cost: 1600 },
      { sku: 'CRUT11MM', name: 'CRUTONES HOREADOS 1KG 11mm', cost: 4100 },
      { sku: 'CRUT11MM5', name: 'CRUTON HORNEADO 5KG 11MM', cost: 18100 },
      { sku: 'CRUT7MM', name: 'CRUTONES HORNEADOS 1KG 7mm', cost: 4100 },
      { sku: 'CRUT7MM5', name: 'CRUTONES HORNEADOS 5KG 7mm', cost: 18100 },
      { sku: 'CRUTOGRA', name: 'CRUTONES 1 K', cost: 4100 },
      { sku: 'GALLSEM', name: 'TOSTADAS VOLLKORN CRACKER', cost: 2600 },
      { sku: 'ININ0584', name: 'PAN RALLADO INTEGRAL 500 GRS', cost: 1600 },
      { sku: 'RALLADBCO', name: 'PAN RALLADO 1 K', cost: 2900 },
      { sku: 'RALLADBCO5', name: 'PAN RALLADO 5 KG', cost: 12100 },
      { sku: 'TOSTCOCKT', name: 'TOSTADAS COCKTAIL', cost: 2100 },
    ],
    lastUpdated: '2023-10-28',
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
      id: newRecipeData.name.toUpperCase().replace(/\s/g, '_'),
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setRecipes(prev => [newRecipe, ...prev]);
    setFormModalOpen(false);
    toast({
        title: "Familia Creada",
        description: `La familia de productos ${newRecipe.name} ha sido creada.`,
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
          title: "Familia Actualizada",
          description: `La familia ${updatedRecipe.name} ha sido actualizada.`,
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
                    <CardTitle className="font-headline">Familias de Productos y Recetas</CardTitle>
                    <CardDescription className="font-body">Gestiona las familias de productos, sus recetas base y los distintos formatos de venta.</CardDescription>
                </div>
                <Button onClick={() => handleOpenForm(null)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nueva Familia
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <Table className="responsive-table">
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Familia</TableHead>
                <TableHead>Nº de Productos</TableHead>
                <TableHead>Nº Ingredientes Base</TableHead>
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
                  <TableCell data-label="Actualizado">{new Date(recipe.lastUpdated + 'T00:00:00').toLocaleDateString('es-CL')}</TableCell>
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
            <DialogTitle className="font-headline">{selectedRecipe ? 'Editar Familia y Receta' : 'Crear Nueva Familia y Receta'}</DialogTitle>
            <DialogDescription className="font-body">
              {selectedRecipe ? 'Modifica los detalles de la familia, su receta y sus productos.' : 'Define una nueva familia, su receta base y sus productos asociados.'}
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
                Ficha de Familia de Productos - {selectedRecipe?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedRecipe && (
             <div ref={detailsModalContentRef} className="max-h-[70vh] overflow-y-auto font-body p-1 bg-white text-black rounded-md">
                <div className="p-6">
                    <div className="mb-6 text-center">
                        <p className="font-semibold text-gray-600">Última Actualización:</p>
                        <p>{new Date(selectedRecipe.lastUpdated + 'T00:00:00').toLocaleDateString('es-CL')}</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="font-headline text-xl mb-2 border-b pb-2">Productos (Formatos)</h3>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-black font-semibold">Código</TableHead>
                                        <TableHead className="text-black font-semibold">Nombre Producto</TableHead>
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
                            <h3 className="font-headline text-xl mb-2 border-b pb-2">Receta Base</h3>
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

    