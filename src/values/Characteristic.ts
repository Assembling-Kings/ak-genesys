export const Characteristic = Object.freeze({
   Brawn: "brawn",
   Agility: "agility",
   Intellect: "intellect",
   Cunning: "cunning",
   Willpower: "willpower",
   Presence: "presence",
});

export type Characteristic_ = typeof Characteristic[keyof typeof Characteristic];
