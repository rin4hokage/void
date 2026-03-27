import { NavLink } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

type SiteHeaderProps = {
  cartCount?: number;
};

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `transition ${isActive ? "text-white" : "text-white/70 hover:text-white"}`;

const SiteHeader = ({ cartCount = 0 }: SiteHeaderProps) => (
  <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
      <div>
        <p className="font-display text-2xl uppercase tracking-[0.35em] text-white">VOID</p>
        <p className="text-xs uppercase tracking-[0.3em] text-red-300/70">by ejcertified</p>
      </div>

      <nav className="hidden items-center gap-6 text-sm uppercase tracking-[0.22em] md:flex">
        <NavLink to="/" end className={linkClass}>
          Beats
        </NavLink>
        <NavLink to="/artwork" className={linkClass}>
          Artwork
        </NavLink>
        <a href="#checkout" className="text-white/70 hover:text-white">
          Checkout
        </a>
      </nav>

      <div className="flex items-center gap-3">
        <div className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.25em] text-white/70 sm:block">
          cart {cartCount}
        </div>
        <Button variant="outline" className="border-blood/40 bg-blood/10 text-white hover:bg-blood hover:text-white">
          <ShoppingBag className="h-4 w-4" />
          Cart {cartCount}
        </Button>
      </div>
    </div>
  </header>
);

export default SiteHeader;
