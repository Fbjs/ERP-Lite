
"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Upload, Paperclip, Trash2, Loader2, Wand2, Clipboard, Download, Camera, Building, UserCheck, Edit, ArrowLeft } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState, useRef, useEffect } from 'react';
import EmployeeForm from '@/components/employee-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateHrDocument } from '@/ai/flows/generate-hr-document';
import { GenerateHrDocumentOutput } from '@/ai/schemas/hr-document-schemas';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

type Document = {
    name: string;
    url: string;
};

type WorkHistoryEvent = {
    date: string;
    event: string;
    description: string;
};

type Employee = {
    id: string;
    name: string;
    rut: string;
    position: string;
    department: 'Producción' | 'Ventas' | 'Logística' | 'Administración' | 'Gerencia';
    contractType: string;
    startDate: string;
    salary: number;
    status: string;
    phone: string;
    address: string;
    healthInsurance: string;
    pensionFund: string;
    documents: Document[];
    photoUrl?: string;
    emergencyContact: {
        name: string;
        phone: string;
    };
    supervisor: string;
    workHistory: WorkHistoryEvent[];
};

const initialEmployees: Employee[] = [
  { id: 'EMP001', name: 'Juan Pérez', rut: '12.345.678-9', position: 'Panadero Jefe', department: 'Producción', contractType: 'Indefinido', startDate: '2022-01-15', salary: 850000, status: 'Activo', phone: '+56987654321', address: 'Av. Siempre Viva 742', healthInsurance: 'Fonasa', pensionFund: 'Modelo', documents: [{name: 'Contrato.pdf', url: '#'}], photoUrl: 'https://placehold.co/100x100/D2AD5B/131011/png?text=JP', emergencyContact: { name: 'Ana Pérez', phone: '+56911112222'}, supervisor: 'Carlos Araya', workHistory: [{date: '2023-01-15', event: 'Promoción', description: 'Promovido a Panadero Jefe.'}] },
  { id: 'EMP002', name: 'Ana Gómez', rut: '23.456.789-0', position: 'Auxiliar de Pastelería', department: 'Producción', contractType: 'Plazo Fijo', startDate: '2023-03-01', salary: 600000, status: 'Activo', phone: '+56912345678', address: 'Calle Falsa 123', healthInsurance: 'Consalud', pensionFund: 'Habitat', documents: [], photoUrl: 'https://placehold.co/100x100/D2AD5B/131011/png?text=AG', emergencyContact: { name: 'Luis Gómez', phone: '+56933334444'}, supervisor: 'Juan Pérez', workHistory: [] },
  { id: 'EMP003', name: 'Luis Martínez', rut: '11.222.333-4', position: 'Conductor Despacho', department: 'Logística', contractType: 'Indefinido', startDate: '2021-08-20', salary: 750000, status: 'Vacaciones', phone: '+56955554444', address: 'Pasaje Corto 45', healthInsurance: 'Cruz Blanca', pensionFund: 'Capital', documents: [], photoUrl: 'https://placehold.co/100x100/D2AD5B/131011/png?text=LM', emergencyContact: { name: 'Marta Soto', phone: '+56955556666'}, supervisor: 'Ricardo Soto', workHistory: [] },
  { id: 'EMP004', name: 'María Rodríguez', rut: '15.678.901-2', position: 'Administrativa', department: 'Administración', contractType: 'Indefinido', startDate: '2020-05-10', salary: 950000, status: 'Activo', phone: '+56999998888', address: 'El Roble 1010', healthInsurance: 'Fonasa', pensionFund: 'PlanVital', documents: [], photoUrl: 'https://placehold.co/100x100/D2AD5B/131011/png?text=MR', emergencyContact: { name: 'Jorge Rodríguez', phone: '+56977778888'}, supervisor: 'Carlos Araya', workHistory: [] },
];

export default function StaffPage() {
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isGenerateDocModalOpen, setGenerateDocModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
    
    const [docType, setDocType] = useState('');
    const [generatedDoc, setGeneratedDoc] = useState<GenerateHrDocumentOutput | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();
    const pdfContentRef = useRef<HTMLDivElement>(null);
    const [generationDate, setGenerationDate] = useState<Date | null>(null);

    useEffect(() => {
        setGenerationDate(new Date());
    }, []);

    const handleSaveEmployee = (employeeData: Omit<Employee, 'id' | 'status' | 'documents' | 'workHistory'>) => {
        const today = new Date().toISOString();

        if (editingEmployee) {
            // Editing existing employee
            let newHistory: WorkHistoryEvent[] = [...editingEmployee.workHistory];
            
            // Compare fields and add to history
            if(editingEmployee.position !== employeeData.position) {
                newHistory.push({ date: today, event: 'Cambio de Cargo', description: `De '${editingEmployee.position}' a '${employeeData.position}'.` });
            }
            if(editingEmployee.salary !== employeeData.salary) {
                newHistory.push({ date: today, event: 'Modificación Salarial', description: `De ${editingEmployee.salary.toLocaleString('es-CL')} a ${employeeData.salary.toLocaleString('es-CL')}.` });
            }
            if(editingEmployee.department !== employeeData.department) {
                newHistory.push({ date: today, event: 'Cambio de Área', description: `De '${editingEmployee.department}' a '${employeeData.department}'.` });
            }
             if(editingEmployee.supervisor !== employeeData.supervisor) {
                newHistory.push({ date: today, event: 'Cambio de Supervisor', description: `De '${editingEmployee.supervisor}' a '${employeeData.supervisor}'.` });
            }

            const updatedEmployee: Employee = {
                ...editingEmployee,
                ...employeeData,
                workHistory: newHistory,
            };
            setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? updatedEmployee : emp));
            setSelectedEmployee(updatedEmployee); // Also update the view in the details modal if open
            toast({ title: "Trabajador Actualizado", description: `Se han guardado los cambios para ${employeeData.name}.` });
        } else {
            // Creating new employee
            const newEmployee: Employee = {
                ...employeeData,
                id: `EMP${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
                status: 'Activo',
                documents: [],
                workHistory: [{ date: today, event: 'Contratación', description: `Ingreso a la empresa como ${employeeData.position}.`}],
                photoUrl: `https://placehold.co/100x100/D2AD5B/131011/png?text=${employeeData.name.split(' ').map(n => n[0]).join('')}`
            };
            setEmployees(prev => [newEmployee, ...prev]);
            toast({ title: "Trabajador Creado", description: `Se ha añadido a ${newEmployee.name} a la nómina.` });
        }

        setFormModalOpen(false);
        setEditingEmployee(null);
    };

    const handleOpenDetails = (employee: Employee) => {
        setSelectedEmployee(employee);
        setUploadedPhoto(null);
        setDetailsModalOpen(true);
    }
    
    const handleOpenEditModal = (employee: Employee) => {
        setEditingEmployee(employee);
        setDetailsModalOpen(false); // Close details modal if open
        setFormModalOpen(true);
    };
    
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
            toast({
                title: 'Documento Generado',
                description: `El ${docType} para ${selectedEmployee.name} ha sido generado con éxito.`,
            });
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

    const handleUpdatePhoto = () => {
        if (!uploadedPhoto || !selectedEmployee) return;

        const updatedPhotoUrl = URL.createObjectURL(uploadedPhoto);

        const updatedEmployees = employees.map(emp => 
            emp.id === selectedEmployee.id ? { ...emp, photoUrl: updatedPhotoUrl } : emp
        );
        setEmployees(updatedEmployees);
        setSelectedEmployee(prev => prev ? { ...prev, photoUrl: updatedPhotoUrl } : null);

        toast({
            title: 'Foto Actualizada',
            description: `Se ha actualizado la foto de ${selectedEmployee.name}.`
        });
        setUploadedPhoto(null);
    };

    const handleDownloadPdf = async () => {
        const input = pdfContentRef.current;
        if (input) {
            const { default: jsPDF } = await import('jspdf');
            const { default: html2canvas } = await import('html2canvas');
            
            input.style.position = 'fixed';
            input.style.left = '-9999px';
            input.style.top = '0';
            input.style.zIndex = '1000';
            input.style.display = 'block';

            const canvas = await html2canvas(input, { scale: 2, backgroundColor: null });
            
            input.style.position = '';
            input.style.left = '';
            input.style.top = '';
            input.style.zIndex = '';
            input.style.display = 'none';

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'px', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            let pdfImageWidth = pdfWidth - 20;
            let pdfImageHeight = pdfImageWidth / ratio;

            if (pdfImageHeight > pdfHeight - 20) {
              pdfImageHeight = pdfHeight - 20;
              pdfImageWidth = pdfImageHeight * ratio;
            }
            
            const xOffset = (pdfWidth - pdfImageWidth) / 2;

            pdf.addImage(imgData, 'PNG', xOffset, 10, pdfImageWidth, pdfImageHeight);
            pdf.save(`nomina_trabajadores_${new Date().toISOString().split('T')[0]}.pdf`);
            
            toast({
                title: "PDF Descargado",
                description: "La nómina de trabajadores ha sido descargada.",
            });
        }
    };


  return (
    <AppLayout pageTitle="Ficha de Personal">
    
      <div ref={pdfContentRef} style={{ display: 'none' }}>
        <div className="p-6 bg-white text-black" style={{ width: '8.5in', minHeight: '11in'}}>
            <div className="border-b-2 border-gray-200 pb-4 mb-4">
                <h2 className="text-2xl font-bold text-gray-800 font-headline">Nómina de Trabajadores</h2>
                {generationDate && <p className="text-sm text-gray-500 font-body">Vollkorn ERP - {format(generationDate, "P", { locale: es })}</p>}
            </div>
            <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50">
                    <tr>
                        <th className="p-2 font-semibold">Nombre</th>
                        <th className="p-2 font-semibold">RUT</th>
                        <th className="p-2 font-semibold">Cargo</th>
                        <th className="p-2 font-semibold">Sueldo Bruto</th>
                        <th className="p-2 font-semibold">Previsión</th>
                        <th className="p-2 font-semibold">AFP</th>
                        <th className="p-2 font-semibold">F. Ingreso</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map((employee) => (
                        <tr key={employee.id} className="border-b">
                            <td className="p-2">{employee.name}</td>
                            <td className="p-2">{employee.rut}</td>
                            <td className="p-2">{employee.position}</td>
                            <td className="p-2">${employee.salary.toLocaleString('es-CL')}</td>
                            <td className="p-2">{employee.healthInsurance}</td>
                            <td className="p-2">{employee.pensionFund}</td>
                            <td className="p-2">{new Date(employee.startDate).toLocaleDateString('es-CL')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
             <div className="border-t-2 border-gray-200 pt-4 mt-4 text-center text-xs text-gray-500">
                {generationDate && <p>Documento generado el {format(generationDate, "Pp", { locale: es })}</p>}
            </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <CardTitle className="font-headline">Gestión de Personal</CardTitle>
                    <CardDescription className="font-body">Administra la información y documentos de los trabajadores.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                     <Button asChild variant="outline">
                        <Link href="/hr">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                     <Button variant="outline" onClick={handleDownloadPdf}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar Nómina
                    </Button>
                    <Button onClick={() => { setEditingEmployee(null); setFormModalOpen(true); }}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nuevo Trabajador
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="p-0 md:p-4 bg-background">
              <Table className="responsive-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>RUT</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell data-label="Nombre" className="font-medium flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={employee.photoUrl} alt={employee.name} />
                            <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        {employee.name}
                      </TableCell>
                      <TableCell data-label="RUT">{employee.rut}</TableCell>
                      <TableCell data-label="Cargo">{employee.position}</TableCell>
                      <TableCell data-label="Área"><Badge variant="secondary">{employee.department}</Badge></TableCell>
                      <TableCell data-label="Estado">
                        <Badge variant={employee.status === 'Activo' ? 'default' : 'secondary'}>{employee.status}</Badge>
                      </TableCell>
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
                            <DropdownMenuItem onClick={() => handleOpenEditModal(employee)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenGenerateDoc(employee)}>Generar Documento con IA</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
        </CardContent>
      </Card>
      
      <Dialog open={isFormModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingEmployee ? 'Editar Trabajador' : 'Añadir Nuevo Trabajador'}</DialogTitle>
            <DialogDescription className="font-body">
              {editingEmployee ? `Editando los datos de ${editingEmployee.name}` : 'Completa los detalles para registrar a un nuevo trabajador.'}
            </DialogDescription>
          </DialogHeader>
          <EmployeeForm
            onSubmit={handleSaveEmployee}
            onCancel={() => setFormModalOpen(false)}
            initialData={editingEmployee}
            />
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
             <div className="flex justify-between items-center">
                 <div>
                    <DialogTitle className="font-headline">Ficha del Trabajador</DialogTitle>
                    <DialogDescription className="font-body">
                    Información completa de {selectedEmployee?.name}.
                    </DialogDescription>
                </div>
                <Button variant="outline" onClick={() => selectedEmployee && handleOpenEditModal(selectedEmployee)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                </Button>
            </div>
          </DialogHeader>
          {selectedEmployee && (
            <div className="max-h-[75vh] overflow-y-auto p-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 flex flex-col items-center gap-4 pt-4">
                        <Avatar className="h-32 w-32 border-4 border-primary">
                            <AvatarImage src={uploadedPhoto ? URL.createObjectURL(uploadedPhoto) : selectedEmployee.photoUrl} alt={selectedEmployee.name} />
                            <AvatarFallback className="text-4xl">{selectedEmployee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="photo-upload">Cambiar Fotografía</Label>
                            <div className="flex gap-2">
                                <Input id="photo-upload" type="file" accept="image/*" onChange={(e) => setUploadedPhoto(e.target.files ? e.target.files[0] : null)} />
                                <Button onClick={handleUpdatePhoto} size="icon" disabled={!uploadedPhoto}>
                                    <Camera className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                         <Card>
                            <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
                                <UserCheck className="w-6 h-6 text-primary"/>
                                <CardTitle className="font-headline text-lg">Datos Personales</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 font-body text-sm">
                                <div className="space-y-1"><p className="font-semibold text-muted-foreground text-xs">Nombre</p><p>{selectedEmployee.name}</p></div>
                                <div className="space-y-1"><p className="font-semibold text-muted-foreground text-xs">RUT</p><p>{selectedEmployee.rut}</p></div>
                                <div className="space-y-1"><p className="font-semibold text-muted-foreground text-xs">Teléfono</p><p>{selectedEmployee.phone}</p></div>
                                <div className="space-y-1"><p className="font-semibold text-muted-foreground text-xs">Dirección</p><p>{selectedEmployee.address}</p></div>
                                <div className="space-y-1"><p className="font-semibold text-muted-foreground text-xs">Contacto Emergencia</p><p>{selectedEmployee.emergencyContact.name}</p></div>
                                <div className="space-y-1"><p className="font-semibold text-muted-foreground text-xs">Tel. Emergencia</p><p>{selectedEmployee.emergencyContact.phone}</p></div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                 <Card>
                    <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
                        <Building className="w-6 h-6 text-primary"/>
                        <CardTitle className="font-headline text-lg">Datos Laborales</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-4 font-body text-sm pt-4">
                        <div className="space-y-1"><p className="font-semibold text-muted-foreground text-xs">Cargo</p><p>{selectedEmployee.position}</p></div>
                        <div className="space-y-1"><p className="font-semibold text-muted-foreground text-xs">Área</p><p>{selectedEmployee.department}</p></div>
                        <div className="space-y-1"><p className="font-semibold text-muted-foreground text-xs">Tipo Contrato</p><p>{selectedEmployee.contractType}</p></div>
                        <div className="space-y-1"><p className="font-semibold text-muted-foreground text-xs">Estado</p><Badge variant={selectedEmployee.status === 'Activo' ? 'default' : 'secondary'}>{selectedEmployee.status}</Badge></div>
                        <div className="space-y-1"><p className="font-semibold text-muted-foreground text-xs">Supervisor</p><p>{selectedEmployee.supervisor}</p></div>
                        <div className="space-y-1"><p className="font-semibold text-muted-foreground text-xs">Fecha Ingreso</p><p>{new Date(selectedEmployee.startDate).toLocaleDateString('es-ES')}</p></div>
                        <div className="space-y-1"><p className="font-semibold text-muted-foreground text-xs">Previsión Salud</p><p>{selectedEmployee.healthInsurance}</p></div>
                        <div className="space-y-1"><p className="font-semibold text-muted-foreground text-xs">AFP</p><p>{selectedEmployee.pensionFund}</p></div>
                         <div className="space-y-1 col-span-full"><p className="font-semibold text-muted-foreground text-xs">Sueldo Bruto</p><p className="text-lg font-bold">${selectedEmployee.salary.toLocaleString('es-CL')}</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="font-headline text-lg">Historial Laboral</CardTitle></CardHeader>
                    <CardContent>
                         {selectedEmployee.workHistory.length > 0 ? (
                            <ul className="space-y-3">
                                {selectedEmployee.workHistory.map((event, index) => (
                                    <li key={index} className="flex items-start gap-4">
                                        <div className="flex-shrink-0 mt-1"><Badge>{event.event}</Badge></div>
                                        <div>
                                            <p className="font-semibold">{format(new Date(event.date), "P", { locale: es })}</p>
                                            <p className="text-sm text-muted-foreground">{event.description}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground font-body text-center py-4">No hay eventos en el historial.</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="font-headline text-lg">Documentación</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 items-end gap-4">
                                <div><Label htmlFor="document-upload" className="font-body">Cargar nuevo documento</Label><Input id="document-upload" type="file" /></div>
                                <Button variant="outline"><Upload className="mr-2 h-4 w-4" />Cargar</Button>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-body">Documentos existentes (Contratos, Certificados, etc.)</Label>
                                {selectedEmployee.documents.length > 0 ? (
                                    <ul className="divide-y rounded-md border">
                                        {selectedEmployee.documents.map((doc, index) => (
                                            <li key={index} className="flex items-center justify-between p-3">
                                                <div className="flex items-center gap-2">
                                                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="font-body text-primary hover:underline">{doc.name}</a>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
      
      <Dialog open={isGenerateDocModalOpen} onOpenChange={setGenerateDocModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Generar Documento Laboral con IA</DialogTitle>
             <DialogDescription className="font-body">
              Genera documentos para {selectedEmployee?.name}. La IA usará los datos de su ficha.
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
                <Textarea id="generated-content" readOnly value={generatedDoc.documentContent} className="min-h-[300px] font-mono text-sm bg-secondary"/>
                 <Button variant="outline" onClick={handleCopyToClipboard}><Clipboard className="mr-2 h-4 w-4" />Copiar al Portapapeles</Button>
            </div>
        )}

        <DialogFooter className="mt-4"><Button variant="outline" onClick={() => setGenerateDocModalOpen(false)}>Cerrar</Button></DialogFooter>

        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
