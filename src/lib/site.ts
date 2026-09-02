export const siteConfig = {
  name: "Drone Soccer — SRM AP",
  shortName: "Drone Soccer",
  tagline: "SRM University AP Campus League · Sep 1 – Dec 31",
  description:
    "The official campus drone soccer league at SRM University, Andhra Pradesh. 3 to 5 pilots per team, one striker, caged drone balls, and weekly block matches.",
  university: "SRM University, Andhra Pradesh",
  contactEmail: "dronesoccer@srmap.edu.in",
  instagram: "@dronesoccer_srmap",
  registrationFee: 100, // ₹100 per team
  trainingRechargeFee: 100, // ₹100 per team / week
  season: {
    start: "September 1, 2026",
    end: "December 31, 2026",
    matchDays: "Wednesday & Thursday",
    totalWeeks: 17,
  },
  blockRotation: [
    { id: "cv-raman", name: "C V Raman Block", tag: "Engineering Core" },
    { id: "sr-block", name: "SR Block", tag: "Main Academic Complex" },
    { id: "x-lab", name: "X Lab", tag: "Research & Innovation Wing" },
    { id: "admin-block", name: "Admin Block", tag: "Central Plaza" },
  ],
  teamRules: {
    minPilots: 3,
    maxPilots: 5,
    strikerCount: 1,
    roundLength: "3 minutes per set (3 sets per match)",
    totalMatchTime: "30 minutes total (including intervals and resets)",
  },
  facultyAdvisor: {
    name: "Dr. Pradyut Kumar Sanki, PhD (IIT KGP), FIETE, SMIEEE, MIET",
    role: "Faculty Advisor",
    title:
      "Associate Professor, Department of Electronics & Communication Engineering, School of Engineering & Sciences, SRM University AP",
    initials: "PS",
  },
  organisers: [
    { name: "Manikanta", role: "League Operations Lead", initial: "M" },
    { name: "Ajit Kumar", role: "Technical & Drone Systems", initial: "AK" },
    { name: "Sai Sankar", role: "Referee & Rules Coordinator", initial: "SS" },
    { name: "Aswith", role: "Arena & Logistics Manager", initial: "A" },
    { name: "Ch Manikanta", role: "Safety & Equipment Marshal", initial: "CM" },
    { name: "Deekshith", role: "Team Relations & Registration", initial: "D" },
    { name: "Manoj", role: "Scorekeeping & Fixtures", initial: "M" },
    { name: "Ramprasad", role: "Pilot Training & Bootcamps", initial: "R" },
    { name: "Sanjay", role: "Media & Livestream Operations", initial: "S" },
    { name: "Agastya Pandey", role: "Tech & Scoring Systems", initial: "AP" },
  ],
};
