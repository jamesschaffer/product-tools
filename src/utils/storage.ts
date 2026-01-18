import type { Roadmap } from '../types';

const STORAGE_KEY = 'product-toolkit-data';

export function saveRoadmap(roadmap: Roadmap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(roadmap));
}

export function loadRoadmap(): Roadmap | null {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;

  try {
    return JSON.parse(data) as Roadmap;
  } catch {
    return null;
  }
}

export function clearRoadmap(): void {
  localStorage.removeItem(STORAGE_KEY);
}
