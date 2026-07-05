import LearnParticles from "@/components/learn/LearnParticles";

export default function LearnBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
      <LearnParticles />
    </div>
  );
}
