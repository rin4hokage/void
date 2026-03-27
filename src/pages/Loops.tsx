import SiteHeader from "@/components/SiteHeader";
import { useSharedCart } from "@/hooks/useSharedCart";

const Loops = () => {
  const { items, removeItem, total } = useSharedCart();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(97,14,29,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.04),_transparent_20%)]" />
      <div className="pointer-events-none fixed inset-0 noise-overlay opacity-40" />

      <SiteHeader cartItems={items} cartTotal={total} onRemoveItem={removeItem} checkoutHref="/checkout" />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6 lg:px-8 lg:pt-20">
        <section className="vault-panel p-6 sm:p-10">
          <p className="text-xs uppercase tracking-[0.28em] text-blood-light">Loops</p>
          <h1 className="mt-4 font-display text-5xl uppercase text-white sm:text-6xl">Loops</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/68">
            This tab is ready for your loop packs and single loops. Once you want to add them, we can build this into its own full product section with previews, tags, and instant checkout.
          </p>
        </section>
      </main>
    </div>
  );
};

export default Loops;
