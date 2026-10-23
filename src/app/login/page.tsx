"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle, Bike, Loader2, Lock, Mail } from "lucide-react";
import { STORE_CONFIG } from "@/lib/store-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email atau password salah. Coba lagi.");
    } else if (res?.ok) {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-rose-50 px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-primary/5 ring-1 ring-primary/20 shadow">
            <Image
              src="/logo-sijambul-square.png"
              alt={`Logo ${STORE_CONFIG.name}`}
              width={42}
              height={42}
              className="h-11 w-11 object-cover"
              priority
            />
          </div>
          <div className="text-left">
            <div className="text-xl font-extrabold">
              Sijambul <span className="text-primary">Merah</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Sparepart Motor
            </div>
          </div>
        </Link>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <h1 className="text-center text-2xl font-black">Login Admin</h1>
            <p className="text-center text-xs text-muted-foreground">
              Masuk untuk mengelola produk, stok, dan kompatibilitas motor
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sijambulmerah.id"
                    className="pl-10"
                    autoFocus
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full gap-2">
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Memproses…</>
                ) : (
                  <><Lock className="h-4 w-4" /> Masuk</>
                )}
              </Button>
            </form>

            <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-800">
              <strong>Default credentials:</strong>
              <br />
              Email: <code className="font-mono">admin@sijambulmerah.id</code>
              <br />
              Password: <code className="font-mono">admin123</code> (ubah di .env)
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
              >
                <Bike className="h-3 w-3" /> Kembali ke beranda
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
