import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/logo';

export default function LoginPage() {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/fondo_volkorn.png')" }}>
      <div className="absolute inset-0" />
      <Card className="relative z-10 mx-auto max-w-sm w-full shadow-2xl bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
                <Logo className="w-32" />
            </div>
          <CardTitle className="text-2xl font-headline">Bienvenido de Vuelta</CardTitle>
          <CardDescription className="font-body">Ingresa tus credenciales para acceder a tu ERP</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-body">Correo Electrónico</Label>
              <Input id="email" type="email" placeholder="m@ejemplo.com" required className="font-body"/>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="font-body">Contraseña</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline font-body">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input id="password" type="password" required  className="font-body"/>
            </div>
            <Button asChild type="submit" className="w-full font-body">
              <Link href="/dashboard">Iniciar Sesión</Link>
            </Button>
          </div>
          <div className="mt-4 text-center text-sm font-body">
            ¿No tienes una cuenta?{' '}
            <Link href="/signup" className="underline">
              Regístrate
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
