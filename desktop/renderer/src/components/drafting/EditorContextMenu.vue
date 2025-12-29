<template>
  <!-- Teleport to body to avoid position:fixed issues from parent transforms -->
  <Teleport to="body">
    <ContextMenu 
      :visible="visible"
      :x="x"
      :y="y"
      :items="menuItems"
      @close="emit('close')"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ContextMenu, { type MenuItem } from '@/components/common/ContextMenu.vue';
import { useDraftStore } from '@/stores/draft.store';
import { useCursorStore } from '@/stores/cursor.store';

/**
 * Editor Context Menu
 * Per Drafting Clerk Contract: All actions are explicit structural mutations.
 * Context-aware menu items based on what was right-clicked.
 */

export interface EditorContextTarget {
  type: 'sentence' | 'paragraph' | 'sectionHeader' | 'selection';
  sectionId: string;
  paragraphId?: string;
  sentenceId?: string;
  selectedText?: string;
}

const props = defineProps<{
  visible: boolean;
  x: number;
  y: number;
  target: EditorContextTarget | null;
}>();

const emit = defineEmits(['close']);

const store = useDraftStore();
const cursorStore = useCursorStore();

const menuItems = computed<MenuItem[]>(() => {
  if (!props.target) return [];

  switch (props.target.type) {
    case 'sentence':
      return getSentenceMenuItems();
    case 'paragraph':
      return getParagraphMenuItems();
    case 'sectionHeader':
      return getSectionMenuItems();
    case 'selection':
      return getSelectionMenuItems();
    default:
      return [];
  }
});

function getSentenceMenuItems(): MenuItem[] {
  const items: MenuItem[] = [
    {
      label: 'Link to Exhibit...',
      icon: 'link',
      action: () => linkToExhibit()
    },
    { separator: true },
    {
      label: 'Insert Paragraph After',
      icon: 'corner-down-right',
      action: () => insertParagraphAfterSentence()
    },
    {
      label: 'Insert Section After',
      icon: 'plus-square',
      action: () => insertSectionHere()
    },
    { separator: true },
    {
      label: 'Delete Sentence',
      icon: 'trash-2',
      danger: true,
      action: () => deleteSentence()
    }
  ];
  return items;
}

function getParagraphMenuItems(): MenuItem[] {
  return [
    {
      label: 'Insert Paragraph After',
      icon: 'corner-down-right',
      action: () => insertParagraphAfter()
    },
    {
      label: 'Convert to Section',
      icon: 'heading',
      action: () => convertToSection()
    },
    { separator: true },
    {
      label: 'Delete Paragraph',
      icon: 'trash-2',
      danger: true,
      action: () => deleteParagraph()
    }
  ];
}

function getSectionMenuItems(): MenuItem[] {
  return [
    {
      label: 'Add Subsection',
      icon: 'plus',
      action: () => addSubsection()
    },
    {
      label: 'Add Sibling Section',
      icon: 'arrow-down-to-line',
      action: () => addSiblingSection()
    },
    { separator: true },
    {
      label: 'Promote (Move Left)',
      icon: 'arrow-left',
      action: () => promoteSection()
    },
    {
      label: 'Demote (Move Right)',
      icon: 'arrow-right',
      action: () => demoteSection()
    },
    { separator: true },
    {
      label: 'Delete Section',
      icon: 'trash-2',
      danger: true,
      action: () => deleteSection()
    }
  ];
}

function getSelectionMenuItems(): MenuItem[] {
  return [
    {
      label: 'Link to Exhibit...',
      icon: 'link',
      action: () => linkToExhibit()
    },
    {
      label: 'Add Citation...',
      icon: 'quote',
      action: () => addCitation()
    }
  ];
}

// --- Action Handlers ---

function linkToExhibit() {
  console.log('TODO: Open exhibit picker for:', props.target?.sentenceId);
  // @future-phase: Implement exhibit linking
}

function addCitation() {
  console.log('TODO: Open citation dialog for selection');
  // @future-phase: Implement citation insertion
}

function insertParagraphAfterSentence() {
  if (!props.target?.paragraphId) return;
  store.createParagraphAfter(props.target.paragraphId);
}

function insertParagraphAfter() {
  if (!props.target?.paragraphId) return;
  store.createParagraphAfter(props.target.paragraphId);
}

function insertSectionHere() {
  if (!props.target?.sectionId) return;
  const section = store.structure.sections[props.target.sectionId];
  if (!section) return;
  
  const parentId = section.parentId || null;
  let index = 0;
  
  if (parentId) {
    const parent = store.structure.sections[parentId];
    index = parent.childSectionIds.indexOf(props.target.sectionId) + 1;
  } else {
    index = store.structure.rootSectionIds.indexOf(props.target.sectionId) + 1;
  }
  
  store.addSection(parentId, index);
}

function convertToSection() {
  if (!props.target?.paragraphId) return;
  store.convertParagraphToSection(props.target.paragraphId);
}

function deleteSentence() {
  if (!props.target?.sentenceId) return;
  store.deleteSentence(props.target.sentenceId);
}

function deleteParagraph() {
  if (!props.target?.paragraphId) return;
  store.deleteParagraph(props.target.paragraphId);
}

function addSubsection() {
  if (!props.target?.sectionId) return;
  store.addSection(props.target.sectionId, 0);
}

function addSiblingSection() {
  insertSectionHere();
}

function promoteSection() {
  if (!props.target?.sectionId) return;
  store.promoteSection(props.target.sectionId);
}

function demoteSection() {
  if (!props.target?.sectionId) return;
  store.demoteSection(props.target.sectionId);
}

function deleteSection() {
  if (!props.target?.sectionId) return;
  store.deleteSection(props.target.sectionId);
}
</script>
