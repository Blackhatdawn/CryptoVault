import { Router, Request, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { supabase, supabaseAuth } from "../lib/supabase.js";

const router = Router();

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
router.post(
  "/signup",
  authLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, fullName } = req.body;

      if (!email || !password || !fullName) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }
      if (password.length < 8) {
        res
          .status(400)
          .json({ error: "Password must be at least 8 characters" });
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ error: "Invalid email address" });
        return;
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // auto-confirm so users can sign in immediately
        });

      if (authError) {
        const isDuplicate =
          authError.message.toLowerCase().includes("already") ||
          authError.message.toLowerCase().includes("exists");
        res.status(isDuplicate ? 409 : 400).json({
          error: isDuplicate
            ? "An account with this email already exists"
            : authError.message,
        });
        return;
      }

      const userId = authData.user.id;

      // Create profile row (wallet auto-created by DB trigger)
      await supabase.from("user_profiles").insert({
        id: userId,
        email,
        display_name: fullName,
      });

      // Sign in to get session tokens
      const { data: sessionData, error: signInError } =
        await supabaseAuth.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError || !sessionData.session) {
        // Account created but auto sign-in failed — user can still log in manually
        res.status(201).json({
          user: {
            id: userId,
            email,
            name: fullName,
            email_verified: true,
            kyc_verified: false,
          },
          tokens: null,
          message: "Account created. Please sign in.",
        });
        return;
      }

      res.status(201).json({
        user: {
          id: userId,
          email,
          name: fullName,
          email_verified: true,
          kyc_verified: false,
        },
        tokens: {
          access_token: sessionData.session.access_token,
          refresh_token: sessionData.session.refresh_token,
          token_type: "Bearer",
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post(
  "/login",
  authLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: "Email and password required" });
        return;
      }

      const { data, error } = await supabaseAuth.auth.signInWithPassword({
        email,
        password,
      });
      if (error || !data.session) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Fetch profile for user metadata
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("display_name, kyc_verified, avatar_url, phone")
        .eq("id", data.user.id)
        .single();

      res.json({
        user: {
          id: data.user.id,
          email: data.user.email ?? email,
          name: profile?.display_name ?? email,
          email_verified: data.user.email_confirmed_at != null,
          kyc_verified: profile?.kyc_verified ?? false,
          avatar_url: profile?.avatar_url ?? null,
          phone: profile?.phone ?? null,
        },
        tokens: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          token_type: "Bearer",
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
router.post("/refresh", async (req: Request, res: Response): Promise<void> => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      res.status(401).json({ error: "Refresh token required" });
      return;
    }

    const { data, error } = await supabaseAuth.auth.refreshSession({
      refresh_token,
    });
    if (error || !data.session) {
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }

    res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      token_type: "Bearer",
    });
  } catch (error: any) {
    res.status(401).json({ error: "Token refresh failed" });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get(
  "/me",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select(
          "id, email, display_name, phone, avatar_url, kyc_verified, created_at",
        )
        .eq("id", req.userId!)
        .single();

      if (error || !profile) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json({
        id: profile.id,
        email: profile.email,
        name: profile.display_name,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        email_verified: req.user?.email_confirmed_at != null,
        kyc_verified: profile.kyc_verified ?? false,
        created_at: profile.created_at,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post(
  "/logout",
  authMiddleware,
  async (_req: AuthRequest, res: Response): Promise<void> => {
    // Supabase tokens are stateless JWTs — the client should discard them.
    // We return success regardless.
    res.json({ message: "Logged out successfully" });
  },
);

// ─── PUT /api/auth/profile ────────────────────────────────────────────────────
router.put(
  "/profile",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, phone, avatar_url } = req.body;
      const updates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (name !== undefined) updates.display_name = name;
      if (phone !== undefined) updates.phone = phone;
      if (avatar_url !== undefined) updates.avatar_url = avatar_url;

      const { data: profile, error } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("id", req.userId!)
        .select()
        .single();

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      res.json({
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.display_name,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
          kyc_verified: profile.kyc_verified ?? false,
          email_verified: true,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ─── PUT /api/auth/password ───────────────────────────────────────────────────
router.put(
  "/password",
  authLimiter,
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        res
          .status(400)
          .json({ error: "currentPassword and newPassword are required" });
        return;
      }
      if (newPassword.length < 8) {
        res
          .status(400)
          .json({ error: "New password must be at least 8 characters" });
        return;
      }

      // Verify current password
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("email")
        .eq("id", req.userId!)
        .single();
      if (!profile) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const { error: verifyError } = await supabaseAuth.auth.signInWithPassword(
        {
          email: profile.email,
          password: currentPassword,
        },
      );
      if (verifyError) {
        res.status(401).json({ error: "Current password is incorrect" });
        return;
      }

      // Update password via admin
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        req.userId!,
        {
          password: newPassword,
        },
      );
      if (updateError) {
        res.status(500).json({ error: updateError.message });
        return;
      }

      res.json({ message: "Password updated successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
