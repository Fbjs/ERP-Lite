"use client";
import AppLayout from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, CalendarDays, Wallet, Clock, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';

const hrSections = [
    { href: '/hr/staff', title: 'Ficha de Personal', description: 'Gestiona la información y documentos de los trabajadores.', icon: Users },
    { href: '/hr/contracts', title: 'Gestión de Contratos', description: 'Administra plantillas y contratos laborales.', icon: FileText },
    { href: '/hr/payroll', title: 'Nómina y Liquidaciones', description: 'Procesa sueldos, bonos y descuentos.', icon: Wallet },
    { href: '/hr/leave', title: 'Vacaciones y Ausencias', description: 'Controla las solicitudes de vacaciones y permisos.', icon: CalendarDays },
    { href: '/hr/attendance', title: 'Control de Asistencia', description: 'Visualiza los registros de entrada y salida.', icon: Clock },
    { href: '/hr/reports', title: 'Indicadores y Reportes', description: 'Visualiza métricas y dashboards de RRHH.', icon: BarChart3 },
];

export default function HRPage() {
  return (
    <AppLayout pageTitle="Recursos Humanos">
       <div className="grid gap-6">
          <Card>
              <CardHeader>
                  <CardTitle className="font-headline">Panel de Recursos Humanos</CardTitle>
                  <CardDescription className="font-body">
                      Selecciona un módulo para gestionar el ciclo de vida de los empleados.
                  </CardDescription>
              </CardHeader>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hrSections.map((section) => (
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
