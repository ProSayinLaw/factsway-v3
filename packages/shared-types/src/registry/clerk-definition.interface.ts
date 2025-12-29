/**
 * Clerk Definition - Documents a clerk component's capabilities, inputs, outputs, and privacy
 *
 * This interface serves multiple purposes:
 * 1. LLM knowledge base for workspace configuration
 * 2. User documentation (what features exist)
 * 3. Privacy transparency (what data is accessed)
 * 4. Testing framework (capabilities → tests)
 * 5. API specification (future)
 */

export interface ClerkInput {
  name: string
  type: string
  required: boolean
  description: string
  validation?: {
    pattern?: string
    min?: number
    max?: number
    enum?: string[]
  }
}

export interface ClerkOutput {
  name: string
  type: string
  description: string
}

export interface UIMode {
  description: string
  layout: 'sidebar' | 'main' | 'modal' | 'bottom' | 'floating'
  minSize: {
    width: number
    height: number
  }
  preferredSize?: {
    width: number
    height: number
  }
}

export interface ClerkDefinition {
  // Identity
  id: string
  name: string
  description: string
  version: string

  // Capabilities (what this clerk can do)
  capabilities: string[]

  // Data contract
  inputs: ClerkInput[]
  outputs: ClerkOutput[]

  // Privacy & Security
  privacy: {
    dataAccessed: string[]
    dataStored: string[]
    externalAPIs: string[]
    clerkGuardChannel?: string  // Links to backend ClerkGuard channel
  }

  // Requirements
  constraints: {
    requiresCase: boolean
    requiresDocument: boolean
    requiresInternet: boolean
    minimumData: string[]
  }

  // UI Configuration
  uiModes: {
    [modeName: string]: UIMode
  }
  defaultMode: string

  // LLM Training Examples
  examples: Array<{
    userIntent: string
    configuration: Record<string, any>
    expectedOutcome?: string
  }>

  // Metadata
  tags: string[]
  category: 'document-processing' | 'analysis' | 'workflow' | 'communication'
}

export interface ClerkRegistry {
  [clerkId: string]: ClerkDefinition
}
