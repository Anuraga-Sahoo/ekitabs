
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
import { Loader2, UserPlus, ShieldCheck, MailIcon, KeyRoundIcon } from "lucide-react";
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

async function parseJsonResponse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON response:", text);
    return { message: "Received non-JSON response from server. Please check server logs.", error: text };
  }
}

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [formStep, setFormStep] = React.useState<'details' | 'otp'>('details');
  const [signupOtpToken, setSignupOtpToken] = React.useState<string | null>(null);
  const [userEmailForOtp, setUserEmailForOtp] = React.useState<string>("");

  const detailsForm = useForm<SignupDetailsFormValues>({
    resolver: zodResolver(signupDetailsSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  async function onRequestSignupOtp(data: SignupDetailsFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/request-signup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
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
        description: result.message || "An OTP has been sent to your email.",
      });
      setSignupOtpToken(result.signupOtpToken);
      setUserEmailForOtp(data.email);
      setFormStep('otp');

    } catch (error) {
      console.error("Request Signup OTP client-side error:", error);
      toast({
        title: "Request Failed",
        description: error instanceof Error ? error.message : "Could not connect to server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onCompleteSignup(data: OtpFormValues) {
    if (!signupOtpToken) {
      toast({ title: "Error", description: "Signup session token not found. Please try signing up again.", variant: "destructive" });
      setFormStep('details');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/complete-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signupOtpToken, otp: data.otp }),
      });

      const result = await parseJsonResponse(response);

      if (!response.ok) {
        toast({
          title: "Signup Failed",
          description: result.message || `Error: ${response.status}`,
          variant: "destructive",
        });
        if (response.status === 400 && result.message && (result.message.toLowerCase().includes("expired") || result.message.toLowerCase().includes("invalid token"))) {
            setFormStep('details'); 
            setSignupOtpToken(null);
            detailsForm.reset();
        }
        return;
      }

      toast({
        title: "Signup Successful!",
        description: result.message || "Your account has been created. Redirecting to login...",
      });
      router.push('/login'); // Or redirect to dashboard if login is automatic

    } catch (error) {
      console.error("Complete Signup client-side error:", error);
      toast({
        title: "Verification Failed",
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
        {formStep === 'details' && (
          <>
            <CardHeader className="text-center">
              <UserPlus className="mx-auto h-12 w-12 text-primary mb-2" />
              <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your details to get an OTP for verification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...detailsForm}>
                <form onSubmit={detailsForm.handleSubmit(onRequestSignupOtp)} className="space-y-6">
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
                <form onSubmit={otpForm.handleSubmit(onCompleteSignup)} className="space-y-6">
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
              <Button 
                variant="link" 
                onClick={() => { 
                  setFormStep('details'); 
                  setSignupOtpToken(null); 
                  otpForm.reset(); 
                  // detailsForm.reset(); // Keep details filled
                }} 
                className="mt-4 p-0 h-auto"
              >
                Entered wrong details? Go back.
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
