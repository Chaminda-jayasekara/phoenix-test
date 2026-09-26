"use client";

import { useState, useEffect } from "react";

export default function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!targetDate) return;
    function update() {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ done: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        done: false,
      });
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!targetDate) {
    return (
      <div className="text-center text-muted text-sm py-6 border border-border rounded-xl bg-surface">
        Event date coming soon
      </div>
    );
  }

  if (!timeLeft) return <div className="h-[84px]" />;

  if (timeLeft.done) {
    return (
      <div className="text-center py-6 border border-border rounded-xl bg-surface">
        <div className="text-lg font-extrabold text-flame2">PHOENIX&apos;26 is here!</div>
      </div>
    );
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {units.map((u) => (
        <div key={u.label} className="bg-surface border border-border rounded-xl py-3 text-center">
          <div className="text-2xl font-extrabold bg-ember bg-clip-text text-transparent tabular-nums">
            {String(u.value).padStart(2, "0")}
          </div>
          <div className="text-[10px] text-muted mt-1 tracking-wide uppercase">{u.label}</div>
        </div>
      ))}
    </div>
  );
}
