// app/(auth)/register/page.tsx
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error ?? "Registration failed"); setLoading(false); return; }
      await signIn("credentials", { email, password, callbackUrl: "/" });
    } catch { setError("Something went wrong"); setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-playfair text-3xl font-black text-primary">NexusAI</Link>
          <p className="text-muted-foreground mt-2 text-sm">Create your free account</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-8 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {[{ provider:"google", label:"Sign up with Google" },{ provider:"github", label:"Sign up with GitHub" }].map(p => (
              <button key={p.provider} onClick={() => signIn(p.provider, { callbackUrl: "/" })}
                className="flex items-center justify-center border border-border rounded-xl py-2.5 text-sm font-medium hover:bg-muted transition-colors">{p.label}</button>
            ))}
          </div>
          <div className="flex items-center gap-3"><div className="flex-1 h-px bg-border"/><span className="text-xs text-muted-foreground">or email</span><div className="flex-1 h-px bg-border"/></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
            <div>
              <label className="text-sm font-medium block mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={e=>setName(e.target.value)} required placeholder="Jane Smith"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"/>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"/>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Min 8 characters"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"/>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl text-sm hover:opacity-90 disabled:opacity-60">
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
