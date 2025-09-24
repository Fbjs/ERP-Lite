
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, SlidersHorizontal, BarChart3, FileText, CheckCircle, PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { es } from 'date-fns/locale';
import { initialOrders } from '../production/page';

const qualityModules = [
    { href: '/quality/parameters', title: 'Parámetros de Calidad', description: 'Define los estándares y métricas para cada producto.', icon: SlidersHorizontal },
    { href: '#', title: 'Reportes de Calidad', description: 'Visualiza tendencias y tasas de no conformidad.', icon: BarChart3 },
    { href: '#', title: 'Documentación', description: 'Gestiona los manuales y procedimientos de calidad.', icon: FileText },
];

type QualityCheck = {
    id: string;
    orderId: string;
    product: string;
    date: Date;
    result: 'Aprobado' | 'Rechazado';
    inspector: string;
    details: { parameter: string, value: string, status: 'OK' | 'Fuera de Rango' }[];
};

const initialChecks: QualityCheck[] = [
    { id: 'QC-001', orderId: 'PROD021', product: 'PAN LINAZA 500 GRS', date: new Date(), result: 'Aprobado', inspector: 'Ana Paredes', details: [{parameter: 'Peso', value: '502gr', status: 'OK'}, {parameter: 'Humedad', value: '40%', status: 'OK'}] },
    { id: 'QC-002', orderId: 'PROD022', product: 'PAN GUAGUA BLANCA 16X16', date: new Date(), result: 'Aprobado', inspector: 'Ana Paredes', details: [{parameter: 'Peso', value: '95gr', status: 'OK'}] },
    { id: 'QC-003', orderId: 'PROD019', product: 'PAN SCHWARZBROT 750 GRS', date: new Date(Date.now() - 86400000), result: 'Rechazado', inspector: 'Carlos Soto', details: [{parameter: 'Color', value: 'Muy oscuro', status: 'Fuera de Rango'}] },
    { id: 'QC-004', orderId: 'PROD020', product: 'CRUTONES HOREADOS 1KG 11mm', date: new Date(Date.now() - 172800000), result: 'Aprobado', inspector: 'Ana Paredes', details: [{parameter: 'Crocancia', value: 'OK', status: 'OK'}] },
];

export default function QualityPage() {
    const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>(initialChecks);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: new Date(new Date().setDate(new Date().getDate() - 30)), to: new Date() });
    const [statusFilter, setStatusFilter] = useState('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedCheck, setSelectedCheck] = useState<QualityCheck | null>(null);

    const filteredChecks = useMemo(() => {
        return qualityChecks.filter(check => {
            const dateMatch = !dateRange || (dateRange.from && dateRange.to && check.date >= dateRange.from && check.date <= dateRange.to);
            const statusMatch = statusFilter === 'all' || check.result === statusFilter;
            return dateMatch && statusMatch;
        });
    }, [qualityChecks, dateRange, statusFilter]);
    
    const handleViewDetails = (check: QualityCheck) => {
        setSelectedCheck(check);
        setIsDetailsModalOpen(true);
    };
    
     const handleCreateCheck = (data: any) => {
        const newCheck: QualityCheck = {
            id: `QC-${Math.floor(Math.random() * 1000)}`,
            orderId: data.orderId,
            product: initialOrders.find(o => o.id === data.orderId)?.product || 'N/A',
            date: new Date(),
            result: data.result,
            inspector: 'Usuario Admin',
            details: [], // Details would be added based on the form
        };
        setQualityChecks(prev => [newCheck, ...prev]);
        setIsCreateModalOpen(false);
    };


    return (
        <AppLayout pageTitle="Control de Calidad">
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {qualityModules.map((module) => (
                        <Link href={module.href} key={module.title} className="block hover:no-underline">
                            <Card className="hover:border-primary hover:shadow-lg transition-all h-full flex flex-col">
                                <CardHeader className="flex-grow">
                                    <div className="flex items-start gap-4">
                                         <div className="p-3 bg-primary/10 rounded-full">
                                            <module.icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="font-headline text-xl">{module.title}</CardTitle>
                                            <CardDescription className="font-body mt-1">{module.description}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <CardTitle className="font-headline">Controles de Calidad Recientes</CardTitle>
                                <CardDescription>Listado de los últimos controles realizados a las órdenes de producción.</CardDescription>
                            </div>
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Control
                            </Button>
                        </div>
                         <div className="flex flex-wrap items-end gap-4 border-t pt-4 mt-4">
                            <div className="space-y-2">
                                <Label>Filtrar por Fecha</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button id="date" variant={"outline"} className={cn("w-[300px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateRange?.from ? (dateRange.to ? (<>{format(dateRange.from, "LLL dd, y", { locale: es })} - {format(dateRange.to, "LLL dd, y", { locale: es })}</>) : (format(dateRange.from, "LLL dd, y", { locale: es }))) : (<span>Selecciona un rango</span>)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={es}/>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label>Filtrar por Estado</Label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="Aprobado">Aprobado</SelectItem>
                                        <SelectItem value="Rechazado">Rechazado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Orden de Prod.</TableHead>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Resultado</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredChecks.map(check => (
                                    <TableRow key={check.id}>
                                        <TableCell>{check.orderId}</TableCell>
                                        <TableCell>{check.product}</TableCell>
                                        <TableCell>{format(check.date, 'dd-MM-yyyy')}</TableCell>
                                        <TableCell>
                                            <Badge variant={check.result === 'Aprobado' ? 'default' : 'destructive'}>
                                                {check.result}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(check)}>Ver Detalles</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                 {filteredChecks.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">No se encontraron controles con los filtros aplicados.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

            </div>

             <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registrar Nuevo Control de Calidad</DialogTitle>
                    </DialogHeader>
                     <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="orderId">Orden de Producción</Label>
                            <Select><SelectTrigger><SelectValue placeholder="Seleccionar orden..." /></SelectTrigger><SelectContent>{initialOrders.map(o => <SelectItem key={o.id} value={o.id}>{o.id} - {o.product}</SelectItem>)}</SelectContent></Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Parámetros</Label>
                            <p className="text-sm text-muted-foreground">Aquí irían los parámetros dinámicos del producto...</p>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="result">Resultado General</Label>
                            <Select><SelectTrigger><SelectValue placeholder="Seleccionar resultado..." /></SelectTrigger><SelectContent><SelectItem value="Aprobado">Aprobado</SelectItem><SelectItem value="Rechazado">Rechazado</SelectItem></SelectContent></Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
                        <Button onClick={() => handleCreateCheck({orderId: 'PROD021', result: 'Aprobado'})}>Guardar Control</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Detalle del Control: {selectedCheck?.id}</DialogTitle>
                        <DialogDescription>Orden de Producción: {selectedCheck?.orderId}</DialogDescription>
                    </DialogHeader>
                     {selectedCheck && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><span className="font-semibold">Producto:</span> {selectedCheck.product}</div>
                                <div><span className="font-semibold">Fecha:</span> {format(selectedCheck.date, 'PPP', {locale: es})}</div>
                                <div><span className="font-semibold">Inspector:</span> {selectedCheck.inspector}</div>
                                <div><span className="font-semibold">Resultado:</span> <Badge variant={selectedCheck.result === 'Aprobado' ? 'default' : 'destructive'}>{selectedCheck.result}</Badge></div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Parámetros Medidos</h4>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Parámetro</TableHead>
                                            <TableHead>Valor</TableHead>
                                            <TableHead>Estado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedCheck.details.map(d => (
                                            <TableRow key={d.parameter}>
                                                <TableCell>{d.parameter}</TableCell>
                                                <TableCell>{d.value}</TableCell>
                                                <TableCell><Badge variant={d.status === 'OK' ? 'secondary' : 'destructive'}>{d.status}</Badge></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                             <div className="space-y-2">
                                <h4 className="font-semibold">Documento Asociado</h4>
                                <Button variant="outline" className="w-full justify-start"><FileText className="mr-2 h-4 w-4"/> Informe_Calidad_QC-001.pdf</Button>
                            </div>
                        </div>
                     )}
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
