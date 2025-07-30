
"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Search, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useState, useMemo, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import InventoryItemForm from '@/components/inventory-item-form';
import StockAdjustmentForm from '@/components/stock-adjustment-form';
import { useToast } from '@/hooks/use-toast';


export type InventoryItem = {
  sku: string;
  name: string;
  category: 'Materia Prima' | 'Insumo' | 'Producto Terminado';
  stock: number;
  unit: string;
  location: string;
};

export const initialInventoryItems: InventoryItem[] = [
  { sku: 'HAR-001', name: 'Harina de Trigo', category: 'Materia Prima', stock: 1500, unit: 'kg', location: 'Bodega A-1' },
  { sku: 'LEV-002', name: 'Levadura Fresca', category: 'Materia Prima', stock: 250, unit: 'kg', location: 'Refrigerador 2' },
  { sku: 'SAL-003', name: 'Sal de Mar', category: 'Materia Prima', stock: 500, unit: 'kg', location: 'Bodega A-2' },
  { sku: 'MAN-004', name: 'Mantequilla', category: 'Materia Prima', stock: 300, unit: 'kg', location: 'Refrigerador 1' },
  { sku: 'AZU-005', name: 'Azucar', category: 'Materia Prima', stock: 400, unit: 'kg', location: 'Bodega A-2' },
  { sku: 'AGU-006', name: 'Agua', category: 'Materia Prima', stock: 1000, unit: 'L', location: 'Estanque' },
  { sku: 'MM-007', name: 'Masa Madre', category: 'Materia Prima', stock: 50, unit: 'kg', location: 'Refrigerador 3' },
  { sku: 'LEC-008', name: 'Leche', category: 'Materia Prima', stock: 200, unit: 'L', location: 'Refrigerador 1' },
  { sku: 'PROD-PL-01', name: 'Pain au Levain', category: 'Producto Terminado', stock: 200, unit: 'unidades', location: 'Zona Despacho' },
  { sku: 'PROD-BG-01', name: 'Baguette Tradition', category: 'Producto Terminado', stock: 350, unit: 'unidades', location: 'Zona Despacho' },
  { sku: 'PROD-CB-01', name: 'Ciabatta', category: 'Producto Terminado', stock: 250, unit: 'unidades', location: 'Zona Despacho' },
  { sku: 'PROD-CR-01', name: 'Croissant au Beurre', category: 'Producto Terminado', stock: 500, unit: 'unidades', location: 'Zona Despacho' },
  { sku: 'INS-EM-01', name: 'Bolsas de Papel', category: 'Insumo', stock: 5000, unit: 'unidades', location: 'Estante B-3' },
];

export default function InventoryPage() {
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialInventoryItems);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isAdjustStockModalOpen, setAdjustStockModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const { toast } = useToast();
    const reportContentRef = useRef<HTMLDivElement>(null);

    const filteredItems = useMemo(() => {
        if (!searchQuery) return inventoryItems;
        return inventoryItems.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [inventoryItems, searchQuery]);

    const handleOpenForm = (item: InventoryItem | null) => {
        setSelectedItem(item);
        setFormModalOpen(true);
    };

    const handleOpenAdjustStock = (item: InventoryItem) => {
        setSelectedItem(item);
        setAdjustStockModalOpen(true);
    };
    
    const handleCreateItem = (newItemData: Omit<InventoryItem, 'sku'>) => {
        const newItem: InventoryItem = {
            ...newItemData,
            sku: `NEW-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
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
            pdf.save(`reporte-inventario-${new Date().toISOString().split('T')[0]}.pdf`);
            
            toast({
                title: "PDF Descargado",
                description: "El reporte de inventario ha sido descargado.",
            });
        }
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
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="search" 
                          placeholder="Buscar por SKU o nombre..." 
                          className="pl-8 w-full sm:w-[300px]"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                     <Button variant="outline" onClick={handleDownloadPdf}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar Reporte
                    </Button>
                    <Button onClick={() => handleOpenForm(null)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nuevo Ítem
                    </Button>
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
                <TableHead>Stock</TableHead>
                <TableHead>Ubicación</TableHead>
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
                  <TableCell data-label="Stock">{item.stock} {item.unit}</TableCell>
                  <TableCell data-label="Ubicación">{item.location}</TableCell>
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
