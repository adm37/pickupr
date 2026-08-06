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
  CreditCard,
  Banknote,
  Wifi,
  Snowflake,
  ChevronRight,
  Award,
  ThumbsUp,
  Lock,
  RefreshCw,
  Plane,
  CircleCheck,
  Sparkles,
} from "lucide-react";
import { logEvent } from "../lib/tracking";
import { navigateTo } from "../lib/navigation";

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
    <div className="flex items-center gap-2 sm:gap-3">
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
                      ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                      : "border-zinc-300 bg-white text-zinc-500"
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
              <span className={`h-px w-4 sm:w-10 ${step > n ? "bg-emerald-500" : "bg-zinc-300"}`} />
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
          ? "border-zinc-900 bg-zinc-900 text-white shadow-xl"
          : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-extrabold tracking-tight">{cfg.label}</h3>
            {cfg.badge && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  selected ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {cfg.badge}
              </span>
            )}
          </div>
          <p className={`text-sm ${selected ? "text-zinc-300" : "text-zinc-500"}`}>{cfg.subtitle}</p>
          <div className={`mt-3 flex flex-wrap gap-3 text-xs font-medium ${selected ? "text-zinc-200" : "text-zinc-600"}`}>
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
          <p className={`text-xs ${selected ? "text-zinc-300" : "text-zinc-400"}`}>
            {hasReturn ? "round trip" : "one way"}
          </p>
        </div>
      </div>

      {selected && (
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/15 pt-4 text-xs text-zinc-100">
          {cfg.features.map((f) => (
            <span key={f} className="inline-flex items-center gap-1.5">
              <CircleCheck className="h-3.5 w-3.5" /> {f}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

export default function BookingPage() {
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
  const [paymentMethod, setPaymentMethod] = useState<"Online" | "Driver">("Online");
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [flightNumber, setFlightNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [cardFormReady, setCardFormReady] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const mollieInitRef = useRef(false);
  const cardTokenizeRef = useRef<null | (() => Promise<string>)>(null);
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

  const hasStreetAndHouseNumber = (value: string) => {
    const normalized = value.trim();
    // Require at least one digit so users select a full street address with house number.
    return normalized.length >= 6 && /\d/.test(normalized);
  };

  const getStepOneValidationErrors = () => {
    const errors: string[] = [];

    if (!hasStreetAndHouseNumber(pickup)) {
      errors.push("Pickup must include a full street name and house number.");
    }

    if (bookingType !== "hourly" && !hasStreetAndHouseNumber(dropoff)) {
      errors.push("Drop-off must include a full street name and house number.");
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

  const canProceedToDetails = Boolean(selectedVehicle) && getStepOneValidationErrors().length === 0;

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

  const parseApiJson = async (response: Response, context: string) => {
    const raw = await response.text();
    if (!raw) {
      const backendHint =
        context === "Booking API" || context === "Payment API" || context === "Mollie Components Config"
          ? " Start ook de backend API met: npm run dev:server"
          : "";
      throw new Error(`${context}: empty response from server (status ${response.status}).${backendHint}`);
    }

    try {
      return JSON.parse(raw);
    } catch {
      throw new Error(`${context}: invalid server response (status ${response.status})`);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (step !== 2 || paymentMethod !== "Online") return;
    if (mollieInitRef.current) return;

    let canceled = false;

    const loadMollieScript = async () => {
      if ((window as any).Mollie) return;
      await new Promise<void>((resolve, reject) => {
        const existing = document.querySelector('script[data-mollie-components="true"]') as HTMLScriptElement | null;
        if (existing) {
          existing.addEventListener("load", () => resolve(), { once: true });
          existing.addEventListener("error", () => reject(new Error("Could not load Mollie script")), { once: true });
          return;
        }

        const script = document.createElement("script");
        script.src = "https://js.mollie.com/v1/mollie.js";
        script.async = true;
        script.dataset.mollieComponents = "true";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Could not load Mollie script"));
        document.head.appendChild(script);
      });
    };

    const initComponents = async () => {
      try {
        setCardError(null);
        setCardFormReady(false);

        const cfgRes = await fetch("/api/mollie/components-config");
        const cfg = await parseApiJson(cfgRes, "Mollie Components Config");
        if (!cfgRes.ok || !cfg.profileId) {
          throw new Error(cfg?.error || "MOLLIE_PROFILE_ID is missing on the server.");
        }

        await loadMollieScript();
        if (canceled) return;

        const mollieFactory = (window as any).Mollie;
        if (!mollieFactory) throw new Error("Mollie script is not available.");

        const mollie = mollieFactory(cfg.profileId, {
          locale: "en_US",
          testmode: Boolean(cfg.testmode),
        });

        ["mollie-card-holder", "mollie-card-number", "mollie-expiry-date", "mollie-verification-code"].forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.innerHTML = "";
        });

        const componentStyle = {
          base: {
            color: "#111827",
            fontSize: "14px",
            fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
            '::placeholder': {
              color: "#71717a",
            },
          },
          invalid: {
            color: "#dc2626",
          },
        };

        const cardHolder = mollie.createComponent("cardHolder", { styles: componentStyle });
        const cardNumber = mollie.createComponent("cardNumber", { styles: componentStyle });
        const expiryDate = mollie.createComponent("expiryDate", { styles: componentStyle });
        const verificationCode = mollie.createComponent("verificationCode", { styles: componentStyle });

        cardHolder.mount("#mollie-card-holder");
        cardNumber.mount("#mollie-card-number");
        expiryDate.mount("#mollie-expiry-date");
        verificationCode.mount("#mollie-verification-code");

        const onChange = (event: any) => {
          if (event?.error) setCardError(event.error);
          else setCardError(null);
        };

        cardHolder.addEventListener("change", onChange);
        cardNumber.addEventListener("change", onChange);
        expiryDate.addEventListener("change", onChange);
        verificationCode.addEventListener("change", onChange);

        cardTokenizeRef.current = async () => {
          const result = await mollie.createToken();
          if (result.error || !result.token) {
            throw new Error(result.error?.message || "Card tokenization failed");
          }
          return result.token;
        };

        if (!canceled) {
          mollieInitRef.current = true;
          setCardFormReady(true);
        }
      } catch (err: any) {
        if (!canceled) {
          setCardError(err.message || "Could not initialize the credit card form.");
          setCardFormReady(false);
          cardTokenizeRef.current = null;
        }
      }
    };

    initComponents();

    return () => {
      canceled = true;
    };
  }, [step, paymentMethod]);

  useEffect(() => {
    if (paymentMethod === "Online") return;
    setCardError(null);
    setCardFormReady(false);
    cardTokenizeRef.current = null;
    mollieInitRef.current = false;
  }, [paymentMethod]);

  const generateFallbackBookingId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `BK-${crypto.randomUUID()}`;
    }
    return `BK-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  };

  const handleBookingSubmit = async () => {
    logEvent("Booking Initiated", `Vehicle: ${selectedVehicle} | ${pickup} -> ${dropoff}`);

    if (!firstName.trim() || !lastName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      logEvent("Booking Failed", "Missing fields");
      alert("Please fill in all required fields.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const bookingPriceAmount = computePrice();

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
      });

      const insertResult = await parseApiJson(response, "Booking API");

      if (!response.ok || insertResult.error) {
        logEvent("Booking Failed", `API error: ${insertResult.error?.message || "Unknown"}`);
        alert(`Booking error: ${insertResult.error?.message || "Please try again."}`);
        return;
      }

      if (insertResult.success && insertResult.booking) {
        const resolvedBookingId = String(insertResult.booking.id || generateFallbackBookingId());

        try {
          const existing = JSON.parse(localStorage.getItem("adminBookings") || "[]");
          const createdBooking = {
            id: resolvedBookingId,
            name: `${firstName} ${lastName}`.trim(),
            route:
              bookingType === "hourly"
                ? `${pickup} (Hourly)`
                : `${pickup}${waypointLocations.length ? ` via ${waypointLocations.join(" -> ")}` : ""} to ${dropoff || "N/A"}`,
            date: pickupDate,
            time: pickupTime,
            status: "Pending",
            paymentStatus: paymentMethod === "Online" ? "Pending" : "Pending",
            price: `€ ${bookingPriceAmount.toFixed(2)}`,
            vehicle: selectedVehicle || "Sedan",
            passengers: parseInt(passengers, 10),
            paymentMethod,
            flightNumber,
            notes: notes.trim(),
            client: {
              name: `${firstName} ${lastName}`.trim(),
              phone: customerPhone,
              email: customerEmail,
            },
            origin: pickup,
            destination: dropoff || "N/A",
          };

          const merged = Array.from(new Map([createdBooking, ...existing].map((b: any) => [b.id, b])).values());
          localStorage.setItem("adminBookings", JSON.stringify(merged));
        } catch {
          // Local fallback should never block booking creation flow
        }

        if (paymentMethod === "Driver") {
          logEvent("Booking Confirmed", `Payment method: Driver | Booking: ${resolvedBookingId}`);
          setBookingConfirmed(true);
          return;
        }

        if (!cardTokenizeRef.current || !cardFormReady) {
          alert("The credit card form is not ready yet. Please wait a moment and try again.");
          return;
        }

        setIsPaying(true);
        try {
          let cardToken = "";
          try {
            cardToken = await cardTokenizeRef.current();
          } catch (tokenError: any) {
            setCardError(tokenError.message || "Card details are invalid.");
            alert(tokenError.message || "Card details are invalid.");
            return;
          }

          const paymentRes = await fetch("/api/create-card-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: bookingPriceAmount,
              bookingId: resolvedBookingId,
              currency: "eur",
              rideName: `${pickup} to ${dropoff || "Hourly"}`,
              cardToken,
              returnPath:
                typeof window !== "undefined"
                  ? `${window.location.pathname}${window.location.search}`
                  : "/booking",
            }),
          });

          const payment = await parseApiJson(paymentRes, "Payment API");
          if (!paymentRes.ok) {
            alert(`Payment error: ${payment.error || "Unknown"}`);
            return;
          }

          if (payment.status === "paid" || payment.status === "authorized") {
            logEvent("Booking Confirmed", `Creditcard payment success | Booking: ${resolvedBookingId}`);
            setBookingConfirmed(true);
            return;
          }

          if (payment.checkoutUrl) {
            // In some cases (such as 3D Secure), an additional verification step is required.
            window.location.href = payment.checkoutUrl;
            return;
          }

          if (payment.status === "pending" || payment.status === "open") {
            alert("Payment is being processed. We will send confirmation as soon as the payment is completed.");
            return;
          }

          alert(`Payment error: ${payment.error || payment.status || "Unknown"}`);
        } finally {
          setIsPaying(false);
        }
      }
    } catch (err: any) {
      logEvent("Booking Failed", `Unexpected error: ${err.message}`);
      alert(`Unexpected error: ${err.message}`);
    }
  };

  if (bookingConfirmed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 pt-20 pb-10">
        <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl">
          <div className="border-b border-zinc-200 px-8 py-7">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <Check className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900">Booking confirmed</h1>
            <p className="mt-2 text-sm text-zinc-500">
              {paymentMethod === "Driver" ? "Pay directly to the driver." : "Payment successful and ride secured."}
            </p>
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 pt-20">
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
    <div className="min-h-screen bg-zinc-100 pt-16 pb-24 lg:pb-10">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Stepper step={step} />
          <div className="hidden items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-zinc-600 sm:inline-flex">
            <Lock className="h-3.5 w-3.5 text-emerald-600" /> Secure checkout
          </div>
        </div>
      </header>

      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-bold text-zinc-800 shadow-sm">
                  <MapPin className="h-4 w-4 text-zinc-500" /> {pickup || "—"}
                </span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-400">
                  <ArrowRight className="h-4 w-4" />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2 text-sm font-bold text-white shadow-sm">
                  <MapPin className="h-4 w-4 text-zinc-200" /> {dropoff || (bookingType === "hourly" ? "Hourly ride" : "—")}
                </span>
              </div>

                {waypointLocations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 lg:justify-end">
                    <span className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-600">
                      <MapPin className="h-3.5 w-3.5" /> Via
                    </span>
                    {waypointLocations.map((stop, idx) => (
                      <span
                        key={`${stop}-${idx}`}
                        className="inline-flex items-center rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-600"
                      >
                        {stop}
                      </span>
                    ))}
                  </div>
                )}

              <div className="flex flex-wrap gap-2 lg:justify-end">
                {pickupDate && (
                  <span className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-600">
                    <Calendar className="h-3.5 w-3.5" /> {pickupDate}
                  </span>
                )}
                {pickupTime && (
                  <span className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-600">
                    <Clock className="h-3.5 w-3.5" /> {pickupTime}
                  </span>
                )}
                {passengers && (
                  <span className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-600">
                    <Users className="h-3.5 w-3.5" /> {passengers}
                  </span>
                )}
                {routeDuration && (
                  <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white">
                    <Clock className="h-3.5 w-3.5" /> {routeDuration}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {[
              { icon: <Star className="h-4 w-4 fill-amber-400 text-amber-400" />, text: "4.9/5 rating" },
              { icon: <Award className="h-4 w-4 text-zinc-700" />, text: "10k+ rides" },
              { icon: <Shield className="h-4 w-4 text-zinc-700" />, text: "Fixed fare" },
              { icon: <RefreshCw className="h-4 w-4 text-zinc-700" />, text: "Free cancel 24h" },
              { icon: <Phone className="h-4 w-4 text-zinc-700" />, text: "24/7 support" },
            ].map((item) => (
              <span
                key={item.text}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 sm:text-sm"
              >
                {item.icon}
                <span>{item.text}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          {step === 1 && (
            <>
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900">Book your transfer</h1>
                    <p className="mt-1 text-sm text-zinc-500">Choose the vehicle that matches your trip.</p>
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
                      ? "bg-zinc-900 text-white hover:bg-zinc-800"
                      : "cursor-not-allowed bg-zinc-200 text-zinc-400"
                  }`}
                >
                  Continue to details <ChevronRight className="h-4 w-4" />
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

              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
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

              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-base font-black tracking-tight text-zinc-900">Payment method</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      key: "Online",
                      icon: <CreditCard className="h-4.5 w-4.5" />,
                      title: "Pay online",
                      sub: "Creditcard (Visa / Mastercard / Amex)",
                    },
                    {
                      key: "Driver",
                      icon: <Banknote className="h-4.5 w-4.5" />,
                      title: "Pay driver",
                      sub: "Cash or card",
                    },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className={`cursor-pointer rounded-2xl border p-4 transition ${
                        paymentMethod === item.key
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 bg-zinc-100 text-zinc-900 hover:border-zinc-400"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={paymentMethod === (item.key as any)}
                        onChange={() => {
                          setPaymentMethod(item.key as "Online" | "Driver");
                          logEvent("Payment Method Selected", `Method: ${item.key}`);
                        }}
                        className="sr-only"
                      />
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                        {item.icon}
                      </div>
                      <p className="mt-2 text-sm font-bold">{item.title}</p>
                      <p className={`text-xs ${paymentMethod === item.key ? "text-zinc-200" : "text-zinc-500"}`}>
                        {item.sub}
                      </p>
                    </label>
                  ))}
                </div>

                {paymentMethod === "Online" && (
                  <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-zinc-600">Creditcard checkout</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-xs font-semibold text-zinc-600">Card holder</label>
                        <div id="mollie-card-holder" className="rounded-xl border border-zinc-300 bg-white px-3.5 py-3" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-xs font-semibold text-zinc-600">Card number</label>
                        <div id="mollie-card-number" className="rounded-xl border border-zinc-300 bg-white px-3.5 py-3" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-zinc-600">Expiry date</label>
                        <div id="mollie-expiry-date" className="rounded-xl border border-zinc-300 bg-white px-3.5 py-3" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-zinc-600">CVC</label>
                        <div id="mollie-verification-code" className="rounded-xl border border-zinc-300 bg-white px-3.5 py-3" />
                      </div>
                    </div>
                    {cardError && <p className="mt-2 text-xs font-semibold text-red-600">{cardError}</p>}
                    <p className="mt-2 text-xs text-zinc-500">
                      In rare cases, your bank may ask for an additional 3D Secure verification.
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleBookingSubmit}
                disabled={isPaying || (paymentMethod === "Online" && !cardFormReady)}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-black uppercase tracking-wide text-white transition ${
                  isPaying || (paymentMethod === "Online" && !cardFormReady)
                    ? "cursor-not-allowed bg-emerald-400"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                <Lock className="h-4 w-4" />
                {paymentMethod === "Online" ? (isPaying ? "Processing card..." : "Confirm & pay") : "Confirm booking"}
              </button>

              <p className="text-center text-xs text-zinc-500">
                Protected checkout. Your personal data is encrypted and secure.
              </p>
            </div>
          )}
        </section>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
              <div className="border-b border-zinc-200 bg-zinc-900 px-5 py-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-300">Price summary</p>
                <p className="mt-1 text-4xl font-black tracking-tight">{totalDisplay}</p>
                {selectedVehicle && (
                  <p className="mt-1 text-xs text-zinc-300">
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
            disabled={step === 1 && !canProceedToDetails}
            className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-3 text-sm font-bold transition ${
              step === 1 && !canProceedToDetails
                ? "bg-zinc-200 text-zinc-500"
                : step === 2
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-900 text-white"
            }`}
          >
            {step === 1 ? "Continue" : "Confirm"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
