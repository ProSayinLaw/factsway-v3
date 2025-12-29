import { DocumentStructure } from '@/types/drafting';

export function createMockDraft(): DocumentStructure {
    const s1 = 's-' + crypto.randomUUID();
    const s2 = 's-' + crypto.randomUUID();
    const s3 = 's-' + crypto.randomUUID();

    const p1 = 'p-' + crypto.randomUUID();
    const p2 = 'p-' + crypto.randomUUID();
    const p3 = 'p-' + crypto.randomUUID();

    const sn1 = 'sn-' + crypto.randomUUID();
    const sn2 = 'sn-' + crypto.randomUUID();
    const sn3 = 'sn-' + crypto.randomUUID();
    const sn4 = 'sn-' + crypto.randomUUID();

    return {
        rootSectionIds: [s1, s2],
        sections: {
            [s1]: {
                id: s1,
                title: 'INTRODUCTION', // Was I. INTRODUCTION
                level: 1,
                childSectionIds: [],
                paragraphIds: [p1]
            },
            [s2]: {
                id: s2,
                title: 'FACTUAL BACKGROUND', // Was II. FACTUAL BACKGROUND
                level: 1,
                childSectionIds: [s3],
                paragraphIds: []
            },
            [s3]: {
                id: s3,
                title: 'The Incident', // Was A. The Incident
                level: 2,
                childSectionIds: [],
                paragraphIds: [p2, p3],
                parentId: s2
            }
        },
        paragraphs: {
            [p1]: {
                id: p1,
                sectionId: s1,
                sentenceIds: [sn1, sn2],
                style: 'BODY'
            },
            [p2]: {
                id: p2,
                sectionId: s3,
                sentenceIds: [sn3],
                style: 'BODY'
            },
            [p3]: {
                id: p3,
                sectionId: s3,
                sentenceIds: [sn4],
                style: 'BODY'
            }
        },
        sentences: {
            [sn1]: {
                id: sn1,
                text: 'COMES NOW, Plaintiff, and files this Motion for Summary Judgment.',
                paragraphId: p1,
                sectionId: s1
            },
            [sn2]: {
                id: sn2,
                text: 'This case arises from a breach of contract dispute.',
                paragraphId: p1,
                sectionId: s1
            },
            [sn3]: {
                id: sn3,
                text: 'On or about January 1, 2024, the parties entered into an agreement.',
                paragraphId: p2,
                sectionId: s3
            },
            [sn4]: {
                id: sn4,
                text: 'Defendant failed to perform their obligations under the contract.',
                paragraphId: p3,
                sectionId: s3
            }
        }
    };
}
