'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Contact, ShieldCheck, ShoppingBag, Trash2, Users } from 'lucide-react';
import AppLayout from '@/components/layout/app-layout';
import Link from 'next/link';

const adminSections = [
    { href: '/admin/companies', title: 'Empresas', description: 'Gestiona las empresas del grupo.', icon: Building2 },
    { href: '/admin/profiles', title: 'Perfiles', description: 'Define roles y permisos de usuario.', icon: ShieldCheck },
    { href: '/admin/users', title: 'Usuarios', description: 'Administra los accesos de los usuarios.', icon: Users },
    { href: '/admin/suppliers', title: 'Proveedores', description: 'Mantén un registro de tus proveedores.', icon: ShoppingBag },
    { href: '/admin/customers', title: 'Clientes', description: 'Administra la cartera de clientes.', icon: Contact },
    { href: '/admin/waste-types', title: 'Tipos de Merma', description: 'Configura las causas de merma.', icon: Trash2 },
]

export default function AdminPage() {
    return (
        <AppLayout pageTitle="Administración">
             <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Panel de Administración</CardTitle>
                        <CardDescription className="font-body">
                            Selecciona un módulo para empezar a gestionar la configuración del sistema.
                        </CardDescription>
                    </CardHeader>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {adminSections.map((section) => (
                        <Link href={section.href} key={section.href} className="block hover:no-underline">
                            <Card className="hover:border-primary hover:shadow-lg transition-all h-full">
                                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                                    <div className="p-3 bg-primary/10 rounded-full">
                                        <section.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="font-headline text-xl">{section.title}</CardTitle>
                                        <CardDescription className="font-body">{section.description}</CardDescription>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
