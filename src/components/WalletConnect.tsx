"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useLaserEyes,
  UNISAT,
  XVERSE,
  LEATHER,
  MAGIC_EDEN,
  OKX,
  PHANTOM,
  WIZZ,
  OYL,
  UnisatLogo,
  XverseLogo,
  LeatherLogo,
  MagicEdenLogo,
  OkxLogo,
  PhantomLogo,
  WizzLogo,
  OylLogo,
  type ProviderType,
} from "@omnisat/lasereyes";

const WALLETS: {
  id: ProviderType;
  name: string;
  Logo: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  has: string;
}[] = [
  { id: XVERSE,     name: "Xverse",     Logo: XverseLogo,    color: "#7c3aed", has: "hasXverse" },
  { id: UNISAT,     name: "Unisat",     Logo: UnisatLogo,    color: "#f97316", has: "hasUnisat" },
  { id: LEATHER,    name: "Leather",    Logo: LeatherLogo,   color: "#fbbf24", has: "hasLeather" },
  { id: MAGIC_EDEN, name: "Magic Eden", Logo: MagicEdenLogo, color: "#e879f9", has: "hasMagicEden" },
  { id: OKX,        name: "OKX",        Logo: OkxLogo,       color: "#e2e8f0", has: "hasOkx" },
  { id: PHANTOM,    name: "Phantom",    Logo: PhantomLogo,   color: "#a78bfa", has: "hasPhantom" },
  { id: WIZZ,       name: "Wizz",       Logo: WizzLogo,      color: "#34d399", has: "hasWizz" },
  { id: OYL,        name: "OYL",        Logo: OylLogo,       color: "#fb923c", has: "hasOyl" },
];

function truncate(addr: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function WalletConnect() {
  const laser = useLaserEyes();
  const {
    connected, isConnecting, address,
    connect, disconnect, provider,
  } = laser;

  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState<ProviderType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (walletId: ProviderType) => {
    setConnecting(walletId);
    setError(null);
    try {
      await connect(walletId);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed");
    } finally {
      setConnecting(null);
    }
  };

  if (connected && address) {
    const connectedWallet = WALLETS.find((w) => w.id === provider);
    return (
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded text-xs border"
          style={{
            background: "rgba(34,197,94,0.08)",
            borderColor: "rgba(34,197,94,0.25)",
            color: "#86efac",
          }}
        >
          {connectedWallet && (
            <connectedWallet.Logo size={14} />
          )}
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono font-bold">{truncate(address)}</span>
        </div>
        <button
          onClick={disconnect}
          className="px-3 py-2 rounded text-xs cursor-pointer transition-opacity hover:opacity-70 border"
          style={{
            background: "rgba(239,68,68,0.08)",
            borderColor: "rgba(239,68,68,0.25)",
            color: "#fca5a5",
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={isConnecting}
        className="flex items-center gap-2 px-4 py-2 text-xs font-black tracking-widest uppercase cursor-pointer transition-all active:scale-95 disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, #f7931a, #c27515)",
          color: "#000",
          clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)",
          boxShadow: "0 0 16px rgba(247,147,26,0.35)",
        }}
      >
        ₿ Connect Wallet
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.75)" }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="w-full max-w-sm rounded-xl overflow-hidden"
                style={{
                  background: "#0d0d14",
                  border: "1px solid rgba(247,147,26,0.2)",
                  boxShadow: "0 0 60px rgba(247,147,26,0.1)",
                }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-5 py-4 border-b"
                  style={{ borderColor: "rgba(247,147,26,0.1)" }}
                >
                  <div>
                    <div className="font-black text-sm tracking-wide" style={{ color: "#e2e8f0" }}>
                      Connect Wallet
                    </div>
                    <div className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: "#475569" }}>
                      Choose your Bitcoin wallet
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-7 h-7 rounded flex items-center justify-center text-lg cursor-pointer hover:opacity-70 transition-opacity"
                    style={{ color: "#64748b" }}
                  >
                    ×
                  </button>
                </div>

                {/* Wallet list */}
                <div className="p-3 space-y-1.5">
                  {WALLETS.map((w) => {
                    const installed = (laser as Record<string, unknown>)[w.has] as boolean;
                    const isThisConnecting = connecting === w.id;

                    return (
                      <button
                        key={w.id}
                        onClick={() => handleConnect(w.id)}
                        disabled={!!connecting}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all active:scale-[0.98] disabled:cursor-not-allowed text-left"
                        style={{
                          background: isThisConnecting
                            ? `${w.color}15`
                            : "rgba(255,255,255,0.03)",
                          border: `1px solid ${isThisConnecting ? `${w.color}44` : "rgba(255,255,255,0.05)"}`,
                        }}
                        onMouseEnter={(e) => {
                          if (!connecting) {
                            (e.currentTarget as HTMLElement).style.background = `${w.color}12`;
                            (e.currentTarget as HTMLElement).style.borderColor = `${w.color}33`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isThisConnecting) {
                            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)";
                          }
                        }}
                      >
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                          {isThisConnecting ? (
                            <div
                              className="w-5 h-5 rounded-full border-2 border-transparent spin-slow"
                              style={{ borderTopColor: w.color }}
                            />
                          ) : (
                            <w.Logo size={28} />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="text-sm font-bold" style={{ color: "#e2e8f0" }}>
                            {w.name}
                          </div>
                          <div className="text-[10px]" style={{ color: installed ? "#22c55e" : "#475569" }}>
                            {isThisConnecting ? "Connecting..." : installed ? "Detected" : "Not installed"}
                          </div>
                        </div>

                        {!installed && !isThisConnecting && (
                          <div className="text-[10px] tracking-widest" style={{ color: "#334155" }}>
                            INSTALL →
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Error */}
                {error && (
                  <div
                    className="mx-3 mb-3 px-3 py-2 rounded text-xs"
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.25)",
                      color: "#fca5a5",
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Footer */}
                <div
                  className="px-5 py-3 border-t text-center"
                  style={{ borderColor: "rgba(247,147,26,0.08)" }}
                >
                  <p className="text-[10px] tracking-wide" style={{ color: "#1e293b" }}>
                    Only connects to your wallet — no private keys stored
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
