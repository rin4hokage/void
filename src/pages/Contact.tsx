import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { useSharedCart } from "@/hooks/useSharedCart";

const Contact = () => {
  const { items, removeItem, total } = useSharedCart();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(133,14,29,0.32),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.06),_transparent_25%)]" />
      <div className="pointer-events-none fixed inset-0 noise-overlay opacity-40" />

      <SiteHeader cartItems={items} cartTotal={total} onRemoveItem={removeItem} checkoutHref="/checkout" />

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-12 sm:px-6 lg:px-8 lg:pt-20">
        <section className="py-10 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-blood-light">Contact</p>
          <h1 className="mt-4 font-display text-6xl uppercase text-white">Contact</h1>
        </section>

        <section className="vault-panel p-6 sm:p-10">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-3 text-sm text-white/70">
              <span className="text-xs uppercase tracking-[0.26em] text-white">Your name</span>
              <input
                className="field-input rounded-none border-x-0 border-t-0 bg-transparent px-0"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder=""
              />
            </label>
            <label className="space-y-3 text-sm text-white/70">
              <span className="text-xs uppercase tracking-[0.26em] text-white">E-mail address</span>
              <input
                className="field-input rounded-none border-x-0 border-t-0 bg-transparent px-0"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder=""
              />
            </label>
          </div>

          <div className="mt-8 space-y-8">
            <label className="space-y-3 text-sm text-white/70">
              <span className="text-xs uppercase tracking-[0.26em] text-white">Subject</span>
              <input
                className="field-input rounded-none border-x-0 border-t-0 bg-transparent px-0"
                value={form.subject}
                onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                placeholder=""
              />
            </label>
            <label className="space-y-3 text-sm text-white/70">
              <span className="text-xs uppercase tracking-[0.26em] text-white">Message</span>
              <textarea
                className="field-input min-h-32 rounded-none border-x-0 border-t-0 bg-transparent px-0"
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              />
            </label>
          </div>

          <div className="mt-10 flex justify-end">
            <Button className="cutout-button rounded-none bg-[#e8e2db] px-8 text-black hover:bg-white">
              Send message
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;
