/**
 * @fileOverview Schemas for the HR document generation flow.
 */

import {z} from 'genkit';

export const GenerateHrDocumentInputSchema = z.object({
  employeeName: z.string().describe('Nombre completo del empleado.'),
  employeeRut: z.string().describe('RUT del empleado.'),
  employeePosition: z.string().describe('Cargo del empleado.'),
  employeeStartDate: z.string().describe('Fecha de ingreso del empleado (YYYY-MM-DD).'),
  employeeSalary: z.number().describe('Sueldo bruto del empleado en CLP.'),
  employeeContractType: z.string().describe('Tipo de contrato del empleado.'),
  documentType: z.enum(['Contrato de Trabajo', 'Certificado de Antigüedad']).describe('El tipo de documento a generar.'),
});
export type GenerateHrDocumentInput = z.infer<typeof GenerateHrDocumentInputSchema>;

export const GenerateHrDocumentOutputSchema = z.object({
  documentContent: z.string().describe('El contenido completo del documento generado en formato de texto plano.'),
});
export type GenerateHrDocumentOutput = z.infer<typeof GenerateHrDocumentOutputSchema>;
