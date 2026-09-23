import { PageHeader } from "@/components/shared/PageHeader";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { SimulatorPanel } from "@/components/viz/SimulatorPanel";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { requireActiveDomain } from "@/lib/domain";
import { getMasteryView } from "@/lib/mastery/view";

export const dynamic = "force-dynamic";

export default async function SimulatorPage() {
  const user = await requireUser();
  const domain = await requireActiveDomain(user.id);

  const skills = await prisma.skill.findMany({
    where: { domainId: domain.id },
    orderBy: [{ difficulty: "asc" }, { name: "asc" }],
  });

  const view = await getMasteryView(user.id);
  const effective = view.asEffectiveRecord();

  const domainSkillIds = new Set(skills.map((s) => s.id));
  const options = skills.map((s) => ({
    id: s.id,
    name: s.name,
    mastery: domainSkillIds.has(s.id) ? effective[s.id] ?? 0 : 0,
    difficulty: s.difficulty,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Simulator"
        title={`${domain.name} — What-if`}
        description="Project how a learning decision cascades through the prerequisite graph."
      />
      {options.length === 0 ? (
        <GlassPanel className="p-8 text-center text-sm text-text-tertiary">
          No skills in this domain yet.
        </GlassPanel>
      ) : (
        <SimulatorPanel skills={options} />
      )}
    </>
  );
}
