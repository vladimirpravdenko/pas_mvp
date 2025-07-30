export interface Template {
  field_name: string;
}

export function buildSemanticData(
  templates: Template[],
  answers: Record<string, unknown>
) {
  const result: Record<string, unknown> = {};
  for (const t of templates) result[t.field_name] = answers[t.field_name];
  return result;
}
