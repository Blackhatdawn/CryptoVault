import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";

const router = Router();

// GET /api/alerts
router.get(
  "/",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("price_alerts")
        .select("*")
        .eq("user_id", req.userId!)
        .order("created_at", { ascending: false });

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      res.json({
        data: (data ?? []).map((a) => ({
          id: a.id,
          symbol: a.symbol,
          condition: a.direction, // direction → condition
          target_price: Number(a.target_price),
          active: a.is_active, // is_active → active
          createdAt: a.created_at,
        })),
        total: data?.length ?? 0,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// POST /api/alerts
router.post(
  "/",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { symbol, condition, target_price } = req.body;

      if (!symbol || !condition || target_price == null) {
        res
          .status(400)
          .json({ error: "symbol, condition, and target_price are required" });
        return;
      }
      if (!["above", "below"].includes(condition)) {
        res.status(400).json({ error: 'condition must be "above" or "below"' });
        return;
      }
      if (Number(target_price) <= 0) {
        res.status(400).json({ error: "target_price must be greater than 0" });
        return;
      }

      const { data: alert, error } = await supabase
        .from("price_alerts")
        .insert({
          user_id: req.userId,
          symbol: String(symbol).toUpperCase(),
          direction: condition, // condition → direction
          target_price: Number(target_price),
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      res.status(201).json({
        data: {
          id: alert.id,
          symbol: alert.symbol,
          condition: alert.direction,
          target_price: Number(alert.target_price),
          active: alert.is_active,
          createdAt: alert.created_at,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// DELETE /api/alerts/:id
router.delete(
  "/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error } = await supabase
        .from("price_alerts")
        .delete()
        .eq("id", req.params.id)
        .eq("user_id", req.userId!); // scoped to prevent deleting other users' alerts

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.json({ message: "Alert deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
