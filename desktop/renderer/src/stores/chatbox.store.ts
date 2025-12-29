import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useChatboxStore = defineStore('chatbox', () => {
    const isOpen = ref(false);
    const mode = ref<'global' | 'docked'>('global');
    const dockedToClerkId = ref<string | null>(null);

    function toggle() {
        isOpen.value = !isOpen.value;
    }

    function dockToClerk(clerkId: string) {
        mode.value = 'docked';
        dockedToClerkId.value = clerkId;
        isOpen.value = true;
    }

    function undock() {
        mode.value = 'global';
        dockedToClerkId.value = null;
    }

    return {
        isOpen,
        mode,
        dockedToClerkId,
        toggle,
        dockToClerk,
        undock
    };
});
