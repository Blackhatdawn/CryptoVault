import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";

const router = Router();

// GET /api/orders
router.get(
  "/",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", req.userId!)
        .order("created_at", { ascending: false });

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      res.json({
        data: (data ?? []).map((o) => ({
          id: o.id,
          symbol: o.symbol,
          side: o.side,
          type: o.type,
          amount: Number(o.quantity),
          price: o.price != null ? Number(o.price) : null,
          total: o.total != null ? Number(o.total) : null,
          status: o.status,
          created_at: o.created_at,
        })),
        total: data?.length ?? 0,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// POST /api/orders
router.post(
  "/",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { symbol, side, type, amount, price } = req.body;

      if (!symbol || !side || !type || !amount) {
        res
          .status(400)
          .json({ error: "symbol, side, type, and amount are required" });
        return;
      }
      if (!["buy", "sell"].includes(side)) {
        res.status(400).json({ error: 'side must be "buy" or "sell"' });
        return;
      }
      if (!["market", "limit"].includes(type)) {
        res.status(400).json({ error: 'type must be "market" or "limit"' });
        return;
      }
      if (type === "limit" && (price == null || Number(price) <= 0)) {
        res
          .status(400)
          .json({ error: "A valid price is required for limit orders" });
        return;
      }

      const qty = Number(amount);
      const execPrice = price != null ? Number(price) : null;
      const total = execPrice != null ? qty * execPrice : null;

      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: req.userId,
          symbol: String(symbol).toUpperCase(),
          side,
          type,
          quantity: qty,
          price: execPrice,
          total,
          status: type === "market" ? "filled" : "pending",
        })
        .select()
        .single();

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      // Create a trade transaction record for filled market orders
      if (type === "market" && order) {
        await supabase.from("transactions").insert({
          user_id: req.userId,
          type: "trade",
          amount: total ?? qty,
          currency: "USD",
          status: "completed",
          description: `${String(side).toUpperCase()} ${qty} ${symbol} @ market`,
          metadata: { order_id: order.id, symbol, side },
        });
      }

      res.status(201).json({
        data: {
          id: order.id,
          symbol: order.symbol,
          side: order.side,
          type: order.type,
          amount: Number(order.quantity),
          price: order.price != null ? Number(order.price) : null,
          total: order.total != null ? Number(order.total) : null,
          status: order.status,
          created_at: order.created_at,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// DELETE /api/orders/:id
router.delete(
  "/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { data: order } = await supabase
        .from("orders")
        .select("status")
        .eq("id", req.params.id)
        .eq("user_id", req.userId!)
        .single();

      if (!order) {
        res.status(404).json({ error: "Order not found" });
        return;
      }
      if (order.status !== "pending") {
        res.status(400).json({ error: "Only pending orders can be cancelled" });
        return;
      }

      const { data: updated, error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", req.params.id)
        .select()
        .single();

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.json({ data: updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
