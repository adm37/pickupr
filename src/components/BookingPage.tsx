import React, { useEffect, useRef, useState } from "react";
import BookingMap from "./BookingMap";
import {
  Car,
  Check,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  Users,
  Briefcase,
  Shield,
  Star,
  Phone,
  Mail,
  Banknote,
  Wifi,
  Snowflake,
  ChevronRight,
  Lock,
  RefreshCw,
  Plane,
  CircleCheck,
  Sparkles,
} from "lucide-react";
import { logEvent } from "../lib/tracking";
import { trackConfirmedBooking } from "../lib/googleAds";
import { navigateTo } from "../lib/navigation";
import { isSupabaseConfigured, supabase, supabaseUrl } from "../lib/supabaseClient";

const REVIEWS = [
  {
    name: "Sophie M.",
    role: "Business traveler",
    rating: 5,
    text: "Perfect pickup at Schiphol, driver was already waiting and everything felt premium from start to finish.",
  },
  {
    name: "James K.",
    role: "Family transfer",
    rating: 5,
    text: "Clean vehicle, friendly driver and exact fixed fare. This is exactly how airport transfers should work.",
  },
  {
    name: "Anna B.",
    role: "Frequent customer",
    rating: 5,
    text: "Booked multiple times now. Always on time, professional communication and very smooth rides.",
  },
];

type VehicleCfg = {
  label: string;
  subtitle: string;
  maxPax: number;
  maxLuggage: number;
  badge?: string;
  features: string[];
};

const VEHICLE_CONFIG: Record<string, VehicleCfg> = {
  Sedan: {
    label: "Executive Sedan",
    subtitle: "Comfort for solo and couples",
    maxPax: 3,
    maxLuggage: 3,
    badge: "Most chosen",
    features: ["Meet & greet", "Free waiting time", "Wi-Fi", "Air conditioning"],
  },
  Van: {
    label: "Premium Van",
    subtitle: "Ideal for families and groups",
    maxPax: 7,
    maxLuggage: 7,
    features: ["Extra luggage room", "Wi-Fi", "Air conditioning", "Group comfort"],
  },
  Luxury: {
    label: "Luxury Class",
    subtitle: "High-end private transfer",
    maxPax: 3,
    maxLuggage: 3,
    badge: "VIP",
    features: ["Premium interior", "Priority support", "Wi-Fi", "Water & amenities"],
  },
};

function StarRow({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      ))}
    </span>
  );
}

function Stepper({ step }: { step: number }) {
  const steps = ["Vehicle", "Details", "Confirm"];
  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      {steps.map((label, idx) => {
        const n = idx + 1;
        const done = step > n;
        const active = step === n;
        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2 sm:gap-3">
              <span
                className={`grid h-8 w-8 place-items-center rounded-xl border text-[11px] font-black transition sm:h-9 sm:w-9 ${
                  done
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : active
                      ? "border-sky-700 bg-sky-700 text-white shadow-sm"
                      : "border-sky-100 bg-white text-zinc-500"
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : n}
              </span>
              <span
                className={`hidden text-xs font-bold uppercase tracking-[0.12em] sm:block ${
                  active ? "text-zinc-900" : "text-zinc-500"
                }`}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <span className={`h-px w-4 sm:w-10 ${step > n ? "bg-emerald-500" : "bg-sky-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function VehicleOption({
  name,
  totalAmount,
  selected,
  onSelect,
  hasReturn,
}: {
  name: string;
  totalAmount: number;
  selected: boolean;
  onSelect: () => void;
  hasReturn: boolean;
}) {
  const cfg = VEHICLE_CONFIG[name];

  const totalPrice = `€${totalAmount.toFixed(0)}`;

  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-2xl border p-5 text-left transition-all ${
        selected
          ? "border-sky-700 bg-sky-50 text-zinc-900 shadow-[0_18px_34px_-24px_rgba(3,105,161,0.55)]"
          : "border-zinc-200 bg-white text-zinc-900 hover:border-sky-200 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-extrabold tracking-tight">{cfg.label}</h3>
            {cfg.badge && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  selected ? "bg-sky-700 text-white" : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {cfg.badge}
              </span>
            )}
          </div>
          <p className={`text-sm ${selected ? "text-zinc-700" : "text-zinc-500"}`}>{cfg.subtitle}</p>
          <div className={`mt-3 flex flex-wrap gap-3 text-xs font-medium ${selected ? "text-zinc-700" : "text-zinc-600"}`}>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {cfg.maxPax} passengers
            </span>
            <span className="inline-flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" /> {cfg.maxLuggage} luggage
            </span>
            <span className="inline-flex items-center gap-1">
              <Wifi className="h-3.5 w-3.5" /> Wi-Fi
            </span>
            <span className="inline-flex items-center gap-1">
              <Snowflake className="h-3.5 w-3.5" /> AC
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-black tracking-tight">{totalPrice}</p>
          <p className={`text-xs ${selected ? "text-zinc-600" : "text-zinc-400"}`}>
            {hasReturn ? "round trip" : "one way"}
          </p>
        </div>
      </div>

      {selected && (
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-sky-100 pt-4 text-xs text-zinc-700">
          {cfg.features.map((f) => (
            <span key={f} className="inline-flex items-center gap-1.5">
              <CircleCheck className="h-3.5 w-3.5 text-emerald-600" /> {f}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

export default function BookingPage() {
  const bookingSubmissionLocked = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const getHashParams = () => {
    if (typeof window === "undefined") return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  };

  const [params, setParams] = useState<URLSearchParams>(getHashParams());
  const [distance, setDistance] = useState<number | null>(null);
  const [routeDuration, setRouteDuration] = useState<string | null>(null);
  const [routeDurationSeconds, setRouteDurationSeconds] = useState<number | null>(null);

  const [prices, setPrices] = useState({ sedan: 2.5, van: 3.5, luxurySedan: 4.5 });
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [paymentCanceled, setPaymentCanceled] = useState(false);
  const [step, setStep] = useState(1);
  const paymentMethod = "Driver";
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [flightNumber, setFlightNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const waitingFee = 0;

  const handleVehicleSelect = (vehicle: string) => {
    setSelectedVehicle(vehicle);
    logEvent("Vehicle Selected", `Vehicle: ${vehicle} | Route: ${pickup} -> ${dropoff || "Hourly"}`);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = getHashParams();
    setParams(p);
    if (p.get("success") === "true") setBookingConfirmed(true);
    else if (p.get("canceled") === "true") setPaymentCanceled(true);

    const savedSedan = localStorage.getItem("sedanPrice");
    const savedVan = localStorage.getItem("vanPrice");
    const savedLuxury = localStorage.getItem("luxurySedanPrice");
    if (savedSedan || savedVan || savedLuxury) {
      setPrices({
        sedan: savedSedan ? parseFloat(savedSedan) : 2.5,
        van: savedVan ? parseFloat(savedVan) : 3.5,
        luxurySedan: savedLuxury ? parseFloat(savedLuxury) : 4.5,
      });
    }

    logEvent("Booking Page Loaded", `Type: ${p.get("type") || "transfer"} | Route: ${p.get("pickup") || ""} -> ${p.get("dropoff") || ""}`);
  }, []);

  useEffect(() => {
    logEvent("Booking Funnel Step Viewed", `Step ${step}`);
  }, [step]);

  const pickup = params.get("pickup") || "";
  const dropoff = params.get("dropoff") || "";
  const pickupDate = params.get("date");
  const pickupTime = params.get("time");
  const passengers = params.get("passengers") || "1";
  const luggage = params.get("luggage") || "0";
  const bookingType = params.get("type");
  const duration = params.get("duration");
  const returnDate = params.get("returnDate");
  const returnTime = params.get("returnTime");

  const parsedWaypoints: Array<{ location: string; waitTime: number }> = (() => {
    const raw = params.get("waypoints");
    if (!raw) return [];
    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];
      return data
        .filter((item) => item && typeof item.location === "string" && item.location.trim().length > 0)
        .map((item) => ({
          location: item.location,
          waitTime: Number(item.waitTime) > 0 ? Number(item.waitTime) : 0,
        }));
    } catch {
      return [];
    }
  })();

  const waypointLocations = parsedWaypoints.map((w) => w.location);
  const totalWaitMinutes = parsedWaypoints.reduce((sum, wp) => sum + wp.waitTime, 0);

  const isAirportPickup =
    pickup.toLowerCase().includes("schiphol") ||
    pickup.toLowerCase().includes("eindhoven") ||
    pickup.toLowerCase().includes("rotterdam");

  const getHourlyRateForVehicle = (vehicle: string) => {
    return vehicle === "Sedan"
      ? parseFloat(localStorage.getItem("hourlySedanPrice") || "50")
      : vehicle === "Van"
        ? parseFloat(localStorage.getItem("hourlyVanPrice") || "75")
        : parseFloat(localStorage.getItem("hourlyLuxuryPrice") || "100");
  };

  const computePriceForVehicle = (vehicle: string | null) => {
    if (!vehicle) return 0;
    const tripCount = returnDate ? 2 : 1;
    let amt = 0;

    if (bookingType === "hourly" && duration) {
      const h = parseInt(duration, 10) || 1;
      const r = getHourlyRateForVehicle(vehicle);
      amt = r * h;
    } else if (distance !== null) {
      const base =
        vehicle === "Sedan"
          ? prices.sedan
          : vehicle === "Van"
            ? prices.van
            : prices.luxurySedan;
      let waitingFee = 0;
      if (bookingType === "multicity" && totalWaitMinutes > 0) {
        waitingFee = (getHourlyRateForVehicle(vehicle) / 60) * totalWaitMinutes;
      }

      amt = base * distance * tripCount + waitingFee;
      const minPrice = parseFloat(localStorage.getItem("minimumPrice") || "115");
      const minDistance = parseFloat(localStorage.getItem("minimumDistance") || "30");
      if (distance <= minDistance && amt < minPrice) amt = minPrice;
    }

    return amt;
  };

  const computePrice = () => computePriceForVehicle(selectedVehicle);

  const totalDisplay = selectedVehicle ? `€${computePrice().toFixed(0)}` : "—";

  const hasValidLocationInput = (value: string) => {
    const normalized = value.trim();
    // Allow city/airport/place searches from autocomplete; do not force house numbers.
    return normalized.length >= 3;
  };

  const getStepOneValidationErrors = () => {
    const errors: string[] = [];

    if (!hasValidLocationInput(pickup)) {
      errors.push("Pickup location is required.");
    }

    if (bookingType !== "hourly" && !hasValidLocationInput(dropoff)) {
      errors.push("Drop-off location is required.");
    }

    if (!pickupDate) {
      errors.push("Pickup date is required.");
    }

    if (!pickupTime) {
      errors.push("Pickup time is required.");
    }

    if ((returnDate && !returnTime) || (!returnDate && returnTime)) {
      errors.push("For a return trip, both return date and return time are required.");
    }

    return errors;
  };

  const canProceedToDetails = Boolean(selectedVehicle);

  const handleContinueToDetails = () => {
    if (!selectedVehicle) return;

    const errors = getStepOneValidationErrors();
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    logEvent("Booking Funnel Progress", "Step 1 completed");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const generateFallbackBookingId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `BK-${crypto.randomUUID()}`;
    }
    return `BK-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  };

  const handleBookingSubmit = async () => {
    if (bookingSubmissionLocked.current) return;

    logEvent("Booking Initiated", `Vehicle: ${selectedVehicle} | ${pickup} -> ${dropoff}`);

    if (!isSupabaseConfigured || !supabase) {
      const message = "Booking is tijdelijk niet beschikbaar: Supabase is niet geconfigureerd op deze deployment (VITE_SUPABASE_URL of PUBLIC_SUPABASE_URL, en VITE_SUPABASE_ANON_KEY of PUBLIC_SUPABASE_ANON_KEY).";
      logEvent("Booking Failed", message);
      alert(message);
      return;
    }

    if (!firstName.trim() || !lastName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      logEvent("Booking Failed", "Missing fields");
      alert("Please fill in all required fields.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const bookingPriceAmount = computePrice();
    bookingSubmissionLocked.current = true;
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert([
          {
            customer_name: `${firstName} ${lastName}`.trim(),
            customer_email: customerEmail,
            customer_phone: customerPhone,
            pickup_location: pickup,
            dropoff_location: dropoff || "N/A",
            date: pickupDate,
            time: pickupTime,
            price: bookingPriceAmount.toFixed(2),
            status: "Pending",
            vehicle: selectedVehicle || "Sedan",
            passengers: parseInt(passengers, 10),
            luggage: parseInt(luggage, 10),
            flight_number: flightNumber,
            notes: notes.trim(),
            payment_method: paymentMethod,
            ride_type: bookingType === "hourly" ? "Hourly Driver" : "Transfer",
            return_date: returnDate || null,
            return_time: returnTime || null,
          },
        ])
        .select()
        .single();

      if (error) {
        logEvent("Booking Failed", `Supabase error: ${error.message || "Unknown"}`);
        alert(`Booking error: ${error.message || "Please try again."}`);
        bookingSubmissionLocked.current = false;
        setIsSubmitting(false);
        return;
      }

      const resolvedBookingId = String(data?.id || generateFallbackBookingId());
      logEvent("Booking Confirmed", `Payment method: Driver | Booking: ${resolvedBookingId}`);
      trackConfirmedBooking({
        amount: bookingPriceAmount,
        bookingId: resolvedBookingId,
      });
      setBookingConfirmed(true);
    } catch (err: any) {
      const rawMessage = err?.message || "Unknown error";
      const failedFetch = /failed to fetch/i.test(rawMessage);

      const message = failedFetch
        ? `Booking error: verbinding met Supabase mislukt (${supabaseUrl || "geen URL"}). Controleer VITE_SUPABASE_URL en DNS van je Supabase project.`
        : `Unexpected error: ${rawMessage}`;

      logEvent("Booking Failed", message);
      alert(message);
      bookingSubmissionLocked.current = false;
      setIsSubmitting(false);
    }
  };

  if (bookingConfirmed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 via-white to-zinc-50 px-4 pt-20 pb-10">
        <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl">
          <div className="border-b border-zinc-200 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_56%)] px-8 py-7">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <Check className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900">Booking confirmed</h1>
            <p className="mt-2 text-sm text-zinc-500">Pay cash directly to the driver at pickup.</p>
          </div>

          <div className="space-y-3 px-8 py-6 text-sm">
            {[
              { icon: <MapPin className="h-4 w-4" />, label: "From", value: pickup },
              { icon: <MapPin className="h-4 w-4" />, label: "To", value: dropoff || "Hourly ride" },
              ...(waypointLocations.length
                ? [{ icon: <MapPin className="h-4 w-4" />, label: "Via", value: waypointLocations.join(" -> ") }]
                : []),
              { icon: <Calendar className="h-4 w-4" />, label: "Date", value: pickupDate || "—" },
              { icon: <Clock className="h-4 w-4" />, label: "Time", value: pickupTime || "—" },
              { icon: <Car className="h-4 w-4" />, label: "Vehicle", value: selectedVehicle || "—" },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                  {icon}
                </span>
                <span className="w-16 text-zinc-500">{label}</span>
                <span className="font-semibold text-zinc-900">{value}</span>
              </div>
            ))}

            <div className="mt-2 flex items-center justify-between border-t border-zinc-200 pt-4">
              <span className="font-bold text-zinc-900">Total</span>
              <span className="text-2xl font-black tracking-tight text-zinc-900">{totalDisplay}</span>
            </div>
          </div>

          <div className="px-8 pb-8">
            <button
              onClick={() => navigateTo("/")}
              className="w-full rounded-xl bg-zinc-900 py-3.5 text-sm font-bold text-white transition hover:bg-zinc-800"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentCanceled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 via-white to-zinc-50 px-4 pt-20">
        <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500 text-white">
            <RefreshCw className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900">Payment canceled</h2>
          <p className="mt-2 text-sm text-zinc-500">No problem. Your booking details are still there.</p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setPaymentCanceled(false);
                setStep(2);
              }}
              className="rounded-xl bg-zinc-900 py-3 text-sm font-bold text-white transition hover:bg-zinc-800"
            >
              Try again
            </button>
            <button
              onClick={() => navigateTo("/")}
              className="rounded-xl border border-zinc-300 bg-white py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-zinc-50 pt-16 pb-24 lg:pb-10">
      <div className="pointer-events-none absolute inset-x-0 top-16 h-[380px] bg-[radial-gradient(circle_at_10%_10%,rgba(14,165,233,0.15),transparent_42%),radial-gradient(circle_at_90%_0%,rgba(16,185,129,0.14),transparent_36%)]" />

      <section className="relative z-10 border-b border-sky-100 bg-white/80">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="rounded-3xl border border-sky-100 bg-white p-4 shadow-[0_16px_32px_-26px_rgba(2,132,199,0.5)] sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Trip summary</p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-start gap-2 text-sm text-zinc-800">
                    <MapPin className="mt-0.5 h-4 w-4 text-zinc-500" />
                    <p className="font-semibold">{pickup || "—"}</p>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-zinc-900">
                    <ArrowRight className="mt-0.5 h-4 w-4 text-sky-600" />
                    <p className="font-bold">{dropoff || (bookingType === "hourly" ? "Hourly ride" : "—")}</p>
                  </div>
                </div>

                {waypointLocations.length > 0 && (
                  <p className="mt-2 text-xs text-zinc-500">
                    Via: <span className="font-medium text-zinc-700">{waypointLocations.join(" • ")}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold text-zinc-600 lg:justify-end">
                {pickupDate && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {pickupDate}
                  </span>
                )}
                {pickupTime && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {pickupTime}
                  </span>
                )}
                {passengers && (
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {passengers}
                  </span>
                )}
                {routeDuration && (
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    <Clock className="h-3.5 w-3.5" /> {routeDuration}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-b border-sky-100 bg-white/70">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs font-semibold text-zinc-600 sm:text-sm">
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9/5 rating
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-emerald-600" /> Fixed fare, secure checkout
            </span>
            <span className="inline-flex items-center gap-1.5">
              <RefreshCw className="h-4 w-4 text-zinc-700" /> Free cancel up to 24h
            </span>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          {step === 1 && (
            <>
              <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-[0_24px_40px_-32px_rgba(2,132,199,0.55)]">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-700">
                      <Sparkles className="h-3.5 w-3.5" /> Most bookings finish in under 2 minutes
                    </span>
                    <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-900">Choose your ride</h1>
                    <p className="mt-1 text-sm text-zinc-500">Clear fixed fare, licensed drivers, and instant confirmation.</p>
                  </div>
                  {distance !== null && (
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-right">
                      <p className="text-xs font-semibold uppercase text-zinc-500">Distance</p>
                      <p className="text-lg font-black tracking-tight text-zinc-900">
                        {distance.toFixed(0)} km {returnDate ? "x2" : ""}
                      </p>
                    </div>
                  )}
                </div>

                {distance !== null || bookingType === "hourly" ? (
                  <div className="space-y-3">
                    {parseInt(passengers || "1", 10) <= 3 && parseInt(luggage || "0", 10) <= 3 && (
                      <VehicleOption
                        name="Sedan"
                        totalAmount={computePriceForVehicle("Sedan")}
                        selected={selectedVehicle === "Sedan"}
                        onSelect={() => handleVehicleSelect("Sedan")}
                        hasReturn={!!returnDate}
                      />
                    )}
                    {parseInt(passengers || "1", 10) <= 7 && parseInt(luggage || "0", 10) <= 7 && (
                      <VehicleOption
                        name="Van"
                        totalAmount={computePriceForVehicle("Van")}
                        selected={selectedVehicle === "Van"}
                        onSelect={() => handleVehicleSelect("Van")}
                        hasReturn={!!returnDate}
                      />
                    )}
                    {parseInt(passengers || "1", 10) <= 3 && parseInt(luggage || "0", 10) <= 3 && (
                      <VehicleOption
                        name="Luxury"
                        totalAmount={computePriceForVehicle("Luxury")}
                        selected={selectedVehicle === "Luxury"}
                        onSelect={() => handleVehicleSelect("Luxury")}
                        hasReturn={!!returnDate}
                      />
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-500">
                    Calculating route and fare...
                  </div>
                )}

                <button
                  onClick={handleContinueToDetails}
                  disabled={!canProceedToDetails}
                  className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition ${
                    canProceedToDetails
                      ? "bg-sky-700 text-white hover:bg-sky-800"
                      : "cursor-not-allowed bg-zinc-200 text-zinc-400"
                  }`}
                >
                  Continue to traveler details <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {REVIEWS.map((review) => (
                  <article key={review.name} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <StarRow count={review.rating} />
                    <p className="mt-2 text-xs leading-relaxed text-zinc-600">"{review.text}"</p>
                    <p className="mt-3 text-sm font-bold text-zinc-900">{review.name}</p>
                    <p className="text-[11px] font-medium text-zinc-500">{review.role}</p>
                  </article>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  setStep(1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-600 hover:text-zinc-900"
              >
                <ArrowLeft className="h-4 w-4" /> Back to vehicle selection
              </button>

              {isAirportPickup && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <span className="inline-flex items-center gap-2 font-semibold">
                    <Plane className="h-4 w-4" /> Airport pickup detected
                  </span>
                  <p className="mt-1">Please enter your flight number for live tracking and accurate pickup timing.</p>
                </div>
              )}

              <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-[0_24px_40px_-32px_rgba(2,132,199,0.55)]">
                <h2 className="mb-4 text-xl font-black tracking-tight text-zinc-900">Passenger details</h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-zinc-600">
                      First name *
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      autoComplete="given-name"
                      className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-zinc-600">
                      Last name *
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      autoComplete="family-name"
                      className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-zinc-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> Email *
                      </span>
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="john@example.com"
                      autoComplete="email"
                      className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-zinc-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> Phone *
                      </span>
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+31 6 00000000"
                      autoComplete="tel"
                      className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-zinc-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Plane className="h-3.5 w-3.5" /> Flight number {isAirportPickup ? "*" : "(optional)"}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value)}
                      placeholder="KL1234"
                      className={`w-full rounded-xl border px-3.5 py-3 text-sm uppercase text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-zinc-900 ${
                        isAirportPickup ? "border-amber-300 bg-amber-50" : "border-zinc-300 bg-zinc-50"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-zinc-600">
                      Notes (optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Extra pickup instructions"
                      className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-zinc-900"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-[0_24px_40px_-32px_rgba(2,132,199,0.55)]">
                <h3 className="mb-4 text-base font-black tracking-tight text-zinc-900">Payment method</h3>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <Banknote className="h-4.5 w-4.5" />
                  </div>
                  <p className="mt-2 text-sm font-bold">Cash payment only</p>
                  <p className="text-xs text-emerald-800">You pay the driver in cash at pickup.</p>
                </div>
              </div>

              <button
                onClick={handleBookingSubmit}
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Lock className="h-4 w-4" />
                {isSubmitting ? "Confirming..." : "Confirm booking"}
              </button>

              <p className="text-center text-xs text-zinc-500">
                Protected checkout. Your personal data is encrypted and secure.
              </p>
            </div>
          )}
        </section>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-[0_24px_40px_-32px_rgba(2,132,199,0.55)]">
              <div className="border-b border-sky-100 bg-sky-700 px-5 py-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-widest text-sky-100">Price summary</p>
                <p className="mt-1 text-4xl font-black tracking-tight">{totalDisplay}</p>
                {selectedVehicle && (
                  <p className="mt-1 text-xs text-sky-100">
                    {selectedVehicle} • {returnDate ? "Round trip" : bookingType === "hourly" ? `${duration}h` : "One way"}
                  </p>
                )}
              </div>
              <div className="space-y-2.5 px-5 py-4 text-sm">
                {[
                  { label: "Base fare", value: selectedVehicle ? `€${computePrice().toFixed(0)}` : "—" },
                  ...(selectedVehicle && bookingType === "multicity" && totalWaitMinutes > 0
                    ? [
                        {
                          label: `Waiting time (${totalWaitMinutes} min)`,
                          value: `€${((getHourlyRateForVehicle(selectedVehicle) / 60) * totalWaitMinutes).toFixed(0)}`,
                        },
                      ]
                    : []),
                  { label: "Tolls & taxes", value: "Included" },
                ].map((row: any) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-zinc-500">{row.label}</span>
                    <span className={`font-semibold ${row.green ? "text-emerald-600" : "text-zinc-900"}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
                <div className="mt-1 flex items-center justify-between border-t border-zinc-200 pt-3">
                  <span className="font-bold text-zinc-900">Total</span>
                  <span className="text-xl font-black tracking-tight text-zinc-900">{totalDisplay}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Why travelers finish this booking</p>
              <div className="mt-3 space-y-2.5 text-sm text-zinc-700">
                <p className="inline-flex items-start gap-2">
                  <CircleCheck className="mt-0.5 h-4 w-4 text-emerald-600" /> Final price shown before payment
                </p>
                <p className="inline-flex items-start gap-2">
                  <CircleCheck className="mt-0.5 h-4 w-4 text-emerald-600" /> Driver details shared after confirmation
                </p>
                <p className="inline-flex items-start gap-2">
                  <CircleCheck className="mt-0.5 h-4 w-4 text-emerald-600" /> Free cancellation up to 24h before pickup
                </p>
              </div>
            </div>

            {step === 1 && (
              <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
                <div className="h-48">
                  {pickup && (dropoff || bookingType === "hourly") ? (
                    <BookingMap
                      origin={pickup}
                      destination={bookingType === "hourly" ? pickup : dropoff}
                      waypoints={waypointLocations}
                      onRouteCalculated={(info: { distance: number; duration: string; durationValue?: number }) => {
                        if (bookingType !== "hourly") {
                          setDistance(info.distance);
                          setRouteDuration(info.duration);
                          setRouteDurationSeconds(info.durationValue || 0);
                        }
                      }}
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center text-sm text-zinc-400">Route map loading...</div>
                  )}
                </div>
              </div>
            )}

          </div>
        </aside>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white p-3 lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-1">
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Total</p>
            <p className="text-2xl font-black tracking-tight text-zinc-900">{totalDisplay}</p>
          </div>
          <button
            onClick={() => {
              if (step === 1) {
                handleContinueToDetails();
              } else if (step === 2) {
                handleBookingSubmit();
              }
            }}
            disabled={(step === 1 && !canProceedToDetails) || isSubmitting}
            className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-3 text-sm font-bold transition ${
              step === 1 && !canProceedToDetails
                ? "bg-zinc-200 text-zinc-500"
                : step === 2
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-900 text-white"
            }`}
          >
            {step === 1 ? "Continue" : isSubmitting ? "Confirming..." : "Confirm"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
