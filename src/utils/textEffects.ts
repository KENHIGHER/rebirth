const GARBLED = ['#', '%', '?', '/', '\\', '*', '~', '@', '&', '¤'];

export const corruptText = (text: string, san: number) => {
  if (san >= 15) return text;

  const corruptionRate = san < 5 ? 0.32 : 0.16;
  let seed = 0;

  return text
    .split('')
    .map((char, idx) => {
      if (char === ' ' || char === '\n' || /[0-9]/.test(char)) return char;
      seed = (seed * 1103515245 + 12345 + idx + san) & 0x7fffffff;
      const roll = (seed % 1000) / 1000;
      if (roll < corruptionRate) {
        return GARBLED[(seed + idx) % GARBLED.length];
      }
      return char;
    })
    .join('');
};

