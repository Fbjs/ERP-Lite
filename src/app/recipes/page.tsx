
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
import { ScrollArea } from '@/components/ui/scroll-area';


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
  id: string; // SKU from the sheet, e.g., '400100'
  name: string; // "nombre producto" from the sheet, e.g., 'PAN BCO SIN GLUTEN'
  family: string; // "Nombre FAMILIA" from the sheet, e.g., 'PAN BLANCO'
  cost: number;
  ingredients: Ingredient[];
  formats: ProductFormat[];
  lastUpdated: string;
};


export const initialRecipes: Recipe[] = [
  { id: '400100', name: 'PAN BCO SIN GLUTEN', family: 'PAN BLANCO', cost: 2100, ingredients: [], formats: [{sku: '400100', name: 'Formato Estándar', cost: 2100}], lastUpdated: '2023-10-28' },
  { id: 'PSO10X10', name: 'PAN BLANCO SIN ORILLAS 10X105', family: 'PAN BLANCO', cost: 1900, ingredients: [], formats: [{sku: 'PSO10X10', name: 'Formato Estándar', cost: 1900}], lastUpdated: '2023-10-28' },
  { id: 'CERE0003', name: 'PAN LINAZA 500 GRS', family: 'PAN CENTENO', cost: 2600, ingredients: [], formats: [{sku: 'CERE0003', name: '500 GRS', cost: 2600}], lastUpdated: '2023-10-28' },
  { id: 'CERE0027', name: 'PAN CHOCOSO CENTENO 500 GRS', family: 'PAN CENTENO', cost: 2800, ingredients: [], formats: [{sku: 'CERE0027', name: '500 GRS', cost: 2800}], lastUpdated: '2023-10-28' },
  { id: 'CERE0041', name: 'PAN SCHWARZBROT 750 GRS', family: 'PAN CENTENO', cost: 3100, ingredients: [], formats: [{sku: 'CERE0041', name: '750 GRS', cost: 3100}], lastUpdated: '2023-10-28' },
  { id: 'CERE0058', name: 'PAN GROB 100 INTEGRAL 750 GRS', family: 'PAN CENTENO', cost: 3300, ingredients: [], formats: [{sku: 'CERE0058', name: '750 GRS', cost: 3300}], lastUpdated: '2023-10-28' },
  { id: 'CERE0065', name: 'PAN ROGGENBROT 600 GRS', family: 'PAN CENTENO', cost: 2900, ingredients: [], formats: [{sku: 'CERE0065', name: '600 GRS', cost: 2900}], lastUpdated: '2023-10-28' },
  { id: 'CERE0188', name: 'PAN MULTICEREAL 500 GRS', family: 'PAN CENTENO', cost: 2700, ingredients: [], formats: [{sku: 'CERE0188', name: '500 GRS', cost: 2700}], lastUpdated: '2023-10-28' },
  { id: 'CERE0607', name: 'PAN LANDBROT 500 GRS', family: 'PAN CENTENO', cost: 2700, ingredients: [], formats: [{sku: 'CERE0607', name: '500 GRS', cost: 2700}], lastUpdated: '2023-10-28' },
  { id: 'PANPRUEBA', name: 'PAN PRUEBA', family: 'PAN CENTENO', cost: 1100, ingredients: [], formats: [{sku: 'PANPRUEBA', name: 'Formato Estándar', cost: 1100}], lastUpdated: '2023-10-28' },
  { id: 'GUABCO16', name: 'PAN GUAGUA BLANCA 16X16', family: 'PAN INDUSTRIAL', cost: 4100, ingredients: [], formats: [{sku: 'GUABCO16', name: '16X16', cost: 4100}], lastUpdated: '2023-10-28' },
  { id: 'GUAINT16', name: 'PAN GUAGUA INTEGRAL 16X16', family: 'PAN INDUSTRIAL', cost: 4300, ingredients: [], formats: [{sku: 'GUAINT16', name: '16X16', cost: 4300}], lastUpdated: '2023-10-28' },
  { id: 'GUAMUL1410', name: 'PAN GUAGUA MULTICEREAL 14X10', family: 'PAN INDUSTRIAL', cost: 4600, ingredients: [], formats: [{sku: 'GUAMUL1410', name: '14X10', cost: 4600}], lastUpdated: '2023-10-28' },
  { id: 'GUBL1332', name: 'PAN GUAGUA BLANCA 13X13', family: 'PAN INDUSTRIAL', cost: 3900, ingredients: [], formats: [{sku: 'GUBL1332', name: '13X13', cost: 3900}], lastUpdated: '2023-10-28' },
  { id: 'GUBL1432', name: 'PAN GUAGUA BLANCA 14X14', family: 'PAN INDUSTRIAL', cost: 4000, ingredients: [], formats: [{sku: 'GUBL1432', name: '14X14', cost: 4000}], lastUpdated: '2023-10-28' },
  { id: 'GUIN1332', name: 'PAN GUAGUA INTEGRAL 13X13', family: 'PAN INDUSTRIAL', cost: 4200, ingredients: [], formats: [{sku: 'GUIN1332', name: '13X13', cost: 4200}], lastUpdated: '2023-10-28' },
  { id: 'GUIN1432', name: 'PAN GUAGUA INTEGRAL MORENA 14X14', family: 'PAN INDUSTRIAL', cost: 4400, ingredients: [], formats: [{sku: 'GUIN1432', name: '14X14', cost: 4400}], lastUpdated: '2023-10-28' },
  { id: 'GUMC1438', name: 'PAN GUAGUA MULTICEREAL 14X10', family: 'PAN INDUSTRIAL', cost: 4600, ingredients: [], formats: [{sku: 'GUMC1438', name: '14X10', cost: 4600}], lastUpdated: '2023-10-28' },
  { id: 'MIGAARG22', name: 'PAN MIGA DE ARGENTINO', family: 'PAN INDUSTRIAL', cost: 3600, ingredients: [], formats: [{sku: 'MIGAARG22', name: 'Formato Estándar', cost: 3600}], lastUpdated: '2023-10-28' },
  { id: 'PANMUL1410', name: 'PAN GUAGUA MULTICEREAL 14X10', family: 'PAN INDUSTRIAL', cost: 4600, ingredients: [], formats: [{sku: 'PANMUL1410', name: '14X10', cost: 4600}], lastUpdated: '2023-10-28' },
  { id: 'ININ0232', name: 'PAN INTEGRAL LIGHT 550 GRS', family: 'PAN INTEGRAL', cost: 2500, ingredients: [], formats: [{sku: 'ININ0232', name: '550 GRS', cost: 2500}], lastUpdated: '2023-10-28' },
  { id: 'SCHINT10', name: 'PAN SCHROTBROT 100 INTEGRAL 550 GRS', family: 'PAN INTEGRAL', cost: 2900, ingredients: [], formats: [{sku: 'SCHINT10', name: '550 GRS', cost: 2900}], lastUpdated: '2023-10-28' },
  { id: 'TIPA0500', name: 'PAN PUMPERNICKEL 500 GRS', family: 'PASTELERIA', cost: 3600, ingredients: [], formats: [{sku: 'TIPA0500', name: '500 GRS', cost: 3600}], lastUpdated: '2023-10-28' },
  { id: 'TIPA2700', name: 'PAN PUMPERNICKEL 1 K', family: 'PASTELERIA', cost: 6600, ingredients: [], formats: [{sku: 'TIPA2700', name: '1 K', cost: 6600}], lastUpdated: '2023-10-28' },
  { id: 'CROSMOL', name: 'TOSTADAS CROSTINI MERKEN', family: 'TOSTADAS', cost: 1600, ingredients: [], formats: [{sku: 'CROSMOL', name: 'MERKEN', cost: 1600}], lastUpdated: '2023-10-28' },
  { id: 'CROSOOL', name: 'TOSTADAS CROSTINI OREGANO', family: 'TOSTADAS', cost: 1600, ingredients: [], formats: [{sku: 'CROSOOL', name: 'OREGANO', cost: 1600}], lastUpdated: '2023-10-28' },
  { id: 'CRUT11MM', name: 'CRUTONES HOREADOS 1KG 11mm', family: 'TOSTADAS', cost: 4100, ingredients: [], formats: [{sku: 'CRUT11MM', name: '11mm', cost: 4100}], lastUpdated: '2023-10-28' },
  { id: 'CRUT11MM5', name: 'CRUTON HORNEADO 5KG 11MM', family: 'TOSTADAS', cost: 18100, ingredients: [], formats: [{sku: 'CRUT11MM5', name: '11mm', cost: 18100}], lastUpdated: '2023-10-28' },
  { id: 'CRUT7MM', name: 'CRUTONES HORNEADOS 1KG 7mm', family: 'TOSTADAS', cost: 4100, ingredients: [], formats: [{sku: 'CRUT7MM', name: '7mm', cost: 4100}], lastUpdated: '2023-10-28' },
  { id: 'CRUT7MM5', name: 'CRUTONES HORNEADOS 5KG 7mm', family: 'TOSTADAS', cost: 18100, ingredients: [], formats: [{sku: 'CRUT7MM5', name: '7mm', cost: 18100}], lastUpdated: '2023-10-28' },
  { id: 'CRUTOGRA', name: 'CRUTONES 1 K', family: 'TOSTADAS', cost: 4100, ingredients: [], formats: [{sku: 'CRUTOGRA', name: 'Formato Estándar', cost: 4100}], lastUpdated: '2023-10-28' },
  { id: 'GALLSEM', name: 'TOSTADAS VOLLKORN CRACKER', family: 'TOSTADAS', cost: 2600, ingredients: [], formats: [{sku: 'GALLSEM', name: 'Formato Estándar', cost: 2600}], lastUpdated: '2023-10-28' },
  { id: 'ININ0584', name: 'PAN RALLADO INTEGRAL 500 GRS', family: 'TOSTADAS', cost: 1600, ingredients: [], formats: [{sku: 'ININ0584', name: '500 GRS', cost: 1600}], lastUpdated: '2023-10-28' },
  { id: 'RALLADBCO', name: 'PAN RALLADO 1 K', family: 'TOSTADAS', cost: 2900, ingredients: [], formats: [{sku: 'RALLADBCO', name: '1 K', cost: 2900}], lastUpdated: '2023-10-28' },
  { id: 'RALLADBCO5', name: 'PAN RALLADO 5 KG', family: 'TOSTADAS', cost: 12100, ingredients: [], formats: [{sku: 'RALLADBCO5', name: '5 KG', cost: 12100}], lastUpdated: '2023-10-28' },
  { id: 'TOSTCOCKT', name: 'TOSTADAS COCKTAIL', family: 'TOSTADAS', cost: 2100, ingredients: [], formats: [{sku: 'TOSTCOCKT', name: 'Formato Estándar', cost: 2100}], lastUpdated: '2023-10-28' }
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
        title: "Receta Creada",
        description: `La receta ${newRecipe.name} ha sido creada.`,
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
          description: `La receta ${updatedRecipe.name} ha sido actualizada.`,
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
                    <CardDescription className="font-body">Gestiona los productos, sus recetas base y categorías (familias).</CardDescription>
                </div>
                <Button onClick={() => handleOpenForm(null)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nueva Receta
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table className="responsive-table relative">
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>SKU / Código</TableHead>
                  <TableHead>Nombre Producto (Receta)</TableHead>
                  <TableHead>Familia</TableHead>
                  <TableHead>Última Actualización</TableHead>
                  <TableHead>
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
            </Table>
            <ScrollArea className="h-[calc(100vh-350px)]">
              <Table className="responsive-table">
                <TableBody>
                  {recipes.map((recipe) => (
                    <TableRow key={recipe.id} className="hover:bg-muted/50">
                      <TableCell data-label="SKU" className="font-mono">{recipe.id}</TableCell>
                      <TableCell data-label="Nombre" className="font-medium">{recipe.name}</TableCell>
                      <TableCell data-label="Familia">{recipe.family}</TableCell>
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
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Modal Nueva/Editar Receta */}
      <Dialog open={isFormModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedRecipe ? 'Editar Receta de Producto' : 'Crear Nueva Receta de Producto'}</DialogTitle>
            <DialogDescription className="font-body">
              {selectedRecipe ? `Modifica los detalles para "${selectedRecipe.name}".` : 'Define un nuevo producto, su familia y su receta base.'}
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
                Ficha de Producto - {selectedRecipe?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedRecipe && (
             <div ref={detailsModalContentRef} className="max-h-[70vh] overflow-y-auto font-body p-1 bg-white text-black rounded-md">
                <div className="p-6">
                    <div className="mb-6 text-center">
                        <p className="font-semibold text-gray-600">Familia:</p>
                        <p className="text-lg font-bold font-headline">{selectedRecipe.family}</p>
                    </div>

                    <div className="space-y-6">
                       <div>
                            <h3 className="font-headline text-xl mb-2 border-b pb-2">Receta Base</h3>
                            {selectedRecipe.ingredients.length > 0 ? (
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
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No hay ingredientes definidos para esta receta.</p>
                            )}
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
