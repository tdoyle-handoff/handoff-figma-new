import type { VercelRequest, VercelResponse } from '@vercel/node'

const ALLOWED_ORIGIN = process.env.CORS_ALLOW_ORIGIN || '*'
const TRESTLE_BASE = process.env.TRESTLE_BASE || 'https://api-prod.corelogic.com/trestle/odata'

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

  const TRESTLE_TOKEN = process.env.TRESTLE_API_KEY
  if (!TRESTLE_TOKEN) {
    return res.status(500).json({ error: 'Missing TRESTLE_API_KEY' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})

    // Structured filters (all optional)
    const location: string | undefined = typeof body.location === 'string' ? body.location : undefined
    const city: string | undefined = typeof body.city === 'string' ? body.city : undefined
    const state: string | undefined = typeof body.state === 'string' ? body.state : undefined
    const postalCode: string | undefined = typeof body.postalCode === 'string' ? body.postalCode : undefined

    const minPrice: number | undefined = Number.isFinite(body.minPrice) ? Math.floor(body.minPrice) : undefined
    const maxPrice: number | undefined = Number.isFinite(body.maxPrice) ? Math.floor(body.maxPrice) : undefined
    const bedsMin: number | undefined = Number.isFinite(body.bedsMin) ? Math.floor(body.bedsMin) : undefined
    const bathsMin: number | undefined = Number.isFinite(body.bathsMin) ? Math.floor(body.bathsMin) : undefined

    const propertyType: string | undefined = typeof body.propertyType === 'string' ? body.propertyType : undefined
    const daysOnMarketMax: number | undefined = Number.isFinite(body.daysOnMarketMax) ? Math.floor(body.daysOnMarketMax) : undefined

    const features: string[] | undefined = Array.isArray(body.features) ? body.features.filter((f: any) => typeof f === 'string' && f.trim().length) : undefined
    const listingKey: string | undefined = typeof body.listingKey === 'string' ? body.listingKey : undefined

    const top: number = Number.isFinite(body.top) ? Math.min(Math.max(1, Math.floor(body.top)), 100) : 50
    const skip: number = Number.isFinite(body.skip) ? Math.max(0, Math.floor(body.skip)) : 0

    // Require at least one meaningful filter if no listingKey
    if (!listingKey && !location && !city && !state && !postalCode && !minPrice && !maxPrice && !bedsMin && !bathsMin && !propertyType && !daysOnMarketMax) {
      return res.status(400).json({ error: 'Provide at least one filter or a listingKey' })
    }

    // Build OData filter
    const clauses: string[] = []
    if (listingKey) {
      const safe = listingKey.replace(/'/g, "''")
      clauses.push(`ListingKey eq '${safe}'`)
    } else {
      if (typeof minPrice === 'number') clauses.push(`ListPrice ge ${minPrice}`)
      if (typeof maxPrice === 'number') clauses.push(`ListPrice le ${maxPrice}`)
      if (typeof bedsMin === 'number') clauses.push(`BedroomsTotal ge ${bedsMin}`)
      if (typeof bathsMin === 'number') clauses.push(`BathroomsTotalInteger ge ${bathsMin}`)

      if (postalCode) {
        const safe = postalCode.replace(/'/g, "''")
        clauses.push(`PostalCode eq '${safe}'`)
      }
      if (city) {
        const safe = city.replace(/'/g, "''")
        clauses.push(`City eq '${safe}'`)
      }
      if (state) {
        const safe = state.replace(/'/g, "''")
        clauses.push(`StateOrProvince eq '${safe}'`)
      }
      if (!city && !state && location) {
        const safe = location.replace(/'/g, "''")
        clauses.push(`(contains(City,'${safe}') or contains(UnparsedAddress,'${safe}'))`)
      }

      if (typeof daysOnMarketMax === 'number') clauses.push(`DaysOnMarket le ${daysOnMarketMax}`)
      if (propertyType) {
        const safe = propertyType.replace(/'/g, "''")
        clauses.push(`PropertyType eq '${safe}'`)
      }

      if (features && features.length) {
        // AND together simple contains() on PublicRemarks (adjust field as desired)
        for (const f of features) {
          const safe = f.replace(/'/g, "''")
          clauses.push(`contains(PublicRemarks,'${safe}')`)
        }
      }
    }

    const url = new URL(`${TRESTLE_BASE}/Property`)
    if (clauses.length) url.searchParams.set('$filter', clauses.join(' and '))
    url.searchParams.set('$select', [
      'ListingId','StandardStatus','PropertyType','ListingKey',
      'UnparsedAddress','StreetNumber','StreetName','City','StateOrProvince','PostalCode',
      'ListPrice','BedroomsTotal','BathroomsTotalInteger','LivingArea','YearBuilt',
      'Latitude','Longitude','PublicRemarks','Media'
    ].join(','))
    url.searchParams.set('$orderby', 'ModificationTimestamp desc')
    url.searchParams.set('$top', String(top))
    if (skip) url.searchParams.set('$skip', String(skip))

    const resp = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${TRESTLE_TOKEN}`,
        Accept: 'application/json',
      },
      cache: 'no-store' as RequestCache,
    })

    if (!resp.ok) {
      const text = await resp.text()
      return res.status(502).json({ error: 'Trestle error', status: resp.status, body: text })
    }

    const data = await resp.json() as any
    const listings = Array.isArray(data?.value) ? data.value : []

    return res.status(200).json({
      count: listings.length,
      results: listings,
      filters: {
        location, city, state, postalCode, minPrice, maxPrice, bedsMin, bathsMin,
        propertyType, daysOnMarketMax, features, listingKey, top, skip
      },
      compliance: {
        attributionRequired: true,
        exampleAttribution: 'Listing data © MLS participants via CoreLogic Trestle. Brokerage: Your Brokerage Name. All information deemed reliable but not guaranteed.'
      }
    })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Unknown error' })
  }
}

