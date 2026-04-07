import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Mail, Lock, User, LogIn, UserPlus, Terminal, Eye, EyeOff, Sparkles, Code2, Zap } from "lucide-react";

const FloatingParticle = ({ delay, size, x, y, duration }: { delay: number; size: number; x: number; y: number; duration: number }) => (
  <div
    className="absolute rounded-full bg-primary/20 animate-pulse"
    style={{
      width: size,
      height: size,
      left: `${x}%`,
      top: `${y}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    }}
  />
);

const particles = [
  { delay: 0, size: 4, x: 10, y: 20, duration: 3 },
  { delay: 1.5, size: 6, x: 80, y: 15, duration: 4 },
  { delay: 0.5, size: 3, x: 25, y: 70, duration: 3.5 },
  { delay: 2, size: 5, x: 70, y: 60, duration: 2.5 },
  { delay: 1, size: 4, x: 50, y: 85, duration: 4.5 },
  { delay: 0.8, size: 7, x: 90, y: 40, duration: 3 },
  { delay: 2.5, size: 3, x: 15, y: 50, duration: 5 },
  { delay: 1.2, size: 5, x: 60, y: 30, duration: 3.8 },
];

const features = [
  { icon: Code2, title: "Learn to Code", desc: "Step-by-step tutorials for beginners and pros" },
  { icon: Sparkles, title: "Real Projects", desc: "Build real-world applications from scratch" },
  { icon: Zap, title: "Stay Updated", desc: "Latest tech trends and best practices" },
];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
        navigate("/");
      }
    } else {
      if (!username.trim()) {
        toast.error("Please enter a username.");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Check your email to verify your account!");
      }
    }
    setLoading(false);
  };

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ["", "bg-destructive", "bg-yellow-500", "bg-primary"];
  const strengthLabels = ["", "Weak", "Good", "Strong"];

  return (
    <main className="pt-16 min-h-screen flex relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 grid-pattern opacity-10" />
      {particles.map((p, i) => (
        <FloatingParticle key={i} {...p} />
      ))}

      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 px-16 relative">
        <div className={`transition-all duration-700 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 glow-border flex items-center justify-center">
              <Terminal className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-gradient">Abule Tech</span>
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight mb-4 leading-tight">
            {isLogin ? (
              <>Welcome back to<br />your <span className="text-gradient">tech hub</span></>
            ) : (
              <>Join the<br /><span className="text-gradient">developer community</span></>
            )}
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-md leading-relaxed">
            {isLogin
              ? "Sign in to access your profile, comment on articles, and manage your learning journey."
              : "Create an account to unlock tutorials, save projects, and connect with fellow developers."}
          </p>

          <div className="space-y-5">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className={`flex items-start gap-4 transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${300 + i * 150}ms` }}
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Decorative code block */}
          <div className="mt-12 p-4 rounded-xl bg-secondary/30 border border-border/30 font-mono text-xs text-muted-foreground max-w-sm">
            <span className="text-primary">const</span> developer = {"{"}<br />
            &nbsp;&nbsp;name: <span className="text-primary">"You"</span>,<br />
            &nbsp;&nbsp;ready: <span className="text-primary">true</span>,<br />
            &nbsp;&nbsp;skills: [<span className="text-primary">∞</span>]<br />
            {"}"};
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <div
          className={`w-full max-w-md transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 glow-border mb-4">
              <Terminal className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-1">
              {isLogin ? "Welcome back" : "Join Abule Tech"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Sign in to your account" : "Create your account to get started"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 p-1 rounded-xl bg-secondary/50 border border-border/30">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                isLogin
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                !isLogin
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl p-8 shadow-2xl shadow-black/10 glow-border">
            <div className="hidden lg:block mb-6">
              <h1 className="text-xl font-bold mb-1">
                {isLogin ? "Sign in to your account" : "Create your account"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Enter your credentials to continue" : "Fill in the details below to get started"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="opacity-0 animate-fade-up" style={{ animationDelay: "50ms" }}>
                  <label className="block text-sm font-medium mb-2">Username <span className="text-destructive">*</span></label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username"
                      required={!isLogin}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/60 bg-secondary/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 hover:border-primary/20 transition-all duration-200"
                      maxLength={50}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Email <span className="text-destructive">*</span></label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/60 bg-secondary/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 hover:border-primary/20 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password <span className="text-destructive">*</span></label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-border/60 bg-secondary/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 hover:border-primary/20 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password strength indicator */}
                {!isLogin && password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            passwordStrength >= level ? strengthColors[passwordStrength] : "bg-border"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{strengthLabels[passwordStrength]}</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/50 hover:scale-[1.01] transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed mt-2 glow-sm"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Please wait...
                  </div>
                ) : isLogin ? (
                  <>Sign In <LogIn className="h-4 w-4" /></>
                ) : (
                  <>Create Account <UserPlus className="h-4 w-4" /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-xs text-muted-foreground">or continue with</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                const result = await lovable.auth.signInWithOAuth("google", {
                  redirect_uri: window.location.origin,
                });
                if (result.error) {
                  toast.error("Google sign-in failed. Please try again.");
                  setLoading(false);
                  return;
                }
                if (result.redirected) return;
                toast.success("Welcome!");
                navigate("/");
                setLoading(false);
              }}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-3 px-5 py-3 rounded-xl border border-border/60 bg-secondary/30 text-sm font-medium hover:bg-secondary/60 hover:border-primary/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {!isLogin && (
              <p className="mt-4 text-xs text-muted-foreground text-center">
                By signing up, you agree to our Terms of Service and Privacy Policy.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Auth;
