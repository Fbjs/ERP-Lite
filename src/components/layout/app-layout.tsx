
"use client";

import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, LayoutDashboard, NotebookText, Factory, ShoppingCart, Users, BookCopy, Truck, Warehouse, Settings, Building2, ShieldCheck, Contact, ShoppingBag, Trash2, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';


type UserRole = 'Admin' | 'Producción' | 'Ventas' | 'Logística' | 'Contabilidad';

const AppLayout = ({ children, pageTitle }: { children: React.ReactNode, pageTitle: string }) => {
    const pathname = usePathname();

    // --- Simulación de Usuario y Rol ---
    // Cambia el rol aquí para probar diferentes vistas:
    // 'Admin', 'Producción', 'Ventas', 'Logística', 'Contabilidad'
    const currentUserRole: UserRole = 'Admin'; 
    // ------------------------------------

    const allMenuItems = [
        { href: '/dashboard', label: 'Panel de Control', icon: LayoutDashboard, roles: ['Admin', 'Producción', 'Ventas', 'Logística', 'Contabilidad'] },
        { href: '/production', label: 'Producción', icon: Factory, roles: ['Admin', 'Producción'] },
        { href: '/recipes', label: 'Recetas', icon: NotebookText, roles: ['Admin', 'Producción'] },
        { href: '/sales', label: 'Ventas', icon: ShoppingCart, roles: ['Admin', 'Ventas', 'Contabilidad'] },
        { href: '/purchasing', label: 'Compras', icon: ClipboardList, roles: ['Admin', 'Logística', 'Contabilidad'] },
        { href: '/inventory', label: 'Inventario', icon: Warehouse, roles: ['Admin', 'Producción', 'Logística'] },
        { href: '/hr', label: 'Recursos Humanos', icon: Users, roles: ['Admin'] },
        { href: '/accounting', label: 'Contabilidad', icon: BookCopy, roles: ['Admin', 'Contabilidad'] },
        { 
            href: '/admin', 
            label: 'Administración', 
            icon: Settings, 
            roles: ['Admin'],
            subItems: [
                { href: '/admin/companies', label: 'Empresas', icon: Building2, roles: ['Admin'] },
                { href: '/admin/profiles', label: 'Perfiles', icon: ShieldCheck, roles: ['Admin'] },
                { href: '/admin/users', label: 'Usuarios', icon: Users, roles: ['Admin'] },
                { href: '/admin/suppliers', label: 'Proveedores', icon: ShoppingBag, roles: ['Admin'] },
                { href: '/admin/customers', label: 'Clientes', icon: Contact, roles: ['Admin'] },
                { href: '/admin/waste-types', label: 'Tipos de Merma', icon: Trash2, roles: ['Admin'] },
            ]
        },
    ];

    const menuItems = allMenuItems.filter(item => item.roles.includes(currentUserRole));


    return (
        <SidebarProvider>
            <Sidebar onMouseLeave={() => {}} onMouseEnter={() => {}}>
                <SidebarHeader className="p-4 border-b flex justify-center items-center group-data-[collapsible=icon]:p-0">
                    <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-14 group-data-[collapsible=icon]:p-2">
                        <Logo className="w-28 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-auto" />
                    </Link>
                </SidebarHeader>
                <SidebarContent className="p-2">
                    <SidebarMenu>
                        {menuItems.map((item) => (
                             <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton asChild isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))} tooltip={item.label}>
                                    <Link href={item.href}>
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-body">{item.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter className="p-4 border-t">
                    <div className="flex items-center gap-3">
                         <Avatar className="h-10 w-10">
                            <AvatarImage src="https://placehold.co/100x100.png" alt="Usuario Administrador" data-ai-hint="person portrait" />
                            <AvatarFallback>UA</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                            <span className="font-semibold font-body text-sm">Usuario Admin</span>
                            <span className="text-xs text-muted-foreground">admin@vollkorn.cl</span>
                        </div>
                        <SidebarMenuButton asChild className="ml-auto group-data-[collapsible=icon]:hidden">
                             <Link href="/">
                                <LogOut className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                            </Link>
                        </SidebarMenuButton>
                    </div>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="flex items-center justify-between p-4 border-b bg-card">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="md:hidden" />
                        <h2 className="text-2xl font-headline font-semibold">{pageTitle}</h2>
                    </div>
                    <ThemeToggle />
                </header>
                <main className="p-4 md:p-6 fade-in">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default AppLayout;
