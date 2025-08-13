
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
import { Badge } from '@/components/ui/badge';
import UserForm from '@/components/user-form';

export type User = {
    id: string;
    name: string;
    email: string;
    profile: string;
    status: 'Activo' | 'Inactivo';
};

const initialUsers: User[] = [
    { id: '1', name: 'Administrador del Sistema', email: 'admin@vollkorn.cl', profile: 'Admin', status: 'Activo' },
    { id: '2', name: 'Juan Pérez (Producción)', email: 'juan.perez@vollkorn.cl', profile: 'Producción', status: 'Activo' },
    { id: '3', name: 'Ana Gómez (Ventas)', email: 'ana.gomez@vollkorn.cl', profile: 'Ventas', status: 'Activo' },
    { id: '4', name: 'Luis Martínez (Logística)', email: 'luis.martinez@vollkorn.cl', profile: 'Logística', status: 'Inactivo' },
];

// Re-using profile names for the form dropdown
const profileNames = ['Admin', 'Producción', 'Ventas', 'Logística', 'Contabilidad'];


export default function UsersPage() {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
    const { toast } = useToast();

    const handleOpenModal = (user?: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedUser(undefined);
        setIsModalOpen(false);
    };

    const handleSubmit = (data: Omit<User, 'id'>) => {
        if (selectedUser) {
            // Editing
            const updatedUser = { ...data, id: selectedUser.id };
            setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
            toast({ title: 'Usuario Actualizado', description: `Los datos de ${data.name} han sido guardados.` });
        } else {
            // Creating
            const newUser = { ...data, id: (users.length + 1).toString() };
            setUsers([...users, newUser]);
            toast({ title: 'Usuario Creado', description: `Se ha añadido a ${data.name} al sistema.` });
        }
        handleCloseModal();
    };

    const handleDelete = (userId: string) => {
        const userToDelete = users.find(u => u.id === userId);
        setUsers(users.filter(u => u.id !== userId));
        toast({ title: 'Usuario Eliminado', variant: 'destructive', description: `El usuario ${userToDelete?.name} ha sido eliminado.` });
    };


    return (
        <AppLayout pageTitle="Mantenedor de Usuarios">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Gestión de Usuarios</CardTitle>
                            <CardDescription className="font-body">
                                Crea, edita y gestiona los usuarios que tienen acceso al sistema, y asigna sus perfiles.
                            </CardDescription>
                        </div>
                        <Button onClick={() => handleOpenModal()}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Añadir Usuario
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Correo Electrónico</TableHead>
                                <TableHead>Perfil</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead><span className="sr-only">Acciones</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell><Badge variant="secondary">{user.profile}</Badge></TableCell>
                                    <TableCell>
                                        <Badge variant={user.status === 'Activo' ? 'default' : 'destructive'}>
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleOpenModal(user)}>
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(user.id)}>
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
                        <DialogTitle className="font-headline">{selectedUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
                        <DialogDescription className="font-body">
                            {selectedUser ? 'Modifica los datos del usuario.' : 'Completa el formulario para registrar un nuevo usuario.'}
                        </DialogDescription>
                    </DialogHeader>
                    <UserForm 
                        user={selectedUser} 
                        profiles={profileNames} 
                        onSubmit={handleSubmit} 
                        onCancel={handleCloseModal} 
                    />
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
