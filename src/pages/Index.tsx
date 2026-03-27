import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Filter, Pause, Play, Search, Skull, Upload } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import AdminGate from "@/components/AdminGate";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSharedCart } from "@/hooks/useSharedCart";
import {
  formatMoney,
  hasSeparateBackend,
  licenses,
  pickGeneratedFrequency,
  seedBeats,
  tagOptions,
  type Beat,
  type LicenseTier,
} from "@/lib/voidSupply";
import {
  insertRemoteBeat,
  persistStoredBeats,
  persistStoredLicenses,
  readStoredBeats,
  uploadRemoteFile,
} from "@/lib/beatVault";

const Index = () => {
  const [beats, setBeats] = useState<Beat[]>(seedBeats);
  const [activeTag, setActiveTag] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bpmFilter, setBpmFilter] = useState("all");
  const [sortMode, setSortMode] = useState("default");
  const [beatsAdminUnlocked, setBeatsAdminUnlocked] = useState(false);
  const [selectedLicenses, setSelectedLicenses] = useState<Record<string, LicenseTier>>({});
  const [playingBeatId, setPlayingBeatId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [backendStatus, setBackendStatus] = useState(
    hasSeparateBackend ? "Checking separate backend..." : "Using local browser storage",
  );
  const [uploadForm, setUploadForm] = useState({
    title: "",
    bpm: "",
    price: "",
    mood: "",
    tags: [] as string[],
    artwork: "",
    snippetUrl: "",
  });
  const [customUploadTag, setCustomUploadTag] = useState("");
  const [tagDrafts, setTagDrafts] = useState<Record<string, string>>({});
  const [uploadFiles, setUploadFiles] = useState<{ artwork?: File; snippet?: File }>({});

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscNodesRef = useRef<OscillatorNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);
  const previewTimeoutRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const availableTags = useMemo(
    () => Array.from(new Set(beats.flatMap((beat) => beat.tags))).sort(),
    [beats],
  );

  const availableBpms = useMemo(
    () => Array.from(new Set(beats.map((beat) => String(beat.bpm)))).sort(),
    [beats],
  );

  const filteredBeats = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const nextBeats = beats
      .filter((beat) => activeTag === "all" || beat.tags.includes(activeTag))
      .filter((beat) => bpmFilter === "all" || String(beat.bpm) === bpmFilter)
      .filter((beat) =>
        !normalizedQuery
          ? true
          : `${beat.title} ${beat.mood} ${beat.tags.join(" ")}`
              .toLowerCase()
              .includes(normalizedQuery),
      );

    if (sortMode === "newest") {
      return [...nextBeats].reverse();
    }

    if (sortMode === "bpm-high") {
      return [...nextBeats].sort((a, b) => b.bpm - a.bpm);
    }

    if (sortMode === "bpm-low") {
      return [...nextBeats].sort((a, b) => a.bpm - b.bpm);
    }

    return nextBeats;
  }, [activeTag, beats, bpmFilter, searchQuery, sortMode]);

  const { items: sharedCartItems, addItem, removeItem, total: cartTotal } = useSharedCart();

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

    setBeats(storedBeats);
    setBeatsAdminUnlocked(window.sessionStorage.getItem("void-admin-beats") === "true");
    setSelectedLicenses(
      Object.fromEntries(storedBeats.map((beat) => [beat.id, "Basic Lease" as LicenseTier])),
    );
  }, []);

  useEffect(() => {
    const syncAdminState = () => {
      setBeatsAdminUnlocked(window.sessionStorage.getItem("void-admin-beats") === "true");
    };

    window.addEventListener("focus", syncAdminState);
    window.addEventListener("void-admin-unlocked", syncAdminState as EventListener);

    return () => {
      window.removeEventListener("focus", syncAdminState);
      window.removeEventListener("void-admin-unlocked", syncAdminState as EventListener);
    };
  }, []);

  useEffect(() => {
    persistStoredBeats(beats);
  }, [beats]);

  useEffect(() => {
    persistStoredLicenses(selectedLicenses);
  }, [selectedLicenses]);

  useEffect(() => {
    if (hasSeparateBackend) {
      setBackendStatus("Separate backend is available for uploads");
    }
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

  const handleUploadAsset = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: "artwork" | "snippetUrl",
  ) => {
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

  const addCustomUploadTag = () => {
    const nextTag = customUploadTag.trim().toLowerCase();
    if (!nextTag) return;

    setUploadForm((current) => ({
      ...current,
      tags: current.tags.includes(nextTag) ? current.tags : [...current.tags, nextTag],
    }));
    setCustomUploadTag("");
  };

  const updateBeatTagDraft = (beatId: string, value: string) => {
    setTagDrafts((current) => ({ ...current, [beatId]: value }));
  };

  const saveBeatTags = (beatId: string) => {
    const rawValue = tagDrafts[beatId] ?? "";
    const nextTags = rawValue
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    setBeats((current) =>
      current.map((beat) => (beat.id === beatId ? { ...beat, tags: nextTags } : beat)),
    );
    setTagDrafts((current) => ({ ...current, [beatId]: nextTags.join(", ") }));
  };

  const addBeatToCatalog = async () => {
    if (
      !uploadForm.title ||
      !uploadForm.bpm ||
      !uploadForm.price ||
      !uploadForm.artwork
    ) {
      return;
    }

    let artworkUrl = uploadForm.artwork;
    let snippetUrl = uploadForm.snippetUrl || undefined;

    if (hasSeparateBackend && uploadFiles.artwork) {
      const uploadedArtwork = await uploadRemoteFile(
        `artwork/${Date.now()}-${uploadFiles.artwork.name}`,
        uploadFiles.artwork,
      );
      if (uploadedArtwork) artworkUrl = uploadedArtwork;
    }

    if (hasSeparateBackend && uploadFiles.snippet) {
      const uploadedSnippet = await uploadRemoteFile(
        `snippets/${Date.now()}-${uploadFiles.snippet.name}`,
        uploadFiles.snippet,
      );
      if (uploadedSnippet) snippetUrl = uploadedSnippet;
    }

    const newBeat: Beat = {
      id: `upload-${Date.now()}`,
      title: uploadForm.title,
      bpm: Number(uploadForm.bpm),
      price: Number(uploadForm.price),
      mood: uploadForm.mood || "custom upload",
      tags: uploadForm.tags,
      artwork: artworkUrl,
      snippetUrl,
      clipType: snippetUrl ? "uploaded" : "generated",
    };

    setBeats((current) => [newBeat, ...current]);
    if (hasSeparateBackend) {
      const inserted = await insertRemoteBeat(newBeat);
      setBackendStatus(
        inserted
          ? "Separate backend synced"
          : "Saved locally; remote sync still needs table/storage setup",
      );
    }
    setSelectedLicenses((current) => ({ ...current, [newBeat.id]: "Basic Lease" }));
    setUploadForm({
      title: "",
      bpm: "",
      price: "",
      mood: "",
      tags: [],
      artwork: "",
      snippetUrl: "",
    });
    setCustomUploadTag("");
    setUploadFiles({});
  };

  const toggleCart = (beat: Beat) => {
    const activeLicense = selectedLicenses[beat.id] ?? "Basic Lease";
    const totalPrice =
      beat.price * (licenses.find((item) => item.name === activeLicense)?.multiplier ?? 1);

    addItem({
      id: `${beat.id}-${activeLicense}`,
      title: beat.title,
      kind: "beat",
      price: totalPrice,
      subtitle: activeLicense,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(133,14,29,0.32),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.06),_transparent_25%)]" />
      <div className="pointer-events-none fixed inset-0 noise-overlay opacity-40" />

      <SiteHeader
        cartItems={sharedCartItems}
        cartTotal={cartTotal}
        onRemoveItem={removeItem}
        checkoutHref="/checkout"
      />

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.35fr,0.65fr] lg:px-8 lg:pb-24 lg:pt-20">
          <div className="space-y-8 lg:col-span-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-blood/30 bg-blood/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-blood-light">
              <Skull className="h-3.5 w-3.5" />
              Music store + artwork vault
            </div>

            <div className="bleed-panel overflow-hidden rounded-[2.4rem] px-0 pt-0">
              <div className="flex justify-center">
                <img
                  src="https://i.pinimg.com/736x/de/ec/31/deec31ca2ff0fef15620bf8851075203.jpg"
                  alt="Void hero artwork"
                  className="h-[34rem] w-full max-w-none object-cover object-center sm:h-[42rem]"
                />
              </div>

              <div className="mt-6 flex justify-center px-6 pb-8 sm:px-8">
                <Button
                  className="cutout-button rounded-none bg-blood px-8 text-white hover:bg-blood-dark"
                  asChild
                >
                  <a href="#store">
                    Enter Store
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8" id="store">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-blood-light">Browse</p>
            <h2 className="font-display text-5xl uppercase text-white sm:text-6xl">Beats</h2>
          </div>

          <div className="mb-6 grid gap-3 lg:grid-cols-[1.1fr,1fr,1fr,1fr]">
            <Select value={activeTag} onValueChange={setActiveTag}>
              <SelectTrigger className="ghost-luxe h-14 border-white/10 text-white">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#120b0d] text-white">
                <SelectItem value="all">All tags</SelectItem>
                {availableTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={bpmFilter} onValueChange={setBpmFilter}>
              <SelectTrigger className="ghost-luxe h-14 border-white/10 text-white">
                <SelectValue placeholder="All BPM" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#120b0d] text-white">
                <SelectItem value="all">All BPM</SelectItem>
                {availableBpms.map((bpm) => (
                  <SelectItem key={bpm} value={bpm}>
                    {bpm} BPM
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortMode} onValueChange={setSortMode}>
              <SelectTrigger className="ghost-luxe h-14 border-white/10 text-white">
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#120b0d] text-white">
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="bpm-high">Highest BPM</SelectItem>
                <SelectItem value="bpm-low">Lowest BPM</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="ghost-luxe h-14 justify-center border-white/10 text-white hover:bg-white/10" asChild>
              <a href="/contact">Contact</a>
            </Button>
          </div>

          <div className="ghost-luxe mb-6 flex items-center gap-4 rounded-[1.75rem] border border-white/10 px-5 py-4">
            <Search className="h-5 w-5 text-[#efe6df]/70" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/45"
              placeholder="What type of track are you looking for?"
            />
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag("all")}
              className={`tag-pill ${activeTag === "all" ? "tag-pill-active" : ""}`}
            >
              all
            </button>
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`tag-pill ${activeTag === tag ? "tag-pill-active" : ""}`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredBeats.map((beat) => {
              const activeLicense = selectedLicenses[beat.id] ?? "Basic Lease";
              const totalPrice =
                beat.price *
                (licenses.find((item) => item.name === activeLicense)?.multiplier ?? 1);
              const isPlaying = playingBeatId === beat.id;

              return (
                <article key={beat.id} className="vault-panel overflow-hidden">
                  <div className="relative">
                    <div className="flex h-64 w-full items-center justify-center bg-white/5 text-xs uppercase tracking-[0.3em] text-white/30">
                      Artwork placeholder
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-blood-light">
                          {beat.mood}
                        </p>
                        <h3 className="font-display text-3xl uppercase text-white">
                          {beat.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => handlePreview(beat)}
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white transition hover:border-blood hover:bg-blood"
                      >
                        {isPlaying ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5 translate-x-0.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-5 p-5">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/55">
                      {beat.bpm} BPM
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blood-dark via-blood to-white/90 transition-all"
                        style={{ width: `${progress[beat.id] ?? 0}%` }}
                      />
                    </div>
                    <div className="text-right text-xs uppercase tracking-[0.22em] text-white/45">
                      {Math.max(
                        0,
                        Math.ceil(30 - ((progress[beat.id] ?? 0) / 100) * 30),
                      )}{" "}
                      sec left
                    </div>

                    <div>
                      <p className="mb-2 text-xs uppercase tracking-[0.26em] text-white/45">
                        License
                      </p>
                      <Select
                        value={activeLicense}
                        onValueChange={(value: LicenseTier) =>
                          setSelectedLicenses((current) => ({ ...current, [beat.id]: value }))
                        }
                      >
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
                    </div>

                    {beatsAdminUnlocked ? (
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.26em] text-blood-light">
                          Admin tags
                        </p>
                        <div className="flex flex-col gap-3">
                          <input
                            value={tagDrafts[beat.id] ?? beat.tags.join(", ")}
                            onChange={(event) => updateBeatTagDraft(beat.id, event.target.value)}
                            className="field-input"
                            placeholder="Type comma-separated tags"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                            onClick={() => saveBeatTags(beat.id)}
                          >
                            Save tags
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                          Current price
                        </p>
                        <p className="font-display text-3xl uppercase text-white">
                          {formatMoney(totalPrice)}
                        </p>
                      </div>

                      <Button
                        className="buy-button cutout-button rounded-none bg-blood px-6 text-white hover:bg-blood-dark"
                        onClick={() => toggleCart(beat)}
                      >
                        Buy now
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8" id="upload">
          <AdminGate
            storageKey="void-admin-beats"
            title="Beat upload"
            description="This upload section is hidden from regular visitors. Only you should unlock it to add beats."
          >
            <div className="vault-panel p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.28em] text-blood-light">Upload beats</p>
              <h2 className="font-alt mt-3 text-4xl uppercase text-white">
                Add your own beats yourself
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/70">
                This first version stores uploads in the browser session so you can test the flow
                right now. Later, we can connect this to real storage, real checkout, and a live
                admin panel.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-white/70">
                  <span>Beat title</span>
                  <input
                    value={uploadForm.title}
                    onChange={(event) =>
                      setUploadForm((current) => ({ ...current, title: event.target.value }))
                    }
                    className="field-input"
                    placeholder="Midnight Relay"
                  />
                </label>
                <label className="space-y-2 text-sm text-white/70">
                  <span>Mood</span>
                  <input
                    value={uploadForm.mood}
                    onChange={(event) =>
                      setUploadForm((current) => ({ ...current, mood: event.target.value }))
                    }
                    className="field-input"
                    placeholder="evil melodic"
                  />
                </label>
                <label className="space-y-2 text-sm text-white/70">
                  <span>BPM</span>
                  <input
                    value={uploadForm.bpm}
                    onChange={(event) =>
                      setUploadForm((current) => ({ ...current, bpm: event.target.value }))
                    }
                    className="field-input"
                    placeholder="148"
                  />
                </label>
                <label className="space-y-2 text-sm text-white/70">
                  <span>Base price</span>
                  <input
                    value={uploadForm.price}
                    onChange={(event) =>
                      setUploadForm((current) => ({ ...current, price: event.target.value }))
                    }
                    className="field-input"
                    placeholder="20"
                  />
                </label>
                <label className="space-y-2 text-sm text-white/70">
                  <span>Artwork image</span>
                  <div className="field-input flex items-center justify-between gap-3">
                    <span className="truncate text-white/55">
                      {uploadForm.artwork ? "Artwork loaded" : "Upload JPG/PNG"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleUploadAsset(event, "artwork")}
                      className="max-w-[12rem] text-xs text-white/60 file:mr-3 file:rounded-full file:border-0 file:bg-blood/20 file:px-3 file:py-2 file:text-white"
                    />
                  </div>
                </label>
              </div>

              <label className="mt-4 block space-y-2 text-sm text-white/70">
                <span>30-second snippet</span>
                <div className="field-input flex items-center justify-between gap-3">
                  <span className="truncate text-white/55">
                    {uploadForm.snippetUrl
                      ? "Snippet ready"
                      : "Upload MP3/WAV or use generated placeholder preview"}
                  </span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(event) => handleUploadAsset(event, "snippetUrl")}
                    className="max-w-[12rem] text-xs text-white/60 file:mr-3 file:rounded-full file:border-0 file:bg-blood/20 file:px-3 file:py-2 file:text-white"
                  />
                </div>
              </label>

              <div className="mt-5">
                <p className="mb-3 text-sm text-white/70">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {tagOptions.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleUploadTag(tag)}
                      className={`tag-pill ${
                        uploadForm.tags.includes(tag) ? "tag-pill-active" : ""
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  <input
                    value={customUploadTag}
                    onChange={(event) => setCustomUploadTag(event.target.value)}
                    className="field-input min-w-[16rem] flex-1"
                    placeholder="Type your own tag"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                    onClick={addCustomUploadTag}
                  >
                    Add tag
                  </Button>
                </div>
                {uploadForm.tags.length ? (
                  <p className="mt-3 text-sm text-white/50">
                    Current tags: {uploadForm.tags.join(", ")}
                  </p>
                ) : null}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  className="cutout-button rounded-none bg-blood px-8 text-white hover:bg-blood-dark"
                  onClick={addBeatToCatalog}
                >
                  <Upload className="h-4 w-4" />
                  Add beat to catalog
                </Button>
                <p className="text-sm text-white/50">
                  Required for now: title, BPM, price, and artwork.
                </p>
              </div>
              <p className="mt-4 text-sm text-white/50">
                {hasSeparateBackend
                  ? "Separate backend env vars are present, so uploads will try to sync there too."
                  : "No separate backend env vars yet, so uploads save locally in this browser for now."}
              </p>

            </div>
          </AdminGate>
        </section>
      </main>
    </div>
  );
};

export default Index;
