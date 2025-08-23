import type { VercelRequest, VercelResponse } from '@vercel/node'

const ALLOWED_ORIGIN = process.env.CORS_ALLOW_ORIGIN || '*'

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '600')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  try {
    const ATTOM_API_KEY = process.env.ATTOM_API_KEY
    if (!ATTOM_API_KEY) {
      return res.status(500).json({ error: 'ATTOM_API_KEY not configured' })
    }

    const testUrl = 'https://api.gateway.attomdata.com/health'
    const resp = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Handoff-RealEstate/1.0',
        'accept': 'application/json'
      }
    })

    const status = resp.status
    let body: any
    try {
      body = await resp.json()
    } catch {
      body = { raw: await resp.text() }
    }

    return res.status(200).json({
      success: true,
      key_present: true,
      health_status: status,
      preview: body
    })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || 'Unknown error' })
  }
}

