"use client";

import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Wheat, LayoutDashboard, NotebookText, Factory, ShoppingCart, BrainCircuit, Users, BookCopy, Truck, Warehouse } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AppLayout = ({ children, pageTitle }: { children: React.ReactNode, pageTitle: string }) => {
    const pathname = usePathname();

    const menuItems = [
        { href: '/dashboard', label: 'Panel de Control', icon: LayoutDashboard },
        { href: '/production', label: 'Producción', icon: Factory },
        { href: '/recipes', label: 'Recetas', icon: NotebookText },
        { href: '/sales', label: 'Ventas', icon: ShoppingCart },
        { href: '/inventory', label: 'Inventario', icon: Warehouse },
        { href: '/logistics', label: 'Logística', icon: Truck },
        { href: '/hr', label: 'Recursos Humanos', icon: Users },
        { href: '/accounting', label: 'Contabilidad', icon: BookCopy },
        { href: '/forecast', label: 'Pronóstico IA', icon: BrainCircuit },
    ];

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader className="p-4 border-b">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <Wheat className="w-8 h-8 text-primary" />
                        <h1 className="text-2xl font-headline font-semibold text-foreground group-data-[collapsible=icon]:hidden">Vollkorn</h1>
                    </Link>
                </SidebarHeader>
                <SidebarContent className="p-2">
                    <SidebarMenu>
                        {menuItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.label}>
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
                </header>
                <div className="p-4 md:p-6">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default AppLayout;
