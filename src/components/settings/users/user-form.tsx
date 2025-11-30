
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, UserRole, SubscriptionStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { upsertUser } from "@/app/settings/users/actions";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "../ui/separator";
import { useAuth } from "@/context/auth-context";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";

const UserFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.nativeEnum(UserRole),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  subscriptionStatus: z.nativeEnum(SubscriptionStatus).optional(),
  trialEndsAt: z.date().optional().nullable(),
}).refine(data => {
    if (data.password || data.confirmPassword) {
        return data.password === data.confirmPassword;
    }
    return true;
}, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
}).refine(data => {
    if (!data.id && !data.password) {
        return false;
    }
    if (data.password && data.password.length > 0) {
        return data.password.length >= 6;
    }
    return true;
}, {
    message: "Password is required for new users and must be at least 6 characters.",
    path: ["password"],
});


type UserFormValues = z.infer<typeof UserFormSchema>;

export function UserForm({ user, onFinished }: { user: User | null, onFinished: () => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user: adminUser } = useAuth();
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      id: user?.id,
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || 'CASHIER',
      password: "",
      confirmPassword: "",
      subscriptionStatus: user?.subscriptionStatus || 'TRIAL',
      trialEndsAt: user?.trialEndsAt ? new Date(user.trialEndsAt) : null,
    },
  });

  const { formState, register, handleSubmit, setValue, watch } = form;

  const onSubmit = async (data: UserFormValues) => {
    if (!adminUser) return toast({ variant: 'destructive', title: 'Authentication error' });

    const formData = new FormData();
    
    formData.append('adminId', adminUser.id);
    if (data.id) formData.append('id', data.id);
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('role', data.role);
    if (data.password) formData.append('password', data.password);
    if (data.subscriptionStatus) formData.append('subscriptionStatus', data.subscriptionStatus);
    if (data.trialEndsAt) formData.append('trialEndsAt', data.trialEndsAt.toISOString());
    

    const result = await upsertUser(formData);

    if (result.success) {
      toast({ title: user ? t('users.updateSuccess') : t('users.createSuccess') });
      onFinished();
    } else if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
            if(messages){
                form.setError(field as keyof UserFormValues, { type: 'manual', message: messages[0] });
            }
        })
    } else {
      toast({
        variant: "destructive",
        title: t('users.saveFailed'),
        description: result.error || t('errors.unknown'),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {user && <input type="hidden" {...register("id")} />}
      
      <div className="space-y-2">
        <Label htmlFor="name">{t("users.name")}</Label>
        <Input id="name" {...register("name")} />
        {formState.errors.name && <p className="text-sm text-destructive">{formState.errors.name.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">{t("users.email")}</Label>
        <Input id="email" type="email" {...register("email")} />
        {formState.errors.email && <p className="text-sm text-destructive">{formState.errors.email.message}</p>}
      </div>

       <div className="space-y-2">
            <Label htmlFor="role">{t('users.role')}</Label>
            <Select value={watch('role')} onValueChange={(value: "ADMIN" | "CASHIER" | "PHONE_REPAIR") => setValue('role', value)}>
                <SelectTrigger id="role">
                    <SelectValue placeholder={t('users.selectRole')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                    <SelectItem value="CASHIER">CASHIER</SelectItem>
                    <SelectItem value="PHONE_REPAIR">PHONE_REPAIR</SelectItem>
                </SelectContent>
            </Select>
            {formState.errors.role && <p className="text-sm text-destructive">{formState.errors.role.message}</p>}
        </div>

        <Separator className="my-6"/>

        <p className="text-sm text-muted-foreground">{user ? t('users.passwordHelpUpdate') : t('users.passwordHelpCreate')}</p>
        
        <div className="space-y-2">
            <Label htmlFor="password">{t('users.password')}</Label>
            <Input id="password" type="password" {...register("password")} />
            {formState.errors.password && <p className="text-sm text-destructive">{formState.errors.password.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('users.confirmPassword')}</Label>
            <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
            {formState.errors.confirmPassword && <p className="text-sm text-destructive">{formState.errors.confirmPassword.message}</p>}
        </div>

        <Separator className="my-6"/>
         <p className="text-sm text-muted-foreground">Subscription Details</p>

        <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="subscriptionStatus">Subscription Status</Label>
                <Select value={watch('subscriptionStatus')} onValueChange={(value) => setValue('subscriptionStatus', value as SubscriptionStatus)}>
                    <SelectTrigger id="subscriptionStatus">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(SubscriptionStatus).map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
              <Label>Trial Ends At</Label>
              <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !watch('trialEndsAt') && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watch('trialEndsAt') ? format(watch('trialEndsAt')!, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={watch('trialEndsAt') || undefined}
                        onSelect={(date) => setValue('trialEndsAt', date)}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
          </div>
        </div>


      <Button type="submit" disabled={formState.isSubmitting} className="w-full !mt-8">
        {formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t("inventory.save")}
      </Button>
    </form>
  );
}
