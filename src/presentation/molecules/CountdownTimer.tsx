"use client";

import { useEffect, useState } from "react";

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-primary text-primary-foreground w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold font-mono">
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export function CountdownTimer({ targetSecs }: { targetSecs: number }) {
  const [secs, setSecs] = useState(targetSecs);

  useEffect(() => {
    const timer = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  return (
    <div className="flex items-end gap-2">
      <TimeBox value={h} label="Hs" />
      <span className="text-primary font-bold text-xl mb-5">:</span>
      <TimeBox value={m} label="Min" />
      <span className="text-primary font-bold text-xl mb-5">:</span>
      <TimeBox value={s} label="Seg" />
    </div>
  );
}
