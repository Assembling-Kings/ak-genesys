export const $CONST = foundry.utils.deepFreeze({
   SYSTEM: {
      id: "ak-genesys",
      name: "genesys",
      marker: Symbol("ak-genesys"),
   },

   AbilityActivation: {
      // Activation: Passive
      Passive: "passive",
      // Activation: Active (Action)
      Action: "action",
      // Activation: Active (Maneuver)
      Maneuver: "maneuver",
      // Activation: Active (Incidental)
      Incidental: "incidental",
      // Activation: Active (Incidental, Out of Turn)
      OutOfTurn: "outOfTurn",
   },

   QualityActivation: {
      Passive: "passive",
      Active: "active",
   },

   Characteristic: {
      Brawn: "brawn",
      Agility: "agility",
      Intellect: "intellect",
      Cunning: "cunning",
      Willpower: "willpower",
      Presence: "presence",
   },

   FiringArcDirection: {
      Fore: "fore",
      Aft: "aft",
      Port: "port",
      Starboard: "starboard",
   },

   RangeBand: {
      Engaged: "engaged",
      Short: "short",
      Medium: "medium",
      Long: "long",
      Extreme: "extreme",
      Strategic: "strategic",
   },

   GearDamageState: {
      Undamaged: "undamaged",
      Minor: "minor",
      Moderate: "moderate",
      Major: "major",
   },
});
