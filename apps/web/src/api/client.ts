import type { Creature, Spell } from '@demesne/types';

// Use Vite's environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const defaultHeaders = {
  'Content-Type': 'application/json',
};

export async function getCreatures(): Promise<Creature[]> {
  const response = await fetch(`${API_BASE_URL}/api/creatures`, {
    headers: defaultHeaders,
  });
  if (!response.ok) {
    throw new Error('Failed to fetch creatures');
  }
  return response.json();
}

export async function getSpells(): Promise<Spell[]> {
  const response = await fetch(`${API_BASE_URL}/api/spells`, {
    headers: defaultHeaders,
  });
  if (!response.ok) {
    throw new Error('Failed to fetch spells');
  }
  return response.json();
} 