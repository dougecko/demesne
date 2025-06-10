export const spellHandler = async (event: any) => {
  const { getSpells } = await import('./services/spellService.mjs');
  try {
    const spells = await getSpells();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(spells)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to fetch spells' })
    };
  }
};

export const creatureHandler = async (event: any) => {
  const { getCreatures } = await import('./services/creatureService.mjs');
  try {
    const creatures = await getCreatures();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(creatures)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to fetch creatures' })
    };
  }
}; 