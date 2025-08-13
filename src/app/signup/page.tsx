import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/logo';

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="mx-auto max-w-sm w-full shadow-2xl">
        <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
                 <Logo className="w-32" />
            </div>
          <CardTitle className="text-2xl font-headline">Crear una Cuenta</CardTitle>
          <CardDescription className="font-body">Ingresa tu información para crear una cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-name" className="font-body">Nombre Completo</Label>
              <Input id="full-name" placeholder="Juan Pérez" required className="font-body"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-body">Correo Electrónico</Label>
              <Input id="email" type="email" placeholder="m@ejemplo.com" required className="font-body"/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="password" className="font-body">Contraseña</Label>
              <Input id="password" type="password" required  className="font-body"/>
            </div>
            <Link href="/dashboard" className="w-full">
                <Button type="submit" className="w-full font-body">
                    Crear Cuenta
                </Button>
            </Link>
          </div>
          <div className="mt-4 text-center text-sm font-body">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/" className="underline">
              Iniciar Sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
