
'use client';

import { useState, useMemo, useRef } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, UserMinus, Search, Wand2, Loader2, Clipboard } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { initialEmployees, Employee } from '../data';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateHrDocument, GenerateHrDocumentOutput } from '@/ai/flows/generate-hr-document';

export default function TerminationsPage() {
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [terminationDate, setTerminationDate] = useState<string>('');
    const [terminationReason, setTerminationReason] = useState<string>('');
    const [generatedDoc, setGeneratedDoc] = useState<GenerateHrDocumentOutput | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const activeEmployees = useMemo(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        return employees.filter(emp =>
            emp.status === 'Activo' &&
            (emp.name.toLowerCase().includes(lowercasedQuery) || emp.rut.toLowerCase().includes(lowercasedQuery))
        );
    }, [employees, searchQuery]);

    const handleOpenModal = (employee: Employee) => {
        setSelectedEmployee(employee);
        setTerminationDate('');
        setTerminationReason('');
        setGeneratedDoc(null);
        setIsModalOpen(true);
    };

    const handleGenerateSettlement = async () => {
        if (!selectedEmployee || !terminationDate || !terminationReason) {
            toast({ variant: 'destructive', title: 'Error', description: 'Completa todos los campos.' });
            return;
        }

        setIsGenerating(true);
        setGeneratedDoc(null);

        try {
            const result = await generateHrDocument({
                employeeName: selectedEmployee.name,
                employeeRut: selectedEmployee.rut,
                employeePosition: selectedEmployee.position,
                employeeStartDate: selectedEmployee.startDate,
                employeeSalary: selectedEmployee.salary,
                employeeContractType: selectedEmployee.contractType,
                documentType: 'Finiquito',
            });
            setGeneratedDoc(result);
            toast({ title: 'Borrador de Finiquito Generado', description: 'Revisa el documento generado por la IA.' });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo generar el documento.' });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleConfirmTermination = () => {
        if (!selectedEmployee) return;

        setEmployees(prev => prev.map(emp => 
            emp.id === selectedEmployee.id ? { ...emp, status: 'Terminado' } : emp
        ));

        // En una app real, también actualizaríamos el estado del contrato
        
        toast({ title: 'Trabajador Desvinculado', description: `${selectedEmployee.name} ha sido marcado como Terminado.` });
        setIsModalOpen(false);
    };
    
     const handleCopyToClipboard = () => {
        if (!generatedDoc?.documentHtmlContent) return;

        const el = document.createElement('div');
        el.innerHTML = generatedDoc.documentHtmlContent;
        navigator.clipboard.writeText(el.innerText || generatedDoc.documentHtmlContent);
        
        toast({
            title: "Copiado",
            description: "El contenido del finiquito se ha copiado al portapapeles.",
        });
    };

    return (
        <AppLayout pageTitle="Desvinculaciones y Finiquitos">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Gestión de Desvinculaciones</CardTitle>
                            <CardDescription className="font-body">Inicia el proceso de término de contrato y genera el finiquito.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Buscar trabajador activo..."
                                    className="pl-8 sm:w-[300px]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                             <Button asChild variant="outline">
                                <Link href="/hr">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>RUT</TableHead>
                                <TableHead>Cargo</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activeEmployees.length > 0 ? activeEmployees.map(emp => (
                                <TableRow key={emp.id}>
                                    <TableCell className="font-medium">{emp.name}</TableCell>
                                    <TableCell>{emp.rut}</TableCell>
                                    <TableCell>{emp.position}</TableCell>
                                    <TableCell><Badge>{emp.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="destructive" size="sm" onClick={() => handleOpenModal(emp)}>
                                            <UserMinus className="mr-2 h-4 w-4" />
                                            Iniciar Desvinculación
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No se encontraron trabajadores activos.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="font-headline">Proceso de Desvinculación: {selectedEmployee?.name}</DialogTitle>
                        <DialogDescription>
                            Completa los datos para generar el borrador del finiquito.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid md:grid-cols-2 gap-6 pt-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="termination-date">Fecha de Término de Contrato</Label>
                                <Input id="termination-date" type="date" value={terminationDate} onChange={e => setTerminationDate(e.target.value)} required/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="termination-reason">Causal de Despido (Art. 159, 160, 161)</Label>
                                <Textarea id="termination-reason" placeholder="Ej: Necesidades de la empresa, mutuo acuerdo de las partes, etc." value={terminationReason} onChange={e => setTerminationReason(e.target.value)} required/>
                            </div>
                            <Button onClick={handleGenerateSettlement} disabled={isGenerating || !terminationDate || !terminationReason} className="w-full">
                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                Generar Borrador de Finiquito
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <Label>Contenido del Finiquito Generado</Label>
                            <div className="h-64 border rounded-md p-4 bg-secondary/50 overflow-y-auto">
                                {isGenerating ? (
                                    <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                                ) : generatedDoc ? (
                                    <div dangerouslySetInnerHTML={{ __html: generatedDoc.documentHtmlContent }} className="prose prose-sm max-w-none" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-center text-muted-foreground"><p>El borrador del finiquito aparecerá aquí.</p></div>
                                )}
                            </div>
                            <Button variant="outline" onClick={handleCopyToClipboard} disabled={!generatedDoc}><Clipboard className="mr-2 h-4 w-4" />Copiar</Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleConfirmTermination} disabled={!generatedDoc}>Confirmar Desvinculación</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
