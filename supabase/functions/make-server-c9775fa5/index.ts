// @ts-nocheck
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.ts";

const app = new Hono();

app.use('*', logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

app.get("/make-server-c9775fa5/health", (c: any) => c.json({ status: "ok" }));

async function getCodes() {
  const result = await kv.getByPrefix("code:");
  return result || [];
}

async function getCandidates() {
  const result = await kv.getByPrefix("candidate:");
  return result || [];
}

async function getVotes() {
  const result = await kv.getByPrefix("vote:");
  return result || [];
}

function generateVoteId(existingVotes: Record<string, unknown>[]): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const existingIds = new Set(existingVotes.map(v => (v.voteId as string) || (v.id as string)));
  for (let attempt = 0; attempt < 1000; attempt++) {
    const suffix = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const voteId = `VOTE-${suffix}`;
    if (!existingIds.has(voteId)) return voteId;
  }
  throw new Error('Could not generate unique Vote ID');
}

async function getArchivedElections() {
  const result = await kv.getByPrefix("archive:");
  return result || [];
}

async function saveArchivedElection(archive: Record<string, unknown>) {
  await kv.set(`archive:${archive.id}`, archive);
  await touchRevision();
}

async function getLogs() {
  const result = await kv.getByPrefix("log:");
  return result || [];
}

async function getRevision() {
  const r = await kv.get("app:revision");
  if (typeof r === "string") return r;
  const initial = Date.now().toString();
  await kv.set("app:revision", initial);
  return initial;
}

async function touchRevision() {
  await kv.set("app:revision", Date.now().toString());
}

async function getElection() {
  const e = await kv.get("election:current");
  if (!e) {
    const defaultElection = {
    id: "live-1",
    name: "Student Council Election",
    year: new Date().getFullYear(),
    status: "UPCOMING",
    mode: "demo",
    voting_layout: "multi",
    created_at: new Date().toISOString()
};
    await kv.set("election:current", defaultElection);
    await touchRevision();
    return defaultElection;
  }
  if (typeof e !== "object" || e === null) {
    const defaultElection = {
      id: "live-1",
      name: "Student Council Election",
      year: new Date().getFullYear(),
      status: "UPCOMING",
      mode: "demo",
      voting_layout: "multi",
      created_at: new Date().toISOString(),
    };
    await kv.set("election:current", defaultElection);
    await touchRevision();
    return defaultElection;
  }

  const election = e as Record<string, unknown>;
  const patched: Record<string, unknown> = { ...election };
  const nowIso = new Date().toISOString();
  let changed = false;
  const validStatuses = new Set([
    "UPCOMING",
    "LIVE",
    "PAUSED",
    "CLOSED",
    "ARCHIVED",
    "RESULTS_PUBLISHED",
  ]);
  const validModes = new Set(["demo", "live"]);
  const validLayouts = new Set(["multi", "single"]);

  if (typeof patched.id !== "string" || patched.id.trim().length === 0) { patched.id = "live-1"; changed = true; }
  if (typeof patched.name !== "string" || patched.name.trim().length === 0) { patched.name = "Student Council Election"; changed = true; }
  if (typeof patched.year !== "number") { patched.year = new Date().getFullYear(); changed = true; }
  if (typeof patched.created_at !== "string") { patched.created_at = nowIso; changed = true; }

  if (typeof patched.status !== "string" || !validStatuses.has(patched.status)) { patched.status = "UPCOMING"; changed = true; }
  if (typeof patched.mode !== "string" || !validModes.has(patched.mode)) { patched.mode = "demo"; changed = true; }
  if (typeof patched.voting_layout !== "string" || !validLayouts.has(patched.voting_layout)) { patched.voting_layout = "multi"; changed = true; }
  if (typeof patched.finalized !== "boolean") { patched.finalized = false; changed = true; }

  if (changed) {
    await kv.set("election:current", patched);
    await touchRevision();
  }

  return patched;
}

async function getAdminConfig() {
  const cfg = await kv.get("admin:config");
  if (!cfg) {
    const defaultCfg = { password: "admin123", recovery: "SMHS-RECOVERY-2026" };
    await kv.set("admin:config", defaultCfg);
    return defaultCfg;
  }
  return cfg;
}

app.get("/make-server-c9775fa5/codes", async (c: any) => {
  try { return c.json(await getCodes()); }
  catch (e) { console.log("Error getting codes:", e); return c.json({ error: String(e) }, 500); }
});

app.post("/make-server-c9775fa5/generate-codes", async (c: any) => {
  try {
    const body = await c.req.json();
    const { class: cls, section, max_roll } = body;
    if (!cls || !section || !max_roll) return c.json({ error: "Missing required fields" }, 400);
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const genCode = () => {
  return Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};
    const batchId = `BATCH-${Date.now().toString(36).toUpperCase()}`;
    const newCodes = [];
    for (let roll = 1; roll <= max_roll; roll++) {
      const code: Record<string, unknown> = { id: Math.random().toString(36).substring(2), code: genCode(), class: cls, section, roll_number: roll, status: 'unused', generated_at: new Date().toISOString(), batch_id: batchId, generated_by: 'Admin' };
      await kv.set(`code:${code.id}`, code);
      newCodes.push(code);
    }
    await touchRevision();
    return c.json(newCodes);
  } catch (e) { console.log("Error generating codes:", e); return c.json({ error: String(e) }, 500); }
});

app.get("/make-server-c9775fa5/lookup-code", async (c: any) => {
  try {
    const cls = c.req.query('class'), section = c.req.query('section'), roll = parseInt(c.req.query('roll') || '0');
    const codes = await getCodes() as Record<string, unknown>[];
    const found = codes.find((cd) => cd.class === cls && cd.section === section && cd.roll_number === roll);
    return found ? c.json(found) : c.json(null);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.get("/make-server-c9775fa5/lookup-vote-id", async (c: any) => {
  try {
    const voteId = c.req.query('voteId');
    if (!voteId) return c.json({ error: "Missing voteId" }, 400);
    const votes = await getVotes() as Record<string, unknown>[];
    const vote = votes.find((v) => v.voteId === voteId);
    if (!vote) return c.json({ found: false }, 404);
    const election = await getElection() as Record<string, unknown>;
    const isFinalized = election.finalized === true;
    let connectedCode = null;
    if (!isFinalized) {
      const codes = await getCodes() as Record<string, unknown>[];
      const code = codes.find((cd) => cd.voteId === voteId);
      if (code) connectedCode = code.code;
    }
    return c.json({
      found: true,
      voteId: vote.voteId,
      status: 'Recorded Successfully',
      timestamp: vote.voted_at,
      connectedCode,
      finalized: isFinalized,
    });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post("/make-server-c9775fa5/validate-code", async (c: any) => {
  try {
    const { code } = await c.req.json();
    const codes = await getCodes() as Record<string, unknown>[];
    const found = codes.find((cd) => (cd.code as string)?.toUpperCase() === code?.toUpperCase());
    if (!found) return c.json({ valid: false, error: "Invalid voting code. Please check and try again." });
    if (found.status === 'used') return c.json({ valid: false, error: "This code has already been used." });
    return c.json({ valid: true, code: found });
  } catch (e) { return c.json({ valid: false, error: String(e) }, 500); }
});

app.post("/make-server-c9775fa5/submit-vote", async (c: any) => {
  try {
    const body = await c.req.json();
    const { code, candidate_selections, device_hash, session_id } = body;
    const codes = await getCodes() as Record<string, unknown>[];
    const codeItem = codes.find((cd) => (cd.code as string)?.toUpperCase() === code?.toUpperCase());
    if (!codeItem) return c.json({ success: false, error: "Code not found." });
    if (codeItem.status === 'used') return c.json({ success: false, error: "Code already used." });
    const updatedCode = { ...codeItem, status: 'used', used_at: new Date().toISOString() };
    await kv.set(`code:${codeItem.id}`, updatedCode);
    const candidates = await getCandidates() as Record<string, unknown>[];
    for (const candidateId of Object.values(candidate_selections)) {
      const cand = candidates.find((cd) => cd.id === candidateId);
      if (cand) await kv.set(`candidate:${cand.id}`, { ...cand, votes: ((cand.votes as number) || 0) + 1 });
    }
    const votes = await getVotes() as Record<string, unknown>[];
    const voteId = generateVoteId(votes);
    const voteRecord = { id: voteId, voteId, code_id: codeItem.id, candidate_selections, voted_at: new Date().toISOString(), device_hash, session_id };
    await kv.set(`vote:${voteId}`, voteRecord);
    await kv.set(`code:${codeItem.id}`, { ...updatedCode, voteId });
    return c.json({ success: true, voteId });
  } catch (e) { console.log("Error submitting vote:", e); return c.json({ success: false, error: String(e) }, 500); }
});

app.get("/make-server-c9775fa5/candidates", async (c: any) => {
  try {
    const role = c.req.query('role');
    let candidates = await getCandidates() as Record<string, unknown>[];
    if (role) candidates = candidates.filter((cd) => cd.role === role);
    candidates.sort((a, b) => ((a.order_index as number) || 0) - ((b.order_index as number) || 0));
    return c.json(candidates);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post("/make-server-c9775fa5/candidates", async (c: any) => {
  try {
    const body = await c.req.json();
    const id = Math.random().toString(36).substring(2);
    const candidate = { ...body, id, votes: 0 };
    await kv.set(`candidate:${id}`, candidate);
    await touchRevision();
    return c.json(candidate);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.put("/make-server-c9775fa5/candidates/:id", async (c: any) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const existing = await kv.get(`candidate:${id}`);
    if (!existing) return c.json({ error: "Candidate not found" }, 404);
    const updated = { ...(existing as object), ...body };
    await kv.set(`candidate:${id}`, updated);
    await touchRevision();
    return c.json(updated);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.delete("/make-server-c9775fa5/candidates/:id", async (c: any) => {
  try {
    const id = c.req.param('id');
    await kv.del(`candidate:${id}`);
    await touchRevision();
    return c.json({ success: true });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.get("/make-server-c9775fa5/turnout", async (c: any) => {
  try {
    const codes = await getCodes() as Record<string, unknown>[];
    const map = new Map<string, { voted: number; total: number }>();
    codes.forEach((cd) => {
      const key = `${cd.class}-${cd.section}`;
      const entry = map.get(key) || { voted: 0, total: 0 };
      entry.total++;
      if (cd.status === 'used') entry.voted++;
      map.set(key, entry);
    });
    const turnout = Array.from(map.entries()).map(([key, val]) => {
      const [cls, sec] = key.split('-');
      return { class: cls, section: sec, voted: val.voted, total: val.total, percent: val.total > 0 ? Math.round((val.voted / val.total) * 100) : 0 };
    }).sort((a, b) => a.class.localeCompare(b.class) || a.section.localeCompare(b.section));
    return c.json(turnout);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.get("/make-server-c9775fa5/stats", async (c: any) => {
  try {
    const codes = await getCodes() as Record<string, unknown>[];
    const used = codes.filter((cd) => cd.status === 'used');
    const lastUsed = [...used].sort((a, b) => new Date(b.used_at as string).getTime() - new Date(a.used_at as string).getTime())[0];
    return c.json({ totalCodes: codes.length, totalVoted: used.length, remaining: codes.length - used.length, turnoutPercent: codes.length > 0 ? Math.round((used.length / codes.length) * 100) : 0, lastVoteTime: lastUsed?.used_at });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.get("/make-server-c9775fa5/results", async (c: any) => {
  try {
    const [candidates, codes, election] = await Promise.all([getCandidates(), getCodes(), getElection()]) as [Record<string, unknown>[], Record<string, unknown>[], Record<string, unknown>];
    const totalVoted = codes.filter((cd) => cd.status === 'used').length;
    const roles = [...new Set(candidates.map((cd) => cd.role as string))];
    const results = roles.map((role) => {
      const roleCands = candidates.filter((cd) => cd.role === role).sort((a, b) => ((b.votes as number) || 0) - ((a.votes as number) || 0));
      return { role, winner: roleCands[0] || null, candidates: roleCands.map((cd) => ({ ...cd, vote_count: (cd.votes as number) || 0 })) };
    });
    return c.json({ status: election.status, results, total_votes: totalVoted, total_students: codes.length, turnout_percent: codes.length > 0 ? Math.round((totalVoted / codes.length) * 100) : 0 });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.get("/make-server-c9775fa5/election", async (c: any) => {
  try {
    const election = await getElection();
    return c.json(election);
  } catch (e) {
    return c.json({ error: String(e) }, 500);
  }
});

app.get("/make-server-c9775fa5/revision", async (c: any) => {
  try {
    return c.json({ revision: await getRevision() });
  } catch (e) {
    return c.json({ error: String(e) }, 500);
  }
});

app.put("/make-server-c9775fa5/election/status", async (c: any) => {
  try {
    const body = await c.req.json();
    const { status, mode, name, year, voting_layout } = body as Record<string, unknown>;
    const validStatuses = new Set([
      "UPCOMING",
      "LIVE",
      "PAUSED",
      "CLOSED",
      "ARCHIVED",
      "RESULTS_PUBLISHED",
    ]);
    const validModes = new Set(["demo", "live"]);
    const validLayouts = new Set(["multi", "single"]);

    const election = await getElection() as Record<string, unknown>;
    const updated: Record<string, unknown> = { ...election };

    if (typeof status === "string" && validStatuses.has(status)) {
      updated.status = status;
      if (status === "LIVE") {
        updated.finalized = false;
        delete updated.finalized_at;
      }
    }
    if (typeof mode === "string" && validModes.has(mode)) updated.mode = mode;
    if (typeof name === "string" && name.trim().length > 0) updated.name = name.trim();
    if (typeof year === "number" && Number.isFinite(year)) updated.year = year;
    if (typeof voting_layout === "string" && validLayouts.has(voting_layout)) updated.voting_layout = voting_layout;

    await kv.set("election:current", updated);
    await touchRevision();

    return c.json(updated);

  } catch (e) {
    return c.json({ error: String(e) }, 500);
  }
});	

app.get("/make-server-c9775fa5/attempt-logs", async (c: any) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50');
    const logs = await getLogs() as Record<string, unknown>[];
    const sorted = logs.sort((a, b) => new Date(b.time as string).getTime() - new Date(a.time as string).getTime()).slice(0, limit);
    return c.json(sorted);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post("/make-server-c9775fa5/admin/verify", async (c: any) => {
  try {
    const { password } = await c.req.json();
    const cfg = await getAdminConfig() as Record<string, string>;
    return c.json({ valid: cfg.password === password });
  } catch (e) { return c.json({ valid: false, error: String(e) }, 500); }
});

app.post("/make-server-c9775fa5/admin/change-password", async (c: any) => {
  try {
    const { oldPass, newPass } = await c.req.json();
    const cfg = await getAdminConfig() as Record<string, string>;
    if (cfg.password !== oldPass) return c.json({ success: false, error: "Current password is incorrect." });
    cfg.password = newPass;
    await kv.set("admin:config", cfg);
    await touchRevision();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: String(e) }, 500); }
});

app.post("/make-server-c9775fa5/admin/verify-recovery", async (c: any) => {
  try {
    const { code } = await c.req.json();
    const cfg = await getAdminConfig() as Record<string, string>;
    return c.json({ valid: cfg.recovery === code });
  } catch (e) { return c.json({ valid: false, error: String(e) }, 500); }
});

app.post("/make-server-c9775fa5/admin/reset-password", async (c: any) => {
  try {
    const { code, newPass } = await c.req.json();
    const cfg = await getAdminConfig() as Record<string, string>;
    if (cfg.recovery !== code) return c.json({ success: false, error: "Invalid recovery code." });
    cfg.password = newPass;
    await kv.set("admin:config", cfg);
    await touchRevision();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: String(e) }, 500); }
});

app.post("/make-server-c9775fa5/admin/finalize-election", async (c: any) => {
  try {
    const election = await getElection() as Record<string, unknown>;
    if (election.finalized) return c.json({ success: false, error: "Election already finalized." });
    const codes = await getCodes() as Record<string, unknown>[];
    for (const code of codes) {
      if (code.voteId) {
        const { voteId: _, ...rest } = code;
        await kv.set(`code:${code.id}`, rest);
      }
    }
    election.finalized = true;
    election.finalized_at = new Date().toISOString();
    await kv.set("election:current", election);
    await touchRevision();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: String(e) }, 500); }
});

app.post("/make-server-c9775fa5/admin/reset-votes", async (c: any) => {
  try {
    const votes = await getVotes() as Record<string, unknown>[];
    for (const vote of votes) await kv.del(`vote:${vote.id}`);
    const codes = await getCodes() as Record<string, unknown>[];
    for (const code of codes) await kv.set(`code:${code.id}`, { ...code, status: 'unused', used_at: null, voteId: null });
    const candidates = await getCandidates() as Record<string, unknown>[];
    for (const cd of candidates) await kv.set(`candidate:${cd.id}`, { ...cd, votes: 0 });
    await touchRevision();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: String(e) }, 500); }
});

app.post("/make-server-c9775fa5/admin/reset-codes", async (c: any) => {
  try {
    const codes = await getCodes() as Record<string, unknown>[];
    for (const code of codes) await kv.set(`code:${code.id}`, { ...code, status: 'unused', used_at: null, voteId: null });
    await touchRevision();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: String(e) }, 500); }
});

app.post("/make-server-c9775fa5/admin/clear-logs", async (c: any) => {
  try {
    const logs = await getLogs() as Record<string, unknown>[];
    for (const log of logs) await kv.del(`log:${log.id}`);
    await touchRevision();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: String(e) }, 500); }
});

app.post("/make-server-c9775fa5/admin/full-reset", async (c: any) => {
  try {
    const [votes, codes, logs, candidates] = await Promise.all([getVotes(), getCodes(), getLogs(), getCandidates()]) as [Record<string, unknown>[], Record<string, unknown>[], Record<string, unknown>[], Record<string, unknown>[]];
    for (const vote of votes) await kv.del(`vote:${vote.id}`);
    for (const code of codes) await kv.set(`code:${code.id}`, { ...code, status: 'unused', used_at: null, voteId: null });
    for (const log of logs) await kv.del(`log:${log.id}`);
    for (const cd of candidates) await kv.set(`candidate:${cd.id}`, { ...cd, votes: 0 });
    const election = await getElection() as Record<string, unknown>;
    election.status = 'UPCOMING';
    election.finalized = false;
    delete election.finalized_at;
    await kv.set("election:current", election);
    await touchRevision();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: String(e) }, 500); }
});

app.get("/make-server-c9775fa5/admin/database-overview", async (c: any) => {
  try {
    const [codes, votes, candidates, archives, logs] = await Promise.all([
      getCodes(),
      getVotes(),
      getCandidates(),
      getArchivedElections(),
      getLogs(),
    ]);
    const totalKeys = codes.length + votes.length + candidates.length + archives.length + logs.length;
    const estimate = totalKeys < 50 ? `${(totalKeys * 0.5).toFixed(1)} KB` : `${(totalKeys * 0.5 / 1024).toFixed(2)} MB`;
    return c.json({
      status: 'Connected',
      storageUsed: estimate,
      totalVotes: votes.length,
      totalVotingCodes: codes.length,
      totalCandidates: candidates.length,
      totalArchivedElections: archives.length,
      totalSecurityLogs: logs.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (e) { return c.json({ status: 'Disconnected', storageUsed: '0 B', totalVotes: 0, totalVotingCodes: 0, totalCandidates: 0, totalArchivedElections: 0, totalSecurityLogs: 0, lastUpdated: new Date().toISOString() }, 500); }
});

app.get("/make-server-c9775fa5/archives", async (c: any) => {
  try {
    const archives = await getArchivedElections();
    return c.json(archives);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post("/make-server-c9775fa5/admin/archive-election", async (c: any) => {
  try {
    const election = await getElection() as Record<string, unknown>;
    if (!election || election.status !== 'RESULTS_PUBLISHED') {
      return c.json({ success: false, error: 'Election must be published before archiving.' });
    }
    const archives = await getArchivedElections() as Record<string, unknown>[];
    if (archives.some((a: any) => a.electionId === election.id)) {
      return c.json({ success: false, error: 'This election has already been archived.' });
    }
    const [candidates, codes] = await Promise.all([getCandidates(), getCodes()]);
    const totalVoted = (codes as Record<string, unknown>[]).filter((cd: any) => cd.status === 'used').length;
    const roles = [...new Set((candidates as Record<string, unknown>[]).map((cd: any) => cd.role as string))];
    const results = roles.map((role) => {
      const roleCands = (candidates as Record<string, unknown>[]).filter((cd: any) => cd.role === role).sort((a: any, b: any) => ((b.votes as number) || 0) - ((a.votes as number) || 0));
      return { role, winner: roleCands[0] || null, candidates: roleCands.map((cd: any) => ({ ...cd, vote_count: (cd.votes as number) || 0 })) };
    });
    const map = new Map<string, { voted: number; total: number }>();
    (codes as Record<string, unknown>[]).forEach((cd: any) => {
      const key = `${cd.class}-${cd.section}`;
      const entry = map.get(key) || { voted: 0, total: 0 };
      entry.total++;
      if (cd.status === 'used') entry.voted++;
      map.set(key, entry);
    });
    const houseResults = Array.from(map.entries()).map(([key, val]) => {
      const [cls, sec] = key.split('-');
      return { class: cls, section: sec, voted: val.voted, total: val.total, percent: val.total > 0 ? Math.round((val.voted / val.total) * 100) : 0 };
    }).sort((a: any, b: any) => a.class.localeCompare(b.class) || a.section.localeCompare(b.section));
    const archive = {
      id: `ARCH-${Date.now().toString(36).toUpperCase()}`,
      electionId: election.id,
      name: election.name,
      year: election.year,
      electionDate: election.ended_at || election.created_at,
      archivedAt: new Date().toISOString(),
      totalVotes: totalVoted,
      totalStudents: codes.length,
      turnoutPercent: codes.length > 0 ? Math.round((totalVoted / codes.length) * 100) : 0,
      results,
      houseResults,
      status: 'Archived',
    };
    await saveArchivedElection(archive);
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: String(e) }, 500); }
});

app.post("/make-server-c9775fa5/admin/delete-codes", async (c: any) => {
  try {
    const codes = await getCodes() as Record<string, unknown>[];
    for (const code of codes) await kv.del(`code:${code.id}`);
    await touchRevision();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: String(e) }, 500); }
});

app.post("/make-server-c9775fa5/admin/delete-votes", async (c: any) => {
  try {
    const votes = await getVotes() as Record<string, unknown>[];
    for (const vote of votes) await kv.del(`vote:${vote.id}`);
    const codes = await getCodes() as Record<string, unknown>[];
    for (const code of codes) await kv.set(`code:${code.id}`, { ...code, status: 'unused', used_at: null, voteId: null });
    const candidates = await getCandidates() as Record<string, unknown>[];
    for (const cd of candidates) await kv.set(`candidate:${cd.id}`, { ...cd, votes: 0 });
    await touchRevision();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: String(e) }, 500); }
});

app.post("/make-server-c9775fa5/admin/delete-election", async (c: any) => {
  try {
    const votes = await getVotes() as Record<string, unknown>[];
    for (const vote of votes) await kv.del(`vote:${vote.id}`);
    const codes = await getCodes() as Record<string, unknown>[];
    for (const code of codes) await kv.del(`code:${code.id}`);
    await kv.del("election:current");
    await touchRevision();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: String(e) }, 500); }
});

app.post("/make-server-c9775fa5/admin/delete-everything", async (c: any) => {
  try {
    const [votes, codes, logs, candidates, archives] = await Promise.all([getVotes(), getCodes(), getLogs(), getCandidates(), getArchivedElections()]) as [Record<string, unknown>[], Record<string, unknown>[], Record<string, unknown>[], Record<string, unknown>[], Record<string, unknown>[]];
    for (const vote of votes) await kv.del(`vote:${vote.id}`);
    for (const code of codes) await kv.del(`code:${code.id}`);
    for (const log of logs) await kv.del(`log:${log.id}`);
    for (const cd of candidates) await kv.del(`candidate:${cd.id}`);
    for (const arc of archives) await kv.del(`archive:${arc.id}`);
    await kv.del("election:current");
    await kv.del("admin:config");
    await touchRevision();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: String(e) }, 500); }
});

app.delete("/make-server-c9775fa5/admin/archives", async (c: any) => {
  try {
    const archives = await getArchivedElections() as Record<string, unknown>[];
    for (const arc of archives) await kv.del(`archive:${arc.id}`);
    await touchRevision();
    return c.json({ success: true });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.delete("/make-server-c9775fa5/admin/archives/:id", async (c: any) => {
  try {
    const id = c.req.param('id');
    await kv.del(`archive:${id}`);
    await touchRevision();
    return c.json({ success: true });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post("/make-server-c9775fa5/log-attempt", async (c: any) => {
  try {
    const body = await c.req.json();
    const id = Math.random().toString(36).substring(2);
    await kv.set(`log:${id}`, { ...body, id });
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: String(e) }, 500); }
});

Deno.serve(app.fetch);
