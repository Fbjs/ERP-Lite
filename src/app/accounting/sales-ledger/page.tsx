
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Download, Calendar as CalendarIcon, MoreHorizontal, RefreshCcw, ChevronsUpDown, Check } from 'lucide-react';
import { useState, useMemo, useRef, forwardRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Logo from '@/components/logo';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';

type SaleDocument = {
    id: number;
    date: string;
    docType: 'Factura Electrónica' | 'Nota de Crédito';
    folio: string;
    client: string;
    rut: string;
    net: number;
    tax: number;
    total: number;
};

export const initialSales: SaleDocument[] = [
    { id: 1, date: '2025-07-15', docType: 'Factura Electrónica', folio: '101', client: 'Panaderia San Jose', rut: '76.111.222-3', net: 378151, tax: 71849, total: 450000 },
    { id: 2, date: '2025-07-20', docType: 'Factura Electrónica', folio: '102', client: 'Cafe Central', rut: '77.222.333-4', net: 1008824, tax: 191676, total: 1200500 },
    { id: 3, date: '2025-07-10', docType: 'Factura Electrónica', folio: '103', client: 'Supermercado del Sur', rut: '78.333.444-5', net: 735294, tax: 139706, total: 875000 },
    { id: 4, date: '2025-07-25', docType: 'Nota de Crédito', folio: '21', client: 'Cafe Central', rut: '77.222.333-4', net: -84034, tax: -15966, total: -100000 },
];

const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CL');
}

// Reusable Combobox Component for Filters
const ComboboxFilter = forwardRef<HTMLButtonElement, {
    options: { value: string; label: string }[];
    value: string;
    onSelect: (value: string) => void;
    placeholder: string;
}>(({ options, value, onSelect, placeholder }, ref) => {
    const [open, setOpen] = useState(false);
    
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    ref={ref}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value ? options.find(o => o.value === value)?.label : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Buscar..." />
                    <CommandEmpty>No encontrado.</CommandEmpty>
                    <CommandList>
                        <CommandGroup>
                            <CommandItem onSelect={() => { onSelect('all'); setOpen(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", value === 'all' ? "opacity-100" : "opacity-0")} />
                                Todos
                            </CommandItem>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={(currentValue) => {
                                        onSelect(currentValue === value ? '' : currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
});
ComboboxFilter.displayName = 'ComboboxFilter';


export default function SalesLedgerPage() {
    const { toast } = useToast();
    const reportContentRef = useRef<HTMLDivElement>(null);
    const journalEntryContentRef = useRef<HTMLDivElement>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subMonths(new Date(2025, 6, 1), 1),
        to: new Date(2025, 7, 0)
    });
    const [selectedDocType, setSelectedDocType] = useState('all');
    const [selectedClient, setSelectedClient] = useState('all');
    const [generationDate, setGenerationDate] = useState<Date | null>(null);


    const [selectedDocument, setSelectedDocument] = useState<SaleDocument | null>(null);
    const [isJournalEntryModalOpen, setIsJournalEntryModalOpen] = useState(false);

    useEffect(() => {
        setGenerationDate(new Date());
    }, []);

    const uniqueDocTypes = useMemo(() => Array.from(new Set(initialSales.map(doc => doc.docType))).map(d => ({ value: d, label: d })), []);
    const uniqueClients = useMemo(() => Array.from(new Set(initialSales.map(doc => doc.client))).map(c => ({ value: c, label: c })), []);

    const filteredSales = useMemo(() => {
        let sales = initialSales;
        
        if (dateRange?.from) {
            const fromDate = dateRange.from;
            const toDate = dateRange.to || fromDate;
            sales = sales.filter(doc => {
                const docDate = new Date(doc.date);
                return docDate >= fromDate && docDate <= toDate;
            });
        }
        
        if (selectedDocType !== 'all') {
            sales = sales.filter(doc => doc.docType === selectedDocType);
        }

        if (selectedClient !== 'all') {
            sales = sales.filter(doc => doc.client === selectedClient);
        }
        
        return sales;
    }, [dateRange, selectedDocType, selectedClient]);

    const totals = useMemo(() => {
        return filteredSales.reduce((acc, doc) => {
            acc.net += doc.net;
            acc.tax += doc.tax;
            acc.total += doc.total;
            return acc;
        }, { net: 0, tax: 0, total: 0 });
    }, [filteredSales]);
    
    const summaryByType = useMemo(() => {
        const summary: { [key: string]: { count: number, net: number, tax: number, total: number } } = {};
        
        filteredSales.forEach(doc => {
            if (!summary[doc.docType]) {
                summary[doc.docType] = { count: 0, net: 0, tax: 0, total: 0 };
            }
            summary[doc.docType].count++;
            summary[doc.docType].net += doc.net;
            summary[doc.docType].tax += doc.tax;
            summary[doc.docType].total += doc.total;
        });

        return Object.entries(summary);
    }, [filteredSales]);


    const handleDownloadPdf = async (contentRef: React.RefObject<HTMLDivElement>, fileName: string, orientation: 'p' | 'l' = 'l') => {
        const input = contentRef.current;
        if (input) {
            const { default: jsPDF } = await import('jspdf');
            const { default: html2canvas } = await import('html2canvas');
            
            const canvas = await html2canvas(input, { scale: 2, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF(orientation, 'px', 'a4');
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
            pdf.save(fileName);
            
            toast({
                title: "PDF Descargado",
                description: `El documento ${fileName} ha sido descargado.`,
            });
        }
    };
    
    const handleShowJournalEntry = (doc: SaleDocument) => {
        setSelectedDocument(doc);
        setIsJournalEntryModalOpen(true);
    };

    const resetFilters = () => {
        setDateRange({
            from: subMonths(new Date(2025, 6, 1), 1),
            to: new Date(2025, 7, 0)
        });
        setSelectedDocType('all');
        setSelectedClient('all');
    };


    return (
        <AppLayout pageTitle="Libro de Ventas">
            <div ref={reportContentRef} className="fixed -left-[9999px] top-0 bg-white text-black p-4 font-body" style={{ width: '11in', minHeight: '8.5in' }}>
                 <header className="flex justify-between items-start mb-4 border-b-2 border-gray-800 pb-2">
                    <div className="flex items-center gap-3">
                        <Logo className="w-24" />
                        <div>
                            <h1 className="text-xl font-bold font-headline text-gray-800">Libro de Ventas</h1>
                            <p className="text-xs text-gray-500">Panificadora Vollkorn - 76.123.456-7</p>
                        </div>
                    </div>
                    <div className="text-right text-xs">
                        <p><span className="font-semibold">Período:</span> {dateRange?.from ? format(dateRange.from, "P", { locale: es }) : ''} a {dateRange?.to ? format(dateRange.to, "P", { locale: es }) : 'Ahora'}</p>
                        {generationDate && <p><span className="font-semibold">Fecha de Emisión:</span> {format(generationDate, "P p", { locale: es })}</p>}
                        <div className="mt-2 text-left bg-gray-50 p-2 rounded-md border border-gray-200">
                             <p><span className="font-semibold">Cant. Documentos:</span> {filteredSales.length}</p>
                             <p><span className="font-semibold">Total Neto:</span> {formatCurrency(totals.net)}</p>
                             <p><span className="font-semibold">Total IVA:</span> {formatCurrency(totals.tax)}</p>
                             <p><span className="font-semibold">Total Documentos:</span> {formatCurrency(totals.total)}</p>
                        </div>
                    </div>
                </header>
                <Table className="w-full text-xs">
                    <TableHeader className="bg-gray-100">
                        <TableRow>
                            <TableHead className="p-1 text-left font-bold text-gray-700">Fecha</TableHead>
                            <TableHead className="p-1 text-left font-bold text-gray-700">Tipo Doc.</TableHead>
                            <TableHead className="p-1 text-left font-bold text-gray-700">Folio</TableHead>
                            <TableHead className="p-1 text-left font-bold text-gray-700">Cliente</TableHead>
                            <TableHead className="p-1 text-left font-bold text-gray-700">RUT</TableHead>
                            <TableHead className="p-1 text-right font-bold text-gray-700">Neto</TableHead>
                            <TableHead className="p-1 text-right font-bold text-gray-700">IVA</TableHead>
                            <TableHead className="p-1 text-right font-bold text-gray-700">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSales.map((doc) => (
                            <TableRow key={doc.id} className="border-b border-gray-200">
                                <TableCell className="p-1">{format(new Date(doc.date), "P", { locale: es })}</TableCell>
                                <TableCell className="p-1">{doc.docType}</TableCell>
                                <TableCell className="p-1">{doc.folio}</TableCell>
                                <TableCell className="p-1">{doc.client}</TableCell>
                                <TableCell className="p-1">{doc.rut}</TableCell>
                                <TableCell className="p-1 text-right">{formatCurrency(doc.net)}</TableCell>
                                <TableCell className="p-1 text-right">{formatCurrency(doc.tax)}</TableCell>
                                <TableCell className="p-1 text-right">{formatCurrency(doc.total)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                     <TableFooter>
                        <TableRow className="bg-gray-100 font-bold">
                            <TableCell colSpan={5} className="text-right p-1">Totales</TableCell>
                            <TableCell className="text-right p-1">{formatCurrency(totals.net)}</TableCell>
                            <TableCell className="text-right p-1">{formatCurrency(totals.tax)}</TableCell>
                            <TableCell className="text-right p-1">{formatCurrency(totals.total)}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
                 <footer className="text-center text-xs text-gray-400 border-t pt-2 mt-4">
                    <p>Reporte generado por Vollkorn ERP.</p>
                </footer>
            </div>
            
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Libro de Ventas</CardTitle>
                            <CardDescription className="font-body">Consulta los documentos de venta emitidos en un período.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => handleDownloadPdf(reportContentRef, `libro-ventas-${new Date().toISOString().split('T')[0]}.pdf`)}>
                                <Download className="mr-2 h-4 w-4" />
                                PDF
                            </Button>
                             <Button disabled>
                                <Download className="mr-2 h-4 w-4" />
                                Excel
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b">
                         <div className="flex-1 min-w-[240px] space-y-2">
                            <Label>Período</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !dateRange && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                            {format(dateRange.from, "LLL dd, y", { locale: es })} -{" "}
                                            {format(dateRange.to, "LLL dd, y", { locale: es })}
                                            </>
                                        ) : (
                                            format(dateRange.from, "LLL dd, y", { locale: es })
                                        )
                                        ) : (
                                        <span>Selecciona un rango</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        numberOfMonths={2}
                                        locale={es}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex-1 min-w-[200px] space-y-2">
                            <Label>Tipo Documento</Label>
                             <ComboboxFilter
                                options={uniqueDocTypes}
                                value={selectedDocType}
                                onSelect={setSelectedDocType}
                                placeholder="Filtrar por tipo..."
                            />
                        </div>
                        <div className="flex-1 min-w-[240px] space-y-2">
                            <Label>Cliente</Label>
                             <ComboboxFilter
                                options={uniqueClients}
                                value={selectedClient}
                                onSelect={setSelectedClient}
                                placeholder="Filtrar por cliente..."
                            />
                        </div>
                        <div className="flex items-end">
                            <Button variant="ghost" onClick={resetFilters}>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Limpiar
                            </Button>
                        </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Documentos Totales</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{filteredSales.length}</div>
                                <p className="text-xs text-muted-foreground">En el período seleccionado</p>
                            </CardContent>
                        </Card>
                        {summaryByType.map(([docType, summary]) => (
                            <Card key={docType}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{docType}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatCurrency(summary.total)}</div>
                                    <p className="text-xs text-muted-foreground">{summary.count} documentos</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Tipo Doc.</TableHead>
                                <TableHead>Folio</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>RUT</TableHead>
                                <TableHead className="text-right">Neto</TableHead>
                                <TableHead className="text-right">IVA</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead><span className="sr-only">Acciones</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSales.length > 0 ? filteredSales.map(doc => (
                                <TableRow key={doc.id}>
                                    <TableCell>{format(new Date(doc.date), "P", { locale: es })}</TableCell>
                                    <TableCell>{doc.docType}</TableCell>
                                    <TableCell>{doc.folio}</TableCell>
                                    <TableCell>{doc.client}</TableCell>
                                    <TableCell>{doc.rut}</TableCell>
                                    <TableCell className="text-right">${formatCurrency(doc.net)}</TableCell>
                                    <TableCell className="text-right">${formatCurrency(doc.tax)}</TableCell>
                                    <TableCell className="text-right">${formatCurrency(doc.total)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleShowJournalEntry(doc)}>
                                                    Ver Asiento Contable
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center h-24">No se encontraron documentos con los filtros seleccionados.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={5} className="text-right font-bold">TOTALES</TableCell>
                                <TableCell className="text-right font-bold">${formatCurrency(totals.net)}</TableCell>
                                <TableCell className="text-right font-bold">${formatCurrency(totals.tax)}</TableCell>
                                <TableCell className="text-right font-bold">${formatCurrency(totals.total)}</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isJournalEntryModalOpen} onOpenChange={setIsJournalEntryModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-headline">Asiento Contable</DialogTitle>
                        <DialogDescription>
                            Asiento para el documento {selectedDocument?.docType} {selectedDocument?.folio}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedDocument && (
                         <div ref={journalEntryContentRef} className="p-4 bg-white text-black font-body">
                            <div className="text-center mb-4">
                                <h3 className="font-bold font-headline text-lg">Comprobante de Diario</h3>
                                <p className="text-sm">Panificadora Vollkorn</p>
                                <p className="text-xs text-gray-500">{format(new Date(selectedDocument.date), "'Glosa del' dd 'de' MMMM 'de' yyyy", { locale: es })}</p>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-black">Cuenta Contable</TableHead>
                                        <TableHead className="text-right text-black">Debe</TableHead>
                                        <TableHead className="text-right text-black">Haber</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Clientes</TableCell>
                                        <TableCell className="text-right">${formatCurrency(selectedDocument.total)}</TableCell>
                                        <TableCell className="text-right">-</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="pl-6">IVA Débito Fiscal</TableCell>
                                        <TableCell className="text-right">-</TableCell>
                                        <TableCell className="text-right">${formatCurrency(selectedDocument.tax)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="pl-6">Ventas</TableCell>
                                        <TableCell className="text-right">-</TableCell>
                                        <TableCell className="text-right">${formatCurrency(selectedDocument.net)}</TableCell>
                                    </TableRow>
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell className="font-bold">Totales</TableCell>
                                        <TableCell className="text-right font-bold">${formatCurrency(selectedDocument.total)}</TableCell>
                                        <TableCell className="text-right font-bold">${formatCurrency(selectedDocument.total)}</TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                            <p className="text-xs text-gray-600 mt-4">Glosa: Centralización de venta según {selectedDocument.docType} N°{selectedDocument.folio}.</p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsJournalEntryModalOpen(false)}>Cerrar</Button>
                        <Button onClick={() => handleDownloadPdf(journalEntryContentRef, `asiento-${selectedDocument?.folio}.pdf`, 'p')}>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar PDF
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AppLayout>
    )
}

    