
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, ArrowLeft, Download, Trash2, Upload } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

type QualityDocument = {
  id: string;
  name: string;
  category: 'Manual' | 'Procedimiento' | 'Instructivo' | 'Formato';
  version: string;
  uploadDate: string;
};

const initialDocuments: QualityDocument[] = [
    { id: 'DOC-001', name: 'Manual de Buenas Prácticas de Manufactura (BPM)', category: 'Manual', version: '2.1', uploadDate: '2023-01-15' },
    { id: 'DOC-002', name: 'Procedimiento de Limpieza y Sanitización de Equipos', category: 'Procedimiento', version: '1.5', uploadDate: '2023-02-20' },
    { id: 'DOC-003', name: 'Instructivo de Control de Temperaturas en Hornos', category: 'Instructivo', version: '1.0', uploadDate: '2023-03-10' },
    { id: 'DOC-004', name: 'Formato de Registro de Control de PCC2 (Horneo)', category: 'Formato', version: '1.2', uploadDate: '2023-04-01' },
];

export default function DocumentationPage() {
    const [documents, setDocuments] = useState<QualityDocument[]>(initialDocuments);
    const { toast } = useToast();

    const handleUpload = () => {
        toast({
            title: "Función no implementada",
            description: "La carga de archivos se habilitará en una futura actualización.",
        });
    }

    return (
        <AppLayout pageTitle="Documentación de Calidad">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Gestión de Documentos de Calidad</CardTitle>
                            <CardDescription>
                                Repositorio central de manuales, procedimientos y formatos del sistema de gestión de calidad.
                            </CardDescription>
                        </div>
                         <div className="flex items-center gap-2">
                            <Button asChild variant="outline">
                                <Link href="/quality">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-4 mb-6 pb-4 border-b">
                        <div className="flex-1 space-y-2">
                            <label htmlFor="file-upload" className="text-sm font-medium">Cargar Nuevo Documento</label>
                            <Input id="file-upload" type="file" />
                        </div>
                        <Button onClick={handleUpload}>
                            <Upload className="mr-2 h-4 w-4" />
                            Subir Archivo
                        </Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre del Documento</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Versión</TableHead>
                                <TableHead>Fecha de Carga</TableHead>
                                <TableHead><span className="sr-only">Acciones</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents.map(doc => (
                                <TableRow key={doc.id}>
                                    <TableCell className="font-medium">{doc.name}</TableCell>
                                    <TableCell>{doc.category}</TableCell>
                                    <TableCell>{doc.version}</TableCell>
                                    <TableCell>{new Date(doc.uploadDate).toLocaleDateString('es-CL')}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" className="mr-2">
                                            <Download className="mr-2 h-4 w-4" />
                                            Descargar
                                        </Button>
                                         <Button variant="ghost" size="icon">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
