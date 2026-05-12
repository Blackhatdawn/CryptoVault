import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";

const router = Router();

// GET /api/notifications
router.get(
  "/",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", req.userId!)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      const notifications = (data ?? []).map((n) => ({
        id: n.id,
        type: n.category ?? "system",
        title: n.title,
        message: n.body,
        read: n.is_read,
        createdAt: n.created_at,
      }));

      res.json({
        data: notifications,
        unread: notifications.filter((n) => !n.read).length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// PUT /api/notifications/read-all  (must be BEFORE /:id/read)
router.put(
  "/read-all",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", req.userId!)
        .eq("is_read", false);

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.json({ message: "All notifications marked as read" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// PUT /api/notifications/:id/read
router.put(
  "/:id/read",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", req.params.id)
        .eq("user_id", req.userId!); // scoped to prevent tampering

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.json({ message: "Notification marked as read" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
