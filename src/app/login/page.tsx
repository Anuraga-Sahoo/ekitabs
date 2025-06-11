
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
import * as React from "react"; // Changed to import * as React
import { Loader2, LogInIcon, MailIcon, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});
type EmailFormValues = z.infer<typeof emailSchema>;

const otpSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 digits." }),
});
type OtpFormValues = z.infer<typeof otpSchema>;

async function parseJsonResponse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON response:", text);
    return { message: "Received non-JSON response from server. Please check server logs.", error: text };
  }
}

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { updateAuthState } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [formStep, setFormStep] = React.useState<'email' | 'otp'>('email');
  const [loginOtpToken, setLoginOtpToken] = React.useState<string | null>(null);
  const [userEmailForOtp, setUserEmailForOtp] = React.useState<string>("");

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  async function onRequestLoginOtp(data: EmailFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/request-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });
      const result = await parseJsonResponse(response);

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
        description: result.message || "An OTP has been sent to your email for login.",
      });
      setLoginOtpToken(result.loginOtpToken);
      setUserEmailForOtp(data.email);
      setFormStep('otp');
    } catch (error) {
      console.error("Request Login OTP client-side error:", error);
      toast({
        title: "Request Failed",
        description: error instanceof Error ? error.message : "Could not connect to server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onVerifyLoginOtp(data: OtpFormValues) {
    if (!loginOtpToken) {
      toast({ title: "Error", description: "Login session token not found. Please try again.", variant: "destructive" });
      setFormStep('email');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginOtpToken, otp: data.otp }),
      });
      const result = await parseJsonResponse(response);

      if (!response.ok) {
        toast({
          title: "Login Failed",
          description: result.message || `Error: ${response.status}`,
          variant: "destructive",
        });
         if (response.status === 400 && result.message && (result.message.toLowerCase().includes("expired") || result.message.toLowerCase().includes("invalid token"))) {
            setFormStep('email'); 
            setLoginOtpToken(null);
        }
        return;
      }
      toast({
        title: "Login Successful!",
        description: "Welcome back! Redirecting to your dashboard...",
      });
      updateAuthState();
      router.push('/dashboard');
    } catch (error) {
      console.error("Verify Login OTP client-side error:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Could not connect to server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-150px)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-xl">
        {formStep === 'email' && (
          <>
            <CardHeader className="text-center">
              <MailIcon className="mx-auto h-12 w-12 text-primary mb-2" />
              <CardTitle className="text-3xl font-bold">Login with OTP</CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your email to receive a One-Time Password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onRequestLoginOtp)} className="space-y-6">
                  <FormField
                    control={emailForm.control}
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
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send OTP"}
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
              <CardTitle className="text-3xl font-bold">Enter OTP</CardTitle>
              <CardDescription className="text-muted-foreground">
                An OTP has been sent to {userEmailForOtp}. Please enter it below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(onVerifyLoginOtp)} className="space-y-6">
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
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify OTP & Log In"}
                  </Button>
                </form>
              </Form>
              <Button 
                variant="link" 
                onClick={() => { 
                  setFormStep('email'); 
                  setLoginOtpToken(null); 
                  otpForm.reset();
                  // Do not reset emailForm.control._defaultValues.email
                }} 
                className="mt-4 p-0 h-auto"
              >
                Entered wrong email? Go back.
              </Button>
            </CardContent>
          </>
        )}

        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
