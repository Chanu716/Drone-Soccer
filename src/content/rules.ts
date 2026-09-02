export interface RuleItem {
  id: string;
  number: string;
  title: string;
  description: string;
  category: "match" | "scoring" | "safety" | "fouls";
}

export const RULES_LIST: RuleItem[] = [
  {
    id: "team-size",
    number: "01",
    title: "Team Size & Rosters",
    description:
      "Each team fields 3 to 5 active pilots for a match, matching the count announced for the week by the organiser. Every active player pilots their own drone ball.",
    category: "match",
  },
  {
    id: "striker-designation",
    number: "02",
    title: "The Designated Striker",
    description:
      "Exactly one player is nominated as the Striker for each set. The Striker is the ONLY drone permitted to score by passing through the opponent's elevated goal ring.",
    category: "scoring",
  },
  {
    id: "defense-and-blocking",
    number: "03",
    title: "Defenders & Keepers",
    description:
      "Non-striker pilots act as defenders and blockers. They defend their team's goal ring, physically block opponent drones with their protective cages, or create corridors for their Striker.",
    category: "match",
  },
  {
    id: "caged-arena",
    number: "04",
    title: "Caged Flying Arena",
    description:
      "All flying takes place inside a heavy-duty netted and caged arena. Pilots stand in designated pilot stations outside the short sides of the cage. No person enters while drones are armed.",
    category: "safety",
  },
  {
    id: "scoring-and-retreat",
    number: "05",
    title: "Scoring & The Reset Rule",
    description:
      "When the Striker passes cleanly through the opponent's ring, a goal is awarded. After scoring, all attacking drones MUST return to their side of the halfway line before initiating another attack.",
    category: "scoring",
  },
  {
    id: "match-structure",
    number: "06",
    title: "Three 3-Minute Sets",
    description:
      "A standard match consists of three 3-minute sets with short battery-swap intervals in between (30 minutes total session). Winning 2 sets clinches the match victory.",
    category: "match",
  },
  {
    id: "point-allocation",
    number: "07",
    title: "League Points Table",
    description:
      "Win: 3 points · Draw: 1 point · Loss: 0 points. Standings ties are broken by Goal Difference (GD), then Goals For (GF), followed by head-to-head records.",
    category: "scoring",
  },
  {
    id: "safety-waiver",
    number: "08",
    title: "Mandatory Safety Equipment",
    description:
      "Protective eyewear is compulsory for all pilots and pit crew in the arena vicinity. All participants must have signed the SRM AP safety waiver before stepping up to fly.",
    category: "safety",
  },
];

export const SIMULATION_STEPS = [
  {
    step: "01",
    title: "Setup & Scramble",
    tag: "Pre-Match Launch",
    description:
      "Pilots arm their drone balls on their respective baseline takeoff pads. On referee countdown, all drones take off into tactical positioning.",
    teamAPos: { x: 22, y: 50 },
    teamBPos: { x: 78, y: 50 },
  },
  {
    step: "02",
    title: "Striker Penetration",
    tag: "Attack Phase",
    description:
      "Team A's terracotta striker banks upward through defensive turbulence, finding an open angle toward Team B's sage goal ring.",
    teamAPos: { x: 68, y: 35 },
    teamBPos: { x: 72, y: 55 },
  },
  {
    step: "03",
    title: "Ring Goal & Electronic Beep",
    tag: "Goal Counted",
    description:
      "The striker passes through the goal hoop! Arena sensors and referees trigger the optical beacon. +1 goal for Team A.",
    teamAPos: { x: 88, y: 50 },
    teamBPos: { x: 80, y: 50 },
  },
  {
    step: "04",
    title: "Mandatory Retreat Reset",
    tag: "Midfield Return",
    description:
      "All attacking drones must quickly fly back past the midfield line before a subsequent goal can be counted, giving defenders time to regroup.",
    teamAPos: { x: 40, y: 50 },
    teamBPos: { x: 65, y: 50 },
  },
];
