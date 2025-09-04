
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import BankAccountForm from '@/components/bank-account-form';

export type BankAccount = {
    id: string;
    banco: string;
    numeroCuenta: string;
    tipoCuenta: 'Corriente' | 'Vista' | 'Ahorro';
    moneda: 'CLP' | 'USD';
};

export const initialBankAccounts: BankAccount[] = [
    { id: '1', banco: 'BCI', numeroCuenta: '***45678', tipoCuenta: 'Corriente', moneda: 'CLP'},
    { id: '2', banco: 'BancoEstado', numeroCuenta: '***54321', tipoCuenta: 'Corriente', moneda: 'CLP'},
    { id: '3', banco: 'Santander', numeroCuenta: '***55666', tipoCuenta: 'Corriente', moneda: 'CLP'},
];

export default function BankAccountsPage() {
    const [accounts, setAccounts] = useState<BankAccount[]>(initialBankAccounts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<BankAccount | undefined>(undefined);
    const { toast } = useToast();

    const handleOpenModal = (account?: BankAccount) => {
        setSelectedAccount(account);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedAccount(undefined);
        setIsModalOpen(false);
    };

    const handleSubmit = (data: Omit<BankAccount, 'id'>) => {
        if (selectedAccount) {
            // Editing
            const updatedAccount = { ...selectedAccount, ...data };
            setAccounts(accounts.map(acc => acc.id === selectedAccount.id ? updatedAccount : acc));
            toast({ title: 'Cuenta Actualizada', description: `Se guardaron los cambios para la cuenta en ${data.banco}.` });
        } else {
            // Creating
            const newAccount = { ...data, id: (accounts.length + 1).toString() };
            setAccounts([...accounts, newAccount]);
            toast({ title: 'Cuenta Creada', description: `Se ha añadido la nueva cuenta de ${data.banco}.` });
        }
        handleCloseModal();
    };

    const handleDelete = (accountId: string) => {
        const accountToDelete = accounts.find(acc => acc.id === accountId);
        setAccounts(accounts.filter(acc => acc.id !== accountId));
        toast({ title: 'Cuenta Eliminada', variant: 'destructive', description: `La cuenta de ${accountToDelete?.banco} ha sido eliminada.` });
    };

    return (
        <AppLayout pageTitle="Mantenedor de Cuentas Bancarias">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Gestión de Cuentas Bancarias</CardTitle>
                            <CardDescription className="font-body">
                                Administra las cuentas bancarias de la empresa para su uso en tesorería.
                            </CardDescription>
                        </div>
                        <Button onClick={() => handleOpenModal()}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Añadir Cuenta
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Banco</TableHead>
                                <TableHead>Número de Cuenta</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Moneda</TableHead>
                                <TableHead><span className="sr-only">Acciones</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accounts.map((account) => (
                                <TableRow key={account.id}>
                                    <TableCell className="font-medium">{account.banco}</TableCell>
                                    <TableCell>{account.numeroCuenta}</TableCell>
                                    <TableCell>{account.tipoCuenta}</TableCell>
                                    <TableCell>{account.moneda}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleOpenModal(account)}>
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(account.id)}>
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-headline">{selectedAccount ? 'Editar Cuenta Bancaria' : 'Añadir Nueva Cuenta Bancaria'}</DialogTitle>
                    </DialogHeader>
                    <BankAccountForm
                        account={selectedAccount}
                        onSubmit={handleSubmit}
                        onCancel={handleCloseModal}
                    />
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
