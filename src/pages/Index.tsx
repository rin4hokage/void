import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  AudioLines,
  CreditCard,
  Disc3,
  Filter,
  Pause,
  Play,
  Skull,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SiteHeader from "@/components/SiteHeader";
import {
  formatMoney,
  hasSeparateBackend,
  licenses,
  paymentConfig,
  pickGeneratedFrequency,
  seedBeats,
  tagOptions,
  type Beat,
  type LicenseTier,
} from "@/lib/voidSupply";
import {
  insertRemoteBeat,
  listRemoteBeats,
  persistStoredBeats,
  persistStoredCart,
  persistStoredLicenses,
  readStoredBeats,
  readStoredCart,
  readStoredLicenses,
  uploadRemoteFile,
} from "@/lib/beatVault";

const Index = () => {
  const [beats, setBeats] = useState<Beat[]>(seedBeats);
  const [activeTag, setActiveTag] = useState("all");
  const [sortOrder, setSortOrder] = useState("featured");
  const [selectedLicenses, setSelectedLicenses] = useState<Record<string, LicenseTier>>({});
  const [cart, setCart] = useState<string[]>([]);
  const [playingBeatId, setPlayingBeatId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [backendStatus, setBackendStatus] = useState(hasSeparateBackend ? "Checking separate backend..." : "Using local browser storage");
  const [uploadForm, setUploadForm] = useState({
    title: "",
    bpm: "",
    key: "",
    price: "",
    mood: "",
    tags: [] as string[],
    artwork: "",
    snippetUrl: "",
  });
  const [uploadFiles, setUploadFiles] = useState<{ artwork?: File; snippet?: File }>({});

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscNodesRef = useRef<OscillatorNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);
  const previewTimeoutRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const filteredBeats = useMemo(() => {
    const next = beats.filter((beat) => activeTag === "all" || beat.tags.includes(activeTag));

    if (sortOrder === "price-low") return [...next].sort((a, b) => a.price - b.price);
    if (sortOrder === "price-high") return [...next].sort((a, b) => b.price - a.price);
    if (sortOrder === "bpm-high") return [...next].sort((a, b) => b.bpm - a.bpm);

    return next;
  }, [activeTag, beats, sortOrder]);

  const cartItems = cart.map((id) => beats.find((beat) => beat.id === id)).filter(Boolean) as Beat[];
  const cartTotal = cartItems.reduce((sum, beat) => {
    const license = licenses.find((item) => item.name === selectedLicenses[beat.id]) ?? licenses[0];
    return sum + beat.price * license.multiplier;
  }, 0);
  const paymentOptions = [
    { label: "Card payments", href: paymentConfig.stripe || "#", active: Boolean(paymentConfig.stripe) },
    { label: "Cash App", href: paymentConfig.cashApp || "#", active: Boolean(paymentConfig.cashApp) },
    { label: "Apple Pay", href: paymentConfig.applePay || paymentConfig.stripe || "#", active: Boolean(paymentConfig.applePay || paymentConfig.stripe) },
    { label: "Google Pay", href: paymentConfig.googlePay || paymentConfig.stripe || "#", active: Boolean(paymentConfig.googlePay || paymentConfig.stripe) },
    { label: "PayPal", href: paymentConfig.paypal || "#", active: Boolean(paymentConfig.paypal) },
    { label: "Bank transfer", href: paymentConfig.bankTransfer || "#", active: Boolean(paymentConfig.bankTransfer) },
  ];

  const stopGeneratedPreview = () => {
    oscNodesRef.current.forEach((node) => node.stop());
    oscNodesRef.current = [];
    gainNodesRef.current.forEach((node) => node.disconnect());
    gainNodesRef.current = [];
  };

  const clearPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    stopGeneratedPreview();

    if (previewTimeoutRef.current) {
      window.clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = null;
    }

    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    setPlayingBeatId(null);
  };

  useEffect(() => () => clearPlayback(), []);

  useEffect(() => {
    const storedBeats = readStoredBeats();
    const storedCart = readStoredCart();
    const storedLicenses = readStoredLicenses() as Record<string, LicenseTier>;

    setBeats(storedBeats);
    setCart(storedCart);
    setSelectedLicenses({
      ...Object.fromEntries(storedBeats.map((beat) => [beat.id, "Basic Lease" as LicenseTier])),
      ...storedLicenses,
    });
  }, []);

  useEffect(() => {
    persistStoredBeats(beats);
  }, [beats]);

  useEffect(() => {
    persistStoredCart(cart);
  }, [cart]);

  useEffect(() => {
    persistStoredLicenses(selectedLicenses);
  }, [selectedLicenses]);

  useEffect(() => {
    if (!hasSeparateBackend) return;

    let active = true;

    listRemoteBeats().then((remoteBeats) => {
      if (!active) return;
      if (remoteBeats && remoteBeats.length) {
        setBeats(remoteBeats);
        setBackendStatus("Connected to separate Supabase project");
      } else {
        setBackendStatus("Separate backend configured, local catalog currently displayed");
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const startProgress = (beatId: string, duration = 30_000) => {
    const startedAt = Date.now();
    setProgress((current) => ({ ...current, [beatId]: 0 }));

    progressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const value = Math.min((elapsed / duration) * 100, 100);
      setProgress((current) => ({ ...current, [beatId]: value }));
    }, 250);
  };

  const handlePreview = async (beat: Beat) => {
    if (playingBeatId === beat.id) {
      clearPlayback();
      return;
    }

    clearPlayback();
    setPlayingBeatId(beat.id);
    startProgress(beat.id);

    if (beat.clipType === "uploaded" && beat.snippetUrl) {
      const audio = new Audio(beat.snippetUrl);
      audioRef.current = audio;
      audio.volume = 0.88;
      audio.play();
      audio.onended = () => clearPlayback();
      return;
    }

    const context = audioContextRef.current ?? new AudioContext();
    audioContextRef.current = context;

    if (context.state === "suspended") {
      await context.resume();
    }

    const master = context.createGain();
    master.gain.value = 0.06;
    master.connect(context.destination);
    gainNodesRef.current.push(master);

    const baseFrequency = pickGeneratedFrequency(beat);
    const lead = context.createOscillator();
    lead.type = "sawtooth";
    lead.frequency.value = baseFrequency;
    lead.connect(master);

    const sub = context.createOscillator();
    sub.type = "triangle";
    sub.frequency.value = baseFrequency / 2;
    sub.connect(master);

    const pulse = context.createOscillator();
    pulse.type = "square";
    pulse.frequency.value = beat.bpm / 2;
    const pulseGain = context.createGain();
    pulseGain.gain.value = 0.02;
    pulse.connect(pulseGain);
    pulseGain.connect(context.destination);

    oscNodesRef.current = [lead, sub, pulse];
    gainNodesRef.current.push(pulseGain);
    lead.start();
    sub.start();
    pulse.start();

    previewTimeoutRef.current = window.setTimeout(() => clearPlayback(), 30_000);
  };

  const handleUploadAsset = (event: React.ChangeEvent<HTMLInputElement>, field: "artwork" | "snippetUrl") => {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setUploadFiles((current) => ({
      ...current,
      [field === "artwork" ? "artwork" : "snippet"]: file,
    }));
    setUploadForm((current) => ({ ...current, [field]: objectUrl }));
  };

  const toggleUploadTag = (tag: string) => {
    setUploadForm((current) => ({
      ...current,
      tags: current.tags.includes(tag)
        ? current.tags.filter((item) => item !== tag)
        : [...current.tags, tag],
    }));
  };

  const addBeatToCatalog = async () => {
    if (!uploadForm.title || !uploadForm.bpm || !uploadForm.key || !uploadForm.price || !uploadForm.artwork) return;

    let artworkUrl = uploadForm.artwork;
    let snippetUrl = uploadForm.snippetUrl || undefined;

    if (hasSeparateBackend && uploadFiles.artwork) {
      const uploadedArtwork = await uploadRemoteFile(`artwork/${Date.now()}-${uploadFiles.artwork.name}`, uploadFiles.artwork);
      if (uploadedArtwork) artworkUrl = uploadedArtwork;
    }

    if (hasSeparateBackend && uploadFiles.snippet) {
      const uploadedSnippet = await uploadRemoteFile(`snippets/${Date.now()}-${uploadFiles.snippet.name}`, uploadFiles.snippet);
      if (uploadedSnippet) snippetUrl = uploadedSnippet;
    }

    const newBeat: Beat = {
      id: `upload-${Date.now()}`,
      title: uploadForm.title,
      bpm: Number(uploadForm.bpm),
      key: uploadForm.key,
      price: Number(uploadForm.price),
      mood: uploadForm.mood || "custom upload",
      tags: uploadForm.tags.length ? uploadForm.tags : ["evil"],
      artwork: artworkUrl,
      snippetUrl,
      clipType: snippetUrl ? "uploaded" : "generated",
    };

    setBeats((current) => [newBeat, ...current]);
    if (hasSeparateBackend) {
      const inserted = await insertRemoteBeat(newBeat);
      setBackendStatus(inserted ? "Separate backend synced" : "Saved locally; remote sync still needs table/storage setup");
    }
    setSelectedLicenses((current) => ({ ...current, [newBeat.id]: "Basic Lease" }));
    setUploadForm({
      title: "",
      bpm: "",
      key: "",
      price: "",
      mood: "",
      tags: [],
      artwork: "",
      snippetUrl: "",
    });
    setUploadFiles({});
  };

  const toggleCart = (beatId: string) => {
    setCart((current) => (current.includes(beatId) ? current.filter((id) => id !== beatId) : [...current, beatId]));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(133,14,29,0.32),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.06),_transparent_25%)]" />
      <div className="pointer-events-none fixed inset-0 noise-overlay opacity-40" />

      <SiteHeader cartCount={cart.length} />

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.35fr,0.65fr] lg:px-8 lg:pb-24 lg:pt-20">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-blood/30 bg-blood/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-blood-light">
              <Skull className="h-3.5 w-3.5" />
              Dark beat store + artwork vault
            </div>

            <div className="space-y-5">
              <h1 className="font-display text-5xl uppercase leading-[0.9] text-white sm:text-6xl lg:text-8xl">
                Underground beats for the ones that want the room colder.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
                Built for rage, alt, distorted melodies, and artwork-heavy drops. Every beat card carries cover art,
                tags, license selection, inline preview, and a buy flow you can wire to real prices later.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button className="bg-blood text-white hover:bg-blood-dark" asChild>
                <a href="#store">
                  Enter Store
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10" asChild>
                <a href="#upload">Upload your own beats</a>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="vault-panel p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">Featured styles</p>
                <p className="mt-3 text-lg uppercase tracking-[0.18em] text-white">rage / bleak / melodic</p>
              </div>
              <div className="vault-panel p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">Functional filters</p>
                <p className="mt-3 text-lg uppercase tracking-[0.18em] text-white">tags + dropdowns live</p>
              </div>
              <div className="vault-panel p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">Payment ready</p>
                <p className="mt-3 text-lg uppercase tracking-[0.18em] text-white">cash app / card / more</p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/65">
              Backend status: <span className="text-white">{backendStatus}</span>
            </div>
          </div>

          <aside className="vault-panel overflow-hidden">
            <img
              src="https://i.pinimg.com/736x/c8/55/c9/c855c9672d6cd0b33209e77617e3dc78.jpg"
              alt="Dark inspiration collage"
              className="h-[26rem] w-full object-cover object-center opacity-80"
            />
            <div className="space-y-4 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-blood-light">Visual direction</p>
              <p className="text-sm leading-6 text-white/70">
                Cold portrait art, red eyes, black metal textures, eerie photography, and distressed poster energy pulled
                from your Pinterest references.
              </p>
              <div className="flex flex-wrap gap-2">
                {["grunge", "blood red", "portrait art", "dark anime", "distortion"].map((item) => (
                  <Badge key={item} variant="outline" className="border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/75">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8" id="store">
          <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-blood-light">Beats</p>
              <h2 className="font-display text-4xl uppercase text-white sm:text-5xl">Beat catalog</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[32rem]">
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.26em] text-white/45">
                  <Filter className="h-3.5 w-3.5" />
                  Filter by tag
                </p>
                <Select value={activeTag} onValueChange={setActiveTag}>
                  <SelectTrigger className="border-white/10 bg-white/5 text-white">
                    <SelectValue placeholder="Choose a tag" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#120b0d] text-white">
                    <SelectItem value="all">All tags</SelectItem>
                    {tagOptions.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.26em] text-white/45">Sort catalog</p>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="border-white/10 bg-white/5 text-white">
                    <SelectValue placeholder="Featured" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#120b0d] text-white">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: low to high</SelectItem>
                    <SelectItem value="price-high">Price: high to low</SelectItem>
                    <SelectItem value="bpm-high">BPM: highest first</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            <button onClick={() => setActiveTag("all")} className={`tag-pill ${activeTag === "all" ? "tag-pill-active" : ""}`}>
              all
            </button>
            {tagOptions.map((tag) => (
              <button key={tag} onClick={() => setActiveTag(tag)} className={`tag-pill ${activeTag === tag ? "tag-pill-active" : ""}`}>
                {tag}
              </button>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredBeats.map((beat) => {
              const activeLicense = selectedLicenses[beat.id] ?? "Basic Lease";
              const totalPrice = beat.price * (licenses.find((item) => item.name === activeLicense)?.multiplier ?? 1);
              const isInCart = cart.includes(beat.id);
              const isPlaying = playingBeatId === beat.id;

              return (
                <article key={beat.id} className="vault-panel overflow-hidden">
                  <div className="relative">
                    <img src={beat.artwork} alt={beat.title} className="h-64 w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-blood-light">{beat.mood}</p>
                        <h3 className="font-display text-3xl uppercase text-white">{beat.title}</h3>
                      </div>
                      <button onClick={() => handlePreview(beat)} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white transition hover:border-blood hover:bg-blood">
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-0.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-5 p-5">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/55">
                      <span>{beat.bpm} BPM</span>
                      <span>{beat.key}</span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-blood-dark via-blood to-white/90 transition-all" style={{ width: `${progress[beat.id] ?? 0}%` }} />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {beat.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/80">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div>
                      <p className="mb-2 text-xs uppercase tracking-[0.26em] text-white/45">License</p>
                      <Select value={activeLicense} onValueChange={(value: LicenseTier) => setSelectedLicenses((current) => ({ ...current, [beat.id]: value }))}>
                        <SelectTrigger className="border-white/10 bg-white/5 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-[#120b0d] text-white">
                          {licenses.map((license) => (
                            <SelectItem key={license.name} value={license.name}>
                              {license.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="mt-2 text-sm text-white/55">
                        {licenses.find((item) => item.name === activeLicense)?.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-white/45">Current price</p>
                        <p className="font-display text-3xl uppercase text-white">{formatMoney(totalPrice)}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => handlePreview(beat)}>
                          <AudioLines className="h-4 w-4" />
                          30 sec
                        </Button>
                        <Button className="bg-blood text-white hover:bg-blood-dark" onClick={() => toggleCart(beat.id)}>
                          {isInCart ? "Added" : "Buy now"}
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm leading-6 text-white/50">
                      {beat.clipType === "uploaded"
                        ? "Uploaded snippet ready for playback."
                        : "Synthetic preview is active for the mock catalog until you replace it with your real 30-second snippets."}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8" id="upload">
          <div className="vault-panel p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-blood-light">Upload beats</p>
            <h2 className="mt-3 font-display text-4xl uppercase text-white">Add your own beats yourself</h2>
            <p className="mt-4 text-sm leading-7 text-white/70">
              This first version stores uploads in the browser session so you can test the flow right now. Later, we can
              connect this to real storage, real checkout, and a live admin panel.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-white/70">
                <span>Beat title</span>
                <input value={uploadForm.title} onChange={(event) => setUploadForm((current) => ({ ...current, title: event.target.value }))} className="field-input" placeholder="Midnight Relay" />
              </label>
              <label className="space-y-2 text-sm text-white/70">
                <span>Mood</span>
                <input value={uploadForm.mood} onChange={(event) => setUploadForm((current) => ({ ...current, mood: event.target.value }))} className="field-input" placeholder="evil melodic" />
              </label>
              <label className="space-y-2 text-sm text-white/70">
                <span>BPM</span>
                <input value={uploadForm.bpm} onChange={(event) => setUploadForm((current) => ({ ...current, bpm: event.target.value }))} className="field-input" placeholder="148" />
              </label>
              <label className="space-y-2 text-sm text-white/70">
                <span>Key</span>
                <input value={uploadForm.key} onChange={(event) => setUploadForm((current) => ({ ...current, key: event.target.value }))} className="field-input" placeholder="F Minor" />
              </label>
              <label className="space-y-2 text-sm text-white/70">
                <span>Base price</span>
                <input value={uploadForm.price} onChange={(event) => setUploadForm((current) => ({ ...current, price: event.target.value }))} className="field-input" placeholder="40" />
              </label>
              <label className="space-y-2 text-sm text-white/70">
                <span>Artwork image</span>
                <div className="field-input flex items-center justify-between gap-3">
                  <span className="truncate text-white/55">{uploadForm.artwork ? "Artwork loaded" : "Upload JPG/PNG"}</span>
                  <input type="file" accept="image/*" onChange={(event) => handleUploadAsset(event, "artwork")} className="max-w-[12rem] text-xs text-white/60 file:mr-3 file:rounded-full file:border-0 file:bg-blood/20 file:px-3 file:py-2 file:text-white" />
                </div>
              </label>
            </div>

            <label className="mt-4 block space-y-2 text-sm text-white/70">
              <span>30-second snippet</span>
              <div className="field-input flex items-center justify-between gap-3">
                <span className="truncate text-white/55">{uploadForm.snippetUrl ? "Snippet ready" : "Upload MP3/WAV or use generated placeholder preview"}</span>
                <input type="file" accept="audio/*" onChange={(event) => handleUploadAsset(event, "snippetUrl")} className="max-w-[12rem] text-xs text-white/60 file:mr-3 file:rounded-full file:border-0 file:bg-blood/20 file:px-3 file:py-2 file:text-white" />
              </div>
            </label>

            <div className="mt-5">
              <p className="mb-3 text-sm text-white/70">Tags</p>
              <div className="flex flex-wrap gap-2">
                {tagOptions.map((tag) => (
                  <button key={tag} onClick={() => toggleUploadTag(tag)} className={`tag-pill ${uploadForm.tags.includes(tag) ? "tag-pill-active" : ""}`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button className="bg-blood text-white hover:bg-blood-dark" onClick={addBeatToCatalog}>
                <Upload className="h-4 w-4" />
                Add beat to catalog
              </Button>
              <p className="text-sm text-white/50">Required for now: title, BPM, key, price, and artwork.</p>
            </div>
            <p className="mt-4 text-sm text-white/50">
              {hasSeparateBackend
                ? "Separate backend env vars are present, so uploads will try to sync there too."
                : "No separate backend env vars yet, so uploads save locally in this browser for now."}
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-24 sm:px-6 lg:grid-cols-[0.8fr,1.2fr] lg:px-8" id="checkout">
          <div className="vault-panel p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-blood-light">Payments</p>
            <h2 className="mt-3 font-display text-4xl uppercase text-white">All main options staged</h2>
            <div className="mt-6 grid gap-3">
              {paymentOptions.map((option) => (
                <a key={option.label} href={option.href} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/20 hover:bg-white/10">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-blood-light" />
                    <span className="text-sm uppercase tracking-[0.18em] text-white">{option.label}</span>
                  </div>
                  <span className={`text-xs uppercase tracking-[0.18em] ${option.active ? "text-blood-light" : "text-white/45"}`}>
                    {option.active ? "linked" : "add url"}
                  </span>
                </a>
              ))}
            </div>
            <p className="mt-6 text-sm leading-7 text-white/60">
              Right now this is UI-first, exactly like you asked. We can wire Stripe, Cash App instructions, PayPal, or
              a fuller checkout flow once you’re ready for prices and payments.
            </p>
          </div>

          <div className="vault-panel p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-blood-light">Cart + checkout</p>
                <h2 className="mt-3 font-display text-4xl uppercase text-white">Current order</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/60">
                {cartItems.length} items
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {cartItems.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/5 p-8 text-center text-sm leading-7 text-white/55">
                  Your cart is empty right now. Add beats from the catalog and this panel will total the selected license
                  prices automatically.
                </div>
              ) : (
                cartItems.map((beat) => {
                  const license = selectedLicenses[beat.id] ?? "Basic Lease";
                  const lineTotal = beat.price * (licenses.find((item) => item.name === license)?.multiplier ?? 1);

                  return (
                    <div key={beat.id} className="flex items-center gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-3">
                      <img src={beat.artwork} alt={beat.title} className="h-20 w-20 rounded-2xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-2xl uppercase text-white">{beat.title}</p>
                        <p className="text-sm uppercase tracking-[0.18em] text-white/50">{license}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-2xl uppercase text-white">{formatMoney(lineTotal)}</p>
                        <button onClick={() => toggleCart(beat.id)} className="text-xs uppercase tracking-[0.2em] text-blood-light hover:text-white">
                          remove
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-8 rounded-[2rem] border border-white/10 bg-black/35 p-6">
              <div className="flex items-center justify-between text-sm uppercase tracking-[0.22em] text-white/60">
                <span>Estimated total</span>
                <span>{formatMoney(cartTotal)}</span>
              </div>
              <Button className="mt-5 w-full bg-blood text-white hover:bg-blood-dark" asChild>
                <a href={paymentConfig.stripe || paymentConfig.cashApp || paymentConfig.paypal || "#"} target="_blank" rel="noreferrer">
                  <Disc3 className="h-4 w-4" />
                  Checkout placeholder
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
