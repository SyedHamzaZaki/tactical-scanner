"use client";

import { useEffect, useState } from "react";

export default function HUDClock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [coords, setCoords] = useState({ lat: "38.8951", lon: "-77.0364" });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toUTCString().split(" ")[4] + " UTC"
      );
      setDate(
        now.toISOString().split("T")[0]
      );
    };
    tick();
    const id = setInterval(tick, 1000);

    // Slowly drift fake coordinates for immersion
    const drift = setInterval(() => {
      setCoords((c) => ({
        lat: (parseFloat(c.lat) + (Math.random() - 0.5) * 0.0001).toFixed(4),
        lon: (parseFloat(c.lon) + (Math.random() - 0.5) * 0.0001).toFixed(4),
      }));
    }, 3000);

    return () => {
      clearInterval(id);
      clearInterval(drift);
    };
  }, []);

  return (
    <div className="hidden md:flex items-center gap-4 text-[10px] tracking-widest opacity-50 font-mono">
      <span>{date}</span>
      <span className="text-[#00e5ff]">{time}</span>
      <span className="opacity-60">
        {coords.lat}°N {coords.lon}°W
      </span>
    </div>
  );
}
