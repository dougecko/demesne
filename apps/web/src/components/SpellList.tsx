import { useEffect, useState } from 'react';
import type { Spell } from '@demesne/types';
import { getSpells } from '../api/client';
import styles from './SpellList.module.css';
import brassReload from '../assets/brass-reload.svg';

export const SpellList = () => {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

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

  const toggleCard = (id: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderSpellDetails = (spell: Spell) => {
    return (
      <div className={styles.statBlock}>
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
            {spell.material && <span className={styles.material}> ({spell.material})</span>}
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
    );
  };

  return (
    <div className={styles['spell-component']}>
      <div className={styles.spellHeader}>
        <h1 className={styles.spellHeaderTitle}>Spells</h1>
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
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={handleReload}>Try Again</button>
        </div>
      ) : (
        <div className={styles.spellList}>
          {spells.map(spell => (
            <div
              key={spell.id}
              className={`${styles.spellCard} ${expandedCards.has(spell.id) ? styles.cardExpanded : styles.cardCollapsed}`}
              onClick={() => toggleCard(spell.id)}>
              <div className={styles.spellCardContent}>
                <div className={styles.spellHeader}>
                  <h3 className={styles.spellName}>{spell.name}</h3>
                </div>
                <div>
                  <p className={styles.spellLevel}>{spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`} {spell.school}</p>
                </div>
                <div className={styles.spellContent}>
                  {renderSpellDetails(spell)}
                </div>
                <div className={styles.spellExpandIndicator}>
                  <span className={expandedCards.has(spell.id) ? styles.spellExpandTriangleExpanded : styles.spellExpandTriangleCollapsed}></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 