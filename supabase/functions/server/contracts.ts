import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'npm:@supabase/supabase-js';
import JSZip from 'npm:jszip';

// Contract analysis router
const contracts = new Hono();

// CORS
contracts.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}));

// Env
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase env vars');
}

if (!OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY not set. Analysis will fail.');
}

// Clients
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const supabaseAnon = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Types
interface ContractRow {
  id: string;
  user_id: string;
  name: string;
  mime_type: string | null;
  size_bytes: number | null;
  type: string | null;
  storage_bucket: string | null;
  storage_path: string | null;
  status: 'uploaded' | 'analyzing' | 'analyzed' | 'error' | 'pending-review';
  risk_level: 'low' | 'medium' | 'high';
  summary_text: string | null;
  analysis: any | null;
  error: string | null;
  uploaded_at: string;
  analysis_started_at: string | null;
  analysis_completed_at: string | null;
}

interface AnalyzeBody { contract_id: string }

function jsonError(c: any, message: string, code = 400, details?: any) {
  console.error('contracts/analyze error:', message, details ?? '');
  return c.json({ success: false, error: message, details }, code);
}

async function getUserFromBearerToken(token: string) {
  try {
    const { data, error } = await supabaseAnon.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
  } catch (e) {
    return null;
  }
}

async function downloadFile(bucket: string, path: string): Promise<Blob> {
  const { data, error } = await supabaseAdmin.storage.from(bucket).download(path);
  if (error || !data) {
    throw new Error(`Failed to download file: ${error?.message || 'unknown'}`);
  }
  return data as Blob;
}

async function extractDocxText(bytes: Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(bytes);
  const docXml = zip.file('word/document.xml');
  if (!docXml) return '';
  const xml = await docXml.async('string');
  // Strip tags, preserve basic spaces
  const text = xml
    .replace(/<w:p[\s\S]*?>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .trim();
  return text;
}

function buildSystemPrompt() {
  return (
    'You are an expert real estate contract analyst. Extract key points from the provided contract text or file and return strictly valid JSON matching the schema. ' +
    'Do not include any commentary outside the JSON. Dates should be ISO or simple human-readable strings. If a field is missing, use a sensible placeholder.'
  );
}

function buildUserPrompt() {
  return (
    'Return JSON with this exact shape:\n' +
    '{\n' +
    '  "summary": string,\n' +
    '  "purchasePrice": string,\n' +
    '  "earnestMoney": string,\n' +
    '  "closingDate": string,\n' +
    '  "inspectionPeriod": string,\n' +
    '  "financingContingency": string,\n' +
    '  "appraisalContingency": string,\n' +
    '  "contingencies": [ {"name": string, "deadline": string, "status": "active"|"expired"|"waived"|"satisfied", "description": string, "daysRemaining"?: number, "critical": boolean} ],\n' +
    '  "importantDates": [ {"event": string, "date": string, "description": string, "status": "upcoming"|"completed"|"overdue", "daysUntil"?: number} ],\n' +
    '  "risks": [ {"level": "high"|"medium"|"low", "category": string, "description": string, "recommendation": string} ],\n' +
    '  "recommendations": string[],\n' +
    '  "keyTerms": [ {"term": string, "value": string, "section": string, "importance": "critical"|"important"|"standard", "explanation"?: string} ]\n' +
    '}\n' +
    'Ensure valid JSON and concise values.'
  );
}

function inferRiskLevel(analysis: any): 'low' | 'medium' | 'high' {
  try {
    const risks = Array.isArray(analysis?.risks) ? analysis.risks : [];
    const hasHigh = risks.some((r: any) => (r.level || '').toLowerCase() === 'high');
    const hasMedium = risks.some((r: any) => (r.level || '').toLowerCase() === 'medium');
    if (hasHigh) return 'high';
    if (hasMedium) return 'medium';
    return 'low';
  } catch {
    return 'medium';
  }
}

async function chatExtractFromText(text: string, model = 'gpt-4o-mini'): Promise<any> {
  const sys = buildSystemPrompt();
  const user = buildUserPrompt() + '\n\nContract text (truncated if long):\n' + text.slice(0, 24000);

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: user },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
      max_tokens: 1200,
    }),
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`OpenAI chat error: ${resp.status} ${t}`);
  }
  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned no content');
  return JSON.parse(content);
}

async function fileExtractWithResponses(file: Blob, filename: string, model = 'gpt-4o-mini'): Promise<any> {
  // Upload file to OpenAI Files API
  const form = new FormData();
  form.append('file', file, filename);
  form.append('purpose', 'assistants');

  const upload = await fetch('https://api.openai.com/v1/files', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    body: form,
  });
  if (!upload.ok) {
    const t = await upload.text();
    throw new Error(`OpenAI file upload failed: ${upload.status} ${t}`);
  }
  const uploaded = await upload.json();
  const fileId = uploaded.id;

  // Responses API with file attachment (best-effort schema)
  const sys = buildSystemPrompt();
  const user = buildUserPrompt();

  const resp = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content: [ { type: 'text', text: sys } ],
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: user },
            { type: 'input_file', file_id: fileId },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    }),
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`OpenAI responses error: ${resp.status} ${t}`);
  }
  const data = await resp.json();
  const output = data?.output?.[0]?.content?.[0]?.text ?? data?.output_text ?? data?.response?.output_text;
  if (!output) throw new Error('OpenAI returned no JSON output');
  return JSON.parse(output);
}

contracts.post('/contracts/analyze', async (c) => {
  try {
    const auth = c.req.header('Authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return jsonError(c, 'Missing or invalid Authorization header', 401);
    }
    const token = auth.split(' ')[1];
    const user = await getUserFromBearerToken(token);
    if (!user) return jsonError(c, 'Invalid or expired token', 401);

    const body = (await c.req.json()) as AnalyzeBody;
    if (!body?.contract_id) return jsonError(c, 'contract_id is required');

    // Load contract
    const { data: rows, error: fetchErr } = await supabaseAdmin
      .from('contracts')
      .select('*')
      .eq('id', body.contract_id)
      .limit(1);

    if (fetchErr) return jsonError(c, 'Failed to fetch contract', 500, fetchErr.message);
    const row = (rows?.[0] || null) as ContractRow | null;
    if (!row) return jsonError(c, 'Contract not found', 404);
    if (row.user_id !== user.id) return jsonError(c, 'Forbidden', 403);

    // Set analyzing
    await supabaseAdmin
      .from('contracts')
      .update({ status: 'analyzing', analysis_started_at: new Date().toISOString(), error: null })
      .eq('id', row.id);

    if (!row.storage_bucket || !row.storage_path) {
      throw new Error('Contract has no storage location');
    }

    // Download file from storage
    const blob = await downloadFile(row.storage_bucket, row.storage_path);
    const ab = await blob.arrayBuffer();
    const bytes = new Uint8Array(ab);
    const mime = row.mime_type || blob.type || 'application/octet-stream';

    // Try to extract text for DOCX, else fall back to OpenAI file mode
    let analysis: any | null = null;
    try {
      if (mime.includes('wordprocessingml') || row.name.toLowerCase().endsWith('.docx')) {
        const text = await extractDocxText(bytes);
        if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY missing');
        analysis = await chatExtractFromText(text);
      } else if (mime.includes('pdf') || row.name.toLowerCase().endsWith('.pdf')) {
        if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY missing');
        analysis = await fileExtractWithResponses(blob, row.name);
      } else {
        // Try chat with whatever bytes as text fallback
        const text = new TextDecoder().decode(bytes);
        if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY missing');
        analysis = await chatExtractFromText(text);
      }
    } catch (aiErr) {
      console.error('AI analysis error:', aiErr);
      throw aiErr;
    }

    const risk = inferRiskLevel(analysis);
    const summaryText = (analysis?.summary && typeof analysis.summary === 'string')
      ? analysis.summary.slice(0, 5000)
      : 'Summary not available';

    await supabaseAdmin
      .from('contracts')
      .update({
        status: 'analyzed',
        analysis: analysis,
        summary_text: summaryText,
        risk_level: risk,
        analysis_completed_at: new Date().toISOString(),
      })
      .eq('id', row.id);

    return c.json({ success: true, contract_id: row.id, status: 'analyzed' });
  } catch (error: any) {
    const message = error?.message || 'Unexpected error during analysis';
    const contractId = (() => { try { return (await c.req.json())?.contract_id; } catch { return undefined; } })();
    if (contractId) {
      await supabaseAdmin
        .from('contracts')
        .update({ status: 'error', error: message })
        .eq('id', contractId);
    }
    return jsonError(c, message, 500);
  }
});

export default contracts;

