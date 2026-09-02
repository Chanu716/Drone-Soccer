export interface Team {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  initials: string;
  captain: string;
  email: string;
  pilots: {
    name: string;
    role: "Striker" | "Defender" | "Keeper" | "Tactician";
    jerseyNo: number;
    regNo: string;
  }[];
  stats: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
  };
}

export interface Fixture {
  id: string;
  weekNo: number;
  date: string;
  day: "Wednesday" | "Thursday";
  time: string;
  venue: string;
  block: string;
  teamA?: string;
  teamB?: string;
  status: "scheduled" | "open" | "live" | "completed";
  scoreA?: number;
  scoreB?: number;
}

export const SAMPLE_TEAMS: Team[] = [
  {
    id: "team-1",
    name: "Falcon Squadron",
    slug: "falcon-squadron",
    tagline: "Speed, agility, and precision strikes from ECE",
    initials: "FS",
    captain: "Karthik R.",
    email: "karthik_r@srmap.edu.in",
    pilots: [
      { name: "Karthik R.", role: "Striker", jerseyNo: 7, regNo: "AP21110010023" },
      { name: "Vamsi Krishna", role: "Defender", jerseyNo: 11, regNo: "AP21110010045" },
      { name: "Siddharth Verma", role: "Keeper", jerseyNo: 1, regNo: "AP21110010091" },
      { name: "Ananya Sharma", role: "Defender", jerseyNo: 4, regNo: "AP21110010112" },
    ],
    stats: { played: 4, won: 3, drawn: 1, lost: 0, goalsFor: 14, goalsAgainst: 6, points: 10 },
  },
  {
    id: "team-2",
    name: "Vortex Aviators",
    slug: "vortex-aviators",
    tagline: "Lockheed-inspired defensive perimeter & swift counters",
    initials: "VA",
    captain: "Naveen Reddy",
    email: "naveen_r@srmap.edu.in",
    pilots: [
      { name: "Naveen Reddy", role: "Striker", jerseyNo: 10, regNo: "AP21110010214" },
      { name: "Praneeth Babu", role: "Defender", jerseyNo: 3, regNo: "AP21110010255" },
      { name: "Harsha Vardhan", role: "Defender", jerseyNo: 5, regNo: "AP21110010289" },
      { name: "Divya Teja", role: "Keeper", jerseyNo: 12, regNo: "AP21110010301" },
    ],
    stats: { played: 4, won: 3, drawn: 0, lost: 1, goalsFor: 12, goalsAgainst: 7, points: 9 },
  },
  {
    id: "team-3",
    name: "Aero Titans",
    slug: "aero-titans",
    tagline: "Heavy collision blockers of Mechanical Engineering",
    initials: "AT",
    captain: "Rohit Chandra",
    email: "rohit_c@srmap.edu.in",
    pilots: [
      { name: "Rohit Chandra", role: "Striker", jerseyNo: 9, regNo: "AP21110010411" },
      { name: "Aditya Mohan", role: "Defender", jerseyNo: 2, regNo: "AP21110010452" },
      { name: "Tarun Kumar", role: "Defender", jerseyNo: 8, regNo: "AP21110010488" },
      { name: "Bhavana K.", role: "Keeper", jerseyNo: 99, regNo: "AP21110010502" },
    ],
    stats: { played: 4, won: 2, drawn: 1, lost: 1, goalsFor: 9, goalsAgainst: 8, points: 7 },
  },
  {
    id: "team-4",
    name: "Quantum Propellers",
    slug: "quantum-propellers",
    tagline: "Algorithms meet aerodynamic velocity from CSE",
    initials: "QP",
    captain: "Sneha Nair",
    email: "sneha_n@srmap.edu.in",
    pilots: [
      { name: "Sneha Nair", role: "Striker", jerseyNo: 14, regNo: "AP21110010619" },
      { name: "Akash Patel", role: "Defender", jerseyNo: 17, regNo: "AP21110010644" },
      { name: "Rishabh Sen", role: "Keeper", jerseyNo: 21, regNo: "AP21110010680" },
    ],
    stats: { played: 4, won: 1, drawn: 0, lost: 3, goalsFor: 7, goalsAgainst: 13, points: 3 },
  },
  {
    id: "team-5",
    name: "Cyber Drones",
    slug: "cyber-drones",
    tagline: "Resilient telemetry and aggressive interceptors",
    initials: "CD",
    captain: "Varun Teja",
    email: "varun_t@srmap.edu.in",
    pilots: [
      { name: "Varun Teja", role: "Striker", jerseyNo: 23, regNo: "AP21110010721" },
      { name: "Manoj Sandeep", role: "Defender", jerseyNo: 6, regNo: "AP21110010756" },
      { name: "Tejaswini P.", role: "Keeper", jerseyNo: 18, regNo: "AP21110010799" },
    ],
    stats: { played: 4, won: 0, drawn: 0, lost: 4, goalsFor: 4, goalsAgainst: 11, points: 0 },
  },
];

export const SAMPLE_FIXTURES: Fixture[] = [
  {
    id: "fix-1",
    weekNo: 1,
    date: "Sep 2, 2026",
    day: "Wednesday",
    time: "4:30 PM - 5:30 PM",
    venue: "Arena A, Ground Floor",
    block: "C V Raman Block",
    teamA: "Falcon Squadron",
    teamB: "Vortex Aviators",
    status: "completed",
    scoreA: 5,
    scoreB: 3,
  },
  {
    id: "fix-2",
    weekNo: 1,
    date: "Sep 3, 2026",
    day: "Thursday",
    time: "4:30 PM - 5:30 PM",
    venue: "Atrium Arena",
    block: "SR Block",
    teamA: "Aero Titans",
    teamB: "Quantum Propellers",
    status: "completed",
    scoreA: 3,
    scoreB: 1,
  },
  {
    id: "fix-3",
    weekNo: 2,
    date: "Sep 9, 2026",
    day: "Wednesday",
    time: "4:30 PM - 5:30 PM",
    venue: "High-Bay Flying Enclosure",
    block: "X Lab",
    teamA: "Falcon Squadron",
    teamB: "Aero Titans",
    status: "scheduled",
  },
  {
    id: "fix-4",
    weekNo: 2,
    date: "Sep 10, 2026",
    day: "Thursday",
    time: "4:30 PM - 5:30 PM",
    venue: "Central Courtyard Arena",
    block: "Admin Block",
    teamA: "Vortex Aviators",
    teamB: "Cyber Drones",
    status: "scheduled",
  },
  {
    id: "fix-5",
    weekNo: 3,
    date: "Sep 16, 2026",
    day: "Wednesday",
    time: "4:30 PM - 5:30 PM",
    venue: "Arena A, Ground Floor",
    block: "C V Raman Block",
    teamA: "Quantum Propellers",
    teamB: "Cyber Drones",
    status: "open",
  },
  {
    id: "fix-6",
    weekNo: 3,
    date: "Sep 17, 2026",
    day: "Thursday",
    time: "4:30 PM - 5:30 PM",
    venue: "Atrium Arena",
    block: "SR Block",
    teamA: "Falcon Squadron",
    teamB: "Cyber Drones",
    status: "open",
  },
];
