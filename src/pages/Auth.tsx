import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff, ShoppingBag, Store, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const buyerSignupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email").max(255),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const sellerSignupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email").max(255),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15),
  shopName: z.string().min(2, "Shop name must be at least 2 characters").max(100),
  gstNumber: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type BuyerSignupFormData = z.infer<typeof buyerSignupSchema>;
type SellerSignupFormData = z.infer<typeof sellerSignupSchema>;

export default function Auth() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authType, setAuthType] = useState<'buyer' | 'seller'>('buyer');
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const from = (location.state as { from?: string })?.from || '/';
  const typeFromUrl = searchParams.get('type');

  useEffect(() => {
    if (typeFromUrl === 'seller') {
      setAuthType('seller');
    }
  }, [typeFromUrl]);

  // Redirect if already logged in
  if (user) {
    navigate(from, { replace: true });
    return null;
  }

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const buyerSignupForm = useForm<BuyerSignupFormData>({
    resolver: zodResolver(buyerSignupSchema),
    defaultValues: { fullName: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const sellerSignupForm = useForm<SellerSignupFormData>({
    resolver: zodResolver(sellerSignupSchema),
    defaultValues: { fullName: "", email: "", phone: "", shopName: "", gstNumber: "", password: "", confirmPassword: "" },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);
    setIsLoading(false);
    
    if (error) {
      toast({
        title: "Login failed",
        description: error.message === "Invalid login credentials" 
          ? "Invalid email or password. Please try again."
          : error.message,
        variant: "destructive",
      });
      return;
    }
    
    toast({ title: "Welcome back!", description: "You've successfully logged in." });
    navigate(from, { replace: true });
  };

  const handleBuyerSignup = async (data: BuyerSignupFormData) => {
    setIsLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: data.fullName,
          phone: data.phone,
        },
      },
    });
    
    setIsLoading(false);
    
    if (error) {
      let message = error.message;
      if (message.includes("already registered")) {
        message = "This email is already registered. Please try logging in.";
      }
      toast({
        title: "Signup failed",
        description: message,
        variant: "destructive",
      });
      return;
    }
    
    toast({ 
      title: "Account created!", 
      description: "You can now start shopping.",
    });
    navigate(from, { replace: true });
  };

  const handleSellerSignup = async (data: SellerSignupFormData) => {
    setIsLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    
    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: data.fullName,
          phone: data.phone,
          shop_name: data.shopName,
          gst_number: data.gstNumber,
        },
      },
    });
    
    if (authError) {
      setIsLoading(false);
      let message = authError.message;
      if (message.includes("already registered")) {
        message = "This email is already registered. Please try logging in.";
      }
      toast({
        title: "Signup failed",
        description: message,
        variant: "destructive",
      });
      return;
    }

    // Assign seller role
    if (authData.user) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: 'seller' })
        .eq('user_id', authData.user.id);

      if (roleError) {
        console.error('Error assigning seller role:', roleError);
      }

      // Update profile with seller info
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          shop_name: data.shopName,
          gst_number: data.gstNumber || null,
          phone: data.phone
        })
        .eq('user_id', authData.user.id);

      if (profileError) {
        console.error('Error updating seller profile:', profileError);
      }
    }
    
    setIsLoading(false);
    
    toast({ 
      title: "Seller account created!", 
      description: "Welcome to WearKart! Start adding your products.",
    });
    navigate('/seller', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-glow"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      
      <Card className="w-full max-w-md glass glow-border relative z-10">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center gap-2 mb-4 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-orange shadow-glow group-hover:scale-105 transition-transform">
              <ShoppingBag className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold font-display text-foreground">
              Wear<span className="text-gradient">Kart</span>
            </span>
          </Link>
          <CardTitle className="font-display">Welcome</CardTitle>
          <CardDescription>Sign in or create your account</CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* User Type Selection */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={authType === 'buyer' ? 'default' : 'outline'}
              className={`flex-1 ${authType === 'buyer' ? 'bg-gradient-orange' : 'border-border/50'}`}
              onClick={() => setAuthType('buyer')}
            >
              <User className="h-4 w-4 mr-2" />
              Buyer
            </Button>
            <Button
              variant={authType === 'seller' ? 'default' : 'outline'}
              className={`flex-1 ${authType === 'seller' ? 'bg-gradient-orange' : 'border-border/50'}`}
              onClick={() => setAuthType('seller')}
            >
              <Store className="h-4 w-4 mr-2" />
              Seller
            </Button>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    className="bg-secondary/50 border-border/50"
                    {...loginForm.register("email")}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="bg-secondary/50 border-border/50"
                      {...loginForm.register("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full bg-gradient-orange hover:opacity-90 shadow-glow" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>
            
            {/* Signup Tab */}
            <TabsContent value="signup">
              {authType === 'buyer' ? (
                <form onSubmit={buyerSignupForm.handleSubmit(handleBuyerSignup)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="buyer-name">Full Name</Label>
                    <Input
                      id="buyer-name"
                      type="text"
                      placeholder="John Doe"
                      className="bg-secondary/50 border-border/50"
                      {...buyerSignupForm.register("fullName")}
                    />
                    {buyerSignupForm.formState.errors.fullName && (
                      <p className="text-sm text-destructive">{buyerSignupForm.formState.errors.fullName.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="buyer-email">Email</Label>
                    <Input
                      id="buyer-email"
                      type="email"
                      placeholder="you@example.com"
                      className="bg-secondary/50 border-border/50"
                      {...buyerSignupForm.register("email")}
                    />
                    {buyerSignupForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{buyerSignupForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buyer-phone">Phone Number</Label>
                    <Input
                      id="buyer-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="bg-secondary/50 border-border/50"
                      {...buyerSignupForm.register("phone")}
                    />
                    {buyerSignupForm.formState.errors.phone && (
                      <p className="text-sm text-destructive">{buyerSignupForm.formState.errors.phone.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="buyer-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="buyer-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="bg-secondary/50 border-border/50"
                        {...buyerSignupForm.register("password")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {buyerSignupForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{buyerSignupForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="buyer-confirm">Confirm Password</Label>
                    <Input
                      id="buyer-confirm"
                      type="password"
                      placeholder="••••••••"
                      className="bg-secondary/50 border-border/50"
                      {...buyerSignupForm.register("confirmPassword")}
                    />
                    {buyerSignupForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">{buyerSignupForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full bg-gradient-orange hover:opacity-90 shadow-glow" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Buyer Account
                  </Button>
                </form>
              ) : (
                <form onSubmit={sellerSignupForm.handleSubmit(handleSellerSignup)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="seller-name">Full Name</Label>
                    <Input
                      id="seller-name"
                      type="text"
                      placeholder="John Doe"
                      className="bg-secondary/50 border-border/50"
                      {...sellerSignupForm.register("fullName")}
                    />
                    {sellerSignupForm.formState.errors.fullName && (
                      <p className="text-sm text-destructive">{sellerSignupForm.formState.errors.fullName.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="seller-email">Email</Label>
                    <Input
                      id="seller-email"
                      type="email"
                      placeholder="you@example.com"
                      className="bg-secondary/50 border-border/50"
                      {...sellerSignupForm.register("email")}
                    />
                    {sellerSignupForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{sellerSignupForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seller-phone">Phone Number</Label>
                    <Input
                      id="seller-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="bg-secondary/50 border-border/50"
                      {...sellerSignupForm.register("phone")}
                    />
                    {sellerSignupForm.formState.errors.phone && (
                      <p className="text-sm text-destructive">{sellerSignupForm.formState.errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seller-shop">Shop Name</Label>
                    <Input
                      id="seller-shop"
                      type="text"
                      placeholder="My Awesome Store"
                      className="bg-secondary/50 border-border/50"
                      {...sellerSignupForm.register("shopName")}
                    />
                    {sellerSignupForm.formState.errors.shopName && (
                      <p className="text-sm text-destructive">{sellerSignupForm.formState.errors.shopName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seller-gst">GST Number (Optional)</Label>
                    <Input
                      id="seller-gst"
                      type="text"
                      placeholder="22AAAAA0000A1Z5"
                      className="bg-secondary/50 border-border/50"
                      {...sellerSignupForm.register("gstNumber")}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="seller-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="seller-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="bg-secondary/50 border-border/50"
                        {...sellerSignupForm.register("password")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {sellerSignupForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{sellerSignupForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="seller-confirm">Confirm Password</Label>
                    <Input
                      id="seller-confirm"
                      type="password"
                      placeholder="••••••••"
                      className="bg-secondary/50 border-border/50"
                      {...sellerSignupForm.register("confirmPassword")}
                    />
                    {sellerSignupForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">{sellerSignupForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full bg-gradient-orange hover:opacity-90 shadow-glow" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Seller Account
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-success" />
            <span>Secured with 256-bit encryption</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}