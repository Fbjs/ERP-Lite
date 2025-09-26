
"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Search, Download, FileSpreadsheet, Truck, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useState, useMemo, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import InventoryItemForm from '@/components/inventory-item-form';
import StockAdjustmentForm from '@/components/stock-adjustment-form';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';


export type InventoryItem = {
  sku: string;
  name: string;
  family: 'ACEITES Y GRA' | 'ADITIVOS' | 'ENDULZANTES' | 'ENVASADO' | 'HARINAS' | 'MASA MADRE' | 'SEMILLAS' | 'PRODUCTO TERMINADO';
  category: 'Materia Prima' | 'Insumo' | 'Producto Terminado' | 'ENVASADO';
  stock: number;
  unit: string; // Unidad Consumo
  purchaseUnit: string;
  conversionFactor: number | null;
  inactive: boolean;
  location: string;
};

export const initialInventoryItems: InventoryItem[] = [
  // Materias Primas
  { sku: 'HAR-001', name: 'Harina de Trigo', family: 'HARINAS', category: 'Materia Prima', stock: 1500, unit: 'kg', purchaseUnit: 'kg', conversionFactor: 1, inactive: false, location: 'Bodega A-1' },
  { sku: 'HAR-CEN-001', name: 'Harina de Centeno', family: 'HARINAS', category: 'Materia Prima', stock: 500, unit: 'kg', purchaseUnit: 'kg', conversionFactor: 1, inactive: false, location: 'Bodega A-1' },
  { sku: 'HAR-INT-001', name: 'Harina Integral', family: 'HARINAS', category: 'Materia Prima', stock: 700, unit: 'kg', purchaseUnit: 'kg', conversionFactor: 1, inactive: false, location: 'Bodega A-1' },
  { sku: 'LEV-002', name: 'Levadura Fresca', family: 'ADITIVOS', category: 'Materia Prima', stock: 250, unit: 'kg', purchaseUnit: 'kg', conversionFactor: 1, inactive: false, location: 'Refrigerador 2' },
  { sku: 'SAL-003', name: 'Sal de Mar', family: 'ADITIVOS', category: 'Materia Prima', stock: 500, unit: 'kg', purchaseUnit: 'kg', conversionFactor: 1, inactive: false, location: 'Bodega A-2' },
  { sku: 'PAN-SOB-001', name: 'Pan Sobrante', family: 'HARINAS', category: 'Materia Prima', stock: 100, unit: 'kg', purchaseUnit: 'kg', conversionFactor: 1, inactive: false, location: 'Contenedor Mermas' },
  { sku: 'AZU-001', name: 'Azucar', family: 'ENDULZANTES', category: 'Materia Prima', stock: 300, unit: 'kg', purchaseUnit: 'kg', conversionFactor: 1, inactive: false, location: 'Bodega A-2' },
  { sku: 'MMC-001', name: 'Masa Madre de Centeno (MMC)', family: 'MASA MADRE', category: 'Materia Prima', stock: 50, unit: 'kg', purchaseUnit: 'kg', conversionFactor: 1, inactive: false, location: 'Refrigerador 1' },
  { sku: 'MMT-001', name: 'Masa Madre de Trigo (MMT)', family: 'MASA MADRE', category: 'Materia Prima', stock: 50, unit: 'kg', purchaseUnit: 'kg', conversionFactor: 1, inactive: false, location: 'Refrigerador 1' },
  { sku: 'MMB-001', name: 'Masa Madre Blanca (MMB)', family: 'MASA MADRE', category: 'Materia Prima', stock: 50, unit: 'kg', purchaseUnit: 'kg', conversionFactor: 1, inactive: false, location: 'Refrigerador 1' },
  
  // Envasado
  { sku: 'CA-JA-150', name: 'CAJA CARTON 150x150x150CD', family: 'ENVASADO', category: 'ENVASADO', stock: 5000, unit: 'Un', purchaseUnit: 'Un', conversionFactor: 1, inactive: false, location: 'Estante B-3' },
  { sku: 'CA-JA-642', name: 'CAJA CARTON 600x400x200', family: 'ENVASADO', category: 'ENVASADO', stock: 2000, unit: 'Un', purchaseUnit: 'Un', conversionFactor: 1, inactive: false, location: 'Estante B-4' },
  { sku: 'INS-EM-01', name: 'Bolsas de Papel', family: 'ENVASADO', category: 'Insumo', stock: 5000, unit: 'Un', purchaseUnit: 'Un', conversionFactor: 1, inactive: false, location: 'Estante B-3' },

  // Productos Terminados
  { sku: '400100', name: 'PAN BCO SIN GLUTEN', family: 'PRODUCTO TERMINADO', category: 'Producto Terminado', stock: 150, unit: 'Un', purchaseUnit: 'Un', conversionFactor: 1, inactive: false, location: 'Zona Despacho' },
  { sku: 'PSO10X10', name: 'PAN BLANCO SIN ORILLAS 10X105', family: 'PRODUCTO TERMINADO', category: 'Producto Terminado', stock: 200, unit: 'Un', purchaseUnit: 'Un', conversionFactor: 1, inactive: false, location: 'Zona Despacho' },
  { sku: 'CERE0003', name: 'PAN LINAZA 500 GRS', family: 'PRODUCTO TERMINADO', category: 'Producto Terminado', stock: 80, unit: 'Un', purchaseUnit: 'Un', conversionFactor: 1, inactive: false, location: 'Zona Despacho' },
];

export default function InventoryPage() {
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialInventoryItems);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isAdjustStockModalOpen, setAdjustStockModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const { toast } = useToast();
    const reportContentRef = useRef<HTMLDivElement>(null);

    const filteredItems = useMemo(() => {
        return inventoryItems.filter(item => {
            const matchesSearch = searchQuery === '' || 
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.sku.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

            return matchesSearch && matchesCategory;
        });
    }, [inventoryItems, searchQuery, categoryFilter]);

    const handleOpenForm = (item: InventoryItem | null) => {
        setSelectedItem(item);
        setFormModalOpen(true);
    };

    const handleOpenAdjustStock = (item: InventoryItem) => {
        setSelectedItem(item);
        setAdjustStockModalOpen(true);
    };
    
    const handleCreateItem = (newItemData: Omit<InventoryItem, 'sku' | 'inactive'>) => {
        const newItem: InventoryItem = {
            ...newItemData,
            sku: `NEW-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            inactive: false
        };
        setInventoryItems(prev => [newItem, ...prev]);
        setFormModalOpen(false);
        toast({
            title: "Ítem Creado",
            description: `El ítem ${newItem.name} ha sido añadido al inventario.`,
        });
    };

    const handleUpdateItem = (updatedItemData: Omit<InventoryItem, 'sku'>) => {
        if (!selectedItem) return;
        
        const updatedItem = { ...updatedItemData, sku: selectedItem.sku };
        setInventoryItems(inventoryItems.map(item => item.sku === selectedItem.sku ? updatedItem : item));
        setFormModalOpen(false);
        setSelectedItem(null);
        toast({
            title: "Ítem Actualizado",
            description: `Se ha actualizado la información de ${updatedItem.name}.`,
        });
    };

    const handleAdjustStock = (newStock: number) => {
        if (!selectedItem) return;

        setInventoryItems(inventoryItems.map(item =>
            item.sku === selectedItem.sku ? { ...item, stock: newStock } : item
        ));
        setAdjustStockModalOpen(false);
        setSelectedItem(null);
        toast({
            title: "Stock Ajustado",
            description: `El stock de ${selectedItem.name} ahora es ${newStock}.`,
        });
    };
    
    const handleDownloadPdf = async () => {
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
            pdf.save(`reporte-inventario-${new Date().toISOString().split('T')[0]}.pdf`);
            
            toast({
                title: "PDF Descargado",
                description: "El reporte de inventario ha sido descargado.",
            });
        }
    };
    
    const handleDownloadExcel = () => {
        const dataForSheet = filteredItems.map(item => ({
            'SKU': item.sku,
            'Nombre': item.name,
            'Categoría': item.category,
            'Familia': item.family,
            'Stock': item.stock,
            'Unidad Consumo': item.unit,
            'Unidad Compra': item.purchaseUnit,
            'Factor': item.conversionFactor,
            'Inactivo': item.inactive ? 'Sí' : 'No',
            'Ubicación': item.location,
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");
        XLSX.writeFile(workbook, `reporte-inventario-${new Date().toISOString().split('T')[0]}.xlsx`);
        toast({
            title: "Excel Descargado",
            description: "El reporte de inventario ha sido descargado.",
        });
    };


  return (
    <AppLayout pageTitle="Gestión de Inventario">

      <div ref={reportContentRef} className="fixed -left-[9999px] top-0 bg-white text-black p-8 font-body" style={{ width: '8.5in', minHeight: '11in'}}>
          <header className="flex justify-between items-center mb-8 border-b-2 border-gray-800 pb-4">
              <div>
                  <h1 className="text-3xl font-bold font-headline text-gray-800">Reporte de Inventario</h1>
                  <p className="text-sm text-gray-500">Panificadora Vollkorn</p>
              </div>
              <div className="text-right text-sm">
                  <p><span className="font-semibold">Fecha de Generación:</span> {new Date().toLocaleDateString('es-ES')}</p>
              </div>
          </header>

          <main>
              <Table className="w-full text-sm">
                  <TableHeader className="bg-gray-100">
                      <TableRow>
                          <TableHead className="text-left font-bold text-gray-700 uppercase p-3">SKU</TableHead>
                          <TableHead className="text-left font-bold text-gray-700 uppercase p-3">Nombre</TableHead>
                          <TableHead className="text-left font-bold text-gray-700 uppercase p-3">Categoría</TableHead>
                          <TableHead className="text-right font-bold text-gray-700 uppercase p-3">Stock</TableHead>
                          <TableHead className="text-left font-bold text-gray-700 uppercase p-3">Ubicación</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {inventoryItems.map((item) => (
                          <TableRow key={item.sku} className="border-b border-gray-200">
                              <TableCell className="p-3">{item.sku}</TableCell>
                              <TableCell className="p-3">{item.name}</TableCell>
                              <TableCell className="p-3">{item.category}</TableCell>
                              <TableCell className="text-right p-3">{item.stock} {item.unit}</TableCell>
                              <TableCell className="p-3">{item.location}</TableCell>
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
                    <CardTitle className="font-headline">Inventario</CardTitle>
                    <CardDescription className="font-body">Consulta y gestiona el stock de materias primas, insumos y productos terminados.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" asChild>
                        <Link href="/purchasing/receptions">
                            <Truck className="mr-2 h-4 w-4" />
                            Recepcionar Mercadería
                        </Link>
                    </Button>
                    <Button variant="outline" onClick={handleDownloadExcel}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Excel
                    </Button>
                     <Button variant="outline" onClick={handleDownloadPdf}>
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                    </Button>
                    <Button onClick={() => handleOpenForm(null)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nuevo Ítem
                    </Button>
                </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
                 <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        type="search" 
                        placeholder="Buscar por SKU o nombre..." 
                        className="pl-8 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex-1 min-w-[250px]">
                     <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filtrar por categoría..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las Categorías</SelectItem>
                            <SelectItem value="Materia Prima">Materia Prima</SelectItem>
                            <SelectItem value="Insumo">Insumo</SelectItem>
                            <SelectItem value="Producto Terminado">Producto Terminado</SelectItem>
                            <SelectItem value="ENVASADO">Envasado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <Table className="responsive-table">
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Familia</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-center">Ud. Consumo</TableHead>
                <TableHead className="text-center">Ud. Compra</TableHead>
                <TableHead className="text-center">Factor</TableHead>
                <TableHead className="text-center">Inactivo</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.sku}>
                  <TableCell data-label="SKU" className="font-medium">{item.sku}</TableCell>
                  <TableCell data-label="Nombre">{item.name}</TableCell>
                  <TableCell data-label="Categoría">
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell data-label="Familia">{item.family}</TableCell>
                  <TableCell data-label="Stock" className="text-center">{item.stock}</TableCell>
                  <TableCell data-label="Ud. Consumo" className="text-center">{item.unit}</TableCell>
                  <TableCell data-label="Ud. Compra" className="text-center">{item.purchaseUnit}</TableCell>
                  <TableCell data-label="Factor" className="text-center">{item.conversionFactor}</TableCell>
                  <TableCell data-label="Inactivo" className="text-center">
                    {item.inactive && <Check className="mx-auto h-5 w-5 text-muted-foreground" />}
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => handleOpenAdjustStock(item)}>Ajustar Stock</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenForm(item)}>Editar Ítem</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Modal Nuevo/Editar Ítem */}
      <Dialog open={isFormModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedItem ? 'Editar Ítem de Inventario' : 'Añadir Nuevo Ítem'}</DialogTitle>
            <DialogDescription className="font-body">
              {selectedItem ? 'Modifica los detalles del ítem.' : 'Completa los detalles para añadir un nuevo ítem al inventario.'}
            </DialogDescription>
          </DialogHeader>
          <InventoryItemForm
            onSubmit={selectedItem ? handleUpdateItem : handleCreateItem}
            onCancel={() => { setFormModalOpen(false); setSelectedItem(null); }}
            initialData={selectedItem || undefined}
          />
        </DialogContent>
      </Dialog>
      
      {/* Modal Ajustar Stock */}
      <Dialog open={isAdjustStockModalOpen} onOpenChange={setAdjustStockModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline">Ajustar Stock de: {selectedItem?.name}</DialogTitle>
            <DialogDescription className="font-body">
              Ingresa la nueva cantidad de stock para este ítem.
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <StockAdjustmentForm
                onSubmit={handleAdjustStock}
                onCancel={() => { setAdjustStockModalOpen(false); setSelectedItem(null); }}
                currentItem={selectedItem}
            />
           )}
        </DialogContent>
      </Dialog>
      
    </AppLayout>
  );
}

