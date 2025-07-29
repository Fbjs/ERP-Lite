
"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
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

const initialInventoryItems: InventoryItem[] = [
  { sku: 'HAR-001', name: 'Harina de Trigo', category: 'Materia Prima', stock: 1500, unit: 'kg', location: 'Bodega A-1' },
  { sku: 'LEV-002', name: 'Levadura Fresca', category: 'Materia Prima', stock: 250, unit: 'kg', location: 'Refrigerador 2' },
  { sku: 'SAL-003', name: 'Sal de Mar', category: 'Materia Prima', stock: 500, unit: 'kg', location: 'Bodega A-2' },
  { sku: 'PROD-PL-01', name: 'Pain au Levain', category: 'Producto Terminado', stock: 50, unit: 'unidades', location: 'Zona Despacho' },
  { sku: 'PROD-BG-01', name: 'Baguette Tradition', category: 'Producto Terminado', stock: 120, unit: 'unidades', location: 'Zona Despacho' },
  { sku: 'INS-EM-01', name: 'Bolsas de Papel', category: 'Insumo', stock: 5000, unit: 'unidades', location: 'Estante B-3' },
];

export default function InventoryPage() {
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialInventoryItems);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isAdjustStockModalOpen, setAdjustStockModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const { toast } = useToast();

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
                        <Input 
                          type="search" 
                          placeholder="Buscar por SKU o nombre..." 
                          className="pl-8 sm:w-[300px]"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => handleOpenForm(null)}>
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
              {filteredItems.map((item) => (
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
