import { FaAws, FaArrowsRotate, FaDatabase } from 'react-icons/fa6';
import { TbApi, TbBrowserCheck } from 'react-icons/tb';
import {
  SiAppwrite, SiCircleci, SiClaude, SiCss, SiDocker, SiExpo, SiExpress,
  SiFigma, SiFramer, SiGit, SiGithub, SiGnubash, SiGraphql, SiGreensock,
  SiHtml5, SiJavascript, SiJest, SiJira, SiJsonwebtokens, SiJupyter, SiKeras,
  SiMongodb, SiMysql, SiNestjs, SiNextdotjs, SiNodedotjs, SiNumpy, SiPandas,
  SiPostgresql, SiPostman, SiPrisma, SiPython, SiReact, SiRedux, SiSass,
  SiScikitlearn, SiSwagger, SiTailwindcss, SiTensorflow, SiThreedotjs,
  SiTypescript, SiVercel, SiVite,
} from 'react-icons/si';

import type { TechCategory, Technology } from './types';

/**
 * The four clusters of the hex grid, each with the palette token that tints it
 * on hover (§F). The grid reads this list — adding a fifth category needs no
 * component change.
 */
export const TECH_CATEGORIES: readonly TechCategory[] = [
  { id: 'frontend', accent: 'magenta' },
  { id: 'backend', accent: 'cyan' },
  { id: 'data', accent: 'spring' },
  { id: 'tools', accent: 'amber' },
];

/**
 * Every technology on the CV, plus the complementary set this site itself is
 * built with. Icons are bundled react-icons components — the old portfolio
 * hotlinked a CDN for these, which is exactly what we are not doing again.
 *
 * A few entries have no brand mark and use a semantic icon instead: REST APIs,
 * SQL, CI/CD and Playwright. React Native shares the React atom, which is its
 * actual logo.
 */
export const TECHNOLOGIES: readonly Technology[] = [
  // ── FRONTEND ──
  { id: 'react', name: 'React', category: 'frontend', Icon: SiReact },
  { id: 'nextjs', name: 'Next.js', category: 'frontend', Icon: SiNextdotjs },
  { id: 'typescript', name: 'TypeScript', category: 'frontend', Icon: SiTypescript },
  { id: 'javascript', name: 'JavaScript', category: 'frontend', Icon: SiJavascript },
  { id: 'tailwind', name: 'Tailwind CSS', category: 'frontend', Icon: SiTailwindcss },
  { id: 'redux', name: 'Redux', category: 'frontend', Icon: SiRedux },
  { id: 'react-native', name: 'React Native', category: 'frontend', Icon: SiReact },
  { id: 'expo', name: 'Expo', category: 'frontend', Icon: SiExpo },
  { id: 'html5', name: 'HTML5', category: 'frontend', Icon: SiHtml5 },
  { id: 'css3', name: 'CSS3', category: 'frontend', Icon: SiCss },
  { id: 'scss', name: 'SCSS', category: 'frontend', Icon: SiSass },
  { id: 'framer-motion', name: 'Framer Motion', category: 'frontend', Icon: SiFramer },
  { id: 'threejs', name: 'Three.js', category: 'frontend', Icon: SiThreedotjs },
  { id: 'gsap', name: 'GSAP', category: 'frontend', Icon: SiGreensock },
  { id: 'vite', name: 'Vite', category: 'frontend', Icon: SiVite },

  // ── BACKEND ──
  { id: 'nodejs', name: 'Node.js', category: 'backend', Icon: SiNodedotjs },
  { id: 'nestjs', name: 'NestJS', category: 'backend', Icon: SiNestjs },
  { id: 'express', name: 'Express', category: 'backend', Icon: SiExpress },
  { id: 'graphql', name: 'GraphQL', category: 'backend', Icon: SiGraphql },
  { id: 'prisma', name: 'Prisma ORM', category: 'backend', Icon: SiPrisma },
  { id: 'rest', name: 'REST APIs', category: 'backend', Icon: TbApi },
  { id: 'jwt', name: 'JWT / Passport', category: 'backend', Icon: SiJsonwebtokens },
  { id: 'python', name: 'Python', category: 'backend', Icon: SiPython },
  { id: 'swagger', name: 'Swagger / OpenAPI', category: 'backend', Icon: SiSwagger },

  // ── DATA ──
  { id: 'postgresql', name: 'PostgreSQL', category: 'data', Icon: SiPostgresql },
  { id: 'sql', name: 'SQL', category: 'data', Icon: FaDatabase },
  { id: 'mysql', name: 'MySQL', category: 'data', Icon: SiMysql },
  { id: 'mongodb', name: 'MongoDB', category: 'data', Icon: SiMongodb },
  { id: 'appwrite', name: 'Appwrite', category: 'data', Icon: SiAppwrite },
  { id: 'pandas', name: 'Pandas', category: 'data', Icon: SiPandas },
  { id: 'numpy', name: 'NumPy', category: 'data', Icon: SiNumpy },
  { id: 'tensorflow', name: 'TensorFlow', category: 'data', Icon: SiTensorflow },
  { id: 'keras', name: 'Keras', category: 'data', Icon: SiKeras },
  { id: 'scikit-learn', name: 'scikit-learn', category: 'data', Icon: SiScikitlearn },
  { id: 'jupyter', name: 'Jupyter Notebooks', category: 'data', Icon: SiJupyter },

  // ── TOOLS ──
  { id: 'docker', name: 'Docker', category: 'tools', Icon: SiDocker },
  { id: 'aws', name: 'AWS', category: 'tools', Icon: FaAws },
  { id: 'cicd', name: 'CI/CD', category: 'tools', Icon: FaArrowsRotate },
  { id: 'circleci', name: 'CircleCI', category: 'tools', Icon: SiCircleci },
  { id: 'git', name: 'Git', category: 'tools', Icon: SiGit },
  { id: 'github', name: 'GitHub', category: 'tools', Icon: SiGithub },
  { id: 'jest', name: 'Jest', category: 'tools', Icon: SiJest },
  { id: 'playwright', name: 'Playwright', category: 'tools', Icon: TbBrowserCheck },
  { id: 'bash', name: 'Bash', category: 'tools', Icon: SiGnubash },
  { id: 'vercel', name: 'Vercel', category: 'tools', Icon: SiVercel },
  { id: 'figma', name: 'Figma', category: 'tools', Icon: SiFigma },
  { id: 'jira', name: 'Jira', category: 'tools', Icon: SiJira },
  { id: 'postman', name: 'Postman', category: 'tools', Icon: SiPostman },
  { id: 'claude', name: 'Claude / AI tooling', category: 'tools', Icon: SiClaude },
];

const BY_ID = new Map(TECHNOLOGIES.map((tech) => [tech.id, tech]));

/** Unknown ids are dropped rather than thrown: a typo in entries.ts should not
 *  take down the page, and the missing chip is obvious in review. */
export function resolveTechnologies(ids: readonly string[]): readonly Technology[] {
  return ids.flatMap((id) => {
    const tech = BY_ID.get(id);
    return tech ? [tech] : [];
  });
}

export function technologiesByCategory(id: TechCategory['id']): readonly Technology[] {
  return TECHNOLOGIES.filter((tech) => tech.category === id);
}
