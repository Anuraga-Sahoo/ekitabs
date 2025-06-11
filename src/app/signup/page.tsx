
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, UserPlus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const signupDetailsSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type SignupDetailsFormValues = z.infer<typeof signupDetailsSchema>;

const otpSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 digits." }),
});

type OtpFormValues = z.infer<typeof otpSchema>;

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formStep, setFormStep] = useState<'details' | 'otp'>('details');
  const [activationToken, setActivationToken] = useState<string | null>(null);
  const [userEmailForOtp, setUserEmailForOtp] = useState<string>("");


  const detailsForm = useForm<SignupDetailsFormValues>({
    resolver: zodResolver(signupDetailsSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  async function onRequestOtp(data: SignupDetailsFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signup', { // This is now the "request OTP" endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "OTP Request Failed",
          description: result.message || `Error: ${response.status}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "OTP Sent!",
        description: result.message || "An OTP has been sent to your email.",
      });
      setActivationToken(result.activationToken);
      setUserEmailForOtp(data.email);
      setFormStep('otp');

    } catch (error) {
      handleFetchError(error, "OTP Request Error");
    } finally {
      setIsLoading(false);
    }
  }

  async function onVerifyOtp(data: OtpFormValues) {
    if (!activationToken) {
      toast({ title: "Error", description: "Activation token not found. Please try signing up again.", variant: "destructive" });
      setFormStep('details');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activationToken, otp: data.otp }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "OTP Verification Failed",
          description: result.message || `Error: ${response.status}`,
          variant: "destructive",
        });
        if (result.message && result.message.toLowerCase().includes("expired")) {
            setFormStep('details'); // Go back to details if OTP expired
            setActivationToken(null);
        }
        return;
      }

      toast({
        title: "Signup Successful!",
        description: result.message || "Your account has been created. You can now log in.",
      });
      router.push('/login');

    } catch (error) {
      handleFetchError(error, "OTP Verification Error");
    } finally {
      setIsLoading(false);
    }
  }

  function handleFetchError(error: any, contextTitle: string) {
    let description = "Could not connect to the server. Please try again.";
    if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
      description = "Network error: Failed to fetch. Please check your internet connection and ensure the server is running.";
    } else if (error instanceof Error) {
      description = error.message;
    }
    toast({
      title: contextTitle,
      description: description,
      variant: "destructive",
    });
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-150px)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-xl">
        {formStep === 'details' && (
          <>
            <CardHeader className="text-center">
              <UserPlus className="mx-auto h-12 w-12 text-primary mb-2" />
              <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your details below to sign up.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...detailsForm}>
                <form onSubmit={detailsForm.handleSubmit(onRequestOtp)} className="space-y-6">
                  <FormField
                    control={detailsForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={detailsForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={detailsForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={detailsForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Get OTP"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </>
        )}

        {formStep === 'otp' && (
          <>
            <CardHeader className="text-center">
              <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-2" />
              <CardTitle className="text-3xl font-bold">Verify Email</CardTitle>
              <CardDescription className="text-muted-foreground">
                An OTP has been sent to {userEmailForOtp}. Please enter it below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-6">
                  <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>One-Time Password (OTP)</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="Enter 6-digit OTP" {...field} maxLength={6} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify OTP & Sign Up"}
                  </Button>
                </form>
              </Form>
              <Button variant="link" onClick={() => { setFormStep('details'); setActivationToken(null); otpForm.reset(); detailsForm.reset(); }} className="mt-4 p-0 h-auto">
                Change email or details?
              </Button>
            </CardContent>
          </>
        )}

        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href="/login">Log In</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
