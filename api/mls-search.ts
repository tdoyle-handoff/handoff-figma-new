import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'
import { z } from 'zod'

const ALLOWED_ORIGIN = process.env.CORS_ALLOW_ORIGIN || '*'

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '600')
}

const FiltersSchema = z.object({
  location: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  beds: z.number().optional(),
  baths: z.number().optional(),
  propertyType: z.string().optional(), // e.g., Residential, ResidentialLease, Land
  features: z.array(z.string()).optional(),
  daysOnMarketMax: z.number().optional(),
})

type Filters = z.infer<typeof FiltersSchema>

const TRESTLE_BASE = process.env.TRESTLE_BASE || 'https://api-prod.corelogic.com/trestle/odata'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    const TRESTLE_TOKEN = process.env.TRESTLE_API_KEY

    if (!TRESTLE_TOKEN) return res.status(500).json({ error: 'Missing TRESTLE_API_KEY' })
    if (!OPENAI_API_KEY) return res.status(500).json({ error: 'Missing OPENAI_API_KEY' })

    const ai = new OpenAI({ apiKey: OPENAI_API_KEY })

  // Parse request body
  let q: string | undefined
  let listingKey: string | undefined
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})
    q = body.q
    if (body.listingKey) listingKey = String(body.listingKey)
  } catch {
    // ignore
  }

  // If listingKey is provided, skip AI parsing and fetch that listing directly
  // Otherwise, require q
  if (!listingKey && (!q || typeof q !== 'string')) {
    return res.status(400).json({ error: 'q required (or provide listingKey)' })
  }

  // 1) Parse natural language -> MLS-ready filters via OpenAI
  let filters: Filters = {}
    try {
      const prompt = `Extract MLS filters from: "${q}"\nReturn ONLY a JSON object with optional keys: location (string), minPrice (number), maxPrice (number), beds (number), baths (number), propertyType (string), features (string[]), daysOnMarketMax (number). Use USD for prices. Omit fields you are not confident about.`
      const parsed = await ai.responses.create({
        model: 'gpt-4.1-mini',
        input: prompt,
      })
      const text = parsed.output_text || '{}'
      const candidate = JSON.parse(text)
      const result = FiltersSchema.safeParse(candidate)
      if (result.success) filters = result.data
    } catch {
      // Fallback to empty filters; we can still search broadly
      filters = {}
    }

  // 2) Build OData $filter
  const clauses: string[] = []
  if (listingKey) {
    const safe = String(listingKey).replace(/'/g, "''")
    clauses.push(`ListingKey eq '${safe}'`)
  } else {
    if (filters.minPrice) clauses.push(`ListPrice ge ${Math.floor(filters.minPrice)}`)
    if (filters.maxPrice) clauses.push(`ListPrice le ${Math.floor(filters.maxPrice)}`)
    if (filters.beds) clauses.push(`BedroomsTotal ge ${Math.floor(filters.beds)}`)
    if (filters.baths) clauses.push(`BathroomsTotalInteger ge ${Math.floor(filters.baths)}`)
    if (filters.location) {
      const city = filters.location.replace(/'/g, "''")
      // Try City or UnparsedAddress contains
      clauses.push(`(contains(City,'${city}') or contains(UnparsedAddress,'${city}'))`)
    }
    if (filters.daysOnMarketMax) clauses.push(`DaysOnMarket le ${Math.floor(filters.daysOnMarketMax)}`)
    if (filters.propertyType) clauses.push(`PropertyType eq '${(filters.propertyType || '').replace(/'/g, "''")}'`)
  }

  const url = new URL(`${TRESTLE_BASE}/Property`)
  if (clauses.length) url.searchParams.set('$filter', clauses.join(' and '))
  url.searchParams.set('$top', '50')
  url.searchParams.set('$orderby', 'ModificationTimestamp desc')
  url.searchParams.set('$select', [
    'ListingId','StandardStatus','PropertyType','ListingKey',
    'UnparsedAddress','StreetNumber','StreetName','City','StateOrProvince','PostalCode',
    'ListPrice','BedroomsTotal','BathroomsTotalInteger','LivingArea','YearBuilt',
    'Latitude','Longitude','PublicRemarks','Media'
  ].join(','))

    // 3) Fetch IDX results
    const resp = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${TRESTLE_TOKEN}`,
        Accept: 'application/json',
      },
      // Trestle often prefers GET; keep it simple.
      cache: 'no-store' as RequestCache,
    })

    if (!resp.ok) {
      const text = await resp.text()
      return res.status(502).json({ error: 'Trestle error', status: resp.status, body: text })
    }

    const data = await resp.json()
    const listings = Array.isArray((data as any)?.value) ? (data as any).value : []

    // 4) Lightweight summaries for cards
    let summaries = ''
    try {
      const summaryPrompt = `Create 1-2 sentence buyer-friendly blurbs for each listing. Focus on price, beds/baths, area, and one hook.`
      const s = await ai.responses.create({
        model: 'gpt-4.1-mini',
        input: `${summaryPrompt}\n\nListings JSON (first 20):\n${JSON.stringify(listings.slice(0, 20))}`,
      })
      summaries = s.output_text || ''
    } catch {
      summaries = ''
    }

    // 5) Return
    return res.status(200).json({
      filters,
      count: listings.length,
      results: listings,
      summaries,
      compliance: {
        // Show this near results; replace with your brokerage info and MLS’s required text.
        attributionRequired: true,
        exampleAttribution: 'Listing data © MLS participants via CoreLogic Trestle. Brokerage: Your Brokerage Name. All information deemed reliable but not guaranteed.'
      }
    })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Unknown error' })
  }
}

