import type { Creature, Spell } from '@demesne/types';

// Vite will replace this at build time with the value from .env files
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const defaultHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

export const getCreatures = async (): Promise<Creature[]> => {
  const response = await fetch(`${API_BASE_URL}/api/creatures`, {
    method: 'GET',
    headers: defaultHeaders,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API responded with status: ${response.status} ${response.statusText}\nResponse: ${errorText}`);
  }
  
  return response.json();
};

export const getSpells = async (): Promise<Spell[]> => {
  const response = await fetch(`${API_BASE_URL}/api/spells`, {
    method: 'GET',
    headers: defaultHeaders,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API responded with status: ${response.status} ${response.statusText}\nResponse: ${errorText}`);
  }
  
  return response.json();
}; 