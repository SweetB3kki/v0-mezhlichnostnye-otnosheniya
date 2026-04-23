export type FiroScale = "Ie" | "Iw" | "Ce" | "Cw" | "Ae" | "Aw";

export type FiroScoreLevel =
  | "EXTREMELY_LOW"
  | "LOW"
  | "BORDERLINE"
  | "HIGH"
  | "EXTREMELY_HIGH";

export type FiroDomainCode = "inclusion" | "control" | "affection";

export type FiroScaleProfile = {
  score: number;
  level: FiroScoreLevel;
  name: string;
  description: string;
  domain: FiroDomainCode;
  direction: "expressed" | "wanted";
};

export type FiroDomainProfile = {
  name: string;
  expressedScale: FiroScale;
  wantedScale: FiroScale;
  expressed: number;
  wanted: number;
  volume: number;
  contradiction: number;
};

export type FiroProfile = {
  scores: Record<FiroScale, number>;
  scales: Record<FiroScale, FiroScaleProfile>;
  domains: Record<FiroDomainCode, FiroDomainProfile>;
  count: number;
  sum: number;
  avg: number;
};

type FiroKeyConfig = Record<FiroScale, Array<{ questionNumber: number; accepted: number[] }>>;

export const FIRO_SCALE_ORDER: FiroScale[] = ["Ie", "Iw", "Ce", "Cw", "Ae", "Aw"];

export const FIRO_LEVEL_LABELS: Record<FiroScoreLevel, string> = {
  EXTREMELY_LOW: "Экстремально низкий",
  LOW: "Низкий",
  BORDERLINE: "Пограничный",
  HIGH: "Высокий",
  EXTREMELY_HIGH: "Экстремально высокий",
};

export const FIRO_SCALE_META: Record<
  FiroScale,
  {
    name: string;
    description: string;
    domain: FiroDomainCode;
    direction: "expressed" | "wanted";
  }
> = {
  Ie: {
    name: "Включение выраженное (Ie)",
    description:
      "Стремление принимать остальных, чтобы они имели интерес ко мне и принимали участие в моей деятельности.",
    domain: "inclusion",
    direction: "expressed",
  },
  Iw: {
    name: "Включение требуемое (Iw)",
    description:
      "Ожидание, что другие будут приглашать меня участвовать в их деятельности и стремиться быть в моем обществе.",
    domain: "inclusion",
    direction: "wanted",
  },
  Ce: {
    name: "Контроль выраженный (Ce)",
    description:
      "Стремление контролировать и направлять остальных, брать на себя руководство и ответственность.",
    domain: "control",
    direction: "expressed",
  },
  Cw: {
    name: "Контроль требуемый (Cw)",
    description:
      "Ожидание, что другие будут контролировать меня, влиять на меня и подсказывать, что следует делать.",
    domain: "control",
    direction: "wanted",
  },
  Ae: {
    name: "Аффект выраженный (Ae)",
    description:
      "Стремление устанавливать близкие, теплые и эмоционально насыщенные отношения с другими.",
    domain: "affection",
    direction: "expressed",
  },
  Aw: {
    name: "Аффект требуемый (Aw)",
    description:
      "Ожидание, что другие будут стремиться к эмоциональной близости и теплому отношению со мной.",
    domain: "affection",
    direction: "wanted",
  },
};

const FIRO_DOMAIN_META: Record<
  FiroDomainCode,
  { name: string; expressedScale: FiroScale; wantedScale: FiroScale }
> = {
  inclusion: { name: "Включение", expressedScale: "Ie", wantedScale: "Iw" },
  control: { name: "Контроль", expressedScale: "Ce", wantedScale: "Cw" },
  affection: { name: "Аффект", expressedScale: "Ae", wantedScale: "Aw" },
};

const FIRO_KEYS: FiroKeyConfig = {
  Ie: [
    { questionNumber: 1, accepted: [1, 2, 3, 4] },
    { questionNumber: 3, accepted: [1, 2, 3, 4, 5] },
    { questionNumber: 5, accepted: [1, 2, 3, 4, 5] },
    { questionNumber: 7, accepted: [1, 2, 3] },
    { questionNumber: 9, accepted: [1, 2, 3] },
    { questionNumber: 11, accepted: [1, 2] },
    { questionNumber: 13, accepted: [1] },
    { questionNumber: 15, accepted: [1] },
    { questionNumber: 16, accepted: [1] },
  ],
  Iw: [
    { questionNumber: 28, accepted: [1, 2] },
    { questionNumber: 31, accepted: [1, 2] },
    { questionNumber: 34, accepted: [1, 2] },
    { questionNumber: 37, accepted: [1] },
    { questionNumber: 39, accepted: [1] },
    { questionNumber: 42, accepted: [1, 2, 3] },
    { questionNumber: 45, accepted: [1, 2, 3] },
    { questionNumber: 48, accepted: [1, 2, 3, 4] },
    { questionNumber: 51, accepted: [1, 2, 3] },
  ],
  Ce: [
    { questionNumber: 30, accepted: [1, 2, 3, 4] },
    { questionNumber: 33, accepted: [1, 2, 3, 4, 5] },
    { questionNumber: 36, accepted: [1, 2, 3] },
    { questionNumber: 41, accepted: [1, 2, 3, 4, 5] },
    { questionNumber: 44, accepted: [1, 2, 3, 4] },
    { questionNumber: 47, accepted: [1, 2, 3, 4, 5] },
    { questionNumber: 50, accepted: [1, 2, 3, 4] },
    { questionNumber: 53, accepted: [1, 2, 3, 4] },
    { questionNumber: 54, accepted: [1, 2, 3] },
  ],
  Cw: [
    { questionNumber: 2, accepted: [1, 2, 3, 4, 5] },
    { questionNumber: 6, accepted: [1, 2, 3] },
    { questionNumber: 10, accepted: [1, 2, 3] },
    { questionNumber: 14, accepted: [1, 2, 3] },
    { questionNumber: 18, accepted: [1, 2, 3, 4] },
    { questionNumber: 20, accepted: [1, 2, 3, 4] },
    { questionNumber: 22, accepted: [1, 2, 3, 4] },
    { questionNumber: 24, accepted: [2] },
    { questionNumber: 26, accepted: [2] },
  ],
  Ae: [
    { questionNumber: 4, accepted: [1, 2] },
    { questionNumber: 8, accepted: [1, 2] },
    { questionNumber: 12, accepted: [1] },
    { questionNumber: 17, accepted: [1, 2, 3] },
    { questionNumber: 19, accepted: [3, 4, 5, 6] },
    { questionNumber: 21, accepted: [1] },
    { questionNumber: 23, accepted: [1] },
    { questionNumber: 25, accepted: [3, 4, 5, 6] },
    { questionNumber: 27, accepted: [1] },
  ],
  Aw: [
    { questionNumber: 29, accepted: [1] },
    { questionNumber: 32, accepted: [1, 2] },
    { questionNumber: 35, accepted: [5, 6] },
    { questionNumber: 38, accepted: [1, 2, 3] },
    { questionNumber: 40, accepted: [5, 6] },
    { questionNumber: 43, accepted: [1] },
    { questionNumber: 46, accepted: [4, 5, 6] },
    { questionNumber: 49, accepted: [1] },
    { questionNumber: 52, accepted: [5, 6] },
  ],
};

function questionKeyToNumber(questionKey: string): number | null {
  const match = /^firo_(\d+)$/.exec(questionKey);
  if (!match) return null;
  const number = Number(match[1]);
  return Number.isInteger(number) ? number : null;
}

function scoreToLevel(score: number): FiroScoreLevel {
  if (score <= 1) return "EXTREMELY_LOW";
  if (score <= 3) return "LOW";
  if (score <= 5) return "BORDERLINE";
  if (score <= 7) return "HIGH";
  return "EXTREMELY_HIGH";
}

export function getFiroLevelLabel(level: FiroScoreLevel): string {
  return FIRO_LEVEL_LABELS[level];
}

export function calculateFiroProfile(
  responses: Array<{ questionKey: string; value: number }> | Record<string, number>,
): FiroProfile {
  const responseMap = new Map<number, number>();
  const list = Array.isArray(responses)
    ? responses
    : Object.entries(responses).map(([questionKey, value]) => ({ questionKey, value }));

  let sum = 0;
  let count = 0;

  for (const item of list) {
    const questionNumber = questionKeyToNumber(item.questionKey);
    if (questionNumber == null) continue;
    const value = typeof item.value === "number" ? item.value : Number(item.value);
    if (!Number.isFinite(value) || value < 1 || value > 6) continue;
    responseMap.set(questionNumber, value);
    sum += value;
    count += 1;
  }

  const scores = {} as Record<FiroScale, number>;
  const scales = {} as Record<FiroScale, FiroScaleProfile>;

  for (const scale of FIRO_SCALE_ORDER) {
    const score = FIRO_KEYS[scale].reduce((total, item) => {
      const answer = responseMap.get(item.questionNumber);
      if (answer == null) return total;
      return total + (item.accepted.includes(answer) ? 1 : 0);
    }, 0);

    const meta = FIRO_SCALE_META[scale];
    scores[scale] = score;
    scales[scale] = {
      score,
      level: scoreToLevel(score),
      name: meta.name,
      description: meta.description,
      domain: meta.domain,
      direction: meta.direction,
    };
  }

  const domains = {} as Record<FiroDomainCode, FiroDomainProfile>;
  for (const [domainCode, meta] of Object.entries(FIRO_DOMAIN_META) as Array<
    [FiroDomainCode, (typeof FIRO_DOMAIN_META)[FiroDomainCode]]
  >) {
    const expressed = scores[meta.expressedScale];
    const wanted = scores[meta.wantedScale];
    domains[domainCode] = {
      name: meta.name,
      expressedScale: meta.expressedScale,
      wantedScale: meta.wantedScale,
      expressed,
      wanted,
      volume: expressed + wanted,
      contradiction: expressed - wanted,
    };
  }

  return {
    scores,
    scales,
    domains,
    count,
    sum,
    avg: count === 0 ? 0 : sum / count,
  };
}
