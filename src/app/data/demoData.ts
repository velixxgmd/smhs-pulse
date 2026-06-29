import type { Candidate, VotingCode, TurnoutData, Election } from '../types';

export const DEMO_CANDIDATES: Candidate[] = [
  { id: 'c1', name: 'Arjun Sharma', class: '10', section: 'A', role: 'Head Boy', photo_url: '', manifesto: 'Building a stronger, more united school community through inclusivity and innovation.', votes: 0, order_index: 1 },
  { id: 'c2', name: 'Rohan Mehta', class: '10', section: 'B', role: 'Head Boy', photo_url: '', manifesto: 'Empowering every student voice and ensuring fair representation for all.', votes: 0, order_index: 2 },
  { id: 'c3', name: 'Vikram Nair', class: '10', section: 'C', role: 'Head Boy', photo_url: '', manifesto: 'Committed to academic excellence and extracurricular enrichment for SMHS.', votes: 0, order_index: 3 },
  { id: 'c4', name: 'Priya Kapoor', class: '10', section: 'A', role: 'Head Girl', photo_url: '', manifesto: 'Leading with compassion, integrity, and a vision for a brighter SMHS future.', votes: 0, order_index: 1 },
  { id: 'c5', name: 'Ananya Reddy', class: '10', section: 'B', role: 'Head Girl', photo_url: '', manifesto: 'Championing mental health awareness and student wellbeing across all grades.', votes: 0, order_index: 2 },
  { id: 'c6', name: 'Sneha Iyer', class: '10', section: 'C', role: 'Head Girl', photo_url: '', manifesto: 'Bridging the gap between students and administration for real change.', votes: 0, order_index: 3 },
  { id: 'c7', name: 'Karan Verma', class: '10', section: 'A', role: 'Sports Captain', photo_url: '', manifesto: 'Taking SMHS to new athletic heights with discipline and team spirit.', votes: 0, order_index: 1 },
  { id: 'c8', name: 'Dev Malhotra', class: '10', section: 'B', role: 'Sports Captain', photo_url: '', manifesto: 'Promoting sportsmanship, fitness, and inter-school excellence.', votes: 0, order_index: 2 },
  { id: 'c9', name: 'Aditya Singh', class: '9', section: 'A', role: 'Deputy Head Boy', photo_url: '', manifesto: 'Supporting the Head Boy and ensuring every junior student is heard.', votes: 0, order_index: 1 },
  { id: 'c10', name: 'Riya Patel', class: '9', section: 'B', role: 'Deputy Head Girl', photo_url: '', manifesto: 'A bridge between teachers and students, working for a harmonious school.', votes: 0, order_index: 1 },
  { id: 'c11', name: 'Nikhil Joshi', class: '10', section: 'D', role: 'Discipline Secretary', photo_url: '', manifesto: 'Ensuring a safe, respectful, and orderly environment for all students.', votes: 0, order_index: 1 },
  { id: 'c12', name: 'Meera Gupta', class: '10', section: 'A', role: 'Cultural Secretary', photo_url: '', manifesto: 'Celebrating the rich diversity of SMHS through vibrant cultural events.', votes: 0, order_index: 1 },
  { id: 'c13', name: 'Aarav Menon', class: '10', section: 'B', role: 'Literary Captain', photo_url: '', manifesto: 'Promoting reading culture, debates, and creative writing across the school.', votes: 0, order_index: 1 },
  { id: 'c14', name: 'Diya Nair', class: '9', section: 'C', role: 'Deputy Literary Captain', photo_url: '', manifesto: 'Supporting literary events and helping juniors participate with confidence.', votes: 0, order_index: 1 },
  { id: 'c15', name: 'Siddharth Rao', class: '10', section: 'A', role: 'Pragathi House Captain', photo_url: '', manifesto: 'Strengthening teamwork and house spirit through consistent participation.', votes: 0, order_index: 1 },
  { id: 'c16', name: 'Ishita Das', class: '9', section: 'B', role: 'Deputy Pragathi House Captain', photo_url: '', manifesto: 'Helping organize house activities and ensuring everyone gets a chance.', votes: 0, order_index: 1 },
  { id: 'c17', name: 'Neeraj Kumar', class: '10', section: 'C', role: 'Sakthi House Captain', photo_url: '', manifesto: 'Leading with discipline and motivation to bring out the best in Sakthi House.', votes: 0, order_index: 1 },
  { id: 'c18', name: 'Kavya S', class: '9', section: 'A', role: 'Deputy Sakthi House Captain', photo_url: '', manifesto: 'Coordinating events and supporting house members throughout the year.', votes: 0, order_index: 1 },
  { id: 'c19', name: 'Rahul Thomas', class: '10', section: 'D', role: 'Shanthi House Captain', photo_url: '', manifesto: 'Encouraging fair play, respect, and unity within Shanthi House.', votes: 0, order_index: 1 },
  { id: 'c20', name: 'Anika Jain', class: '9', section: 'C', role: 'Deputy Shanthi House Captain', photo_url: '', manifesto: 'Supporting coordination and helping students stay engaged in house programs.', votes: 0, order_index: 1 },
  { id: 'c21', name: 'Vivek Iyer', class: '10', section: 'B', role: 'Jothi House Captain', photo_url: '', manifesto: 'Building confidence and participation for every member of Jothi House.', votes: 0, order_index: 1 },
  { id: 'c22', name: 'Sahana R', class: '9', section: 'B', role: 'Deputy Jothi House Captain', photo_url: '', manifesto: 'Helping manage house events smoothly and representing juniors fairly.', votes: 0, order_index: 1 },
];

function generateBatchId(): string {
  return `BATCH-${Date.now().toString(36).toUpperCase()}`;
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${part1}-${part2}`;
}

const BATCH_ID = generateBatchId();

export function generateDemoCodes(): VotingCode[] {
  const codes: VotingCode[] = [];
  const classesAndSections = [
    { cls: '6', sections: ['A', 'B', 'C'] },
    { cls: '7', sections: ['A', 'B'] },
    { cls: '8', sections: ['A', 'B'] },
    { cls: '9', sections: ['A', 'B', 'C'] },
    { cls: '10', sections: ['A', 'B', 'C', 'D'] },
  ];

  classesAndSections.forEach(({ cls, sections }) => {
    sections.forEach(section => {
      const max = cls === '10' ? 8 : 5;
      for (let roll = 1; roll <= max; roll++) {
        codes.push({
          id: `code-${cls}-${section}-${roll}`,
          code: generateCode(),
          class: cls,
          section,
          roll_number: roll,
          status: 'unused',
          generated_at: new Date().toISOString(),
          batch_id: BATCH_ID,
          generated_by: 'Demo System',
        });
      }
    });
  });

  return codes;
}

export const DEMO_TURNOUT: TurnoutData[] = [
  { class: '6', section: 'A', voted: 18, total: 30, percent: 60 },
  { class: '6', section: 'B', voted: 24, total: 30, percent: 80 },
  { class: '6', section: 'C', voted: 21, total: 30, percent: 70 },
  { class: '7', section: 'A', voted: 27, total: 31, percent: 87 },
  { class: '7', section: 'B', voted: 19, total: 31, percent: 61 },
  { class: '8', section: 'A', voted: 25, total: 30, percent: 83 },
  { class: '8', section: 'B', voted: 22, total: 30, percent: 73 },
  { class: '9', section: 'A', voted: 28, total: 32, percent: 87 },
  { class: '9', section: 'B', voted: 20, total: 32, percent: 62 },
  { class: '9', section: 'C', voted: 29, total: 32, percent: 90 },
  { class: '10', section: 'A', voted: 30, total: 35, percent: 85 },
  { class: '10', section: 'B', voted: 26, total: 35, percent: 74 },
  { class: '10', section: 'C', voted: 31, total: 35, percent: 88 },
  { class: '10', section: 'D', voted: 24, total: 35, percent: 68 },
];

export const DEMO_ELECTION: Election = {
  id: "demo-election-1",
  name: "Student Council Election",
  year: 2026,

  status: "UPCOMING",
  mode: "demo",
  voting_layout: "multi",

  created_at: new Date().toISOString(),

  total_votes: 0,
  turnout_percent: 0,
};
