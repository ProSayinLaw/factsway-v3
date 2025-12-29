<template>
  <div class="chatbox-container" :class="{ open: store.isOpen }">
    
    <div class="chat-header" @click="store.toggle()">
      <div class="header-title">
        <i data-lucide="sparkles" class="ai-icon"></i>
        <span>FACTSWAY Assistant</span>
      </div>
      <i :data-lucide="store.isOpen ? 'chevron-down' : 'chevron-up'" class="toggle-icon"></i>
    </div>

    <div v-if="store.isOpen" class="chat-body">
      <div class="messages">
        <div class="msg ai">
          <div class="bubble">
            How can I help you with <strong>Cruz v. JS7</strong> today?
          </div>
        </div>
      </div>
      
      <div class="input-area">
        <input type="text" placeholder="Ask about this case..." />
        <button class="send-btn">
          <i data-lucide="send"></i>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted, onUpdated } from 'vue';
import { useChatboxStore } from '@/stores/chatbox.store';

const store = useChatboxStore();
declare const lucide: any;

onMounted(() => { if(typeof lucide !== 'undefined') lucide.createIcons(); });
onUpdated(() => { if(typeof lucide !== 'undefined') lucide.createIcons(); });
</script>

<style scoped>
.chatbox-container {
  position: fixed;
  bottom: 0;
  right: 20px;
  width: 320px;
  background: var(--bg-paper);
  border: 1px solid var(--accent-gold);
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
  z-index: 1000;
  transition: height 0.3s ease;
  height: 48px; /* Collapsed height */
}

.chatbox-container.open {
  height: 500px;
}

.chat-header {
  height: 48px;
  background: #fffbeb; /* Gold tint */
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--accent-gold);
  font-weight: 700;
  font-family: var(--font-head);
}

.chat-body {
  height: calc(500px - 48px);
  display: flex;
  flex-direction: column;
}

.messages {
  flex: 1;
  padding: 16px;
  background: #ffffff;
}

.msg.ai .bubble {
  background: var(--note-ai-bg);
  border: 1px solid var(--note-ai-border);
  padding: 10px;
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text-ink);
}

.input-area {
  padding: 12px;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  gap: 8px;
}

input {
  flex: 1;
  padding: 8px;
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
}

.send-btn {
  background: var(--accent-gold);
  color: white;
  border: none;
  border-radius: 4px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>
