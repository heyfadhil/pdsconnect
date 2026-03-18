"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState("");
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    function calc() {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining("Expired");
        setUrgent(true);
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setUrgent(h < 6);
      setRemaining(h > 0 ? `${h}h ${m}m remaining` : `${m}m remaining`);
    }
    calc();
    const t = setInterval(calc, 30000);
    return () => clearInterval(t);
  }, [expiresAt]);

  return (
    <div
      className={`flex items-center gap-1 text-body-sm font-medium ${
        urgent ? "text-amber-600" : "text-mid-gray"
      }`}
    >
      <Clock size={13} />
      {remaining}
    </div>
  );
}
