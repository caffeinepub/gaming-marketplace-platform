// Gaming-themed word lists for GamerTag generation
const adjectives = [
  'Shadow', 'Epic', 'Dark', 'Cyber', 'Mystic', 'Thunder', 'Frost', 'Blaze',
  'Storm', 'Venom', 'Phantom', 'Rogue', 'Savage', 'Silent', 'Swift', 'Iron',
  'Steel', 'Golden', 'Silver', 'Crimson', 'Azure', 'Neon', 'Toxic', 'Lunar',
  'Solar', 'Cosmic', 'Quantum', 'Turbo', 'Hyper', 'Ultra', 'Mega', 'Alpha',
  'Beta', 'Omega', 'Prime', 'Elite', 'Royal', 'Divine', 'Infernal', 'Eternal',
  'Ancient', 'Legendary', 'Mythic', 'Arcane', 'Primal', 'Feral', 'Wild', 'Fierce'
];

const nouns = [
  'Warrior', 'Sniper', 'Knight', 'Dragon', 'Phoenix', 'Wolf', 'Tiger', 'Eagle',
  'Viper', 'Reaper', 'Hunter', 'Slayer', 'Assassin', 'Ninja', 'Samurai', 'Titan',
  'Demon', 'Angel', 'Ghost', 'Specter', 'Wraith', 'Bandit', 'Raider', 'Striker',
  'Ranger', 'Scout', 'Soldier', 'Gladiator', 'Champion', 'Hero', 'Legend', 'Master',
  'Lord', 'King', 'Emperor', 'Warlord', 'Commander', 'Captain', 'General', 'Ace',
  'Blade', 'Fang', 'Claw', 'Talon', 'Storm', 'Blitz', 'Fury', 'Rage'
];

const actionWords = [
  'Strike', 'Blast', 'Crush', 'Smash', 'Slash', 'Dash', 'Rush', 'Charge',
  'Storm', 'Blitz', 'Raid', 'Hunt', 'Prowl', 'Stalk', 'Ambush', 'Attack',
  'Assault', 'Siege', 'Conquer', 'Dominate', 'Reign', 'Rule', 'Command', 'Lead',
  'Fight', 'Battle', 'War', 'Clash', 'Duel', 'Combat', 'Brawl', 'Rumble',
  'Rampage', 'Havoc', 'Chaos', 'Mayhem', 'Carnage', 'Destruction', 'Annihilation', 'Obliteration'
];

/**
 * Generates a random GamerTag in the format: Word1Word2##
 * Examples: ShadowWarrior42, EpicSniper89, DarkKnight17
 */
export function generateGamerTag(): string {
  // Randomly choose between adjective+noun or noun+action patterns
  const useAdjectiveNoun = Math.random() > 0.5;
  
  let word1: string;
  let word2: string;
  
  if (useAdjectiveNoun) {
    word1 = adjectives[Math.floor(Math.random() * adjectives.length)];
    word2 = nouns[Math.floor(Math.random() * nouns.length)];
  } else {
    word1 = nouns[Math.floor(Math.random() * nouns.length)];
    word2 = actionWords[Math.floor(Math.random() * actionWords.length)];
  }
  
  // Generate random 2-digit number (10-99)
  const number = Math.floor(Math.random() * 90) + 10;
  
  // Combine in PascalCase format with number suffix
  return `${word1}${word2}${number}`;
}
