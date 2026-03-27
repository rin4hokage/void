import { Link, NavLink } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { CartItem } from "@/lib/cart";
import { formatMoney } from "@/lib/voidSupply";

type SiteHeaderProps = {
  cartItems?: CartItem[];
  cartTotal?: number;
  onRemoveItem?: (id: string) => void;
  checkoutHref?: string;
};

const SiteHeader = ({ cartItems = [], cartTotal = 0, onRemoveItem, checkoutHref = "#" }: SiteHeaderProps) => (
  <header className="header-shell sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
      <div>
        <p className="brand-mark font-display text-2xl uppercase tracking-[0.35em]">VOID</p>
        <p className="text-xs uppercase tracking-[0.3em] text-[#b7c6d3]/70">by ejcertified</p>
      </div>

      <nav className="hidden items-center gap-6 text-sm uppercase tracking-[0.22em] md:flex">
        <NavLink to="/about" className={({ isActive }) => `${isActive ? "font-alt text-[#f5ece6]" : "font-alt text-white/65 hover:text-[#f5ece6]"} transition`}>
          About
        </NavLink>
        <NavLink to="/" end className={({ isActive }) => `${isActive ? "font-alt text-[#f5ece6]" : "font-alt text-white/65 hover:text-[#f5ece6]"} transition`}>
          Beats
        </NavLink>
        <NavLink to="/drumkits" className={({ isActive }) => `${isActive ? "font-alt text-[#f5ece6]" : "font-alt text-white/65 hover:text-[#f5ece6]"} transition`}>
          Drumkits
        </NavLink>
        <NavLink to="/loops" className={({ isActive }) => `${isActive ? "font-alt text-[#f5ece6]" : "font-alt text-white/65 hover:text-[#f5ece6]"} transition`}>
          Loops
        </NavLink>
        <NavLink to="/contact" className={({ isActive }) => `${isActive ? "font-alt text-[#f5ece6]" : "font-alt text-white/65 hover:text-[#f5ece6]"} transition`}>
          Contact
        </NavLink>
      </nav>

      <div className="flex items-center gap-3">
        <Button variant="outline" className="ghost-luxe hidden border-white/15 text-white hover:bg-white/10 md:inline-flex" asChild>
          <Link to="/signin">Sign in</Link>
        </Button>
        <Button variant="outline" className="ghost-luxe hidden border-white/15 text-white hover:bg-white/10 md:inline-flex" asChild>
          <Link to="/signup">Sign up</Link>
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="border-blood/30 bg-[#24303d]/40 text-[#eef3f7] hover:bg-[#425468] hover:text-white">
              <ShoppingBag className="h-4 w-4" />
              Cart {cartItems.length}
            </Button>
          </SheetTrigger>
          <SheetContent className="border-white/10 bg-[#090607] text-white">
            <SheetHeader>
              <SheetTitle className="font-alt text-3xl uppercase text-white">Cart</SheetTitle>
            </SheetHeader>
            <div className="mt-8 flex h-[calc(100vh-10rem)] flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                {cartItems.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/5 p-6 text-sm text-white/55">
                    Your cart is empty.
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-alt text-xl uppercase text-white">{item.title}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/45">{item.subtitle || item.kind}</p>
                        </div>
                        <button className="text-xs uppercase tracking-[0.2em] text-blood-light hover:text-white" onClick={() => onRemoveItem?.(item.id)}>
                          remove
                        </button>
                      </div>
                      <p className="mt-4 font-display text-2xl uppercase text-white">{formatMoney(item.price)}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-6 border-t border-white/10 pt-6">
                <div className="mb-4 flex items-center justify-between text-sm uppercase tracking-[0.22em] text-white/60">
                  <span>Total</span>
                  <span>{formatMoney(cartTotal)}</span>
                </div>
                <Button className="cutout-button w-full rounded-none bg-blood text-white hover:bg-blood-dark" asChild>
                  <Link to={checkoutHref}>Checkout</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
);

export default SiteHeader;
