export const homeConcepts = ["editorial"] as const;

export type HomeConcept = (typeof homeConcepts)[number];

const homeConceptSet = new Set<string>(homeConcepts);

export function resolveHomeConcept(value: string | null | undefined): HomeConcept {
  const normalized = value?.trim().toLowerCase();
  if (normalized && homeConceptSet.has(normalized)) {
    return normalized as HomeConcept;
  }
  return "editorial";
}
