// ─── GoHighLevel API Client ────────────────────────────────────────
// Docs: https://highlevel.stoplight.io/docs/integrations

const GHL_BASE = 'https://services.leadconnectorhq.com'

function getHeaders() {
  return {
    'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
  }
}

export interface GHLContact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  tags: string[]
  dateAdded: string
  lastActivity: string
  customField?: Record<string, string>
}

export interface GHLAppointment {
  id: string
  title: string
  calendarId: string
  contactId: string
  startTime: string
  endTime: string
  status: 'confirmed' | 'cancelled' | 'showed' | 'noshow' | 'invalid'
  notes?: string
  contact?: {
    name: string
    email: string
    phone: string
  }
}

export interface GHLOpportunity {
  id: string
  name: string
  monetaryValue: number
  pipelineId: string
  pipelineStageId: string
  status: 'open' | 'won' | 'lost' | 'abandoned'
  contactId: string
  assignedTo: string
  createdAt: string
  updatedAt: string
}

// ─── Contacts ─────────────────────────────────────────────────────
export async function getContacts(limit = 20): Promise<GHLContact[]> {
  const locationId = process.env.GHL_LOCATION_ID
  if (!locationId) throw new Error('GHL_LOCATION_ID not configured')

  const res = await fetch(
    `${GHL_BASE}/contacts/?locationId=${locationId}&limit=${limit}`,
    { headers: getHeaders(), next: { revalidate: 300 } }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GHL contacts error ${res.status}: ${text}`)
  }

  const data = await res.json()
  return data.contacts || []
}

export async function getContact(contactId: string): Promise<GHLContact> {
  const res = await fetch(
    `${GHL_BASE}/contacts/${contactId}`,
    { headers: getHeaders() }
  )

  if (!res.ok) throw new Error(`GHL contact error ${res.status}`)
  const data = await res.json()
  return data.contact
}

export async function createContact(contact: Partial<GHLContact> & { locationId?: string }) {
  const locationId = process.env.GHL_LOCATION_ID
  const res = await fetch(`${GHL_BASE}/contacts/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ ...contact, locationId }),
  })

  if (!res.ok) throw new Error(`GHL create contact error ${res.status}`)
  return res.json()
}

// ─── Appointments / Calendar ──────────────────────────────────────
export async function getAppointments(
  startDate: string,
  endDate: string
): Promise<GHLAppointment[]> {
  const locationId = process.env.GHL_LOCATION_ID
  if (!locationId) throw new Error('GHL_LOCATION_ID not configured')

  const res = await fetch(
    `${GHL_BASE}/appointments/?locationId=${locationId}&startDate=${startDate}&endDate=${endDate}`,
    { headers: getHeaders(), next: { revalidate: 60 } }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GHL appointments error ${res.status}: ${text}`)
  }

  const data = await res.json()
  return data.appointments || []
}

// ─── Opportunities (deals pipeline) ──────────────────────────────
export async function getOpportunities(pipelineId?: string): Promise<GHLOpportunity[]> {
  const locationId = process.env.GHL_LOCATION_ID
  if (!locationId) throw new Error('GHL_LOCATION_ID not configured')

  let url = `${GHL_BASE}/opportunities/search?location_id=${locationId}&limit=50`
  if (pipelineId) url += `&pipeline_id=${pipelineId}`

  const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 300 } })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GHL opportunities error ${res.status}: ${text}`)
  }

  const data = await res.json()
  return data.opportunities || []
}

export async function updateOpportunityStage(
  opportunityId: string,
  stageId: string
): Promise<void> {
  const res = await fetch(`${GHL_BASE}/opportunities/${opportunityId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ pipelineStageId: stageId }),
  })

  if (!res.ok) throw new Error(`GHL update opportunity error ${res.status}`)
}

// ─── Pipelines ────────────────────────────────────────────────────
export async function getPipelines() {
  const locationId = process.env.GHL_LOCATION_ID
  const res = await fetch(
    `${GHL_BASE}/opportunities/pipelines?locationId=${locationId}`,
    { headers: getHeaders(), next: { revalidate: 3600 } }
  )

  if (!res.ok) throw new Error(`GHL pipelines error ${res.status}`)
  const data = await res.json()
  return data.pipelines || []
}
