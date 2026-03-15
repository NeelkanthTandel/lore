export type RelationDirection = 'one-way' | 'two-way' | 'undirected';

export interface RelationPreset {
  id: string;
  label: string;
  direction: RelationDirection;
}

/** Presets used for edge labels and for inference rules. */
export const RELATION_PRESETS: RelationPreset[] = [
  { id: 'father_of', label: 'Father of', direction: 'one-way' },
  { id: 'mother_of', label: 'Mother of', direction: 'one-way' },
  { id: 'son_of', label: 'Son of', direction: 'one-way' },
  { id: 'daughter_of', label: 'Daughter of', direction: 'one-way' },
  { id: 'spouse', label: 'Spouse', direction: 'two-way' },
  { id: 'same_person', label: 'Same person', direction: 'two-way' },
  { id: 'sibling_of', label: 'Sibling', direction: 'two-way' },
  { id: 'brother_of', label: 'Brother', direction: 'two-way' },
  { id: 'sister_of', label: 'Sister', direction: 'two-way' },
  { id: 'uncle_of', label: 'Uncle of', direction: 'one-way' },
  { id: 'aunt_of', label: 'Aunt of', direction: 'one-way' },
  { id: 'nephew_of', label: 'Nephew of', direction: 'one-way' },
  { id: 'niece_of', label: 'Niece of', direction: 'one-way' },
  { id: 'grandfather_of', label: 'Grandfather of', direction: 'one-way' },
  { id: 'grandmother_of', label: 'Grandmother of', direction: 'one-way' },
  { id: 'grandson_of', label: 'Grandson of', direction: 'one-way' },
  { id: 'granddaughter_of', label: 'Granddaughter of', direction: 'one-way' },
  { id: 'friend', label: 'Friend', direction: 'two-way' },
  { id: 'enemy', label: 'Enemy', direction: 'two-way' },
  { id: 'mentor_of', label: 'Mentor of', direction: 'one-way' },
  { id: 'works_with', label: 'Works with', direction: 'two-way' },
  { id: 'loves', label: 'Loves', direction: 'one-way' },
  { id: 'custom', label: 'Custom', direction: 'undirected' },
];

export function getPresetById(id: string): RelationPreset | undefined {
  return RELATION_PRESETS.find(p => p.id === id);
}

export function getPresetByLabel(label: string): RelationPreset | undefined {
  return RELATION_PRESETS.find(p => p.label === label);
}
