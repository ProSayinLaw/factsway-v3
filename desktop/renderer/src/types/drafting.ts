export type EntityType = 'section' | 'paragraph' | 'sentence' | 'OBJECT_BLOCK';

export interface SentenceData {
    id: string;
    text: string;
    paragraphId: string;
    sectionId: string;
}

export interface ParagraphData {
    id: string;
    sectionId: string;
    sentenceIds: string[]; // Order of sentences
    style?: 'BODY' | 'LIST_ITEM' | 'BLOCK_QUOTE';
}

export interface SectionData {
    id: string;
    title: string;
    level: number; // 1 = I, 2 = A, 3 = 1
    childSectionIds: string[]; // Nested sections
    paragraphIds: string[]; // Paragraphs in this section (if leaf)
    parentId?: string;
}

export interface DocumentStructure {
    rootSectionIds: string[];
    sections: Record<string, SectionData>;
    paragraphs: Record<string, ParagraphData>;
    sentences: Record<string, SentenceData>;
}

export interface DraftState {
    id: string;
    title: string;
    structure: DocumentStructure;
    lastModified: number;
}

/**
 * CursorContext - Structural cursor position (per Drafting Clerk Contract)
 * 
 * The browser DOM caret is never authoritative.
 * All editing actions resolve based on this structural context.
 */
export type PositionType = 'sectionHeader' | 'sentence' | 'paragraph';

export interface CursorContext {
    sectionId: string;
    paragraphId: string | null;
    sentenceId: string | null;
    offsetInSentence: number | null;
    positionType: PositionType;
}

