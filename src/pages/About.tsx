import SiteHeader from "@/components/SiteHeader";
import { useSharedCart } from "@/hooks/useSharedCart";

const About = () => {
  const { items, removeItem, total } = useSharedCart();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(133,14,29,0.32),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.06),_transparent_25%)]" />
      <div className="pointer-events-none fixed inset-0 noise-overlay opacity-40" />

      <SiteHeader cartItems={items} cartTotal={total} onRemoveItem={removeItem} checkoutHref="/checkout" />

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-12 sm:px-6 lg:px-8 lg:pt-20">
        <section className="vault-panel p-6 sm:p-10">
          <p className="text-xs uppercase tracking-[0.28em] text-blood-light">About</p>
          <h1 className="mt-4 font-display text-6xl uppercase text-white">Void</h1>
          <div className="mt-8 space-y-6 text-base leading-8 text-white/72">
            <p>
              VOID is the storefront for ejcertified beats, artwork, and dark alt digital pieces. The direction stays cold, minimal, and direct, but the experience is being shaped to feel more premium and intentional.
            </p>
            <p>
              This site is built for beat previews, artwork drops, future drumkits, and a cleaner buying flow. It is still evolving, but the goal is simple: make the catalog feel sharp, easy to browse, and unmistakably yours.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
