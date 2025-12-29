import { ClerkDefinition, ClerkRegistry } from './clerk-definition.interface'
import { FACTS_CLERK } from './clerks/facts-clerk.definition'

// Export types
export * from './clerk-definition.interface'

// Clerk Registry
export const CLERK_REGISTRY: ClerkRegistry = {
  'facts-clerk': FACTS_CLERK,
  // Others will be added during Runbook 8:
  // 'exhibits-clerk': EXHIBITS_CLERK,
  // 'discovery-clerk': DISCOVERY_CLERK,
  // 'caseblock-clerk': CASEBLOCK_CLERK,
  // 'signature-clerk': SIGNATURE_CLERK,
  // 'editor-clerk': EDITOR_CLERK,
  // 'communication-clerk': COMMUNICATION_CLERK,
  // 'analysis-clerk': ANALYSIS_CLERK,
}

/**
 * Get all clerk capabilities as readable string
 * Used for LLM system prompt generation
 */
export function getClerkCapabilities(): string {
  const capabilities = Object.values(CLERK_REGISTRY).map(clerk => {
    return `## ${clerk.name} (${clerk.id})
${clerk.description}

**Capabilities:**
${clerk.capabilities.map(c => `- ${c}`).join('\n')}

**UI Modes:**
${Object.entries(clerk.uiModes).map(([mode, config]) =>
  `- ${mode}: ${config.description}`
).join('\n')}
`
  })

  return capabilities.join('\n\n')
}

/**
 * Get clerk by matching user intent to examples
 */
export function findClerkByIntent(intent: string): ClerkDefinition | null {
  const normalizedIntent = intent.toLowerCase()

  for (const clerk of Object.values(CLERK_REGISTRY)) {
    for (const example of clerk.examples) {
      const normalizedExample = example.userIntent.toLowerCase()

      // Simple similarity check - can be enhanced with fuzzy matching
      if (normalizedIntent.includes(normalizedExample) ||
          normalizedExample.includes(normalizedIntent)) {
        return clerk
      }
    }
  }

  return null
}

/**
 * Get comprehensive privacy report
 * Used when user asks "what data are you accessing?"
 */
export interface PrivacyReport {
  localProcessing: Array<{
    clerk: string
    description: string
    dataAccessed: string[]
    dataStored: string[]
  }>
  externalAPIs: Array<{
    clerk: string
    apis: string[]
    purpose: string
  }>
}

export function getPrivacyReport(): PrivacyReport {
  const report: PrivacyReport = {
    localProcessing: [],
    externalAPIs: []
  }

  for (const clerk of Object.values(CLERK_REGISTRY)) {
    if (clerk.privacy.externalAPIs.length === 0 ||
        (clerk.privacy.externalAPIs.length === 1 &&
         clerk.privacy.externalAPIs[0].toLowerCase().includes('none'))) {
      // Local processing only
      report.localProcessing.push({
        clerk: clerk.name,
        description: clerk.description,
        dataAccessed: clerk.privacy.dataAccessed,
        dataStored: clerk.privacy.dataStored
      })
    } else {
      // Uses external APIs
      report.externalAPIs.push({
        clerk: clerk.name,
        apis: clerk.privacy.externalAPIs,
        purpose: clerk.description
      })
    }
  }

  return report
}

/**
 * Get clerk by ID
 */
export function getClerkById(id: string): ClerkDefinition | null {
  return CLERK_REGISTRY[id] || null
}

/**
 * Get all clerk IDs
 */
export function getAllClerkIds(): string[] {
  return Object.keys(CLERK_REGISTRY)
}
