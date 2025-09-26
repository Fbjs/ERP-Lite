
"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import RecipeForm from '@/components/recipe-form';
import { useState, useRef, ComponentProps, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import ProductionPage from '../production/page';
import Logo from '@/components/logo';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { initialInventoryItems } from '@/app/inventory/page';


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
  id: string; // SKU from the sheet, e.g., 'GUAGUA-BLANCA-16X16'
  name: string; // "PRODUCTO" from the sheet, e.g., 'GUAGUA BLANCA 16X16'
  family: string; // "Nombre FAMILIA" from the sheet, e.g., 'PAN BLANCO'
  ingredients: Ingredient[];
  formats: ProductFormat[];
  lastUpdated: string;
  capacityPerMold?: number;
};


export const initialRecipes: Recipe[] = [
  { 
    id: 'GUABCO16', name: 'PAN GUAGUA BLANCA 16X16', family: 'PAN INDUSTRIAL', capacityPerMold: 144,
    ingredients: [
        { name: 'Harina de Trigo', quantity: 0.5, unit: 'kg' },
        { name: 'Agua', quantity: 0.3, unit: 'L' },
        { name: 'Levadura Fresca', quantity: 0.02, unit: 'kg' },
        { name: 'Sal de Mar', quantity: 0.01, unit: 'kg' },
        { name: 'Masa Madre Blanca (MMB)', quantity: 0.1, unit: 'kg' },
    ], 
    formats: [{sku: 'GUABCO16-9.5', name: 'C/O - 9,5 mm', cost: 4100}], 
    lastUpdated: '2023-10-28' 
  },
  { 
    id: 'GUBL1332', name: 'PAN GUAGUA BLANCA 13X13', family: 'PAN INDUSTRIAL', capacityPerMold: 32,
    ingredients: [
        { name: 'Harina de Trigo', quantity: 0.4, unit: 'kg' },
        { name: 'Agua', quantity: 0.25, unit: 'L' },
        { name: 'Levadura Fresca', quantity: 0.015, unit: 'kg' },
        { name: 'Sal de Mar', quantity: 0.008, unit: 'kg' },
        { name: 'Masa Madre Blanca (MMB)', quantity: 0.08, unit: 'kg' },
    ], 
    formats: [{sku: 'GUBL1332-11', name: 'C/O - 11 mm', cost: 3900}], 
    lastUpdated: '2023-10-28' 
  },
  { 
    id: 'GUBL1432', name: 'PAN GUAGUA BLANCA 14X14', family: 'PAN INDUSTRIAL', capacityPerMold: 30,
    ingredients: [
      { name: 'Harina de Trigo', quantity: 0.45, unit: 'kg' },
      { name: 'Agua', quantity: 0.28, unit: 'L' },
      { name: 'Levadura Fresca', quantity: 0.018, unit: 'kg' },
      { name: 'Sal de Mar', quantity: 0.009, unit: 'kg' },
      { name: 'Masa Madre Blanca (MMB)', quantity: 0.09, unit: 'kg' },
    ], 
    formats: [{sku: 'GUBL1432-9.5', name: 'S/O - 9,5 mm', cost: 4000}], 
    lastUpdated: '2023-10-28' 
  },
  { 
    id: 'MIGAARG22', name: 'PAN MIGA DE ARGENTINO', family: 'PAN INDUSTRIAL', capacityPerMold: 1,
    ingredients: [], 
    formats: [{sku: 'MIGAARG22-11', name: 'S/O - 11 mm', cost: 3600}], 
    lastUpdated: '2023-10-28' 
  },
  { 
    id: 'GUAINT16', name: 'PAN GUAGUA INTEGRAL 16X16', family: 'PAN INDUSTRIAL', 
    ingredients: [
        { name: 'Harina Integral', quantity: 0.6, unit: 'kg' },
        { name: 'Agua', quantity: 0.4, unit: 'L' },
        { name: 'Levadura Fresca', quantity: 0.02, unit: 'kg' },
        { name: 'Sal de Mar', quantity: 0.01, unit: 'kg' },
        { name: 'Masa Madre de Trigo (MMT)', quantity: 0.12, unit: 'kg' },
    ], 
    formats: [{sku: 'GUAINT16-7', name: '16x16 - 7 mm', cost: 4300}], 
    lastUpdated: '2023-10-28' 
  },
  { 
    id: 'GUIN1332', name: 'PAN GUAGUA INTEGRAL 13X13', family: 'PAN INDUSTRIAL', 
    ingredients: [], 
    formats: [{sku: 'GUIN1332-7', name: '16x38 - 7 mm', cost: 4200}], 
    lastUpdated: '2023-10-28' 
  },
  { 
    id: 'GUIN1432', name: 'PAN GUAGUA INTEGRAL 14X14', family: 'PAN INDUSTRIAL', 
    ingredients: [], 
    formats: [{sku: 'GUIN1432-1K', name: '1K', cost: 4400}], 
    lastUpdated: '2023-10-28' 
  },
  { 
    id: 'GUMC1438', name: 'PAN GUAGUA MULTICEREAL 14X10', family: 'PAN INDUSTRIAL', capacityPerMold: 16,
    ingredients: [], 
    formats: [{sku: 'GUMC1438-2K', name: '14x2k', cost: 4600}], 
    lastUpdated: '2023-10-28' 
  },
  { 
    id: 'PANMUL1410', name: 'PAN GUAGUA LINAZA 14X10', family: 'PAN INDUSTRIAL', 
    ingredients: [], 
    formats: [{sku: 'PANMUL1410-5K', name: '5k', cost: 4600}], 
    lastUpdated: '2023-10-28' 
  },
  { 
    id: 'RALLADBCO', name: 'PAN RALLADO', family: 'TOSTADAS', 
    ingredients: [
        { name: 'Pan Sobrante', quantity: 1, unit: 'kg'}
    ], 
    formats: [{sku: 'RALLADBCO-10K', name: '10K', cost: 2900}], 
    lastUpdated: '2023-10-28' 
  },
  { 
    id: 'TIPA0500', name: 'PUMPERNICKEL 500 GRS', family: 'PASTELERIA', capacityPerMold: 29,
    ingredients: [
        { name: 'Harina de Centeno', quantity: 0.7, unit: 'kg' },
        { name: 'Agua', quantity: 0.5, unit: 'L' },
        { name: 'Levadura Fresca', quantity: 0.01, unit: 'kg' },
        { name: 'Sal de Mar', quantity: 0.01, unit: 'kg' },
        { name: 'Masa Madre de Centeno (MMC)', quantity: 0.2, unit: 'kg' },
    ], 
    formats: [{sku: 'TIPA0500-40K', name: '40K', cost: 3600}], 
    lastUpdated: '2023-10-28' 
  },
  { 
    id: '400100', name: 'PAN BCO SIN GLUTEN', family: 'PAN BLANCO', 
    ingredients: [], 
    formats: [{sku: '400100-7', name: '7 mm', cost: 2100}], 
    lastUpdated: '2023-10-28' 
  },
  { 
    id: 'CRUT7MM', name: 'CRUTONES HORNEADOS 1KG 7mm', family: 'TOSTADAS', 
    ingredients: [
        { name: 'Pan Sobrante', quantity: 1, unit: 'kg'},
        { name: 'Aceite de Oliva', quantity: 0.05, unit: 'L'},
    ], 
    formats: [{sku: 'CRUT7MM-C12', name: '1 CAJA X 12 UNI', cost: 4100}], 
    lastUpdated: '203-10-28' 
  },
  { 
    id: 'CRUT11MM', name: 'CRUTONES HOREADOS 1KG 11mm', family: 'TOSTADAS', 
    ingredients: [
        { name: 'Pan Sobrante', quantity: 1, unit: 'kg'},
        { name: 'Aceite de Oliva', quantity: 0.05, unit: 'L'},
    ], 
    formats: [{sku: 'CRUT11MM-U10', name: '10 UNIDADES', cost: 4100}], 
    lastUpdated: '2023-10-28' 
  },
  { 
    id: 'CERE0041', name: 'PAN SCHWARZBROT 750 GRS', family: 'PAN CENTENO', capacityPerMold: 1050,
    ingredients: [
        { name: 'Harina de Centeno', quantity: 0.8, unit: 'kg' },
        { name: 'Agua', quantity: 0.6, unit: 'L' },
        { name: 'Sal de Mar', quantity: 0.015, unit: 'kg' },
        { name: 'Masa Madre de Centeno (MMC)', quantity: 0.15, unit: 'kg' },
    ], 
    formats: [], 
    lastUpdated: '2023-10-28' 
  },
   { 
    id: 'CERE0027', name: 'PAN CHOCOSO CENTENO 500 GRS', family: 'PAN CENTENO', capacityPerMold: 240,
    ingredients: [
        { name: 'Harina de Centeno', quantity: 0.5, unit: 'kg' },
        { name: 'Agua', quantity: 0.35, unit: 'L' },
        { name: 'Cacao en Polvo', quantity: 0.05, unit: 'kg' },
        { name: 'Azucar', quantity: 0.1, unit: 'kg' },
        { name: 'Masa Madre de Centeno (MMC)', quantity: 0.1, unit: 'kg' },
    ], 
    formats: [], 
    lastUpdated: '2023-10-28' 
  },
  { 
    id: '058', name: 'GROB', family: 'PAN CENTENO', capacityPerMold: 350,
    ingredients: [], 
    formats: [], 
    lastUpdated: '2023-10-28' 
  },
  { 
    id: '003', name: 'RUSTICO LINAZA', family: 'PAN CENTENO', capacityPerMold: 440,
     ingredients: [
        { name: 'Harina de Trigo', quantity: 0.3, unit: 'kg' },
        { name: 'Harina de Centeno', quantity: 0.2, unit: 'kg' },
        { name: 'Semillas de Linaza', quantity: 0.05, unit: 'kg' },
        { name: 'Agua', quantity: 0.3, unit: 'L' },
        { name: 'Sal de Mar', quantity: 0.01, unit: 'kg' },
        { name: 'Masa Madre de Trigo (MMT)', quantity: 0.1, unit: 'kg' },
    ], 
    formats: [], 
    lastUpdated: '2023-10-28' 
  },
   { 
    id: '188', name: 'RUSTICO MULTI', family: 'PAN CENTENO', capacityPerMold: 440,
    ingredients: [], 
    formats: [], 
    lastUpdated: '2023-10-28' 
  },
  { 
    id: '065', name: 'ROGGENBROT', family: 'PAN CENTENO', capacityPerMold: 150,
    ingredients: [], 
    formats: [], 
    lastUpdated: '2023-10-28' 
  },
  { 
    id: '157', name: 'SCHROTBROT', family: 'PAN CENTENO',
    ingredients: [], 
    formats: [], 
    lastUpdated: '2023-10-28' 
  },
   { 
    id: '232', name: 'INTEGRAL LIGHT', family: 'PAN CENTENO', capacityPerMold: 230,
    ingredients: [], 
    formats: [], 
    lastUpdated: '2023-10-28' 
  },
   { 
    id: '310', name: 'PAN INT RALLADO', family: 'TOSTADAS',
    ingredients: [], 
    formats: [], 
    lastUpdated: '2023-10-28' 
  },
  { 
    id: 'LANDBROT', name: 'LANDBROT 500 GRS.', family: 'PAN CENTENO', capacityPerMold: 25,
    ingredients: [], 
    formats: [], 
    lastUpdated: '2023-10-28' 
  },
   { 
    id: 'CROSOOL', name: 'CROSTINI OREGANO 7 mm', family: 'TOSTADAS', capacityPerMold: 180,
    ingredients: [], 
    formats: [], 
    lastUpdated: '2023-10-28' 
  },
   { 
    id: 'SINORILLA', name: 'SIN ORILLA', family: 'PAN BLANCO', capacityPerMold: 300,
    ingredients: [], 
    formats: [], 
    lastUpdated: '2023-10-28' 
  },
  { 
    id: 'VOLLKORN', name: 'VOLLKORN CRACKER', family: 'TOSTADAS',
    ingredients: [], 
    formats: [], 
    lastUpdated: '2023-10-28' 
  },
  { 
    id: 'CERE0003', name: 'PAN LINAZA 500 GRS', family: 'PAN CENTENO',
    ingredients: [
        { name: 'Harina de Trigo', quantity: 0.25, unit: 'kg' },
        { name: 'Harina de Centeno', quantity: 0.25, unit: 'kg' },
        { name: 'Semillas de Linaza', quantity: 0.1, unit: 'kg' },
        { name: 'Agua', quantity: 0.3, unit: 'L' },
        { name: 'Sal de Mar', quantity: 0.01, unit: 'kg' },
        { name: 'Masa Madre de Trigo (MMT)', quantity: 0.1, unit: 'kg' },
    ],
    formats: [],
    lastUpdated: '2023-10-28'
  },
];

type ProductionPageHandle = React.ElementRef<typeof ProductionPage>;
type ProductionPageProps = ComponentProps<typeof ProductionPage>;

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false);
  const [prefilledProduct, setPrefilledProduct] = useState<string | undefined>(undefined);
  const detailsModalContentRef = useRef<HTMLDivElement>(null);
  const reportContentRef = useRef<HTMLDivElement>(null);
  const [generationDate, setGenerationDate] = useState<Date | null>(null);
  const { toast } = useToast();

   useEffect(() => {
    setGenerationDate(new Date());
  }, []);

  const handleCreateRecipe = (newRecipeData: Omit<Recipe, 'id' | 'lastUpdated'>) => {
    const newRecipe: Recipe = {
      ...newRecipeData,
      id: newRecipeData.name.toUpperCase().replace(/\s/g, '_').slice(0,10),
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setRecipes(prev => [newRecipe, ...prev]);
    setFormModalOpen(false);
    toast({
        title: "Receta Creada",
        description: `La receta ${newRecipe.name} ha sido creada.`,
    });
  };
  
  const handleUpdateRecipe = (updatedRecipeData: Omit<Recipe, 'id' | 'lastUpdated' | 'capacityPerMold'> & {capacityPerMold?: number}) => {
      if (!selectedRecipe) return;
      
      const updatedRecipe: Recipe = {
          ...selectedRecipe,
          ...updatedRecipeData,
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
  
  const handleOpenProductionForm = (recipeName: string) => {
    setPrefilledProduct(recipeName);
    setIsProductionModalOpen(true);
  };


  const handleDownloadReportPdf = async () => {
    const input = reportContentRef.current;
    if (input) {
        const { default: jsPDF } = await import('jspdf');
        const { default: html2canvas } = await import('html2canvas');
        
        const canvas = await html2canvas(input, { scale: 2, backgroundColor: '#ffffff' });
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
        pdf.save(`reporte-recetas-${new Date().toISOString().split('T')[0]}.pdf`);
        toast({
            title: "PDF Descargado",
            description: `El listado de recetas ha sido descargado.`,
        });
    }
  };

  const handleDownloadRecipePdf = async () => {
    const input = detailsModalContentRef.current;
    if (input) {
        const { default: jsPDF } = await import('jspdf');
        const { default: html2canvas } = await import('html2canvas');
        
        const canvas = await html2canvas(input, { scale: 2, backgroundColor: '#ffffff' });
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

   const handleExportExcel = () => {
        const dataForSheet = recipes.map(r => ({
            'SKU': r.id,
            'Nombre Producto': r.name,
            'Familia': r.family,
            'Formatos': r.formats.map(f => `${f.name} (${f.sku})`).join(', '),
            'Ingredientes': r.ingredients.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', '),
            'Última Actualización': new Date(r.lastUpdated + 'T00:00:00').toLocaleDateString('es-CL'),
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Recetas");
        XLSX.writeFile(workbook, `reporte-recetas-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);

        toast({ title: "Archivo Generado", description: "Se ha exportado el listado de recetas a Excel." });
    };
    
    // Mock data for recipe detail view
    const getIngredientDetails = (ingredients: Ingredient[]) => {
        return ingredients.map(ing => {
            const itemInfo = initialInventoryItems.find(i => i.name.toLowerCase() === ing.name.toLowerCase());
            // Mocking price and total value for demonstration
            const price = Math.random() * 2000 + 500;
            return {
                ...ing,
                code: itemInfo?.sku || 'N/A',
                classification: itemInfo?.category || 'Materia Prima',
                price: price,
                totalValue: ing.quantity * price,
            }
        })
    }

  return (
    <AppLayout pageTitle="Recetas">
      <div ref={reportContentRef} className="fixed -left-[9999px] top-0 bg-white text-black p-8 font-body" style={{ width: '8.5in', minHeight: '11in'}}>
          <header className="flex justify-between items-center mb-8 border-b-2 border-gray-800 pb-4">
              <div>
                  <h1 className="text-3xl font-bold font-headline text-gray-800">Listado de Recetas</h1>
                  <p className="text-sm text-gray-500">Panificadora Vollkorn</p>
              </div>
               <div className="text-right text-sm">
                  {generationDate && <p><span className="font-semibold">Fecha de Generación:</span> {format(generationDate, "P p", { locale: es })}</p>}
              </div>
          </header>

          <main>
              <Table className="w-full text-sm">
                  <TableHeader className="bg-gray-100">
                      <TableRow>
                          <TableHead className="text-left font-bold text-gray-700 uppercase p-3">SKU</TableHead>
                          <TableHead className="text-left font-bold text-gray-700 uppercase p-3">Nombre</TableHead>
                          <TableHead className="text-left font-bold text-gray-700 uppercase p-3">Familia</TableHead>
                          <TableHead className="text-left font-bold text-gray-700 uppercase p-3">Actualización</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {recipes.map((recipe) => (
                          <TableRow key={recipe.id} className="border-b border-gray-200">
                              <TableCell className="p-3">{recipe.id}</TableCell>
                              <TableCell className="p-3">{recipe.name}</TableCell>
                              <TableCell className="p-3">{recipe.family}</TableCell>
                              <TableCell className="p-3">{new Date(recipe.lastUpdated + 'T00:00:00').toLocaleDateString('es-CL')}</TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </main>
          <footer className="text-center text-xs text-gray-400 border-t pt-4 mt-8">
              <p>Reporte generado por Vollkorn ERP.</p>
          </footer>
      </div>

      <Card>
        <CardHeader>
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <CardTitle className="font-headline">Recetas y Productos</CardTitle>
                    <CardDescription className="font-body">Gestiona los productos, sus recetas base y categorías (familias).</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                     <Button variant="outline" onClick={handleExportExcel}><FileSpreadsheet className="mr-2 h-4 w-4" /> Excel</Button>
                    <Button variant="outline" onClick={handleDownloadReportPdf}><Download className="mr-2 h-4 w-4" /> PDF</Button>
                    <Button onClick={() => handleOpenForm(null)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nueva Receta
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
           <ScrollArea className="border rounded-md h-[calc(100vh-280px)]">
              <Table className="relative">
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
                            <DropdownMenuItem onClick={() => handleOpenProductionForm(recipe.name)}>Crear Orden de Producción</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
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
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedRecipe?.name}</DialogTitle>
             <DialogDescription className="font-body">
                Índice de Fórmula - {selectedRecipe?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedRecipe && (
             <div className="max-h-[70vh] overflow-y-auto p-1 font-body">
                <div ref={detailsModalContentRef} className="p-4 bg-white text-black rounded-md">
                     <header className="flex justify-between items-center mb-4 border-b-2 border-gray-800 pb-2">
                        <div>
                            <h2 className="text-xl font-bold font-headline text-gray-800">Índice de Fórmulas</h2>
                            <p className="text-xs text-gray-500">Alimentos Vollkorn</p>
                        </div>
                        <div className="text-right text-xs">
                           <p><span className="font-semibold">Fecha:</span> {format(new Date(), 'dd-MM-yyyy')}</p>
                           <p><span className="font-semibold">Hora:</span> {format(new Date(), 'HH:mm:ss')}</p>
                        </div>
                    </header>
                    <div className="text-sm mb-4">
                        <p><strong className="w-20 inline-block">FAMILIA:</strong> {selectedRecipe.family}</p>
                        <p><strong className="w-20 inline-block">Código:</strong> {selectedRecipe.id}</p>
                        <p><strong className="w-20 inline-block">Producto:</strong> {selectedRecipe.name}</p>
                    </div>

                    <div className="space-y-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-black font-semibold h-auto p-1">Producto</TableHead>
                                    <TableHead className="text-black font-semibold h-auto p-1">Descripción</TableHead>
                                    <TableHead className="text-black font-semibold h-auto p-1">Clasificación</TableHead>
                                    <TableHead className="text-black font-semibold h-auto p-1 text-center">Unidad</TableHead>
                                    <TableHead className="text-black font-semibold h-auto p-1 text-right">Cantidad</TableHead>
                                    <TableHead className="text-black font-semibold h-auto p-1 text-right">Precio Med</TableHead>
                                    <TableHead className="text-black font-semibold h-auto p-1 text-right">Valor Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {getIngredientDetails(selectedRecipe.ingredients).map((ing, index) => (
                                    <TableRow key={index} className="border-gray-300">
                                        <TableCell className="font-mono text-xs py-1 px-1">{ing.code}</TableCell>
                                        <TableCell className="py-1 px-1">{ing.name}</TableCell>
                                        <TableCell className="py-1 px-1">{ing.classification}</TableCell>
                                        <TableCell className="py-1 px-1 text-center">{ing.unit}</TableCell>
                                        <TableCell className="text-right py-1 px-1">{ing.quantity.toFixed(3)}</TableCell>
                                        <TableCell className="text-right py-1 px-1">${ing.price.toLocaleString('es-CL', {minimumFractionDigits: 2})}</TableCell>
                                        <TableCell className="text-right py-1 px-1 font-semibold">${ing.totalValue.toLocaleString('es-CL')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                             <TableFooter>
                                <TableRow className="font-bold">
                                    <TableCell colSpan={6} className="text-right py-1 px-1">Total Costo Receta</TableCell>
                                    <TableCell className="text-right py-1 px-1">${getIngredientDetails(selectedRecipe.ingredients).reduce((acc, item) => acc + item.totalValue, 0).toLocaleString('es-CL')}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </div>
             </div>
          )}
           <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>Cerrar</Button>
                <Button onClick={handleDownloadRecipePdf}>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar PDF
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
       {isProductionModalOpen && (
        <ProductionPage handleOpenFormProp={handleOpenForm} prefilledProduct={prefilledProduct} />
      )}


    </AppLayout>
  );
}
