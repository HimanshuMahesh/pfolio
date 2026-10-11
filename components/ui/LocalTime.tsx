"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";

const format = new Intl.DateTimeFormat("en-GB", {
  timeZone: site.location.timeZone,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/**
 * Current time in Bengaluru as HH:MM. Renders a placeholder on the server
 * (the page is static) and ticks on the minute boundary on the client.
 */
export function LocalTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    let timer: number;
    const tick = () => {
      setTime(format.format(new Date()));
      timer = window.setTimeout(tick, 60_000 - (Date.now() % 60_000));
    };
    tick();
    return () => window.clearTimeout(timer);
  }, []);

  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{time ?? "--:--"}</span>;
}
