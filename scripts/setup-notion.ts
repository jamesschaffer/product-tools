#!/usr/bin/env npx tsx
/**
 * Notion Setup Script
 *
 * Automatically creates the required databases for the Product Roadmap tool
 * in your Notion workspace.
 *
 * Usage:
 *   npx tsx scripts/setup-notion.ts
 *
 * Or with arguments:
 *   npx tsx scripts/setup-notion.ts --token=secret_xxx --page=abc123
 */

import { Client } from '@notionhq/client';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function parseArgs(): { token?: string; page?: string; output?: string } {
  const args: { token?: string; page?: string; output?: string } = {};
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--token=')) {
      args.token = arg.slice(8);
    } else if (arg.startsWith('--page=')) {
      args.page = arg.slice(7);
    } else if (arg.startsWith('--output=')) {
      args.output = arg.slice(9);
    }
  }
  return args;
}

async function validateToken(token: string): Promise<boolean> {
  try {
    const notion = new Client({ auth: token });
    await notion.users.me({});
    return true;
  } catch {
    return false;
  }
}

async function validatePageAccess(notion: Client, pageId: string): Promise<boolean> {
  try {
    await notion.pages.retrieve({ page_id: pageId });
    return true;
  } catch {
    return false;
  }
}

async function createGoalsDatabase(notion: Client, parentPageId: string): Promise<string> {
  console.log('  Creating Goals database...');

  const response = await notion.databases.create({
    parent: { page_id: parentPageId },
    title: [{ type: 'text', text: { content: 'Goals' } }],
    properties: {
      Name: { title: {} },
      Description: { rich_text: {} },
      'Desired Outcome': { rich_text: {} },
      Priority: { number: {} },
      Order: { number: {} },
    },
  });

  console.log('  ✓ Goals database created');
  return response.id;
}

async function createInitiativesDatabase(
  notion: Client,
  parentPageId: string,
  goalsDbId: string
): Promise<string> {
  console.log('  Creating Initiatives database...');

  const response = await notion.databases.create({
    parent: { page_id: parentPageId },
    title: [{ type: 'text', text: { content: 'Initiatives' } }],
    properties: {
      Name: { title: {} },
      'Ideal Outcome': { rich_text: {} },
      Goal: { relation: { database_id: goalsDbId, single_property: {} } },
      Order: { number: {} },
    },
  });

  console.log('  ✓ Initiatives database created');
  return response.id;
}

async function createDeliverablesDatabase(
  notion: Client,
  parentPageId: string,
  initiativesDbId: string
): Promise<string> {
  console.log('  Creating Deliverables database...');

  const response = await notion.databases.create({
    parent: { page_id: parentPageId },
    title: [{ type: 'text', text: { content: 'Deliverables' } }],
    properties: {
      Name: { title: {} },
      Description: { rich_text: {} },
      Status: {
        select: {
          options: [
            { name: 'shipped', color: 'green' },
            { name: 'in-progress', color: 'yellow' },
            { name: 'planned', color: 'gray' },
          ],
        },
      },
      'Start Date': { date: {} },
      'End Date': { date: {} },
      Initiative: { relation: { database_id: initiativesDbId, single_property: {} } },
      Order: { number: {} },
    },
  });

  console.log('  ✓ Deliverables database created');
  return response.id;
}

function generateEnvContent(
  token: string,
  goalsDbId: string,
  initiativesDbId: string,
  deliverablesDbId: string,
  apiKey: string
): string {
  return `# Notion Configuration
NOTION_TOKEN=${token}
GOALS_DB_ID=${goalsDbId}
INITIATIVES_DB_ID=${initiativesDbId}
DELIVERABLES_DB_ID=${deliverablesDbId}

# API Authentication
API_KEY=${apiKey}
`;
}

function generateRandomApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'roadmap-';
  for (let i = 0; i < 16; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║           Product Roadmap - Notion Setup Script            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const args = parseArgs();

  // Step 1: Get Notion token
  let token = args.token;
  if (!token) {
    console.log('Step 1: Notion Integration Token');
    console.log('─────────────────────────────────');
    console.log('Create an integration at: https://www.notion.so/my-integrations\n');
    token = await prompt('Enter your Notion integration token: ');
  }

  if (!token || !token.startsWith('secret_') && !token.startsWith('ntn_')) {
    console.error('\n✗ Invalid token format. Token should start with "secret_" or "ntn_"');
    process.exit(1);
  }

  console.log('\nValidating token...');
  const isValidToken = await validateToken(token);
  if (!isValidToken) {
    console.error('✗ Invalid token. Please check your integration token.');
    process.exit(1);
  }
  console.log('✓ Token is valid\n');

  const notion = new Client({ auth: token });

  // Step 2: Get parent page ID
  let pageId = args.page;
  if (!pageId) {
    console.log('Step 2: Parent Page');
    console.log('───────────────────');
    console.log('Create a page in Notion where the databases will live.');
    console.log('Share that page with your integration (click ... → Connections → Add your integration)');
    console.log('\nThe page ID is in the URL: notion.so/Your-Page-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    console.log('                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
    console.log('                                         (copy this part)\n');
    pageId = await prompt('Enter the parent page ID: ');
  }

  // Clean up page ID (remove hyphens if present)
  pageId = pageId.replace(/-/g, '');

  console.log('\nValidating page access...');
  const hasPageAccess = await validatePageAccess(notion, pageId);
  if (!hasPageAccess) {
    console.error('✗ Cannot access page. Make sure you:');
    console.error('  1. Shared the page with your integration');
    console.error('  2. Copied the correct page ID from the URL');
    process.exit(1);
  }
  console.log('✓ Page access confirmed\n');

  // Step 3: Create databases
  console.log('Step 3: Creating Databases');
  console.log('──────────────────────────');

  try {
    const goalsDbId = await createGoalsDatabase(notion, pageId);
    const initiativesDbId = await createInitiativesDatabase(notion, pageId, goalsDbId);
    const deliverablesDbId = await createDeliverablesDatabase(notion, pageId, initiativesDbId);

    console.log('\n✓ All databases created successfully!\n');

    // Step 4: Generate configuration
    console.log('Step 4: Configuration');
    console.log('─────────────────────');

    const apiKey = generateRandomApiKey();
    const envContent = generateEnvContent(token, goalsDbId, initiativesDbId, deliverablesDbId, apiKey);

    console.log('\nYour database IDs:');
    console.log(`  GOALS_DB_ID=${goalsDbId}`);
    console.log(`  INITIATIVES_DB_ID=${initiativesDbId}`);
    console.log(`  DELIVERABLES_DB_ID=${deliverablesDbId}`);
    console.log(`  API_KEY=${apiKey}`);

    // Ask about writing .env file
    const outputPath = args.output || '.env';
    const envPath = path.resolve(process.cwd(), outputPath);

    let writeEnv = false;
    if (fs.existsSync(envPath)) {
      const overwrite = await prompt(`\n${outputPath} already exists. Overwrite? (y/N): `);
      writeEnv = overwrite.toLowerCase() === 'y';
    } else {
      const create = await prompt(`\nCreate ${outputPath} file? (Y/n): `);
      writeEnv = create.toLowerCase() !== 'n';
    }

    if (writeEnv) {
      fs.writeFileSync(envPath, envContent);
      console.log(`\n✓ Configuration written to ${outputPath}`);
    } else {
      console.log('\nAdd these to your .env file or deployment environment variables:');
      console.log('────────────────────────────────────────────────────────────────');
      console.log(envContent);
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                     Setup Complete!                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\nNext steps:');
    console.log('  1. Start the dev server:  npm run dev');
    console.log('  2. Start the API server:  npx tsx api-server.js');
    console.log('  3. Open http://localhost:5173');
    console.log('\nFor deployment:');
    console.log('  1. Push to GitHub');
    console.log('  2. Connect to Vercel');
    console.log('  3. Add environment variables in Vercel dashboard');
    console.log('  4. Deploy!\n');

  } catch (error) {
    console.error('\n✗ Error creating databases:', error);
    process.exit(1);
  }

  rl.close();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
