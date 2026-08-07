import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { PageHero, Section } from "@/components/site/page-shell";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Clock, ArrowRight } from "lucide-react";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () =>
    pageHead({
      title: "Contact",
      description:
        "Contact Speed Link Express Logistics at The Hub, Fowler Avenue, Farnborough, United Kingdom. Email Speedlinkcourier6@gmail.com — 24/7 operations.",
      path: "/contact",
    }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  company: z.string().trim().max(120).optional(),
  message: z.string().trim().min(10, "Please add a little more detail").max(1000),
});

function ContactPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  return (
    <>
      <PageHero
        kicker="Contact"
        title="Talk to a coordinator,"
        highlight="not a queue."
        intro="Our operations desk is staffed around the clock. Tell us what needs moving and we will come back with a plan and a price."
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <Reveal>
            <form
              className="surface-card grid gap-5 p-7 sm:grid-cols-2 sm:p-9"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const result = schema.safeParse({
                  name: fd.get("name"),
                  email: fd.get("email"),
                  company: fd.get("company"),
                  message: fd.get("message"),
                });
                if (!result.success) {
                  const next: Record<string, string> = {};
                  for (const issue of result.error.issues) {
                    next[String(issue.path[0])] = issue.message;
                  }
                  setErrors(next);
                  return;
                }
                setErrors({});
                setSent(true);
                e.currentTarget.reset();
                toast.success("Message sent", {
                  description: "A coordinator will reply within 30 minutes during operating hours.",
                });
              }}
            >
              <Field name="name" label="Your name" error={errors["name"]} />
              <Field name="email" label="Email" type="email" error={errors["email"]} />
              <Field name="company" label="Company (optional)" error={errors["company"]} full />
              <div className="sm:col-span-2">
                <label
                  htmlFor="message"
                  className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase"
                >
                  What do you need moved?
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  maxLength={1000}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary/60"
                />
                {errors["message"] && (
                  <p className="mt-2 text-xs text-primary">{errors["message"]}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" variant="speed" size="pill-lg">
                  Send message <ArrowRight className="size-4" />
                </Button>
                {sent && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Thanks — your enquiry is with the operations desk.
                  </p>
                )}
              </div>
            </form>
          </Reveal>

          <Reveal direction="left" delay={0.1}>
            <div className="flex h-full flex-col justify-between rounded-[var(--radius-2xl)] bg-ink p-8 text-ink-foreground">
              <div className="space-y-8">
                <div>
                  <MapPin className="size-5 text-primary" aria-hidden="true" />
                  <h2 className="mt-4 font-display text-lg font-bold">Head office</h2>
                  <address className="mt-2 text-sm leading-relaxed text-ink-muted not-italic">
                    The Hub, Fowler Avenue
                    <br />
                    Farnborough
                    <br />
                    United Kingdom
                  </address>
                </div>
                <div>
                  <Mail className="size-5 text-primary" aria-hidden="true" />
                  <h2 className="mt-4 font-display text-lg font-bold">Email</h2>
                  <a
                    href="mailto:Speedlinkcourier6@gmail.com"
                    className="mt-2 block break-all text-sm text-ink-muted transition-colors hover:text-primary"
                  >
                    Speedlinkcourier6@gmail.com
                  </a>
                </div>
                <div>
                  <Clock className="size-5 text-primary" aria-hidden="true" />
                  <h2 className="mt-4 font-display text-lg font-bold">Operating hours</h2>
                  <p className="mt-2 text-sm text-ink-muted">
                    24 hours a day, 7 days a week, including bank holidays.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}

function Field({
  name,
  label,
  type = "text",
  error,
  full,
}: {
  name: string;
  label: string;
  type?: string;
  error?: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <label htmlFor={name} className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        maxLength={255}
        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary/60"
      />
      {error && <p className="mt-2 text-xs text-primary">{error}</p>}
    </div>
  );
}
