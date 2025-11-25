
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase'; // Renamed to avoid conflict
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Icons } from '@/components/icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { upsertUser } from '../settings/users/actions';
import { UserRole } from '@prisma/client';


const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});


type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function LoginPageClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterFormValues>({
      resolver: zodResolver(registerSchema),
      defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });


  const onLoginSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(firebaseAuth, data.email, data.password);
      router.push('/pos');
    } catch (error: any) {
        console.log(error)
      toast({
        variant: "destructive",
        title: t('login.failedTitle'),
        description: t('login.failedDescription'),
      });
    } finally {
      setLoading(false);
    }
  };
  
  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
        // Create user in Firebase Auth first
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, data.email, data.password);
        const firebaseUser = userCredential.user;

        // Then, create the user record in our own database via server action
        const formData = new FormData();
        formData.append('id', firebaseUser.uid);
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('role', UserRole.ADMIN); // First user is an admin
        // No password needed here as it's handled by Firebase Auth
        
        const result = await upsertUser(formData);

        if (!result.success) {
            // This would happen if our DB call fails. We should probably delete the firebase user
            // but for now, we'll just show an error.
            throw new Error(result.error || "Failed to create user record in database.");
        }

        toast({
            title: t('register.successTitle'),
            description: t('register.successDescription'),
        });
        router.push('/pos');
    } catch (error: any) {
        console.log(error)
        toast({
            variant: "destructive",
            title: t('register.failedTitle'),
            description: error.code === 'auth/email-already-in-use' ? 'This email is already registered.' : error.message,
        });
    } finally {
        setLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md">
            <div className="flex justify-center mb-6">
                <Icons.logo className="h-12 w-12 text-primary"/>
            </div>
            <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">{t('login.tab')}</TabsTrigger>
                    <TabsTrigger value="register">{t('register.tab')}</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">{t('login.title')}</CardTitle>
                            <CardDescription>
                                {t('login.description')}
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">{t('login.emailLabel')}</Label>
                                    <Input id="email" type="email" placeholder="m@example.com" {...loginForm.register("email")} />
                                    {loginForm.formState.errors.email && <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">{t('login.passwordLabel')}</Label>
                                    <Input id="password" type="password" {...loginForm.register("password")} />
                                    {loginForm.formState.errors.password && <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t('login.signInButton')}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
                <TabsContent value="register">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">{t('register.title')}</CardTitle>
                            <CardDescription>
                                {t('register.description')}
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="register-name">{t('users.name')}</Label>
                                    <Input id="register-name" type="text" placeholder="John Doe" {...registerForm.register("name")} />
                                    {registerForm.formState.errors.name && <p className="text-sm text-destructive">{registerForm.formState.errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="register-email">{t('login.emailLabel')}</Label>
                                    <Input id="register-email" type="email" placeholder="m@example.com" {...registerForm.register("email")} />
                                    {registerForm.formState.errors.email && <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="register-password">{t('login.passwordLabel')}</Label>
                                    <Input id="register-password" type="password" {...registerForm.register("password")} />
                                    {registerForm.formState.errors.password && <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">{t('register.confirmPasswordLabel')}</Label>
                                    <Input id="confirm-password" type="password" {...registerForm.register("confirmPassword")} />
                                    {registerForm.formState.errors.confirmPassword && <p className="text-sm text-destructive">{registerForm.formState.errors.confirmPassword.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t('register.createAccountButton')}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    </div>
  );
}
