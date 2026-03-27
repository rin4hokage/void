import { Upload } from "lucide-react";
import AdminGate from "@/components/AdminGate";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { useSharedCart } from "@/hooks/useSharedCart";

const artworkSamples = [
  "https://i.pinimg.com/736x/de/ec/31/deec31ca2ff0fef15620bf8851075203.jpg",
  "https://i.pinimg.com/736x/33/78/bd/3378bdfc8c8e634d5f40cfd3bd23841c.jpg",
  "https://i.pinimg.com/736x/91/82/69/91826951e229207d8a9d9316f96c6173.jpg",
  "https://i.pinimg.com/736x/c8/55/c9/c855c9672d6cd0b33209e77617e3dc78.jpg",
];

const Artwork = () => {
  const { items, addItem, removeItem, total } = useSharedCart();

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

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 lg:px-8 lg:pt-20">
        <section className="grid gap-8 lg:grid-cols-[1fr,0.8fr]">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.28em] text-blood-light">Artwork</p>
            <h1 className="font-alt text-5xl uppercase leading-[0.9] text-white sm:text-6xl">
              Visuals for covers, drops, and the full Void world.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-white/70">
              This page is for your artwork only. We can turn this into a dedicated gallery, merch lane, or cover-art
              store later, but for now it gives you a separate page and a separate upload zone.
            </p>
          </div>

          <AdminGate
            storageKey="void-admin-artwork"
            title="Artwork upload"
            description="This upload area is hidden from regular visitors. Unlock it only when you want to add your own artwork."
          >
            <div className="vault-panel p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.28em] text-blood-light">Upload artwork</p>
              <h2 className="font-alt mt-3 text-4xl uppercase text-white">Private artist-side section</h2>
              <p className="mt-4 text-sm leading-7 text-white/70">
                This section is for your uploads only and stays hidden until you unlock it.
              </p>

              <div className="mt-8 grid gap-4">
                <label className="space-y-2 text-sm text-white/70">
                  <span>Artwork title</span>
                  <input className="field-input" placeholder="Void cover 01" />
                </label>
                <label className="space-y-2 text-sm text-white/70">
                  <span>Category</span>
                  <input className="field-input" placeholder="cover art / poster / merch" />
                </label>
                <label className="space-y-2 text-sm text-white/70">
                  <span>Image file</span>
                  <div className="field-input flex items-center justify-between gap-3">
                    <span className="truncate text-white/55">Upload JPG/PNG/WebP</span>
                    <input type="file" accept="image/*" className="max-w-[12rem] text-xs text-white/60 file:mr-3 file:rounded-full file:border-0 file:bg-blood/20 file:px-3 file:py-2 file:text-white" />
                  </div>
                </label>
              </div>

              <div className="mt-8">
                <Button className="cutout-button rounded-none bg-blood px-8 text-white hover:bg-blood-dark">
                  <Upload className="h-4 w-4" />
                  Upload artwork
                </Button>
              </div>
            </div>
          </AdminGate>
        </section>

        <section className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {artworkSamples.map((src) => (
            <article key={src} className="vault-panel overflow-hidden p-3">
              <img src={src} alt="Void artwork sample" className="h-80 w-full object-cover" />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="font-display text-2xl uppercase text-white">$25</p>
                <Button
                  className="buy-button cutout-button rounded-none bg-blood text-white hover:bg-blood-dark"
                  onClick={() =>
                    addItem({
                      id: `art-${src}`,
                      title: "Void artwork",
                      kind: "artwork",
                      price: 25,
                      subtitle: "artwork",
                      image: src,
                    })
                  }
                >
                  Buy now
                </Button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Artwork;
