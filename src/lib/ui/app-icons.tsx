import type { LucideIcon } from "lucide-react";
import {
  Layers,
  Store,
  Smartphone,
  Terminal,
  Sparkles,
  ShoppingCart,
  Wrench,
  UserRound,
  MoreHorizontal,
  FileText,
  Blocks,
  ListChecks,
  Palette,
  Bot,
  Wand2,
  Wallet,
  BarChart3,
  FlaskConical,
  Mail,
  Target,
  ShieldCheck,
  Database,
  Scale,
  Zap,
  Gauge,
  Rocket,
  Crown,
  Lightbulb,
  Hammer,
  Rocket as RocketStage,
} from "lucide-react";
import type { ProductType, ProjectStage } from "@/components/generate/types";
import type { FileKey } from "@/components/generate/types";
import type { ModelClass } from "@/components/generate/types";

const ICON_PROPS = { size: 20, strokeWidth: 1.75 as const };

export const PRODUCT_TYPE_ICONS: Record<ProductType, LucideIcon> = {
  saas: Layers,
  marketplace: Store,
  mobile: Smartphone,
  api: Terminal,
  "ai-app": Sparkles,
  ecommerce: ShoppingCart,
  internal: Wrench,
  portfolio: UserRound,
  other: MoreHorizontal,
};

export const DOC_ICONS: Partial<Record<FileKey, LucideIcon>> = {
  prd: FileText,
  architecture: Blocks,
  "plan-task": ListChecks,
  "design-system": Palette,
  "agent-rules": Bot,
  "adaptive-document": Wand2,
  "cost-infrastructure": Wallet,
  "analytics-metrics": BarChart3,
  "testing-qa": FlaskConical,
  "onboarding-email": Mail,
  "competitive-analysis": Target,
  "security-launch": ShieldCheck,
  "database-deep-dive": Database,
  "compliance-legal": Scale,
};

export const MODEL_CLASS_ICONS: Record<ModelClass, LucideIcon> = {
  hemat: Zap,
  menengah: Gauge,
  flagship: Rocket,
  ultra: Crown,
};

export const STAGE_ICONS: Record<ProjectStage, LucideIcon> = {
  idea: Lightbulb,
  prototype: Hammer,
  production: RocketStage,
};

export function ProductTypeIcon({
  type,
  size = 20,
  className,
}: {
  type: ProductType | string;
  size?: number;
  className?: string;
}) {
  const Icon = PRODUCT_TYPE_ICONS[type as ProductType] ?? MoreHorizontal;
  return <Icon size={size} strokeWidth={1.75} className={className} />;
}

export function DocIcon({
  doc,
  size = 16,
  className,
  style,
}: {
  doc: FileKey | string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon = DOC_ICONS[doc as FileKey] ?? FileText;
  return <Icon size={size} strokeWidth={1.75} className={className} style={style} />;
}

export function ModelClassIcon({
  modelClass,
  size = 14,
  className,
}: {
  modelClass: ModelClass;
  size?: number;
  className?: string;
}) {
  const Icon = MODEL_CLASS_ICONS[modelClass];
  return <Icon size={size} strokeWidth={1.75} className={className} />;
}

export function StageIcon({
  stage,
  size = 18,
  className,
}: {
  stage: ProjectStage;
  size?: number;
  className?: string;
}) {
  const Icon = STAGE_ICONS[stage];
  return <Icon size={size} strokeWidth={1.75} className={className} />;
}

export { ICON_PROPS };
