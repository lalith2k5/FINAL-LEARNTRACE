import { getVerifiedSkills } from "@/lib/mastery/evidence";
import { PageHeader } from "@/components/shared/PageHeader";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { requireActiveDomain } from "@/lib/domain";
import { getMasteryView } from "@/lib/mastery/view";
import {
  SkillGraph,
  type GraphEdge,
  type GraphNode,
} from "@/components/viz/SkillGraph";

export const dynamic = "force-dynamic";

export default async function GraphPage() {
  const user = await requireUser();
  const domain = await requireActiveDomain(user.id);

  const skills = await prisma.skill.findMany({
    where: { domainId: domain.id },
    orderBy: [{ difficulty: "asc" }, { name: "asc" }],
  });
  const prereqs = await prisma.prerequisite.findMany({
    where: { parent: { domainId: domain.id } },
  });

  const view = await getMasteryView(user.id);
  const verifiedSkills = await getVerifiedSkills(user.id, domain.id);
  const effective = view.asEffectiveRecord();

  const domainSkillIds = new Set(skills.map((s) => s.id));
  const domainAttemptedCount = view.list.filter((v) =>
    domainSkillIds.has(v.skillId)
  ).length;
  const domainDecayingCount = view.revisionQueue.filter((v) =>
    domainSkillIds.has(v.skillId)
  ).length;

  const edges: GraphEdge[] = prereqs.map((p) => ({
    parentId: p.parentId,
    childId: p.childId,
  }));

  const nodes: GraphNode[] = skills.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    mastery: effective[s.id] ?? 0,
    difficulty: s.difficulty,
    description: s.description,
    verified: verifiedSkills.has(s.id),
    parents: prereqs.filter((p) => p.childId === s.id).map((p) => p.parentId),
    children: prereqs.filter((p) => p.parentId === s.id).map((p) => p.childId),
  }));

  const description =
    `${skills.length} skills · ${edges.length} prerequisite edges · ${domainAttemptedCount} attempted` +
    (domainDecayingCount > 0 ? ` · ${domainDecayingCount} decaying` : "");

  return (
    <>
      <PageHeader
        eyebrow="Knowledge Graph"
        title={domain.name}
        description={description}
      />
      <SkillGraph nodes={nodes} edges={edges} />
    </>
  );
}
