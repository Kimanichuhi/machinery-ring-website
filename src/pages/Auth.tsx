import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";

const Auth = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const redirect = params.get("redirect") || "/";
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", fullName: "", phone: "" });

  useEffect(() => {
    if (!loading && user) navigate(isAdmin ? "/admin" : redirect, { replace: true });
  }, [user, isAdmin, loading, redirect, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Signed in");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}${redirect}`,
        data: { full_name: form.fullName, phone: form.phone },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created. You can sign in now.");
    setTab("signin");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <SEO title="Sign In or Create an Account · Machinery Ring" description="Access your Machinery Ring account to place orders and track deliveries." path="/auth" />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Welcome to Machinery Ring</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-3">
                <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Password</Label><Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
                <Button type="submit" variant="hero" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Don&apos;t have an account?{" "}
                  <button type="button" onClick={() => setTab("signup")} className="text-primary hover:underline">
                    Create one
                  </button>
                </p>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-3">
                <div><Label>Full name</Label><Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
                <div><Label>Phone</Label><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Password</Label><Input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
                <Button type="submit" variant="hero" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Already have an account?{" "}
                  <button type="button" onClick={() => setTab("signin")} className="text-primary hover:underline">
                    Sign in
                  </button>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
