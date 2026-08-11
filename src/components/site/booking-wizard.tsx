import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = ["Sender", "Receiver", "Package", "Service", "Review"] as const;

type Form = {
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  receiverName: string;
  receiverAddress: string;
  receiverPhone: string;
  weight: string;
  dims: string;
  contents: string;
  pickupDate: string;
  method: string;
  insurance: string;
};

const empty: Form = {
  senderName: "",
  senderAddress: "",
  senderPhone: "",
  receiverName: "",
  receiverAddress: "",
  receiverPhone: "",
  weight: "",
  dims: "",
  contents: "",
  pickupDate: "",
  method: "Same-day dedicated",
  insurance: "Standard (£100)",
};

const methods = [
  "Same-day dedicated",
  "Next-flight-out air",
  "Economy air express",
  "Road freight",
];
const insurances = ["Standard (£100)", "Extended (£1,000)", "Full value declared"];

export function BookingWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(empty);
  const [done, setDone] = useState(false);

  const set = (k: keyof Form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const valid = useMemo(() => {
    if (step === 0) return form.senderName.trim() !== "" && form.senderAddress.trim() !== "";
    if (step === 1) return form.receiverName.trim() !== "" && form.receiverAddress.trim() !== "";
    if (step === 2) return form.weight.trim() !== "" && form.contents.trim() !== "";
    return true;
  }, [step, form]);

  const reference = useMemo(
    () =>
      `SLX-${Math.abs(hash(form.receiverName + form.senderName))
        .toString()
        .slice(0, 8)}`,
    [form.receiverName, form.senderName],
  );

  if (done) {
    return (
      <div className="surface-card p-10 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-6" />
        </span>
        <h2 className="mt-6 font-display text-2xl font-extrabold">Booking request received</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Your reference is <span className="numeric font-bold text-foreground">{reference}</span>.
          A coordinator will confirm collection and pricing by email at Speedlinkcourier6@gmail.com
          within 30 minutes during operating hours.
        </p>
        <Button
          variant="speed"
          size="pill-lg"
          className="mt-8"
          onClick={() => {
            setForm(empty);
            setStep(0);
            setDone(false);
          }}
        >
          Book another shipment
        </Button>
      </div>
    );
  }

  return (
    <div className="surface-card overflow-hidden">
      <ol className="flex flex-wrap gap-2 border-b border-border p-4">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span
              className={`grid size-7 place-items-center rounded-full text-xs font-bold transition-colors ${
                i <= step
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span
              className={`text-xs tracking-[0.16em] uppercase ${
                i === step ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s}
            </span>
            {i < steps.length - 1 && (
              <span className="mx-2 h-px w-6 bg-border" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>

      <form
        className="p-6 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          if (step < steps.length - 1) setStep((s) => s + 1);
          else setDone(true);
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-5 sm:grid-cols-2"
          >
            {step === 0 && (
              <>
                <Field label="Sender name" value={form.senderName} onChange={set("senderName")} />
                <Field
                  label="Sender phone"
                  value={form.senderPhone}
                  onChange={set("senderPhone")}
                />
                <Field
                  label="Collection address"
                  value={form.senderAddress}
                  onChange={set("senderAddress")}
                  full
                />
              </>
            )}
            {step === 1 && (
              <>
                <Field
                  label="Receiver name"
                  value={form.receiverName}
                  onChange={set("receiverName")}
                />
                <Field
                  label="Receiver phone"
                  value={form.receiverPhone}
                  onChange={set("receiverPhone")}
                />
                <Field
                  label="Destination address"
                  value={form.receiverAddress}
                  onChange={set("receiverAddress")}
                  full
                />
              </>
            )}
            {step === 2 && (
              <>
                <Field label="Weight (kg)" value={form.weight} onChange={set("weight")} />
                <Field
                  label="Dimensions (cm)"
                  value={form.dims}
                  onChange={set("dims")}
                  placeholder="40 × 30 × 20"
                />
                <Field label="Contents" value={form.contents} onChange={set("contents")} full />
              </>
            )}
            {step === 3 && (
              <>
                <Select
                  label="Shipping method"
                  value={form.method}
                  onChange={set("method")}
                  options={methods}
                />
                <Select
                  label="Insurance"
                  value={form.insurance}
                  onChange={set("insurance")}
                  options={insurances}
                />
                <Field
                  label="Preferred pickup"
                  value={form.pickupDate}
                  onChange={set("pickupDate")}
                  placeholder="Today, 14:00–16:00"
                  full
                />
              </>
            )}
            {step === 4 && (
              <dl className="sm:col-span-2 divide-y divide-border">
                {[
                  ["Sender", `${form.senderName} · ${form.senderAddress}`],
                  ["Receiver", `${form.receiverName} · ${form.receiverAddress}`],
                  ["Package", `${form.weight} kg · ${form.dims || "—"} · ${form.contents}`],
                  ["Service", `${form.method} · ${form.insurance}`],
                  ["Pickup", form.pickupDate || "Next available"],
                ].map(([k, v]) => (
                  <div key={k} className="grid gap-1 py-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
                    <dt className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                      {k}
                    </dt>
                    <dd className="text-sm">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              size="pill-lg"
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft className="size-4" /> Back
            </Button>
          )}
          <Button type="submit" variant="speed" size="pill-lg" disabled={!valid}>
            {step === steps.length - 1 ? "Confirm booking" : "Continue"}
            <ArrowRight className="size-4" />
          </Button>
          <p className="text-xs text-muted-foreground">
            Step {step + 1} of {steps.length}
          </p>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  full,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  full?: boolean;
}) {
  const id = `bk-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <label htmlFor={id} className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        maxLength={140}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary/60"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const id = `bk-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <div>
      <label htmlFor={id} className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary/60"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h;
}
