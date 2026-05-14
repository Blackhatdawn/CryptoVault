import { supabase } from "../lib/supabase.js";
import { getCachedPrices } from "./priceService.js";

export async function checkPriceAlerts(): Promise<void> {
  try {
    const prices = getCachedPrices();
    if (!prices.length) return;

    const { data: alerts } = await supabase
      .from("price_alerts")
      .select("*")
      .eq("is_active", true);

    if (!alerts?.length) return;

    const priceMap = new Map(
      prices.map((p) => [p.symbol.toUpperCase(), parseFloat(p.priceUsd)]),
    );

    const triggered: string[] = [];

    for (const alert of alerts) {
      const currentPrice = priceMap.get(alert.symbol.toUpperCase());
      if (currentPrice == null) continue;

      const target = Number(alert.target_price);
      const hit =
        alert.direction === "above"
          ? currentPrice >= target
          : currentPrice <= target;

      if (hit) {
        triggered.push(alert.id);

        const direction = alert.direction === "above" ? "risen above" : "fallen below";
        const body = `${alert.symbol} has ${direction} your target of $${target.toLocaleString()}. Current price: $${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

        await supabase.from("notifications").insert({
          user_id: alert.user_id,
          title: `🎯 Price Alert Triggered: ${alert.symbol}`,
          body,
          category: "price_alert",
          is_read: false,
        });
      }
    }

    if (triggered.length > 0) {
      await supabase
        .from("price_alerts")
        .update({ is_active: false })
        .in("id", triggered);

      console.log(`🔔 Triggered ${triggered.length} price alert(s)`);
    }
  } catch (err: any) {
    console.error("Alert checker error:", err.message);
  }
}
