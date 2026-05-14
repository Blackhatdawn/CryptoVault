import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";

const router = Router();

// GET /api/transactions
router.get(
  "/",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const page = Math.max(parseInt(req.query.page as string) || 1, 1);
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const {
        data: items,
        error,
        count,
      } = await supabase
        .from("transactions")
        .select("*", { count: "exact" })
        .eq("user_id", req.userId!)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      const total = count ?? 0;

      res.json({
        items: (items ?? []).map((tx) => ({
          id: tx.id,
          user_id: tx.user_id,
          type: tx.type,
          amount: Number(tx.amount),
          currency: tx.currency,
          status: tx.status,
          description: tx.description ?? "",
          created_at: tx.created_at,
          metadata: tx.metadata ?? {},
        })),
        total,
        page,
        page_size: limit,
        has_next: from + limit < total,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ─── GET /api/transactions/export  (CSV download) ────────────────────────────
router.get(
  "/export",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { data: items, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", req.userId!)
        .order("created_at", { ascending: false });

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;

      const header = ["Date", "Time", "Type", "Amount", "Currency", "Status", "Description"].join(",");
      const rows = (items ?? []).map((tx) => {
        const d = new Date(tx.created_at);
        return [
          d.toLocaleDateString("en-US"),
          d.toLocaleTimeString("en-US", { hour12: false }),
          tx.type,
          Number(tx.amount).toFixed(2),
          tx.currency ?? "USD",
          tx.status,
          escape(tx.description ?? ""),
        ].join(",");
      });

      const csv = [header, ...rows].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="cryptovault-transactions.csv"',
      );
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
