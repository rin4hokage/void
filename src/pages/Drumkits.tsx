import SiteHeader from "@/components/SiteHeader";
import { useSharedCart } from "@/hooks/useSharedCart";

const Drumkits = () => {
  const { items, removeItem, total } = useSharedCart();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(97,14,29,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.04),_transparent_20%)]" />
      <div className="pointer-events-none fixed inset-0 noise-overlay opacity-40" />

      <SiteHeader cartItems={items} cartTotal={total} onRemoveItem={removeItem} checkoutHref="/checkout" />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6 lg:px-8 lg:pt-20">
        <section className="vault-panel p-6 sm:p-10">
          <p className="text-xs uppercase tracking-[0.28em] text-blood-light">Drumkits</p>
          <h1 className="mt-4 font-display text-5xl uppercase text-white sm:text-6xl">Drumkits</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/68">
            This section is saved for your future drumkit drops. It stays in the nav now, but there are no products live yet.
          </p>
        </section>
      </main>
    </div>
  );
};

export default Drumkits;
