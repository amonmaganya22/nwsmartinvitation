import Link from "next/link";
import { ArrowRight, QrCode, LayoutTemplate, Users, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

const templates = [
  { name: "Wedding", color: "#c98ba0" },
  { name: "Birthday", color: "#f2b84b" },
  { name: "Conference", color: "#2f6fed" },
  { name: "Church", color: "#8b5e3c" },
  { name: "VIP", color: "#c9a227" },
  { name: "Corporate", color: "#1c1f22" },
  { name: "Graduation", color: "#2e4a34" },
  { name: "Modern Minimal", color: "#4c9a2a" },
  { name: "Luxury Gold", color: "#c9a227" }
];

const plans = [
  { name: "Free", price: "0", unit: "TZS", features: ["1 event", "Up to 20 guests", "Standard templates"] },
  { name: "Basic", price: "15,000", unit: "TZS / month", features: ["5 events", "Up to 200 guests", "Standard templates"], highlighted: true },
  { name: "Premium", price: "45,000", unit: "TZS / month", features: ["Unlimited events", "Unlimited guests", "Premium templates (VIP, Luxury Gold)"] }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0f1112]">
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="btn-secondary hidden sm:inline-flex items-center justify-center cursor-pointer">
            Log in
          </Link>
          <Link href="/register" className="btn-primary inline-flex items-center justify-center cursor-pointer">
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 overflow-hidden px-6 pt-16 pb-24 text-center">
        <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[28rem] w-[42rem] -translate-x-1/2 rounded-full bg-brand-green/10 blur-3xl" />
        <p className="relative mx-auto mb-4 inline-block rounded-full border border-brand-green/30 bg-brand-green/5 px-4 py-1 text-xs font-medium text-brand-green">
          One scan. Zero doubt.
        </p>
        <h1 className="relative mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-brand-dark dark:text-white sm:text-6xl">
          Invitations that check themselves in.
        </h1>
        <p className="relative mx-auto mt-5 max-w-xl text-base text-gray-500 dark:text-gray-400 sm:text-lg">
          Design your event card, add your guest list, and hand every guest a QR code that can only ever be used once. No paper. No duplicate entries. No guesswork at the door.
        </p>
        <div className="relative z-20 mt-8 flex items-center justify-center gap-3">
          <Link href="/register" className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 cursor-pointer">
            Create your first event <ArrowRight size={16} />
          </Link>
          <Link href="/login" className="btn-secondary inline-flex items-center justify-center px-6 py-3 cursor-pointer">
            I already have an account
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: LayoutTemplate, title: "9 ready templates", desc: "Wedding to VIP to Luxury Gold — pick one, your card builds itself." },
          { icon: Users, title: "Guest list in seconds", desc: "Add guests by hand or import a whole spreadsheet at once." },
          { icon: QrCode, title: "Single-use QR codes", desc: "Every code is signed and locks the moment it's scanned." },
          { icon: ShieldCheck, title: "Built to be trusted", desc: "Hashed passwords, signed tokens, and a full audit trail." }
        ].map((f) => (
          <div key={f.title} className="card-surface p-6">
            <f.icon size={22} className="text-brand-green" />
            <h3 className="mt-4 font-semibold text-brand-dark dark:text-white">{f.title}</h3>
            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Templates */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-brand-dark dark:text-white">Templates for every occasion</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {templates.map((t) => (
            <span
              key={t.name}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium dark:border-gray-800"
              style={{ boxShadow: `inset 3px 0 0 ${t.color}` }}
            >
              {t.name}
            </span>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-6xl px-6 pb-28">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-brand-dark dark:text-white">Simple pricing, in Tanzanian Shillings</h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-gray-500 dark:text-gray-400">
          Need more guests on any plan? Top up at 25,000 TZS per 50 guests via mobile money.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`card-surface p-6 ${p.highlighted ? "ring-2 ring-brand-green" : ""}`}
            >
              <h3 className="font-semibold text-brand-dark dark:text-white">{p.name}</h3>
              <p className="mt-3 text-3xl font-semibold text-brand-dark dark:text-white">
                {p.price} <span className="text-sm font-normal text-gray-400">{p.unit}</span>
              </p>
              <ul className="mt-5 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                {p.features.map((f) => <li key={f}>• {f}</li>)}
              </ul>
              <Link href="/register" className={`inline-flex items-center justify-center cursor-pointer mt-6 w-full ${p.highlighted ? "btn-primary" : "btn-secondary"}`}>
                Choose {p.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-100 px-6 py-8 text-center text-xs text-gray-400 dark:border-gray-800">
        © {new Date().getFullYear()} NWSmartInvitation. Built for events across Tanzania.
      </footer>
    </main>
  );
}