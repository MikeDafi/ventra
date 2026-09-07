import * as FileSystem from 'expo-file-system/legacy';

// Folder where saved chat-history JSON files live (mirrors ticket-maker's TICKET_FOLDER).
export const CHAT_FOLDER = FileSystem.documentDirectory + 'imessage_chats/';

// Sender identity for a single bubble.
export const SENDER_ME = 'me'; // right-aligned, colored bubble
export const SENDER_THEM = 'them'; // left-aligned, gray bubble

/**
 * Color themes for the conversation. "Me" bubbles are colored, "them" bubbles are gray.
 *  - blue  => iMessage look
 *  - green => SMS look
 */
export const THEMES = {
  blue: {
    key: 'blue',
    label: 'iMessage (Blue)',
    meBubble: '#007AFF',
    meText: '#FFFFFF',
    themBubble: '#E9E9EB',
    themText: '#000000',
    placeholder: 'iMessage',
    sendButton: '#007AFF',
  },
  green: {
    key: 'green',
    label: 'SMS (Green)',
    meBubble: '#34C759',
    meText: '#FFFFFF',
    themBubble: '#E9E9EB',
    themText: '#000000',
    placeholder: 'Text Message \u2022 SMS',
    sendButton: '#34C759',
    serviceLabel: 'Text Message \u2022 SMS',
  },
};

export const DEFAULT_THEME = 'blue';

export const DEFAULT_PERSON_NAME = 'John Appleseed';
export const DEFAULT_LOCATION = '';

const DEFAULT_DATE_STRING = new Date().toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export const DEFAULT_FILE_NAME = `${DEFAULT_PERSON_NAME.replace(/\s+/g, '_')}__${DEFAULT_DATE_STRING}`;

// Show a centered time separator when two messages are further apart than this.
export const SEPARATOR_GAP_MS = 60 * 60 * 1000; // 1 hour

const SEED_BASE = Date.now();

// A tiny starter conversation so the preview is never empty.
export const DEFAULT_MESSAGES = [
  { id: 'seed-1', sender: SENDER_THEM, text: 'Hey! Are you free later?', time: SEED_BASE - 5 * 60 * 1000 },
  { id: 'seed-2', sender: SENDER_ME, text: 'Yeah, what did you have in mind?', time: SEED_BASE - 4 * 60 * 1000 },
];

export const newMessageId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Formats a timestamp the way iMessage renders its centered time separator.
 * Returns { boldPart, connector, time } — e.g. Today: { 'Today', ' ', '12:33 PM' },
 * or a past day: { 'Fri, Jul 3', ' at ', '12:51 PM' }. Null when unusable.
 */
export function formatMessageTime(ts) {
  if (!ts) return null;
  const d = new Date(ts);
  if (isNaN(d.getTime())) return null;

  const now = new Date();
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  if (d.toDateString() === now.toDateString()) {
    return { boldPart: 'Today', connector: ' ', time };
  }

  // Previous days, e.g. "Fri, Jul 3 at 12:51 PM"
  const boldPart = d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  return { boldPart, connector: ' at ', time };
}

/**
 * Parses an optional free-text timestamp the user typed for a message,
 * e.g. "Jul 3, 12:51 PM" or "12:51 PM". Returns epoch ms, or null if empty/invalid.
 */
export function parseTimeInput(str) {
  if (!str || !String(str).trim()) return null;
  const s = String(str).trim();
  let d = new Date(s);
  if (isNaN(d.getTime())) {
    d = new Date(`${s} ${new Date().getFullYear()}`);
  }
  return isNaN(d.getTime()) ? null : d.getTime();
}
