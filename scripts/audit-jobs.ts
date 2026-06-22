/**
 * audit-jobs.ts — build-time audit script
 *
 * `npm run audit` で `src/data/jobs.json` を scan、
 * 詐欺求人検出 + auto-flag + audit report 生成。
 *
 * Usage:
 *   tsx scripts/audit-jobs.ts            # scan + report (jobs.json 変更なし)
 *   tsx scripts/audit-jobs.ts --apply    # scan + auto-flag を jobs.json に書き戻し
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateJob, type FraudFilterResult } from '../src/lib/fraud-filter.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const JOBS_JSON = resolve(__dirname, '../src/data/jobs.json');
const AUDIT_REPORT = resolve(__dirname, '../docs/audit-report.json');

interface Job {
  id: string;
  title: string;
  category: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    googleMapsUrl: string;
  };
  description: string;
  contact: {
    method: string;
    example: string;
  };
  postedAt: string;
  status: 'active' | 'flagged' | 'sample' | 'pending';
  audit?: {
    riskScore: number;
    matches: FraudFilterResult['matches'];
    auditedAt: string;
  };
}

interface JobsFile {
  schema: string;
  lastUpdated: string;
  honestScope: Record<string, string>;
  jobs: Job[];
}

function main() {
  const apply = process.argv.includes('--apply');
  const raw = readFileSync(JOBS_JSON, 'utf-8');
  const data: JobsFile = JSON.parse(raw);

  let flaggedCount = 0;
  let cleanCount = 0;
  let sampleCount = 0;
  const auditedJobs: Job[] = [];

  for (const job of data.jobs) {
    if (job.status === 'sample') {
      sampleCount++;
      auditedJobs.push(job);
      continue;
    }

    const result = evaluateJob(job);

    if (result.flagged) {
      flaggedCount++;
      console.log(
        `[FLAG] ${job.id} riskScore=${result.riskScore} matches=${result.matches.length}`
      );
      for (const m of result.matches) {
        console.log(`       - ${m.category} :: "${m.keyword}" in ${m.field}`);
      }
      auditedJobs.push({
        ...job,
        status: result.riskScore >= 5 ? 'flagged' : 'pending',
        audit: {
          riskScore: result.riskScore,
          matches: result.matches,
          auditedAt: new Date().toISOString().slice(0, 10),
        },
      });
    } else {
      cleanCount++;
      auditedJobs.push(job);
    }
  }

  const report = {
    auditedAt: new Date().toISOString(),
    summary: {
      total: data.jobs.length,
      clean: cleanCount,
      flagged: flaggedCount,
      sample: sampleCount,
    },
    flaggedJobs: auditedJobs
      .filter((j) => j.audit && j.audit.riskScore > 0)
      .map((j) => ({
        id: j.id,
        title: j.title,
        status: j.status,
        audit: j.audit,
      })),
  };

  writeFileSync(AUDIT_REPORT, JSON.stringify(report, null, 2), 'utf-8');

  console.log('\n=== Audit Summary ===');
  console.log(`Total:    ${report.summary.total}`);
  console.log(`Clean:    ${report.summary.clean}`);
  console.log(`Flagged:  ${report.summary.flagged}`);
  console.log(`Sample:   ${report.summary.sample}`);
  console.log(`\nReport: ${AUDIT_REPORT}`);

  if (apply && flaggedCount > 0) {
    const updated: JobsFile = {
      ...data,
      lastUpdated: new Date().toISOString().slice(0, 10),
      jobs: auditedJobs,
    };
    writeFileSync(JOBS_JSON, JSON.stringify(updated, null, 2), 'utf-8');
    console.log(`\n[APPLIED] Updated ${JOBS_JSON} with flag status.`);
  } else if (!apply && flaggedCount > 0) {
    console.log(
      `\nRun with --apply to write flag status back to jobs.json.`
    );
  }

  if (flaggedCount > 0) {
    process.exitCode = 1;
  }
}

main();
