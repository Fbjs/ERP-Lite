
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { PlusCircle, FileText, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import JournalEntryForm, { JournalEntryData } from '@/components/journal-entry-form';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';


export type JournalEntry = {
    id: string;
    date: Date;
    description: string;
    entries: {
        account: string;
        debit: number;
        credit: number;
    }[];
    total: number;
    createdBy: string;
};

export const initialJournalEntries: JournalEntry[] = [
    {
        id: 'JE-001',
        date: new Date('2025-07-31'),
        description: 'Pago de arriendo oficina Julio 2025',
        entries: [
            { account: 'Gasto por Arriendo', debit: 700000, credit: 0 },
            { account: 'Banco', debit: 0, credit: 700000 },
        ],
        total: 700000,
        createdBy: 'Usuario Admin',
    },
    {
        id: 'JE-002',
        date: new Date('2025-07-31'),
        description: 'Pago de servicios básicos',
        entries: [
            { account: 'Gasto Agua', debit: 50000, credit: 0 },
            { account: 'Gasto Luz', debit: 120000, credit: 0 },
            { account: 'Banco', debit: 0, credit: 170000 },
        ],
        total: 170000,
        createdBy: 'Usuario Admin',
    }
];

const formatCurrency = (value: number) => {
    return value === 0 ? '' : value.toLocaleString('es-CL');
};


export default function JournalPage() {
    const [entries, setEntries] = useState<JournalEntry[]>(initialJournalEntries);
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
    const { toast } = useToast();

    const handleOpenForm = () => {
        setFormModalOpen(true);
    };

    const handleCreateEntry = (data: JournalEntryData) => {
        const totalDebit = data.entries.reduce((sum, item) => sum + item.debit, 0);
        const newEntry: JournalEntry = {
            id: `JE-${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
            ...data,
            total: totalDebit,
            createdBy: 'Usuario Admin',
        };
        setEntries(prev => [newEntry, ...prev]);
        setFormModalOpen(false);
        toast({
            title: "Asiento Contable Creado",
            description: `Se ha creado el asiento ${newEntry.id}.`,
        });
    };

    const handleOpenDetails = (entry: JournalEntry) => {
        setSelectedEntry(entry);
        setDetailsModalOpen(true);
    };


    return (
        <AppLayout pageTitle="Libro Diario">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Libro Diario</CardTitle>
                            <CardDescription className="font-body">
                                Registra asientos contables manuales para ingresos, egresos, traspasos y otros ajustes.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button asChild variant="outline">
                                <Link href="/accounting">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver
                                </Link>
                            </Button>
                            <Button onClick={handleOpenForm}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Nuevo Asiento
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[500px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nº Asiento</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Glosa</TableHead>
                                    <TableHead className="text-right">Monto Total</TableHead>
                                    <TableHead>Creado Por</TableHead>
                                    <TableHead><span className="sr-only">Acciones</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {entries.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="font-medium">{entry.id}</TableCell>
                                        <TableCell>{format(entry.date, "P", { locale: es })}</TableCell>
                                        <TableCell>{entry.description}</TableCell>
                                        <TableCell className="text-right">${entry.total.toLocaleString('es-CL')}</TableCell>
                                        <TableCell>{entry.createdBy}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDetails(entry)}>
                                                <FileText className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>

            <Dialog open={isFormModalOpen} onOpenChange={setFormModalOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-headline">Crear Nuevo Asiento Contable</DialogTitle>
                        <DialogDescription className="font-body">
                            Completa los detalles del asiento. El total de débitos debe ser igual al total de créditos.
                        </DialogDescription>
                    </DialogHeader>
                    <JournalEntryForm
                        onSubmit={handleCreateEntry}
                        onCancel={() => setFormModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={isDetailsModalOpen} onOpenChange={setDetailsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-headline">Detalle del Asiento: {selectedEntry?.id}</DialogTitle>
                    </DialogHeader>
                    {selectedEntry && (
                        <div className="max-h-[60vh] overflow-y-auto">
                            <div className="text-sm space-y-2">
                                <p><span className="font-semibold">Fecha:</span> {format(selectedEntry.date, "P", { locale: es })}</p>
                                <p><span className="font-semibold">Glosa:</span> {selectedEntry.description}</p>
                            </div>
                            <Table className="mt-4">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cuenta</TableHead>
                                        <TableHead className="text-right">Debe</TableHead>
                                        <TableHead className="text-right">Haber</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedEntry.entries.map((line, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{line.account}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(line.debit)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(line.credit)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow className="font-bold">
                                        <TableCell>Totales</TableCell>
                                        <TableCell className="text-right">${selectedEntry.total.toLocaleString('es-CL')}</TableCell>
                                        <TableCell className="text-right">${selectedEntry.total.toLocaleString('es-CL')}</TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
