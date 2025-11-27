
"use client";

import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, CreditCard, Sparkles } from "lucide-react";
import { differenceInDays } from "date-fns";

export function BillingPageClient() {
  const { user } = useAuth();
  
  const isTrialExpired = user?.subscriptionStatus === 'TRIAL' && user.trialEndsAt && new Date() > new Date(user.trialEndsAt);
  const trialDaysLeft = user?.trialEndsAt ? differenceInDays(new Date(user.trialEndsAt), new Date()) : 0;
  
  const features = [
    "Unlimited Product Inventory",
    "Point of Sale System",
    "AI Business Reports",
    "Customer & Supplier Management",
    "Expense Tracking",
    "User Role Management",
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
       {isTrialExpired && (
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader className="flex-row items-center gap-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div>
              <CardTitle className="text-destructive">Your Trial Has Expired</CardTitle>
              <CardDescription className="text-destructive/80">Please upgrade to a Pro plan to continue using SafwanPOS.</CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      {user?.subscriptionStatus === 'TRIAL' && !isTrialExpired && (
         <Card className="bg-blue-500/10 border-blue-500">
          <CardHeader className="flex-row items-center gap-4">
            <Sparkles className="h-8 w-8 text-blue-500" />
            <div>
              <CardTitle className="text-blue-700 dark:text-blue-400">You are on a Trial Plan</CardTitle>
              <CardDescription className="text-blue-600/80 dark:text-blue-400/80">
                You have {trialDaysLeft} day{trialDaysLeft !== 1 && 's'} left. Upgrade to Pro to keep your access.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

       {user?.subscriptionStatus === 'ACTIVE' && (
         <Card className="bg-green-500/10 border-green-500">
          <CardHeader className="flex-row items-center gap-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <CardTitle className="text-green-700 dark:text-green-400">You are on the Pro Plan</CardTitle>
              <CardDescription className="text-green-600/80 dark:text-green-400/80">
                Thank you for being a subscriber. You have access to all features.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}
      
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card className="shadow-lg border-2 border-primary">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Pro Plan</CardTitle>
            <CardDescription>All features unlocked. No limits.</CardDescription>
            <div className="text-5xl font-bold pt-4">$19<span className="text-lg font-normal text-muted-foreground">/month</span></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {features.map(feature => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="flex-col gap-4">
             <Button className="w-full" size="lg">
                <CreditCard className="mr-2 h-5 w-5" />
                Pay with Stripe
             </Button>
              <Button className="w-full" size="lg" variant="secondary">
                <CreditCard className="mr-2 h-5 w-5" />
                Pay with Chargily
             </Button>
          </CardFooter>
        </Card>

        <div className="space-y-4 pt-8 text-sm text-muted-foreground">
            <h3 className="font-semibold text-foreground text-lg">Frequently Asked Questions</h3>
            <div>
                <h4 className="font-semibold text-foreground">What happens when my trial ends?</h4>
                <p>Your account will be locked, and you will be redirected to this page. To regain access, you must subscribe to the Pro plan. Your data will be kept safe.</p>
            </div>
             <div>
                <h4 className="font-semibold text-foreground">Can I cancel my subscription?</h4>
                <p>Yes, you can cancel your subscription at any time. You will retain access until the end of your current billing period.</p>
            </div>
             <div>
                <h4 className="font-semibold text-foreground">Which payment methods do you accept?</h4>
                <p>We accept major credit cards through Stripe for international payments, and payments via CIB/EDAHABIA cards through Chargily for local Algerian customers.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
