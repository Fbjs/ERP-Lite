
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { initialRecipes } from '@/app/recipes/page';
import { initialInventoryItems } from '@/app/inventory/page';
import { Order, ProcessControl, PortioningControl, FermentationControl, BakingControl, BakingRecord, Waste } from '@/app/production/page'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle2, PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';

export type ProductionOrderData = Omit<Order, 'id' | 'date'>;

type ProductionOrderFormProps = {
  onSubmit: (data: ProductionOrderData) => void;
  onCancel: () => void;
  initialData?: Order | null;
  prefilledData?: { product?: string, quantity?: number };
};

const emptyProcessControl: ProcessControl = {
    hydratedInput: '', mixStartDate: '', mixEndDate: '', waterKg: 0, waterTemp: 0,
    motherMassKg: 0, motherMassTemp: 0, doughMixer: '', mixStartTime: '', slowSpeedMin: 0,
    fastSpeedMin: 0, mixFinishTime: '', brothTemp: 0, doughTemp: 0, mixObservations: ''
};
const emptyPortioningControl: PortioningControl = {
    startTime: '', rawCut1Gr: 0, rawCut2Gr: 0, leftoverDoughGr: 0, endTime: '',
    numCarts: 0, roomTemp: 0, observations: ''
};
const emptyFermentationControl: FermentationControl = {
    chamber: '', entryTime: '', exitTime: '', totalTimeMin: 0, chamberTemp: 0, chamberRh: 0
};
const emptyBakingControl: BakingControl = {
    oven: '', numFloors: 0, loadStartTime: '', unloadEndTime: '', bakingTime: 0,
    ovenTemp: 0, observations: ''
};
const emptyBakingRecord: BakingRecord = {
    ovenTemp: 0, thermalCenterTemp: 0, correctiveAction: '', verification: '', observations: ''
};


const initialFormData: ProductionOrderData = {
    product: '',
    quantity: 0,
    status: 'En Cola',
    charge: '',
    turn: '',
    operator: '',
    responsibles: { fractionation: '', production: '', cooking: '' },
    staff: [],
    processControl: emptyProcessControl,
    portioningControl: emptyPortioningControl,
    fermentationControl: emptyFermentationControl,
    bakingControl: emptyBakingControl,
    bakingRecord: emptyBakingRecord,
    waste: [],
    salesOrderId: '',
};

export default function ProductionOrderForm({ onSubmit, onCancel, initialData, prefilledData }: ProductionOrderFormProps) {
    const [formData, setFormData] = useState<ProductionOrderData>(initialFormData);
    const [employees, setEmployees] = useState<{ id: string, name: string, rut: string }[]>([]);

    useEffect(() => {
        // In a real app, this would be an API call.
        setEmployees([
            { id: 'EMP001', name: 'Juan Pérez', rut: '12.345.678-9' },
            { id: 'EMP002', name: 'Ana Gómez', rut: '23.456.789-0' },
            { id: 'EMP003', name: 'Luis Martínez', rut: '11.222.333-4' },
            { id: 'EMP004', name: 'María Rodríguez', rut: '15.678.901-2' },
        ]);

        if (initialData) {
            setFormData(initialData);
        } else if (prefilledData?.product || prefilledData?.quantity) {
             setFormData({ 
                ...initialFormData,
                product: prefilledData.product || '',
                quantity: prefilledData.quantity || 0,
            });
        } else {
            setFormData(initialFormData);
        }
    }, [initialData, prefilledData]);
  
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


    const handleChange = (section: keyof ProductionOrderData | 'processControl' | 'portioningControl' | 'fermentationControl' | 'bakingControl' | 'bakingRecord', field: string, value: string | number) => {
        if (['processControl', 'portioningControl', 'fermentationControl', 'bakingControl', 'bakingRecord'].includes(section)) {
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...(prev as any)[section],
                    [field]: value
                }
            }));
        } else {
             setFormData(prev => ({ ...prev, [field]: value } as any));
        }
    };
    
    const handleAddStaff = () => {
        setFormData(prev => ({
            ...prev,
            staff: [...prev.staff, { rut: '', name: '', startTime: '', endTime: '' }]
        }));
    };

    const handleRemoveStaff = (index: number) => {
        setFormData(prev => ({
            ...prev,
            staff: prev.staff.filter((_, i) => i !== index)
        }));
    };
    
    const handleStaffChange = (index: number, field: keyof ProductionOrderData['staff'][0], value: string) => {
        const newStaff = [...formData.staff];
        if (field === 'name') {
            const selectedEmployee = employees.find(e => e.name === value);
            newStaff[index].name = value;
            newStaff[index].rut = selectedEmployee?.rut || '';
        } else {
           (newStaff[index] as any)[field] = value;
        }
        setFormData(prev => ({ ...prev, staff: newStaff }));
    };

    const handleAddWaste = () => {
        setFormData(prev => ({
            ...prev,
            waste: [...prev.waste, { type: 'Otro', quantity: 0, reason: '' }]
        }));
    };

    const handleRemoveWaste = (index: number) => {
        setFormData(prev => ({
            ...prev,
            waste: prev.waste.filter((_, i) => i !== index)
        }));
    };

    const handleWasteChange = (index: number, field: keyof Waste, value: string | number) => {
        const newWaste = [...formData.waste];
        (newWaste[index] as any)[field] = value;
        setFormData(prev => ({ ...prev, waste: newWaste }));
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
            <div className="font-body p-6 space-y-4">
                
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">Detalles de la Orden</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="product">Producto</Label>
                            <Select value={formData.product} onValueChange={(value) => handleSelectChange('product', value)} required>
                                <SelectTrigger id="product"><SelectValue placeholder="Seleccionar de una receta..." /></SelectTrigger>
                                <SelectContent>{initialRecipes.map(recipe => <SelectItem key={recipe.id} value={recipe.name}>{recipe.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Cantidad a Producir</Label>
                            <Input id="quantity" type="number" value={formData.quantity || ''} onChange={(e) => handleSelectChange('quantity', parseInt(e.target.value, 10) || 0)} required />
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
                         <div className="space-y-2">
                            <Label htmlFor="turn">Turno</Label>
                            <Input id="turn" value={formData.turn} onChange={(e) => handleSelectChange('turn', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="salesOrderId">Orden de Venta (Opcional)</Label>
                            <Input id="salesOrderId" value={formData.salesOrderId || ''} onChange={(e) => handleSelectChange('salesOrderId', e.target.value)} placeholder="Ej: SALE123"/>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">Checklist de Materiales</CardTitle>
                        <CardDescription>Verifica disponibilidad y marca los ítems preparados.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!selectedRecipe || !formData.quantity || formData.quantity === 0 ? (
                            <div className="text-center text-muted-foreground py-8 h-full flex flex-col justify-center items-center">
                                <p>Selecciona un producto y cantidad.</p>
                            </div>
                        ) : requiredMaterials.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8 h-full flex flex-col justify-center items-center">
                                <p>Esta receta no tiene ingredientes definidos.</p>
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
                         <CardTitle className="font-headline text-lg">Responsables y Dotación</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="operator">Operador Principal</Label>
                                <Select value={formData.operator} onValueChange={(value) => handleChange('formData', 'operator', value)}>
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
                        </div>
                         <div className="border-t pt-4 mt-4 space-y-2">
                            <Label>Personal Involucrado</Label>
                            {formData.staff.map((staffMember, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                    <Select
                                        value={staffMember.name}
                                        onValueChange={(value) => handleStaffChange(index, 'name', value)}
                                    >
                                        <SelectTrigger className="col-span-5">
                                            <SelectValue placeholder="Empleado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees.map(e => <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Input value={staffMember.rut} className="col-span-3" disabled placeholder="RUT"/>
                                    <Input type="time" value={staffMember.startTime} onChange={e => handleStaffChange(index, 'startTime', e.target.value)} className="col-span-1" />
                                    <Input type="time" value={staffMember.endTime} onChange={e => handleStaffChange(index, 'endTime', e.target.value)} className="col-span-1" />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveStaff(index)} className="col-span-1 -mt-1"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" className="w-full" onClick={handleAddStaff}><PlusCircle className="mr-2"/>Añadir Personal</Button>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader><CardTitle className="font-headline text-lg">Control de Proceso: Amasado</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                         <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                            <Input placeholder="Amasadora" value={formData.processControl.doughMixer} onChange={e => handleChange('processControl', 'doughMixer', e.target.value)} />
                            <Input type="time" placeholder="Hora Inicio" value={formData.processControl.mixStartTime} onChange={e => handleChange('processControl', 'mixStartTime', e.target.value)} />
                            <Input type="number" placeholder="Vel. Lenta (min)" value={formData.processControl.slowSpeedMin || ''} onChange={e => handleChange('processControl', 'slowSpeedMin', Number(e.target.value))} />
                            <Input type="number" placeholder="Vel. Rápida (min)" value={formData.processControl.fastSpeedMin || ''} onChange={e => handleChange('processControl', 'fastSpeedMin', Number(e.target.value))} />
                            <Input type="time" placeholder="Hora Término" value={formData.processControl.mixFinishTime} onChange={e => handleChange('processControl', 'mixFinishTime', e.target.value)} />
                            <Input type="number" placeholder="T° Caldo (°C)" value={formData.processControl.brothTemp || ''} onChange={e => handleChange('processControl', 'brothTemp', Number(e.target.value))} />
                            <Input type="number" placeholder="T° Masa (°C)" value={formData.processControl.doughTemp || ''} onChange={e => handleChange('processControl', 'doughTemp', Number(e.target.value))} />
                        </div>
                        <Textarea placeholder="Observaciones de amasado..." value={formData.processControl.mixObservations} onChange={e => handleChange('processControl', 'mixObservations', e.target.value)} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="font-headline text-lg">Control: Porcionado</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                         <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                            <Input type="time" placeholder="Hora Inicio" value={formData.portioningControl.startTime} onChange={e => handleChange('portioningControl', 'startTime', e.target.value)} />
                            <Input type="time" placeholder="Hora Término" value={formData.portioningControl.endTime} onChange={e => handleChange('portioningControl', 'endTime', e.target.value)} />
                            <Input type="number" placeholder="Corte Crudo 1 (gr)" value={formData.portioningControl.rawCut1Gr || ''} onChange={e => handleChange('portioningControl', 'rawCut1Gr', Number(e.target.value))} />
                            <Input type="number" placeholder="Corte Crudo 2 (gr)" value={formData.portioningControl.rawCut2Gr || ''} onChange={e => handleChange('portioningControl', 'rawCut2Gr', Number(e.target.value))} />
                            <Input type="number" placeholder="Masa Sobrante (gr)" value={formData.portioningControl.leftoverDoughGr || ''} onChange={e => handleChange('portioningControl', 'leftoverDoughGr', Number(e.target.value))} />
                            <Input type="number" placeholder="N° de Carros" value={formData.portioningControl.numCarts || ''} onChange={e => handleChange('portioningControl', 'numCarts', Number(e.target.value))} />
                            <Input type="number" placeholder="T° Sala (°C)" value={formData.portioningControl.roomTemp || ''} onChange={e => handleChange('portioningControl', 'roomTemp', Number(e.target.value))} />
                        </div>
                        <Textarea placeholder="Observaciones de porcionado..." value={formData.portioningControl.observations} onChange={e => handleChange('portioningControl', 'observations', e.target.value)} />
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader><CardTitle className="font-headline text-lg">Control: Fermentado</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                        <Input placeholder="Cámara" value={formData.fermentationControl.chamber} onChange={e => handleChange('fermentationControl', 'chamber', e.target.value)} />
                        <Input type="time" placeholder="Hora Entrada" value={formData.fermentationControl.entryTime} onChange={e => handleChange('fermentationControl', 'entryTime', e.target.value)} />
                        <Input type="time" placeholder="Hora Salida" value={formData.fermentationControl.exitTime} onChange={e => handleChange('fermentationControl', 'exitTime', e.target.value)} />
                        <Input type="number" placeholder="Tiempo Total (Min)" value={formData.fermentationControl.totalTimeMin || ''} onChange={e => handleChange('fermentationControl', 'totalTimeMin', Number(e.target.value))} />
                        <Input type="number" placeholder="T° Cámara (°C)" value={formData.fermentationControl.chamberTemp || ''} onChange={e => handleChange('fermentationControl', 'chamberTemp', Number(e.target.value))} />
                        <Input type="number" placeholder="HR Cámara (%)" value={formData.fermentationControl.chamberRh || ''} onChange={e => handleChange('fermentationControl', 'chamberRh', Number(e.target.value))} />
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader><CardTitle className="font-headline text-lg">Control: Horneado</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                         <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                            <Input placeholder="Horno" value={formData.bakingControl.oven} onChange={e => handleChange('bakingControl', 'oven', e.target.value)} />
                            <Input type="number" placeholder="N° de Pisos" value={formData.bakingControl.numFloors || ''} onChange={e => handleChange('bakingControl', 'numFloors', Number(e.target.value))} />
                            <Input type="time" placeholder="Hora Inicio Carga" value={formData.bakingControl.loadStartTime} onChange={e => handleChange('bakingControl', 'loadStartTime', e.target.value)} />
                            <Input type="time" placeholder="Hora Término Descarga" value={formData.bakingControl.unloadEndTime} onChange={e => handleChange('bakingControl', 'unloadEndTime', e.target.value)} />
                            <Input type="number" placeholder="Tiempo Cocción (min)" value={formData.bakingControl.bakingTime || ''} onChange={e => handleChange('bakingControl', 'bakingTime', Number(e.target.value))} />
                            <Input type="number" placeholder="T° Horno (°C)" value={formData.bakingControl.ovenTemp || ''} onChange={e => handleChange('bakingControl', 'ovenTemp', Number(e.target.value))} />
                        </div>
                        <Textarea placeholder="Observaciones de horneado..." value={formData.bakingControl.observations} onChange={e => handleChange('bakingControl', 'observations', e.target.value)} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="font-headline text-lg">Registro Horneo (PCC2)</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <Input type="number" placeholder="T° Horno (°C)" value={formData.bakingRecord.ovenTemp || ''} onChange={e => handleChange('bakingRecord', 'ovenTemp', Number(e.target.value))} />
                            <Input type="number" placeholder="T° Centro Térmico (°C)" value={formData.bakingRecord.thermalCenterTemp || ''} onChange={e => handleChange('bakingRecord', 'thermalCenterTemp', Number(e.target.value))} />
                        </div>
                        <Input placeholder="Acción Correctiva" value={formData.bakingRecord.correctiveAction} onChange={e => handleChange('bakingRecord', 'correctiveAction', e.target.value)} />
                        <Input placeholder="Verificación" value={formData.bakingRecord.verification} onChange={e => handleChange('bakingRecord', 'verification', e.target.value)} />
                        <Textarea placeholder="Observaciones finales..." value={formData.bakingRecord.observations} onChange={e => handleChange('bakingRecord', 'observations', e.target.value)} />
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">Control de Mermas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {formData.waste.map((wasteItem, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                <Select
                                    value={wasteItem.type}
                                    onValueChange={(value: Waste['type']) => handleWasteChange(index, 'type', value)}
                                >
                                    <SelectTrigger className="col-span-4">
                                        <SelectValue placeholder="Tipo de Merma" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Por Forma">Por Forma</SelectItem>
                                        <SelectItem value="Por Calidad">Por Calidad</SelectItem>
                                        <SelectItem value="Otro">Otro</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="number"
                                    placeholder="Cant."
                                    value={wasteItem.quantity || ''}
                                    onChange={e => handleWasteChange(index, 'quantity', Number(e.target.value))}
                                    className="col-span-2"
                                />
                                <Input
                                    placeholder="Razón"
                                    value={wasteItem.reason}
                                    onChange={e => handleWasteChange(index, 'reason', e.target.value)}
                                    className="col-span-5"
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveWaste(index)} className="col-span-1">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" className="w-full" onClick={handleAddWaste}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Añadir Registro de Merma
                        </Button>
                    </CardContent>
                </Card>

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

    