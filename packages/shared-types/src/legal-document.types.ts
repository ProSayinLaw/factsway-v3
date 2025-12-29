/**
 * Canonical legal document format for FACTSWAY platform
 */
export interface LegalDocumentTypes {
    body: DocumentBody;
    meta: DocumentMeta;
    [property: string]: any;
}

export interface DocumentBody {
    sections: Section[];
    [property: string]: any;
}

export interface Section {
    children?: Section[];
    content?:  Content;
    level:     number;
    sectionID: string;
    type:      SectionType;
    [property: string]: any;
}

export interface Content {
    /**
     * Section numbering like 'I.', 'A.', '1.'
     */
    numbering?: string;
    /**
     * Plain text content (authoritative)
     */
    text?:      string;
    sentences?: Sentence[];
    items?:     Item[];
    listType?:  ListType;
    [property: string]: any;
}

export interface Item {
    marker?: string;
    text:    string;
    [property: string]: any;
}

export enum ListType {
    Bullet = "bullet",
    Lettered = "lettered",
    Numbered = "numbered",
}

export interface Sentence {
    /**
     * Character offset in paragraph
     */
    end: number;
    /**
     * Content-based hash for stability
     */
    sentenceID: string;
    /**
     * Character offset in paragraph
     */
    start: number;
    text:  string;
    [property: string]: any;
}

export enum SectionType {
    Caseblock = "caseblock",
    Heading = "heading",
    List = "list",
    Paragraph = "paragraph",
    Signature = "signature",
}

export interface DocumentMeta {
    /**
     * ULID for parent case
     */
    caseID:    string;
    createdAt: Date;
    /**
     * ULID for document
     */
    documentID: string;
    /**
     * Document title
     */
    title?: string;
    /**
     * Document type
     */
    type:      MetaType;
    updatedAt: Date;
    [property: string]: any;
}

/**
 * Document type
 */
export enum MetaType {
    Discovery = "discovery",
    Motion = "motion",
    Order = "order",
    Pleading = "pleading",
    Reply = "reply",
    Response = "response",
}
