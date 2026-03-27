import { useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { useSharedCart } from "@/hooks/useSharedCart";
import { getStoredAdminCode, setStoredAdminCode } from "@/lib/admin";

const AdminCode = () => {
  const { items, removeItem, total } = useSharedCart();
  const [adminCode, setAdminCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = getStoredAdminCode();
    if (stored) {
      setAdminCode(stored);
      setConfirmCode(stored);
    }
  }, []);

  const saveCode = () => {
    if (!adminCode.trim()) {
      setMessage("Enter an admin code first.");
      return;
    }

    if (adminCode !== confirmCode) {
      setMessage("Your codes do not match.");
      return;
    }

    setStoredAdminCode(adminCode);
    setMessage("Admin code saved on this device.");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(133,14,29,0.32),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.06),_transparent_25%)]" />
      <div className="pointer-events-none fixed inset-0 noise-overlay opacity-40" />

      <SiteHeader cartItems={items} cartTotal={total} onRemoveItem={removeItem} checkoutHref="/checkout" />

      <main className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6 lg:px-8 lg:pt-20">
        <section className="vault-panel p-6 sm:p-10">
          <p className="text-xs uppercase tracking-[0.28em] text-blood-light">Admin</p>
          <h1 className="mt-3 font-display text-5xl uppercase text-white">Set admin code</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
            Save your private admin code here so the website uses your own code on this device. I can build this flow for you, but I cannot read the value you type here unless you tell me in chat or we later connect a real backend.
          </p>

          <div className="mt-8 grid gap-4">
            <label className="space-y-2 text-sm text-white/70">
              <span>Admin code</span>
              <input
                type="password"
                className="field-input"
                value={adminCode}
                onChange={(event) => setAdminCode(event.target.value)}
                placeholder="Create your private admin code"
              />
            </label>
            <label className="space-y-2 text-sm text-white/70">
              <span>Confirm code</span>
              <input
                type="password"
                className="field-input"
                value={confirmCode}
                onChange={(event) => setConfirmCode(event.target.value)}
                placeholder="Type it again"
              />
            </label>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button className="cutout-button rounded-none bg-blood px-8 text-white hover:bg-blood-dark" onClick={saveCode}>
              Save admin code
            </Button>
            {message ? <p className="text-sm text-white/60">{message}</p> : null}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminCode;
