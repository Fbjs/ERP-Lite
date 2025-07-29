"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Upload, Paperclip, Trash2, Loader2, Wand2, Clipboard } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';
import EmployeeForm from '@/components/employee-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateHrDocument, GenerateHrDocumentOutput } from '@/ai/flows/generate-hr-document';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type Document = {
    name: string;
    url: string;
};

type Employee = {
    id: string;
    name: string;
    rut: string;
    position: string;
    contractType: string;
    startDate: string;
    salary: number;
    status: string;
    phone: string;
    address: string;
    healthInsurance: string;
    pensionFund: string;
    documents: Document[];
};

const initialEmployees: Employee[] = [
  { id: 'EMP001', name: 'Juan Pérez', rut: '12.345.678-9', position: 'Panadero Jefe', contractType: 'Indefinido', startDate: '2022-01-15', salary: 850000, status: 'Activo', phone: '+56987654321', address: 'Av. Siempre Viva 742', healthInsurance: 'Fonasa', pensionFund: 'Modelo', documents: [{name: 'Contrato.pdf', url: '#'}] },
  { id: 'EMP002', name: 'Ana Gómez', rut: '23.456.789-0', position: 'Auxiliar de Pastelería', contractType: 'Plazo Fijo', startDate: '2023-03-01', salary: 600000, status: 'Activo', phone: '+56912345678', address: 'Calle Falsa 123', healthInsurance: 'Consalud', pensionFund: 'Habitat', documents: [] },
  { id: 'EMP003', name: 'Luis Martínez', rut: '11.222.333-4', position: 'Conductor Despacho', contractType: 'Indefinido', startDate: '2021-08-20', salary: 750000, status: 'Vacaciones', phone: '+56955554444', address: 'Pasaje Corto 45', healthInsurance: 'Cruz Blanca', pensionFund: 'Capital', documents: [] },
  { id: 'EMP004', name: 'María Rodríguez', rut: '15.678.901-2', position: 'Administrativa', contractType: 'Indefinido', startDate: '2020-05-10', salary: 950000, status: 'Activo', phone: '+56999998888', address: 'El Roble 1010', healthInsurance: 'Fonasa', pensionFund: 'PlanVital', documents: [] },
];

export default function HRPage() {
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [isNewEmployeeModalOpen, setNewEmployeeModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isGenerateDocModalOpen, setGenerateDocModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    
    const [docType, setDocType] = useState('');
    const [generatedDoc, setGeneratedDoc] = useState<GenerateHrDocumentOutput | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const handleCreateEmployee = (newEmployeeData: Omit<Employee, 'id' | 'status' | 'documents'>) => {
        const newEmployee: Employee = {
            ...newEmployeeData,
            id: `EMP${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
            status: 'Activo',
            documents: [],
        };
        setEmployees(prev => [newEmployee, ...prev]);
        setNewEmployeeModalOpen(false);
    };

    const handleOpenDetails = (employee: Employee) => {
        setSelectedEmployee(employee);
        setDetailsModalOpen(true);
    }
    
    const handleOpenGenerateDoc = (employee: Employee) => {
        setSelectedEmployee(employee);
        setDocType('');
        setGeneratedDoc(null);
        setGenerateDocModalOpen(true);
    };

    const handleGenerateDocument = async () => {
        if (!selectedEmployee || !docType) return;
        setIsGenerating(true);
        setGeneratedDoc(null);
        try {
            const result = await generateHrDocument({
                employeeName: selectedEmployee.name,
                employeeRut: selectedEmployee.rut,
                employeePosition: selectedEmployee.position,
                employeeStartDate: selectedEmployee.startDate,
                employeeSalary: selectedEmployee.salary,
                employeeContractType: selectedEmployee.contractType,
                documentType: docType as any,
            });
            setGeneratedDoc(result);
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Ocurrió un error al generar el documento.',
            });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleCopyToClipboard = () => {
        if (!generatedDoc?.documentContent) return;
        navigator.clipboard.writeText(generatedDoc.documentContent);
        toast({
            title: "Copiado",
            description: "El contenido del documento se ha copiado al portapapeles.",
        });
    };

  return (
    <AppLayout pageTitle="Recursos Humanos">
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline">Gestión de Personal</CardTitle>
                    <CardDescription className="font-body">Administra la información y documentos de los trabajadores.</CardDescription>
                </div>
                <Button onClick={() => setNewEmployeeModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuevo Trabajador
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>RUT</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.rut}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.phone}</TableCell>
                  <TableCell>{employee.address}</TableCell>
                  <TableCell>{employee.status}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenDetails(employee)}>Ver Ficha</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenGenerateDoc(employee)}>Generar Documento</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Modal Nuevo Trabajador */}
      <Dialog open={isNewEmployeeModalOpen} onOpenChange={setNewEmployeeModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">Añadir Nuevo Trabajador</DialogTitle>
            <DialogDescription className="font-body">
              Completa los detalles para registrar a un nuevo trabajador.
            </DialogDescription>
          </DialogHeader>
          <EmployeeForm
            onSubmit={handleCreateEmployee}
            onCancel={() => setNewEmployeeModalOpen(false)}
            />
        </DialogContent>
      </Dialog>

      {/* Modal Ver Ficha */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Ficha del Trabajador</DialogTitle>
             <DialogDescription className="font-body">
              Información completa de {selectedEmployee?.name}.
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="max-h-[75vh] overflow-y-auto p-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-body mb-6">
                    <div className="space-y-1">
                        <p className="font-semibold text-muted-foreground text-sm">Nombre Completo</p>
                        <p>{selectedEmployee.name}</p>
                    </div>
                     <div className="space-y-1">
                        <p className="font-semibold text-muted-foreground text-sm">RUT</p>
                        <p>{selectedEmployee.rut}</p>
                    </div>
                     <div className="space-y-1">
                        <p className="font-semibold text-muted-foreground text-sm">Teléfono</p>
                        <p>{selectedEmployee.phone}</p>
                    </div>
                     <div className="space-y-1 col-span-1 md:col-span-2">
                        <p className="font-semibold text-muted-foreground text-sm">Dirección</p>
                        <p>{selectedEmployee.address}</p>
                    </div>
                     <div className="space-y-1">
                        <p className="font-semibold text-muted-foreground text-sm">Cargo</p>
                        <p>{selectedEmployee.position}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-muted-foreground text-sm">Tipo Contrato</p>
                        <p>{selectedEmployee.contractType}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-muted-foreground text-sm">Fecha Ingreso</p>
                        <p>{new Date(selectedEmployee.startDate).toLocaleDateString('es-ES')}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-muted-foreground text-sm">Sueldo Bruto</p>
                        <p>${selectedEmployee.salary.toLocaleString('es-CL')}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-muted-foreground text-sm">Previsión Salud</p>
                        <p>{selectedEmployee.healthInsurance}</p>
                    </div>
                     <div className="space-y-1">
                        <p className="font-semibold text-muted-foreground text-sm">AFP</p>
                        <p>{selectedEmployee.pensionFund}</p>
                    </div>
                     <div className="space-y-1">
                        <p className="font-semibold text-muted-foreground text-sm">Estado</p>
                        <Badge variant={selectedEmployee.status === 'Activo' ? 'default' : 'secondary'}>{selectedEmployee.status}</Badge>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">Documentación</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 items-end gap-4">
                                <div>
                                    <Label htmlFor="document-upload" className="font-body">Cargar nuevo documento</Label>
                                    <Input id="document-upload" type="file" />
                                </div>
                                <Button variant="outline">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Cargar
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-body">Documentos existentes</Label>
                                {selectedEmployee.documents.length > 0 ? (
                                    <ul className="divide-y rounded-md border">
                                        {selectedEmployee.documents.map((doc, index) => (
                                            <li key={index} className="flex items-center justify-between p-3">
                                                <div className="flex items-center gap-2">
                                                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="font-body text-primary hover:underline">
                                                        {doc.name}
                                                    </a>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground font-body text-center py-4">No hay documentos cargados.</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
          )}
           <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>Cerrar</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal Generar Documento */}
      <Dialog open={isGenerateDocModalOpen} onOpenChange={setGenerateDocModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Generar Documento Laboral</DialogTitle>
             <DialogDescription className="font-body">
              Genera documentos para {selectedEmployee?.name} usando IA.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="doc-type" className="font-body">Tipo de Documento</Label>
                <Select value={docType} onValueChange={setDocType}>
                    <SelectTrigger className="col-span-2">
                        <SelectValue placeholder="Selecciona un documento" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Contrato de Trabajo">Contrato de Trabajo</SelectItem>
                        <SelectItem value="Certificado de Antigüedad">Certificado de Antigüedad</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button onClick={handleGenerateDocument} disabled={isGenerating || !docType} className="w-full">
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generar Documento
            </Button>
          </div>

        {isGenerating ? (
            <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : generatedDoc && (
             <div className="space-y-4">
                <Label htmlFor="generated-content" className="font-body">Contenido Generado</Label>
                <Textarea
                    id="generated-content"
                    readOnly
                    value={generatedDoc.documentContent}
                    className="min-h-[300px] font-mono text-sm bg-secondary"
                />
                 <Button variant="outline" onClick={handleCopyToClipboard}>
                    <Clipboard className="mr-2 h-4 w-4" />
                    Copiar al Portapapeles
                </Button>
            </div>
        )}

        <DialogFooter className="mt-4">
             <Button variant="outline" onClick={() => setGenerateDocModalOpen(false)}>Cerrar</Button>
        </DialogFooter>

        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
