import { useEffect, useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEffectiveAdminCode } from "@/lib/admin";

type AdminGateProps = {
  storageKey: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

const AdminGate = ({ storageKey, title, description, children }: AdminGateProps) => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cached = window.sessionStorage.getItem(storageKey);
    setAllowed(cached === "true");
  }, [storageKey]);

  const unlock = () => {
    if (code === getEffectiveAdminCode()) {
      window.sessionStorage.setItem(storageKey, "true");
      window.dispatchEvent(new CustomEvent("void-admin-unlocked", { detail: { storageKey } }));
      setAllowed(true);
      setOpen(false);
      setError("");
      return;
    }

    setError("Wrong admin code");
  };

  if (allowed) {
    return <>{children}</>;
  }

  return (
    <div className="vault-panel p-6 sm:p-8">
      <p className="text-xs uppercase tracking-[0.28em] text-blood-light">Admin only</p>
      <h2 className="mt-3 font-display text-4xl uppercase text-white">{title}</h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">{description}</p>

      {!open ? (
        <div className="mt-8">
          <Button className="rounded-full bg-blood px-8 text-white hover:bg-blood-dark" onClick={() => setOpen(true)}>
            <Lock className="h-4 w-4" />
            Admin access
          </Button>
        </div>
      ) : (
        <div className="mt-8 max-w-md space-y-4">
          <input
            type="password"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Enter admin code"
            className="field-input"
          />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <div className="flex gap-3">
            <Button className="rounded-full bg-blood px-8 text-white hover:bg-blood-dark" onClick={unlock}>
              <ShieldCheck className="h-4 w-4" />
              Unlock
            </Button>
            <Button variant="outline" className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGate;
