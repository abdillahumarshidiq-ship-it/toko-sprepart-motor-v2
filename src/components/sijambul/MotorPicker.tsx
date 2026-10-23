"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, X } from "lucide-react";
import { useUIStore } from "@/lib/ui-store";
import type { MotorRow } from "./types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function MotorPicker({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [motors, setMotors] = useState<MotorRow[]>([]);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const { selectedMotor, setMotor } = useUIStore();

  useEffect(() => {
    fetch("/api/motors")
      .then((r) => r.json())
      .then((res) => {
        if (res?.ok) setMotors(res.data);
      })
      .catch(() => {});
  }, []);

  const grouped = motors.reduce<Record<string, MotorRow[]>>((acc, m) => {
    (acc[m.brand] ||= []).push(m);
    return acc;
  }, {});

  const filtered = (list: MotorRow[]) =>
    list.filter((m) => `${m.brand} ${m.model}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {selectedMotor ? (
          <Button
            variant="outline"
            className={cn(
              "gap-2 justify-between",
              compact ? "h-9 px-3 text-xs" : "h-12 px-4 text-sm"
            )}
          >
            <span className="flex items-center gap-2 truncate">
              <Check className="h-4 w-4 text-primary" />
              <span className="truncate font-semibold">
                {selectedMotor.brand} {selectedMotor.model}
              </span>
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        ) : (
          <Button
            variant="outline"
            className={cn(
              "gap-2 justify-between border-dashed",
              compact ? "h-9 px-3 text-xs" : "h-12 px-4 text-sm"
            )}
          >
            <span className="text-muted-foreground">Pilih motor kamu…</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pilih Motor Kamu</DialogTitle>
        </DialogHeader>
        <Input
          autoFocus
          placeholder="Cari: Beat, Vario, NMAX, Satria FU…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        {selectedMotor && (
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-rose-600"
            onClick={() => {
              setMotor(null);
              setOpen(false);
            }}
          >
            <X className="mr-2 h-4 w-4" /> Hapus pilihan motor
          </Button>
        )}

        <div className="mt-2 space-y-4">
          {Object.entries(grouped).map(([brand, list]) => {
            const items = filtered(list);
            if (!items.length) return null;
            return (
              <div key={brand}>
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {brand}
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {items.map((m) => {
                    const isActive = selectedMotor?.id === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          setMotor({
                            id: m.id,
                            brand: m.brand,
                            model: m.model,
                            yearFrom: m.yearFrom,
                            yearTo: m.yearTo,
                            slug: m.slug,
                          });
                          setOpen(false);
                          router.push("/katalog");
                        }}
                        className={cn(
                          "flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition",
                          isActive
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40 hover:bg-accent"
                        )}
                      >
                        <span className="text-sm font-medium">
                          {m.brand} {m.model}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {m.yearFrom ? `${m.yearFrom}${m.yearTo ? `+` : ""}` : "All year"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {!motors.length && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Memuat data motor…
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
