"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/toast";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handle() {
    startTransition(async () => {
      await signOut({ redirect: false });
      notify.info("Signed out");
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <button
      onClick={handle}
      disabled={isPending}
      className={cn(
        "btn-ghost w-full justify-center text-xs",
        isPending && "cursor-not-allowed opacity-60"
      )}
    >
      {isPending ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Signing out...
        </>
      ) : (
        <>
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </>
      )}
    </button>
  );
}
