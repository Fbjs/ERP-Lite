
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const financialIndicesData = [
  { month: 'ene-21', SOLVENCIA: 2.22, LIQUIDEZ: 1.17, ENDEUDAMIENTO: 0.82, TESORERIA: 2.39 },
  { month: 'feb-21', SOLVENCIA: 2.17, LIQUIDEZ: 1.12, ENDEUDAMIENTO: 0.86, TESORERIA: 2.10 },
  { month: 'mar-21', SOLVENCIA: 2.08, LIQUIDEZ: 1.08, ENDEUDAMIENTO: 0.93, TESORERIA: 1.90 },
  { month: 'abr-21', SOLVENCIA: 2.22, LIQUIDEZ: 1.19, ENDEUDAMIENTO: 1.19, TESORERIA: 2.40 },
  { month: 'may-21', SOLVENCIA: 1.85, LIQUIDEZ: 1.17, ENDEUDAMIENTO: 1.17, TESORERIA: 2.42 },
  { month: 'jun-21', SOLVENCIA: 1.89, LIQUIDEZ: 1.13, ENDEUDAMIENTO: 1.13, TESORERIA: 2.46 },
  { month: 'jul-21', SOLVENCIA: 1.91, LIQUIDEZ: 1.10, ENDEUDAMIENTO: 1.10, TESORERIA: 2.79 },
  { month: 'ago-21', SOLVENCIA: 1.96, LIQUIDEZ: 1.17, ENDEUDAMIENTO: 1.03, TESORERIA: 2.79 },
  { month: 'sep-21', SOLVENCIA: 2.05, LIQUIDEZ: 1.13, ENDEUDAMIENTO: 1.06, TESORERIA: 2.05 },
  { month: 'oct-21', SOLVENCIA: 2.13, LIQUIDEZ: 1.19, ENDEUDAMIENTO: 0.96, TESORERIA: 2.10 },
  { month: 'nov-21', SOLVENCIA: 2.00, LIQUIDEZ: 1.20, ENDEUDAMIENTO: 0.95, TESORERIA: 2.02 },
  { month: 'dic-21', SOLVENCIA: 1.81, LIQUIDEZ: 1.20, ENDEUDAMIENTO: 1.20, TESORERIA: 1.76 },
  { month: 'ene-22', SOLVENCIA: 1.83, LIQUIDEZ: 1.19, ENDEUDAMIENTO: 1.19, TESORERIA: 1.74 },
  { month: 'feb-22', SOLVENCIA: 1.81, LIQUIDEZ: 1.21, ENDEUDAMIENTO: 1.21, TESORERIA: 1.68 },
];

export default function FinancialIndicesChart() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={financialIndicesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 4]}/>
                <Tooltip
                    contentStyle={{
                        background: "hsl(var(--background))",
                        border: "hsl(var(--border))",
                        borderRadius: "var(--radius)"
                    }}
                />
                <Legend />
                <Line type="monotone" dataKey="SOLVENCIA" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="LIQUIDEZ" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ENDEUDAMIENTO" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="TESORERIA" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    );
}
