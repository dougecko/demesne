import { useEffect, useState } from 'react';
import type { Spell } from '@demesne/types';
import { getSpells } from '../api/client';
import styles from './SpellList.module.css';
import brassReload from '../assets/brass-reload.svg';

export const SpellList = () => {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpells = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSpells();
      setSpells(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpells();
  }, []);

  const handleReload = () => {
    fetchSpells();
  };

  return (
    <div>
      <div className={styles.spellHeader}>
        <h1>Spells</h1>
        <button
          onClick={handleReload}
          disabled={loading}
          className={`${styles.reloadButton} ${loading ? styles.reloadButtonSpin : ''}`}
          title="Reload spells"
          aria-label="Reload spells">
          <img src={brassReload} alt="Reload" />
        </button>
      </div>
      {loading ? (
        <div className={styles.loadingContainer}>Loading...</div>
      ) : error ? (
        <div className={styles.errorContainer}>Error: {error}</div>
      ) : (
        <div className={styles.spellsGrid}>
          {spells.map((spell) => (
            <div key={spell.id} className={styles.spellCard}>
              <div className={styles.statBlockHeader}>
                <h3 className={styles.creatureName}>{spell.name}</h3>
                <p className={styles.creatureType}>Level {spell.level} {spell.school}</p>
              </div>
              <div className={styles.statBlockDivider}></div>
              <div className={styles.statBlockBasics}>
                <div className={styles.basicStat}>
                  <span className={styles.statLabel}>Casting Time</span> {spell.castingTime}
                </div>
                <div className={styles.basicStat}>
                  <span className={styles.statLabel}>Range</span> {spell.range}
                </div>
                <div className={styles.basicStat}>
                  <span className={styles.statLabel}>Duration</span> {spell.duration}
                </div>
              </div>
              <div className={styles.statBlockDivider}></div>
              <div className={styles.statBlockProperties}>
                <div className={styles.property}>
                  <span className={styles.propertyName}>Components</span> {spell.components.join(', ')}
                  {spell.material && <span> ({spell.material})</span>}
                </div>
                <div className={styles.property}>
                  <span className={styles.propertyName}>Classes</span> {spell.classes.join(', ')}
                </div>
                {spell.higherLevel && (
                  <div className={styles.property}>
                    <span className={styles.propertyName}>At Higher Levels</span> {spell.higherLevel}
                  </div>
                )}
              </div>
              <div className={styles.statBlockDivider}></div>
              <div className={styles.statBlockDescription}>
                <p>{spell.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 