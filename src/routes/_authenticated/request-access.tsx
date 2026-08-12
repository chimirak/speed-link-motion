import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ShieldQuestion, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { requestAdminAccess } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { textareaClass } from "@/components/portal/admin-ui";

export const Route = createFileRoute("/_authenticated/request-access")({
  head: () => ({
    meta: [
      { title: "Request administrator access" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: RequestAccess,
});

/**
 * Applicants ask for administrator access here. The request is reviewed
 * out of band; nothing on this page reveals who reviews it.
 */
function RequestAccess() {
  const submit = useServerFn(requestAdminAccess);
  const [reason, setReason] = useState("");
  const [sent, setSent] = useState(false);

  const mutation = useMutation({
    mutationFn: () => submit({ data: { reason } }),
    onSuccess: () => setSent(true),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="grid min-h-dvh place-items-center px-5 py-20">
      <div className="w-full max-w-md rounded-[1.5rem] surface-card p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/12 text-primary">
          <ShieldQuestion className="size-5" aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-extrabold">Request administrator access</h1>

        {sent ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Your request has been submitted for review. You will be notified once a decision has
            been made.
          </p>
        ) : (
          <>
            <p className="mt-3 text-sm text-muted-foreground">
              Tell us why you need access to the operations console.
            </p>
            <textarea
              className={`${textareaClass} mt-4 text-left`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="I manage day-to-day shipments and need to update tracking."
              maxLength={500}
            />
            <Button
              className="mt-4 w-full justify-center"
              variant="speed"
              size="pill"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Submitting…
                </>
              ) : (
                "Submit request"
              )}
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
