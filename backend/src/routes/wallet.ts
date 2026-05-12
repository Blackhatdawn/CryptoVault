import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";

const router = Router();

// ─── GET /api/wallet/balance ──────────────────────────────────────────────────
router.get(
  "/balance",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      let { data: wallet, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", req.userId!)
        .single();

      if (error || !wallet) {
        // Wallet not yet created — create it now (trigger may have missed)
        const { data: newWallet } = await supabase
          .from("wallets")
          .insert({
            user_id: req.userId,
            currency: "USD",
            balance: 0,
            locked_balance: 0,
          })
          .select()
          .single();
        wallet = newWallet;
      }

      const bal = Number(wallet?.balance ?? 0);
      const locked = Number(wallet?.locked_balance ?? 0);

      res.json({
        user_id: req.userId,
        balance: bal,
        total_usd: bal,
        available_usd: Math.max(bal - locked, 0),
        locked_usd: locked,
        currency: wallet?.currency ?? "USD",
        updated_at: wallet?.updated_at ?? new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ─── POST /api/wallet/deposit/create ─────────────────────────────────────────
router.post(
  "/deposit/create",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { amount, currency = "USD", pay_currency = "BTC" } = req.body;
      if (!amount || Number(amount) <= 0) {
        res.status(400).json({ error: "A valid amount is required" });
        return;
      }
      if (Number(amount) < 10) {
        res.status(400).json({ error: "Minimum deposit amount is $10.00" });
        return;
      }

      const depositId = uuidv4();
      const payCur = String(pay_currency).toUpperCase();
      const mockAddress = `${payCur.toLowerCase()}1q${Math.random().toString(36).substring(2, 18)}`;
      // Rough mock conversion: 1 BTC ≈ 45 000 USD, etc.
      const rates: Record<string, number> = {
        BTC: 45000,
        ETH: 2800,
        USDT: 1,
        USDC: 1,
        BNB: 600,
        SOL: 180,
      };
      const rate = rates[payCur] ?? 1;
      const payAmount = (Number(amount) / rate).toFixed(8);

      // Record a pending deposit transaction
      await supabase.from("transactions").insert({
        user_id: req.userId,
        type: "deposit",
        amount: Number(amount),
        currency,
        status: "pending",
        description: `Deposit via ${payCur}`,
        metadata: {
          deposit_id: depositId,
          pay_currency: payCur,
          pay_address: mockAddress,
        },
      });

      res.status(201).json({
        order_id: depositId,
        payment_id: depositId,
        pay_address: mockAddress,
        pay_amount: payAmount,
        pay_currency: payCur,
        price_amount: Number(amount),
        price_currency: currency,
        payment_url: `https://pay.cryptovaultpro.finance/${depositId}`,
        status: "pending",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ─── POST /api/wallet/withdraw ────────────────────────────────────────────────
router.post(
  "/withdraw",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { amount, address, currency = "USD", network } = req.body;
      if (!amount || !address) {
        res.status(400).json({ error: "amount and address are required" });
        return;
      }

      // Check balance
      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", req.userId!)
        .single();

      if (!wallet || Number(wallet.balance) < Number(amount)) {
        res.status(400).json({ error: "Insufficient balance" });
        return;
      }

      // Deduct balance
      await supabase
        .from("wallets")
        .update({ balance: Number(wallet.balance) - Number(amount) })
        .eq("user_id", req.userId!);

      // Record withdrawal transaction
      const { data: tx } = await supabase
        .from("transactions")
        .insert({
          user_id: req.userId,
          type: "withdrawal",
          amount: Number(amount),
          currency,
          status: "processing",
          description: `Withdrawal to ${String(address).slice(0, 10)}...`,
          to_address: address,
          metadata: { network: network ?? "mainnet" },
        })
        .select()
        .single();

      res.json({
        id: tx!.id,
        amount: Number(amount),
        address,
        status: "processing",
        estimatedTime: "2-3 business days",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ─── POST /api/wallet/transfer ────────────────────────────────────────────────
router.post(
  "/transfer",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { recipient_email, amount, currency = "USD", note } = req.body;
      if (!recipient_email || !amount) {
        res
          .status(400)
          .json({ error: "recipient_email and amount are required" });
        return;
      }
      if (Number(amount) <= 0) {
        res.status(400).json({ error: "Amount must be greater than 0" });
        return;
      }

      // Verify sender balance
      const { data: senderWallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", req.userId!)
        .single();
      if (!senderWallet || Number(senderWallet.balance) < Number(amount)) {
        res.status(400).json({ error: "Insufficient balance" });
        return;
      }

      // Look up recipient
      const { data: recipient } = await supabase
        .from("user_profiles")
        .select("id, display_name, email")
        .eq("email", recipient_email)
        .single();
      if (!recipient) {
        res
          .status(404)
          .json({ error: "Recipient not found. Check the email address." });
        return;
      }
      if (recipient.id === req.userId) {
        res.status(400).json({ error: "Cannot transfer funds to yourself" });
        return;
      }

      // Get recipient wallet
      const { data: recipientWallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", recipient.id)
        .single();

      const amt = Number(amount);

      // Atomic-ish balance update (replace with DB function in production)
      await Promise.all([
        supabase
          .from("wallets")
          .update({ balance: Number(senderWallet.balance) - amt })
          .eq("user_id", req.userId!),
        recipientWallet
          ? supabase
              .from("wallets")
              .update({ balance: Number(recipientWallet.balance) + amt })
              .eq("user_id", recipient.id)
          : supabase
              .from("wallets")
              .insert({
                user_id: recipient.id,
                currency,
                balance: amt,
                locked_balance: 0,
              }),
      ]);

      // Record transactions for both parties
      const [{ data: senderTx }] = await Promise.all([
        supabase
          .from("transactions")
          .insert({
            user_id: req.userId,
            type: "transfer_sent",
            amount: amt,
            currency,
            status: "completed",
            description: `Transfer to ${recipient.display_name ?? recipient_email}`,
            metadata: {
              recipient_email,
              recipient_id: recipient.id,
              note: note ?? null,
            },
          })
          .select()
          .single(),
        supabase.from("transactions").insert({
          user_id: recipient.id,
          type: "transfer_received",
          amount: amt,
          currency,
          status: "completed",
          description: "Transfer received",
          metadata: { sender_user_id: req.userId, note: note ?? null },
        }),
      ]);

      // Notify recipient
      await supabase.from("notifications").insert({
        user_id: recipient.id,
        title: "Transfer Received 💰",
        body: `You received $${amt.toFixed(2)} ${currency}`,
        category: "transaction",
      });

      res.json({
        id: senderTx?.id,
        amount: amt,
        recipient_email,
        status: "completed",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
