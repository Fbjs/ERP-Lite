
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, ShieldCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

const allModules = [
    { id: 'dashboard', label: 'Panel de Control' },
    { id: 'production', label: 'Producción' },
    { id: 'recipes', label: 'Recetas' },
    { id: 'sales', label: 'Ventas' },
    { id: 'inventory', label: 'Inventario' },
    { id: 'logistics', label: 'Logística' },
    { id: 'hr', label: 'Recursos Humanos' },
    { id: 'accounting', label: 'Contabilidad' },
    { id: 'forecast', label: 'Pronóstico IA' },
    { id: 'admin', label: 'Administración' },
];

type Profile = {
    id: string;
    name: string;
    permissions: string[];
};

const initialProfiles: Profile[] = [
    { id: '1', name: 'Admin', permissions: allModules.map(m => m.id) },
    { id: '2', name: 'Producción', permissions: ['dashboard', 'production', 'recipes', 'inventory'] },
    { id: '3', name: 'Ventas', permissions: ['dashboard', 'sales', 'logistics', 'accounting'] },
    { id: '4', name: 'Logística', permissions: ['dashboard', 'inventory', 'logistics'] },
    { id: '5', name: 'Contabilidad', permissions: ['dashboard', 'sales', 'accounting'] },
];

const ProfileForm = ({ profile, onSubmit, onCancel }: { profile?: Profile, onSubmit: (data: Profile) => void, onCancel: () => void }) => {
    const [name, setName] = useState(profile?.name || '');
    const [permissions, setPermissions] = useState<string[]>(profile?.permissions || []);

    const handlePermissionChange = (moduleId: string, checked: boolean) => {
        setPermissions(prev => 
            checked ? [...prev, moduleId] : prev.filter(p => p !== moduleId)
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ id: profile?.id || '', name, permissions });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
            <div className="space-y-2">
                <Label htmlFor="name">Nombre del Perfil</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <Label>Permisos del Módulo</Label>
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-md">
                    {allModules.map(module => (
                        <div key={module.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`perm-${module.id}`}
                                checked={permissions.includes(module.id)}
                                onCheckedChange={(checked) => handlePermissionChange(module.id, !!checked)}
                            />
                            <label
                                htmlFor={`perm-${module.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {module.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
             <DialogFooter className="sticky bottom-0 bg-background py-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">{profile ? 'Guardar Cambios' : 'Crear Perfil'}</Button>
            </DialogFooter>
        </form>
    )
}

export default function ProfilesPage() {
    const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<Profile | undefined>(undefined);
    const { toast } = useToast();

    const handleOpenModal = (profile?: Profile) => {
        setSelectedProfile(profile);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedProfile(undefined);
        setIsModalOpen(false);
    };

    const handleSubmit = (data: Profile) => {
        if (selectedProfile) {
            // Editing
            setProfiles(profiles.map(p => p.id === data.id ? data : p));
             toast({ title: 'Perfil Actualizado', description: `Los permisos para ${data.name} han sido guardados.` });
        } else {
            // Creating
            const newProfile = { ...data, id: (profiles.length + 1).toString() };
            setProfiles([...profiles, newProfile]);
            toast({ title: 'Perfil Creado', description: `Se ha añadido el perfil ${data.name}.` });
        }
        handleCloseModal();
    };

    const handleDelete = (profileId: string) => {
        setProfiles(profiles.filter(p => p.id !== profileId));
        toast({ title: 'Perfil Eliminado', variant: 'destructive', description: 'El perfil ha sido eliminado del sistema.' });
    };

    return (
        <AppLayout pageTitle="Mantenedor de Perfiles">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Gestión de Perfiles y Roles</CardTitle>
                            <CardDescription className="font-body">
                                Define los roles de los usuarios y asigna permisos específicos para cada módulo del sistema.
                            </CardDescription>
                        </div>
                         <Button onClick={() => handleOpenModal()}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Añadir Perfil
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre del Perfil</TableHead>
                                <TableHead>Permisos</TableHead>
                                <TableHead><span className="sr-only">Acciones</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {profiles.map((profile) => (
                                <TableRow key={profile.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                        {profile.name}
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-muted-foreground">{profile.permissions.length} de {allModules.length} módulos</span>
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
                                                <DropdownMenuItem onClick={() => handleOpenModal(profile)}>
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(profile.id)}>
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
                        <DialogTitle className="font-headline">{selectedProfile ? 'Editar Perfil' : 'Crear Nuevo Perfil'}</DialogTitle>
                        <DialogDescription className="font-body">
                            {selectedProfile ? `Modifica los permisos para el perfil ${selectedProfile.name}.` : 'Define un nuevo rol y sus accesos en el sistema.'}
                        </DialogDescription>
                    </DialogHeader>
                    <ProfileForm profile={selectedProfile} onSubmit={handleSubmit} onCancel={handleCloseModal} />
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
