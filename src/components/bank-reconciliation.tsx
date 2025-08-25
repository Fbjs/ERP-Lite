'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

type BankTransaction = {
    id: string;
    date: string;
    description: string;
    debit: number;
    credit: number;
    chargeAccount: string;
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


// Datos de ejemplo para simulación
const initialBankTransactions: BankTransaction[] = [
    { id: 'BANK001', date: '2025-07-15', description: 'Transferencia de Panaderia San Jose', debit: 0, credit: 450.00, chargeAccount: 'Cuentas por Cobrar' },
    { id: 'BANK002', date: '2025-07-11', description: 'Pago a Harinas del Sur', debit: 800.00, credit: 0, chargeAccount: 'Cuentas por Pagar' },
    { id: 'BANK003', date: '2025-07-10', description: 'Depósito de Supermercado del Sur', debit: 0, credit: 875.00, chargeAccount: 'Cuentas por Cobrar' },
    { id: 'BANK004', date: '2025-07-21', description: 'Transferencia de Cafe Central', debit: 0, credit: 1200.50, chargeAccount: 'Cuentas por Cobrar' },
];

const initialSystemTransactions: SystemTransaction[] = [
    { id: 'F001', date: '2025-07-15', description: 'Factura a Panaderia San Jose', debit: 0, credit: 450.00, chargeAccount: 'Ventas', isReconciled: false },
    { id: 'F002', date: '2025-07-20', description: 'Factura a Cafe Central', debit: 0, credit: 1200.50, chargeAccount: 'Ventas', isReconciled: false },
    { id: 'F003', date: '2025-07-10', description: 'Factura a Supermercado del Sur', debit: 0, credit: 875.00, chargeAccount: 'Ventas', isReconciled: false },
    { id: 'G001', date: '2025-07-11', description: 'Gasto en Harinas del Sur', debit: 800.00, credit: 0, chargeAccount: 'Costos', isReconciled: false },
    { id: 'F005', date: '2025-07-22', description: 'Factura a Hotel Grand Vista', debit: 0, credit: 500.00, chargeAccount: 'Ventas', isReconciled: false },
];

export default function BankReconciliation() {
    const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
    const [systemTransactions, setSystemTransactions] = useState<SystemTransaction[]>(initialSystemTransactions);
    const [selectedBank, setSelectedBank] = useState<string[]>([]);
    const [selectedSystem, setSelectedSystem] = useState<string[]>([]);
    const { toast } = useToast();

    const handleLoadStatement = () => {
        // Simulación de carga de archivo
        setBankTransactions(initialBankTransactions);
        toast({
            title: "Extracto Cargado",
            description: "Se han cargado las transacciones bancarias para conciliar.",
        });
    };

    const handleReconcile = () => {
        const selectedBankTxs = bankTransactions.filter(tx => selectedBank.includes(tx.id));
        const selectedSystemTxs = systemTransactions.filter(tx => selectedSystem.includes(tx.id));

        const totalBankDebit = selectedBankTxs.reduce((sum, tx) => sum + tx.debit, 0);
        const totalBankCredit = selectedBankTxs.reduce((sum, tx) => sum + tx.credit, 0);
        const totalSystemDebit = selectedSystemTxs.reduce((sum, tx) => sum + tx.debit, 0);
        const totalSystemCredit = selectedSystemTxs.reduce((sum, tx) => sum + tx.credit, 0);
        
        const netBank = totalBankCredit - totalBankDebit;
        const netSystem = totalSystemCredit - totalSystemDebit;


        if (netBank.toFixed(2) === netSystem.toFixed(2)) {
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
                description: `Los montos netos no coinciden. Banco: ${netBank.toLocaleString('es-CL', {style: 'currency', currency: 'CLP'})}, Sistema: ${netSystem.toLocaleString('es-CL', {style: 'currency', currency: 'CLP'})}`,
            });
        }
    };
    
    const summary = useMemo(() => {
        const reconciled = systemTransactions.filter(tx => tx.isReconciled);
        const unreconciled = systemTransactions.filter(tx => !tx.isReconciled);

        const reconciledAmount = reconciled.reduce((sum, tx) => sum + (tx.credit - tx.debit), 0);
        const unreconciledAmount = unreconciled.reduce((sum, tx) => sum + (tx.credit - tx.debit), 0);

        return {
            reconciledCount: reconciled.length,
            reconciledAmount: reconciledAmount,
            unreconciledCount: unreconciled.length,
            unreconciledAmount: unreconciledAmount,
        };
    }, [systemTransactions]);
    
    const formatCurrency = (value: number) => {
        return value === 0 ? '-' : value.toLocaleString('es-CL', {style: 'currency', currency: 'CLP'});
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end gap-4">
                 <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="bank-statement">Extracto Bancario (.csv, .xlsx)</Label>
                    <Input id="bank-statement" type="file" />
                </div>
                <Button onClick={handleLoadStatement}><Upload className="mr-2 h-4 w-4" /> Cargar (Simulación)</Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Movimientos Bancarios</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-96 overflow-y-auto border rounded-md">
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
                                    <TableRow key={tx.id}>
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
                                            <p className="text-xs text-muted-foreground">{tx.date}</p>
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
                         </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Movimientos del Sistema (Pendientes)</CardTitle>
                    </CardHeader>
                     <CardContent>
                         <div className="h-96 overflow-y-auto border rounded-md">
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
                                     {systemTransactions.filter(tx => !tx.isReconciled).map(tx => (
                                        <TableRow key={tx.id}>
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
                                                <p className="text-xs text-muted-foreground">{tx.date} / {tx.chargeAccount}</p>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(tx.debit)}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(tx.credit)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle>Resumen de Conciliación</CardTitle>
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
                    <CardTitle>Historial de Conciliaciones</CardTitle>
                    <CardDescription>
                        Movimientos del sistema que ya han sido conciliados.
                    </CardDescription>
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
                                {systemTransactions.filter(tx => tx.isReconciled).map(tx => (
                                    <TableRow key={tx.id} className="bg-green-50/50">
                                        <TableCell>{tx.date}</TableCell>
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
                                {systemTransactions.filter(tx => tx.isReconciled).length === 0 && (
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
