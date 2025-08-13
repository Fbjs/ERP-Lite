
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { User } from '@/app/admin/users/page';

type UserFormData = Omit<User, 'id'>;

type UserFormProps = {
  user?: User;
  profiles: string[];
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
};

export default function UserForm({ user, profiles, onSubmit, onCancel }: UserFormProps) {
    const [formData, setFormData] = useState<UserFormData>({
        name: '',
        email: '',
        profile: '',
        status: 'Activo',
    });
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                profile: user.profile,
                status: user.status,
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSelectChange = (name: keyof UserFormData, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you might want to handle the password logic, 
        // for now, it's not part of the User data model.
        onSubmit(formData);
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <div className="space-y-1">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input id="name" value={formData.name} onChange={handleChange} required />
            </div>
             <div className="space-y-1">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="space-y-1">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={user ? 'Dejar en blanco para no cambiar' : ''} required={!user} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <Label htmlFor="profile">Perfil</Label>
                    <Select value={formData.profile} onValueChange={(value) => handleSelectChange('profile', value)} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un perfil" />
                        </SelectTrigger>
                        <SelectContent>
                            {profiles.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="status">Estado</Label>
                    <Select value={formData.status} onValueChange={(value: User['status']) => handleSelectChange('status', value)} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Activo">Activo</SelectItem>
                            <SelectItem value="Inactivo">Inactivo</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <DialogFooter className="sticky bottom-0 bg-background py-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">{user ? 'Guardar Cambios' : 'Crear Usuario'}</Button>
            </DialogFooter>
        </form>
    );
};
