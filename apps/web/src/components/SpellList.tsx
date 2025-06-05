import { useEffect, useState } from 'react';
import type { Spell } from '@demesne/types';
import { getSpells } from '../api/client';

export const SpellList = () => {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpells = async () => {
      try {
        const data = await getSpells();
        setSpells(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSpells();
  }, []);

  if (loading) {
    return <div>Loading spells...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {spells.map((spell) => (
        <div key={spell.id} className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-bold mb-2">{spell.name}</h2>
          <div className="text-sm text-gray-600 mb-2">
            <span className="font-semibold">Level {spell.level}</span> • {spell.school}
          </div>
          <div className="text-sm mb-2">
            <div><span className="font-semibold">Casting Time:</span> {spell.castingTime}</div>
            <div><span className="font-semibold">Range:</span> {spell.range}</div>
            <div><span className="font-semibold">Components:</span> {spell.components.join(', ')}</div>
            {spell.material && <div><span className="font-semibold">Material:</span> {spell.material}</div>}
            <div><span className="font-semibold">Duration:</span> {spell.duration}</div>
          </div>
          <p className="text-sm">{spell.description}</p>
          {spell.higherLevel && (
            <div className="mt-2 text-sm">
              <span className="font-semibold">At Higher Levels:</span>
              <p>{spell.higherLevel}</p>
            </div>
          )}
          <div className="mt-2 text-sm">
            <span className="font-semibold">Classes:</span> {spell.classes.join(', ')}
          </div>
        </div>
      ))}
    </div>
  );
}; 