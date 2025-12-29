import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ClerkPanelState = 'collapsed' | 'expanded' | 'split' | 'float';

export interface ClerkConfig {
    id: string;
    name: string;
    icon: string; // Lucide icon name
    component: string; // Vue component name to render
}

export const useClerkStore = defineStore('clerk', () => {
    // Configuration of available clerks
    const clerks = ref<ClerkConfig[]>([
        { id: 'todo', name: 'To-Do', icon: 'check-square', component: 'TodoClerk' },
        { id: 'notes', name: 'Notes', icon: 'sticky-note', component: 'NotesClerk' },
        { id: 'facts', name: 'Facts', icon: 'search', component: 'FactsClerk' },
        { id: 'exhibits', name: 'Exhibits', icon: 'paperclip', component: 'ExhibitsClerk' },
        { id: 'discovery', name: 'Discovery', icon: 'file-search', component: 'DiscoveryClerk' },
        { id: 'caseblock', name: 'Caseblock', icon: 'scale', component: 'CaseblockClerk' },
    ]);

    // Active state
    // Only one clerk can be 'expanded' in the sidebar at a time (accordion style)
    // or multiple if we allow stacking (spec implies accordion behavior for main view)
    const activeClerkId = ref<string | null>('todo'); // Default open

    // Track specific states if we support split/float later
    const clerkStates = ref<Record<string, ClerkPanelState>>({});

    function toggleClerk(id: string) {
        if (activeClerkId.value === id) {
            activeClerkId.value = null; // Collapse
        } else {
            activeClerkId.value = id; // Expand
        }
    }

    function expandClerk(id: string) {
        activeClerkId.value = id;
    }

    return {
        clerks,
        activeClerkId,
        toggleClerk,
        expandClerk
    };
});
