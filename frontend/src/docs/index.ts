import architectureRaw from "./architecture.md?raw";
import decisionRecordsRaw from "./decision-records.md?raw";
import solidPrinciplesRaw from "./solid-principles.md?raw";
import securityRaw from "./security.md?raw";
import apiContractsRaw from "./api-contracts.md?raw";
import tangramDesignRaw from "./tangram-design-system.md?raw";
import deploymentRaw from "./deployment.md?raw";

export interface DocArticle {
  slug: string;
  title: string;
  description: string;
  category: "Arquitetura" | "Engenharia" | "API & Contratos" | "Design & UI" | "DevOps & Cloud";
  content: string;
  readingTime: string;
  badge?: string;
}

export const DOC_ARTICLES: DocArticle[] = [
  {
    slug: "architecture",
    title: "Arquitetura e Decisões de Engenharia",
    description: "Visão técnica completa das camadas Clean Architecture e o trade-off entre FastAPI e Django.",
    category: "Arquitetura",
    content: architectureRaw,
    readingTime: "4 min",
    badge: "Core",
  },
  {
    slug: "decision-records",
    title: "ADRs - Architectural Decision Records",
    description: "Histórico de trade-offs arquiteturais formais da escolha do framework até a persistência.",
    category: "Arquitetura",
    content: decisionRecordsRaw,
    readingTime: "5 min",
  },
  {
    slug: "solid-principles",
    title: "Princípios SOLID na Prática",
    description: "Aplicação detalhada de cada uma das cinco letras do SOLID na modelagem orientada a objetos.",
    category: "Engenharia",
    content: solidPrinciplesRaw,
    readingTime: "4 min",
    badge: "SOLID",
  },
  {
    slug: "security",
    title: "Segurança Pragmática & OWASP",
    description: "Diretrizes de proteção HTTP, cabeçalhos defensivos, prevenção a DoS e contenção de privilégios.",
    category: "Engenharia",
    content: securityRaw,
    readingTime: "3 min",
    badge: "OWASP",
  },
  {
    slug: "api-contracts",
    title: "Contratos de API RESTful",
    description: "Especificação rigorosa dos 3 endpoints solicitados pela RD Station e schemas Pydantic.",
    category: "API & Contratos",
    content: apiContractsRaw,
    readingTime: "5 min",
    badge: "REST",
  },
  {
    slug: "tangram-design-system",
    title: "Design System Tangram & Rough.js",
    description: "Conceituação visual da identidade Tangram Sketch com tokens oficiais e Canvas procedural.",
    category: "Design & UI",
    content: tangramDesignRaw,
    readingTime: "3 min",
  },
  {
    slug: "deployment",
    title: "Deploy Contínuo no Coolify via GHCR",
    description: "Guia de orquestração do pipeline CI/CD no GitHub Actions e entrega na VPS sem downtime.",
    category: "DevOps & Cloud",
    content: deploymentRaw,
    readingTime: "3 min",
    badge: "Coolify",
  },
];

export const DOC_CATEGORIES = [
  "Arquitetura",
  "Engenharia",
  "API & Contratos",
  "Design & UI",
  "DevOps & Cloud",
] as const;
