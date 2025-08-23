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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { endpoint, address1, address2, attomid, attom_id, params } = (req.body || {}) as any

    if (!endpoint || typeof endpoint !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid endpoint' })
    }

    const ATTOM_API_KEY = process.env.ATTOM_API_KEY
    if (!ATTOM_API_KEY) {
      return res.status(500).json({ error: 'ATTOM_API_KEY not configured' })
    }

    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    let url = `https://api.gateway.attomdata.com${normalizedEndpoint}`

    const qs = new URLSearchParams()
    const id = attomid || attom_id
    if (id) qs.append('attomid', String(id))
    if (address1) qs.append('address1', String(address1))
    if (address2) qs.append('address2', String(address2))

    if (params && typeof params === 'object') {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null) qs.append(k, String(v))
      }
    }

    if (qs.toString()) {
      url += `?${qs.toString()}`
    }

    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        apikey: ATTOM_API_KEY,
        'User-Agent': 'Handoff-RealEstate/1.0'
      }
    })

    const text = await resp.text()
    let data: any
    try {
      data = JSON.parse(text)
    } catch {
      data = { raw: text.slice(0, 1000) }
    }

    if (!resp.ok) {
      return res.status(resp.status).json({ success: false, status: resp.status, data })
    }

    return res.status(200).json(data)
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || 'Unknown error' })
  }
}

