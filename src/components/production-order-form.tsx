
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { initialRecipes } from '@/app/recipes/page';
import { initialInventoryItems } from '@/app/inventory/page';
import { Order } from '@/app/production/page'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';

export type ProductionOrderData = Omit<Order, 'id' | 'date'>;

type ProductionOrderFormProps = {
  onSubmit: (data: ProductionOrderData) => void;
  onCancel: () => void;
  initialData?: Order | null;
};

const initialFormData: ProductionOrderData = {
    product: '',
    quantity: 0,
    stage: 'En Cola',
    status: 'En Cola',
    charge: '',
    machine: '',
    turn: '',
    operator: '',
    responsibles: {
        fractionation: '',
        production: '',
        cooking: '',
    }
};

export default function ProductionOrderForm({ onSubmit, onCancel, initialData }: ProductionOrderFormProps) {
    const [formData, setFormData] = useState<ProductionOrderData>(initialData ? { ...initialData } : initialFormData);
    const [employees, setEmployees] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        // In a real app, this would be an API call.
        setEmployees([
            { id: 'EMP001', name: 'Juan Pérez' },
            { id: 'EMP002', name: 'Ana Gómez' },
            { id: 'EMP003', name: 'Luis Martínez' },
            { id: 'EMP004', name: 'María Rodríguez' },
        ]);

        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData(initialFormData);
        }
    }, [initialData]);
  
    const selectedRecipe = useMemo(() => {
        if (!formData.product) return null;
        return initialRecipes.find(r => r.name === formData.product) || null;
    }, [formData.product]);

    const requiredMaterials = useMemo(() => {
        if (!selectedRecipe || !formData.quantity) return [];
        
        return selectedRecipe.ingredients.map(ingredient => {
            const inventoryItem = initialInventoryItems.find(item => item.name.toLowerCase() === ingredient.name.toLowerCase());
            const requiredQuantity = ingredient.quantity * formData.quantity;
            const isAvailable = inventoryItem ? inventoryItem.stock >= requiredQuantity : false;
            return {
                name: ingredient.name,
                requiredQuantity: requiredQuantity,
                unit: ingredient.unit,
                availableStock: inventoryItem?.stock || 0,
                isAvailable: isAvailable
            };
        });
    }, [selectedRecipe, formData.quantity]);
    
    const allMaterialsAvailable = useMemo(() => {
        return requiredMaterials.every(m => m.isAvailable);
    }, [requiredMaterials]);


    const handleChange = (field: keyof Omit<ProductionOrderData, 'responsibles' | 'status'>, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSelectChange = (field: keyof ProductionOrderData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    
    const handleResponsibleChange = (field: keyof ProductionOrderData['responsibles'], value: string) => {
        setFormData(prev => ({
            ...prev,
            responsibles: {
                ...prev.responsibles,
                [field]: value
            }
        }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <ScrollArea className="flex-grow h-[calc(100vh-250px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 font-body p-6">
                
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">1. Detalles de la Orden</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="product">Producto</Label>
                                <Select value={formData.product} onValueChange={(value) => handleChange('product', value)} required>
                                    <SelectTrigger id="product"><SelectValue placeholder="Seleccionar de una receta..." /></SelectTrigger>
                                    <SelectContent>{initialRecipes.map(recipe => <SelectItem key={recipe.id} value={recipe.name}>{recipe.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Cantidad a Producir</Label>
                                <Input id="quantity" type="number" value={formData.quantity || ''} onChange={(e) => handleChange('quantity', parseInt(e.target.value, 10) || 0)} required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="status">Estado</Label>
                                <Select value={formData.status} onValueChange={(value: Order['status']) => handleSelectChange('status', value)}>
                                    <SelectTrigger id="status"><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="En Cola">En Cola</SelectItem>
                                        <SelectItem value="En Progreso">En Progreso</SelectItem>
                                        <SelectItem value="Completado">Completado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">2. Responsables</CardTitle>
                        </CardHeader>
                         <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="operator">Operador Principal</Label>
                                <Select value={formData.operator} onValueChange={(value) => handleChange('operator', value)}>
                                    <SelectTrigger id="operator"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                    <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fractionation">Responsable Fraccionamiento</Label>
                                <Select value={formData.responsibles.fractionation} onValueChange={(value) => handleResponsibleChange('fractionation', value)}>
                                    <SelectTrigger id="fractionation"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                    <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="production">Responsable Producción</Label>
                                <Select value={formData.responsibles.production} onValueChange={(value) => handleResponsibleChange('production', value)}>
                                    <SelectTrigger id="production"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                    <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="cooking">Responsable Cocción</Label>
                                <Select value={formData.responsibles.cooking} onValueChange={(value) => handleResponsibleChange('cooking', value)}>
                                    <SelectTrigger id="cooking"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                    <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                         </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">3. Checklist de Materiales</CardTitle>
                            <CardDescription>Verifica la disponibilidad y marca los ítems preparados.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!selectedRecipe || !formData.quantity || formData.quantity === 0 ? (
                                <div className="text-center text-muted-foreground py-8 h-full flex flex-col justify-center items-center">
                                    <p>Selecciona un producto y cantidad.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {requiredMaterials.map(material => (
                                        <div key={material.name} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-3">
                                                <Checkbox id={`mat-${material.name}`} />
                                                <div>
                                                    <Label htmlFor={`mat-${material.name}`} className="font-medium">{material.name}</Label>
                                                    <p className="text-xs text-muted-foreground">
                                                        Req: {material.requiredQuantity.toFixed(2)} {material.unit} / Disp: {material.availableStock.toFixed(2)} {material.unit}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant={material.isAvailable ? 'default' : 'destructive'} className="flex gap-1 items-center">
                                                 {material.isAvailable ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                                                {material.isAvailable ? 'Disponible' : 'Insuficiente'}
                                            </Badge>
                                        </div>
                                    ))}
                                    <div className="pt-4 text-center text-sm font-bold">
                                        {allMaterialsAvailable ? (
                                            <p className="text-green-600">Todos los materiales están disponibles.</p>
                                        ) : (
                                            <p className="text-red-600">Faltan materiales. Revisa el inventario.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">4. Control de Proceso</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                             <div className="space-y-2">
                                <Label htmlFor="stage">Etapa Actual</Label>
                                <Input id="stage" value={formData.stage} onChange={(e) => handleChange('stage', e.target.value)} required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="turn">Turno</Label>
                                <Input id="turn" value={formData.turn} onChange={(e) => handleChange('turn', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="machine">Máquina Principal</Label>
                                <Input id="machine" value={formData.machine} onChange={(e) => handleChange('machine', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ScrollArea>
        <DialogFooter className="p-4 border-t bg-background">
            <Button variant="outline" type="button" onClick={onCancel}>
                Cancelar
            </Button>
            <Button type="submit" disabled={!allMaterialsAvailable && requiredMaterials.length > 0}>
                {initialData ? 'Guardar Cambios' : 'Crear Orden'}
            </Button>
      </DialogFooter>
    </form>
  );
}

