import { ClerkDefinition } from '../clerk-definition.interface'

/**
 * Facts Clerk - Manages factual claims, contradictions, and evidence linking
 *
 * This is the TEMPLATE definition. All other clerk definitions should follow this pattern.
 */
export const FACTS_CLERK: ClerkDefinition = {
  // Identity
  id: 'facts-clerk',
  name: 'Facts Clerk',
  description: 'Manages factual claims, contradictions, and evidence linking across all case documents. Extracts facts from uploaded documents, detects contradictions between claims, and links facts to supporting evidence.',
  version: '1.0.0',

  // Capabilities
  capabilities: [
    'Extract factual claims from uploaded documents',
    'Detect contradictions between claims across documents',
    'Link facts to supporting evidence and exhibits',
    'Track claim sources (document, page, paragraph)',
    'Highlight claims that lack supporting evidence',
    'Generate chronological fact timeline visualization',
    'Export fact table for court filings',
    'Alpha Facts engine for claim strength analysis',
    'Annotate facts with user notes and categorization'
  ],

  // Data Contract
  inputs: [
    {
      name: 'caseId',
      type: 'ULID',
      required: true,
      description: 'Case identifier to associate facts with'
    },
    {
      name: 'documentId',
      type: 'ULID',
      required: false,
      description: 'Specific document to extract facts from (optional - can show all case facts)'
    },
    {
      name: 'filterBy',
      type: 'string',
      required: false,
      description: 'Filter facts by type or source',
      validation: {
        enum: ['all', 'contradictions', 'unsupported', 'by-document', 'by-strength']
      }
    }
  ],

  outputs: [
    {
      name: 'facts',
      type: 'Fact[]',
      description: 'Extracted factual claims with metadata'
    },
    {
      name: 'contradictions',
      type: 'Contradiction[]',
      description: 'Detected contradictions between facts'
    },
    {
      name: 'evidenceLinks',
      type: 'EvidenceLink[]',
      description: 'Links between facts and supporting evidence'
    },
    {
      name: 'strengthScores',
      type: 'AlphaFactsScore[]',
      description: 'Claim strength analysis from Alpha Facts engine'
    }
  ],

  // Privacy & Security
  privacy: {
    dataAccessed: [
      'All documents in the current case',
      'Previously extracted facts from case',
      'Evidence attachments linked to case',
      'User annotations on facts'
    ],
    dataStored: [
      'Extracted facts as plain text',
      'Sentence IDs and character positions',
      'Contradiction relationships',
      'User annotations and categorizations',
      'Evidence links'
    ],
    externalAPIs: [
      'None - all fact extraction and analysis happens locally'
    ],
    clerkGuardChannel: 'facts:extract'
  },

  // Requirements
  constraints: {
    requiresCase: true,
    requiresDocument: false,  // Can show existing facts without new document
    requiresInternet: false,
    minimumData: [
      'At least one document uploaded to case for fact extraction'
    ]
  },

  // UI Modes
  uiModes: {
    'list': {
      description: 'Shows all facts as searchable, sortable list',
      layout: 'sidebar',
      minSize: { width: 300, height: 400 },
      preferredSize: { width: 400, height: 600 }
    },
    'contradictions': {
      description: 'Highlights contradictory claims with side-by-side comparison',
      layout: 'sidebar',
      minSize: { width: 350, height: 500 },
      preferredSize: { width: 450, height: 700 }
    },
    'timeline': {
      description: 'Chronological visualization of factual events',
      layout: 'main',
      minSize: { width: 600, height: 400 },
      preferredSize: { width: 900, height: 600 }
    },
    'evidence-linking': {
      description: 'Interface for linking facts to supporting evidence',
      layout: 'bottom',
      minSize: { width: 800, height: 250 },
      preferredSize: { width: 1000, height: 350 }
    },
    'strength-analysis': {
      description: 'Alpha Facts engine claim strength scoring',
      layout: 'sidebar',
      minSize: { width: 350, height: 400 },
      preferredSize: { width: 400, height: 600 }
    }
  },
  defaultMode: 'list',

  // LLM Training Examples
  examples: [
    {
      userIntent: 'Check for contradictions in the motion',
      configuration: {
        mode: 'contradictions',
        filterBy: 'contradictions',
        highlightNew: true
      },
      expectedOutcome: 'Opens Facts Clerk in contradictions mode, highlighting newly detected contradictions'
    },
    {
      userIntent: 'Show me all facts from Cruz case',
      configuration: {
        mode: 'list',
        filterBy: 'all',
        sortBy: 'document'
      },
      expectedOutcome: 'Opens Facts Clerk showing complete fact list for case'
    },
    {
      userIntent: 'Which facts are strongest?',
      configuration: {
        mode: 'strength-analysis',
        sortBy: 'strength',
        filterBy: 'by-strength'
      },
      expectedOutcome: 'Opens Alpha Facts analysis showing claim strengths'
    },
    {
      userIntent: 'Show me timeline of events',
      configuration: {
        mode: 'timeline',
        sortBy: 'chronological'
      },
      expectedOutcome: 'Opens timeline visualization of factual events'
    },
    {
      userIntent: 'Link facts to evidence',
      configuration: {
        mode: 'evidence-linking'
      },
      expectedOutcome: 'Opens evidence linking interface'
    }
  ],

  // Metadata
  tags: ['facts', 'evidence', 'contradictions', 'analysis', 'claims'],
  category: 'analysis'
}
