
'use client';

import { useState, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, CheckCircle2, AlertCircle, RefreshCw, Wand2, Download, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import Logo from './logo';
import { initialBankAccounts } from '../app/admin/bank-accounts/page';
import { ScrollArea } from './ui/scroll-area';

type BankTransaction = {
    id: string;
    date: string;
    description: string;
    debit: number;
    credit: number;
};

type SystemTransaction = {
    id: string;
    date: string;
    description: string;
    debit: number;
    credit: number;
    chargeAccount: string;
    isReconciled: boolean;
};


const initialBankTransactions: BankTransaction[] = [
    { id: 'BANK001', date: '2025-07-15', description: 'Transferencia de Panaderia San Jose, Factura F001', debit: 0, credit: 450000 },
    { id: 'BANK002', date: '2025-07-11', description: 'Pago a Harinas del Sur, Factura 78901', debit: 800000, credit: 0 },
    { id: 'BANK003', date: '2025-07-10', description: 'Depósito de Supermercado del Sur, Factura F003', debit: 0, credit: 875000 },
    { id: 'BANK004', date: '2025-07-21', description: 'Transferencia de Cafe Central, Factura F002', debit: 0, credit: 1200500 },
    { id: 'BANK005', date: '2025-07-30', description: 'Pago Nómina de Sueldos', debit: 2500000, credit: 0 },
    { id: 'BANK006', date: '2025-07-31', description: 'Abono Intereses a Favor', debit: 0, credit: 50250 },
    { id: 'BANK007', date: '2025-07-31', description: 'Comisión por Mantención', debit: 15000, credit: 0 },
    { id: 'BANK008', date: '2025-07-29', description: 'Pago Servicio Eléctrico CGE', debit: 120000, credit: 0 },
];

const initialSystemTransactions: SystemTransaction[] = [
    { id: 'F001', date: '2025-07-15', description: 'Factura a Panaderia San Jose', debit: 450000, credit: 0, chargeAccount: 'Clientes', isReconciled: false },
    { id: 'F002', date: '2025-07-20', description: 'Factura a Cafe Central', debit: 1200500, credit: 0, chargeAccount: 'Clientes', isReconciled: false },
    { id: 'F003', date: '2025-07-10', description: 'Factura a Supermercado del Sur', debit: 875000, credit: 0, chargeAccount: 'Clientes', isReconciled: false },
    { id: 'G001', date: '2025-07-11', description: 'Pago Proveedor Harinas del Sur', debit: 0, credit: 800000, chargeAccount: 'Proveedores', isReconciled: false },
    { id: 'F005', date: '2025-07-22', description: 'Factura a Hotel Grand Vista', debit: 500000, credit: 0, chargeAccount: 'Clientes', isReconciled: false },
    { id: 'REM01', date: '2025-07-30', description: 'Centralización Sueldos Julio', debit: 0, credit: 2500000, chargeAccount: 'Sueldos por Pagar', isReconciled: false },
    { id: 'INT01', date: '2025-07-31', description: 'Reconocimiento Intereses Ganados', debit: 50250, credit: 0, chargeAccount: 'Ingresos Financieros', isReconciled: false },
    { id: 'G002', date: '2025-07-31', description: 'Gasto Mantención Cuenta', debit: 0, credit: 15000, chargeAccount: 'Gastos Bancarios', isReconciled: false },
    { id: 'G003', date: '2025-07-29', description: 'Provisión Gasto Luz', debit: 0, credit: 120000, chargeAccount: 'Gasto en Luz', isReconciled: false },
];

export default function BankReconciliation() {
    const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
    const [systemTransactions, setSystemTransactions] = useState<SystemTransaction[]>(initialSystemTransactions);
    const [selectedBank, setSelectedBank] = useState<string[]>([]);
    const [selectedSystem, setSelectedSystem] = useState<string[]>([]);
    const [selectedBankAccount, setSelectedBankAccount] = useState<string>('');
    const historyReportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    
    const reconciledTransactions = useMemo(() => systemTransactions.filter(tx => tx.isReconciled), [systemTransactions]);

    const handleLoadStatement = () => {
        if(!selectedBankAccount) {
            toast({ variant: 'destructive', title: 'Error', description: 'Por favor, selecciona una cuenta bancaria.' });
            return;
        }
        setBankTransactions(initialBankTransactions);
        toast({
            title: "Extracto Cargado",
            description: "Se han cargado las transacciones bancarias para conciliar.",
        });
    };

    const handleAutoSuggest = () => {
        let suggestedBankIds: string[] = [];
        let suggestedSystemIds: string[] = [];
        let suggestionsCount = 0;

        const availableSystemTxs = systemTransactions.filter(st => !st.isReconciled);

        for (const bankTx of bankTransactions) {
            for (const systemTx of availableSystemTxs) {
                const isMatch = (bankTx.credit === systemTx.debit && bankTx.credit > 0) || (bankTx.debit === systemTx.credit && bankTx.debit > 0);
                const descriptionIncludesId = systemTx.id.length > 2 && bankTx.description.toUpperCase().includes(systemTx.id.toUpperCase());

                if (isMatch && descriptionIncludesId && !suggestedBankIds.includes(bankTx.id) && !suggestedSystemIds.includes(systemTx.id)) {
                    suggestedBankIds.push(bankTx.id);
                    suggestedSystemIds.push(systemTx.id);
                    suggestionsCount++;
                    break; 
                }
            }
        }
        
        setSelectedBank(prev => [...new Set([...prev, ...suggestedBankIds])]);
        setSelectedSystem(prev => [...new Set([...prev, ...suggestedSystemIds])]);

        if (suggestionsCount > 0) {
            toast({
                title: "Sugerencias Encontradas",
                description: `Se han seleccionado automáticamente ${suggestionsCount} coincidencias. Revísalas y procesa la conciliación.`
            });
        } else {
             toast({
                variant: 'default',
                title: "Sin Sugerencias Nuevas",
                description: `No se encontraron nuevas coincidencias automáticas claras.`
            });
        }
    };


    const handleReconcile = () => {
        const selectedBankTxs = bankTransactions.filter(tx => selectedBank.includes(tx.id));
        const selectedSystemTxs = systemTransactions.filter(tx => selectedSystem.includes(tx.id));

        const totalBankDebit = selectedBankTxs.reduce((sum, tx) => sum + tx.debit, 0);
        const totalBankCredit = selectedBankTxs.reduce((sum, tx) => sum + tx.credit, 0);
        const totalSystemDebit = selectedSystemTxs.reduce((sum, tx) => sum + tx.debit, 0);
        const totalSystemCredit = selectedSystemTxs.reduce((sum, tx) => sum + tx.credit, 0);
        
        const bankSideTotal = totalBankCredit - totalBankDebit;
        const systemSideTotal = totalSystemDebit - totalSystemCredit;

        if (bankSideTotal === systemSideTotal && selectedBank.length > 0 && selectedSystem.length > 0) {
            setSystemTransactions(prev =>
                prev.map(tx =>
                    selectedSystem.includes(tx.id) ? { ...tx, isReconciled: true } : tx
                )
            );
            setBankTransactions(prev =>
                prev.filter(tx => !selectedBank.includes(tx.id))
            );
            setSelectedBank([]);
            setSelectedSystem([]);
            toast({
                title: "Conciliación Exitosa",
                description: `Se han conciliado ${selectedSystem.length} movimiento(s).`,
            });
        } else {
            toast({
                variant: 'destructive',
                title: "Error de Conciliación",
                description: `Los montos no coinciden o la selección es inválida. Neto Banco: ${bankSideTotal.toLocaleString('es-CL', {style: 'currency', currency: 'CLP'})}, Neto Sistema: ${systemSideTotal.toLocaleString('es-CL', {style: 'currency', currency: 'CLP'})}`,
            });
        }
    };
    
    const summary = useMemo(() => {
        const unreconciled = systemTransactions.filter(tx => !tx.isReconciled);

        const reconciledAmount = reconciledTransactions.reduce((sum, tx) => sum + (tx.debit - tx.credit), 0);
        const unreconciledAmount = unreconciled.reduce((sum, tx) => sum + (tx.debit - tx.credit), 0);

        return {
            reconciledCount: reconciledTransactions.length,
            reconciledAmount: reconciledAmount,
            unreconciledCount: unreconciled.length,
            unreconciledAmount: unreconciledAmount,
        };
    }, [systemTransactions, reconciledTransactions]);

    const formatCurrency = (value: number) => {
        return value === 0 ? '-' : value.toLocaleString('es-CL', {style: 'currency', currency: 'CLP'});
    }
    
    const handleDownloadHistoryPdf = async () => {
        const input = historyReportRef.current;
        if (!input) return;
        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'px', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const ratio = canvas.width / canvas.height;
        let newWidth = pdfWidth - 20;
        let newHeight = newWidth / ratio;
        if (newHeight > pdfHeight - 20) {
            newHeight = pdfHeight - 20;
            newWidth = newHeight * ratio;
        }
        const xOffset = (pdfWidth - newWidth) / 2;
        pdf.addImage(imgData, 'PNG', xOffset, 10, newWidth, newHeight);
        pdf.save(`historial-conciliaciones-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handleDownloadHistoryExcel = () => {
        const dataForSheet = reconciledTransactions.map(tx => ({
            'Fecha': format(new Date(tx.date + 'T00:00:00'), 'P', { locale: es }),
            'Glosa': tx.description,
            'Cuenta Cargo': tx.chargeAccount,
            'Debe': tx.debit,
            'Haber': tx.credit,
            'Estado': 'Conciliado',
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Historial Conciliaciones");
        XLSX.writeFile(workbook, `historial-conciliaciones-${new Date().toISOString().split('T')[0]}.xlsx`);
    };


    return (
        <div className="space-y-6">
            <div ref={historyReportRef} className="fixed -left-[9999px] top-0 bg-white text-black p-4 font-body" style={{ width: '11in' }}>
                 <header className="flex justify-between items-start mb-4 border-b-2 border-gray-800 pb-2">
                    <div className="flex items-center gap-3">
                        <Logo className="w-24" />
                        <div>
                            <h1 className="text-xl font-bold font-headline text-gray-800">Historial de Conciliaciones</h1>
                            <p className="text-xs text-gray-500">Panificadora Vollkorn</p>
                        </div>
                    </div>
                     <div className="text-right text-xs">
                        <p><span className="font-semibold">Fecha Emisión:</span> {format(new Date(), "P p", { locale: es })}</p>
                     </div>
                </header>
                 <Table className="w-full text-xs">
                    <TableHeader className="bg-gray-100">
                        <TableRow>
                            <TableHead className="p-1 font-bold text-gray-700">Fecha</TableHead>
                            <TableHead className="p-1 font-bold text-gray-700">Glosa</TableHead>
                            <TableHead className="p-1 font-bold text-gray-700">Cta. Cargo</TableHead>
                            <TableHead className="p-1 font-bold text-gray-700 text-right">Debe</TableHead>
                            <TableHead className="p-1 font-bold text-gray-700 text-right">Haber</TableHead>
                            <TableHead className="p-1 font-bold text-gray-700 text-center">Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reconciledTransactions.map(tx => (
                            <TableRow key={tx.id}>
                                <TableCell className="p-1">{format(new Date(tx.date + 'T00:00:00'), 'P', { locale: es })}</TableCell>
                                <TableCell className="p-1">{tx.description}</TableCell>
                                <TableCell className="p-1">{tx.chargeAccount}</TableCell>
                                <TableCell className="p-1 text-right">{formatCurrency(tx.debit)}</TableCell>
                                <TableCell className="p-1 text-right">{formatCurrency(tx.credit)}</TableCell>
                                <TableCell className="p-1 text-center">Conciliado</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex flex-wrap items-end gap-4">
                 <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="bank-account">Cuenta Bancaria</Label>
                    <Select value={selectedBankAccount} onValueChange={setSelectedBankAccount}>
                        <SelectTrigger id="bank-account">
                            <SelectValue placeholder="Selecciona un banco..." />
                        </SelectTrigger>
                        <SelectContent>
                           {initialBankAccounts.map(account => (
                                <SelectItem key={account.id} value={account.id}>
                                    {account.banco} - {account.tipoCuenta} {account.numeroCuenta}
                                </SelectItem>
                           ))}
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="bank-statement">Extracto Bancario (.csv, .xlsx)</Label>
                    <Input id="bank-statement" type="file" />
                </div>
                <Button onClick={handleLoadStatement}><Upload className="mr-2 h-4 w-4" /> Cargar (Simulación)</Button>
                <Button onClick={handleAutoSuggest} variant="outline" disabled={bankTransactions.length === 0}>
                    <Wand2 className="mr-2 h-4 w-4"/>
                    Sugerir Conciliación
                </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Movimientos Bancarios (Extracto)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-96">
                            <Table>
                                <TableHeader className="sticky top-0 bg-secondary">
                                    <TableRow>
                                        <TableHead className="w-[50px]"></TableHead>
                                        <TableHead>Glosa</TableHead>
                                        <TableHead className="text-right">Debe</TableHead>
                                        <TableHead className="text-right">Haber</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bankTransactions.map(tx => (
                                        <TableRow key={tx.id} data-state={selectedBank.includes(tx.id) ? 'selected' : undefined}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedBank.includes(tx.id)}
                                                    onCheckedChange={checked => {
                                                        setSelectedBank(prev => checked ? [...prev, tx.id] : prev.filter(id => id !== tx.id))
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <p>{tx.description}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(tx.date + 'T00:00:00').toLocaleDateString('es-CL', {timeZone: 'UTC'})}</p>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(tx.debit)}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(tx.credit)}</TableCell>
                                        </TableRow>
                                    ))}
                                    {bankTransactions.length === 0 && (
                                        <TableRow><TableCell colSpan={4} className="text-center h-48 text-muted-foreground">Cargue un extracto bancario.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Movimientos del Sistema (Libro Mayor)</CardTitle>
                    </CardHeader>
                     <CardContent>
                         <ScrollArea className="h-96">
                            <Table>
                                <TableHeader className="sticky top-0 bg-secondary">
                                    <TableRow>
                                        <TableHead className="w-[50px]"></TableHead>
                                        <TableHead>Glosa / Cta. Cargo</TableHead>
                                        <TableHead className="text-right">Debe</TableHead>
                                        <TableHead className="text-right">Haber</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                     {systemTransactions.filter(tx => !tx.isReconciled).map(tx => (
                                        <TableRow key={tx.id} data-state={selectedSystem.includes(tx.id) ? 'selected' : undefined}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedSystem.includes(tx.id)}
                                                    onCheckedChange={checked => {
                                                        setSelectedSystem(prev => checked ? [...prev, tx.id] : prev.filter(id => id !== tx.id))
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <p>{tx.description}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(tx.date + 'T00:00:00').toLocaleDateString('es-CL', {timeZone: 'UTC'})} / {tx.chargeAccount}</p>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(tx.debit)}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(tx.credit)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle>Resumen de Saldos Contables</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                            <div>
                                <p className="text-sm text-muted-foreground">Saldo Conciliado</p>
                                <p className="text-xl font-bold">{summary.reconciledAmount.toLocaleString('es-CL', {style: 'currency', currency: 'CLP'})}</p>
                                <p className="text-xs text-muted-foreground">({summary.reconciledCount} movimientos)</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                             <AlertCircle className="h-8 w-8 text-yellow-600" />
                            <div>
                                <p className="text-sm text-muted-foreground">Saldo Pendiente</p>
                                <p className="text-xl font-bold">{summary.unreconciledAmount.toLocaleString('es-CL', {style: 'currency', currency: 'CLP'})}</p>
                                <p className="text-xs text-muted-foreground">({summary.unreconciledCount} movimientos)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                 <div className="flex justify-center items-center">
                    <Button 
                        size="lg" 
                        onClick={handleReconcile} 
                        disabled={selectedBank.length === 0 || selectedSystem.length === 0}
                        className="h-24 w-full text-lg"
                    >
                        <RefreshCw className="mr-4 h-8 w-8" />
                        Conciliar<br />Selección
                    </Button>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                     <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                             <CardTitle>Historial de Conciliaciones</CardTitle>
                            <CardDescription>
                                Movimientos del sistema que ya han sido conciliados.
                            </CardDescription>
                        </div>
                         <div className="flex items-center gap-2">
                            <Button variant="outline" disabled={reconciledTransactions.length === 0} onClick={handleDownloadHistoryExcel}>
                                <FileSpreadsheet className="mr-2 h-4 w-4"/> Exportar Excel
                            </Button>
                             <Button variant="outline" disabled={reconciledTransactions.length === 0} onClick={handleDownloadHistoryPdf}>
                                <Download className="mr-2 h-4 w-4"/> Exportar PDF
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-96 overflow-y-auto border rounded-md">
                        <Table>
                            <TableHeader className="sticky top-0 bg-secondary">
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Glosa</TableHead>
                                    <TableHead>Cta. Cargo</TableHead>
                                    <TableHead className="text-right">Debe</TableHead>
                                    <TableHead className="text-right">Haber</TableHead>
                                    <TableHead className="text-center">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reconciledTransactions.map(tx => (
                                    <TableRow key={tx.id} className="bg-green-50/50">
                                        <TableCell>{new Date(tx.date + 'T00:00:00').toLocaleDateString('es-CL', {timeZone: 'UTC'})}</TableCell>
                                        <TableCell>{tx.description}</TableCell>
                                        <TableCell>{tx.chargeAccount}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(tx.debit)}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(tx.credit)}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                Conciliado
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {reconciledTransactions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                            No hay movimientos conciliados aún.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
    