import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { requireActiveDomain } from "@/lib/domain";

export const dynamic = "force-dynamic";

export default async function PracticePage() {
  const user = await requireUser();
  const domain = await requireActiveDomain(user.id);

  const tasks = await prisma.practicalTask.findMany({
    where: { domainId: domain.id },
    orderBy: [{ difficulty: "asc" }, { title: "asc" }],
    include: {
      skills: { include: { skill: true } },
      submissions: {
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="Practice"
        title="Hands-on coding tasks"
        description={`Write and test real code for ${domain.name}. Runs in your browser — no setup required.`}
      />

      {tasks.length === 0 ? (
        <GlassPanel className="p-8 text-center text-sm text-text-tertiary">
          No practical tasks yet. Run{" "}
          <code className="rounded bg-bg-inset px-1.5 py-0.5 text-xs">
            pnpm tsx scripts/seed-practical.ts
          </code>{" "}
          to seed the starter set.
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => {
            const latest = task.submissions[0];
            const passedAll = latest?.passedAll ?? false;
            const attempted = !!latest;

            return (
              <GlassPanel
                key={task.id}
                glow
                className={[
                  "flex h-full flex-col",
                  passedAll
                    ? "border-emerald/40"
                    : attempted
                    ? "border-amber/40"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="label-mono">Difficulty {task.difficulty}/5</p>
                    <p className="mt-1 truncate text-base font-medium text-text-primary">
                      {task.title}
                    </p>
                  </div>

                  {passedAll ? (
                    <span className="label-mono shrink-0 rounded-md border border-emerald/40 bg-emerald/10 px-1.5 py-0.5 text-emerald">
                      ✓ Solved
                    </span>
                  ) : attempted ? (
                    <span className="label-mono shrink-0 rounded-md border border-amber/40 bg-amber/10 px-1.5 py-0.5 text-amber">
                      In progress
                    </span>
                  ) : null}
                </div>

                {/* Description */}
                <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-text-tertiary">
                  {task.description}
                </p>

                {/* Skills */}
                {task.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {task.skills.slice(0, 2).map((ts) => (
                      <span
                        key={ts.skillId}
                        className="rounded border border-border-subtle bg-bg-inset/40 px-1.5 py-0.5 text-[10px] text-text-tertiary"
                      >
                        {ts.skill.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Push CTA to bottom */}
                <div className="mt-auto">
                  {latest && (
                    <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-3 text-[11px]">
                      <span className="num text-text-tertiary">
                        {latest.passed} / {latest.total} tests passed
                      </span>
                      <span
                        className={
                          latest.passedAll
                            ? "text-emerald"
                            : latest.passed > 0
                            ? "text-amber"
                            : "text-rose"
                        }
                      >
                        {latest.passedAll
                          ? "All green"
                          : latest.passed > 0
                          ? "Partial"
                          : "No passes yet"}
                      </span>
                    </div>
                  )}

                  <Link
                    href={`/practice/${task.slug}`}
                    className="btn-primary mt-4 w-full"
                  >
                    {attempted ? "Resume →" : "Start task →"}
                  </Link>
                </div>
              </GlassPanel>
            );
          })}
        </div>
      )}
    </>
  );
}
