import type { TechCategoryId, Technology } from '@/data/types';
import type { ColorToken } from '@/lib/palette';

export interface TechCluster {
  id: TechCategoryId;
  /** Already localized by the host section. */
  label: string;
  accent: ColorToken;
  technologies: readonly Technology[];
}

export interface HexTechGridProps {
  clusters: readonly TechCluster[];
  className?: string;
}
