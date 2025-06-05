import type { Creature, Spell } from '@demesne/types';

// Use the full URL to the API server
const API_BASE = 'http://localhost:3001/api';

const defaultHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

export const getCreatures = async (): Promise<Creature[]> => {
  const response = await fetch(`${API_BASE}/creatures`, {
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
  const response = await fetch(`${API_BASE}/spells`, {
    method: 'GET',
    headers: defaultHeaders,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API responded with status: ${response.status} ${response.statusText}\nResponse: ${errorText}`);
  }
  
  return response.json();
}; 