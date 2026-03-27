import { CreditCard, Disc3 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { paymentConfig, formatMoney } from "@/lib/voidSupply";
import { useSharedCart } from "@/hooks/useSharedCart";

const paymentOptions = [
  { label: "Card payments", href: paymentConfig.stripe || "#", active: Boolean(paymentConfig.stripe) },
  { label: "Cash App", href: paymentConfig.cashApp || "#", active: Boolean(paymentConfig.cashApp) },
  { label: "Apple Pay", href: paymentConfig.applePay || paymentConfig.stripe || "#", active: Boolean(paymentConfig.applePay || paymentConfig.stripe) },
  { label: "Google Pay", href: paymentConfig.googlePay || paymentConfig.stripe || "#", active: Boolean(paymentConfig.googlePay || paymentConfig.stripe) },
  { label: "PayPal", href: paymentConfig.paypal || "#", active: Boolean(paymentConfig.paypal) },
  { label: "Bank transfer", href: paymentConfig.bankTransfer || "#", active: Boolean(paymentConfig.bankTransfer) },
];

const Checkout = () => {
  const { items, removeItem, total } = useSharedCart();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(133,14,29,0.32),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.06),_transparent_25%)]" />
      <div className="pointer-events-none fixed inset-0 noise-overlay opacity-40" />

      <SiteHeader
        cartItems={items}
        cartTotal={total}
        onRemoveItem={removeItem}
        checkoutHref="/checkout"
      />

      <main className="mx-auto grid max-w-7xl gap-6 px-4 pb-24 pt-12 sm:px-6 lg:grid-cols-[0.8fr,1.2fr] lg:px-8 lg:pt-20">
        <section className="vault-panel p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-blood-light">Payments</p>
          <h1 className="font-display mt-3 text-4xl uppercase text-white">Checkout</h1>

          <div className="mt-6 grid gap-3">
            {paymentOptions.map((option) => (
              <a
                key={option.label}
                href={option.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/20 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-blood-light" />
                  <span className="text-sm uppercase tracking-[0.18em] text-white">{option.label}</span>
                </div>
                <span className={`text-xs uppercase tracking-[0.18em] ${option.active ? "text-blood-light" : "text-white/45"}`}>
                  {option.active ? "ready" : "add url"}
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="vault-panel p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-blood-light">Cart + checkout</p>
              <h2 className="mt-3 font-display text-4xl uppercase text-white">Current order</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/60">
              {items.length} items
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {items.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/5 p-8 text-center text-sm leading-7 text-white/55">
                Your cart is empty right now.
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-3">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 text-[10px] uppercase tracking-[0.24em] text-white/30">
                    {item.kind}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-2xl uppercase text-white">{item.title}</p>
                    <p className="text-sm uppercase tracking-[0.18em] text-white/50">{item.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl uppercase text-white">{formatMoney(item.price)}</p>
                    <button onClick={() => removeItem(item.id)} className="text-xs uppercase tracking-[0.2em] text-blood-light hover:text-white">
                      remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 rounded-[2rem] border border-white/10 bg-black/35 p-6">
            <div className="flex items-center justify-between text-sm uppercase tracking-[0.22em] text-white/60">
              <span>Estimated total</span>
              <span>{formatMoney(total)}</span>
            </div>
            <Button className="cutout-button mt-5 w-full rounded-none bg-blood text-white hover:bg-blood-dark" asChild>
              <a href={paymentConfig.stripe || paymentConfig.cashApp || paymentConfig.paypal || "#"} target="_blank" rel="noreferrer">
                <Disc3 className="h-4 w-4" />
                Checkout
              </a>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Checkout;
