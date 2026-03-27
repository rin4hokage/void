import { useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { useSharedCart } from "@/hooks/useSharedCart";

const SignIn = () => {
  const { items, removeItem, total } = useSharedCart();
  const [form, setForm] = useState({ email: "", password: "" });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(133,14,29,0.32),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.06),_transparent_25%)]" />
      <div className="pointer-events-none fixed inset-0 noise-overlay opacity-40" />

      <SiteHeader cartItems={items} cartTotal={total} onRemoveItem={removeItem} checkoutHref="/checkout" />

      <main className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6 lg:px-8 lg:pt-20">
        <section className="vault-panel p-6 sm:p-10">
          <p className="text-xs uppercase tracking-[0.28em] text-blood-light">Account</p>
          <h1 className="mt-3 font-display text-5xl uppercase text-white">Sign in</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">
            This page is staged for your future customer accounts. Right now it is UI-only so we can lock in the layout first.
          </p>

          <div className="mt-8 grid gap-4">
            <label className="space-y-2 text-sm text-white/70">
              <span>Email</span>
              <input
                className="field-input"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="you@example.com"
              />
            </label>
            <label className="space-y-2 text-sm text-white/70">
              <span>Password</span>
              <input
                type="password"
                className="field-input"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Password"
              />
            </label>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button className="cutout-button rounded-none bg-blood px-8 text-white hover:bg-blood-dark">
              Sign in
            </Button>
            <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10" asChild>
              <Link to="/signup">Create account</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SignIn;
