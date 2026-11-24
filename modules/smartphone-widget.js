// =============================================================================
// CHEAP DICE: ISEKAI SMARTPHONE WIDGET (PROTOTYPE)
// Optional floating smartphone UI that can replace the player right sidebar.
// Disabled by default via SETTINGS.FEATURES.SMARTPHONE_WIDGET.
// =============================================================================

import { MODULE_ID, SETTINGS } from "../src/constants.js";
import {
  DICE_DEFS,
  appendDieToChatText,
  removeDieFromChatText,
  swapD20ModeInText,
  updateFlatModifierInChatText,
  parseFormulaStateFromChatText
} from "./dice-tray-copycat.js";

export const PHONE_THEMES = Object.freeze({
  ios: {
    id: "ios",
    label: "iOS",
    signal: "Mana-Fi",
    navStyle: "pill"
  }
});

export const PHONE_APPS = Object.freeze([
  { id: "messages", label: "Messages", icon: "fa-solid fa-message", badgeKey: "unreadMessages", color: "#34c759", category: "phone" },
  { id: "system-log", label: "System Log", icon: "fa-solid fa-terminal", badgeKey: "unreadRolls", color: "#5856d6", category: "system" },
  { id: "combat", label: "Combat", icon: "fa-solid fa-swords", color: "#ff3b30", category: "system" },
  { id: "dice-stuff", label: "Dice Stuff", icon: "fa-solid fa-dice-d20", color: "#af52de", category: "system" },
  { id: "contacts", label: "Contacts", icon: "fa-solid fa-address-book", color: "#ff9500", category: "system" },
  { id: "academy", label: "Academy", icon: "fa-solid fa-book-open", color: "#007aff", category: "system" },
  { id: "notes", label: "Notes", icon: "fa-solid fa-note-sticky", color: "#ffd60a", category: "phone" },
  { id: "camera", label: "Camera", icon: "fa-solid fa-camera", color: "#636366", category: "phone" },
  { id: "photos", label: "Photos", icon: "fa-solid fa-images", color: "#ff9f0a", category: "phone" },
  { id: "music", label: "Music", icon: "fa-solid fa-music", color: "#ff2d55", category: "phone" },
  { id: "settings", label: "Settings", icon: "fa-solid fa-gear", color: "#8e8e93", category: "phone" }
]);

const WIDGET_ID = "cd-smartphone-root";
const STYLE_ID = "cd-smartphone-styles";
const HIDE_SIDEBAR_BODY_CLASS = "cd-phone-hide-sidebar";
const POSITION_STORAGE_KEY = "cd.smartphone.position";
const WALLPAPER_STORAGE_KEY = "cd.smartphone.wallpaper";
const USER_WALLPAPER_FLAG = "phoneWallpaper";
const USER_POSITION_FLAG = "phonePosition";
const USER_HIDDEN_THREADS_FLAG = "phoneHiddenThreads";
const HIDDEN_THREADS_STORAGE_KEY = "cd.smartphone.hiddenThreads";
const USER_CONTACT_COLORS_FLAG = "phoneContactColors";
const CONTACT_COLORS_STORAGE_KEY = "cd.smartphone.contactColors";
const USER_CONTACT_NICKNAMES_FLAG = "phoneContactNicknames";
const USER_APP_ORDER_FLAG = "phoneAppOrder";
const USER_PHONE_FLAGS = Object.freeze([
  USER_WALLPAPER_FLAG,
  USER_POSITION_FLAG,
  USER_HIDDEN_THREADS_FLAG,
  USER_CONTACT_COLORS_FLAG,
  USER_CONTACT_NICKNAMES_FLAG,
  USER_APP_ORDER_FLAG
]);
const CONTACT_NICKNAMES_STORAGE_KEY = "cd.smartphone.contactNicknames";
const APP_ORDER_STORAGE_KEY = "cd.smartphone.appOrder";
const USER_NOTES_FLAG = "phoneNotes";
const NOTES_STORAGE_KEY = "cd.smartphone.notes";
const MAX_PHONE_NOTES = 100;
const ALBUM_FOLDER_FLAG = "phoneAlbumFolder";
const ALBUM_USER_FLAG = "phoneAlbumUserId";
const ALBUM_ACTOR_FLAG = "phoneAlbumActorId";
const ALBUM_FOLDER_NAME = "Player Photo Albums";
const CONTACTS_FOLDER_NAME = "Contacts";
const CONTACTS_FOLDER_FLAG = "phoneContactsFolder";
const MESSAGES_JOURNAL_FLAG = "phoneMessagesJournal";
const MESSAGES_DATA_FLAG = "phoneMessages";
const GROUPS_DATA_FLAG = "phoneGroups";
const NPC_CONTACTS_DATA_FLAG = "phoneNpcContacts";
const MAX_STORED_PHONE_MESSAGES = 200;
const MESSAGES_PRIVACY_TOOLTIP = "For persistence while using Your Phone, messages are saved to FoundryVTT and NOT private.";
const MAX_SESSION_PHOTOS = 24;

export const WALLPAPER_PRESETS = Object.freeze([
  { id: "midnight", label: "Midnight", value: "#0f131d" },
  { id: "ocean", label: "Ocean", value: "linear-gradient(160deg, #0b2447, #19376d, #1e56a0)" },
  { id: "sakura", label: "Sakura", value: "linear-gradient(160deg, #2d142c, #510a32, #801336)" },
  { id: "sunset", label: "Sunset", value: "linear-gradient(160deg, #1a1423, #3d314a, #684756)" },
  { id: "emerald", label: "Emerald", value: "linear-gradient(160deg, #081c15, #1b4332, #2d6a4f)" },
  { id: "obsidian", label: "Obsidian", value: "#09090b" },
  { id: "lavender", label: "Lavender", value: "linear-gradient(160deg, #24193c, #4c2a85, #6b48ff)" },
  { id: "crimson", label: "Crimson", value: "linear-gradient(160deg, #2b090c, #660708, #a4161a)" },
  { id: "amber", label: "Amber", value: "linear-gradient(160deg, #2a1805, #6c3b09, #b5651d)" },
  { id: "cyan", label: "Cyan", value: "linear-gradient(160deg, #05202a, #0b4f6c, #14746f)" },
  { id: "slate", label: "Slate", value: "linear-gradient(160deg, #1e293b, #334155, #475569)" },
  { id: "starlight", label: "Starlight", value: "linear-gradient(160deg, #111827, #1f2937, #374151)" },
  { id: "aurora", label: "Aurora", value: "linear-gradient(160deg, #0f2027, #203a43, #2c5364)" },
  { id: "neon", label: "Neon", value: "linear-gradient(160deg, #1a0633, #4a0e78, #d90368)" },
  { id: "pastel", label: "Pastel Sky", value: "linear-gradient(160deg, #2b2d42, #5c6b9c, #8d99ae)" },
  { id: "twilight", label: "Twilight", value: "linear-gradient(160deg, #0f0c29, #302b63, #24243e)" },
  { id: "berry", label: "Berry", value: "linear-gradient(160deg, #2c0735, #613dc1, #858ae3)" },
  { id: "mint", label: "Mint", value: "linear-gradient(160deg, #0b2b26, #16697a, #489fb5)" }
]);

export const PHONE_COLOR_PRESETS = Object.freeze([
  { id: "default", label: "Slate", value: "#2c3347" },
  { id: "black", label: "Space Black", value: "#16181d" },
  { id: "titanium", label: "Natural Titanium", value: "#8a857e" },
  { id: "silver", label: "Silver", value: "#c8ccd4" },
  { id: "gold", label: "Gold", value: "#d4af37" },
  { id: "rose", label: "Rose Pink", value: "#e07a9b" },
  { id: "blue", label: "Pacific Blue", value: "#2b598a" },
  { id: "green", label: "Alpine Green", value: "#2e5a44" },
  { id: "red", label: "Crimson", value: "#9b2226" },
  { id: "purple", label: "Deep Purple", value: "#5a3d7a" },
  { id: "teal", label: "Teal", value: "#2a7f86" },
  { id: "white", label: "Starlight White", value: "#eceef2" },
  { id: "cobalt", label: "Cobalt", value: "#1d4ed8" },
  { id: "coral", label: "Coral", value: "#f97316" },
  { id: "mint", label: "Mint", value: "#34d399" },
  { id: "lavender", label: "Lavender", value: "#a78bfa" },
  { id: "bronze", label: "Bronze", value: "#925e3c" },
  { id: "charcoal", label: "Charcoal", value: "#3f3f46" }
]);

let _isMounted = false;
let _isOpen = false;
let _currentApp = "home";
let _unreadMessages = 0;
let _unreadRolls = 0;
let _hooksRegistered = false;
let _clockTimer = null;
let _cameraGrid = true;
let _cameraExpanded = false;
let _selectedPhotoId = null;
let _sessionPhotos = [];
let _settingsSubmenu = null;
let _wallpaperTab = "background";
let _photosFilter = "all";
let _messageThreadId = null;
let _messageComposing = false;
let _composeNpcId = null;
let _composeGroupMode = false;
let _composeGroupName = "";
let _composeGroupMemberIds = new Set();
let _composeGroupNpcIds = new Set();
let _groupReplyAsNpcByThread = {};
let _contactDetailKey = null;
let _npcAccessSelectDraftIds = new Set();
let _confirmHideThreadId = null;
let _gmConfirmDeleteTarget = null;
let _knownPhoneMessageIds = new Set();
let _unreadByThread = {};
let _navHistory = [];
let _diceTrayOpen = false;
let _diceTrayFormula = "";
let _diceTrayMode = "norm";
let _diceTrayCounts = { d4: 0, d6: 0, d8: 0, d10: 0, d12: 0, d20: 0, d100: 0 };
let _ephemeralPhoneMessages = [];
let _optimisticPhoneGroups = [];
let _msgFlyoutOpen = false;
let _msgFlyoutTab = "emoji";
let _msgTextDraft = "";
let _msgSelectionStart = null;
let _msgSelectionEnd = null;
let _msgReactingToId = null;
let _msgStagedImage = null;
let _msgUrlDraft = "";
let _msgUrlError = "";
let _sysLogComposeOpen = false;
let _sysLogAlias = "System";
let _sysLogTone = "log";
let _sysLogRecipient = "all";
let _sysLogDraft = "";
let _selectedPhoneActorId = null;
let _actorPickerOpen = false;
let _pulldownOpen = false;
let _homeEditMode = false;
let _selectedNoteId = null;
let _notesSearchQuery = "";
let _confirmDeleteNoteId = null;
let _noteSaveTimer = null;

export const SYSTEM_LOG_TONES = Object.freeze({
  log: { id: "log", label: "Log", icon: "fa-solid fa-terminal", accent: "#5856d6", bg: "rgba(88, 86, 214, 0.12)" },
  info: { id: "info", label: "Info", icon: "fa-solid fa-circle-info", accent: "#0a84ff", bg: "rgba(10, 132, 255, 0.12)" },
  warning: { id: "warning", label: "Warning", icon: "fa-solid fa-triangle-exclamation", accent: "#ff9f0a", bg: "rgba(255, 159, 10, 0.14)" },
  alert: { id: "alert", label: "Alert", icon: "fa-solid fa-skull-crossbones", accent: "#ff453a", bg: "rgba(255, 69, 58, 0.14)" }
});

const PHONE_REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🎲"];

const MAX_EPHEMERAL_PHONE_MESSAGES = 60;
const RECENT_EMOJIS_STORAGE_KEY = "cd-phone-recent-emojis";
const PHONE_EMOJI_GROUPS = [
  { label: "Faces", emojis: ["😀", "😂", "🥹", "😍", "😎", "🤔", "😮", "😢", "😭", "😡", "🤯", "🥳", "😴", "🤫", "🫡", "🙄"] },
  { label: "Hands", emojis: ["👍", "👎", "👏", "🙌", "🙏", "🤝", "✌️", "🤞", "🫶", "👀", "💀", "👻"] },
  { label: "RPG", emojis: ["⚔️", "🛡️", "🎲", "🧪", "🔥", "✨", "💎", "👑", "📜", "🗝️", "🕯️", "🍺"] },
  { label: "Hearts", emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "💔", "❗", "❓", "💯", "🎉"] }
];

// -----------------------------------------------------------------------------
// Pure Helpers (Exported for Testing)
// -----------------------------------------------------------------------------

/**
 * Safely unwrap HTML/string content from a Foundry ChatMessage-like object.
 * @param {object} msg
 * @returns {string}
 */
export function stripHtmlToText(html) {
  return String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizePhoneColor(value) {
  const raw = String(value || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw) || /^#[0-9a-fA-F]{3}$/.test(raw)) return raw;
  return "";
}

/**
 * Resolve the display color for a contact/sender, preferring a per-user override over Foundry's configured color.
 * @param {string} contactKey
 * @param {string} [defaultColor]
 * @param {Record<string, string>} [overrides]
 * @returns {string}
 */
export function resolveContactDisplayColor(contactKey, defaultColor = "", overrides = {}) {
  const override = contactKey && overrides && typeof overrides === "object"
    ? sanitizePhoneColor(overrides[contactKey])
    : "";
  if (override) return override;
  return sanitizePhoneColor(defaultColor);
}

/**
 * Sanitize a per-user contact nickname (trimmed, max 40 characters).
 * @param {string} value
 * @returns {string}
 */
export function sanitizePhoneNickname(value) {
  return String(value ?? "").trim().slice(0, 40);
}

/**
 * Resolve the display name for a contact/sender, preferring a per-user nickname over the default name.
 * @param {string} contactKey
 * @param {string} [defaultName]
 * @param {Record<string, string>} [overrides]
 * @returns {string}
 */
export function resolveContactDisplayName(contactKey, defaultName = "", overrides = {}) {
  const override = contactKey && overrides && typeof overrides === "object"
    ? sanitizePhoneNickname(overrides[contactKey])
    : "";
  if (override) return override;
  return String(defaultName || "");
}

/**
 * Normalize the stored NPC contact access configuration into `{ [actorId]: "all" | string[] }`.
 * Supports migrating legacy `string[]` actor ID arrays (each treated as `"all"`).
 * @param {unknown} raw
 * @returns {Record<string, "all" | string[]>}
 */
export function normalizeNpcContactAccessMap(raw) {
  const out = {};
  if (Array.isArray(raw)) {
    for (const id of raw) {
      const actorId = String(id || "").trim();
      if (actorId) out[actorId] = "all";
    }
    return out;
  }
  if (!raw || typeof raw !== "object") return out;

  for (const [rawActorId, value] of Object.entries(raw)) {
    const actorId = String(rawActorId || "").trim();
    if (!actorId) continue;
    if (value === "all") {
      out[actorId] = "all";
    } else if (Array.isArray(value)) {
      const userIds = Array.from(new Set(value.map((uid) => String(uid || "").trim()).filter(Boolean)));
      if (userIds.length > 0) out[actorId] = userIds;
    }
  }
  return out;
}

/**
 * Return `"all"`, `"select"`, or `"off"` for an NPC's stored access entry.
 * @param {Record<string, "all" | string[]>} accessMap
 * @param {string} actorId
 * @returns {"all"|"select"|"off"}
 */
export function getNpcContactAccessMode(accessMap, actorId) {
  const entry = accessMap && typeof accessMap === "object" ? accessMap[String(actorId || "")] : undefined;
  if (entry === "all") return "all";
  if (Array.isArray(entry) && entry.length > 0) return "select";
  return "off";
}

/**
 * Determine whether a user can see/message an NPC contact.
 * GMs always have access; players require `"all"` or their user ID in the list.
 * @param {Record<string, "all" | string[]>} accessMap
 * @param {string} actorId
 * @param {string} [userId]
 * @param {boolean} [isGM]
 * @returns {boolean}
 */
export function canUserAccessNpcContact(accessMap, actorId, userId = "", isGM = false) {
  if (isGM) return true;
  const entry = accessMap && typeof accessMap === "object" ? accessMap[String(actorId || "")] : undefined;
  if (entry === "all") return true;
  if (Array.isArray(entry)) {
    const uid = String(userId || "").trim();
    return Boolean(uid && entry.includes(uid));
  }
  return false;
}

/**
 * Build a short human-readable summary of who can access an NPC contact.
 * @param {Record<string, "all" | string[]>} accessMap
 * @param {string} actorId
 * @returns {string}
 */
export function formatNpcAccessSummary(accessMap, actorId) {
  const mode = getNpcContactAccessMode(accessMap, actorId);
  if (mode === "all") return "All players";
  if (mode === "select") {
    const count = accessMap[String(actorId || "")].length;
    return `${count} player${count === 1 ? "" : "s"}`;
  }
  return "Hidden from players";
}

/**
 * Validate an image URL for safe rendering in phone messages.
 * Allows http(s) URLs and data:image/ URIs.
 * @param {string} url
 * @returns {string}
 */
export function sanitizePhoneImageUrl(url) {
  const trimmed = String(url || "").trim();
  if (!trimmed) return "";
  if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(trimmed)) return trimmed;
  if (/^https?:\/\/\S+$/i.test(trimmed)) return trimmed;
  return "";
}

/**
 * Return true when text consists solely of 1-3 emoji graphemes (and whitespace).
 * @param {string} text
 * @returns {boolean}
 */
export function isEmojiOnlyText(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return false;
  const stripped = trimmed.replace(/\s+/g, "");
  try {
    const segs = Array.from(new Intl.Segmenter("en", { granularity: "grapheme" }).segment(stripped), (s) => s.segment);
    if (segs.length === 0 || segs.length > 3) return false;
    return segs.every((g) => /\p{Extended_Pictographic}/u.test(g));
  } catch {
    return false;
  }
}

/**
 * Build HTML content for a phone message from optional text and imageSrc.
 * @param {{ text?: string, imageSrc?: string }} params
 * @returns {string}
 */
export function buildPhoneMessageHtml({ text = "", imageSrc = "" } = {}) {
  const safeText = String(text || "").trim()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  const safeSrc = sanitizePhoneImageUrl(imageSrc)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
  const parts = [];
  if (safeSrc) parts.push(`<p><img src="${safeSrc}" alt="Photo" /></p>`);
  if (safeText) parts.push(`<p>${safeText}</p>`);
  return parts.join("");
}

/**
 * Toggle a user's emoji reaction on a reactions map ({ [emoji]: string[] }).
 * @param {object} reactions
 * @param {string} emoji
 * @param {string} userId
 * @returns {object}
 */
export function toggleMessageReaction(reactions, emoji, userId) {
  const next = {};
  if (reactions && typeof reactions === "object") {
    for (const [k, v] of Object.entries(reactions)) {
      if (Array.isArray(v) && v.length > 0) next[k] = [...v];
    }
  }
  if (!emoji || !userId) return next;
  const list = Array.isArray(next[emoji]) ? next[emoji] : [];
  if (list.includes(userId)) {
    const filtered = list.filter((id) => id !== userId);
    if (filtered.length > 0) next[emoji] = filtered;
    else delete next[emoji];
  } else {
    next[emoji] = [...list, userId];
  }
  return next;
}

/**
 * Classify a Foundry ChatMessage into "roll" (System Log) or "text" (Messages).
 * @param {object} msg
 * @returns {"roll"|"text"}
 */
export function classifyChatMessageForPhone(msg) {
  if (!msg) return "text";
  const hasRolls = Array.isArray(msg.rolls) ? msg.rolls.length > 0 : Boolean(msg.isRoll);
  const content = String(msg.content || "");
  const isCustomCard = content.includes("cd-chat-card") || content.includes("dnd5e2");
  const isSystemLogCard = content.includes("cd-syslog-card") || Boolean(msg?.flags?.[MODULE_ID]?.systemLog);
  const isBeyond20 = content.includes("beyond20-message") || content.includes("beyond20-") || Boolean(msg?.flags?.beyond20);
  if (hasRolls || isCustomCard || isSystemLogCard || isBeyond20) return "roll";
  return "text";
}

/**
 * Build the HTML payload for a DM-dispatched system log chat card.
 * @param {object} opts
 * @param {string} opts.text
 * @param {string} [opts.alias]
 * @param {string} [opts.tone]
 * @returns {string}
 */
export function buildSystemLogMessageHtml({ text, alias = "System", tone = "log" } = {}) {
  const safeText = escapeHtml(String(text || "").trim()).replace(/\r?\n/g, "<br>");
  const safeAlias = escapeHtml(String(alias || "System").trim() || "System");
  const toneMeta = SYSTEM_LOG_TONES[tone] || SYSTEM_LOG_TONES.log;
  return `
    <div class="cd-syslog-card cd-syslog-tone-${toneMeta.id}" data-syslog-tone="${toneMeta.id}" style="border-left: 3px solid ${toneMeta.accent}; background: ${toneMeta.bg};">
      <div class="cd-syslog-header">
        <span class="cd-syslog-alias"><i class="${toneMeta.icon}" style="color: ${toneMeta.accent};"></i> ${safeAlias}</span>
        <span class="cd-syslog-badge" style="color: ${toneMeta.accent}; border-color: ${toneMeta.accent};">${toneMeta.label}</span>
      </div>
      <div class="cd-syslog-body">${safeText}</div>
    </div>
  `.trim();
}

/**
 * Format a Foundry ChatMessage into a lightweight view model for the phone UI.
 * @param {object} msg
 * @param {string} [currentUserId]
 * @returns {object}
 */
export function formatPhoneMessage(msg, currentUserId = "", isGM = false) {
  const authorId = msg?.author?.id ?? msg?.user?.id ?? msg?.author ?? "";
  const speakerAlias = msg?.speaker?.alias || msg?.author?.name || "Unknown";
  const whisper = Array.isArray(msg?.whisper) ? msg.whisper : [];
  const npcId = String(msg?.npcId || msg?.flags?.[MODULE_ID]?.npcId || "");
  const playerUserId = String(msg?.playerUserId || msg?.flags?.[MODULE_ID]?.playerUserId || "");
  const playerActorId = String(msg?.playerActorId || msg?.flags?.[MODULE_ID]?.playerActorId || "");
  const senderActorId = String(msg?.senderActorId || msg?.flags?.[MODULE_ID]?.senderActorId || "");
  const targetActorId = String(msg?.targetActorId || msg?.flags?.[MODULE_ID]?.targetActorId || "");
  const groupId = String(msg?.groupId || msg?.flags?.[MODULE_ID]?.groupId || "");
  const timestamp = Number(msg?.timestamp) || Date.now();
  const date = new Date(timestamp);
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const kind = classifyChatMessageForPhone(msg);
  const rawHtml = String(msg?.content || "");
  const plainText = stripHtmlToText(rawHtml);
  const imgMatch = rawHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
  const imageSrc = imgMatch ? imgMatch[1] : "";
  const isNpcAuthor = String(authorId).startsWith("npc:");

  return {
    id: String(msg?.id || ""),
    kind,
    authorId: String(authorId),
    sender: String(speakerAlias),
    isMine: Boolean((currentUserId && authorId === currentUserId) || (isGM && isNpcAuthor)),
    isWhisper: whisper.length > 0,
    whisper: whisper.map(String),
    npcId,
    playerUserId,
    playerActorId,
    senderActorId,
    targetActorId,
    groupId,
    timestamp,
    timeStr,
    plainText: plainText || (imageSrc ? "" : (kind === "roll" ? "Dice Roll" : "")),
    imageSrc,
    reactions: msg?.reactions && typeof msg.reactions === "object" ? msg.reactions : {},
    rawHtml
  };
}

/**
 * Filter formatted phone messages for Party Chat ("all"), a 1-on-1 DM, or an NPC thread.
 * @param {object[]} messages
 * @param {string} currentUserId
 * @param {string} targetThreadId
 * @returns {object[]}
 */
export function filterPhoneMessagesByThread(messages, currentUserId, targetThreadId) {
  if (!Array.isArray(messages)) return [];
  if (!targetThreadId || targetThreadId === "all") {
    return messages.filter((m) => !m.isWhisper && !m.npcId && !m.groupId);
  }
  if (String(targetThreadId).startsWith("group:")) {
    const groupId = String(targetThreadId).slice(6);
    if (!groupId) return [];
    return messages.filter((m) => m.groupId === groupId);
  }
  if (String(targetThreadId).startsWith("npc:")) {
    const parts = String(targetThreadId).split(":");
    const npcId = parts[1] || "";
    const threadPlayerId = parts[2] || currentUserId;
    const threadActorId = parts[3] || "";
    if (!npcId) return [];
    return messages.filter((m) => {
      if (m.npcId !== npcId || m.groupId) return false;
      const whisperList = Array.isArray(m.whisper) ? m.whisper : [];
      const matchesPlayer = m.playerUserId === threadPlayerId || m.authorId === threadPlayerId || whisperList.includes(threadPlayerId);
      if (!matchesPlayer) return false;
      if (threadActorId) return m.playerActorId === threadActorId;
      return !m.playerActorId;
    });
  }
  if (String(targetThreadId).startsWith("pc:")) {
    const [, myActorId, otherUserId, otherActorId] = String(targetThreadId).split(":");
    if (!myActorId || !otherUserId || !otherActorId) return [];
    return messages.filter((m) => {
      if (m.npcId || m.groupId || !m.isWhisper) return false;
      if (!m.senderActorId || !m.targetActorId) return false;
      const whisperList = Array.isArray(m.whisper) ? m.whisper : [];
      const sentByMe = m.authorId === currentUserId
        && whisperList.includes(otherUserId)
        && m.senderActorId === myActorId
        && m.targetActorId === otherActorId;
      const receivedFromThem = m.authorId === otherUserId
        && whisperList.includes(currentUserId)
        && m.senderActorId === otherActorId
        && m.targetActorId === myActorId;
      return sentByMe || receivedFromThem;
    });
  }
  return messages.filter((m) => {
    if (m.npcId || m.groupId || !m.isWhisper) return false;
    if (m.senderActorId && m.targetActorId) return false;
    const whisperList = Array.isArray(m.whisper) ? m.whisper : [];
    const sentToTarget = m.authorId === currentUserId && whisperList.includes(targetThreadId);
    const receivedFromTarget = m.authorId === targetThreadId && whisperList.includes(currentUserId);
    return sentToTarget || receivedFromTarget;
  });
}

/**
 * Check whether a stored phone message entry is visible to the given user.
 * @param {object} entry
 * @param {string} currentUserId
 * @param {boolean} [isGM]
 * @returns {boolean}
 */
export function isPhoneMessageVisibleToUser(entry, currentUserId, isGM = false) {
  if (!entry) return false;
  const whisper = Array.isArray(entry.whisper) ? entry.whisper.map(String) : [];
  if (entry.groupId) {
    return Boolean(currentUserId && (entry.authorId === currentUserId || whisper.includes(currentUserId)));
  }
  if (entry.npcId) {
    return Boolean(isGM || (currentUserId && (entry.playerUserId === currentUserId || entry.authorId === currentUserId || whisper.includes(currentUserId))));
  }
  if (whisper.length === 0) return true;
  return Boolean(currentUserId && (entry.authorId === currentUserId || whisper.includes(currentUserId)));
}

/**
 * Determine if a newly appended phone message should increment the unread badge for a user.
 * @param {object} entry
 * @param {string} currentUserId
 * @param {boolean} [isGM]
 * @returns {boolean}
 */
export function shouldNotifyUserForPhoneMessage(entry, currentUserId, isGM = false) {
  if (!isPhoneMessageVisibleToUser(entry, currentUserId, isGM)) return false;
  const authorId = String(entry?.authorId || "");
  if (currentUserId && authorId === currentUserId) return false;
  if (isGM && authorId.startsWith("npc:")) return false;
  return true;
}

/**
 * Resolve the inbox threadId for a phone message entry from a user's perspective.
 * @param {object} entry
 * @param {string} currentUserId
 * @param {boolean} [isGM]
 * @returns {string}
 */
export function getMessageThreadIdForUser(entry, currentUserId, isGM = false) {
  if (!entry) return "all";
  if (entry.groupId) {
    return `group:${entry.groupId}`;
  }
  if (entry.npcId) {
    const authorId = String(entry.authorId || "");
    const whisper = Array.isArray(entry.whisper) ? entry.whisper.map(String) : [];
    const playerUserId = String(entry.playerUserId || (!authorId.startsWith("npc:") ? authorId : (whisper[0] || "")));
    if (!playerUserId) return "";
    if (entry.playerActorId) {
      return `npc:${entry.npcId}:${playerUserId}:${entry.playerActorId}`;
    }
    return isGM ? `npc:${entry.npcId}:${playerUserId}` : `npc:${entry.npcId}`;
  }
  const whisper = Array.isArray(entry.whisper) ? entry.whisper.map(String) : [];
  if (whisper.length > 0) {
    const authorId = String(entry.authorId || "");
    if (entry.senderActorId && entry.targetActorId) {
      if (currentUserId && authorId === currentUserId) {
        const otherUserId = whisper.find((id) => id && id !== currentUserId) || "";
        return otherUserId ? `pc:${entry.senderActorId}:${otherUserId}:${entry.targetActorId}` : "";
      }
      return authorId ? `pc:${entry.targetActorId}:${authorId}:${entry.senderActorId}` : "";
    }
    if (currentUserId && authorId === currentUserId) {
      return whisper.find((id) => id && id !== currentUserId) || "";
    }
    return authorId;
  }
  return "all";
}

/**
 * Summarize active DM and NPC conversation threads sorted by most recent message.
 * Threads hidden by the user remain hidden until a newer message arrives.
 * @param {object[]} messages
 * @param {string} currentUserId
 * @param {boolean} [isGM]
 * @param {Record<string, number>} [hiddenThreads]
 * @returns {Array<{ threadId: string, kind: "user"|"npc", targetId: string, playerUserId: string, lastMessage: object }>}
 */
export function getActivePhoneThreads(messages, currentUserId, isGM = false, hiddenThreads = {}, groups = [], currentActorId = "") {
  if (!Array.isArray(messages)) return [];
  const byThread = new Map();

  for (const m of messages) {
    if (!m) continue;
    let threadId = "";
    let kind = "user";
    let targetId = "";
    let playerUserId = "";
    let playerActorId = "";

    if (m.groupId) {
      if (!isPhoneMessageVisibleToUser(m, currentUserId, isGM)) continue;
      kind = "group";
      targetId = m.groupId;
      threadId = `group:${m.groupId}`;
    } else if (m.npcId) {
      kind = "npc";
      targetId = m.npcId;
      playerUserId = m.playerUserId || (!String(m.authorId).startsWith("npc:") ? m.authorId : (m.whisper?.[0] || ""));
      playerActorId = String(m.playerActorId || "");
      if (!playerUserId) continue;
      if (!isGM && playerUserId !== currentUserId) continue;
      if (!isGM && currentActorId && playerActorId && playerActorId !== currentActorId) continue;
      threadId = playerActorId
        ? `npc:${m.npcId}:${playerUserId}:${playerActorId}`
        : (isGM ? `npc:${m.npcId}:${playerUserId}` : `npc:${m.npcId}`);
    } else if (m.isWhisper) {
      const whisperList = Array.isArray(m.whisper) ? m.whisper : [];
      if (m.senderActorId && m.targetActorId) {
        let myActorId = "";
        let otherActorId = "";
        if (m.authorId === currentUserId) {
          targetId = whisperList.find((id) => id && id !== currentUserId) || "";
          myActorId = m.senderActorId;
          otherActorId = m.targetActorId;
        } else if (whisperList.includes(currentUserId)) {
          targetId = m.authorId || "";
          myActorId = m.targetActorId;
          otherActorId = m.senderActorId;
        }
        if (!targetId || !myActorId || !otherActorId) continue;
        if (!isGM && currentActorId && myActorId !== currentActorId) continue;
        kind = "pc";
        threadId = `pc:${myActorId}:${targetId}:${otherActorId}`;
        const prev = byThread.get(threadId);
        if (!prev || (m.timestamp || 0) >= (prev.lastMessage?.timestamp || 0)) {
          byThread.set(threadId, { threadId, kind, targetId, playerUserId, playerActorId: otherActorId, lastMessage: m });
        }
        continue;
      }
      if (m.authorId === currentUserId) {
        targetId = whisperList.find((id) => id && id !== currentUserId) || "";
      } else if (whisperList.includes(currentUserId)) {
        targetId = m.authorId || "";
      }
      if (!targetId) continue;
      threadId = targetId;
    } else {
      continue;
    }

    const prev = byThread.get(threadId);
    if (!prev || (m.timestamp || 0) >= (prev.lastMessage?.timestamp || 0)) {
      byThread.set(threadId, { threadId, kind, targetId, playerUserId, playerActorId, lastMessage: m });
    }
  }

  for (const g of Array.isArray(groups) ? groups : []) {
    if (!g?.id) continue;
    const threadId = `group:${g.id}`;
    if (byThread.has(threadId)) continue;
    const memberIds = Array.isArray(g.memberIds) ? g.memberIds.map(String) : [];
    const npcIds = Array.isArray(g.npcIds) ? g.npcIds.map(String) : [];
    if (!memberIds.includes(currentUserId) && !(isGM && npcIds.length > 0)) continue;
    byThread.set(threadId, {
      threadId,
      kind: "group",
      targetId: g.id,
      playerUserId: "",
      lastMessage: { timestamp: Number(g.createdAt || 0), sender: "", plainText: "" }
    });
  }

  return Array.from(byThread.values())
    .filter((t) => {
      const hiddenAt = Number(hiddenThreads?.[t.threadId] || 0);
      return !hiddenAt || Number(t.lastMessage?.timestamp || 0) > hiddenAt;
    })
    .sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));
}

/**
 * Compute a canonical thread key and participant metadata for any stored or chat message.
 * @param {object} entry
 * @returns {{ threadKey: string, kind: "party"|"dm"|"npc", participants: string[], npcId: string, playerUserId: string }}
 */
export function getPhoneMessageThreadKey(entry) {
  const authorId = String(entry?.authorId || entry?.author?.id || "");
  const whisper = Array.isArray(entry?.whisper) ? entry.whisper.map(String).filter(Boolean) : [];
  const npcId = String(entry?.npcId || entry?.flags?.[MODULE_ID]?.npcId || "");
  const groupId = String(entry?.groupId || entry?.flags?.[MODULE_ID]?.groupId || "");

  if (groupId) {
    const participants = Array.from(new Set([authorId, ...whisper].filter(Boolean))).sort();
    return {
      threadKey: `group:${groupId}`,
      kind: "group",
      participants,
      npcId: "",
      playerUserId: ""
    };
  }

  if (npcId) {
    const rawPlayerId = entry?.playerUserId || entry?.flags?.[MODULE_ID]?.playerUserId || (!authorId.startsWith("npc:") ? authorId : (whisper[0] || ""));
    const playerUserId = String(rawPlayerId || "");
    return {
      threadKey: `npc:${npcId}:${playerUserId || "unknown"}`,
      kind: "npc",
      participants: playerUserId ? [playerUserId] : [],
      npcId,
      playerUserId
    };
  }

  if (whisper.length > 0) {
    const participants = Array.from(new Set([authorId, ...whisper].filter(Boolean))).sort();
    return {
      threadKey: `dm:${participants.join(":")}`,
      kind: "dm",
      participants,
      npcId: "",
      playerUserId: ""
    };
  }

  return {
    threadKey: "all",
    kind: "party",
    participants: [],
    npcId: "",
    playerUserId: ""
  };
}

/**
 * Group all message entries into participant-only thread summaries (without message contents).
 * @param {object[]} entries
 * @returns {Array<{ threadKey: string, kind: "party"|"dm"|"npc", participants: string[], npcId: string, playerUserId: string, count: number, lastTimestamp: number }>}
 */
export function summarizeAllPhoneThreads(entries, groups = []) {
  if (!Array.isArray(entries)) return [];
  const byKey = new Map();
  for (const entry of entries) {
    if (!entry) continue;
    const meta = getPhoneMessageThreadKey(entry);
    const ts = Number(entry.timestamp || 0);
    const existing = byKey.get(meta.threadKey);
    if (existing) {
      existing.count += 1;
      if (ts > existing.lastTimestamp) existing.lastTimestamp = ts;
    } else {
      byKey.set(meta.threadKey, { ...meta, count: 1, lastTimestamp: ts });
    }
  }
  for (const g of Array.isArray(groups) ? groups : []) {
    if (!g?.id) continue;
    const threadKey = `group:${g.id}`;
    if (byKey.has(threadKey)) continue;
    byKey.set(threadKey, {
      threadKey,
      kind: "group",
      participants: Array.isArray(g.memberIds) ? g.memberIds.map(String) : [],
      npcId: "",
      playerUserId: "",
      count: 0,
      lastTimestamp: Number(g.createdAt || 0)
    });
  }
  return Array.from(byKey.values()).sort((a, b) => b.lastTimestamp - a.lastTimestamp);
}

/**
 * Filter out all entries belonging to a canonical threadKey.
 * @param {object[]} entries
 * @param {string} threadKey
 * @returns {object[]}
 */
export function removePhoneMessagesByThreadKey(entries, threadKey) {
  if (!Array.isArray(entries)) return [];
  if (!threadKey) return entries;
  return entries.filter((entry) => getPhoneMessageThreadKey(entry).threadKey !== threadKey);
}

/**
 * Filter out 1-on-1 DM and NPC message entries belonging to a specific user ID.
 * @param {object[]} entries
 * @param {string} userId
 * @returns {object[]}
 */
export function removePhoneMessagesByUserId(entries, userId) {
  if (!Array.isArray(entries)) return [];
  const uid = String(userId || "").trim();
  if (!uid) return entries;
  return entries.filter((entry) => {
    const meta = getPhoneMessageThreadKey(entry);
    if (meta.kind === "dm" && meta.participants.includes(uid)) return false;
    if (meta.kind === "npc" && meta.playerUserId === uid) return false;
    return true;
  });
}

/**
 * Remove a user ID from all group chat memberships, dropping groups left with no members or NPCs.
 * @param {object[]} groups
 * @param {string} userId
 * @returns {object[]}
 */
export function removeUserFromPhoneGroups(groups, userId) {
  if (!Array.isArray(groups)) return [];
  const uid = String(userId || "").trim();
  if (!uid) return groups;
  return groups
    .map((group) => {
      if (!group || typeof group !== "object") return null;
      const memberIds = Array.isArray(group.memberIds)
        ? group.memberIds.map(String).filter((id) => id && id !== uid)
        : [];
      const npcIds = Array.isArray(group.npcIds) ? group.npcIds.map(String).filter(Boolean) : [];
      if (memberIds.length === 0 && npcIds.length === 0) return null;
      return { ...group, memberIds };
    })
    .filter(Boolean);
}

/**
 * Summarize per-player phone data (active non-GM users + any orphaned data for removed users).
 * @param {{ users?: object[], albums?: object[], messages?: object[], groups?: object[] }} params
 * @returns {Array<{ userId: string, name: string, isOrphan: boolean, photoCount: number, dmThreadCount: number, groupCount: number, hasUserFlags: boolean }>}
 */
export function collectPhoneProfileSummaries({ users = [], albums = [], messages = [], groups = [] } = {}) {
  const userMap = new Map();
  const gmUserIds = new Set();
  for (const u of Array.isArray(users) ? users : []) {
    const uid = String(u?.id || "").trim();
    if (!uid) continue;
    if (u?.isGM) {
      gmUserIds.add(uid);
      continue;
    }
    userMap.set(uid, u);
  }

  const albumByUser = new Map();
  for (const album of Array.isArray(albums) ? albums : []) {
    const uid = String(album?.userId || "").trim();
    if (!uid || gmUserIds.has(uid)) continue;
    const count = Number(album?.photoCount || 0);
    albumByUser.set(uid, (albumByUser.get(uid) || 0) + count);
  }

  const dmThreadsByUser = new Map();
  for (const entry of Array.isArray(messages) ? messages : []) {
    if (!entry) continue;
    const meta = getPhoneMessageThreadKey(entry);
    if (meta.kind === "dm") {
      for (const uid of meta.participants) {
        if (!uid || gmUserIds.has(uid)) continue;
        if (!dmThreadsByUser.has(uid)) dmThreadsByUser.set(uid, new Set());
        dmThreadsByUser.get(uid).add(meta.threadKey);
      }
    } else if (meta.kind === "npc" && meta.playerUserId && !gmUserIds.has(meta.playerUserId)) {
      if (!dmThreadsByUser.has(meta.playerUserId)) dmThreadsByUser.set(meta.playerUserId, new Set());
      dmThreadsByUser.get(meta.playerUserId).add(meta.threadKey);
    }
  }

  const groupCountByUser = new Map();
  for (const group of Array.isArray(groups) ? groups : []) {
    const members = Array.isArray(group?.memberIds) ? group.memberIds.map(String) : [];
    for (const uid of members) {
      if (!uid || gmUserIds.has(uid)) continue;
      groupCountByUser.set(uid, (groupCountByUser.get(uid) || 0) + 1);
    }
  }

  const allUserIds = new Set([
    ...userMap.keys(),
    ...albumByUser.keys(),
    ...dmThreadsByUser.keys(),
    ...groupCountByUser.keys()
  ]);

  const summaries = [];
  for (const uid of allUserIds) {
    const user = userMap.get(uid);
    const isOrphan = !user;
    const name = String(user?.name || `Removed User (${uid.slice(0, 6)})`);
    summaries.push({
      userId: uid,
      name,
      isOrphan,
      photoCount: albumByUser.get(uid) || 0,
      dmThreadCount: dmThreadsByUser.get(uid)?.size || 0,
      groupCount: groupCountByUser.get(uid) || 0,
      hasUserFlags: Boolean(user?.hasUserFlags)
    });
  }

  return summaries.sort((a, b) => {
    if (a.isOrphan !== b.isOrphan) return a.isOrphan ? 1 : -1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Format a real-world timestamp into YYYY-MM-DD HH:MM.
 * @param {number} timestamp
 * @returns {string}
 */
export function formatPhotoPageDate(timestamp) {
  const d = new Date(Number(timestamp) || Date.now());
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Build JournalEntryPage creation data for a saved phone photo.
 * @param {object} photo
 * @returns {object}
 */
export function buildPhotoJournalPageData(photo) {
  const ts = Number(photo?.timestamp) || Date.now();
  const dateLabel = formatPhotoPageDate(ts);
  const sceneName = String(photo?.sceneName || "Scene");
  const safeScene = sceneName.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return {
    name: `${dateLabel} — ${sceneName}`,
    type: "text",
    text: {
      format: 1,
      content: `<p><strong>Date Taken:</strong> ${dateLabel}<br><strong>Location:</strong> ${safeScene}</p><p><img src="${String(photo?.dataUrl || "")}" alt="Phone Photo" /></p>`
    },
    flags: {
      [MODULE_ID]: {
        phonePhotoId: String(photo?.id || ""),
        phonePhotoTimestamp: ts,
        phonePhotoScene: sceneName
      }
    }
  };
}

/**
 * Extract a phone photo view model from a JournalEntryPage.
 * @param {object} page
 * @returns {object|null}
 */
export function extractPhotoFromJournalPage(page) {
  const html = String(page?.text?.content || "");
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!imgMatch) return null;
  const modFlags = page?.flags?.[MODULE_ID] || {};
  const timestamp = Number(modFlags.phonePhotoTimestamp) || Date.now();
  return {
    id: String(page?.id || ""),
    pageId: String(page?.id || ""),
    photoKey: String(modFlags.phonePhotoId || page?.id || ""),
    dataUrl: imgMatch[1],
    timestamp,
    dateLabel: formatPhotoPageDate(timestamp),
    sceneName: String(modFlags.phonePhotoScene || page?.name || "Cloud Photo"),
    source: "cloud"
  };
}

/**
 * Build inline CSS background style string for a saved phone wallpaper.
 * @param {object|null} wp
 * @returns {string}
 */
export function buildWallpaperStyle(wp) {
  if (!wp) return "";
  if (wp.imageUrl) {
    const safeUrl = String(wp.imageUrl).replace(/"/g, "");
    return `background-image:url(&quot;${safeUrl}&quot;);background-size:cover;background-position:center;`;
  }
  if (wp.type === "image" && wp.value) {
    const safeUrl = String(wp.value).replace(/"/g, "");
    return `background-image:url(&quot;${safeUrl}&quot;);background-size:cover;background-position:center;`;
  }
  const bg = wp.bgValue || wp.value;
  if (bg) {
    return `background:${String(bg).replace(/;/g, "")};`;
  }
  return "";
}

// -----------------------------------------------------------------------------
// Lifecycle & Settings Integration
// -----------------------------------------------------------------------------

export function initSmartphoneWidget() {
  if (!isFeatureEnabled()) return;
  mountSmartphoneWidget();
}

export function setSmartphoneWidgetEnabled(enabled) {
  if (enabled) {
    mountSmartphoneWidget();
  } else {
    unmountSmartphoneWidget();
  }
}

function isFeatureEnabled() {
  try {
    return Boolean(game?.settings?.get(MODULE_ID, SETTINGS.FEATURES.SMARTPHONE_WIDGET));
  } catch {
    return false;
  }
}

export function getActivePhoneTheme() {
  try {
    const val = game?.settings?.get(MODULE_ID, SETTINGS.SMARTPHONE_THEME);
    return PHONE_THEMES[val] ? val : "ios";
  } catch {
    return "ios";
  }
}

export function applySmartphoneTheme(themeId) {
  const resolved = PHONE_THEMES[themeId] ? themeId : "ios";
  const root = document.getElementById(WIDGET_ID);
  if (root) {
    root.setAttribute("data-cd-phone-theme", resolved);
    renderPhoneContents();
  }
}

/**
 * Determine whether Foundry's right sidebar should be hidden for the current client.
 * Hidden by default for non-GM players when both the smartphone feature and
 * `SMARTPHONE_HIDE_SIDEBAR` are enabled, unless the player opts in via Phone Settings.
 * @param {object} [opts]
 * @param {boolean} [opts.featureEnabled]
 * @param {boolean} [opts.hideForPlayers]
 * @param {boolean} [opts.playerShowSidebar]
 * @param {boolean} [opts.isGM]
 * @returns {boolean}
 */
export function shouldHideSmartphoneSidebar({
  featureEnabled = false,
  hideForPlayers = false,
  playerShowSidebar = false,
  isGM = false
} = {}) {
  if (!featureEnabled || isGM || !hideForPlayers) return false;
  return !playerShowSidebar;
}

function getHideSidebarForPlayersSetting() {
  try {
    return Boolean(game?.settings?.get(MODULE_ID, SETTINGS.SMARTPHONE_HIDE_SIDEBAR));
  } catch {
    return false;
  }
}

function getPlayerShowSidebarSetting() {
  try {
    return Boolean(game?.settings?.get(MODULE_ID, SETTINGS.SMARTPHONE_PLAYER_SHOW_SIDEBAR));
  } catch {
    return false;
  }
}

export function updateSmartphoneSidebarVisibility() {
  if (typeof document === "undefined" || !document.body) return;
  const shouldHide = shouldHideSmartphoneSidebar({
    featureEnabled: isFeatureEnabled(),
    hideForPlayers: getHideSidebarForPlayersSetting(),
    playerShowSidebar: getPlayerShowSidebarSetting(),
    isGM: Boolean(game?.user?.isGM)
  });
  document.body.classList.toggle(HIDE_SIDEBAR_BODY_CLASS, shouldHide);
}

const VALID_APP_IDS = new Set(PHONE_APPS.map((a) => a.id));

/** Normalize disabled app IDs from world settings; Settings itself can never be disabled. */
export function sanitizeDisabledAppIds(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  for (const item of raw) {
    const id = String(item || "").trim();
    if (id && id !== "settings" && VALID_APP_IDS.has(id)) {
      seen.add(id);
    }
  }
  return Array.from(seen);
}

/** Normalize a custom home screen app ID order against the known app list. */
export function normalizePhoneAppOrder(rawOrder, apps = PHONE_APPS) {
  const defaultIds = Array.from(apps || []).map((a) => a.id);
  const validIds = new Set(defaultIds);
  const ordered = [];
  const seen = new Set();
  if (Array.isArray(rawOrder)) {
    for (const item of rawOrder) {
      const id = String(item || "").trim();
      if (id && validIds.has(id) && !seen.has(id)) {
        seen.add(id);
        ordered.push(id);
      }
    }
  }
  for (const id of defaultIds) {
    if (!seen.has(id)) {
      seen.add(id);
      ordered.push(id);
    }
  }
  return ordered;
}

/** Reorder an app ID list by moving draggedId to targetId's slot. */
export function reorderPhoneAppIds(order, draggedId, targetId) {
  const list = Array.isArray(order) ? [...order] : [];
  if (!draggedId || !targetId || draggedId === targetId) return list;
  const fromIdx = list.indexOf(draggedId);
  const toIdx = list.indexOf(targetId);
  if (fromIdx === -1 || toIdx === -1) return list;
  list.splice(fromIdx, 1);
  list.splice(toIdx, 0, draggedId);
  return list;
}

/** Merge a reordered visible app ID list back into a full order, preserving hidden app slots. */
export function mergeVisibleAppOrder(fullOrder, visibleOrder) {
  const base = normalizePhoneAppOrder(fullOrder);
  const visible = Array.isArray(visibleOrder) ? visibleOrder.filter((id) => base.includes(id)) : [];
  const visibleSet = new Set(visible);
  let cursor = 0;
  return base.map((id) => (visibleSet.has(id) && cursor < visible.length ? visible[cursor++] : id));
}

/** Return the apps visible on the phone home screen for the given user role, in saved order. */
export function getVisiblePhoneApps(disabledAppIds = [], isGM = false, appOrder = null) {
  const appsById = new Map(PHONE_APPS.map((app) => [app.id, app]));
  const orderedApps = Array.isArray(appOrder) && appOrder.length > 0
    ? normalizePhoneAppOrder(appOrder, PHONE_APPS).map((id) => appsById.get(id)).filter(Boolean)
    : PHONE_APPS;
  if (isGM) return orderedApps;
  const disabled = new Set(sanitizeDisabledAppIds(disabledAppIds));
  return orderedApps.filter((app) => !disabled.has(app.id));
}

function getSavedPhoneAppOrder() {
  const flag = game?.user?.getFlag?.(MODULE_ID, USER_APP_ORDER_FLAG) ?? game?.user?.flags?.[MODULE_ID]?.[USER_APP_ORDER_FLAG];
  if (Array.isArray(flag)) return normalizePhoneAppOrder(flag);
  try {
    const raw = localStorage.getItem(getScopedStorageKey(APP_ORDER_STORAGE_KEY));
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) return normalizePhoneAppOrder(parsed);
  } catch { }
  return normalizePhoneAppOrder(null);
}

async function savePhoneAppOrder(order) {
  const normalized = normalizePhoneAppOrder(order);
  try {
    localStorage.setItem(getScopedStorageKey(APP_ORDER_STORAGE_KEY), JSON.stringify(normalized));
  } catch { }
  try {
    await game?.user?.setFlag?.(MODULE_ID, USER_APP_ORDER_FLAG, normalized);
  } catch { }
  return normalized;
}

export function sanitizePhoneNote(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = String(raw.id || "").trim();
  if (!id) return null;
  const now = Date.now();
  const createdAt = Number.isFinite(Number(raw.createdAt)) && Number(raw.createdAt) > 0 ? Number(raw.createdAt) : now;
  const updatedAt = Number.isFinite(Number(raw.updatedAt)) && Number(raw.updatedAt) > 0 ? Number(raw.updatedAt) : createdAt;
  return {
    id,
    title: String(raw.title ?? "").slice(0, 80),
    body: String(raw.body ?? "").slice(0, 10000),
    pinned: Boolean(raw.pinned),
    createdAt,
    updatedAt
  };
}

export function sortPhoneNotes(notes = []) {
  return [...notes].sort((a, b) => {
    if (Boolean(a?.pinned) !== Boolean(b?.pinned)) return a?.pinned ? -1 : 1;
    return (Number(b?.updatedAt) || 0) - (Number(a?.updatedAt) || 0);
  });
}

export function normalizePhoneNotes(notes = []) {
  if (!Array.isArray(notes)) return [];
  const byId = new Map();
  for (const raw of notes) {
    const clean = sanitizePhoneNote(raw);
    if (!clean) continue;
    byId.set(clean.id, clean);
  }
  return sortPhoneNotes(Array.from(byId.values())).slice(0, MAX_PHONE_NOTES);
}

export function filterPhoneNotes(notes = [], query = "") {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return notes;
  return notes.filter((n) =>
    String(n?.title || "").toLowerCase().includes(q) ||
    String(n?.body || "").toLowerCase().includes(q)
  );
}

export function getNotePreviewText(body = "", maxLen = 70) {
  const collapsed = String(body || "").replace(/\s+/g, " ").trim();
  if (!collapsed) return "No additional text";
  if (collapsed.length <= maxLen) return collapsed;
  return `${collapsed.slice(0, Math.max(1, maxLen - 1)).trimEnd()}…`;
}

export function formatNoteTimestamp(ts, now = Date.now()) {
  const time = Number(ts);
  if (!Number.isFinite(time) || time <= 0) return "";
  const diffMs = Math.max(0, now - time);
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const d = new Date(time);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function upsertPhoneNote(notes = [], patch = {}) {
  const list = normalizePhoneNotes(notes);
  const now = Number.isFinite(Number(patch.updatedAt)) ? Number(patch.updatedAt) : Date.now();
  const id = String(patch.id || "").trim() || `note-${now}-${Math.random().toString(36).slice(2, 7)}`;
  const existing = list.find((n) => n.id === id);
  const next = sanitizePhoneNote({
    id,
    title: patch.title !== undefined ? patch.title : (existing?.title ?? ""),
    body: patch.body !== undefined ? patch.body : (existing?.body ?? ""),
    pinned: patch.pinned !== undefined ? patch.pinned : (existing?.pinned ?? false),
    createdAt: existing?.createdAt ?? patch.createdAt ?? now,
    updatedAt: now
  });
  const rest = list.filter((n) => n.id !== id);
  return normalizePhoneNotes(next ? [next, ...rest] : rest);
}

export function deletePhoneNote(notes = [], noteId = "") {
  const id = String(noteId || "").trim();
  if (!id) return normalizePhoneNotes(notes);
  return normalizePhoneNotes(notes).filter((n) => n.id !== id);
}

export function togglePhoneNotePin(notes = [], noteId = "") {
  const id = String(noteId || "").trim();
  if (!id) return normalizePhoneNotes(notes);
  return normalizePhoneNotes(
    normalizePhoneNotes(notes).map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
  );
}

function getSavedPhoneNotes() {
  const flag = game?.user?.getFlag?.(MODULE_ID, USER_NOTES_FLAG) ?? game?.user?.flags?.[MODULE_ID]?.[USER_NOTES_FLAG];
  if (Array.isArray(flag)) return normalizePhoneNotes(flag);
  try {
    const raw = localStorage.getItem(getScopedStorageKey(NOTES_STORAGE_KEY));
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) return normalizePhoneNotes(parsed);
  } catch { }
  return [];
}

async function savePhoneNotes(notes) {
  const normalized = normalizePhoneNotes(notes);
  try {
    localStorage.setItem(getScopedStorageKey(NOTES_STORAGE_KEY), JSON.stringify(normalized));
  } catch { }
  try {
    await game?.user?.setFlag?.(MODULE_ID, USER_NOTES_FLAG, normalized);
  } catch { }
  return normalized;
}

function getDisabledPlayerAppIds() {
  try {
    return sanitizeDisabledAppIds(game?.settings?.get(MODULE_ID, SETTINGS.SMARTPHONE_DISABLED_APPS));
  } catch {
    return [];
  }
}

export function refreshSmartphoneDisabledApps() {
  if (!game?.user?.isGM && _currentApp !== "home" && getDisabledPlayerAppIds().includes(_currentApp)) {
    _currentApp = "home";
    _settingsSubmenu = null;
  }
  if (_isMounted && _isOpen) {
    renderPhoneContents();
  }
}

// -----------------------------------------------------------------------------
// Mount / Unmount
// -----------------------------------------------------------------------------

function handleGlobalPulldownOutsidePointer(ev) {
  if (!_isOpen || !_pulldownOpen) return;
  const target = ev.target;
  if (target?.closest?.(".cd-phone-pulldown-shade, [data-phone-pulldown-toggle]")) return;
  _pulldownOpen = false;
  _actorPickerOpen = false;
  renderPhoneContents();
}

function handleGlobalPulldownKeydown(ev) {
  if (ev.key === "Escape" && _isOpen && _pulldownOpen) {
    _pulldownOpen = false;
    _actorPickerOpen = false;
    renderPhoneContents();
  }
}

function stopPhoneInputKeyPropagationBubble(ev) {
  if (ev.key === "Escape") return;
  const tag = ev.target?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || ev.target?.isContentEditable) {
    ev.stopPropagation();
  }
}

function stopPhoneInputKeyPropagationCapture(ev) {
  if (ev.key === "Escape") return;
  const target = ev.target;
  if (!target?.closest?.(`#${WIDGET_ID}`)) return;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) {
    ev.stopImmediatePropagation();
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("keydown", stopPhoneInputKeyPropagationCapture, true);
  window.addEventListener("keyup", stopPhoneInputKeyPropagationCapture, true);
  window.addEventListener("keypress", stopPhoneInputKeyPropagationCapture, true);
}
if (typeof document !== "undefined") {
  document.addEventListener("keydown", stopPhoneInputKeyPropagationCapture, true);
  document.addEventListener("keyup", stopPhoneInputKeyPropagationCapture, true);
  document.addEventListener("keypress", stopPhoneInputKeyPropagationCapture, true);
}

function mountSmartphoneWidget() {
  if (typeof document === "undefined" || _isMounted) {
    updateSmartphoneSidebarVisibility();
    return;
  }

  injectStyles();
  const root = document.createElement("div");
  root.id = WIDGET_ID;
  root.setAttribute("data-cd-phone-theme", getActivePhoneTheme());
  root.addEventListener("keydown", stopPhoneInputKeyPropagationBubble);
  root.addEventListener("keyup", stopPhoneInputKeyPropagationBubble);
  root.addEventListener("keypress", stopPhoneInputKeyPropagationBubble);
  document.body.appendChild(root);
  applySavedPhonePosition(root);

  _isMounted = true;
  document.addEventListener("pointerdown", handleGlobalPulldownOutsidePointer, true);
  document.addEventListener("keydown", handleGlobalPulldownKeydown);
  updateSmartphoneSidebarVisibility();
  registerHooksOnce();
  void ensureContactsActorFolder();
  renderPhoneContents();

  if (!_clockTimer) {
    _clockTimer = setInterval(() => {
      const clockEl = document.querySelector(`#${WIDGET_ID} .cd-phone-clock`);
      if (clockEl) clockEl.textContent = formatClock();
    }, 15000);
  }
}

function unmountSmartphoneWidget() {
  if (typeof document !== "undefined") {
    document.removeEventListener("pointerdown", handleGlobalPulldownOutsidePointer, true);
    document.removeEventListener("keydown", handleGlobalPulldownKeydown);
    document.body?.classList.remove(HIDE_SIDEBAR_BODY_CLASS);
    document.getElementById(WIDGET_ID)?.remove();
    document.getElementById(STYLE_ID)?.remove();
  }
  if (_clockTimer) {
    clearInterval(_clockTimer);
    _clockTimer = null;
  }
  _isMounted = false;
  _isOpen = false;
  _pulldownOpen = false;
  _actorPickerOpen = false;
  _currentApp = "home";
  _homeEditMode = false;
  _navHistory = [];
}

function syncUnreadMessagesCount() {
  _unreadMessages = Object.values(_unreadByThread).reduce((sum, n) => sum + (Number(n) || 0), 0);
}

function markThreadRead(threadId) {
  if (!threadId) return;
  if (_unreadByThread[threadId]) {
    delete _unreadByThread[threadId];
    syncUnreadMessagesCount();
  }
}

function recordUnreadForMessage(entry) {
  const userId = String(game?.user?.id || "");
  const isGM = Boolean(game?.user?.isGM);
  const threadId = getMessageThreadIdForUser(entry, userId, isGM);
  if (!threadId) return;
  if (_isOpen && _currentApp === "messages" && _messageThreadId === threadId) return;
  _unreadByThread[threadId] = (_unreadByThread[threadId] || 0) + 1;
  syncUnreadMessagesCount();
}

function registerHooksOnce() {
  if (_hooksRegistered || typeof Hooks === "undefined") return;
  _hooksRegistered = true;

  Hooks.on("createChatMessage", (msg) => {
    if (!_isMounted) return;
    if (msg?.visible === false) return;
    if (msg?.getFlag?.(MODULE_ID, "fromPhone") || msg?.flags?.[MODULE_ID]?.fromPhone) return;
    const kind = classifyChatMessageForPhone(msg);
    if (kind === "roll") {
      if (!_isOpen || _currentApp !== "system-log") _unreadRolls += 1;
    } else {
      const authorId = String(msg?.author?.id ?? msg?.user?.id ?? msg?.author ?? "");
      if (authorId !== String(game?.user?.id || "")) {
        recordUnreadForMessage({
          authorId,
          whisper: Array.isArray(msg?.whisper) ? msg.whisper : [],
          npcId: msg?.flags?.[MODULE_ID]?.npcId || "",
          playerUserId: msg?.flags?.[MODULE_ID]?.playerUserId || "",
          playerActorId: msg?.flags?.[MODULE_ID]?.playerActorId || ""
        });
      }
    }
    renderPhoneContents();
  });

  Hooks.on("updateChatMessage", (msg) => {
    if (!_isMounted || !_isOpen) return;
    if (_currentApp === "system-log" && classifyChatMessageForPhone(msg) === "roll") {
      renderPhoneContents();
    }
  });

  Hooks.on("deleteChatMessage", () => {
    if (_isMounted && _isOpen && (_currentApp === "messages" || _currentApp === "system-log" || (_currentApp === "settings" && _settingsSubmenu === "manage-messages"))) {
      renderPhoneContents();
    }
  });

  Hooks.on("deleteJournalEntry", () => {
    if (_isMounted && _isOpen && (_currentApp === "messages" || (_currentApp === "settings" && _settingsSubmenu === "manage-messages"))) {
      renderPhoneContents();
    }
  });

  Hooks.on("renderPlaylistDirectory", () => {
    if (_isMounted && _isOpen && _currentApp === "music") renderPhoneContents();
  });

  Hooks.on("createJournalEntry", () => {
    if (_isMounted && _isOpen && _currentApp === "photos") renderPhoneContents();
  });

  Hooks.on("createJournalEntryPage", () => {
    if (_isMounted && _isOpen && _currentApp === "photos") renderPhoneContents();
  });

  Hooks.on("deleteJournalEntryPage", () => {
    if (_isMounted && _isOpen && _currentApp === "photos") renderPhoneContents();
  });

  Hooks.on("updateUser", (user, changed) => {
    if (!_isMounted || user?.id !== game?.user?.id) return;
    if (_currentApp === "notes" && _selectedNoteId) return;
    if (changed?.flags?.[MODULE_ID] && Object.keys(changed.flags[MODULE_ID]).every((k) => k === USER_NOTES_FLAG)) {
      return;
    }
    renderPhoneContents();
  });

  const refreshContactsIfOpen = () => {
    if (_isMounted && _isOpen && (_currentApp === "contacts" || _currentApp === "messages")) {
      renderPhoneContents();
    }
  };
  Hooks.on("createActor", refreshContactsIfOpen);
  Hooks.on("updateActor", refreshContactsIfOpen);
  Hooks.on("deleteActor", refreshContactsIfOpen);
  Hooks.on("createFolder", (folder) => {
    if (folder?.type === "Actor") refreshContactsIfOpen();
  });
  Hooks.on("updateFolder", (folder) => {
    if (folder?.type === "Actor") refreshContactsIfOpen();
  });
  Hooks.on("deleteFolder", (folder) => {
    if (folder?.type === "Actor") refreshContactsIfOpen();
  });

  Hooks.on("updateJournalEntry", (doc, change) => {
    if (!_isMounted) return;
    const isMsgJournal = doc?.getFlag?.(MODULE_ID, MESSAGES_JOURNAL_FLAG) || doc?.flags?.[MODULE_ID]?.[MESSAGES_JOURNAL_FLAG];
    if (!isMsgJournal) return;
    if (change?.flags?.[MODULE_ID]?.[GROUPS_DATA_FLAG]) {
      const updatedGroups = Array.isArray(change.flags[MODULE_ID][GROUPS_DATA_FLAG])
        ? change.flags[MODULE_ID][GROUPS_DATA_FLAG]
        : [];
      const updatedIds = new Set(updatedGroups.map((g) => g?.id).filter(Boolean));
      _optimisticPhoneGroups = _optimisticPhoneGroups.filter((g) => !updatedIds.has(g?.id));
    }
    if (change?.flags?.[MODULE_ID]?.[MESSAGES_DATA_FLAG]) {
      const updatedList = change.flags[MODULE_ID][MESSAGES_DATA_FLAG];
      const arr = Array.isArray(updatedList) ? updatedList : [];
      const latest = arr.length > 0 ? arr[arr.length - 1] : null;
      const isNewLatest = Boolean(latest && !_knownPhoneMessageIds.has(latest.id));
      _knownPhoneMessageIds = new Set(arr.map((m) => m?.id).filter(Boolean));
      if (isNewLatest && shouldNotifyUserForPhoneMessage(latest, game?.user?.id || "", Boolean(game?.user?.isGM))) {
        recordUnreadForMessage(latest);
      }
      renderPhoneContents();
    } else if (change?.flags?.[MODULE_ID]?.[NPC_CONTACTS_DATA_FLAG] || change?.flags?.[MODULE_ID]?.[GROUPS_DATA_FLAG]) {
      renderPhoneContents();
    }
  });

  if (typeof game !== "undefined" && game.socket) {
    game.socket.on(`module.${MODULE_ID}`, async (payload) => {
      if (!payload) return;
      if (payload.action === "ephemeralPhoneMessage" && payload.message) {
        const entry = payload.message;
        const uid = game?.user?.id || "";
        const gm = Boolean(game?.user?.isGM);
        if (!isPhoneMessageVisibleToUser(entry, uid, gm)) return;
        if (!_ephemeralPhoneMessages.some((m) => m.id === entry.id)) {
          _ephemeralPhoneMessages = [..._ephemeralPhoneMessages, entry].slice(-MAX_EPHEMERAL_PHONE_MESSAGES);
          if (shouldNotifyUserForPhoneMessage(entry, uid, gm)) {
            recordUnreadForMessage(entry);
          }
          renderPhoneContents();
        }
        return;
      }
      if (payload.action === "reactPhoneMessage" && payload.messageId && payload.emoji && payload.userId) {
        if (payload.ephemeral) {
          const target = _ephemeralPhoneMessages.find((m) => m.id === payload.messageId);
          if (target) {
            target.reactions = toggleMessageReaction(target.reactions, payload.emoji, payload.userId);
            renderPhoneContents();
          }
          return;
        }
        if (game.user?.isGM) {
          const activeGM = game.users?.activeGM;
          if (!activeGM || activeGM.id === game.user.id) {
            await togglePhoneMessageReactionAsGM(payload);
          }
        }
        return;
      }
      if (payload.action === "deletePhoneThreadKey" && payload.threadKey) {
        const next = removePhoneMessagesByThreadKey(_ephemeralPhoneMessages, payload.threadKey);
        if (next.length !== _ephemeralPhoneMessages.length) {
          _ephemeralPhoneMessages = next;
          renderPhoneContents();
        }
        return;
      }
      if (payload.action === "deleteAllPhoneMessages") {
        _optimisticPhoneGroups = [];
        if (_ephemeralPhoneMessages.length > 0) {
          _ephemeralPhoneMessages = [];
        }
        renderPhoneContents();
        return;
      }
      if (payload.action === "deletePhoneGroup" && payload.groupId) {
        _optimisticPhoneGroups = _optimisticPhoneGroups.filter((g) => g?.id !== payload.groupId);
        renderPhoneContents();
        return;
      }
      if (payload.action === "resetPhoneProfile" && payload.userId) {
        _ephemeralPhoneMessages = removePhoneMessagesByUserId(_ephemeralPhoneMessages, payload.userId);
        _optimisticPhoneGroups = removeUserFromPhoneGroups(_optimisticPhoneGroups, payload.userId);
        if (String(game?.user?.id || "") === String(payload.userId)) {
          try {
            localStorage.removeItem(getScopedStorageKey(WALLPAPER_STORAGE_KEY));
            localStorage.removeItem(WALLPAPER_STORAGE_KEY);
            localStorage.removeItem(getScopedStorageKey(POSITION_STORAGE_KEY));
            localStorage.removeItem(getScopedStorageKey(HIDDEN_THREADS_STORAGE_KEY));
            localStorage.removeItem(getScopedStorageKey(RECENT_EMOJIS_STORAGE_KEY));
            localStorage.removeItem(getContactColorsStorageKey());
            localStorage.removeItem(getContactNicknamesStorageKey());
          } catch (_) { /* ignore storage errors */ }
          _unreadByThread = {};
          _unreadMessages = 0;
        }
        renderPhoneContents();
        return;
      }
      if (!game.user?.isGM) return;
      const activeGM = game.users?.activeGM;
      if (activeGM && activeGM.id !== game.user.id) return;
      if (payload.action === "ensurePhoneAlbum") {
        await createPlayerAlbumAsGM(payload.userId, payload.userName, payload.actorId, payload.actorName);
      } else if (payload.action === "appendPhoneMessage" && payload.message) {
        await appendPhoneMessageAsGM(payload.message);
      } else if (payload.action === "createPhoneGroup" && payload.group) {
        await createPhoneGroupAsGM(payload.group);
      }
    });
  }
}

// -----------------------------------------------------------------------------
// Rendering
// -----------------------------------------------------------------------------

function formatClock() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderPhoneContents() {
  const root = document.getElementById(WIDGET_ID);
  if (!root) return;

  const themeId = getActivePhoneTheme();
  const theme = PHONE_THEMES[themeId] || PHONE_THEMES.ios;
  const totalUnread = _unreadMessages + _unreadRolls;

  if (!_isOpen) {
    root.innerHTML = `
      <button type="button" class="cd-phone-launcher" title="Double-click to open (Drag to move)">
        <i class="fa-solid fa-mobile-screen-button"></i>
        <span>Your Phone</span>
        ${totalUnread > 0 ? `<span class="cd-phone-badge">${totalUnread > 99 ? "99+" : totalUnread}</span>` : ""}
      </button>
    `;
    const launcher = root.querySelector(".cd-phone-launcher");
    makePhoneDraggable(launcher, root);
    launcher?.addEventListener("dblclick", () => {
      _isOpen = true;
      renderPhoneContents();
      clampPhoneToViewport(root);
    });
    clampPhoneToViewport(root);
    return;
  }

  const isCamera = _currentApp === "camera";
  const wp = getSavedWallpaper();
  const wallpaperStyle = isCamera ? "" : buildWallpaperStyle(wp);
  const bezelColor = wp?.bezelColor ? String(wp.bezelColor).replace(/[^#a-zA-Z0-9(),.% -]/g, "") : "";
  root.innerHTML = `
    <div class="cd-phone-device ${isCamera ? "is-camera-mode" : ""}${isCamera && _cameraExpanded ? " is-camera-expanded" : ""}"${bezelColor ? ` style="border-color:${bezelColor};"` : ""}>
      <div class="cd-phone-statusbar">
        <span class="cd-phone-clock">${formatClock()}</span>
        <span class="cd-phone-notch" aria-hidden="true"></span>
        <button type="button" class="cd-phone-signal cd-phone-pulldown-trigger ${_pulldownOpen ? "is-open" : ""}" data-phone-pulldown-toggle title="Control Center &amp; Notifications" aria-expanded="${_pulldownOpen ? "true" : "false"}">
          <span>${escapeHtml(theme.signal)}</span>
          <i class="fa-solid fa-signal"></i>
          <i class="fa-solid fa-battery-three-quarters"></i>
        </button>
      </div>

      <div class="cd-phone-screen"${wallpaperStyle ? ` style="${wallpaperStyle}"` : ""}>
        ${renderCurrentAppScreen()}
      </div>

      ${renderPhonePulldownShade()}
      ${renderPhoneDiceTrayFlyout()}

      <div class="cd-phone-navbar">
        <button type="button" class="cd-phone-nav-btn" data-nav="back" title="Back">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <button type="button" class="cd-phone-nav-btn cd-phone-nav-home" data-nav="home" title="Home">
          <span class="cd-phone-home-pill"></span>
        </button>
        <button type="button" class="cd-phone-nav-btn cd-phone-nav-dice ${_diceTrayOpen ? "is-active" : ""}" data-nav="dice-tray" title="Dice Tray" aria-expanded="${_diceTrayOpen ? "true" : "false"}">
          <i class="fa-solid fa-dice-d20"></i>
        </button>
      </div>
    </div>
  `;

  bindPhoneEvents(root);
}

/**
 * Build a normalized list of unread notification items for the phone pulldown shade.
 * @param {object} opts
 * @returns {Array<{id: string, kind: "message"|"system-log", threadId?: string, title: string, preview: string, count: number}>}
 */
export function buildPulldownNotifications({
  unreadByThread = {},
  unreadRolls = 0,
  messages = [],
  userId = "",
  getThreadTitle = null
} = {}) {
  const items = [];
  const entries = Object.entries(unreadByThread || {}).filter(([, count]) => Number(count) > 0);
  for (const [threadId, rawCount] of entries) {
    const count = Number(rawCount) || 0;
    const threadMsgs = typeof filterPhoneMessagesByThread === "function"
      ? filterPhoneMessagesByThread(messages, userId, threadId)
      : [];
    const last = threadMsgs[threadMsgs.length - 1] || null;
    const title = typeof getThreadTitle === "function"
      ? getThreadTitle(threadId)
      : (threadId === "all" ? "Party Chat" : "Messages");
    const preview = last?.plainText
      ? `${last.sender ? `${last.sender}: ` : ""}${last.plainText}`
      : (last?.imageSrc ? `${last.sender ? `${last.sender}: ` : ""}Photo` : `${count} unread ${count === 1 ? "message" : "messages"}`);
    items.push({
      id: `msg:${threadId}`,
      kind: "message",
      threadId,
      title: String(title || "Messages"),
      preview: String(preview || ""),
      count
    });
  }

  const rollCount = Number(unreadRolls) || 0;
  if (rollCount > 0) {
    items.push({
      id: "system-log",
      kind: "system-log",
      title: "System Log",
      preview: `${rollCount} new roll or system ${rollCount === 1 ? "entry" : "entries"}`,
      count: rollCount
    });
  }

  return items;
}

function renderPhonePulldownShade() {
  if (!_pulldownOpen) return "";

  const ownedActors = getOwnedPlayerPhoneActors();
  const canSwitchActor = !game?.user?.isGM && ownedActors.length > 1;
  if (!canSwitchActor) _actorPickerOpen = false;
  const activeActor = getActivePhoneActor();
  const charName = activeActor?.name || game?.user?.name || "Transfer Student";
  const avatarHtml = activeActor?.img
    ? `<img class="cd-phone-pulldown-avatar" src="${escapeHtml(activeActor.img)}" alt="" />`
    : `<span class="cd-phone-pulldown-avatar is-fallback">${escapeHtml(String(charName || "?").slice(0, 1).toUpperCase())}</span>`;

  const actorPickerListHtml = canSwitchActor && _actorPickerOpen
    ? `
      <div class="cd-phone-actor-picker-list cd-phone-pulldown-actor-list">
        ${ownedActors.map((actor) => {
          const isSelected = activeActor?.id === actor.id;
          const avatar = actor.img
            ? `<img class="cd-phone-actor-picker-avatar" src="${escapeHtml(actor.img)}" alt="" />`
            : `<span class="cd-phone-actor-picker-avatar is-fallback">${escapeHtml(String(actor.name || "?").slice(0, 1).toUpperCase())}</span>`;
          return `
            <button type="button" class="cd-phone-actor-picker-item ${isSelected ? "is-active" : ""}" data-phone-select-actor="${escapeHtml(actor.id)}">
              ${avatar}
              <span class="cd-phone-actor-picker-name">${escapeHtml(actor.name || "Unnamed Character")}</span>
              ${isSelected ? `<i class="fa-solid fa-check cd-phone-actor-picker-check"></i>` : ""}
            </button>
          `;
        }).join("")}
      </div>
    `
    : "";

  const userId = String(game?.user?.id || "");
  const allTextMsgs = getStoredPhoneMessages(userId);
  const notifications = buildPulldownNotifications({
    unreadByThread: _unreadByThread,
    unreadRolls: _unreadRolls,
    messages: allTextMsgs,
    userId,
    getThreadTitle: (tid) => getThreadDisplayInfo(tid)?.title || "Messages"
  });

  const notificationsHtml = notifications.length === 0
    ? `<div class="cd-phone-pulldown-empty"><i class="fa-regular fa-bell-slash"></i> No new notifications</div>`
    : notifications.map((n) => {
        const isSys = n.kind === "system-log";
        const iconClass = isSys ? "fa-solid fa-terminal" : "fa-solid fa-message";
        const iconBg = isSys ? "#5856d6" : "#34c759";
        const actionAttr = isSys
          ? `data-phone-notif-syslog="1"`
          : `data-phone-notif-thread="${escapeHtml(n.threadId)}"`;
        return `
          <button type="button" class="cd-phone-pulldown-notif-item" ${actionAttr}>
            <span class="cd-phone-pulldown-notif-icon" style="background:${iconBg};"><i class="${iconClass}"></i></span>
            <span class="cd-phone-pulldown-notif-body">
              <span class="cd-phone-pulldown-notif-title">${escapeHtml(n.title)}</span>
              <span class="cd-phone-pulldown-notif-preview">${escapeHtml(n.preview)}</span>
            </span>
            <span class="cd-phone-unread-pill">${n.count > 99 ? "99+" : n.count}</span>
          </button>
        `;
      }).join("");

  return `
    <div class="cd-phone-pulldown-backdrop" data-phone-pulldown-close></div>
    <div class="cd-phone-pulldown-shade" role="dialog" aria-label="Control Center &amp; Notifications">
      <div class="cd-phone-hero-card cd-phone-pulldown-hero">
        <div class="cd-phone-hero-top">
          <div class="cd-phone-hero-sub">ISEKAI LINK ACTIVE</div>
          ${canSwitchActor
            ? `<button type="button" class="cd-phone-pulldown-switch-btn" data-phone-actor-picker-toggle aria-expanded="${_actorPickerOpen ? "true" : "false"}">
                <i class="fa-solid fa-repeat"></i> ${_actorPickerOpen ? "Hide" : "Switch"}
              </button>`
            : ""}
        </div>
        <div class="cd-phone-pulldown-hero-main">
          ${avatarHtml}
          <div class="cd-phone-pulldown-profile-meta">
            <div class="cd-phone-hero-title">${escapeHtml(charName)}</div>
            <div class="cd-phone-hero-meta">No Earth Signal &bull; Academy Net</div>
          </div>
        </div>
        ${actorPickerListHtml}
      </div>

      <div class="cd-phone-pulldown-notifs-section">
        <div class="cd-phone-pulldown-section-head">
          <span>Notifications</span>
          ${notifications.length > 0
            ? `<button type="button" class="cd-phone-pulldown-clear-btn" data-phone-pulldown-clear>Clear</button>`
            : ""}
        </div>
        <div class="cd-phone-pulldown-notifs-list">
          ${notificationsHtml}
        </div>
      </div>

      <button type="button" class="cd-phone-pulldown-grabber" data-phone-pulldown-close aria-label="Close menu">
        <span></span>
      </button>
    </div>
  `;
}

function renderPhoneDiceTrayFlyout() {
  if (!_diceTrayOpen) return "";
  const parsed = parseFormulaStateFromChatText(_diceTrayFormula);
  const modeLabel = _diceTrayMode === "adv" ? "ADV" : (_diceTrayMode === "dis" ? "DIS" : "NORM");
  const modeClass = _diceTrayMode === "adv" ? "is-adv" : (_diceTrayMode === "dis" ? "is-dis" : "");

  return `
    <div class="cd-phone-dice-flyout" role="dialog" aria-label="Dice Tray">
      <div class="cd-phone-dt-header">
        <input type="text" class="cd-phone-dt-formula" value="${escapeHtml(_diceTrayFormula)}" placeholder="Tap dice to build roll..." aria-label="Dice Formula" />
        <button type="button" class="cd-phone-dt-close" data-dt-close title="Close Dice Tray">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="cd-phone-dt-grid">
        ${DICE_DEFS.map((d) => {
    const count = Number(_diceTrayCounts[d.id] || 0);
    const iconHtml = d.isCustomHtml ? d.html : `<i class="${d.icon}"></i>`;
    return `
            <button type="button" class="cd-phone-dt-die ${count > 0 ? "has-count" : ""}" data-dt-die="${d.id}" title="${escapeHtml(d.label)} (Left-click: +1 | Right-click: -1)">
              ${iconHtml}
              ${count > 0 ? `<span class="cd-phone-dt-badge">${count}</span>` : ""}
            </button>
          `;
  }).join("")}
      </div>
      <div class="cd-phone-dt-controls">
        <button type="button" class="cd-phone-dt-mode ${modeClass}" data-dt-mode title="Cycle: Normal / Advantage / Disadvantage">${modeLabel}</button>
        <div class="cd-phone-dt-mod-wrap" title="Flat Modifier (type or scroll)">
          <span class="cd-phone-dt-mod-prefix">±</span>
          <input type="number" class="cd-phone-dt-mod" value="${parsed.modifier !== 0 ? parsed.modifier : ""}" placeholder="0" aria-label="Flat Modifier" />
        </div>
        <button type="button" class="cd-phone-dt-clear" data-dt-clear title="Clear Formula">
          <i class="fa-solid fa-rotate-left"></i>
        </button>
        <button type="button" class="cd-phone-dt-roll" data-dt-roll title="Roll Formula">
          <i class="fa-solid fa-dice-d20"></i> Roll
        </button>
      </div>
    </div>
  `;
}

function resetPhoneDiceTrayState() {
  _diceTrayFormula = "";
  _diceTrayMode = "norm";
  _diceTrayCounts = { d4: 0, d6: 0, d8: 0, d10: 0, d12: 0, d20: 0, d100: 0 };
}

function syncPhoneDiceCountsFromFormula() {
  const parsed = parseFormulaStateFromChatText(_diceTrayFormula);
  const next = { d4: 0, d6: 0, d8: 0, d10: 0, d12: 0, d20: 0, d100: 0 };
  for (const [die, count] of Object.entries(parsed.counts || {})) {
    if (die in next) next[die] = count;
  }
  _diceTrayCounts = next;
}

function refreshPhoneDiceTrayDom(root) {
  const device = root?.querySelector?.(".cd-phone-device");
  if (!device) return;
  const existing = device.querySelector(".cd-phone-dice-flyout");
  if (existing) existing.remove();

  const navBtn = device.querySelector('[data-nav="dice-tray"]');
  if (navBtn) {
    navBtn.classList.toggle("is-active", _diceTrayOpen);
    navBtn.setAttribute("aria-expanded", _diceTrayOpen ? "true" : "false");
  }

  if (!_diceTrayOpen) return;

  const navbar = device.querySelector(".cd-phone-navbar");
  const wrapper = document.createElement("div");
  wrapper.innerHTML = renderPhoneDiceTrayFlyout().trim();
  const flyout = wrapper.firstElementChild;
  if (!flyout) return;
  if (navbar) {
    device.insertBefore(flyout, navbar);
  } else {
    device.appendChild(flyout);
  }
  bindPhoneDiceTrayEvents(root);
}

const EXPLICIT_WHISPER_ROLL_RE = /^\/(gmr|gmroll|b|blindroll|sr|selfroll|w|whisper)\b/i;

export function normalizePhoneDiceTrayCommand(formula) {
  const trimmed = String(formula || "").trim();
  if (!trimmed) return { isExplicitWhisper: false, cleanFormula: "", publicCommand: "" };
  if (EXPLICIT_WHISPER_ROLL_RE.test(trimmed)) {
    return { isExplicitWhisper: true, cleanFormula: trimmed, publicCommand: trimmed };
  }
  const cleanFormula = trimmed.replace(/^\/(pr|publicroll|r|roll)\s+/i, "").trim();
  const publicCommand = trimmed.startsWith("/")
    ? trimmed.replace(/^\/(r|roll)\b/i, "/pr")
    : `/pr ${trimmed}`;
  return { isExplicitWhisper: false, cleanFormula, publicCommand };
}

export async function submitPhoneDiceTrayRoll(formula, {
  RollClass = globalThis.Roll,
  chatMessageApi = globalThis.ChatMessage,
  uiChat = globalThis.ui?.chat,
  speaker = null,
  publicRollMode = globalThis.CONST?.DICE_ROLL_MODES?.PUBLIC ?? "publicroll"
} = {}) {
  const { isExplicitWhisper, cleanFormula, publicCommand } = normalizePhoneDiceTrayCommand(formula);
  if (!publicCommand) return false;

  if (isExplicitWhisper) {
    if (typeof uiChat?.processMessage === "function") {
      await uiChat.processMessage(publicCommand);
      return true;
    }
    return false;
  }

  if (typeof RollClass === "function" && cleanFormula) {
    try {
      const roll = await new RollClass(cleanFormula).evaluate();
      const resolvedSpeaker = speaker ?? chatMessageApi?.getSpeaker?.();
      await roll.toMessage(
        { speaker: resolvedSpeaker, whisper: [] },
        { rollMode: publicRollMode }
      );
      return true;
    } catch (err) {
      console.warn(`${MODULE_ID} | Direct public roll failed, falling back to chat command:`, err);
    }
  }

  if (typeof uiChat?.processMessage === "function") {
    try {
      await uiChat.processMessage(publicCommand);
      return true;
    } catch (err) {
      console.error(`${MODULE_ID} | Error rolling formula from phone dice tray:`, err);
    }
  }

  return false;
}

async function executePhoneDiceTrayRoll(root) {
  const formula = _diceTrayFormula.trim();
  if (!formula) return;

  resetPhoneDiceTrayState();
  refreshPhoneDiceTrayDom(root);

  const actor = getActivePhoneActor();
  const speaker = actor && typeof ChatMessage?.getSpeaker === "function"
    ? ChatMessage.getSpeaker({ actor })
    : ChatMessage?.getSpeaker?.();

  await submitPhoneDiceTrayRoll(formula, { speaker });
}

function bindPhoneDiceTrayEvents(root) {
  const flyout = root?.querySelector?.(".cd-phone-dice-flyout");
  if (!flyout) return;

  flyout.querySelector("[data-dt-close]")?.addEventListener("click", () => {
    _diceTrayOpen = false;
    refreshPhoneDiceTrayDom(root);
  });

  const formulaInput = flyout.querySelector(".cd-phone-dt-formula");
  formulaInput?.addEventListener("input", (ev) => {
    _diceTrayFormula = ev.target.value;
    syncPhoneDiceCountsFromFormula();
    const parsed = parseFormulaStateFromChatText(_diceTrayFormula);
    const modInput = flyout.querySelector(".cd-phone-dt-mod");
    if (modInput && document.activeElement !== modInput) {
      modInput.value = parsed.modifier !== 0 ? String(parsed.modifier) : "";
    }
    flyout.querySelectorAll("[data-dt-die]").forEach((btn) => {
      const die = btn.getAttribute("data-dt-die");
      const count = Number(_diceTrayCounts[die] || 0);
      btn.classList.toggle("has-count", count > 0);
      let badge = btn.querySelector(".cd-phone-dt-badge");
      if (count > 0) {
        if (!badge) {
          badge = document.createElement("span");
          badge.className = "cd-phone-dt-badge";
          btn.appendChild(badge);
        }
        badge.textContent = String(count);
      } else if (badge) {
        badge.remove();
      }
    });
  });

  formulaInput?.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      executePhoneDiceTrayRoll(root);
    }
  });

  flyout.querySelectorAll("[data-dt-die]").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.preventDefault();
      const die = btn.getAttribute("data-dt-die");
      if (!die) return;
      _diceTrayFormula = appendDieToChatText(_diceTrayFormula, die, _diceTrayMode);
      syncPhoneDiceCountsFromFormula();
      refreshPhoneDiceTrayDom(root);
    });

    btn.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();
      const die = btn.getAttribute("data-dt-die");
      if (!die) return;
      _diceTrayFormula = removeDieFromChatText(_diceTrayFormula, die);
      syncPhoneDiceCountsFromFormula();
      refreshPhoneDiceTrayDom(root);
    });
  });

  flyout.querySelector("[data-dt-mode]")?.addEventListener("click", () => {
    const order = ["norm", "adv", "dis"];
    const nextIdx = (order.indexOf(_diceTrayMode) + 1) % order.length;
    _diceTrayMode = order[nextIdx];
    if (_diceTrayFormula.trim()) {
      _diceTrayFormula = swapD20ModeInText(_diceTrayFormula, _diceTrayMode);
      syncPhoneDiceCountsFromFormula();
    }
    refreshPhoneDiceTrayDom(root);
  });

  const modInput = flyout.querySelector(".cd-phone-dt-mod");
  modInput?.addEventListener("input", (ev) => {
    const val = parseInt(ev.target.value, 10);
    const newMod = Number.isNaN(val) ? 0 : val;
    _diceTrayFormula = updateFlatModifierInChatText(_diceTrayFormula, newMod);
    if (formulaInput) formulaInput.value = _diceTrayFormula;
  });

  modInput?.addEventListener("wheel", (ev) => {
    ev.preventDefault();
    const delta = ev.deltaY < 0 ? 1 : -1;
    const parsed = parseFormulaStateFromChatText(_diceTrayFormula);
    const newMod = parsed.modifier + delta;
    _diceTrayFormula = updateFlatModifierInChatText(_diceTrayFormula, newMod);
    modInput.value = newMod !== 0 ? String(newMod) : "";
    if (formulaInput) formulaInput.value = _diceTrayFormula;
  });

  modInput?.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      executePhoneDiceTrayRoll(root);
    }
  });

  flyout.querySelector("[data-dt-clear]")?.addEventListener("click", () => {
    resetPhoneDiceTrayState();
    refreshPhoneDiceTrayDom(root);
  });

  flyout.querySelector("[data-dt-roll]")?.addEventListener("click", () => {
    executePhoneDiceTrayRoll(root);
  });
}

function renderCurrentAppScreen() {
  if (!game?.user?.isGM && _currentApp !== "home" && getDisabledPlayerAppIds().includes(_currentApp)) {
    return renderHomeScreen();
  }
  switch (_currentApp) {
    case "messages":
      return renderMessagesApp();
    case "system-log":
      return renderSystemLogApp();
    case "contacts":
      return renderContactsApp();
    case "academy":
      return renderAcademyApp();
    case "notes":
      return renderNotesApp();
    case "camera":
      return renderCameraApp();
    case "photos":
      return renderPhotosApp();
    case "music":
      return renderMusicApp();
    case "settings":
      return renderSettingsApp();
    case "home":
    default:
      return renderHomeScreen();
  }
}

export function openCombatEncounterWindow(uiObj = globalThis.ui) {
  if (typeof uiObj?.combat?.renderPopout === "function") {
    uiObj.combat.renderPopout();
    return true;
  }
  if (typeof uiObj?.combat?.render === "function") {
    uiObj.combat.render(true);
    return true;
  }
  uiObj?.notifications?.warn?.("Combat Tracker is not available.");
  return false;
}

export function getPlayerOwnedCharacters(actors = [], user = null) {
  if (!user || user.isGM) return [];
  return Array.from(actors || [])
    .filter((actor) => {
      if (!actor || actor.type !== "character") return false;
      if (typeof actor.isOwner === "boolean") return actor.isOwner;
      return Boolean(actor.testUserPermission?.(user, "OWNER"));
    })
    .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
}

export function resolveActivePhoneActor(actors = [], user = null, selectedActorId = null) {
  if (user?.isGM) return user?.character || null;
  const owned = getPlayerOwnedCharacters(actors, user);
  if (selectedActorId) {
    const selected = owned.find((actor) => actor.id === selectedActorId);
    if (selected) return selected;
  }
  if (user?.character) {
    const assigned = owned.find((actor) => actor.id === user.character.id);
    if (assigned) return assigned;
    return user.character;
  }
  return owned[0] || null;
}

function getOwnedPlayerPhoneActors() {
  return getPlayerOwnedCharacters(game?.actors?.contents || [], game?.user || null);
}

function getActivePhoneActor() {
  return resolveActivePhoneActor(game?.actors?.contents || [], game?.user || null, _selectedPhoneActorId);
}

function renderHomeScreen() {
  const renderAppTile = (app) => {
    const badgeCount = app.badgeKey === "unreadMessages" ? _unreadMessages : app.badgeKey === "unreadRolls" ? _unreadRolls : 0;
    return `
      <button type="button" class="cd-phone-app-tile${_homeEditMode ? " is-editing" : ""}" data-app="${app.id}">
        <span class="cd-phone-app-icon" style="background:${app.color};">
          <i class="${app.icon}"></i>
          ${badgeCount > 0 ? `<span class="cd-phone-app-badge">${badgeCount}</span>` : ""}
        </span>
        <span class="cd-phone-app-label">${escapeHtml(app.label)}</span>
      </button>
    `;
  };

  const visibleApps = getVisiblePhoneApps(
    getDisabledPlayerAppIds(),
    Boolean(game?.user?.isGM),
    getSavedPhoneAppOrder()
  );

  return `
    <div class="cd-phone-home">
      <div class="cd-phone-section-header">
        <div class="cd-phone-section-title">Apps</div>
        ${_homeEditMode ? `<button type="button" class="cd-phone-home-done-btn" data-phone-home-done>Done</button>` : ""}
      </div>
      <div class="cd-phone-app-grid${_homeEditMode ? " is-editing" : ""}">
        ${visibleApps.map(renderAppTile).join("")}
      </div>
    </div>
  `;
}

export function findContactsActorFolderFromList(folders = [], moduleId = MODULE_ID) {
  const actorFolders = Array.from(folders || []).filter((f) => f && f.type === "Actor");
  const flagged = actorFolders.find(
    (f) => Boolean(f.getFlag?.(moduleId, CONTACTS_FOLDER_FLAG) || f.flags?.[moduleId]?.[CONTACTS_FOLDER_FLAG])
  );
  if (flagged) return flagged;
  const exact = actorFolders.find((f) => String(f.name || "").trim() === CONTACTS_FOLDER_NAME);
  if (exact) return exact;
  return actorFolders.find((f) => String(f.name || "").trim().toLowerCase() === "contacts") || null;
}

export function isActorInContactsFolder(actor, contactsFolder, folders = []) {
  const targetId = contactsFolder?.id;
  if (!actor || !targetId) return false;
  const folderMap = new Map();
  for (const f of folders || []) {
    if (f?.id) folderMap.set(f.id, f);
  }
  let current = actor.folder;
  const visited = new Set();
  while (current) {
    const currentId = typeof current === "string" ? current : current.id;
    if (!currentId || visited.has(currentId)) break;
    if (currentId === targetId) return true;
    visited.add(currentId);
    const resolved = typeof current === "object" && current.folder !== undefined
      ? current
      : folderMap.get(currentId);
    current = resolved?.folder ?? null;
  }
  return false;
}

export function filterNpcContactsForFolder(actors = [], contactsFolder, folders = []) {
  if (!contactsFolder?.id) return [];
  return Array.from(actors || [])
    .filter((a) => a && !a.hasPlayerOwner && isActorInContactsFolder(a, contactsFolder, folders))
    .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
}

function findContactsActorFolder() {
  return findContactsActorFolderFromList(game?.folders?.contents || [], MODULE_ID);
}

let _contactsFolderPromise = null;
async function ensureContactsActorFolder() {
  const existing = findContactsActorFolder();
  if (existing) return existing;
  if (!game?.user?.isGM || typeof Folder === "undefined") return null;
  if (_contactsFolderPromise) return _contactsFolderPromise;
  _contactsFolderPromise = Folder.create({
    name: CONTACTS_FOLDER_NAME,
    type: "Actor",
    flags: { [MODULE_ID]: { [CONTACTS_FOLDER_FLAG]: true } }
  }).finally(() => {
    _contactsFolderPromise = null;
  });
  return _contactsFolderPromise;
}

function getNpcContactActors() {
  const ids = new Set(getNpcContactIds());
  const folder = findContactsActorFolder();
  const allFolders = game?.folders?.contents || [];
  return filterNpcContactsForFolder(game?.actors?.contents || [], folder, allFolders)
    .filter((a) => ids.has(a.id));
}

function getThreadDisplayInfo(threadId) {
  if (!threadId || threadId === "all") {
    return { title: "Party Chat", isParty: true, isGroup: false, isNpc: false };
  }
  if (String(threadId).startsWith("group:")) {
    const groupId = String(threadId).slice(6);
    const group = getPhoneGroupById(groupId);
    const title = group?.name || "Group Chat";
    return { title, isParty: false, isGroup: true, isNpc: false, groupId, group };
  }
  if (String(threadId).startsWith("npc:")) {
    const [, npcId, playerUserId, playerActorId] = String(threadId).split(":");
    const actor = game?.actors?.get?.(npcId);
    const playerUser = playerUserId ? game?.users?.get?.(playerUserId) : null;
    const playerActor = playerActorId ? game?.actors?.get?.(playerActorId) : null;
    const npcName = getContactDisplayName(`npc:${npcId}`, actor?.name || "NPC");
    const playerLabel = playerActor?.name || (playerUser ? getContactDisplayName(playerUser.id, playerUser.character?.name || playerUser.name) : "");
    const title = game?.user?.isGM && playerLabel ? `${npcName} (${playerLabel})` : npcName;
    return { title, isParty: false, isGroup: false, isNpc: true, npcId, playerUserId: playerUserId || "", playerActorId: playerActorId || "", actor, playerUser, playerActor };
  }
  if (String(threadId).startsWith("pc:")) {
    const [, myActorId, otherUserId, otherActorId] = String(threadId).split(":");
    const targetUser = otherUserId ? game?.users?.get?.(otherUserId) : null;
    const otherActor = otherActorId ? game?.actors?.get?.(otherActorId) : null;
    const contactKey = `pc:${otherUserId}:${otherActorId}`;
    return {
      title: getContactDisplayName(contactKey, otherActor?.name || targetUser?.character?.name || targetUser?.name || "Direct Message"),
      isParty: false,
      isGroup: false,
      isNpc: false,
      isPc: true,
      myActorId: myActorId || "",
      otherActorId: otherActorId || "",
      otherActor,
      targetUser
    };
  }
  const targetUser = game?.users?.get?.(threadId);
  return {
    title: getContactDisplayName(threadId, targetUser?.character?.name || targetUser?.name || "Direct Message"),
    isParty: false,
    isGroup: false,
    isNpc: false,
    isPc: false,
    targetUser
  };
}

function resolveGroupReplyAsNpcId(group, threadId, isGM = false, userId = "") {
  if (!isGM || !group || !Array.isArray(group.npcIds) || group.npcIds.length === 0) return "";
  const saved = _groupReplyAsNpcByThread[threadId];
  if (saved !== undefined) {
    if (saved === "" || group.npcIds.includes(saved)) return saved;
  }
  const memberIds = Array.isArray(group.memberIds) ? group.memberIds.map(String) : [];
  if (!memberIds.includes(String(userId))) {
    return String(group.npcIds[0] || "");
  }
  return "";
}

function renderMessagesApp() {
  const userId = game?.user?.id || "";
  const isGM = Boolean(game?.user?.isGM);
  const allTextMsgs = getStoredPhoneMessages(userId);

  if (_messageComposing && _composeNpcId && isGM) {
    const npc = game?.actors?.get?.(_composeNpcId);
    const players = Array.from(game?.users?.contents || []).filter((u) => u.id !== userId && !u.isGM);
    const allActors = Array.from(game?.actors?.contents || []);
    const recipientRows = [];
    for (const u of players) {
      const ownedChars = getPlayerOwnedCharacters(allActors, u);
      if (ownedChars.length > 0) {
        for (const charActor of ownedChars) {
          recipientRows.push({
            threadId: `npc:${_composeNpcId}:${u.id}:${charActor.id}`,
            img: charActor.img || u.avatar || "icons/svg/mystery-man.svg",
            title: charActor.name || u.name,
            sub: `${u.name} • Character`,
            color: getContactDisplayColor(u.id)
          });
        }
      } else {
        recipientRows.push({
          threadId: `npc:${_composeNpcId}:${u.id}`,
          img: u.character?.img || u.avatar || "icons/svg/mystery-man.svg",
          title: getContactDisplayName(u.id, u.character?.name || u.name),
          sub: `${u.name} • Player`,
          color: getContactDisplayColor(u.id)
        });
      }
    }
    return `
      <div class="cd-phone-app-view">
        <div class="cd-phone-app-header is-centered">
          <button type="button" class="cd-phone-inline-btn" data-msg-compose-back><i class="fa-solid fa-chevron-left"></i> Back</button>
          <span class="cd-phone-thread-title">Text as ${escapeHtml(npc?.name || "NPC")}</span>
          <span class="cd-phone-header-right"></span>
        </div>
        <div class="cd-phone-list">
          ${recipientRows.length === 0
        ? `<div class="cd-phone-empty">No player accounts found.</div>`
        : recipientRows.map((row) => `
                <button type="button" class="cd-phone-list-item" data-msg-thread="${escapeHtml(row.threadId)}">
                  <img class="cd-phone-avatar" src="${escapeHtml(row.img)}" alt="" />
                  <div class="cd-phone-list-meta">
                    <div class="cd-phone-list-title" ${row.color ? `style="color:${escapeHtml(row.color)}"` : ""}>${escapeHtml(row.title)}</div>
                    <div class="cd-phone-list-sub">${escapeHtml(row.sub)}</div>
                  </div>
                  <i class="fa-solid fa-chevron-right"></i>
                </button>
              `).join("")}
        </div>
      </div>
    `;
  }

  if (_messageComposing) {
    const otherUsers = Array.from(game?.users?.contents || []).filter((u) => u.id !== userId);
    const allActors = Array.from(game?.actors?.contents || []);
    const activeActorId = !isGM ? (getActivePhoneActor()?.id || "") : "";
    const npcContacts = getNpcContactActors();
    const selectedTotal = _composeGroupMemberIds.size + _composeGroupNpcIds.size;

    const composeRows = [];
    for (const u of otherUsers) {
      if (_composeGroupMode || isGM || u.isGM) {
        composeRows.push({
          key: u.id,
          threadId: u.id,
          userId: u.id,
          displayName: getContactDisplayName(u.id, u.character?.name || u.name),
          roleLabel: u.isGM ? "GM" : (u.character ? u.name : "Player"),
          img: u.character?.img || u.avatar || "icons/svg/mystery-man.svg",
          nameColor: getContactDisplayColor(u.id),
          active: u.active
        });
      } else {
        const ownedChars = getPlayerOwnedCharacters(allActors, u);
        if (ownedChars.length > 0 && activeActorId) {
          for (const charActor of ownedChars) {
            const contactKey = `pc:${u.id}:${charActor.id}`;
            composeRows.push({
              key: contactKey,
              threadId: `pc:${activeActorId}:${u.id}:${charActor.id}`,
              userId: u.id,
              displayName: getContactDisplayName(contactKey, charActor.name || u.name),
              roleLabel: u.name,
              img: charActor.img || u.avatar || "icons/svg/mystery-man.svg",
              nameColor: getContactDisplayColor(contactKey),
              active: u.active
            });
          }
        } else {
          composeRows.push({
            key: u.id,
            threadId: u.id,
            userId: u.id,
            displayName: getContactDisplayName(u.id, u.character?.name || u.name),
            roleLabel: u.character ? u.name : "Player",
            img: u.character?.img || u.avatar || "icons/svg/mystery-man.svg",
            nameColor: getContactDisplayColor(u.id),
            active: u.active
          });
        }
      }
    }

    return `
      <div class="cd-phone-app-view">
        <div class="cd-phone-app-header is-centered">
          <button type="button" class="cd-phone-inline-btn" data-msg-compose-back><i class="fa-solid fa-chevron-left"></i> Chats</button>
          <span class="cd-phone-thread-title">${_composeGroupMode ? "New Group" : "New Message"}</span>
          <span class="cd-phone-header-right">
            <button type="button" class="cd-phone-inline-btn" data-msg-toggle-group-mode title="${_composeGroupMode ? "Cancel Group" : "Create Group Chat"}">
              ${_composeGroupMode ? "Cancel" : '<i class="fa-solid fa-plus"></i> Group'}
            </button>
          </span>
        </div>
        ${_composeGroupMode ? `
          <div class="cd-phone-group-bar">
            <input type="text" class="cd-phone-group-input" data-msg-group-name placeholder="Group name (optional)" value="${escapeHtml(_composeGroupName)}" maxlength="40" />
            <button type="button" class="cd-phone-group-create" data-msg-group-create ${selectedTotal === 0 ? "disabled" : ""}>Create (${selectedTotal})</button>
          </div>
        ` : ""}
        <div class="cd-phone-list">
          <div class="cd-phone-section-label">Party &amp; Players</div>
          ${composeRows.length === 0
        ? `<div class="cd-phone-empty">No other users in this world.</div>`
        : composeRows.map((row) => {
          const isSelected = _composeGroupMemberIds.has(row.userId);
          return `
                <button type="button" class="cd-phone-list-item ${isSelected && _composeGroupMode ? "is-selected" : ""}" ${_composeGroupMode ? `data-msg-group-toggle-user="${escapeHtml(row.userId)}"` : `data-msg-thread="${escapeHtml(row.threadId)}"`}>
                  <img class="cd-phone-avatar" src="${escapeHtml(row.img)}" alt="" />
                  <div class="cd-phone-list-meta">
                    <div class="cd-phone-list-title" ${row.nameColor ? `style="color:${escapeHtml(row.nameColor)}"` : ""}>${escapeHtml(row.displayName)}${row.active ? ` <span class="cd-phone-online-dot" title="Online"></span>` : ""}</div>
                    <div class="cd-phone-list-sub">${escapeHtml(row.roleLabel)}</div>
                  </div>
                  ${_composeGroupMode
              ? `<span class="cd-phone-group-check ${isSelected ? "is-checked" : ""}"><i class="fa-${isSelected ? "solid fa-circle-check" : "regular fa-circle"}"></i></span>`
              : `<i class="fa-solid fa-chevron-right"></i>`}
                </button>
              `;
        }).join("")}

          <div class="cd-phone-section-label">NPC Contacts</div>
          ${npcContacts.length === 0
        ? `<div class="cd-phone-empty">No NPC contacts enabled${isGM ? " yet. Use Contacts → Manage to add NPCs." : " by the GM yet."}</div>`
        : npcContacts.map((a) => {
          const isSelected = _composeGroupNpcIds.has(a.id);
          const npcKey = `npc:${a.id}`;
          const npcDisplayName = getContactDisplayName(npcKey, a.name);
          const npcColor = getContactDisplayColor(npcKey);
          const activeActorId = !isGM ? (getActivePhoneActor()?.id || "") : "";
          const playerNpcThreadId = activeActorId ? `npc:${a.id}:${userId}:${activeActorId}` : `npc:${a.id}`;
          return `
              <button type="button" class="cd-phone-list-item ${isSelected && _composeGroupMode ? "is-selected" : ""}" ${_composeGroupMode
              ? `data-msg-group-toggle-npc="${escapeHtml(a.id)}"`
              : (isGM ? `data-msg-compose-npc="${escapeHtml(a.id)}"` : `data-msg-thread="${escapeHtml(playerNpcThreadId)}"`)}>
                <img class="cd-phone-avatar" src="${escapeHtml(a.img || "icons/svg/mystery-man.svg")}" alt="" />
                <div class="cd-phone-list-meta">
                  <div class="cd-phone-list-title" ${npcColor ? `style="color:${escapeHtml(npcColor)}"` : ""}>${escapeHtml(npcDisplayName)}</div>
                  <div class="cd-phone-list-sub">${_composeGroupMode ? "NPC Contact" : (isGM ? "Reply as NPC • Pick Player" : "NPC Contact")}</div>
                </div>
                ${_composeGroupMode
              ? `<span class="cd-phone-group-check ${isSelected ? "is-checked" : ""}"><i class="fa-${isSelected ? "solid fa-circle-check" : "regular fa-circle"}"></i></span>`
              : `<i class="fa-solid fa-chevron-right"></i>`}
              </button>
            `;
        }).join("")}
        </div>
      </div>
    `;
  }

  if (!_messageThreadId) {
    const publicMsgs = filterPhoneMessagesByThread(allTextMsgs, userId, "all");
    const lastPublic = publicMsgs[publicMsgs.length - 1];
    const partyUnread = _unreadByThread["all"] || 0;
    const activeActorId = !isGM ? (getActivePhoneActor()?.id || "") : "";
    const activeThreads = getActivePhoneThreads(allTextMsgs, userId, isGM, getHiddenPhoneThreads(), getStoredPhoneGroups(), activeActorId);

    return `
      <div class="cd-phone-app-view">
        <div class="cd-phone-app-header">
          <span><i class="fa-solid fa-message"></i> Messages</span>
          <button type="button" class="cd-phone-inline-btn" data-msg-compose title="New Message"><i class="fa-solid fa-plus"></i> New</button>
        </div>
        <div class="cd-phone-list">
          <div class="cd-phone-notice-banner">
            <i class="fa-solid fa-circle-info"></i>
            <span>${escapeHtml(MESSAGES_PRIVACY_TOOLTIP)}</span>
          </div>

          <button type="button" class="cd-phone-list-item ${partyUnread > 0 ? "is-unread" : ""}" data-msg-thread="all">
            <span class="cd-phone-doc-icon"><i class="fa-solid fa-users"></i></span>
            <div class="cd-phone-list-meta">
              <div class="cd-phone-list-title">Party Chat</div>
              <div class="cd-phone-list-sub">${escapeHtml(lastPublic ? `${getContactDisplayName(lastPublic.authorId, lastPublic.sender)}: ${lastPublic.plainText || "Photo"}` : "Everyone")}</div>
            </div>
            ${partyUnread > 0 ? `<span class="cd-phone-unread-pill">${partyUnread > 99 ? "99+" : partyUnread}</span>` : ""}
            <i class="fa-solid fa-chevron-right"></i>
          </button>

          ${activeThreads.length === 0
        ? `<div class="cd-phone-empty">No direct chats yet. Tap <b>+ New</b> to message a party member or NPC.</div>`
        : activeThreads.map((t) => {
          const last = t.lastMessage;
          const unread = _unreadByThread[t.threadId] || 0;
          if (t.kind === "group") {
            const grp = getPhoneGroupById(t.targetId);
            const title = grp?.name || "Group Chat";
            const lastSender = last?.sender ? getContactDisplayName(last.authorId, last.sender) : "";
            const preview = last?.plainText
              ? `${lastSender ? `${lastSender}: ` : ""}${last.plainText}`
              : (last?.imageSrc ? `${lastSender ? `${lastSender}: ` : ""}Photo` : "Group Chat");
            return `
                  <button type="button" class="cd-phone-list-item ${unread > 0 ? "is-unread" : ""}" data-msg-thread="${escapeHtml(t.threadId)}">
                    <span class="cd-phone-doc-icon"><i class="fa-solid fa-user-group"></i></span>
                    <div class="cd-phone-list-meta">
                      <div class="cd-phone-list-title">${escapeHtml(title)}</div>
                      <div class="cd-phone-list-sub">${escapeHtml(preview)}</div>
                    </div>
                    ${unread > 0 ? `<span class="cd-phone-unread-pill">${unread > 99 ? "99+" : unread}</span>` : ""}
                    <i class="fa-solid fa-chevron-right"></i>
                  </button>
                `;
          }
          if (t.kind === "npc") {
            const actor = game?.actors?.get?.(t.targetId);
            const playerUser = t.playerUserId ? game?.users?.get?.(t.playerUserId) : null;
            const playerActor = t.playerActorId ? game?.actors?.get?.(t.playerActorId) : null;
            const npcName = getContactDisplayName(`npc:${t.targetId}`, actor?.name || "NPC");
            const playerLabel = playerActor?.name || (playerUser ? getContactDisplayName(playerUser.id, playerUser.character?.name || playerUser.name) : "");
            const title = isGM && playerLabel ? `${npcName} • ${playerLabel}` : npcName;
            const npcColor = getContactDisplayColor(`npc:${t.targetId}`);
            return `
                  <button type="button" class="cd-phone-list-item ${unread > 0 ? "is-unread" : ""}" data-msg-thread="${escapeHtml(t.threadId)}">
                    <img class="cd-phone-avatar" src="${escapeHtml(actor?.img || "icons/svg/mystery-man.svg")}" alt="" />
                    <div class="cd-phone-list-meta">
                      <div class="cd-phone-list-title" ${npcColor ? `style="color:${escapeHtml(npcColor)}"` : ""}>${escapeHtml(title)}</div>
                      <div class="cd-phone-list-sub">${escapeHtml(last?.plainText || "Photo")}</div>
                    </div>
                    ${unread > 0 ? `<span class="cd-phone-unread-pill">${unread > 99 ? "99+" : unread}</span>` : ""}
                    <i class="fa-solid fa-chevron-right"></i>
                  </button>
                `;
          }
          if (t.kind === "pc") {
            const u = game?.users?.get?.(t.targetId);
            const otherActor = t.playerActorId ? game?.actors?.get?.(t.playerActorId) : null;
            const contactKey = `pc:${t.targetId}:${t.playerActorId}`;
            const displayName = getContactDisplayName(contactKey, otherActor?.name || u?.character?.name || u?.name || last?.sender || "Direct Message");
            const userColor = getContactDisplayColor(contactKey);
            return `
                  <button type="button" class="cd-phone-list-item ${unread > 0 ? "is-unread" : ""}" data-msg-thread="${escapeHtml(t.threadId)}">
                    <img class="cd-phone-avatar" src="${escapeHtml(otherActor?.img || u?.character?.img || u?.avatar || "icons/svg/mystery-man.svg")}" alt="" />
                    <div class="cd-phone-list-meta">
                      <div class="cd-phone-list-title" ${userColor ? `style="color:${escapeHtml(userColor)}"` : ""}>${escapeHtml(displayName)}</div>
                      <div class="cd-phone-list-sub">${escapeHtml(last?.plainText || "Photo")}</div>
                    </div>
                    ${unread > 0 ? `<span class="cd-phone-unread-pill">${unread > 99 ? "99+" : unread}</span>` : ""}
                    <i class="fa-solid fa-chevron-right"></i>
                  </button>
                `;
          }
          const u = game?.users?.get?.(t.targetId);
          const displayName = getContactDisplayName(t.targetId, u?.character?.name || u?.name || last?.sender || "Direct Message");
          const userColor = getContactDisplayColor(t.targetId);
          return `
                <button type="button" class="cd-phone-list-item ${unread > 0 ? "is-unread" : ""}" data-msg-thread="${escapeHtml(t.threadId)}">
                  <img class="cd-phone-avatar" src="${escapeHtml(u?.character?.img || u?.avatar || "icons/svg/mystery-man.svg")}" alt="" />
                  <div class="cd-phone-list-meta">
                    <div class="cd-phone-list-title" ${userColor ? `style="color:${escapeHtml(userColor)}"` : ""}>${escapeHtml(displayName)}${u?.active ? ` <span class="cd-phone-online-dot" title="Online"></span>` : ""}</div>
                    <div class="cd-phone-list-sub">${escapeHtml(last?.plainText || "Photo")}</div>
                  </div>
                  ${unread > 0 ? `<span class="cd-phone-unread-pill">${unread > 99 ? "99+" : unread}</span>` : ""}
                  <i class="fa-solid fa-chevron-right"></i>
                </button>
              `;
        }).join("")}
        </div>
      </div>
    `;
  }

  markThreadRead(_messageThreadId);
  const info = getThreadDisplayInfo(_messageThreadId);
  const isParty = info.isParty;
  const threadTitle = info.title;
  const threadMsgs = filterPhoneMessagesByThread(allTextMsgs, userId, _messageThreadId).slice(-30);
  const showConfirmHide = _confirmHideThreadId === _messageThreadId;

  return `
    <div class="cd-phone-app-view">
      <div class="cd-phone-app-header is-centered">
        <button type="button" class="cd-phone-inline-btn" data-msg-back><i class="fa-solid fa-chevron-left"></i> Chats</button>
        <span class="cd-phone-thread-title">${escapeHtml(threadTitle)}</span>
        <span class="cd-phone-header-right">
          ${!isParty ? `<button type="button" class="cd-phone-header-icon-btn" data-msg-confirm-hide title="Remove from inbox"><i class="fa-solid fa-trash-can"></i></button>` : ""}
          <span class="cd-phone-info-badge is-right" tabindex="0">
            <i class="fa-solid fa-circle-info"></i>
            <span class="cd-phone-info-popover">${escapeHtml(MESSAGES_PRIVACY_TOOLTIP)}</span>
          </span>
        </span>
      </div>
      <div class="cd-phone-thread">
        ${threadMsgs.length === 0
      ? `<div class="cd-phone-empty">${isParty ? "No texts yet. Say hi to the party!" : `Start a conversation with ${escapeHtml(threadTitle)}.`}</div>`
      : threadMsgs.map((m) => {
        const emojiOnly = !m.imageSrc && isEmojiOnlyText(m.plainText);
        const reactionEntries = Object.entries(m.reactions || {}).filter(([, users]) => Array.isArray(users) && users.length > 0);
        const showReactBar = _msgReactingToId === m.id;
        const senderColor = getContactDisplayColor(m.authorId);
        const senderDisplayName = getContactDisplayName(m.authorId, m.sender);
        const showDmSenderTag = !m.isMine && !info.isNpc && !info.isPc && m.sender && m.sender !== threadTitle;
        return `
            <div class="cd-phone-bubble-row ${m.isMine ? "is-mine" : "is-theirs"}">
              ${!m.isMine && (isParty || info.isGroup || showDmSenderTag) ? `<div class="cd-phone-bubble-sender" ${senderColor ? `style="color:${escapeHtml(senderColor)}"` : ""}>${escapeHtml(showDmSenderTag ? m.sender : senderDisplayName)}</div>` : ""}
              <div class="cd-phone-bubble-wrap">
                <div class="cd-phone-bubble ${m.isWhisper ? "is-whisper" : ""} ${emojiOnly ? "is-emoji-only" : ""}">
                  ${m.imageSrc ? `<img class="cd-phone-bubble-img" src="${escapeHtml(m.imageSrc)}" alt="Photo" loading="lazy" />` : ""}
                  ${m.plainText ? `<span>${escapeHtml(m.plainText)}</span>` : ""}
                </div>
                <button type="button" class="cd-phone-react-trigger" data-msg-react-open="${escapeHtml(m.id)}" title="React"><i class="fa-regular fa-face-smile"></i></button>
              </div>
              ${showReactBar ? `
                <div class="cd-phone-react-bar">
                  ${PHONE_REACTION_EMOJIS.map((em) => `<button type="button" class="cd-phone-react-opt" data-msg-react-pick="${escapeHtml(em)}" data-msg-id="${escapeHtml(m.id)}">${em}</button>`).join("")}
                </div>
              ` : ""}
              ${reactionEntries.length > 0 ? `
                <div class="cd-phone-reactions">
                  ${reactionEntries.map(([em, users]) => {
          const reacted = users.includes(userId);
          return `<button type="button" class="cd-phone-reaction-pill ${reacted ? "is-reacted" : ""}" data-msg-react-pick="${escapeHtml(em)}" data-msg-id="${escapeHtml(m.id)}">${em} <span>${users.length}</span></button>`;
        }).join("")}
                </div>
              ` : ""}
              <div class="cd-phone-bubble-time">${escapeHtml(m.timeStr)}</div>
            </div>
          `;
      }).join("")}
      </div>
      ${_msgFlyoutOpen ? renderPhoneFlyoutPopover() : ""}
      ${_msgStagedImage ? `
        <div class="cd-phone-staged-bar">
          <img class="cd-phone-staged-thumb" src="${escapeHtml(_msgStagedImage.src)}" alt="Preview" />
          <div class="cd-phone-staged-meta">
            <span class="cd-phone-staged-label">${escapeHtml(_msgStagedImage.label)}</span>
            ${_msgStagedImage.source === "url" ? `<span class="cd-phone-staged-hint">Not saved to history</span>` : ""}
          </div>
          <button type="button" class="cd-phone-staged-clear" data-msg-clear-staged title="Remove"><i class="fa-solid fa-xmark"></i></button>
        </div>
      ` : ""}
      ${isGM && info.isGroup && info.group?.npcIds?.length > 0 ? (() => {
      const activeNpcId = resolveGroupReplyAsNpcId(info.group, _messageThreadId, isGM, userId);
      return `
          <div class="cd-phone-reply-as-bar">
            <span class="cd-phone-reply-as-label">Reply as:</span>
            <div class="cd-phone-reply-as-pills">
              ${info.group.npcIds.map((nid) => {
        const actor = game?.actors?.get?.(nid);
        return `<button type="button" class="cd-phone-reply-as-pill ${activeNpcId === nid ? "is-active" : ""}" data-msg-reply-as="${escapeHtml(nid)}">${escapeHtml(actor?.name || "NPC")}</button>`;
      }).join("")}
              <button type="button" class="cd-phone-reply-as-pill ${activeNpcId === "" ? "is-active" : ""}" data-msg-reply-as="">GM</button>
            </div>
          </div>
        `;
    })() : ""}
      <form class="cd-phone-composer" data-compose="text">
        <textarea name="text" rows="1" placeholder="${isParty ? "Text party..." : `Message ${escapeHtml(threadTitle)}...`}" autocomplete="off">${escapeHtml(_msgTextDraft)}</textarea>
        <button type="button" class="cd-phone-composer-icon ${_msgFlyoutOpen ? "is-active" : ""}" data-msg-flyout-toggle title="Emojis & Images"><i class="fa-solid fa-plus"></i></button>
        <button type="submit" title="Send"><i class="fa-solid fa-paper-plane"></i></button>
      </form>
      ${showConfirmHide ? `
        <div class="cd-phone-modal-backdrop">
          <div class="cd-phone-modal">
            <div class="cd-phone-modal-title">Remove Conversation?</div>
            <div class="cd-phone-modal-body">This hides the chat from your inbox only. History is preserved and will reappear if a new message arrives.</div>
            <div class="cd-phone-modal-actions">
              <button type="button" class="cd-phone-modal-btn" data-msg-hide-cancel>Cancel</button>
              <button type="button" class="cd-phone-modal-btn is-danger" data-msg-hide-confirm>Remove</button>
            </div>
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

function getRecentPhoneEmojis() {
  try {
    const raw = localStorage.getItem(getScopedStorageKey(RECENT_EMOJIS_STORAGE_KEY));
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.slice(0, 12) : [];
  } catch {
    return [];
  }
}

function recordRecentPhoneEmoji(emoji) {
  if (!emoji) return;
  try {
    const next = [emoji, ...getRecentPhoneEmojis().filter((e) => e !== emoji)].slice(0, 12);
    localStorage.setItem(getScopedStorageKey(RECENT_EMOJIS_STORAGE_KEY), JSON.stringify(next));
  } catch {
    // ignore storage errors
  }
}

function renderPhoneFlyoutPopover() {
  const recent = getRecentPhoneEmojis();
  const emojiGroups = recent.length > 0
    ? [{ label: "Recent", emojis: recent }, ...PHONE_EMOJI_GROUPS]
    : PHONE_EMOJI_GROUPS;
  const photos = getCombinedPhotos();
  const safeUrl = sanitizePhoneImageUrl(_msgUrlDraft);

  return `
    <div class="cd-phone-popover is-flyout">
      <div class="cd-phone-popover-tabs">
        <button type="button" class="cd-phone-popover-tab ${_msgFlyoutTab === "emoji" ? "is-active" : ""}" data-msg-flyout-tab="emoji">
          <i class="fa-regular fa-face-smile"></i> Emojis
        </button>
        <button type="button" class="cd-phone-popover-tab ${_msgFlyoutTab === "album" ? "is-active" : ""}" data-msg-flyout-tab="album">
          <i class="fa-solid fa-images"></i> Album
        </button>
        <button type="button" class="cd-phone-popover-tab ${_msgFlyoutTab === "url" ? "is-active" : ""}" data-msg-flyout-tab="url">
          <i class="fa-solid fa-link"></i> URL
        </button>
      </div>
      ${_msgFlyoutTab === "emoji" ? `
        ${emojiGroups.map((g) => `
          <div class="cd-phone-emoji-group">
            <div class="cd-phone-popover-label">${escapeHtml(g.label)}</div>
            <div class="cd-phone-emoji-grid">
              ${g.emojis.map((em) => `<button type="button" class="cd-phone-emoji-btn" data-msg-emoji-pick="${escapeHtml(em)}">${em}</button>`).join("")}
            </div>
          </div>
        `).join("")}
      ` : _msgFlyoutTab === "album" ? `
        ${photos.length === 0
        ? `<div class="cd-phone-popover-empty">No photos in your album yet.</div>`
        : `<div class="cd-phone-attach-grid">
              ${photos.slice(0, 24).map((p) => `
                <button type="button" class="cd-phone-attach-thumb" data-msg-pick-album="${escapeHtml(p.id)}" title="Attach photo">
                  <img src="${escapeHtml(p.dataUrl)}" alt="Photo" loading="lazy" />
                </button>
              `).join("")}
            </div>`}
      ` : `
        <div class="cd-phone-url-box">
          <input type="url" class="cd-phone-url-input" data-msg-url-input value="${escapeHtml(_msgUrlDraft)}" placeholder="Paste https://... image link" autocomplete="off" />
          <div class="cd-phone-url-note">Sent as session-only (not saved to history).</div>
          ${safeUrl ? `
            <div class="cd-phone-url-preview">
              <img src="${escapeHtml(safeUrl)}" alt="Preview" data-msg-url-preview />
            </div>
          ` : ""}
          ${_msgUrlError ? `<div class="cd-phone-url-error">${escapeHtml(_msgUrlError)}</div>` : ""}
          <button type="button" class="cd-phone-url-attach-btn" data-msg-url-attach ${!safeUrl ? "disabled" : ""}>Attach Image</button>
        </div>
      `}
    </div>
  `;
}

function renderSystemLogApp() {
  _unreadRolls = 0;
  const isGM = Boolean(game?.user?.isGM);
  const rollDocs = Array.from(game?.messages?.contents || [])
    .filter((m) => m.visible !== false && classifyChatMessageForPhone(m) === "roll")
    .slice(-20);

  const playerUsers = isGM
    ? Array.from(game?.users?.contents || []).filter((u) => !u.isGM)
    : [];

  const gmComposerHtml = isGM ? `
    <div class="cd-phone-syslog-composer ${_sysLogComposeOpen ? "open" : "collapsed"}">
      <button type="button" class="cd-phone-syslog-toggle" data-action="syslog-toggle" aria-expanded="${_sysLogComposeOpen ? "true" : "false"}">
        <span><i class="fa-solid fa-bullhorn"></i> System Broadcast</span>
        <i class="fa-solid ${_sysLogComposeOpen ? "fa-chevron-down" : "fa-chevron-up"}"></i>
      </button>
      ${_sysLogComposeOpen ? `
        <form class="cd-phone-syslog-form" data-compose="syslog">
          <div class="cd-phone-syslog-row">
            <input type="text" class="cd-phone-syslog-input" data-syslog-field="alias" value="${escapeHtml(_sysLogAlias)}" placeholder="Sender alias (e.g. System)" maxlength="40" />
            <select class="cd-phone-syslog-select" data-syslog-field="recipient" title="Recipients">
              <option value="all" ${_sysLogRecipient === "all" ? "selected" : ""}>Everyone</option>
              ${playerUsers.map((u) => `<option value="${escapeHtml(u.id)}" ${_sysLogRecipient === u.id ? "selected" : ""}>${escapeHtml(u.name || "Player")}</option>`).join("")}
            </select>
          </div>
          <div class="cd-phone-syslog-chips">
            ${["System", "Narrator", "Alert", "World"].map((preset) => `
              <button type="button" class="cd-phone-syslog-chip" data-syslog-alias-chip="${preset}">${preset}</button>
            `).join("")}
          </div>
          <div class="cd-phone-syslog-tones">
            ${Object.values(SYSTEM_LOG_TONES).map((t) => `
              <button type="button" class="cd-phone-syslog-tone ${_sysLogTone === t.id ? "active" : ""}" data-syslog-tone="${t.id}" style="--tone-accent: ${t.accent};">
                <i class="${t.icon}"></i> ${t.label}
              </button>
            `).join("")}
          </div>
          <div class="cd-phone-syslog-send-row">
            <textarea class="cd-phone-syslog-textarea" data-syslog-field="text" rows="2" placeholder="Send a system log message to chat...">${escapeHtml(_sysLogDraft)}</textarea>
            <button type="submit" class="cd-phone-syslog-send" title="Send System Message">
              <i class="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </form>
      ` : ""}
    </div>
  ` : "";

  return `
    <div class="cd-phone-app-view">
      <div class="cd-phone-app-header">
        <span><i class="fa-solid fa-terminal"></i> System Log</span>
        <span class="cd-phone-header-sub">Rolls &amp; Combat</span>
      </div>
      <div class="cd-phone-list cd-phone-system-log">
        ${rollDocs.length === 0
      ? `<div class="cd-phone-empty">No system rolls recorded yet.</div>`
      : rollDocs.map((m) => `<div class="cd-phone-sys-slot" data-sys-msg-id="${escapeHtml(m.id)}"></div>`).join("")}
      </div>
      ${gmComposerHtml}
    </div>
  `;
}

function renderContactsApp() {
  const isGM = Boolean(game?.user?.isGM);
  const currentUserId = game?.user?.id || "";

  const otherUsers = Array.from(game?.users?.contents || []).filter((u) => u.id !== currentUserId);
  const contactsFolder = findContactsActorFolder();
  const allFolders = game?.folders?.contents || [];
  const npcContacts = isGM
    ? filterNpcContactsForFolder(game?.actors?.contents || [], contactsFolder, allFolders)
    : getNpcContactActors();

  if (_contactDetailKey) {
    const isNpc = String(_contactDetailKey).startsWith("npc:");
    const isPc = String(_contactDetailKey).startsWith("pc:");
    const pcParts = isPc ? String(_contactDetailKey).split(":") : [];
    const contactActor = isNpc
      ? game?.actors?.get?.(String(_contactDetailKey).slice(4))
      : (isPc ? game?.actors?.get?.(pcParts[2] || "") : null);
    const contactUser = isNpc
      ? null
      : game?.users?.get?.(isPc ? (pcParts[1] || "") : _contactDetailKey);
    const targetFound = isNpc ? Boolean(contactActor) : (isPc ? Boolean(contactUser && contactActor) : Boolean(contactUser));

    if (targetFound) {
      const contactKey = _contactDetailKey;
      const originalName = (isNpc || isPc)
        ? contactActor.name
        : (contactUser.character?.name || contactUser.name);
      const roleLabel = isNpc
        ? "NPC Contact"
        : (contactUser.isGM ? "GM" : (isPc ? contactUser.name : (contactUser.character ? contactUser.name : "Player")));
      const avatarSrc = (isNpc || isPc)
        ? (contactActor.img || contactUser?.avatar || "icons/svg/mystery-man.svg")
        : (contactUser.character?.img || contactUser.avatar || "icons/svg/mystery-man.svg");
      const sheetActor = (isNpc || isPc) ? contactActor : contactUser.character;
      const canOpenSheet = Boolean(sheetActor?.testUserPermission?.(game.user, "OBSERVER"));

      const colorOverrides = getPhoneContactColorOverrides();
      const hasColorOverride = Boolean(sanitizePhoneColor(colorOverrides[contactKey]));
      const displayColor = getContactDisplayColor(contactKey);
      const pickerValue = displayColor || (isNpc ? "#8e8e93" : "#0a84ff");

      const nickOverrides = getPhoneContactNicknameOverrides();
      const currentNickname = sanitizePhoneNickname(nickOverrides[contactKey]);
      const displayName = getContactDisplayName(contactKey, originalName);
      const activeActorId = !isGM ? (getActivePhoneActor()?.id || "") : "";
      const playerNpcThreadId = activeActorId ? `npc:${contactActor?.id || ""}:${game?.user?.id || ""}:${activeActorId}` : `npc:${contactActor?.id || ""}`;
      const pcThreadId = (isPc && activeActorId) ? `pc:${activeActorId}:${contactUser.id}:${contactActor.id}` : (contactUser?.id || "");
      const msgAttr = isNpc
        ? (isGM ? `data-contacts-npc-gm="${escapeHtml(contactActor.id)}"` : `data-contacts-msg="${escapeHtml(playerNpcThreadId)}"`)
        : `data-contacts-msg="${escapeHtml(pcThreadId)}"`;

      return `
        <div class="cd-phone-app-view">
          <div class="cd-phone-app-header is-centered">
            <button type="button" class="cd-phone-inline-btn" data-contact-detail-back><i class="fa-solid fa-chevron-left"></i> Contacts</button>
            <span class="cd-phone-thread-title">Contact</span>
            <span class="cd-phone-header-right"></span>
          </div>
          <div class="cd-phone-list cd-phone-contact-detail">
            <div class="cd-phone-detail-hero">
              <img class="cd-phone-detail-avatar" src="${escapeHtml(avatarSrc)}" alt="" />
              <div class="cd-phone-detail-name" ${displayColor ? `style="color:${escapeHtml(displayColor)}"` : ""}>${escapeHtml(displayName)}${!isNpc && contactUser.active ? ` <span class="cd-phone-online-dot" title="Online"></span>` : ""}</div>
              <div class="cd-phone-detail-sub">${currentNickname ? `Original: ${escapeHtml(originalName)} • ` : ""}${escapeHtml(roleLabel)}</div>
            </div>

            <div class="cd-phone-detail-actions">
              <button type="button" class="cd-phone-detail-btn is-primary" ${msgAttr}>
                <i class="fa-solid fa-message"></i> Message
              </button>
              ${canOpenSheet ? `
                <button type="button" class="cd-phone-detail-btn" data-open-actor="${escapeHtml(sheetActor.id)}">
                  <i class="fa-solid fa-id-card"></i> Open Sheet
                </button>
              ` : ""}
            </div>

            <div class="cd-phone-detail-card">
              <div class="cd-phone-detail-field">
                <label class="cd-phone-detail-label">Nickname <span class="cd-phone-detail-hint">(only visible to you)</span></label>
                <div class="cd-phone-detail-input-row">
                  <input type="text" class="cd-phone-detail-input" data-contact-nickname-input="${escapeHtml(contactKey)}" value="${escapeHtml(currentNickname)}" placeholder="${escapeHtml(originalName)}" maxlength="40" autocomplete="off" />
                  <button type="button" class="cd-phone-inline-btn" data-contact-nickname-save="${escapeHtml(contactKey)}">Save</button>
                  ${currentNickname ? `<button type="button" class="cd-phone-color-reset" data-contact-nickname-reset="${escapeHtml(contactKey)}" title="Reset nickname"><i class="fa-solid fa-rotate-left"></i></button>` : ""}
                </div>
              </div>

              <div class="cd-phone-detail-field is-inline">
                <span class="cd-phone-detail-label">Name Color <span class="cd-phone-detail-hint">(only you)</span></span>
                <div class="cd-phone-detail-color-row">
                  <input type="color" class="cd-phone-color-picker" data-contact-color="${escapeHtml(contactKey)}" value="${escapeHtml(pickerValue)}" title="Custom name color (only affects your phone)" />
                  ${hasColorOverride ? `<button type="button" class="cd-phone-color-reset" data-contact-color-reset="${escapeHtml(contactKey)}" title="Reset color"><i class="fa-solid fa-rotate-left"></i></button>` : ""}
                </div>
              </div>
            </div>

            ${isGM && isNpc ? (() => {
          const accessMap = getNpcContactAccessMap();
          const storedMode = getNpcContactAccessMode(accessMap, contactActor.id);
          const isDraftSelect = _npcAccessSelectDraftIds.has(contactActor.id);
          const activeMode = storedMode === "select" || isDraftSelect ? "select" : storedMode;
          const selectedUserIds = new Set(Array.isArray(accessMap[contactActor.id]) ? accessMap[contactActor.id] : []);
          const players = Array.from(game?.users?.contents || [])
            .filter((u) => !u.isGM)
            .sort((a, b) => String(a.character?.name || a.name || "").localeCompare(String(b.character?.name || b.name || "")));

          return `
                <div class="cd-phone-detail-card">
                  <div class="cd-phone-detail-field">
                    <label class="cd-phone-detail-label">Player Access <span class="cd-phone-detail-hint">(${escapeHtml(formatNpcAccessSummary(accessMap, contactActor.id))})</span></label>
                    <div class="cd-phone-access-segmented">
                      <button type="button" class="cd-phone-access-seg-btn ${activeMode === "off" ? "is-active" : ""}" data-npc-access-mode="${escapeHtml(contactActor.id)}:off">Off</button>
                      <button type="button" class="cd-phone-access-seg-btn ${activeMode === "all" ? "is-active" : ""}" data-npc-access-mode="${escapeHtml(contactActor.id)}:all">All</button>
                      <button type="button" class="cd-phone-access-seg-btn ${activeMode === "select" ? "is-active" : ""}" data-npc-access-mode="${escapeHtml(contactActor.id)}:select">Select</button>
                    </div>
                    ${activeMode === "select" ? `
                      <div class="cd-phone-access-players">
                        ${players.length === 0
                ? `<div class="cd-phone-detail-hint">No player users found.</div>`
                : players.map((u) => {
                  const isAllowed = selectedUserIds.has(u.id);
                  const label = u.character?.name || u.name;
                  return `
                                <button type="button" class="cd-phone-access-player-chip ${isAllowed ? "is-selected" : ""}" data-npc-access-player="${escapeHtml(contactActor.id)}:${escapeHtml(u.id)}" title="${escapeHtml(u.name)}">
                                  <i class="fa-solid ${isAllowed ? "fa-check" : "fa-plus"}"></i>
                                  <span>${escapeHtml(label)}</span>
                                </button>
                              `;
                }).join("")}
                      </div>
                      ${selectedUserIds.size === 0 ? `<div class="cd-phone-detail-hint">Pick players above to grant access.</div>` : ""}
                    ` : ""}
                  </div>
                </div>
              `;
        })() : ""}
          </div>
        </div>
      `;
    }
  }

  const allActors = Array.from(game?.actors?.contents || []);
  const contactRows = [];
  for (const u of otherUsers) {
    if (isGM || u.isGM) {
      const originalName = u.character?.name || u.name;
      const displayName = getContactDisplayName(u.id, originalName);
      const hasNickname = Boolean(sanitizePhoneNickname(getPhoneContactNicknameOverrides()[u.id]));
      const roleLabel = u.isGM ? "GM" : (u.character ? u.name : "Player");
      contactRows.push({
        contactKey: u.id,
        displayName,
        subLabel: hasNickname ? `${originalName} • ${roleLabel}` : roleLabel,
        displayColor: getContactDisplayColor(u.id),
        img: u.character?.img || u.avatar || "icons/svg/mystery-man.svg",
        active: u.active
      });
    } else {
      const ownedChars = getPlayerOwnedCharacters(allActors, u);
      if (ownedChars.length > 0) {
        for (const charActor of ownedChars) {
          const contactKey = `pc:${u.id}:${charActor.id}`;
          const originalName = charActor.name || u.name;
          const displayName = getContactDisplayName(contactKey, originalName);
          const hasNickname = Boolean(sanitizePhoneNickname(getPhoneContactNicknameOverrides()[contactKey]));
          contactRows.push({
            contactKey,
            displayName,
            subLabel: hasNickname ? `${originalName} • ${u.name}` : u.name,
            displayColor: getContactDisplayColor(contactKey),
            img: charActor.img || u.avatar || "icons/svg/mystery-man.svg",
            active: u.active
          });
        }
      } else {
        const originalName = u.character?.name || u.name;
        const displayName = getContactDisplayName(u.id, originalName);
        const hasNickname = Boolean(sanitizePhoneNickname(getPhoneContactNicknameOverrides()[u.id]));
        contactRows.push({
          contactKey: u.id,
          displayName,
          subLabel: hasNickname ? `${originalName} • Player` : "Player",
          displayColor: getContactDisplayColor(u.id),
          img: u.character?.img || u.avatar || "icons/svg/mystery-man.svg",
          active: u.active
        });
      }
    }
  }

  return `
    <div class="cd-phone-app-view">
      <div class="cd-phone-app-header">
        <span><i class="fa-solid fa-address-book"></i> Contacts</span>
      </div>
      <div class="cd-phone-list">
        <div class="cd-phone-section-label">Party &amp; Players</div>
        ${contactRows.length === 0
      ? `<div class="cd-phone-empty">No other users found.</div>`
      : contactRows.map((row) => `
              <button type="button" class="cd-phone-list-item" data-contact-detail="${escapeHtml(row.contactKey)}">
                <img class="cd-phone-avatar" src="${escapeHtml(row.img)}" alt="" />
                <div class="cd-phone-list-meta">
                  <div class="cd-phone-list-title" ${row.displayColor ? `style="color:${escapeHtml(row.displayColor)}"` : ""}>${escapeHtml(row.displayName)}${row.active ? ` <span class="cd-phone-online-dot" title="Online"></span>` : ""}</div>
                  <div class="cd-phone-list-sub">${escapeHtml(row.subLabel)}</div>
                </div>
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            `).join("")}

        <div class="cd-phone-section-label">NPC Contacts</div>
        ${npcContacts.length === 0
      ? `<div class="cd-phone-empty">${isGM ? "No NPC actors found in the Contacts folder." : "No NPC contacts added yet."}</div>`
      : npcContacts.map((a) => {
        const npcKey = `npc:${a.id}`;
        const displayName = getContactDisplayName(npcKey, a.name);
        const hasNickname = Boolean(sanitizePhoneNickname(getPhoneContactNicknameOverrides()[npcKey]));
        const accessSummary = isGM ? formatNpcAccessSummary(getNpcContactAccessMap(), a.id) : "";
        const baseRole = isGM ? `${accessSummary} • NPC` : "NPC Contact";
        const subLabel = hasNickname ? `${a.name} • ${baseRole}` : baseRole;
        const displayColor = getContactDisplayColor(npcKey);
        return `
              <button type="button" class="cd-phone-list-item" data-contact-detail="${escapeHtml(npcKey)}">
                <img class="cd-phone-avatar" src="${escapeHtml(a.img || "icons/svg/mystery-man.svg")}" alt="" />
                <div class="cd-phone-list-meta">
                  <div class="cd-phone-list-title" ${displayColor ? `style="color:${escapeHtml(displayColor)}"` : ""}>${escapeHtml(displayName)}</div>
                  <div class="cd-phone-list-sub">${escapeHtml(subLabel)}</div>
                </div>
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            `;
      }).join("")}
      </div>
    </div>
  `;
}

function renderAcademyApp() {
  const journals = Array.from(game?.journal?.contents || [])
    .filter((j) => j.testUserPermission?.(game.user, "OBSERVER") && !j.getFlag?.(MODULE_ID, ALBUM_USER_FLAG) && !j.getFlag?.(MODULE_ID, MESSAGES_JOURNAL_FLAG))
    .slice(0, 30);

  return `
    <div class="cd-phone-app-view">
      <div class="cd-phone-app-header">
        <span><i class="fa-solid fa-book-open"></i> Academy &amp; Quests</span>
      </div>
      <div class="cd-phone-list">
        ${journals.length === 0
      ? `<div class="cd-phone-empty">No academy notes or quests shared yet.</div>`
      : journals.map((j) => `
            <button type="button" class="cd-phone-list-item" data-open-journal="${j.id}">
              <span class="cd-phone-doc-icon"><i class="fa-solid fa-file-lines"></i></span>
              <div class="cd-phone-list-meta">
                <div class="cd-phone-list-title">${escapeHtml(j.name)}</div>
                <div class="cd-phone-list-sub">${j.pages?.size || 0} page(s)</div>
              </div>
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          `).join("")}
      </div>
    </div>
  `;
}

function renderNotesApp() {
  const allNotes = getSavedPhoneNotes();
  const activeNote = _selectedNoteId ? allNotes.find((n) => n.id === _selectedNoteId) : null;

  if (activeNote) {
    const isConfirmingDelete = _confirmDeleteNoteId === activeNote.id;
    const bodyLen = String(activeNote.body || "").length;
    return `
      <div class="cd-phone-app-view cd-phone-notes-editor">
        <div class="cd-phone-app-header cd-phone-notes-header">
          <button type="button" class="cd-phone-notes-icon-btn" data-note-back title="All Notes">
            <i class="fa-solid fa-chevron-left"></i>
            <span>Notes</span>
          </button>
          <div class="cd-phone-notes-actions">
            <button type="button" class="cd-phone-notes-icon-btn ${activeNote.pinned ? "is-pinned" : ""}" data-note-pin="${escapeHtml(activeNote.id)}" title="${activeNote.pinned ? "Unpin note" : "Pin note"}">
              <i class="fa-solid fa-thumbtack"></i>
            </button>
            <button type="button" class="cd-phone-notes-icon-btn" data-note-send-chat="${escapeHtml(activeNote.id)}" title="Post note to Chat">
              <i class="fa-solid fa-share-from-square"></i>
            </button>
            <button type="button" class="cd-phone-notes-icon-btn is-danger" data-note-delete="${escapeHtml(activeNote.id)}" title="Delete note">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
        ${isConfirmingDelete ? `
          <div class="cd-phone-notes-confirm">
            <span>Delete this note?</span>
            <div class="cd-phone-notes-confirm-btns">
              <button type="button" class="cd-phone-notes-confirm-cancel" data-note-delete-cancel>Cancel</button>
              <button type="button" class="cd-phone-notes-confirm-del" data-note-delete-confirm="${escapeHtml(activeNote.id)}">Delete</button>
            </div>
          </div>
        ` : ""}
        <div class="cd-phone-notes-editor-body">
          <input type="text" class="cd-phone-note-title-input" data-note-title="${escapeHtml(activeNote.id)}" value="${escapeHtml(activeNote.title)}" maxlength="80" placeholder="Title" />
          <textarea class="cd-phone-note-body-input" data-note-body="${escapeHtml(activeNote.id)}" maxlength="10000" placeholder="Write a note...">${escapeHtml(activeNote.body)}</textarea>
        </div>
        <div class="cd-phone-notes-footer">
          <span data-note-save-status>Saved${activeNote.updatedAt ? ` &bull; ${escapeHtml(formatNoteTimestamp(activeNote.updatedAt))}` : ""}</span>
          <span data-note-char-count>${bodyLen} chars</span>
        </div>
      </div>
    `;
  }

  const filteredNotes = filterPhoneNotes(allNotes, _notesSearchQuery);

  return `
    <div class="cd-phone-app-view cd-phone-notes-view">
      <div class="cd-phone-app-header cd-phone-notes-header">
        <span><i class="fa-solid fa-note-sticky" style="color: #ffd60a;"></i> Notes</span>
        <button type="button" class="cd-phone-notes-new-btn" data-note-new title="New Note">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
      </div>
      <div class="cd-phone-notes-search-wrap">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" class="cd-phone-notes-search" data-note-search value="${escapeHtml(_notesSearchQuery)}" placeholder="Search notes..." />
        ${_notesSearchQuery ? `<button type="button" class="cd-phone-notes-search-clear" data-note-search-clear title="Clear search"><i class="fa-solid fa-xmark"></i></button>` : ""}
      </div>
      <div class="cd-phone-list cd-phone-notes-list">
        ${filteredNotes.length === 0
      ? `<div class="cd-phone-empty">${_notesSearchQuery ? "No matching notes." : "No notes yet. Tap the compose icon to create one."}</div>`
      : filteredNotes.map((n) => `
            <button type="button" class="cd-phone-list-item cd-phone-note-row" data-note-open="${escapeHtml(n.id)}">
              <div class="cd-phone-list-meta">
                <div class="cd-phone-list-title">
                  ${n.pinned ? `<i class="fa-solid fa-thumbtack cd-phone-note-pin-badge" title="Pinned"></i>` : ""}
                  <span>${escapeHtml(n.title.trim() || "Untitled Note")}</span>
                </div>
                <div class="cd-phone-list-sub">
                  <span class="cd-phone-note-time">${escapeHtml(formatNoteTimestamp(n.updatedAt))}</span>
                  <span>&bull; ${escapeHtml(getNotePreviewText(n.body, 55))}</span>
                </div>
              </div>
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          `).join("")}
      </div>
    </div>
  `;
}

function renderCameraApp() {
  const photos = getCombinedPhotos();
  const latest = photos[0];
  return `
    <div class="cd-phone-camera-view">
      <div class="cd-phone-camera-top">
        <span class="cd-phone-camera-pill">PHOTO &bull; 1x</span>
        <div class="cd-phone-camera-tools">
          <button type="button" class="cd-phone-camera-tool ${_cameraGrid ? "is-active" : ""}" data-camera-grid title="Toggle Grid">
            <i class="fa-solid fa-table-cells"></i>
          </button>
          <button type="button" class="cd-phone-camera-tool" data-camera-expand title="Expand Viewfinder">
            <i class="fa-solid fa-expand"></i>
          </button>
        </div>
      </div>

      <div class="cd-phone-viewfinder">
        ${_cameraExpanded ? `
          <button type="button" class="cd-phone-camera-collapse" data-camera-expand title="Exit Fullscreen Viewfinder">
            <i class="fa-solid fa-compress"></i>
          </button>
        ` : ""}
        ${_cameraGrid ? `
          <div class="cd-phone-grid-lines" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </div>
        ` : ""}
        <div class="cd-phone-reticle" aria-hidden="true"></div>
        <div class="cd-phone-shutter-flash" aria-hidden="true"></div>
      </div>

      <div class="cd-phone-camera-bar">
        <button type="button" class="cd-phone-cam-thumb" data-app="photos" title="Open Photos">
          ${latest
      ? `<img src="${escapeHtml(latest.dataUrl)}" alt="Last photo" />`
      : `<i class="fa-solid fa-images"></i>`}
        </button>
        <button type="button" class="cd-phone-shutter-btn" data-camera-shutter title="Take Photo">
          <span></span>
        </button>
        <span class="cd-phone-cam-spacer"></span>
      </div>
    </div>
  `;
}

function renderPhotosApp() {
  const photos = getCombinedPhotos();
  const selected = _selectedPhotoId ? photos.find((p) => p.id === _selectedPhotoId) : null;

  if (selected) {
    const isCloud = selected.source === "cloud";
    return `
      <div class="cd-phone-app-view">
        <div class="cd-phone-app-header">
          <button type="button" class="cd-phone-inline-btn" data-photo-back><i class="fa-solid fa-chevron-left"></i> Gallery</button>
          <span class="cd-phone-header-sub">${escapeHtml(selected.dateLabel || selected.sceneName || "Snapshot")}</span>
        </div>
        <div class="cd-phone-photo-detail">
          <img src="${escapeHtml(selected.dataUrl)}" alt="Captured snapshot" />
        </div>
        <div class="cd-phone-photo-actions">
          ${!isCloud ? `
            <button type="button" class="cd-phone-action-btn is-cloud" data-photo-cloud="${selected.id}" title="Save to Private Player Album">
              <i class="fa-solid fa-cloud-arrow-up"></i> Cloud
            </button>
          ` : `
            <span class="cd-phone-cloud-pill" title="Saved in your private Photo Album journal">
              <i class="fa-solid fa-cloud"></i> Saved
            </span>
          `}
          <button type="button" class="cd-phone-action-btn is-primary" data-photo-share="${selected.id}" title="Send to Messages">
            <i class="fa-solid fa-paper-plane"></i> Send
          </button>
          <button type="button" class="cd-phone-action-btn" data-photo-download="${selected.id}" title="Download">
            <i class="fa-solid fa-download"></i>
          </button>
          <button type="button" class="cd-phone-action-btn is-danger" data-photo-delete="${selected.id}" title="Delete">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

  const filteredPhotos = _photosFilter === "cloud"
    ? photos.filter((p) => p.source === "cloud")
    : photos;

  return `
    <div class="cd-phone-app-view">
      <div class="cd-phone-app-header">
        <span><i class="fa-solid fa-images"></i> Photos</span>
        <div class="cd-phone-filter-pills">
          <button type="button" class="cd-phone-filter-pill ${_photosFilter === "all" ? "is-active" : ""}" data-photos-filter="all">All (${photos.length})</button>
          <button type="button" class="cd-phone-filter-pill ${_photosFilter === "cloud" ? "is-active" : ""}" data-photos-filter="cloud"><i class="fa-solid fa-cloud"></i> (${photos.filter((p) => p.source === "cloud").length})</button>
        </div>
      </div>
      ${filteredPhotos.length === 0
      ? `<div class="cd-phone-empty">${_photosFilter === "cloud" ? "No Cloud-saved photos yet." : "No photos yet. Open Camera and snap a shot of the scene!"}</div>`
      : `<div class="cd-phone-photo-grid">
            ${filteredPhotos.map((p) => `
              <button type="button" class="cd-phone-photo-cell" data-photo-open="${p.id}" title="${escapeHtml(`${p.dateLabel || ""} — ${p.sceneName || "Photo"}`)}">
                <img src="${escapeHtml(p.dataUrl)}" alt="Photo" />
                <span class="cd-phone-photo-badge ${p.source === "cloud" ? "is-cloud" : ""}">
                  <i class="fa-solid ${p.source === "cloud" ? "fa-cloud" : "fa-camera"}"></i>
                </span>
              </button>
            `).join("")}
          </div>`}
    </div>
  `;
}

function renderMusicApp() {
  const playlists = Array.from(game?.playlists?.contents || []);
  const playing = playlists.filter((p) => p.playing);

  return `
    <div class="cd-phone-app-view">
      <div class="cd-phone-app-header">
        <span><i class="fa-solid fa-music"></i> Music</span>
      </div>
      <div class="cd-phone-list">
        <div class="cd-phone-now-playing">
          <div class="cd-phone-hero-sub">NOW PLAYING</div>
          <div>${playing.length ? escapeHtml(playing.map((p) => p.name).join(", ")) : "Silence (Ambient)"}</div>
        </div>
        ${playlists.map((p) => `
          <div class="cd-phone-list-item">
            <span class="cd-phone-doc-icon"><i class="fa-solid ${p.playing ? "fa-volume-high" : "fa-music"}"></i></span>
            <div class="cd-phone-list-meta">
              <div class="cd-phone-list-title">${escapeHtml(p.name)}</div>
              <div class="cd-phone-list-sub">${p.playing ? "Playing" : "Idle"}</div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderSettingsApp() {
  const charName = getActivePhoneActor()?.name || game?.user?.name || "Transfer Student";
  const album = findPlayerAlbumJournal();
  const cloudCount = album?.pages?.size || 0;
  const wp = getSavedWallpaper() || {};
  const currentColor = wp.bgType === "color" && wp.bgValue ? wp.bgValue : "#0f131d";
  const currentBezel = wp.bezelColor || "#2c3347";
  const hasImage = Boolean(wp.imageUrl);

  if (_settingsSubmenu === "manage-apps" && game?.user?.isGM) {
    const disabledSet = new Set(getDisabledPlayerAppIds());
    const manageableApps = PHONE_APPS.filter((app) => app.id !== "settings");

    return `
      <div class="cd-phone-app-view">
        <div class="cd-phone-app-header">
          <button type="button" class="cd-phone-inline-btn" data-settings-back><i class="fa-solid fa-chevron-left"></i> Settings</button>
          <span class="cd-phone-header-sub">Manage Apps</span>
        </div>
        <div class="cd-phone-list">
          ${manageableApps.map((app) => {
      const isEnabled = !disabledSet.has(app.id);
      return `
              <button type="button" class="cd-phone-list-item ${isEnabled ? "is-selected" : ""}" data-gm-toggle-app="${escapeHtml(app.id)}">
                <span class="cd-phone-doc-icon" style="background:${app.color}; color:#fff;"><i class="${app.icon}"></i></span>
                <div class="cd-phone-list-meta">
                  <div class="cd-phone-list-title">${escapeHtml(app.label)}</div>
                  <div class="cd-phone-list-sub">${isEnabled ? "Visible to players" : "Hidden from players"}</div>
                </div>
                <span class="cd-phone-toggle-pill ${isEnabled ? "is-on" : ""}">${isEnabled ? "On" : "Off"}</span>
              </button>
            `;
    }).join("")}
        </div>
      </div>
    `;
  }

  if (_settingsSubmenu === "manage-messages" && game?.user?.isGM) {
    const allEntries = getAllStoredMessageEntriesForGM();
    const threads = summarizeAllPhoneThreads(allEntries, getStoredPhoneGroups());
    const totalCount = threads.reduce((sum, t) => sum + t.count, 0);

    return `
      <div class="cd-phone-app-view">
        <div class="cd-phone-app-header">
          <button type="button" class="cd-phone-inline-btn" data-settings-back><i class="fa-solid fa-chevron-left"></i> Settings</button>
          <span class="cd-phone-header-sub">Manage Messages</span>
          ${threads.length > 0 ? `<button type="button" class="cd-phone-inline-btn is-danger" data-gm-delete-all-msgs title="Delete all messages"><i class="fa-solid fa-trash-can"></i> Delete All</button>` : ""}
        </div>
        <div class="cd-phone-list">
          ${threads.length === 0
        ? `<div class="cd-phone-empty">No stored message threads.</div>`
        : threads.map((t) => {
          const label = formatGmThreadParticipantsLabel(t);
          return `
                <div class="cd-phone-list-item">
                  <div class="cd-phone-list-meta">
                    <div class="cd-phone-list-title">${escapeHtml(label)}</div>
                    <div class="cd-phone-list-sub">${t.count} message${t.count === 1 ? "" : "s"}</div>
                  </div>
                  <button type="button" class="cd-phone-inline-btn is-danger" data-gm-delete-thread="${escapeHtml(t.threadKey)}" data-gm-delete-label="${escapeHtml(label)}" data-gm-delete-count="${t.count}" title="Delete thread permanently">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              `;
        }).join("")}
        </div>
        ${_gmConfirmDeleteTarget ? `
          <div class="cd-phone-modal-backdrop">
            <div class="cd-phone-modal">
              <div class="cd-phone-modal-title">${_gmConfirmDeleteTarget.type === "all" ? "Delete All Messages?" : "Delete Thread?"}</div>
              <div class="cd-phone-modal-body">${_gmConfirmDeleteTarget.type === "all"
          ? `This permanently deletes all ${totalCount} stored message(s) across every thread from the Messages Journal and chat log.`
          : `This permanently deletes all ${_gmConfirmDeleteTarget.count} message(s) in "${escapeHtml(_gmConfirmDeleteTarget.label)}" from the Messages Journal and chat log.`}</div>
              <div class="cd-phone-modal-actions">
                <button type="button" class="cd-phone-modal-btn" data-gm-delete-cancel>Cancel</button>
                <button type="button" class="cd-phone-modal-btn is-danger" data-gm-delete-confirm>Delete</button>
              </div>
            </div>
          </div>
        ` : ""}
      </div>
    `;
  }

  if (_settingsSubmenu === "manage-profiles" && game?.user?.isGM) {
    const users = Array.from(game?.users?.contents || []).map((u) => {
      const modFlags = u?.flags?.[MODULE_ID] || {};
      const hasUserFlags = USER_PHONE_FLAGS.some((flagKey) => modFlags[flagKey] !== undefined && modFlags[flagKey] !== null);
      return { id: u.id, name: u.name, isGM: Boolean(u.isGM), hasUserFlags };
    });
    const albums = Array.from(game?.journal?.contents || [])
      .map((j) => {
        const uid = j?.getFlag?.(MODULE_ID, ALBUM_USER_FLAG) ?? j?.flags?.[MODULE_ID]?.[ALBUM_USER_FLAG];
        if (!uid) return null;
        return { userId: String(uid), photoCount: j?.pages?.size || 0 };
      })
      .filter(Boolean);
    const profiles = collectPhoneProfileSummaries({
      users,
      albums,
      messages: getAllStoredMessageEntriesForGM(),
      groups: getStoredPhoneGroups()
    });

    return `
      <div class="cd-phone-app-view">
        <div class="cd-phone-app-header">
          <button type="button" class="cd-phone-inline-btn" data-settings-back><i class="fa-solid fa-chevron-left"></i> Settings</button>
          <span class="cd-phone-header-sub">Manage Profiles</span>
        </div>
        <div class="cd-phone-list">
          ${profiles.length === 0
        ? `<div class="cd-phone-empty">No player profiles found.</div>`
        : profiles.map((p) => {
          const parts = [];
          if (p.photoCount > 0) parts.push(`${p.photoCount} photo${p.photoCount === 1 ? "" : "s"}`);
          if (p.dmThreadCount > 0) parts.push(`${p.dmThreadCount} thread${p.dmThreadCount === 1 ? "" : "s"}`);
          if (p.groupCount > 0) parts.push(`${p.groupCount} group${p.groupCount === 1 ? "" : "s"}`);
          if (p.hasUserFlags) parts.push("Saved prefs");
          const summary = parts.length > 0 ? parts.join(" &bull; ") : "No phone data";
          const hasData = parts.length > 0;
          return `
                <div class="cd-phone-list-item">
                  <div class="cd-phone-list-meta">
                    <div class="cd-phone-list-title">${escapeHtml(p.name)}${p.isOrphan ? " (Left)" : ""}</div>
                    <div class="cd-phone-list-sub">${summary}</div>
                  </div>
                  <button type="button" class="cd-phone-inline-btn is-danger" data-gm-delete-profile="${escapeHtml(p.userId)}" data-gm-delete-label="${escapeHtml(p.name)}" title="Remove player phone data" ${hasData ? "" : "disabled"}>
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              `;
        }).join("")}
        </div>
        ${_gmConfirmDeleteTarget?.type === "profile" ? `
          <div class="cd-phone-modal-backdrop">
            <div class="cd-phone-modal">
              <div class="cd-phone-modal-title">Remove Phone Profile?</div>
              <div class="cd-phone-modal-body">This permanently deletes "${escapeHtml(_gmConfirmDeleteTarget.label)}"'s Photo Album, DM/NPC message threads, group memberships, and saved phone preferences (wallpaper, position, app order, contact nicknames/colors, hidden threads).<br><br><strong>Kept:</strong> personal Notes and shared Academy/world journals.</div>
              <div class="cd-phone-modal-actions">
                <button type="button" class="cd-phone-modal-btn" data-gm-delete-cancel>Cancel</button>
                <button type="button" class="cd-phone-modal-btn is-danger" data-gm-delete-confirm>Remove</button>
              </div>
            </div>
          </div>
        ` : ""}
      </div>
    `;
  }

  if (_settingsSubmenu === "wallpaper") {
    const isPhoneTab = _wallpaperTab === "phone";
    const activePresets = isPhoneTab ? PHONE_COLOR_PRESETS : WALLPAPER_PRESETS;
    const activeColor = isPhoneTab ? currentBezel : currentColor;

    return `
      <div class="cd-phone-app-view">
        <div class="cd-phone-app-header">
          <button type="button" class="cd-phone-inline-btn" data-settings-back><i class="fa-solid fa-chevron-left"></i> Settings</button>
          <span class="cd-phone-header-sub">Appearance</span>
        </div>
        <div class="cd-phone-list">
          <div class="cd-phone-seg-tabs">
            <button type="button" class="cd-phone-seg-tab ${!isPhoneTab ? "is-active" : ""}" data-wp-tab="background">Background</button>
            <button type="button" class="cd-phone-seg-tab ${isPhoneTab ? "is-active" : ""}" data-wp-tab="phone">Phone Color</button>
          </div>

          <div class="cd-phone-section-title">${isPhoneTab ? "Phone Color Presets" : "Background Presets"}</div>
          <div class="cd-phone-swatch-grid">
            ${activePresets.map((p) => {
      const isSelected = isPhoneTab
        ? (wp.bezelColor === p.value)
        : (wp.bgType === "preset" && wp.bgId === p.id);
      return `
                <button type="button"
                  class="cd-phone-swatch ${isSelected ? "is-selected" : ""}"
                  data-active-preset="${p.id}"
                  title="${escapeHtml(p.label)}"
                  style="background:${escapeHtml(p.value)};">
                </button>
              `;
    }).join("")}
          </div>

          <div class="cd-phone-section-title">Custom</div>
          <div class="cd-phone-wallpaper-controls">
            <label class="cd-phone-list-item cd-phone-setting-btn" title="${isPhoneTab ? "Pick Phone Color" : "Pick Background Color"}">
              <div class="cd-phone-list-meta">
                <div class="cd-phone-list-title"><i class="fa-solid fa-palette"></i> Color</div>
              </div>
              <input type="color" class="cd-phone-color-input" data-active-color value="${escapeHtml(activeColor)}" />
            </label>
            <button type="button" class="cd-phone-list-item cd-phone-setting-btn" data-active-reset-color title="${isPhoneTab ? "Reset Phone Color" : "Reset Background Color"}">
              <div class="cd-phone-list-meta">
                <div class="cd-phone-list-title"><i class="fa-solid fa-rotate-left"></i> Reset Colors</div>
              </div>
            </button>
          </div>

          ${!isPhoneTab ? `
            <div class="cd-phone-section-title">Wallpaper Image</div>
            <div class="cd-phone-wallpaper-controls">
              <label class="cd-phone-list-item cd-phone-setting-btn is-accent" title="Upload Custom Wallpaper">
                <div class="cd-phone-list-meta">
                  <div class="cd-phone-list-title"><i class="fa-solid fa-upload"></i> Upload</div>
                </div>
                <input type="file" accept="image/*" data-wallpaper-upload hidden />
              </label>
              <button type="button" class="cd-phone-list-item cd-phone-setting-btn ${hasImage ? "is-danger" : ""}" data-wallpaper-clear-image ${hasImage ? "" : "disabled"} title="Remove Wallpaper Image">
                <div class="cd-phone-list-meta">
                  <div class="cd-phone-list-title"><i class="fa-solid fa-trash"></i> Remove</div>
                </div>
              </button>
            </div>
          ` : ""}
        </div>
      </div>
    `;
  }

  const wpLabel = hasImage ? "Custom Image" : wp.bgType === "color" ? wp.bgValue : (WALLPAPER_PRESETS.find((p) => p.id === wp.bgId)?.label || "Default");
  const isPlayer = !game?.user?.isGM;
  const hideSidebarDefault = getHideSidebarForPlayersSetting();
  const playerShowSidebar = getPlayerShowSidebarSetting();

  return `
    <div class="cd-phone-app-view">
      <div class="cd-phone-app-header">
        <span><i class="fa-solid fa-gear"></i> Settings</span>
      </div>
      <div class="cd-phone-list">
        <div class="cd-phone-list-item">
          <div class="cd-phone-list-meta">
            <div class="cd-phone-list-title">Device Owner</div>
            <div class="cd-phone-list-sub">${escapeHtml(charName)}</div>
          </div>
        </div>

        <div class="cd-phone-list-item">
          <div class="cd-phone-list-meta">
            <div class="cd-phone-list-title">Network</div>
            <div class="cd-phone-list-sub">${escapeHtml(PHONE_THEMES.ios.signal)} &bull; No Earth Signal</div>
          </div>
        </div>

        ${isPlayer && hideSidebarDefault ? `
          <button type="button" class="cd-phone-list-item ${playerShowSidebar ? "is-selected" : ""}" data-toggle-player-sidebar>
            <div class="cd-phone-list-meta">
              <div class="cd-phone-list-title">Show Right Sidebar</div>
              <div class="cd-phone-list-sub">${playerShowSidebar ? "Visible for you" : "Hidden by default"}</div>
            </div>
            <span class="cd-phone-toggle-pill ${playerShowSidebar ? "is-on" : ""}">${playerShowSidebar ? "On" : "Off"}</span>
          </button>
        ` : ""}

        <button type="button" class="cd-phone-list-item" data-open-game-settings>
          <div class="cd-phone-list-meta">
            <div class="cd-phone-list-title">Game Settings</div>
            <div class="cd-phone-list-sub">Foundry &amp; module configuration</div>
          </div>
          <i class="fa-solid fa-chevron-right"></i>
        </button>

        <button type="button" class="cd-phone-list-item" data-settings-sub="wallpaper">
          <div class="cd-phone-list-meta">
            <div class="cd-phone-list-title">Wallpaper &amp; Background</div>
            <div class="cd-phone-list-sub">${escapeHtml(wpLabel)}</div>
          </div>
          <i class="fa-solid fa-chevron-right"></i>
        </button>

        <button type="button" class="cd-phone-list-item" data-open-photo-cloud>
          <div class="cd-phone-list-meta">
            <div class="cd-phone-list-title">Photo Cloud</div>
            <div class="cd-phone-list-sub">${cloudCount} saved photo(s)</div>
          </div>
          <i class="fa-solid fa-chevron-right"></i>
        </button>

        ${game?.user?.isGM ? `
          <button type="button" class="cd-phone-list-item" data-settings-sub="manage-apps">
            <div class="cd-phone-list-meta">
              <div class="cd-phone-list-title">Manage Apps</div>
              <div class="cd-phone-list-sub">Toggle player app visibility (GM)</div>
            </div>
            <i class="fa-solid fa-chevron-right"></i>
          </button>
          <button type="button" class="cd-phone-list-item" data-settings-sub="manage-messages">
            <div class="cd-phone-list-meta">
              <div class="cd-phone-list-title">Manage Messages</div>
              <div class="cd-phone-list-sub">View threads &amp; delete history (GM)</div>
            </div>
            <i class="fa-solid fa-chevron-right"></i>
          </button>
          <button type="button" class="cd-phone-list-item" data-settings-sub="manage-profiles">
            <div class="cd-phone-list-meta">
              <div class="cd-phone-list-title">Manage Profiles</div>
              <div class="cd-phone-list-sub">Remove player phone data (GM)</div>
            </div>
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        ` : ""}

        <button type="button" class="cd-phone-list-item is-danger" data-foundry-logout>
          <div class="cd-phone-list-meta">
            <div class="cd-phone-list-title">Log Out</div>
            <div class="cd-phone-list-sub">Return to Foundry login screen</div>
          </div>
          <i class="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>
    </div>
  `;
}

function bindHomeAppArrangeEvents(root) {
  const home = root?.querySelector?.(".cd-phone-home");
  const grid = home?.querySelector?.(".cd-phone-app-grid");
  if (!home || !grid) return;

  let suppressNextClick = false;
  let activeDragCleanup = null;

  const enterEditModeInPlace = () => {
    if (_homeEditMode) return;
    _homeEditMode = true;
    grid.classList.add("is-editing");
    grid.querySelectorAll(".cd-phone-app-tile").forEach((el) => el.classList.add("is-editing"));
    const header = home.querySelector(".cd-phone-section-header");
    if (header && !header.querySelector("[data-phone-home-done]")) {
      const doneBtn = document.createElement("button");
      doneBtn.type = "button";
      doneBtn.className = "cd-phone-home-done-btn";
      doneBtn.setAttribute("data-phone-home-done", "");
      doneBtn.textContent = "Done";
      doneBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        _homeEditMode = false;
        renderPhoneContents();
      });
      header.appendChild(doneBtn);
    }
  };

  const getGridOrder = () => Array.from(grid.querySelectorAll(".cd-phone-app-tile[data-app]"))
    .map((el) => el.getAttribute("data-app"))
    .filter(Boolean);

  const findTileAtPoint = (clientX, clientY) => {
    const tiles = Array.from(grid.querySelectorAll(".cd-phone-app-tile[data-app]"));
    for (const tile of tiles) {
      const rect = tile.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
        return tile;
      }
    }
    return null;
  };

  home.querySelector("[data-phone-home-done]")?.addEventListener("click", (ev) => {
    ev.stopPropagation();
    _homeEditMode = false;
    renderPhoneContents();
  });

  home.addEventListener("click", (ev) => {
    if (!_homeEditMode) return;
    if (suppressNextClick) {
      suppressNextClick = false;
      return;
    }
    const target = ev.target;
    if (target?.closest?.(".cd-phone-app-tile, [data-phone-home-done], .cd-phone-hero-card, .cd-phone-actor-picker-card")) {
      return;
    }
    _homeEditMode = false;
    renderPhoneContents();
  });

  grid.querySelectorAll(".cd-phone-app-tile[data-app]").forEach((tile) => {
    tile.addEventListener("pointerdown", (ev) => {
      if (ev.pointerType === "mouse" && ev.button !== 0) return;
      if (activeDragCleanup) activeDragCleanup();

      const appId = tile.getAttribute("data-app");
      if (!appId) return;

      const startX = ev.clientX;
      const startY = ev.clientY;
      let isDragging = _homeEditMode;
      let didReorder = false;
      let longPressTimer = null;

      if (_homeEditMode) {
        tile.classList.add("is-dragging");
      } else {
        longPressTimer = setTimeout(() => {
          longPressTimer = null;
          enterEditModeInPlace();
          isDragging = true;
          suppressNextClick = true;
          tile.classList.add("is-dragging");
        }, 400);
      }

      const onPointerMove = (moveEv) => {
        const dx = moveEv.clientX - startX;
        const dy = moveEv.clientY - startY;
        const dist = Math.hypot(dx, dy);

        if (!isDragging) {
          if (dist > 8 && longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
          }
          return;
        }

        if (dist > 4) suppressNextClick = true;
        const targetTile = findTileAtPoint(moveEv.clientX, moveEv.clientY);
        const targetId = targetTile?.getAttribute("data-app");
        if (!targetId || targetId === appId) return;

        const currentOrder = getGridOrder();
        const nextOrder = reorderPhoneAppIds(currentOrder, appId, targetId);
        if (nextOrder.join("|") === currentOrder.join("|")) return;

        const tileMap = new Map(
          Array.from(grid.querySelectorAll(".cd-phone-app-tile[data-app]"))
            .map((el) => [el.getAttribute("data-app"), el])
        );
        for (const id of nextOrder) {
          const el = tileMap.get(id);
          if (el) grid.appendChild(el);
        }
        didReorder = true;
      };

      const finish = async () => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", finish);
        window.removeEventListener("pointercancel", finish);
        activeDragCleanup = null;

        tile.classList.remove("is-dragging");
        if (didReorder) {
          suppressNextClick = true;
          const visibleOrder = getGridOrder();
          const merged = mergeVisibleAppOrder(getSavedPhoneAppOrder(), visibleOrder);
          await savePhoneAppOrder(merged);
        }
      };

      activeDragCleanup = finish;
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", finish);
      window.addEventListener("pointercancel", finish);
    });
  });

  grid.dataset.suppressClickCheck = "1";
  grid._consumeSuppressClick = () => {
    if (!suppressNextClick) return false;
    suppressNextClick = false;
    return true;
  };
}

function bindPhoneEvents(root) {
  bindHomeAppArrangeEvents(root);

  root.querySelectorAll("[data-app]").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      const grid = btn.closest(".cd-phone-app-grid");
      if (_homeEditMode && grid) {
        ev.preventDefault();
        ev.stopPropagation();
        return;
      }
      if (grid?._consumeSuppressClick?.()) {
        ev.preventDefault();
        ev.stopPropagation();
        return;
      }
      const nextApp = btn.getAttribute("data-app") || "home";
      if (!game?.user?.isGM && nextApp !== "home" && getDisabledPlayerAppIds().includes(nextApp)) {
        return;
      }
      if (nextApp === "combat") {
        openCombatEncounterWindow();
        return;
      }
      if (nextApp === "dice-stuff") {
        if (typeof window.CustomRolls?.openActionDialog === "function") {
          const ownerActor = getActivePhoneActor();
          window.CustomRolls.openActionDialog("d20", ownerActor);
        } else {
          ui?.notifications?.warn?.("Dice Stuff (Custom Roll Dialogs) is not enabled.");
        }
        return;
      }
      navigateToPhoneRoute({
        app: nextApp,
        settingsSubmenu: null,
        selectedPhotoId: null,
        photosFilter: nextApp === "photos" ? "all" : _photosFilter,
        messageThreadId: nextApp === "messages" ? null : _messageThreadId,
        selectedNoteId: nextApp === "notes" ? null : _selectedNoteId
      });
    });
  });

  root.querySelector('[data-phone-pulldown-toggle]')?.addEventListener("click", (ev) => {
    ev.stopPropagation();
    _pulldownOpen = !_pulldownOpen;
    if (_pulldownOpen) _diceTrayOpen = false;
    else _actorPickerOpen = false;
    renderPhoneContents();
  });

  root.querySelectorAll('[data-phone-pulldown-close]').forEach((el) => {
    el.addEventListener("click", () => {
      _pulldownOpen = false;
      _actorPickerOpen = false;
      renderPhoneContents();
    });
  });

  root.querySelector('[data-phone-pulldown-clear]')?.addEventListener("click", () => {
    _unreadByThread = {};
    _unreadRolls = 0;
    syncUnreadMessagesCount();
    renderPhoneContents();
  });

  root.querySelectorAll('[data-phone-notif-thread]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const threadId = btn.getAttribute("data-phone-notif-thread");
      if (!threadId) return;
      _pulldownOpen = false;
      _actorPickerOpen = false;
      markThreadRead(threadId);
      navigateToPhoneRoute({
        app: "messages",
        messageThreadId: threadId,
        messageComposing: false,
        composeNpcId: null
      });
    });
  });

  root.querySelector('[data-phone-notif-syslog]')?.addEventListener("click", () => {
    _pulldownOpen = false;
    _actorPickerOpen = false;
    _unreadRolls = 0;
    navigateToPhoneRoute({ app: "system-log" });
  });

  root.querySelector('[data-phone-actor-picker-toggle]')?.addEventListener("click", () => {
    _actorPickerOpen = !_actorPickerOpen;
    renderPhoneContents();
  });

  root.querySelector('[data-phone-actor-picker-close]')?.addEventListener("click", () => {
    _actorPickerOpen = false;
    renderPhoneContents();
  });

  root.querySelectorAll('[data-phone-select-actor]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextActorId = btn.getAttribute("data-phone-select-actor") || null;
      _selectedPhoneActorId = nextActorId;
      _actorPickerOpen = false;
      renderPhoneContents();
    });
  });

  root.querySelector('[data-nav="home"]')?.addEventListener("click", () => {
    navigateHomePhone();
  });

  root.querySelector('[data-nav="back"]')?.addEventListener("click", () => {
    navigateBackPhone();
  });

  root.querySelector('[data-nav="dice-tray"]')?.addEventListener("click", () => {
    _diceTrayOpen = !_diceTrayOpen;
    refreshPhoneDiceTrayDom(root);
  });

  bindPhoneDiceTrayEvents(root);

  const composerForm = root.querySelector('[data-compose="text"]');
  const composerInput = composerForm?.querySelector('textarea[name="text"]');
  const autoResizeComposer = (el) => {
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = Math.ceil(3 * 1.35 * 12 + 14);
    const nextHeight = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  };
  const syncComposerCursor = () => {
    if (!composerInput) return;
    _msgTextDraft = composerInput.value;
    if (typeof composerInput.selectionStart === "number") {
      _msgSelectionStart = composerInput.selectionStart;
      _msgSelectionEnd = composerInput.selectionEnd ?? composerInput.selectionStart;
    }
  };
  autoResizeComposer(composerInput);
  composerInput?.addEventListener("input", () => {
    syncComposerCursor();
    autoResizeComposer(composerInput);
  });
  composerInput?.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" && !ev.shiftKey && !ev.isComposing) {
      ev.preventDefault();
      composerForm?.requestSubmit();
    }
  });
  composerInput?.addEventListener("keyup", syncComposerCursor);
  composerInput?.addEventListener("click", syncComposerCursor);
  composerInput?.addEventListener("blur", syncComposerCursor);

  composerForm?.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const input = ev.currentTarget.querySelector('textarea[name="text"]');
    const text = input?.value?.trim() || "";
    const staged = _msgStagedImage;
    if (!text && !staged) return;
    const content = buildPhoneMessageHtml({ text, imageSrc: staged?.src || "" });
    if (!content) return;
    const ephemeral = staged?.source === "url";
    if (input) {
      input.value = "";
      autoResizeComposer(input);
    }
    _msgTextDraft = "";
    _msgSelectionStart = null;
    _msgSelectionEnd = null;
    _msgStagedImage = null;
    _msgFlyoutOpen = false;
    if (_messageThreadId && String(_messageThreadId).startsWith("group:")) {
      const groupId = String(_messageThreadId).slice(6);
      const group = getPhoneGroupById(groupId);
      const whisper = getGroupWhisperRecipients(group);
      const replyNpcId = resolveGroupReplyAsNpcId(group, _messageThreadId, Boolean(game?.user?.isGM), String(game?.user?.id || ""));
      await sendPhoneMessage({ content, whisper, groupId, npcId: replyNpcId, ephemeral });
      return;
    }
    if (_messageThreadId && String(_messageThreadId).startsWith("npc:")) {
      const [, npcId, threadPlayerId, threadActorId] = String(_messageThreadId).split(":");
      await sendPhoneMessage({
        content,
        npcId,
        playerUserId: threadPlayerId || game?.user?.id || "",
        playerActorId: threadActorId || (!game?.user?.isGM ? (getActivePhoneActor()?.id || "") : ""),
        ephemeral
      });
      return;
    }
    if (_messageThreadId && String(_messageThreadId).startsWith("pc:")) {
      const [, senderActorId, targetUserId, targetActorId] = String(_messageThreadId).split(":");
      await sendPhoneMessage({
        content,
        whisper: targetUserId ? [targetUserId] : [],
        senderActorId: senderActorId || (!game?.user?.isGM ? (getActivePhoneActor()?.id || "") : ""),
        targetActorId: targetActorId || "",
        ephemeral
      });
      return;
    }
    const whisper = (_messageThreadId && _messageThreadId !== "all") ? [_messageThreadId] : [];
    const senderActorId = !game?.user?.isGM ? (getActivePhoneActor()?.id || "") : "";
    await sendPhoneMessage({ content, whisper, senderActorId, ephemeral });
  });

  root.querySelector("[data-msg-flyout-toggle]")?.addEventListener("click", () => {
    const input = root.querySelector('[data-compose="text"] textarea[name="text"]');
    if (input) {
      _msgTextDraft = input.value;
      if (document.activeElement === input && typeof input.selectionStart === "number") {
        _msgSelectionStart = input.selectionStart;
        _msgSelectionEnd = input.selectionEnd ?? input.selectionStart;
      }
    }
    _msgFlyoutOpen = !_msgFlyoutOpen;
    renderPhoneContents();
  });

  root.querySelectorAll("[data-msg-emoji-pick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const emoji = btn.getAttribute("data-msg-emoji-pick") || "";
      const input = root.querySelector('[data-compose="text"] textarea[name="text"]');
      if (input && emoji) {
        const val = input.value;
        const start = typeof _msgSelectionStart === "number" ? Math.min(_msgSelectionStart, val.length) : val.length;
        const end = typeof _msgSelectionEnd === "number" ? Math.min(_msgSelectionEnd, val.length) : start;
        input.value = val.slice(0, start) + emoji + val.slice(end);
        _msgTextDraft = input.value;
        const nextPos = start + emoji.length;
        _msgSelectionStart = nextPos;
        _msgSelectionEnd = nextPos;
        autoResizeComposer(input);
        input.focus();
        input.setSelectionRange?.(nextPos, nextPos);
        recordRecentPhoneEmoji(emoji);
      }
    });
  });

  root.querySelectorAll("[data-msg-react-open]").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const id = btn.getAttribute("data-msg-react-open");
      _msgReactingToId = _msgReactingToId === id ? null : id;
      renderPhoneContents();
    });
  });

  root.querySelectorAll("[data-msg-react-pick]").forEach((btn) => {
    btn.addEventListener("click", async (ev) => {
      ev.stopPropagation();
      const emoji = btn.getAttribute("data-msg-react-pick") || "";
      const messageId = btn.getAttribute("data-msg-id") || "";
      _msgReactingToId = null;
      await togglePhoneMessageReaction({ messageId, emoji });
    });
  });

  root.querySelectorAll("[data-msg-flyout-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = root.querySelector('[data-compose="text"] textarea[name="text"]');
      if (input) _msgTextDraft = input.value;
      _msgFlyoutTab = btn.getAttribute("data-msg-flyout-tab") || "emoji";
      _msgUrlError = "";
      renderPhoneContents();
    });
  });

  root.querySelectorAll("[data-msg-pick-album]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-msg-pick-album");
      const photo = getCombinedPhotos().find((p) => p.id === id);
      if (!photo) return;
      const input = root.querySelector('[data-compose="text"] textarea[name="text"]');
      if (input) _msgTextDraft = input.value;
      _msgStagedImage = { src: photo.dataUrl, source: "album", label: "Photo Album" };
      _msgFlyoutOpen = false;
      renderPhoneContents();
    });
  });

  const urlInput = root.querySelector("[data-msg-url-input]");
  urlInput?.addEventListener("input", () => {
    _msgUrlDraft = urlInput.value;
    _msgUrlError = "";
    const safeUrl = sanitizePhoneImageUrl(_msgUrlDraft);
    const attachBtn = root.querySelector("[data-msg-url-attach]");
    if (attachBtn) attachBtn.disabled = !safeUrl;
    const previewWrap = root.querySelector(".cd-phone-url-preview");
    if (safeUrl) {
      if (previewWrap) {
        const img = previewWrap.querySelector("img");
        if (img) img.src = safeUrl;
      } else {
        renderPhoneContents();
        const reInput = document.getElementById(WIDGET_ID)?.querySelector("[data-msg-url-input]");
        if (reInput) {
          reInput.focus();
          reInput.setSelectionRange?.(reInput.value.length, reInput.value.length);
        }
      }
    } else if (previewWrap) {
      renderPhoneContents();
    }
  });

  const urlPreviewImg = root.querySelector("[data-msg-url-preview]");
  urlPreviewImg?.addEventListener("error", () => {
    _msgUrlError = "Couldn't load image. Try a direct image link (.png, .jpg, .webp, .gif).";
    const errEl = root.querySelector(".cd-phone-url-error");
    if (errEl) errEl.textContent = _msgUrlError;
    else renderPhoneContents();
  });

  root.querySelector("[data-msg-url-attach]")?.addEventListener("click", () => {
    const safeUrl = sanitizePhoneImageUrl(_msgUrlDraft);
    if (!safeUrl) {
      _msgUrlError = "Please enter a valid http:// or https:// image URL.";
      renderPhoneContents();
      return;
    }
    const input = root.querySelector('[data-compose="text"] textarea[name="text"]');
    if (input) _msgTextDraft = input.value;
    _msgStagedImage = { src: safeUrl, source: "url", label: "Web Image" };
    _msgFlyoutOpen = false;
    _msgUrlDraft = "";
    _msgUrlError = "";
    renderPhoneContents();
  });

  root.querySelector("[data-msg-clear-staged]")?.addEventListener("click", () => {
    _msgStagedImage = null;
    renderPhoneContents();
  });

  root.querySelectorAll(".cd-phone-info-badge").forEach((badge) => {
    badge.addEventListener("click", (ev) => {
      ev.stopPropagation();
      badge.classList.toggle("is-open");
    });
  });

  root.querySelectorAll("[data-msg-reply-as]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!_messageThreadId) return;
      _groupReplyAsNpcByThread[_messageThreadId] = btn.getAttribute("data-msg-reply-as") || "";
      renderPhoneContents();
    });
  });

  root.querySelector("[data-msg-compose]")?.addEventListener("click", () => {
    _composeGroupMode = false;
    _composeGroupName = "";
    _composeGroupMemberIds = new Set();
    _composeGroupNpcIds = new Set();
    navigateToPhoneRoute({
      app: "messages",
      messageThreadId: null,
      messageComposing: true,
      composeNpcId: null
    });
  });

  root.querySelector("[data-msg-toggle-group-mode]")?.addEventListener("click", () => {
    _composeGroupMode = !_composeGroupMode;
    if (!_composeGroupMode) {
      _composeGroupName = "";
      _composeGroupMemberIds = new Set();
      _composeGroupNpcIds = new Set();
    }
    renderPhoneContents();
  });

  root.querySelector("[data-msg-group-name]")?.addEventListener("input", (ev) => {
    _composeGroupName = ev.currentTarget.value;
  });

  root.querySelectorAll("[data-msg-group-toggle-user]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const uid = btn.getAttribute("data-msg-group-toggle-user");
      if (!uid) return;
      if (_composeGroupMemberIds.has(uid)) _composeGroupMemberIds.delete(uid);
      else _composeGroupMemberIds.add(uid);
      renderPhoneContents();
    });
  });

  root.querySelectorAll("[data-msg-group-toggle-npc]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const aid = btn.getAttribute("data-msg-group-toggle-npc");
      if (!aid) return;
      if (_composeGroupNpcIds.has(aid)) _composeGroupNpcIds.delete(aid);
      else _composeGroupNpcIds.add(aid);
      renderPhoneContents();
    });
  });

  root.querySelector("[data-msg-group-create]")?.addEventListener("click", async () => {
    const currentId = String(game?.user?.id || "");
    const memberIds = Array.from(new Set([currentId, ..._composeGroupMemberIds].filter(Boolean)));
    const npcIds = Array.from(_composeGroupNpcIds);
    if (memberIds.length + npcIds.length < 2 && npcIds.length === 0) return;
    const group = await createPhoneGroup({
      name: _composeGroupName,
      memberIds,
      npcIds
    });
    _composeGroupMode = false;
    _composeGroupName = "";
    _composeGroupMemberIds = new Set();
    _composeGroupNpcIds = new Set();
    if (!group?.id) return;
    const threadId = `group:${group.id}`;
    await setThreadHiddenState(threadId, 0);
    navigateToPhoneRoute({
      app: "messages",
      messageThreadId: threadId,
      messageComposing: false,
      composeNpcId: null
    });
  });

  root.querySelector("[data-msg-compose-back]")?.addEventListener("click", () => {
    navigateBackPhone();
  });

  root.querySelectorAll("[data-msg-compose-npc]").forEach((btn) => {
    btn.addEventListener("click", () => {
      navigateToPhoneRoute({
        app: "messages",
        messageThreadId: null,
        messageComposing: true,
        composeNpcId: btn.getAttribute("data-msg-compose-npc") || null
      });
    });
  });

  root.querySelectorAll("[data-msg-thread]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const threadId = btn.getAttribute("data-msg-thread") || "all";
      await setThreadHiddenState(threadId, 0);
      markThreadRead(threadId);
      _confirmHideThreadId = null;
      navigateToPhoneRoute({
        app: "messages",
        messageThreadId: threadId,
        messageComposing: false,
        composeNpcId: null
      });
    });
  });

  root.querySelector("[data-msg-confirm-hide]")?.addEventListener("click", () => {
    _confirmHideThreadId = _messageThreadId;
    renderPhoneContents();
  });

  root.querySelector("[data-msg-hide-cancel]")?.addEventListener("click", () => {
    _confirmHideThreadId = null;
    renderPhoneContents();
  });

  root.querySelector("[data-msg-hide-confirm]")?.addEventListener("click", async () => {
    const targetId = _messageThreadId;
    _confirmHideThreadId = null;
    if (targetId && targetId !== "all") {
      await setThreadHiddenState(targetId, Date.now());
      markThreadRead(targetId);
    }
    _navHistory = [];
    applyPhoneRoute({
      app: "messages",
      messageThreadId: null,
      messageComposing: false,
      composeNpcId: null
    });
    renderPhoneContents();
  });

  root.querySelector("[data-msg-back]")?.addEventListener("click", () => {
    navigateBackPhone();
  });

  root.querySelectorAll("[data-contact-detail]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const contactKey = btn.getAttribute("data-contact-detail");
      if (contactKey) {
        navigateToPhoneRoute({ app: "contacts", contactDetailKey: contactKey });
      }
    });
  });

  root.querySelector("[data-contact-detail-back]")?.addEventListener("click", () => {
    navigateBackPhone();
  });

  root.querySelectorAll("[data-contact-nickname-save]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const contactKey = btn.getAttribute("data-contact-nickname-save");
      const inp = root.querySelector("[data-contact-nickname-input]");
      if (contactKey && inp) {
        await setPhoneContactNicknameOverride(contactKey, inp.value);
        renderPhoneContents();
      }
    });
  });

  root.querySelectorAll("[data-contact-nickname-input]").forEach((inp) => {
    inp.addEventListener("keydown", async (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      const contactKey = inp.getAttribute("data-contact-nickname-input");
      if (contactKey) {
        await setPhoneContactNicknameOverride(contactKey, inp.value);
        renderPhoneContents();
      }
    });
  });

  root.querySelectorAll("[data-contact-nickname-reset]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const contactKey = btn.getAttribute("data-contact-nickname-reset");
      if (contactKey) {
        await setPhoneContactNicknameOverride(contactKey, "");
        renderPhoneContents();
      }
    });
  });

  root.querySelectorAll("[data-npc-access-mode]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const [actorId, mode] = String(btn.getAttribute("data-npc-access-mode") || "").split(":");
      if (!actorId || !mode) return;
      if (mode === "off") {
        _npcAccessSelectDraftIds.delete(actorId);
        await setNpcContactAccessAsGM(actorId, null);
      } else if (mode === "all") {
        _npcAccessSelectDraftIds.delete(actorId);
        await setNpcContactAccessAsGM(actorId, "all");
      } else if (mode === "select") {
        _npcAccessSelectDraftIds.add(actorId);
        const accessMap = getNpcContactAccessMap();
        if (accessMap[actorId] === "all") {
          const allPlayerIds = Array.from(game?.users?.contents || []).filter((u) => !u.isGM).map((u) => u.id);
          await setNpcContactAccessAsGM(actorId, allPlayerIds);
        } else {
          renderPhoneContents();
        }
      }
    });
  });

  root.querySelectorAll("[data-npc-access-player]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const [actorId, userId] = String(btn.getAttribute("data-npc-access-player") || "").split(":");
      if (!actorId || !userId) return;
      _npcAccessSelectDraftIds.add(actorId);
      await toggleNpcContactPlayerAsGM(actorId, userId);
    });
  });

  root.querySelectorAll("[data-contacts-msg]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const threadId = btn.getAttribute("data-contacts-msg") || "all";
      await setThreadHiddenState(threadId, 0);
      navigateToPhoneRoute({
        app: "messages",
        messageThreadId: threadId,
        messageComposing: false,
        composeNpcId: null,
        contactDetailKey: null
      });
    });
  });

  root.querySelectorAll("[data-contacts-npc-gm]").forEach((btn) => {
    btn.addEventListener("click", () => {
      navigateToPhoneRoute({
        app: "messages",
        messageThreadId: null,
        messageComposing: true,
        composeNpcId: btn.getAttribute("data-contacts-npc-gm") || null,
        contactDetailKey: null
      });
    });
  });

  root.querySelectorAll("[data-contact-color]").forEach((inp) => {
    inp.addEventListener("change", async () => {
      const contactKey = inp.getAttribute("data-contact-color");
      if (contactKey) {
        await setPhoneContactColorOverride(contactKey, inp.value);
        renderPhoneContents();
      }
    });
  });

  root.querySelectorAll("[data-contact-color-reset]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const contactKey = btn.getAttribute("data-contact-color-reset");
      if (contactKey) {
        await setPhoneContactColorOverride(contactKey, "");
        renderPhoneContents();
      }
    });
  });

  root.querySelectorAll("[data-open-actor]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const actor = game.actors?.get(btn.getAttribute("data-open-actor"));
      actor?.sheet?.render(true);
    });
  });

  root.querySelectorAll("[data-open-journal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const journal = game.journal?.get(btn.getAttribute("data-open-journal"));
      journal?.sheet?.render(true);
    });
  });

  // Notes App Events
  root.querySelector("[data-note-new]")?.addEventListener("click", async () => {
    const nextNotes = upsertPhoneNote(getSavedPhoneNotes(), { title: "", body: "" });
    const created = nextNotes.find((n) => !getSavedPhoneNotes().some((old) => old.id === n.id)) || nextNotes[0];
    await savePhoneNotes(nextNotes);
    _confirmDeleteNoteId = null;
    navigateToPhoneRoute({ app: "notes", selectedNoteId: created?.id || null });
    requestAnimationFrame(() => {
      document.querySelector(`#${WIDGET_ID} [data-note-title]`)?.focus();
    });
  });

  const noteSearchInput = root.querySelector("[data-note-search]");
  noteSearchInput?.addEventListener("input", (ev) => {
    _notesSearchQuery = ev.target.value || "";
    const pos = ev.target.selectionStart;
    renderPhoneContents();
    requestAnimationFrame(() => {
      const nextInput = document.querySelector(`#${WIDGET_ID} [data-note-search]`);
      if (nextInput) {
        nextInput.focus();
        if (typeof pos === "number") nextInput.setSelectionRange(pos, pos);
      }
    });
  });

  root.querySelector("[data-note-search-clear]")?.addEventListener("click", () => {
    _notesSearchQuery = "";
    renderPhoneContents();
  });

  root.querySelectorAll("[data-note-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const noteId = btn.getAttribute("data-note-open");
      if (!noteId) return;
      _confirmDeleteNoteId = null;
      navigateToPhoneRoute({ app: "notes", selectedNoteId: noteId });
    });
  });

  root.querySelector("[data-note-back]")?.addEventListener("click", () => {
    if (_noteSaveTimer) {
      clearTimeout(_noteSaveTimer);
      _noteSaveTimer = null;
    }
    _confirmDeleteNoteId = null;
    _selectedNoteId = null;
    renderPhoneContents();
  });

  root.querySelector("[data-note-pin]")?.addEventListener("click", async (ev) => {
    const noteId = ev.currentTarget.getAttribute("data-note-pin");
    if (!noteId) return;
    await savePhoneNotes(togglePhoneNotePin(getSavedPhoneNotes(), noteId));
    renderPhoneContents();
  });

  root.querySelector("[data-note-delete]")?.addEventListener("click", (ev) => {
    const noteId = ev.currentTarget.getAttribute("data-note-delete");
    _confirmDeleteNoteId = _confirmDeleteNoteId === noteId ? null : noteId;
    renderPhoneContents();
  });

  root.querySelector("[data-note-delete-cancel]")?.addEventListener("click", () => {
    _confirmDeleteNoteId = null;
    renderPhoneContents();
  });

  root.querySelector("[data-note-delete-confirm]")?.addEventListener("click", async (ev) => {
    const noteId = ev.currentTarget.getAttribute("data-note-delete-confirm");
    if (!noteId) return;
    if (_noteSaveTimer) {
      clearTimeout(_noteSaveTimer);
      _noteSaveTimer = null;
    }
    await savePhoneNotes(deletePhoneNote(getSavedPhoneNotes(), noteId));
    _confirmDeleteNoteId = null;
    _selectedNoteId = null;
    renderPhoneContents();
  });

  root.querySelector("[data-note-send-chat]")?.addEventListener("click", async (ev) => {
    const noteId = ev.currentTarget.getAttribute("data-note-send-chat");
    const note = getSavedPhoneNotes().find((n) => n.id === noteId);
    if (!note || !globalThis.ChatMessage?.create) return;
    const title = escapeHtml(note.title.trim() || "Note");
    const body = escapeHtml(note.body || "").replace(/\r?\n/g, "<br>");
    const actor = getActivePhoneActor();
    const speaker = actor ? ChatMessage.getSpeaker({ actor }) : ChatMessage.getSpeaker({ user: game?.user });
    await ChatMessage.create({
      speaker,
      content: `<div class="cd-syslog-card" style="border-left: 3px solid #ffd60a; background: rgba(255, 214, 10, 0.08);"><div class="cd-syslog-header"><span class="cd-syslog-alias"><i class="fa-solid fa-note-sticky"></i> ${title}</span></div><div class="cd-syslog-body">${body || "<em>(Empty note)</em>"}</div></div>`
    });
    ui?.notifications?.info?.("Note posted to chat.");
  });

  const titleInput = root.querySelector("[data-note-title]");
  const bodyInput = root.querySelector("[data-note-body]");
  const activeNoteId = titleInput?.getAttribute("data-note-title") || bodyInput?.getAttribute("data-note-body");
  if (activeNoteId && (titleInput || bodyInput)) {
    const persistDraft = async (immediate = false) => {
      const statusEl = root.querySelector("[data-note-save-status]");
      const countEl = root.querySelector("[data-note-char-count]");
      const title = titleInput?.value ?? "";
      const body = bodyInput?.value ?? "";
      if (countEl) countEl.textContent = `${body.length} chars`;
      if (statusEl && !immediate) statusEl.textContent = "Saving...";
      const runSave = async () => {
        const next = upsertPhoneNote(getSavedPhoneNotes(), { id: activeNoteId, title, body });
        await savePhoneNotes(next);
        if (statusEl?.isConnected) statusEl.textContent = "Saved • Just now";
      };
      if (_noteSaveTimer) clearTimeout(_noteSaveTimer);
      if (immediate) {
        _noteSaveTimer = null;
        await runSave();
      } else {
        _noteSaveTimer = setTimeout(() => {
          _noteSaveTimer = null;
          runSave();
        }, 300);
      }
    };
    titleInput?.addEventListener("input", () => persistDraft(false));
    bodyInput?.addEventListener("input", () => persistDraft(false));
    titleInput?.addEventListener("blur", () => persistDraft(true));
    bodyInput?.addEventListener("blur", () => persistDraft(true));
  }

  root.querySelectorAll("[data-select-theme]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const themeId = btn.getAttribute("data-select-theme");
      if (PHONE_THEMES[themeId]) {
        await game.settings.set(MODULE_ID, SETTINGS.SMARTPHONE_THEME, themeId);
      }
    });
  });

  root.querySelector("[data-camera-grid]")?.addEventListener("click", () => {
    _cameraGrid = !_cameraGrid;
    renderPhoneContents();
  });

  root.querySelectorAll("[data-camera-expand]").forEach((btn) => {
    btn.addEventListener("click", () => {
      _cameraExpanded = !_cameraExpanded;
      renderPhoneContents();
    });
  });

  root.querySelector("[data-camera-shutter]")?.addEventListener("click", () => {
    const viewfinder = root.querySelector(".cd-phone-viewfinder");
    const flash = root.querySelector(".cd-phone-shutter-flash");
    if (flash) {
      flash.classList.remove("is-flashing");
      void flash.offsetWidth;
      flash.classList.add("is-flashing");
    }
    const photo = capturePhoneViewfinderSnapshot(viewfinder);
    if (photo) {
      saveCapturedPhoto(photo);
      setTimeout(() => renderPhoneContents(), 180);
    }
  });

  root.querySelectorAll("[data-photo-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      navigateToPhoneRoute({
        app: "photos",
        selectedPhotoId: btn.getAttribute("data-photo-open")
      });
    });
  });

  root.querySelector("[data-photo-back]")?.addEventListener("click", () => {
    navigateBackPhone();
  });

  root.querySelector("[data-photo-delete]")?.addEventListener("click", async (ev) => {
    const id = ev.currentTarget.getAttribute("data-photo-delete");
    await deletePhotoById(id);
    _selectedPhotoId = null;
    renderPhoneContents();
  });

  root.querySelector("[data-photo-cloud]")?.addEventListener("click", async (ev) => {
    const id = ev.currentTarget.getAttribute("data-photo-cloud");
    const btn = ev.currentTarget;
    btn.disabled = true;
    const saved = await saveSessionPhotoToCloud(id);
    if (saved) {
      _selectedPhotoId = saved.id;
    } else {
      btn.disabled = false;
    }
    renderPhoneContents();
  });

  root.querySelector("[data-photo-download]")?.addEventListener("click", (ev) => {
    const id = ev.currentTarget.getAttribute("data-photo-download");
    const photo = getCombinedPhotos().find((p) => p.id === id);
    if (!photo) return;
    const ext = photo.dataUrl.startsWith("data:image/webp") ? "webp" : "jpg";
    const a = document.createElement("a");
    a.href = photo.dataUrl;
    a.download = `isekai-photo-${id}.${ext}`;
    a.click();
  });

  root.querySelector("[data-photo-share]")?.addEventListener("click", async (ev) => {
    const id = ev.currentTarget.getAttribute("data-photo-share");
    const photo = getCombinedPhotos().find((p) => p.id === id);
    if (!photo) return;
    await sendPhoneMessage({
      content: `<img src="${photo.dataUrl}" alt="Phone Photo" style="max-width:100%;border-radius:8px;" />`,
      whisper: []
    });
    navigateToPhoneRoute({ app: "messages", selectedPhotoId: null, messageThreadId: "all" });
  });

  root.querySelector("[data-open-photo-cloud]")?.addEventListener("click", () => {
    navigateToPhoneRoute({
      app: "photos",
      settingsSubmenu: null,
      selectedPhotoId: null,
      photosFilter: "cloud"
    });
  });

  root.querySelectorAll("[data-photos-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      _photosFilter = btn.getAttribute("data-photos-filter") || "all";
      renderPhoneContents();
    });
  });

  root.querySelector("[data-open-game-settings]")?.addEventListener("click", () => {
    game?.settings?.sheet?.render(true);
  });

  root.querySelector("[data-toggle-player-sidebar]")?.addEventListener("click", async () => {
    if (game?.user?.isGM) return;
    const next = !getPlayerShowSidebarSetting();
    await game?.settings?.set(MODULE_ID, SETTINGS.SMARTPHONE_PLAYER_SHOW_SIDEBAR, next);
    updateSmartphoneSidebarVisibility();
    renderPhoneContents();
  });

  root.querySelector("[data-foundry-logout]")?.addEventListener("click", () => {
    if (typeof game?.logOut === "function") {
      game.logOut();
    } else {
      ui?.menu?.items?.logout?.onClick?.();
    }
  });

  root.querySelectorAll("[data-settings-sub]").forEach((btn) => {
    btn.addEventListener("click", () => {
      _gmConfirmDeleteTarget = null;
      navigateToPhoneRoute({
        app: "settings",
        settingsSubmenu: btn.getAttribute("data-settings-sub")
      });
    });
  });

  root.querySelectorAll("[data-gm-toggle-app]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!game?.user?.isGM) return;
      const appId = String(btn.getAttribute("data-gm-toggle-app") || "").trim();
      if (!appId || appId === "settings") return;
      const current = new Set(getDisabledPlayerAppIds());
      if (current.has(appId)) {
        current.delete(appId);
      } else {
        current.add(appId);
      }
      await game.settings.set(MODULE_ID, SETTINGS.SMARTPHONE_DISABLED_APPS, Array.from(current));
      renderPhoneContents();
    });
  });

  root.querySelector("[data-settings-back]")?.addEventListener("click", () => {
    _gmConfirmDeleteTarget = null;
    navigateBackPhone();
  });

  root.querySelectorAll("[data-gm-delete-thread]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!game?.user?.isGM) return;
      _gmConfirmDeleteTarget = {
        type: "thread",
        threadKey: btn.getAttribute("data-gm-delete-thread") || "",
        label: btn.getAttribute("data-gm-delete-label") || "Thread",
        count: Number(btn.getAttribute("data-gm-delete-count") || 0)
      };
      renderPhoneContents();
    });
  });

  root.querySelector("[data-gm-delete-all-msgs]")?.addEventListener("click", () => {
    if (!game?.user?.isGM) return;
    _gmConfirmDeleteTarget = { type: "all" };
    renderPhoneContents();
  });

  root.querySelectorAll("[data-gm-delete-profile]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!game?.user?.isGM) return;
      const userId = btn.getAttribute("data-gm-delete-profile") || "";
      if (!userId) return;
      _gmConfirmDeleteTarget = {
        type: "profile",
        userId,
        label: btn.getAttribute("data-gm-delete-label") || "Player"
      };
      renderPhoneContents();
    });
  });

  root.querySelector("[data-gm-delete-cancel]")?.addEventListener("click", () => {
    _gmConfirmDeleteTarget = null;
    renderPhoneContents();
  });

  root.querySelector("[data-gm-delete-confirm]")?.addEventListener("click", async () => {
    const target = _gmConfirmDeleteTarget;
    _gmConfirmDeleteTarget = null;
    if (game?.user?.isGM && target) {
      if (target.type === "all") {
        await deleteAllPhoneMessagesAsGM();
      } else if (target.type === "thread" && target.threadKey) {
        await deletePhoneThreadByKeyAsGM(target.threadKey);
      } else if (target.type === "profile" && target.userId) {
        await deletePlayerPhoneProfileAsGM(target.userId);
      }
    }
    renderPhoneContents();
  });

  root.querySelectorAll("[data-wp-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      _wallpaperTab = btn.getAttribute("data-wp-tab") || "background";
      renderPhoneContents();
    });
  });

  root.querySelectorAll("[data-active-preset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-active-preset");
      const prev = getSavedWallpaper() || {};
      if (_wallpaperTab === "phone") {
        const preset = PHONE_COLOR_PRESETS.find((p) => p.id === id);
        if (!preset) return;
        saveWallpaper({ ...prev, bezelColor: preset.value });
      } else {
        const preset = WALLPAPER_PRESETS.find((p) => p.id === id);
        if (!preset) return;
        saveWallpaper({ ...prev, bgType: "preset", bgId: preset.id, bgValue: preset.value });
      }
      renderPhoneContents();
    });
  });

  root.querySelector("[data-active-color]")?.addEventListener("change", (ev) => {
    const color = ev.currentTarget.value;
    if (!color) return;
    const prev = getSavedWallpaper() || {};
    if (_wallpaperTab === "phone") {
      saveWallpaper({ ...prev, bezelColor: color });
    } else {
      saveWallpaper({ ...prev, bgType: "color", bgId: null, bgValue: color });
    }
    renderPhoneContents();
  });

  root.querySelector("[data-active-reset-color]")?.addEventListener("click", () => {
    const prev = getSavedWallpaper() || {};
    if (_wallpaperTab === "phone") {
      delete prev.bezelColor;
    } else {
      delete prev.bgType;
      delete prev.bgId;
      delete prev.bgValue;
    }
    saveWallpaper(prev);
    renderPhoneContents();
  });

  root.querySelector("[data-wallpaper-upload]")?.addEventListener("change", async (ev) => {
    const file = ev.currentTarget.files?.[0];
    if (!file) return;
    const dataUrl = await compressWallpaperFile(file);
    if (dataUrl) {
      const prev = getSavedWallpaper() || {};
      saveWallpaper({ ...prev, imageUrl: dataUrl });
      renderPhoneContents();
    }
  });

  root.querySelector("[data-wallpaper-clear-image]")?.addEventListener("click", () => {
    const prev = getSavedWallpaper() || {};
    delete prev.imageUrl;
    saveWallpaper(prev);
    renderPhoneContents();
  });

  const statusbar = root.querySelector(".cd-phone-statusbar");
  if (statusbar) {
    makePhoneDraggable(statusbar, root, null, { ignoreButtons: true });
    statusbar.addEventListener("dblclick", (ev) => {
      if (ev.target?.closest?.(".cd-phone-pulldown-trigger")) return;
      _isOpen = false;
      _pulldownOpen = false;
      _actorPickerOpen = false;
      renderPhoneContents();
    });
  }

  const navbar = root.querySelector(".cd-phone-navbar");
  if (navbar) {
    makePhoneDraggable(navbar, root, null, { ignoreButtons: true });
  }

  const cameraView = root.querySelector(".cd-phone-camera-view");
  if (cameraView) {
    makePhoneDraggable(cameraView, root, null, { ignoreButtons: true });
  }

  const thread = root.querySelector(".cd-phone-thread");
  if (thread) thread.scrollTop = thread.scrollHeight;

  if (_currentApp === "system-log") {
    const sysLog = root.querySelector(".cd-phone-system-log");
    sysLog?.addEventListener("click", async (ev) => {
      const btn = ev.target?.closest?.(".cheapdice-savage-attacker-btn");
      if (!btn || btn.disabled) return;
      const msgEl = btn.closest(".chat-message, [data-message-id], .cd-phone-sys-slot");
      const messageId = msgEl?.dataset?.messageId || msgEl?.dataset?.sysMsgId;
      if (!messageId || !globalThis.attackSocket) return;
      btn.disabled = true;
      btn.style.opacity = "0.6";
      try {
        await globalThis.attackSocket.executeAsGM("applySavageAttacker", messageId, game.user?.id);
      } catch (err) {
        console.error(`${MODULE_ID} | Failed to apply Savage Attacker from System Log:`, err);
        btn.disabled = false;
        btn.style.opacity = "1";
      }
    });
    hydrateSystemLogCards(root);

    if (game?.user?.isGM) {
      root.querySelector('[data-action="syslog-toggle"]')?.addEventListener("click", () => {
        _sysLogComposeOpen = !_sysLogComposeOpen;
        renderPhoneContents();
        if (_sysLogComposeOpen) {
          const widget = document.getElementById(WIDGET_ID);
          widget?.querySelector('[data-syslog-field="text"]')?.focus();
        }
      });

      const syslogForm = root.querySelector('form[data-compose="syslog"]');
      const aliasInput = syslogForm?.querySelector('[data-syslog-field="alias"]');
      const recipientSelect = syslogForm?.querySelector('[data-syslog-field="recipient"]');
      const textInput = syslogForm?.querySelector('[data-syslog-field="text"]');

      aliasInput?.addEventListener("input", () => {
        _sysLogAlias = aliasInput.value;
      });

      recipientSelect?.addEventListener("change", () => {
        _sysLogRecipient = recipientSelect.value || "all";
      });

      textInput?.addEventListener("input", () => {
        _sysLogDraft = textInput.value;
      });

      textInput?.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" && !ev.shiftKey && !ev.isComposing) {
          ev.preventDefault();
          syslogForm?.requestSubmit();
        }
      });

      syslogForm?.querySelectorAll("[data-syslog-alias-chip]").forEach((chip) => {
        chip.addEventListener("click", () => {
          const preset = chip.getAttribute("data-syslog-alias-chip") || "System";
          _sysLogAlias = preset;
          if (aliasInput) aliasInput.value = preset;
          textInput?.focus();
        });
      });

      syslogForm?.querySelectorAll("[data-syslog-tone]").forEach((toneBtn) => {
        toneBtn.addEventListener("click", () => {
          const nextTone = toneBtn.getAttribute("data-syslog-tone") || "log";
          _sysLogTone = SYSTEM_LOG_TONES[nextTone] ? nextTone : "log";
          syslogForm.querySelectorAll("[data-syslog-tone]").forEach((b) => {
            b.classList.toggle("active", b.getAttribute("data-syslog-tone") === _sysLogTone);
          });
        });
      });

      syslogForm?.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        if (!game?.user?.isGM) return;
        const text = textInput?.value?.trim() || "";
        if (!text) return;
        const alias = (aliasInput?.value || "System").trim() || "System";
        const tone = SYSTEM_LOG_TONES[_sysLogTone] ? _sysLogTone : "log";
        const recipient = recipientSelect?.value || "all";
        const whisper = recipient && recipient !== "all" ? [recipient] : [];
        const content = buildSystemLogMessageHtml({ text, alias, tone });
        try {
          await ChatMessage.create({
            content,
            speaker: { alias },
            style: CONST?.CHAT_MESSAGE_STYLES?.OTHER,
            whisper,
            flags: { [MODULE_ID]: { systemLog: true, tone } }
          });
          _sysLogDraft = "";
          if (textInput) textInput.value = "";
          renderPhoneContents();
        } catch (err) {
          console.error(`${MODULE_ID} | Failed to send system log message:`, err);
          ui?.notifications?.error?.("Failed to send system log message.");
        }
      });
    }
  }
}

async function hydrateSystemLogCards(root) {
  const sysLog = root.querySelector(".cd-phone-system-log");
  const slots = root.querySelectorAll(".cd-phone-sys-slot[data-sys-msg-id]");
  for (const slot of slots) {
    const msgId = slot.getAttribute("data-sys-msg-id");
    const msg = game?.messages?.get(msgId);
    if (!msg) continue;

    try {
      let cardEl = null;
      if (typeof msg.renderHTML === "function") {
        cardEl = await msg.renderHTML();
      } else if (typeof msg.getHTML === "function") {
        const jq = await msg.getHTML();
        cardEl = jq?.[0] || jq;
      }

      if (!slot.isConnected) return;
      if (cardEl instanceof HTMLElement) {
        slot.replaceChildren(cardEl);
      } else {
        const fallback = document.createElement("div");
        fallback.className = "chat-message message";
        fallback.dataset.messageId = msgId;
        fallback.innerHTML = String(msg.content || "");
        slot.replaceChildren(fallback);
      }
    } catch (err) {
      if (!slot.isConnected) return;
      const fallback = document.createElement("div");
      fallback.className = "chat-message message";
      fallback.dataset.messageId = msgId;
      fallback.innerHTML = String(msg.content || "");
      slot.replaceChildren(fallback);
      console.warn(`${MODULE_ID} | System Log card render fallback for ${msgId}:`, err);
    }
  }
  if (sysLog && sysLog.isConnected) {
    sysLog.scrollTop = sysLog.scrollHeight;
  }
}

function getCurrentPhoneRoute() {
  return {
    app: _currentApp,
    settingsSubmenu: _settingsSubmenu,
    selectedPhotoId: _selectedPhotoId,
    photosFilter: _photosFilter,
    messageThreadId: _messageThreadId,
    messageComposing: _messageComposing,
    composeNpcId: _composeNpcId,
    contactDetailKey: _contactDetailKey,
    selectedNoteId: _selectedNoteId
  };
}

function applyPhoneRoute(route) {
  _currentApp = route.app || "home";
  _settingsSubmenu = route.settingsSubmenu ?? null;
  _selectedPhotoId = route.selectedPhotoId ?? null;
  _photosFilter = route.photosFilter || "all";
  _messageThreadId = route.messageThreadId ?? null;
  _messageComposing = Boolean(route.messageComposing);
  if (!_messageComposing) _composeGroupMode = false;
  _composeNpcId = route.composeNpcId ?? null;
  _contactDetailKey = route.contactDetailKey ?? null;
  _selectedNoteId = route.selectedNoteId ?? null;
  _confirmHideThreadId = null;
  _confirmDeleteNoteId = null;
}

function navigateToPhoneRoute(nextRoute) {
  _homeEditMode = false;
  _pulldownOpen = false;
  _actorPickerOpen = false;
  _navHistory.push(getCurrentPhoneRoute());
  if (_navHistory.length > 20) _navHistory.shift();
  applyPhoneRoute({ ...getCurrentPhoneRoute(), ...nextRoute });
  renderPhoneContents();
}

function navigateBackPhone() {
  _pulldownOpen = false;
  _actorPickerOpen = false;
  if (_navHistory.length > 0) {
    const prev = _navHistory.pop();
    applyPhoneRoute(prev);
    renderPhoneContents();
    return;
  }
  if (_currentApp !== "home") {
    applyPhoneRoute({ app: "home", settingsSubmenu: null, selectedPhotoId: null, photosFilter: "all" });
    renderPhoneContents();
    return;
  }
  _isOpen = false;
  renderPhoneContents();
}

function navigateHomePhone() {
  _diceTrayOpen = false;
  _pulldownOpen = false;
  _actorPickerOpen = false;
  _homeEditMode = false;
  _navHistory = [];
  applyPhoneRoute({ app: "home", settingsSubmenu: null, selectedPhotoId: null, photosFilter: "all" });
  renderPhoneContents();
}

function findMessagesJournal() {
  return Array.from(game?.journal?.contents || []).find(
    (j) => j.getFlag?.(MODULE_ID, MESSAGES_JOURNAL_FLAG) || j.flags?.[MODULE_ID]?.[MESSAGES_JOURNAL_FLAG]
  ) || null;
}

function getHiddenPhoneThreads() {
  const flag = game?.user?.getFlag?.(MODULE_ID, USER_HIDDEN_THREADS_FLAG) ?? game?.user?.flags?.[MODULE_ID]?.[USER_HIDDEN_THREADS_FLAG];
  if (flag && typeof flag === "object") return flag;
  try {
    const raw = localStorage.getItem(getScopedStorageKey(HIDDEN_THREADS_STORAGE_KEY));
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function setThreadHiddenState(threadId, hiddenAt) {
  if (!threadId || threadId === "all") return;
  const current = { ...getHiddenPhoneThreads() };
  if (hiddenAt > 0) current[threadId] = hiddenAt;
  else delete current[threadId];
  try {
    localStorage.setItem(getScopedStorageKey(HIDDEN_THREADS_STORAGE_KEY), JSON.stringify(current));
  } catch { }
  try {
    await game?.user?.setFlag?.(MODULE_ID, USER_HIDDEN_THREADS_FLAG, current);
  } catch { }
}

function getScopedStorageKey(baseKey) {
  const worldId = String(game?.world?.id || "world");
  const userId = String(game?.user?.id || "anon");
  return `${baseKey}.${worldId}.${userId}`;
}

function getContactColorsStorageKey() {
  return getScopedStorageKey(CONTACT_COLORS_STORAGE_KEY);
}

function getPhoneContactColorOverrides() {
  if (game?.user) {
    const flag = game.user.getFlag?.(MODULE_ID, USER_CONTACT_COLORS_FLAG) ?? game.user.flags?.[MODULE_ID]?.[USER_CONTACT_COLORS_FLAG];
    return flag && typeof flag === "object" ? flag : {};
  }
  try {
    const raw = localStorage.getItem(getContactColorsStorageKey());
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function setPhoneContactColorOverride(contactKey, colorHex) {
  if (!contactKey) return;
  const current = { ...getPhoneContactColorOverrides() };
  const safe = sanitizePhoneColor(colorHex);
  if (safe) current[contactKey] = safe;
  else delete current[contactKey];
  if (game?.user) {
    try {
      if (safe) {
        await game.user.setFlag?.(MODULE_ID, USER_CONTACT_COLORS_FLAG, { [contactKey]: safe });
      } else {
        await game.user.setFlag?.(MODULE_ID, USER_CONTACT_COLORS_FLAG, { [`-=${contactKey}`]: null });
      }
    } catch { }
    return;
  }
  try {
    localStorage.setItem(getContactColorsStorageKey(), JSON.stringify(current));
  } catch { }
}

function getUserConfiguredColor(userId) {
  if (!userId || String(userId).startsWith("npc:")) return "";
  const u = game?.users?.get?.(userId);
  return sanitizePhoneColor(u?.color?.css ?? u?.color ?? "");
}

function getContactDisplayColor(contactKey) {
  if (!contactKey) return "";
  return resolveContactDisplayColor(
    contactKey,
    getUserConfiguredColor(contactKey),
    getPhoneContactColorOverrides()
  );
}

function getContactNicknamesStorageKey() {
  return getScopedStorageKey(CONTACT_NICKNAMES_STORAGE_KEY);
}

function getPhoneContactNicknameOverrides() {
  if (game?.user) {
    const flag = game.user.getFlag?.(MODULE_ID, USER_CONTACT_NICKNAMES_FLAG) ?? game.user.flags?.[MODULE_ID]?.[USER_CONTACT_NICKNAMES_FLAG];
    return flag && typeof flag === "object" ? flag : {};
  }
  try {
    const raw = localStorage.getItem(getContactNicknamesStorageKey());
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function setPhoneContactNicknameOverride(contactKey, nickname) {
  if (!contactKey) return;
  const current = { ...getPhoneContactNicknameOverrides() };
  const safe = sanitizePhoneNickname(nickname);
  if (safe) current[contactKey] = safe;
  else delete current[contactKey];
  if (game?.user) {
    try {
      if (safe) {
        await game.user.setFlag?.(MODULE_ID, USER_CONTACT_NICKNAMES_FLAG, { [contactKey]: safe });
      } else {
        await game.user.setFlag?.(MODULE_ID, USER_CONTACT_NICKNAMES_FLAG, { [`-=${contactKey}`]: null });
      }
    } catch { }
    return;
  }
  try {
    localStorage.setItem(getContactNicknamesStorageKey(), JSON.stringify(current));
  } catch { }
}

function getContactDisplayName(contactKey, defaultName = "") {
  if (!contactKey) return String(defaultName || "");
  return resolveContactDisplayName(
    contactKey,
    defaultName,
    getPhoneContactNicknameOverrides()
  );
}

function getNpcContactAccessMap() {
  const journal = findMessagesJournal();
  const raw = journal?.getFlag?.(MODULE_ID, NPC_CONTACTS_DATA_FLAG) ?? journal?.flags?.[MODULE_ID]?.[NPC_CONTACTS_DATA_FLAG];
  return normalizeNpcContactAccessMap(raw);
}

function getAllConfiguredNpcContactIds() {
  return Object.keys(getNpcContactAccessMap());
}

function getNpcContactIds(userId = game?.user?.id || "", isGM = Boolean(game?.user?.isGM)) {
  const accessMap = getNpcContactAccessMap();
  return Object.keys(accessMap).filter((actorId) => canUserAccessNpcContact(accessMap, actorId, userId, isGM));
}

async function ensureMessagesJournalAsGM() {
  if (!game?.user?.isGM) return null;
  let journal = findMessagesJournal();
  if (!journal) {
    journal = await JournalEntry.create({
      name: "Phone Messages",
      ownership: { default: 2 },
      flags: { [MODULE_ID]: { [MESSAGES_JOURNAL_FLAG]: true, [MESSAGES_DATA_FLAG]: [], [NPC_CONTACTS_DATA_FLAG]: {} } }
    });
  }
  return journal;
}

async function setNpcContactAccessAsGM(actorId, accessValue) {
  if (!game?.user?.isGM || !actorId) return;
  const journal = await ensureMessagesJournalAsGM();
  if (!journal) return;
  const raw = journal.getFlag?.(MODULE_ID, NPC_CONTACTS_DATA_FLAG) ?? journal.flags?.[MODULE_ID]?.[NPC_CONTACTS_DATA_FLAG];
  const next = normalizeNpcContactAccessMap(raw);
  let shouldDeleteKey = false;

  if (accessValue === "all") {
    next[actorId] = "all";
  } else if (Array.isArray(accessValue)) {
    const userIds = Array.from(new Set(accessValue.map((uid) => String(uid || "").trim()).filter(Boolean)));
    if (userIds.length > 0) {
      next[actorId] = userIds;
    } else {
      delete next[actorId];
      shouldDeleteKey = true;
    }
  } else {
    delete next[actorId];
    shouldDeleteKey = true;
  }

  if (Array.isArray(raw)) {
    if (typeof journal.unsetFlag === "function") {
      await journal.unsetFlag(MODULE_ID, NPC_CONTACTS_DATA_FLAG);
    }
    if (Object.keys(next).length > 0) {
      await journal.setFlag(MODULE_ID, NPC_CONTACTS_DATA_FLAG, next);
    }
  } else if (shouldDeleteKey) {
    if (typeof journal.update === "function") {
      await journal.update({ [`flags.${MODULE_ID}.${NPC_CONTACTS_DATA_FLAG}.-=${actorId}`]: null });
    } else {
      await journal.setFlag(MODULE_ID, NPC_CONTACTS_DATA_FLAG, next);
    }
  } else {
    await journal.setFlag(MODULE_ID, NPC_CONTACTS_DATA_FLAG, { [actorId]: next[actorId] });
  }

  renderPhoneContents();
}

async function toggleNpcContactPlayerAsGM(actorId, userId) {
  if (!game?.user?.isGM || !actorId || !userId) return;
  const accessMap = getNpcContactAccessMap();
  const current = Array.isArray(accessMap[actorId]) ? new Set(accessMap[actorId]) : new Set();
  if (current.has(userId)) current.delete(userId);
  else current.add(userId);
  await setNpcContactAccessAsGM(actorId, Array.from(current));
}

function getStoredPhoneMessages(currentUserId = game?.user?.id || "") {
  const isGM = Boolean(game?.user?.isGM);
  const journal = findMessagesJournal();
  const raw = journal?.getFlag?.(MODULE_ID, MESSAGES_DATA_FLAG) ?? journal?.flags?.[MODULE_ID]?.[MESSAGES_DATA_FLAG];
  const list = Array.isArray(raw) ? raw : [];

  const journalMsgs = list
    .filter((m) => isPhoneMessageVisibleToUser(m, currentUserId, isGM))
    .map((m) => formatPhoneMessage({
      id: m.id,
      author: { id: m.authorId, name: m.sender },
      speaker: { alias: m.sender },
      whisper: m.whisper,
      npcId: m.npcId,
      playerUserId: m.playerUserId,
      playerActorId: m.playerActorId,
      senderActorId: m.senderActorId,
      targetActorId: m.targetActorId,
      groupId: m.groupId,
      timestamp: m.timestamp,
      content: m.content,
      reactions: m.reactions
    }, currentUserId, isGM));

  const sidebarMsgs = Array.from(game?.messages?.contents || [])
    .filter((m) => {
      if (m.visible === false) return false;
      if (m.getFlag?.(MODULE_ID, "fromPhone") || m.flags?.[MODULE_ID]?.fromPhone) return false;
      return classifyChatMessageForPhone(m) === "text";
    })
    .map((m) => formatPhoneMessage(m, currentUserId, isGM));

  const ephemeralMsgs = _ephemeralPhoneMessages
    .filter((m) => isPhoneMessageVisibleToUser(m, currentUserId, isGM))
    .map((m) => formatPhoneMessage({
      id: m.id,
      author: { id: m.authorId, name: m.sender },
      speaker: { alias: m.sender },
      whisper: m.whisper,
      npcId: m.npcId,
      playerUserId: m.playerUserId,
      playerActorId: m.playerActorId,
      senderActorId: m.senderActorId,
      targetActorId: m.targetActorId,
      groupId: m.groupId,
      timestamp: m.timestamp,
      content: m.content,
      reactions: m.reactions
    }, currentUserId, isGM));

  return [...journalMsgs, ...sidebarMsgs, ...ephemeralMsgs].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
}

async function togglePhoneMessageReactionAsGM({ messageId, emoji, userId }) {
  if (!game?.user?.isGM || !messageId || !emoji || !userId) return;
  const journal = findMessagesJournal();
  if (!journal) return;
  const existing = journal.getFlag?.(MODULE_ID, MESSAGES_DATA_FLAG) ?? journal.flags?.[MODULE_ID]?.[MESSAGES_DATA_FLAG];
  const list = Array.isArray(existing) ? existing : [];
  let changed = false;
  const next = list.map((m) => {
    if (m.id !== messageId) return m;
    changed = true;
    return { ...m, reactions: toggleMessageReaction(m.reactions, emoji, userId) };
  });
  if (changed) {
    await journal.setFlag(MODULE_ID, MESSAGES_DATA_FLAG, next);
  }
}

async function togglePhoneMessageReaction({ messageId, emoji }) {
  const userId = String(game?.user?.id || "");
  if (!messageId || !emoji || !userId) return;

  const ephem = _ephemeralPhoneMessages.find((m) => m.id === messageId);
  if (ephem) {
    ephem.reactions = toggleMessageReaction(ephem.reactions, emoji, userId);
    game?.socket?.emit?.(`module.${MODULE_ID}`, {
      action: "reactPhoneMessage",
      messageId,
      emoji,
      userId,
      ephemeral: true
    });
    renderPhoneContents();
    return;
  }

  if (game?.user?.isGM) {
    await togglePhoneMessageReactionAsGM({ messageId, emoji, userId });
    return;
  }

  if (game?.users?.activeGM) {
    game.socket?.emit(`module.${MODULE_ID}`, {
      action: "reactPhoneMessage",
      messageId,
      emoji,
      userId,
      ephemeral: false
    });
  }
}

async function appendPhoneMessageAsGM(entry) {
  if (!game?.user?.isGM || !entry) return null;
  const journal = await ensureMessagesJournalAsGM();
  if (!journal) return null;
  const existing = journal.getFlag?.(MODULE_ID, MESSAGES_DATA_FLAG) ?? journal.flags?.[MODULE_ID]?.[MESSAGES_DATA_FLAG];
  const list = Array.isArray(existing) ? existing : [];
  const next = [...list, entry].slice(-MAX_STORED_PHONE_MESSAGES);
  await journal.setFlag(MODULE_ID, MESSAGES_DATA_FLAG, next);
  return entry;
}

function getAllStoredMessageEntriesForGM() {
  const journal = findMessagesJournal();
  const raw = journal?.getFlag?.(MODULE_ID, MESSAGES_DATA_FLAG) ?? journal?.flags?.[MODULE_ID]?.[MESSAGES_DATA_FLAG];
  const journalList = Array.isArray(raw) ? raw : [];

  const sidebarList = Array.from(game?.messages?.contents || [])
    .filter((m) => {
      if (m.getFlag?.(MODULE_ID, "fromPhone") || m.flags?.[MODULE_ID]?.fromPhone) return false;
      return classifyChatMessageForPhone(m) === "text";
    });

  return [...journalList, ...sidebarList, ..._ephemeralPhoneMessages];
}

function formatGmThreadParticipantsLabel(thread) {
  if (!thread || thread.kind === "party") return "Party Chat";
  const resolveUserName = (uid) => {
    const u = game?.users?.get?.(uid);
    return u?.character?.name || u?.name || uid || "Unknown";
  };
  if (thread.kind === "group") {
    const groupId = String(thread.threadKey || "").replace(/^group:/, "");
    const grp = getPhoneGroupById(groupId);
    if (grp?.name) return `${grp.name} (Group)`;
    const names = (thread.participants || []).map(resolveUserName);
    return names.length > 0 ? `Group (${names.join(", ")})` : "Group Chat";
  }
  if (thread.kind === "npc") {
    const actor = game?.actors?.get?.(thread.npcId);
    const npcName = actor?.name || "NPC";
    const playerName = thread.playerUserId ? resolveUserName(thread.playerUserId) : "Player";
    return `${npcName} (NPC) ↔ ${playerName}`;
  }
  const names = (thread.participants || []).map(resolveUserName);
  return names.length > 0 ? names.join(" ↔ ") : "Direct Message";
}

async function deletePhoneThreadByKeyAsGM(threadKey) {
  if (!game?.user?.isGM || !threadKey) return false;

  const nextEphem = removePhoneMessagesByThreadKey(_ephemeralPhoneMessages, threadKey);
  if (nextEphem.length !== _ephemeralPhoneMessages.length) {
    _ephemeralPhoneMessages = nextEphem;
    game?.socket?.emit?.(`module.${MODULE_ID}`, {
      action: "deletePhoneThreadKey",
      threadKey
    });
  }

  const isGroupKey = String(threadKey).startsWith("group:");
  const targetGroupId = isGroupKey ? String(threadKey).slice(6) : "";
  if (targetGroupId) {
    _optimisticPhoneGroups = _optimisticPhoneGroups.filter((g) => g?.id !== targetGroupId);
    game?.socket?.emit?.(`module.${MODULE_ID}`, {
      action: "deletePhoneGroup",
      groupId: targetGroupId
    });
  }

  const journal = findMessagesJournal();
  if (journal) {
    const existing = journal.getFlag?.(MODULE_ID, MESSAGES_DATA_FLAG) ?? journal.flags?.[MODULE_ID]?.[MESSAGES_DATA_FLAG];
    const list = Array.isArray(existing) ? existing : [];
    const next = removePhoneMessagesByThreadKey(list, threadKey);

    const existingGroups = journal.getFlag?.(MODULE_ID, GROUPS_DATA_FLAG) ?? journal.flags?.[MODULE_ID]?.[GROUPS_DATA_FLAG];
    const groupList = Array.isArray(existingGroups) ? existingGroups : [];
    const nextGroups = targetGroupId ? groupList.filter((g) => g?.id !== targetGroupId) : groupList;

    if (next.length !== list.length || nextGroups.length !== groupList.length) {
      _knownPhoneMessageIds = new Set(next.map((m) => m?.id).filter(Boolean));
      if (next.length === 0 && nextGroups.length === 0 && getAllConfiguredNpcContactIds().length === 0 && typeof journal.delete === "function") {
        await journal.delete();
      } else {
        if (next.length !== list.length) {
          await journal.setFlag(MODULE_ID, MESSAGES_DATA_FLAG, next);
        }
        if (nextGroups.length !== groupList.length) {
          await journal.setFlag(MODULE_ID, GROUPS_DATA_FLAG, nextGroups);
        }
      }
    }
  }

  const chatMatches = Array.from(game?.messages?.contents || []).filter((m) => {
    const isPhoneMsg = Boolean(m.getFlag?.(MODULE_ID, "fromPhone") || m.flags?.[MODULE_ID]?.fromPhone);
    if (!isPhoneMsg && classifyChatMessageForPhone(m) !== "text") return false;
    return getPhoneMessageThreadKey(m).threadKey === threadKey;
  });
  for (const chatMsg of chatMatches) {
    if (typeof chatMsg.delete === "function") {
      await chatMsg.delete();
    }
  }

  return true;
}

async function deleteAllPhoneMessagesAsGM() {
  if (!game?.user?.isGM) return false;

  _optimisticPhoneGroups = [];
  if (_ephemeralPhoneMessages.length > 0) {
    _ephemeralPhoneMessages = [];
  }
  game?.socket?.emit?.(`module.${MODULE_ID}`, {
    action: "deleteAllPhoneMessages"
  });

  const journal = findMessagesJournal();
  if (journal) {
    _knownPhoneMessageIds = new Set();
    if (getAllConfiguredNpcContactIds().length === 0 && typeof journal.delete === "function") {
      await journal.delete();
    } else {
      await journal.setFlag(MODULE_ID, MESSAGES_DATA_FLAG, []);
      await journal.setFlag(MODULE_ID, GROUPS_DATA_FLAG, []);
    }
  }

  const chatMatches = Array.from(game?.messages?.contents || []).filter((m) => {
    const isPhoneMsg = Boolean(m.getFlag?.(MODULE_ID, "fromPhone") || m.flags?.[MODULE_ID]?.fromPhone);
    return isPhoneMsg || classifyChatMessageForPhone(m) === "text";
  });
  for (const chatMsg of chatMatches) {
    if (typeof chatMsg.delete === "function") {
      await chatMsg.delete();
    }
  }

  return true;
}

async function deletePlayerPhoneProfileAsGM(userId) {
  const uid = String(userId || "").trim();
  if (!game?.user?.isGM || !uid) return false;

  const targetUser = game?.users?.get?.(uid);
  if (targetUser && typeof targetUser.unsetFlag === "function") {
    for (const flagKey of USER_PHONE_FLAGS) {
      const hasFlag = targetUser.getFlag?.(MODULE_ID, flagKey) !== undefined
        || targetUser.flags?.[MODULE_ID]?.[flagKey] !== undefined;
      if (hasFlag) {
        await targetUser.unsetFlag(MODULE_ID, flagKey);
      }
    }
  }

  const album = findPlayerAlbumJournal(uid);
  if (album && typeof album.delete === "function") {
    await album.delete();
  }

  _ephemeralPhoneMessages = removePhoneMessagesByUserId(_ephemeralPhoneMessages, uid);
  _optimisticPhoneGroups = removeUserFromPhoneGroups(_optimisticPhoneGroups, uid);
  game?.socket?.emit?.(`module.${MODULE_ID}`, {
    action: "resetPhoneProfile",
    userId: uid
  });

  const journal = findMessagesJournal();
  if (journal) {
    const existing = journal.getFlag?.(MODULE_ID, MESSAGES_DATA_FLAG) ?? journal.flags?.[MODULE_ID]?.[MESSAGES_DATA_FLAG];
    const list = Array.isArray(existing) ? existing : [];
    const next = removePhoneMessagesByUserId(list, uid);

    const existingGroups = journal.getFlag?.(MODULE_ID, GROUPS_DATA_FLAG) ?? journal.flags?.[MODULE_ID]?.[GROUPS_DATA_FLAG];
    const groupList = Array.isArray(existingGroups) ? existingGroups : [];
    const nextGroups = removeUserFromPhoneGroups(groupList, uid);

    if (next.length !== list.length || nextGroups.length !== groupList.length) {
      _knownPhoneMessageIds = new Set(next.map((m) => m?.id).filter(Boolean));
      if (next.length === 0 && nextGroups.length === 0 && getAllConfiguredNpcContactIds().length === 0 && typeof journal.delete === "function") {
        await journal.delete();
      } else {
        if (next.length !== list.length) {
          await journal.setFlag(MODULE_ID, MESSAGES_DATA_FLAG, next);
        }
        if (nextGroups.length !== groupList.length) {
          await journal.setFlag(MODULE_ID, GROUPS_DATA_FLAG, nextGroups);
        }
      }
    }
  }

  const chatMatches = Array.from(game?.messages?.contents || []).filter((m) => {
    const isPhoneMsg = Boolean(m.getFlag?.(MODULE_ID, "fromPhone") || m.flags?.[MODULE_ID]?.fromPhone);
    if (!isPhoneMsg && classifyChatMessageForPhone(m) !== "text") return false;
    const meta = getPhoneMessageThreadKey(m);
    return (meta.kind === "dm" && meta.participants.includes(uid)) || (meta.kind === "npc" && meta.playerUserId === uid);
  });
  for (const chatMsg of chatMatches) {
    if (typeof chatMsg.delete === "function") {
      await chatMsg.delete();
    }
  }

  return true;
}

function getStoredPhoneGroups() {
  const journal = findMessagesJournal();
  const raw = journal?.getFlag?.(MODULE_ID, GROUPS_DATA_FLAG) ?? journal?.flags?.[MODULE_ID]?.[GROUPS_DATA_FLAG];
  const stored = Array.isArray(raw) ? raw : [];
  const byId = new Map();
  for (const g of stored) {
    if (g?.id) byId.set(g.id, g);
  }
  for (const g of _optimisticPhoneGroups) {
    if (g?.id && !byId.has(g.id)) byId.set(g.id, g);
  }
  return Array.from(byId.values());
}

function getPhoneGroupById(groupId) {
  if (!groupId) return null;
  return getStoredPhoneGroups().find((g) => g.id === groupId) || null;
}

function getGroupWhisperRecipients(group) {
  if (!group) return [];
  const members = Array.isArray(group.memberIds) ? group.memberIds.map(String) : [];
  const hasNpcs = Array.isArray(group.npcIds) && group.npcIds.length > 0;
  const gmIds = hasNpcs ? (ChatMessage.getWhisperRecipients?.("GM")?.map((u) => String(u.id)) || []) : [];
  return Array.from(new Set([...members, ...gmIds].filter(Boolean)));
}

async function createPhoneGroupAsGM(group) {
  if (!game?.user?.isGM || !group?.id) return null;
  const journal = await ensureMessagesJournalAsGM();
  if (!journal) return null;
  const existing = journal.getFlag?.(MODULE_ID, GROUPS_DATA_FLAG) ?? journal.flags?.[MODULE_ID]?.[GROUPS_DATA_FLAG];
  const list = Array.isArray(existing) ? existing : [];
  if (list.some((g) => g.id === group.id)) return group;
  const next = [...list, group];
  await journal.setFlag(MODULE_ID, GROUPS_DATA_FLAG, next);
  return group;
}

async function createPhoneGroup({ name = "", memberIds = [], npcIds = [] } = {}) {
  const currentUserId = String(game?.user?.id || "");
  const cleanMembers = Array.from(new Set(memberIds.map(String).filter(Boolean)));
  const cleanNpcs = Array.from(new Set(npcIds.map(String).filter(Boolean)));
  let resolvedName = String(name || "").trim();
  if (!resolvedName) {
    const names = [
      ...cleanMembers.map((id) => {
        const u = game?.users?.get?.(id);
        return u?.character?.name || u?.name || "";
      }),
      ...cleanNpcs.map((id) => game?.actors?.get?.(id)?.name || "")
    ].filter(Boolean);
    resolvedName = names.slice(0, 3).join(", ") + (names.length > 3 ? ` +${names.length - 3}` : "");
  }
  const group = {
    id: `grp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: resolvedName || "Group Chat",
    memberIds: cleanMembers,
    npcIds: cleanNpcs,
    createdBy: currentUserId,
    createdAt: Date.now()
  };

  _optimisticPhoneGroups = [..._optimisticPhoneGroups, group];
  if (game?.user?.isGM) {
    await createPhoneGroupAsGM(group);
  } else if (game?.users?.activeGM) {
    game.socket?.emit(`module.${MODULE_ID}`, {
      action: "createPhoneGroup",
      group
    });
  }
  return group;
}

async function sendPhoneMessage({ content, whisper = [], npcId = "", playerUserId = "", playerActorId = "", senderActorId = "", targetActorId = "", groupId = "", ephemeral = false }) {
  const isGM = Boolean(game?.user?.isGM);
  const currentUserId = String(game?.user?.id || "");
  const npcActor = npcId ? game?.actors?.get?.(npcId) : null;
  const isGmReplyingAsNpc = Boolean(npcId && isGM && (groupId || (playerUserId && playerUserId !== currentUserId)));

  let resolvedWhisper = Array.isArray(whisper) ? whisper.map(String) : [];
  if (npcId && !groupId) {
    if (isGmReplyingAsNpc) {
      resolvedWhisper = [String(playerUserId)];
    } else {
      const gmRecipients = ChatMessage.getWhisperRecipients?.("GM")?.map((u) => u.id) || [];
      resolvedWhisper = gmRecipients.length > 0 ? gmRecipients : resolvedWhisper;
    }
  }

  const activePhoneActor = getActivePhoneActor();
  const resolvedPlayerActorId = (npcId && !groupId)
    ? String(playerActorId || (!isGmReplyingAsNpc ? (activePhoneActor?.id || "") : ""))
    : "";
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    authorId: isGmReplyingAsNpc ? `npc:${npcId}` : currentUserId,
    sender: isGmReplyingAsNpc
      ? String(npcActor?.name || "NPC")
      : String(activePhoneActor?.name || game?.user?.name || "Unknown"),
    whisper: resolvedWhisper,
    npcId: npcId ? String(npcId) : "",
    playerUserId: (npcId && !groupId) ? String(playerUserId || currentUserId) : "",
    playerActorId: resolvedPlayerActorId,
    senderActorId: (!npcId && !groupId) ? String(senderActorId || (!isGM ? (activePhoneActor?.id || "") : "")) : "",
    targetActorId: (!npcId && !groupId) ? String(targetActorId || "") : "",
    groupId: groupId ? String(groupId) : "",
    timestamp: Date.now(),
    content: String(content || "")
  };

  if (ephemeral) {
    _ephemeralPhoneMessages = [..._ephemeralPhoneMessages, entry].slice(-MAX_EPHEMERAL_PHONE_MESSAGES);
    game?.socket?.emit?.(`module.${MODULE_ID}`, {
      action: "ephemeralPhoneMessage",
      message: entry
    });
    renderPhoneContents();
    return;
  }

  const speaker = isGmReplyingAsNpc && npcActor
    ? ChatMessage.getSpeaker({ actor: npcActor })
    : ChatMessage.getSpeaker({ actor: activePhoneActor });
  await ChatMessage.create({
    content: entry.content,
    speaker,
    whisper: entry.whisper,
    flags: {
      [MODULE_ID]: {
        fromPhone: true,
        ...(entry.npcId ? {
          npcId: entry.npcId,
          playerUserId: entry.playerUserId,
          ...(entry.playerActorId ? { playerActorId: entry.playerActorId } : {})
        } : {}),
        ...(entry.senderActorId ? { senderActorId: entry.senderActorId } : {}),
        ...(entry.targetActorId ? { targetActorId: entry.targetActorId } : {}),
        ...(entry.groupId ? { groupId: entry.groupId } : {})
      }
    }
  });

  if (game?.user?.isGM) {
    await appendPhoneMessageAsGM(entry);
    return;
  }

  if (game?.users?.activeGM) {
    game.socket?.emit(`module.${MODULE_ID}`, {
      action: "appendPhoneMessage",
      message: entry
    });
  }
}

function findAlbumFolder() {
  return Array.from(game?.folders?.contents || []).find(
    (f) => f.type === "JournalEntry" && (f.getFlag?.(MODULE_ID, ALBUM_FOLDER_FLAG) || f.flags?.[MODULE_ID]?.[ALBUM_FOLDER_FLAG])
  ) || null;
}

export function findAlbumJournalInList(journals = [], userId = "", actorId = "", primaryCharacterId = "") {
  const list = Array.from(journals || []);
  if (actorId) {
    const actorMatch = list.find(
      (j) => (j.getFlag?.(MODULE_ID, ALBUM_ACTOR_FLAG) ?? j.flags?.[MODULE_ID]?.[ALBUM_ACTOR_FLAG]) === actorId
    );
    if (actorMatch) return actorMatch;
    if (userId && (!primaryCharacterId || actorId === primaryCharacterId)) {
      const legacyPrimary = list.find((j) => {
        const jUser = j.getFlag?.(MODULE_ID, ALBUM_USER_FLAG) ?? j.flags?.[MODULE_ID]?.[ALBUM_USER_FLAG];
        const jActor = j.getFlag?.(MODULE_ID, ALBUM_ACTOR_FLAG) ?? j.flags?.[MODULE_ID]?.[ALBUM_ACTOR_FLAG];
        return jUser === userId && !jActor;
      });
      if (legacyPrimary) return legacyPrimary;
    }
    return null;
  }
  if (!userId) return null;
  return list.find(
    (j) => (j.getFlag?.(MODULE_ID, ALBUM_USER_FLAG) ?? j.flags?.[MODULE_ID]?.[ALBUM_USER_FLAG]) === userId
  ) || null;
}

function findPlayerAlbumJournal(userId = game?.user?.id, actorId = undefined) {
  const resolvedActorId = actorId !== undefined
    ? actorId
    : (game?.user?.isGM ? "" : (getActivePhoneActor()?.id || ""));
  return findAlbumJournalInList(
    game?.journal?.contents || [],
    userId,
    resolvedActorId,
    game?.user?.character?.id || ""
  );
}

async function createPlayerAlbumAsGM(userId, userName, actorId = "", actorName = "") {
  if (!userId || !game?.user?.isGM) return null;
  const existing = findPlayerAlbumJournal(userId, actorId || "");
  if (existing) return existing;

  let folder = findAlbumFolder();
  if (!folder && typeof Folder !== "undefined") {
    folder = await Folder.create({
      name: ALBUM_FOLDER_NAME,
      type: "JournalEntry",
      flags: { [MODULE_ID]: { [ALBUM_FOLDER_FLAG]: true } }
    });
  }

  const label = actorName || userName || game?.users?.get(userId)?.name || "Player";
  return JournalEntry.create({
    name: `${label}'s Photo Album`,
    folder: folder?.id ?? null,
    ownership: { default: 0, [userId]: 3 },
    flags: {
      [MODULE_ID]: {
        [ALBUM_USER_FLAG]: userId,
        ...(actorId ? { [ALBUM_ACTOR_FLAG]: actorId } : {})
      }
    }
  });
}

async function ensurePlayerAlbumJournal() {
  const userId = game?.user?.id;
  if (!userId) return null;
  const activeActor = game.user.isGM ? null : getActivePhoneActor();
  const actorId = activeActor?.id || "";
  const actorName = activeActor?.name || "";

  const existing = findPlayerAlbumJournal(userId, actorId);
  if (existing) return existing;

  if (game.user.isGM || JournalEntry?.canUserCreate?.(game.user)) {
    let folder = findAlbumFolder();
    if (!folder && typeof Folder !== "undefined" && (game.user.isGM || Folder.canUserCreate?.(game.user))) {
      folder = await Folder.create({
        name: ALBUM_FOLDER_NAME,
        type: "JournalEntry",
        flags: { [MODULE_ID]: { [ALBUM_FOLDER_FLAG]: true } }
      });
    }
    const label = actorName || game.user.name || "Player";
    return JournalEntry.create({
      name: `${label}'s Photo Album`,
      folder: folder?.id ?? null,
      ownership: { default: 0, [userId]: 3 },
      flags: {
        [MODULE_ID]: {
          [ALBUM_USER_FLAG]: userId,
          ...(actorId ? { [ALBUM_ACTOR_FLAG]: actorId } : {})
        }
      }
    });
  }

  if (!game.users?.activeGM) {
    ui?.notifications?.warn?.("An active GM is required to initialize your Photo Album journal.");
    return null;
  }

  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(findPlayerAlbumJournal(userId, actorId)), 3000);
    const hookId = Hooks.on("createJournalEntry", (doc) => {
      const docActorId = doc.getFlag?.(MODULE_ID, ALBUM_ACTOR_FLAG) ?? doc.flags?.[MODULE_ID]?.[ALBUM_ACTOR_FLAG];
      const docUserId = doc.getFlag?.(MODULE_ID, ALBUM_USER_FLAG) ?? doc.flags?.[MODULE_ID]?.[ALBUM_USER_FLAG];
      const matched = actorId ? docActorId === actorId : docUserId === userId;
      if (matched) {
        clearTimeout(timer);
        Hooks.off("createJournalEntry", hookId);
        resolve(doc);
      }
    });
    game.socket?.emit(`module.${MODULE_ID}`, {
      action: "ensurePhoneAlbum",
      userId,
      userName: game.user.name,
      actorId,
      actorName
    });
  });
}

function getCombinedPhotos() {
  const album = findPlayerAlbumJournal();
  const cloudPhotos = Array.from(album?.pages?.contents || [])
    .map((p) => extractPhotoFromJournalPage(p))
    .filter(Boolean);
  const cloudKeys = new Set(cloudPhotos.map((p) => p.photoKey));
  const sessionPhotos = _sessionPhotos.filter((p) => !cloudKeys.has(p.id));
  return [...sessionPhotos, ...cloudPhotos].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

function saveCapturedPhoto(photo) {
  _sessionPhotos = [photo, ..._sessionPhotos].slice(0, MAX_SESSION_PHOTOS);
}

async function saveSessionPhotoToCloud(photoId) {
  const photo = _sessionPhotos.find((p) => p.id === photoId);
  if (!photo) return null;

  const album = await ensurePlayerAlbumJournal();
  if (!album) return null;

  const pageData = buildPhotoJournalPageData(photo);
  const created = await album.createEmbeddedDocuments("JournalEntryPage", [pageData]);
  const createdPage = Array.isArray(created) ? created[0] : created;
  _sessionPhotos = _sessionPhotos.filter((p) => p.id !== photoId);
  return createdPage ? extractPhotoFromJournalPage(createdPage) : null;
}

async function deletePhotoById(photoId) {
  if (!photoId) return;
  const inSession = _sessionPhotos.some((p) => p.id === photoId);
  if (inSession) {
    _sessionPhotos = _sessionPhotos.filter((p) => p.id !== photoId);
    return;
  }
  const album = findPlayerAlbumJournal();
  const page = album?.pages?.get?.(photoId);
  if (page) {
    await page.delete();
  }
}

function capturePhoneViewfinderSnapshot(viewfinderEl) {
  const boardCanvas = canvas?.app?.view;
  if (!viewfinderEl || !boardCanvas || !canvas?.app?.renderer || !canvas?.stage) {
    ui?.notifications?.warn?.("No active scene canvas to capture.");
    return null;
  }

  try {
    canvas.app.renderer.render(canvas.stage);

    const vfRect = viewfinderEl.getBoundingClientRect();
    const cvRect = boardCanvas.getBoundingClientRect();
    const scaleX = boardCanvas.width / (cvRect.width || 1);
    const scaleY = boardCanvas.height / (cvRect.height || 1);

    const sx = Math.max(0, Math.round((vfRect.left - cvRect.left) * scaleX));
    const sy = Math.max(0, Math.round((vfRect.top - cvRect.top) * scaleY));
    const sw = Math.max(1, Math.min(boardCanvas.width - sx, Math.round(vfRect.width * scaleX)));
    const sh = Math.max(1, Math.min(boardCanvas.height - sy, Math.round(vfRect.height * scaleY)));

    const maxOutWidth = 640;
    const outScale = sw > maxOutWidth ? maxOutWidth / sw : 1;
    const outW = Math.max(1, Math.round(sw * outScale));
    const outH = Math.max(1, Math.round(sh * outScale));

    const offscreen = document.createElement("canvas");
    offscreen.width = outW;
    offscreen.height = outH;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(boardCanvas, sx, sy, sw, sh, 0, 0, outW, outH);
    let dataUrl = offscreen.toDataURL("image/webp", 0.78);
    if (!dataUrl.startsWith("data:image/webp")) {
      dataUrl = offscreen.toDataURL("image/jpeg", 0.82);
    }
    const ts = Date.now();

    return {
      id: `${ts}-${Math.random().toString(36).slice(2, 6)}`,
      dataUrl,
      timestamp: ts,
      dateLabel: formatPhotoPageDate(ts),
      sceneName: canvas?.scene?.name || "Scene",
      source: "session"
    };
  } catch (err) {
    ui?.notifications?.warn?.("Unable to capture snapshot (this scene may use an external non-CORS image).");
    console.warn(`${MODULE_ID} | Camera capture blocked:`, err);
    return null;
  }
}

function getSavedWallpaper() {
  try {
    const flagVal = game?.user?.getFlag?.(MODULE_ID, USER_WALLPAPER_FLAG) ?? game?.user?.flags?.[MODULE_ID]?.[USER_WALLPAPER_FLAG];
    if (flagVal && typeof flagVal === "object") return flagVal;
    const raw = localStorage.getItem(getScopedStorageKey(WALLPAPER_STORAGE_KEY));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveWallpaper(wp) {
  try {
    if (game?.user?.setFlag) {
      game.user.setFlag(MODULE_ID, USER_WALLPAPER_FLAG, wp).catch((err) => {
        console.warn(`${MODULE_ID} | Failed to save wallpaper to user flag:`, err);
      });
    }
    localStorage.setItem(getScopedStorageKey(WALLPAPER_STORAGE_KEY), JSON.stringify(wp));
  } catch (err) {
    ui?.notifications?.warn?.("Unable to save wallpaper.");
    console.warn(`${MODULE_ID} | Failed to save wallpaper:`, err);
  }
}

function clearSavedWallpaper() {
  try {
    if (game?.user?.unsetFlag) {
      game.user.unsetFlag(MODULE_ID, USER_WALLPAPER_FLAG).catch((err) => {
        console.warn(`${MODULE_ID} | Failed to clear wallpaper user flag:`, err);
      });
    }
    localStorage.removeItem(getScopedStorageKey(WALLPAPER_STORAGE_KEY));
    localStorage.removeItem(WALLPAPER_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

function compressWallpaperFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 480;
        const scale = img.width > maxW ? maxW / img.width : 1;
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, w, h);
        let out = c.toDataURL("image/webp", 0.8);
        if (!out.startsWith("data:image/webp")) out = c.toDataURL("image/jpeg", 0.82);
        resolve(out);
      };
      img.onerror = () => resolve(null);
      img.src = String(reader.result || "");
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

// -----------------------------------------------------------------------------
// Drag & Position Persistence
// -----------------------------------------------------------------------------

function applySavedPhonePosition(root) {
  try {
    const flagPos = game?.user?.getFlag?.(MODULE_ID, USER_POSITION_FLAG) ?? game?.user?.flags?.[MODULE_ID]?.[USER_POSITION_FLAG];
    const raw = !flagPos ? localStorage.getItem(getScopedStorageKey(POSITION_STORAGE_KEY)) : null;
    const pos = flagPos || (raw ? JSON.parse(raw) : null);
    if (Number.isFinite(pos?.left) && Number.isFinite(pos?.top)) {
      root.style.right = "auto";
      root.style.bottom = "auto";
      root.style.left = `${pos.left}px`;
      root.style.top = `${pos.top}px`;
    }
  } catch {
    // Ignore storage errors
  }
}

function clampPhoneToViewport(root) {
  if (!root || typeof window === "undefined") return;
  if (!root.style.left && !root.style.top) return;
  const rect = root.getBoundingClientRect();
  const maxLeft = Math.max(8, window.innerWidth - rect.width - 8);
  const maxTop = Math.max(8, window.innerHeight - rect.height - 8);
  const clampedLeft = Math.min(Math.max(8, rect.left), maxLeft);
  const clampedTop = Math.min(Math.max(8, rect.top), maxTop);
  root.style.right = "auto";
  root.style.bottom = "auto";
  root.style.left = `${clampedLeft}px`;
  root.style.top = `${clampedTop}px`;
}

function makePhoneDraggable(handleEl, root, onClickWithoutDrag = null, options = {}) {
  if (!handleEl || !root) return;
  handleEl.addEventListener("pointerdown", (ev) => {
    if (ev.button !== 0) return;
    if (options.ignoreButtons && ev.target?.closest?.("button, a, input, select, textarea")) return;
    const rect = root.getBoundingClientRect();
    const startX = ev.clientX;
    const startY = ev.clientY;
    const startLeft = rect.left;
    const startTop = rect.top;
    let hasDragged = false;

    handleEl.setPointerCapture?.(ev.pointerId);

    const onMove = (moveEv) => {
      const dx = moveEv.clientX - startX;
      const dy = moveEv.clientY - startY;
      if (!hasDragged && Math.hypot(dx, dy) < 4) return;
      hasDragged = true;
      handleEl.classList.add("is-dragging");

      const currentRect = root.getBoundingClientRect();
      const maxLeft = Math.max(8, window.innerWidth - currentRect.width - 8);
      const maxTop = Math.max(8, window.innerHeight - currentRect.height - 8);
      const nextLeft = Math.min(Math.max(8, startLeft + dx), maxLeft);
      const nextTop = Math.min(Math.max(8, startTop + dy), maxTop);

      root.style.right = "auto";
      root.style.bottom = "auto";
      root.style.left = `${nextLeft}px`;
      root.style.top = `${nextTop}px`;
    };

    const onUp = () => {
      handleEl.classList.remove("is-dragging");
      handleEl.removeEventListener("pointermove", onMove);
      handleEl.removeEventListener("pointerup", onUp);
      handleEl.removeEventListener("pointercancel", onUp);

      if (hasDragged) {
        try {
          const finalRect = root.getBoundingClientRect();
          const pos = {
            left: Math.round(finalRect.left),
            top: Math.round(finalRect.top)
          };
          localStorage.setItem(getScopedStorageKey(POSITION_STORAGE_KEY), JSON.stringify(pos));
          game?.user?.setFlag?.(MODULE_ID, USER_POSITION_FLAG, pos).catch(() => { });
        } catch {
          // Ignore storage errors
        }
      } else if (typeof onClickWithoutDrag === "function") {
        onClickWithoutDrag();
      }
    };

    handleEl.addEventListener("pointermove", onMove);
    handleEl.addEventListener("pointerup", onUp);
    handleEl.addEventListener("pointercancel", onUp);
  });
}

// -----------------------------------------------------------------------------
// Scoped Styles
// -----------------------------------------------------------------------------

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    body.${HIDE_SIDEBAR_BODY_CLASS} #sidebar,
    body.${HIDE_SIDEBAR_BODY_CLASS} #chat-notifications {
      display: none !important;
    }

    #${WIDGET_ID} {
      position: fixed;
      right: 18px;
      bottom: 18px;
      z-index: 95;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    #${WIDGET_ID} .cd-phone-launcher {
      display: inline-flex;
      align-items: center;
      flex-wrap: nowrap;
      gap: 8px;
      width: auto;
      min-width: max-content;
      white-space: nowrap;
      padding: 10px 18px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.22);
      background: linear-gradient(135deg, #1e2433, #111622);
      color: #f4f7ff;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(0,0,0,0.45);
    }

    #${WIDGET_ID} .cd-phone-badge {
      background: #ff3b30;
      color: #fff;
      border-radius: 999px;
      min-width: 22px;
      height: 22px;
      padding: 0 7px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      line-height: 1;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    }

    #${WIDGET_ID} .cd-phone-device {
      --phone-bg: #0f131d;
      --phone-surface: #1b2234;
      --phone-text: #f3f6ff;
      --phone-muted: #9aa5c4;
      --phone-accent: #0a84ff;
      --phone-radius: 32px;
      width: 330px;
      height: 600px;
      max-height: calc(100vh - 36px);
      background: var(--phone-bg);
      color: var(--phone-text);
      border-radius: var(--phone-radius);
      border: 4px solid #2c3347;
      box-shadow: 0 18px 48px rgba(0,0,0,0.65);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }

    #${WIDGET_ID} .cd-phone-statusbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px 6px;
      font-size: 11px;
      color: var(--phone-text);
      background: #0b0e16;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      cursor: grab;
      user-select: none;
      touch-action: none;
    }

    #${WIDGET_ID} .cd-phone-statusbar.is-dragging,
    #${WIDGET_ID} .cd-phone-launcher.is-dragging {
      cursor: grabbing;
    }

    #${WIDGET_ID} .cd-phone-notch {
      width: 68px;
      height: 12px;
      border-radius: 999px;
      background: #05070b;
    }

    #${WIDGET_ID} .cd-phone-signal {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      color: var(--phone-muted);
    }

    #${WIDGET_ID} .cd-phone-pulldown-trigger {
      width: auto;
      height: auto;
      min-height: 0;
      padding: 2px 6px;
      margin: -2px -6px -2px 0;
      border: none;
      border-radius: 999px;
      box-shadow: none;
      background: transparent;
      font: inherit;
      font-size: 11px;
      line-height: 1;
      cursor: pointer;
      transition: background 0.14s ease, color 0.14s ease;
    }

    #${WIDGET_ID} .cd-phone-pulldown-trigger:hover,
    #${WIDGET_ID} .cd-phone-pulldown-trigger.is-open {
      background: rgba(255, 255, 255, 0.12);
      color: var(--phone-text);
    }

    @keyframes cd-phone-pulldown-slide {
      from {
        opacity: 0;
        transform: translateY(-14px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    #${WIDGET_ID} .cd-phone-pulldown-backdrop {
      position: absolute;
      inset: 28px 0 0 0;
      z-index: 28;
      background: rgba(5, 7, 12, 0.56);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }

    #${WIDGET_ID} .cd-phone-pulldown-shade {
      position: absolute;
      top: 32px;
      left: 8px;
      right: 8px;
      max-height: calc(100% - 76px);
      z-index: 29;
      background: rgba(15, 19, 29, 0.96);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 18px;
      padding: 12px 12px 8px;
      box-shadow: 0 14px 32px rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
      gap: 10px;
      overflow-y: auto;
      animation: cd-phone-pulldown-slide 0.18s cubic-bezier(0.22, 1, 0.36, 1);
    }

    #${WIDGET_ID} .cd-phone-pulldown-hero {
      margin-bottom: 0;
      padding: 12px;
    }

    #${WIDGET_ID} .cd-phone-pulldown-hero-main {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 4px;
    }

    #${WIDGET_ID} .cd-phone-pulldown-avatar {
      width: 34px;
      height: 34px;
      border-radius: 999px;
      object-fit: cover;
      flex-shrink: 0;
    }

    #${WIDGET_ID} .cd-phone-pulldown-avatar.is-fallback {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--phone-accent);
      color: #fff;
      font-size: 14px;
      font-weight: 700;
    }

    #${WIDGET_ID} .cd-phone-pulldown-profile-meta {
      flex: 1;
      min-width: 0;
    }

    #${WIDGET_ID} .cd-phone-pulldown-profile-name {
      font-size: 13px;
      font-weight: 700;
      color: var(--phone-text);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #${WIDGET_ID} .cd-phone-pulldown-profile-sub {
      font-size: 9px;
      letter-spacing: 0.08em;
      color: var(--phone-muted);
      font-weight: 700;
      margin-top: 1px;
    }

    #${WIDGET_ID} .cd-phone-pulldown-switch-btn {
      width: auto;
      height: auto;
      min-height: 0;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 5px 9px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      box-shadow: none;
      background: rgba(255, 255, 255, 0.08);
      color: var(--phone-text);
      font: inherit;
      font-size: 10px;
      font-weight: 600;
      line-height: 1;
      cursor: pointer;
      flex-shrink: 0;
    }

    #${WIDGET_ID} .cd-phone-pulldown-switch-btn:hover {
      background: rgba(255, 255, 255, 0.16);
    }

    #${WIDGET_ID} .cd-phone-pulldown-actor-list {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    #${WIDGET_ID} .cd-phone-pulldown-notifs-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    #${WIDGET_ID} .cd-phone-pulldown-section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--phone-muted);
      padding: 0 2px;
    }

    #${WIDGET_ID} .cd-phone-pulldown-clear-btn {
      width: auto;
      height: auto;
      min-height: 0;
      padding: 2px 7px;
      border: none;
      border-radius: 999px;
      box-shadow: none;
      background: rgba(255, 255, 255, 0.08);
      color: var(--phone-text);
      font: inherit;
      font-size: 10px;
      font-weight: 600;
      text-transform: none;
      letter-spacing: 0;
      cursor: pointer;
    }

    #${WIDGET_ID} .cd-phone-pulldown-clear-btn:hover {
      background: rgba(255, 255, 255, 0.16);
    }

    #${WIDGET_ID} .cd-phone-pulldown-notifs-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    #${WIDGET_ID} .cd-phone-pulldown-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 12px 8px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.03);
      color: var(--phone-muted);
      font-size: 11px;
    }

    #${WIDGET_ID} .cd-phone-pulldown-notif-item {
      width: 100%;
      height: auto;
      min-height: 0;
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 8px 9px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: none;
      background: rgba(255, 255, 255, 0.06);
      color: var(--phone-text);
      text-align: left;
      font: inherit;
      cursor: pointer;
      transition: background 0.14s ease;
    }

    #${WIDGET_ID} .cd-phone-pulldown-notif-item:hover {
      background: rgba(255, 255, 255, 0.12);
    }

    #${WIDGET_ID} .cd-phone-pulldown-notif-icon {
      width: 26px;
      height: 26px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 12px;
      flex-shrink: 0;
    }

    #${WIDGET_ID} .cd-phone-pulldown-notif-body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    #${WIDGET_ID} .cd-phone-pulldown-notif-title {
      font-size: 12px;
      font-weight: 600;
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #${WIDGET_ID} .cd-phone-pulldown-notif-preview {
      font-size: 11px;
      color: var(--phone-muted);
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #${WIDGET_ID} .cd-phone-pulldown-grabber {
      width: 100%;
      height: 14px;
      min-height: 0;
      padding: 0;
      margin: 0;
      border: none;
      box-shadow: none;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    #${WIDGET_ID} .cd-phone-pulldown-grabber span {
      width: 34px;
      height: 4px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.28);
    }

    #${WIDGET_ID} .cd-phone-screen {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 12px;
    }

    #${WIDGET_ID} .cd-phone-hero-card {
      background: linear-gradient(135deg, var(--phone-accent), rgba(255,255,255,0.12));
      border-radius: 16px;
      padding: 14px;
      margin-bottom: 14px;
    }

    #${WIDGET_ID} .cd-phone-hero-card.is-switchable {
      width: 100%;
      height: auto;
      min-height: 0;
      padding: 14px;
      margin: 0 0 14px 0;
      border: none;
      box-sizing: border-box;
      box-shadow: none;
      color: var(--phone-text);
      text-align: left;
      cursor: pointer;
      display: block;
      font: inherit;
      line-height: normal;
      transition: transform 0.12s ease, filter 0.15s ease;
    }

    #${WIDGET_ID} .cd-phone-hero-card.is-switchable:hover {
      filter: brightness(1.08);
    }

    #${WIDGET_ID} .cd-phone-hero-card.is-switchable:active {
      transform: scale(0.99);
    }

    #${WIDGET_ID} .cd-phone-hero-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    #${WIDGET_ID} .cd-phone-hero-switch {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.24);
      color: rgba(255, 255, 255, 0.92);
      flex-shrink: 0;
    }

    #${WIDGET_ID} .cd-phone-hero-sub {
      font-size: 10px;
      letter-spacing: 0.08em;
      opacity: 0.85;
      font-weight: 700;
    }

    #${WIDGET_ID} .cd-phone-hero-title {
      font-size: 16px;
      font-weight: 700;
      margin: 2px 0;
    }

    #${WIDGET_ID} .cd-phone-hero-meta {
      font-size: 11px;
      opacity: 0.9;
    }

    #${WIDGET_ID} .cd-phone-actor-picker-card {
      background: rgba(15, 19, 29, 0.92);
      border: 1px solid var(--phone-border);
      border-radius: 14px;
      padding: 10px;
      margin: -6px 0 14px;
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
    }

    #${WIDGET_ID} .cd-phone-actor-picker-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--phone-muted);
      margin-bottom: 8px;
    }

    #${WIDGET_ID} .cd-phone-actor-picker-close {
      width: 22px;
      height: 22px;
      min-height: 0;
      padding: 0;
      line-height: 1;
      border-radius: 999px;
      border: none;
      box-shadow: none;
      background: rgba(255, 255, 255, 0.08);
      color: var(--phone-text);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
    }

    #${WIDGET_ID} .cd-phone-actor-picker-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    #${WIDGET_ID} .cd-phone-actor-picker-item {
      width: 100%;
      height: auto;
      min-height: 0;
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 7px 9px;
      border-radius: 10px;
      border: 1px solid transparent;
      box-shadow: none;
      background: rgba(255, 255, 255, 0.05);
      color: var(--phone-text);
      cursor: pointer;
      text-align: left;
      font: inherit;
      font-size: 12px;
      line-height: 1.25;
    }

    #${WIDGET_ID} .cd-phone-actor-picker-item:hover {
      background: rgba(255, 255, 255, 0.11);
    }

    #${WIDGET_ID} .cd-phone-actor-picker-item.is-active {
      border-color: var(--phone-accent);
      background: rgba(255, 255, 255, 0.12);
      font-weight: 600;
    }

    #${WIDGET_ID} .cd-phone-actor-picker-avatar {
      width: 26px;
      height: 26px;
      border-radius: 999px;
      object-fit: cover;
      flex-shrink: 0;
    }

    #${WIDGET_ID} .cd-phone-actor-picker-avatar.is-fallback {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--phone-accent);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
    }

    #${WIDGET_ID} .cd-phone-actor-picker-name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #${WIDGET_ID} .cd-phone-actor-picker-check {
      color: var(--phone-accent);
      font-size: 12px;
      flex-shrink: 0;
    }

    #${WIDGET_ID} .cd-phone-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 6px 2px 8px;
    }

    #${WIDGET_ID} .cd-phone-section-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--phone-muted);
      margin: 0;
    }

    #${WIDGET_ID} .cd-phone-home-done-btn {
      background: rgba(255, 255, 255, 0.18);
      color: var(--phone-text);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 999px;
      padding: 2px 10px;
      height: auto;
      min-height: 0;
      font-size: 11px;
      font-weight: 600;
      line-height: 1.4;
      cursor: pointer;
      box-shadow: none;
    }

    #${WIDGET_ID} .cd-phone-home-done-btn:hover {
      background: rgba(255, 255, 255, 0.28);
    }

    @keyframes cd-phone-jiggle {
      0%, 100% {
        transform: rotate(-1.6deg);
      }
      50% {
        transform: rotate(1.6deg);
      }
    }

    #${WIDGET_ID} .cd-phone-app-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    #${WIDGET_ID} .cd-phone-app-tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      width: 100%;
      height: auto;
      background: transparent;
      border: none;
      box-shadow: none;
      color: var(--phone-text);
      cursor: pointer;
      padding: 4px 2px;
      line-height: 1.2;
      transition: transform 0.12s ease, opacity 0.12s ease;
    }

    #${WIDGET_ID} .cd-phone-app-tile.is-editing {
      touch-action: none;
      user-select: none;
      cursor: grab;
    }

    #${WIDGET_ID} .cd-phone-app-tile.is-editing .cd-phone-app-icon {
      animation: cd-phone-jiggle 0.26s ease-in-out infinite;
    }

    #${WIDGET_ID} .cd-phone-app-tile.is-editing:nth-child(even) .cd-phone-app-icon {
      animation-delay: -0.13s;
    }

    #${WIDGET_ID} .cd-phone-app-tile.is-dragging {
      opacity: 0.65;
      transform: scale(1.08);
      cursor: grabbing;
      z-index: 2;
    }

    #${WIDGET_ID} .cd-phone-app-tile.is-dragging .cd-phone-app-icon {
      animation: none;
    }

    #${WIDGET_ID} .cd-phone-app-icon {
      position: relative;
      width: 52px;
      height: 52px;
      border-radius: 13px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: #fff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
    }

    #${WIDGET_ID} .cd-phone-app-badge {
      position: absolute;
      top: -6px;
      right: -6px;
      background: #ff3b30;
      color: #fff;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      line-height: 1;
      border-radius: 999px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    }

    #${WIDGET_ID} .cd-phone-app-label {
      font-size: 11px;
      color: var(--phone-text);
    }

    #${WIDGET_ID} .cd-phone-app-view {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    #${WIDGET_ID} .cd-phone-app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      font-weight: 700;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      margin-bottom: 8px;
    }

    #${WIDGET_ID} .cd-phone-header-sub {
      font-size: 11px;
      color: var(--phone-muted);
      font-weight: 500;
    }

    #${WIDGET_ID} .cd-phone-thread,
    #${WIDGET_ID} .cd-phone-list {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    #${WIDGET_ID} .cd-phone-bubble-row {
      display: flex;
      flex-direction: column;
      max-width: 85%;
    }

    #${WIDGET_ID} .cd-phone-bubble-row.is-mine {
      align-self: flex-end;
      align-items: flex-end;
    }

    #${WIDGET_ID} .cd-phone-bubble-row.is-theirs {
      align-self: flex-start;
      align-items: flex-start;
    }

    #${WIDGET_ID} .cd-phone-bubble-sender {
      font-size: 10px;
      color: var(--phone-muted);
      margin: 0 4px 2px;
    }

    #${WIDGET_ID} .cd-phone-bubble {
      background: var(--phone-surface);
      padding: 7px 11px;
      border-radius: 14px;
      font-size: 12px;
      line-height: 1.35;
      word-break: break-word;
    }

    #${WIDGET_ID} .cd-phone-bubble span {
      white-space: pre-wrap;
    }

    #${WIDGET_ID} .cd-phone-bubble-row.is-mine .cd-phone-bubble {
      background: var(--phone-accent);
      color: #fff;
    }

    #${WIDGET_ID} .cd-phone-bubble.is-whisper {
      border: 1px solid rgba(255,255,255,0.45);
    }

    #${WIDGET_ID} .cd-phone-bubble-time {
      font-size: 9px;
      color: var(--phone-muted);
      margin-top: 2px;
    }

    #${WIDGET_ID} .cd-phone-composer {
      display: flex;
      align-items: flex-end;
      gap: 5px;
      padding-top: 8px;
    }

    #${WIDGET_ID} .cd-phone-composer textarea {
      flex: 1;
      min-width: 0;
      min-height: 30px;
      max-height: calc(3 * 1.35em + 14px);
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.15);
      background: var(--phone-surface);
      color: var(--phone-text);
      padding: 6px 12px;
      font-size: 12px;
      font-family: inherit;
      line-height: 1.35;
      resize: none;
      overflow-y: hidden;
    }

    #${WIDGET_ID} .cd-phone-composer button {
      width: 30px;
      height: 30px;
      flex-shrink: 0;
      border-radius: 999px;
      border: none;
      background: var(--phone-accent);
      color: #fff;
      cursor: pointer;
    }

    #${WIDGET_ID} .cd-phone-composer button.cd-phone-composer-icon {
      background: rgba(255,255,255,0.1);
      color: var(--phone-text);
      font-size: 13px;
    }

    #${WIDGET_ID} .cd-phone-composer button.cd-phone-composer-icon.is-active {
      background: var(--phone-accent);
      color: #fff;
    }

    #${WIDGET_ID} .cd-phone-bubble.is-emoji-only {
      background: transparent !important;
      padding: 2px 4px;
      font-size: 26px;
      line-height: 1.15;
    }

    #${WIDGET_ID} .cd-phone-bubble-wrap {
      display: flex;
      align-items: center;
      gap: 4px;
      max-width: 100%;
    }

    #${WIDGET_ID} .cd-phone-bubble-row.is-mine .cd-phone-bubble-wrap {
      flex-direction: row-reverse;
    }

    #${WIDGET_ID} .cd-phone-react-trigger {
      opacity: 0;
      border: none;
      background: rgba(255,255,255,0.1);
      color: var(--phone-text);
      width: 20px;
      height: 20px;
      border-radius: 999px;
      font-size: 10px;
      cursor: pointer;
      flex-shrink: 0;
      transition: opacity 0.15s ease;
    }

    #${WIDGET_ID} .cd-phone-bubble-row:hover .cd-phone-react-trigger,
    #${WIDGET_ID} .cd-phone-react-trigger:focus {
      opacity: 0.85;
    }

    #${WIDGET_ID} .cd-phone-react-bar {
      display: flex;
      gap: 3px;
      margin-top: 3px;
      padding: 3px 6px;
      border-radius: 999px;
      background: rgba(22, 24, 32, 0.94);
      border: 1px solid rgba(255,255,255,0.14);
    }

    #${WIDGET_ID} .cd-phone-react-opt {
      border: none;
      background: transparent;
      font-size: 14px;
      padding: 1px 3px;
      cursor: pointer;
      border-radius: 6px;
    }

    #${WIDGET_ID} .cd-phone-react-opt:hover {
      background: rgba(255,255,255,0.14);
    }

    #${WIDGET_ID} .cd-phone-reactions {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 3px;
    }

    #${WIDGET_ID} .cd-phone-reaction-pill {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.08);
      color: var(--phone-text);
      border-radius: 999px;
      padding: 1px 6px;
      font-size: 11px;
      cursor: pointer;
    }

    #${WIDGET_ID} .cd-phone-reaction-pill.is-reacted {
      border-color: var(--phone-accent);
      background: rgba(52, 199, 89, 0.22);
    }

    #${WIDGET_ID} .cd-phone-staged-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
      padding: 6px 8px;
      border-radius: 10px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
    }

    #${WIDGET_ID} .cd-phone-staged-thumb {
      width: 34px;
      height: 34px;
      border-radius: 6px;
      object-fit: cover;
      flex-shrink: 0;
    }

    #${WIDGET_ID} .cd-phone-staged-meta {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    #${WIDGET_ID} .cd-phone-staged-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--phone-text);
    }

    #${WIDGET_ID} .cd-phone-staged-hint {
      font-size: 10px;
      opacity: 0.7;
    }

    #${WIDGET_ID} .cd-phone-staged-clear {
      width: 22px;
      height: 22px;
      border-radius: 999px;
      border: none;
      background: rgba(255,255,255,0.14);
      color: var(--phone-text);
      cursor: pointer;
    }

    #${WIDGET_ID} .cd-phone-popover {
      margin-top: 6px;
      padding: 8px;
      border-radius: 12px;
      background: rgba(22, 24, 32, 0.96);
      border: 1px solid rgba(255,255,255,0.14);
      max-height: 185px;
      overflow-y: auto;
    }

    #${WIDGET_ID} .cd-phone-popover-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      opacity: 0.65;
      margin: 4px 0;
    }

    #${WIDGET_ID} .cd-phone-emoji-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 2px;
    }

    #${WIDGET_ID} .cd-phone-emoji-btn {
      border: none;
      background: transparent;
      border-radius: 6px;
      font-size: 16px;
      padding: 3px 0;
      cursor: pointer;
    }

    #${WIDGET_ID} .cd-phone-emoji-btn:hover {
      background: rgba(255,255,255,0.12);
    }

    #${WIDGET_ID} .cd-phone-popover-tabs {
      display: flex;
      gap: 6px;
      margin-bottom: 8px;
    }

    #${WIDGET_ID} .cd-phone-popover-tab {
      flex: 1;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.06);
      color: var(--phone-text);
      border-radius: 8px;
      padding: 5px 6px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
    }

    #${WIDGET_ID} .cd-phone-popover-tab.is-active {
      background: var(--phone-accent);
      border-color: var(--phone-accent);
      color: #fff;
    }

    #${WIDGET_ID} .cd-phone-attach-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
    }

    #${WIDGET_ID} .cd-phone-attach-thumb {
      width: 100%;
      height: auto;
      min-height: 0;
      border: none;
      padding: 0;
      margin: 0;
      background: transparent;
      border-radius: 8px;
      overflow: hidden;
      aspect-ratio: 1;
      cursor: pointer;
    }

    #${WIDGET_ID} .cd-phone-attach-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    #${WIDGET_ID} .cd-phone-popover-empty {
      font-size: 11px;
      opacity: 0.7;
      text-align: center;
      padding: 12px 4px;
    }

    #${WIDGET_ID} .cd-phone-url-box {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    #${WIDGET_ID} .cd-phone-url-input {
      width: 100%;
      box-sizing: border-box;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.18);
      background: rgba(255,255,255,0.08);
      color: var(--phone-text);
      padding: 6px 8px;
      font-size: 11px;
    }

    #${WIDGET_ID} .cd-phone-url-note {
      font-size: 10px;
      opacity: 0.7;
    }

    #${WIDGET_ID} .cd-phone-url-preview {
      max-height: 84px;
      border-radius: 8px;
      overflow: hidden;
      background: rgba(0,0,0,0.25);
      display: flex;
      justify-content: center;
    }

    #${WIDGET_ID} .cd-phone-url-preview img {
      max-height: 84px;
      max-width: 100%;
      object-fit: contain;
    }

    #${WIDGET_ID} .cd-phone-url-error {
      font-size: 10px;
      color: #ff6b6b;
    }

    #${WIDGET_ID} .cd-phone-url-attach-btn {
      border: none;
      border-radius: 8px;
      padding: 6px;
      background: var(--phone-accent);
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
    }

    #${WIDGET_ID} .cd-phone-url-attach-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    #${WIDGET_ID} .cd-phone-list-item,
    #${WIDGET_ID} .cd-phone-log-card,
    #${WIDGET_ID} .cd-phone-now-playing {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      height: auto;
      min-height: 46px;
      flex-shrink: 0;
      font-family: inherit;
      font-size: inherit;
      line-height: 1.3;
      text-align: left;
      background: var(--phone-surface);
      color: var(--phone-text);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
      padding: 8px 10px;
      cursor: pointer;
    }

    #${WIDGET_ID} .cd-phone-log-card,
    #${WIDGET_ID} .cd-phone-now-playing {
      flex-direction: column;
      align-items: stretch;
      cursor: default;
      gap: 4px;
    }

    #${WIDGET_ID} .cd-phone-log-head {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--phone-muted);
    }

    #${WIDGET_ID} .cd-phone-log-body {
      font-size: 12px;
    }

    #${WIDGET_ID} .cd-phone-list-item.is-selected {
      border-color: var(--phone-accent);
    }

    #${WIDGET_ID} .cd-phone-avatar {
      width: 32px;
      height: 32px;
      border-radius: 999px;
      object-fit: cover;
    }

    #${WIDGET_ID} .cd-phone-doc-icon {
      width: 28px;
      text-align: center;
      color: var(--phone-accent);
    }

    #${WIDGET_ID} .cd-phone-list-meta {
      flex: 1;
      min-width: 0;
    }

    #${WIDGET_ID} .cd-phone-list-title {
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    #${WIDGET_ID} .cd-phone-list-sub {
      font-size: 10px;
      color: var(--phone-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    #${WIDGET_ID} .cd-phone-empty {
      text-align: center;
      color: var(--phone-muted);
      font-size: 12px;
      padding: 24px 8px;
    }

    #${WIDGET_ID} .cd-phone-navbar {
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 8px 16px 10px;
      background: #0b0e16;
      border-top: 1px solid rgba(255,255,255,0.06);
      cursor: grab;
      user-select: none;
      touch-action: none;
    }

    #${WIDGET_ID} .cd-phone-navbar.is-dragging {
      cursor: grabbing;
    }

    #${WIDGET_ID} .cd-phone-nav-btn {
      background: none;
      border: none;
      color: var(--phone-muted);
      cursor: pointer;
      font-size: 13px;
      padding: 4px 12px;
    }

    #${WIDGET_ID} .cd-phone-home-pill {
      display: inline-block;
      width: 44px;
      height: 5px;
      border-radius: 999px;
      background: var(--phone-text);
      opacity: 0.75;
    }

    #${WIDGET_ID} .cd-phone-nav-dice {
      font-size: 15px;
      transition: color 0.15s ease, transform 0.15s ease;
    }

    #${WIDGET_ID} .cd-phone-nav-dice:hover,
    #${WIDGET_ID} .cd-phone-nav-dice.is-active {
      color: var(--phone-accent);
      transform: scale(1.1);
    }

    @keyframes cd-phone-tray-flyout {
      from {
        opacity: 0;
        transform: translateY(18px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    #${WIDGET_ID} .cd-phone-dice-flyout {
      position: absolute;
      left: 8px;
      right: 8px;
      bottom: 44px;
      z-index: 25;
      background: rgba(15, 19, 29, 0.96);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 16px;
      padding: 10px;
      box-shadow: 0 -8px 28px rgba(0, 0, 0, 0.55);
      display: flex;
      flex-direction: column;
      gap: 8px;
      animation: cd-phone-tray-flyout 0.18s cubic-bezier(0.22, 1, 0.36, 1);
    }

    #${WIDGET_ID} .cd-phone-dt-header {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    #${WIDGET_ID} .cd-phone-dt-formula {
      flex: 1;
      min-width: 0;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      color: var(--phone-text);
      font-size: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      padding: 5px 8px;
      outline: none;
    }

    #${WIDGET_ID} .cd-phone-dt-formula:focus {
      border-color: var(--phone-accent);
    }

    #${WIDGET_ID} .cd-phone-dt-close {
      width: 26px;
      height: 26px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.06);
      color: var(--phone-muted);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      flex-shrink: 0;
    }

    #${WIDGET_ID} .cd-phone-dt-close:hover {
      color: var(--phone-text);
      background: rgba(255, 255, 255, 0.14);
    }

    #${WIDGET_ID} .cd-phone-dt-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }

    #${WIDGET_ID} .cd-phone-dt-die {
      position: relative;
      height: 34px;
      border-radius: 9px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.07);
      color: var(--phone-text);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      padding: 0;
      transition: background 0.12s ease, border-color 0.12s ease, transform 0.1s ease;
    }

    #${WIDGET_ID} .cd-phone-dt-die:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.25);
    }

    #${WIDGET_ID} .cd-phone-dt-die:active {
      transform: scale(0.93);
    }

    #${WIDGET_ID} .cd-phone-dt-die.has-count {
      border-color: var(--phone-accent);
      background: rgba(10, 132, 255, 0.22);
    }

    #${WIDGET_ID} .cd-phone-dt-die .gp-d100-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: -0.04em;
    }

    #${WIDGET_ID} .cd-phone-dt-badge {
      position: absolute;
      top: -5px;
      right: -4px;
      min-width: 15px;
      height: 15px;
      padding: 0 3px;
      border-radius: 999px;
      background: var(--phone-accent);
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
    }

    #${WIDGET_ID} .cd-phone-dt-controls {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    #${WIDGET_ID} .cd-phone-dt-mode {
      height: 30px;
      min-width: 48px;
      padding: 0 8px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      background: rgba(255, 255, 255, 0.08);
      color: var(--phone-text);
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
    }

    #${WIDGET_ID} .cd-phone-dt-mode.is-adv {
      background: rgba(52, 199, 89, 0.25);
      border-color: rgba(52, 199, 89, 0.7);
      color: #7bf198;
    }

    #${WIDGET_ID} .cd-phone-dt-mode.is-dis {
      background: rgba(255, 59, 48, 0.25);
      border-color: rgba(255, 59, 48, 0.7);
      color: #ff8a80;
    }

    #${WIDGET_ID} .cd-phone-dt-mod-wrap {
      display: flex;
      align-items: center;
      height: 30px;
      width: 58px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 8px;
      padding: 0 6px;
      gap: 3px;
    }

    #${WIDGET_ID} .cd-phone-dt-mod-prefix {
      font-size: 11px;
      color: var(--phone-muted);
      font-weight: 700;
    }

    #${WIDGET_ID} .cd-phone-dt-mod {
      width: 100%;
      min-width: 0;
      background: transparent;
      border: none;
      color: var(--phone-text);
      font-size: 12px;
      text-align: center;
      outline: none;
      -moz-appearance: textfield;
    }

    #${WIDGET_ID} .cd-phone-dt-mod::-webkit-inner-spin-button,
    #${WIDGET_ID} .cd-phone-dt-mod::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    #${WIDGET_ID} .cd-phone-dt-clear {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      background: rgba(255, 255, 255, 0.08);
      color: var(--phone-muted);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }

    #${WIDGET_ID} .cd-phone-dt-clear:hover {
      color: var(--phone-text);
      background: rgba(255, 255, 255, 0.15);
    }

    #${WIDGET_ID} .cd-phone-dt-roll {
      flex: 1;
      height: 30px;
      border-radius: 8px;
      border: none;
      background: var(--phone-accent);
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }

    #${WIDGET_ID} .cd-phone-dt-roll:hover {
      filter: brightness(1.12);
    }

    #${WIDGET_ID} .cd-phone-device.is-camera-mode {
      background: transparent;
    }

    #${WIDGET_ID} .cd-phone-device.is-camera-mode .cd-phone-screen {
      padding: 0;
      overflow: hidden;
      background: transparent;
    }

    #${WIDGET_ID} .cd-phone-camera-view {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
      background: transparent;
      cursor: grab;
      user-select: none;
      touch-action: none;
    }

    #${WIDGET_ID} .cd-phone-camera-view.is-dragging {
      cursor: grabbing;
    }

    #${WIDGET_ID} .cd-phone-camera-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: #0b0e16;
    }

    #${WIDGET_ID} .cd-phone-camera-pill {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #ffd60a;
      background: rgba(0,0,0,0.55);
      padding: 3px 8px;
      border-radius: 999px;
    }

    #${WIDGET_ID} .cd-phone-camera-tool {
      background: rgba(0,0,0,0.55);
      border: 1px solid rgba(255,255,255,0.2);
      color: #fff;
      border-radius: 8px;
      padding: 4px 8px;
      font-size: 12px;
      cursor: pointer;
    }

    #${WIDGET_ID} .cd-phone-camera-tool.is-active {
      color: #ffd60a;
      border-color: #ffd60a;
    }

    #${WIDGET_ID} .cd-phone-camera-tools {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    #${WIDGET_ID} .cd-phone-camera-collapse {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 2;
      width: 28px;
      height: 28px;
      min-height: 0;
      padding: 0;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.28);
      background: rgba(0,0,0,0.45);
      color: #fff;
      font-size: 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    #${WIDGET_ID} .cd-phone-camera-collapse:hover {
      background: rgba(0,0,0,0.7);
    }

    #${WIDGET_ID} .cd-phone-device.is-camera-expanded .cd-phone-statusbar,
    #${WIDGET_ID} .cd-phone-device.is-camera-expanded .cd-phone-navbar,
    #${WIDGET_ID} .cd-phone-device.is-camera-expanded .cd-phone-camera-top,
    #${WIDGET_ID} .cd-phone-device.is-camera-expanded .cd-phone-cam-thumb,
    #${WIDGET_ID} .cd-phone-device.is-camera-expanded .cd-phone-cam-spacer {
      display: none;
    }

    #${WIDGET_ID} .cd-phone-device.is-camera-expanded .cd-phone-camera-bar {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      justify-content: center;
      padding: 14px 18px;
      background: transparent;
      pointer-events: none;
    }

    #${WIDGET_ID} .cd-phone-device.is-camera-expanded .cd-phone-shutter-btn {
      pointer-events: auto;
    }

    #${WIDGET_ID} .cd-phone-viewfinder {
      position: relative;
      flex: 1;
      min-height: 0;
      background: transparent;
      pointer-events: auto;
    }

    #${WIDGET_ID} .cd-phone-grid-lines {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(to right, rgba(255,255,255,0.22) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.22) 1px, transparent 1px);
      background-size: 33.333% 33.333%;
    }

    #${WIDGET_ID} .cd-phone-reticle {
      position: absolute;
      inset: 14px;
      border: 1px solid rgba(255,255,255,0.28);
      border-radius: 8px;
    }

    #${WIDGET_ID} .cd-phone-shutter-flash {
      position: absolute;
      inset: 0;
      background: #fff;
      opacity: 0;
      pointer-events: none;
    }

    #${WIDGET_ID} .cd-phone-shutter-flash.is-flashing {
      animation: cd-phone-flash 220ms ease-out;
    }

    @keyframes cd-phone-flash {
      0% { opacity: 0.85; }
      100% { opacity: 0; }
    }

    #${WIDGET_ID} .cd-phone-camera-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 18px;
      background: #0b0e16;
    }

    #${WIDGET_ID} .cd-phone-cam-thumb,
    #${WIDGET_ID} .cd-phone-cam-spacer {
      width: 38px;
      height: 38px;
    }

    #${WIDGET_ID} .cd-phone-cam-thumb {
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.35);
      background: rgba(255,255,255,0.12);
      color: #fff;
      padding: 0;
      overflow: hidden;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #${WIDGET_ID} .cd-phone-cam-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    #${WIDGET_ID} .cd-phone-shutter-btn {
      width: 52px;
      height: 52px;
      border-radius: 999px;
      border: 3px solid #fff;
      background: transparent;
      padding: 3px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #${WIDGET_ID} .cd-phone-shutter-btn span {
      width: 100%;
      height: 100%;
      border-radius: 999px;
      background: #fff;
      transition: transform 0.08s ease;
    }

    #${WIDGET_ID} .cd-phone-shutter-btn:active span {
      transform: scale(0.88);
    }

    #${WIDGET_ID} .cd-phone-photo-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      overflow-y: auto;
    }

    #${WIDGET_ID} .cd-phone-photo-cell {
      position: relative;
      width: 100%;
      height: auto;
      min-height: 0;
      aspect-ratio: 1;
      border: none;
      padding: 0;
      margin: 0;
      border-radius: 10px;
      overflow: hidden;
      background: var(--phone-surface);
      cursor: pointer;
    }

    #${WIDGET_ID} .cd-phone-photo-badge {
      position: absolute;
      right: 4px;
      bottom: 4px;
      font-size: 9px;
      padding: 2px 4px;
      border-radius: 6px;
      background: rgba(0,0,0,0.65);
      color: #fff;
    }

    #${WIDGET_ID} .cd-phone-photo-badge.is-cloud {
      color: #64d2ff;
    }

    #${WIDGET_ID} .cd-phone-action-btn.is-cloud {
      background: #1c4e80;
      color: #fff;
      border-color: transparent;
    }

    #${WIDGET_ID} .cd-phone-cloud-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      color: #64d2ff;
      padding: 0 6px;
    }

    #${WIDGET_ID} .cd-phone-photo-cell img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    #${WIDGET_ID} .cd-phone-photo-detail {
      flex: 1;
      min-height: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.35);
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    #${WIDGET_ID} .cd-phone-photo-detail img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    #${WIDGET_ID} .cd-phone-photo-actions {
      display: flex;
      gap: 6px;
    }

    #${WIDGET_ID} .cd-phone-action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border: 1px solid rgba(255,255,255,0.14);
      background: var(--phone-surface);
      color: var(--phone-text);
      border-radius: 10px;
      padding: 7px 10px;
      font-size: 12px;
      cursor: pointer;
    }

    #${WIDGET_ID} .cd-phone-action-btn.is-primary {
      flex: 1;
      background: var(--phone-accent);
      color: #fff;
      border-color: transparent;
    }

    #${WIDGET_ID} .cd-phone-action-btn.is-danger {
      color: #ff453a;
    }

    #${WIDGET_ID} .cd-phone-inline-btn {
      background: none;
      border: none;
      color: var(--phone-accent);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
    }

    #${WIDGET_ID} .cd-phone-bubble-img {
      display: block;
      max-width: 100%;
      border-radius: 8px;
      margin-bottom: 4px;
    }

    #${WIDGET_ID} .cd-phone-swatch-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
      padding: 2px;
    }

    #${WIDGET_ID} .cd-phone-swatch {
      aspect-ratio: 1;
      border-radius: 999px;
      border: 2px solid rgba(255,255,255,0.22);
      cursor: pointer;
      padding: 0;
    }

    #${WIDGET_ID} .cd-phone-swatch.is-selected {
      border-color: #fff;
      box-shadow: 0 0 0 2px var(--phone-accent);
    }

    #${WIDGET_ID} .cd-phone-wallpaper-controls {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    #${WIDGET_ID} .cd-phone-color-input {
      width: 18px;
      height: 18px;
      padding: 0;
      border: none;
      background: transparent;
      cursor: pointer;
    }

    #${WIDGET_ID} .cd-phone-seg-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px;
      padding: 3px;
      border-radius: 10px;
      background: var(--phone-surface);
      margin-bottom: 4px;
    }

    #${WIDGET_ID} .cd-phone-seg-tab {
      border: none;
      background: transparent;
      color: var(--phone-muted);
      font-size: 12px;
      font-weight: 600;
      padding: 6px 8px;
      border-radius: 8px;
      cursor: pointer;
    }

    #${WIDGET_ID} .cd-phone-seg-tab.is-active {
      background: var(--phone-accent);
      color: #fff;
    }

    #${WIDGET_ID} .cd-phone-setting-btn {
      flex: 1;
      justify-content: center;
      text-align: center;
    }

    #${WIDGET_ID} .cd-phone-setting-btn .cd-phone-list-meta {
      flex: 0 1 auto;
    }

    #${WIDGET_ID} .cd-phone-setting-btn.is-accent {
      background: var(--phone-accent);
      color: #fff;
      border-color: transparent;
    }

    #${WIDGET_ID} .cd-phone-list-item.is-danger {
      color: #ff453a;
    }

    #${WIDGET_ID} .cd-phone-list-item.is-danger .cd-phone-list-sub {
      color: rgba(255, 69, 58, 0.78);
    }

    #${WIDGET_ID} .cd-phone-list-item:disabled {
      opacity: 0.45;
      cursor: default;
    }

    #${WIDGET_ID} .cd-phone-filter-pills {
      display: inline-flex;
      gap: 4px;
    }

    #${WIDGET_ID} .cd-phone-filter-pill {
      height: auto;
      border: 1px solid rgba(255,255,255,0.14);
      background: var(--phone-surface);
      color: var(--phone-muted);
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 10px;
      font-weight: 600;
      cursor: pointer;
    }

    #${WIDGET_ID} .cd-phone-filter-pill.is-active {
      background: var(--phone-accent);
      color: #fff;
      border-color: transparent;
    }

    #${WIDGET_ID} .cd-phone-system-log .cd-phone-sys-slot {
      width: 100%;
    }

    #${WIDGET_ID} .cd-phone-system-log .chat-message {
      margin: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box;
      font-size: 12px;
      border-radius: 10px;
      overflow-x: hidden;
      color: #191813;
      background: #f4f1ea;
    }

    #${WIDGET_ID} .cd-phone-system-log .dice-formula,
    #${WIDGET_ID} .cd-phone-system-log .dice-total {
      background: rgba(0, 0, 0, 0.07) !important;
      color: #191813 !important;
      border: 1px solid rgba(0, 0, 0, 0.16);
    }

    #${WIDGET_ID} .cd-phone-system-log .dice-formula *,
    #${WIDGET_ID} .cd-phone-system-log .dice-total * {
      color: #191813 !important;
    }

    #${WIDGET_ID} .cd-phone-system-log .dice-total.success,
    #${WIDGET_ID} .cd-phone-system-log .dice-total.success * {
      color: #18520b !important;
    }

    #${WIDGET_ID} .cd-phone-system-log .dice-total.failure,
    #${WIDGET_ID} .cd-phone-system-log .dice-total.failure * {
      color: #aa0200 !important;
    }

    #${WIDGET_ID} .cd-phone-system-log .chat-message img {
      max-width: 100%;
    }

    #${WIDGET_ID} .cd-phone-online-dot {
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 999px;
      background: #34c759;
      margin-left: 4px;
      vertical-align: middle;
    }

    #${WIDGET_ID} .cd-phone-info-badge {
      position: relative;
      display: inline-flex;
      align-items: center;
      color: var(--phone-muted);
      font-size: 11px;
      margin-left: 4px;
      cursor: help;
    }

    #${WIDGET_ID} .cd-phone-info-badge:hover,
    #${WIDGET_ID} .cd-phone-info-badge.is-open {
      color: var(--phone-text);
    }

    #${WIDGET_ID} .cd-phone-info-popover {
      display: none;
      position: absolute;
      top: calc(100% + 6px);
      left: -60px;
      width: 220px;
      padding: 8px 10px;
      border-radius: 10px;
      background: #141926;
      border: 1px solid rgba(255,255,255,0.18);
      color: #f3f6ff;
      font-size: 11px;
      font-weight: 400;
      line-height: 1.35;
      white-space: normal;
      box-shadow: 0 8px 20px rgba(0,0,0,0.55);
      z-index: 20;
    }

    #${WIDGET_ID} .cd-phone-info-badge.is-right .cd-phone-info-popover {
      left: auto;
      right: 0;
    }

    #${WIDGET_ID} .cd-phone-info-badge:hover .cd-phone-info-popover,
    #${WIDGET_ID} .cd-phone-info-badge:focus .cd-phone-info-popover,
    #${WIDGET_ID} .cd-phone-info-badge.is-open .cd-phone-info-popover {
      display: block;
    }

    #${WIDGET_ID} .cd-phone-app-header.is-centered {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 6px;
    }

    #${WIDGET_ID} .cd-phone-app-header.is-centered [data-msg-back],
    #${WIDGET_ID} .cd-phone-app-header.is-centered [data-msg-compose-back] {
      justify-self: start;
    }

    #${WIDGET_ID} .cd-phone-group-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
    }

    #${WIDGET_ID} .cd-phone-group-input {
      flex: 1;
      min-width: 0;
      height: 28px;
      padding: 0 9px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.06);
      color: var(--phone-text);
      font-size: 12px;
      outline: none;
    }

    #${WIDGET_ID} .cd-phone-group-create {
      height: 28px;
      padding: 0 10px;
      border-radius: 8px;
      border: none;
      background: var(--phone-accent);
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }

    #${WIDGET_ID} .cd-phone-group-create:disabled {
      opacity: 0.45;
      cursor: default;
    }

    #${WIDGET_ID} .cd-phone-list-item.is-selected {
      background: rgba(10, 132, 255, 0.16);
      border-color: rgba(10, 132, 255, 0.4);
    }

    #${WIDGET_ID} .cd-phone-group-check {
      font-size: 15px;
      color: var(--phone-muted);
      margin-left: auto;
    }

    #${WIDGET_ID} .cd-phone-group-check.is-checked {
      color: var(--phone-accent);
    }

    #${WIDGET_ID} .cd-phone-reply-as-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 8px;
      margin-bottom: 4px;
      border-radius: 10px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      overflow-x: auto;
    }

    #${WIDGET_ID} .cd-phone-reply-as-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--phone-muted);
      white-space: nowrap;
    }

    #${WIDGET_ID} .cd-phone-reply-as-pills {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: nowrap;
    }

    #${WIDGET_ID} .cd-phone-reply-as-pill {
      padding: 2px 8px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.14);
      background: transparent;
      color: var(--phone-text);
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
    }

    #${WIDGET_ID} .cd-phone-reply-as-pill.is-active {
      background: var(--phone-accent);
      border-color: var(--phone-accent);
      color: #fff;
    }

    #${WIDGET_ID} .cd-phone-color-picker {
      width: 24px;
      height: 24px;
      padding: 0;
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 6px;
      background: transparent;
      cursor: pointer;
      flex-shrink: 0;
    }

    #${WIDGET_ID} .cd-phone-color-picker::-webkit-color-swatch-wrapper {
      padding: 2px;
    }

    #${WIDGET_ID} .cd-phone-color-picker::-webkit-color-swatch {
      border: none;
      border-radius: 4px;
    }

    #${WIDGET_ID} .cd-phone-color-reset {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.06);
      color: var(--phone-muted);
      font-size: 10px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    #${WIDGET_ID} .cd-phone-thread-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--phone-text);
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 165px;
    }

    #${WIDGET_ID} .cd-phone-header-right {
      justify-self: end;
      display: inline-flex;
      align-items: center;
    }

    #${WIDGET_ID} .cd-phone-notice-banner {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 10px;
      background: rgba(10, 132, 255, 0.14);
      border: 1px solid rgba(10, 132, 255, 0.3);
      color: var(--phone-muted);
      font-size: 11px;
      line-height: 1.35;
      flex-shrink: 0;
    }

    #${WIDGET_ID} .cd-phone-section-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--phone-muted);
      padding: 4px 2px 0;
    }

    #${WIDGET_ID} .cd-phone-contact-row {
      display: flex;
      align-items: stretch;
      gap: 6px;
    }

    #${WIDGET_ID} .cd-phone-contact-row .cd-phone-list-item {
      flex: 1;
      min-width: 0;
    }

    #${WIDGET_ID} .cd-phone-contact-detail {
      gap: 12px;
    }

    #${WIDGET_ID} .cd-phone-detail-hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 8px 6px 2px;
      gap: 4px;
    }

    #${WIDGET_ID} .cd-phone-detail-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(255,255,255,0.16);
      background: rgba(255,255,255,0.08);
    }

    #${WIDGET_ID} .cd-phone-detail-name {
      font-size: 15px;
      font-weight: 700;
      color: var(--phone-text);
      margin-top: 2px;
    }

    #${WIDGET_ID} .cd-phone-detail-sub {
      font-size: 11px;
      color: var(--phone-muted);
    }

    #${WIDGET_ID} .cd-phone-detail-actions {
      display: flex;
      gap: 8px;
    }

    #${WIDGET_ID} .cd-phone-detail-btn {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 10px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.08);
      color: var(--phone-text);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }

    #${WIDGET_ID} .cd-phone-detail-btn:hover {
      background: rgba(255,255,255,0.14);
    }

    #${WIDGET_ID} .cd-phone-detail-btn.is-primary {
      background: var(--phone-accent);
      border-color: transparent;
      color: #fff;
    }

    #${WIDGET_ID} .cd-phone-detail-btn.is-primary:hover {
      filter: brightness(1.08);
    }

    #${WIDGET_ID} .cd-phone-detail-card {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 10px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.05);
    }

    #${WIDGET_ID} .cd-phone-detail-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    #${WIDGET_ID} .cd-phone-detail-field.is-inline {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding-top: 8px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }

    #${WIDGET_ID} .cd-phone-detail-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--phone-text);
    }

    #${WIDGET_ID} .cd-phone-detail-hint {
      font-weight: 400;
      color: var(--phone-muted);
    }

    #${WIDGET_ID} .cd-phone-detail-input-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    #${WIDGET_ID} .cd-phone-detail-input {
      flex: 1;
      min-width: 0;
      padding: 6px 8px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(0,0,0,0.28);
      color: var(--phone-text);
      font-size: 12px;
    }

    #${WIDGET_ID} .cd-phone-detail-color-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    #${WIDGET_ID} .cd-phone-access-segmented {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;
      padding: 3px;
      border-radius: 10px;
      background: rgba(0,0,0,0.28);
      border: 1px solid rgba(255,255,255,0.08);
    }

    #${WIDGET_ID} .cd-phone-access-seg-btn {
      border: none;
      border-radius: 7px;
      padding: 5px 6px;
      background: transparent;
      color: var(--phone-muted);
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.12s ease, color 0.12s ease;
    }

    #${WIDGET_ID} .cd-phone-access-seg-btn:hover {
      color: var(--phone-text);
    }

    #${WIDGET_ID} .cd-phone-access-seg-btn.is-active {
      background: rgba(10, 132, 255, 0.28);
      color: #fff;
    }

    #${WIDGET_ID} .cd-phone-access-players {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding-top: 2px;
    }

    #${WIDGET_ID} .cd-phone-access-player-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 9px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.05);
      color: var(--phone-muted);
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.12s ease, border-color 0.12s ease, color 0.12s ease;
    }

    #${WIDGET_ID} .cd-phone-access-player-chip:hover {
      background: rgba(255,255,255,0.1);
      color: var(--phone-text);
    }

    #${WIDGET_ID} .cd-phone-access-player-chip.is-selected {
      background: rgba(52, 199, 89, 0.22);
      border-color: rgba(52, 199, 89, 0.55);
      color: #6ee79b;
    }

    #${WIDGET_ID} .cd-phone-icon-action {
      width: 38px;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      background: rgba(255,255,255,0.06);
      color: var(--phone-muted);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    #${WIDGET_ID} .cd-phone-icon-action:hover {
      background: rgba(255,255,255,0.12);
      color: var(--phone-text);
    }

    #${WIDGET_ID} .cd-phone-toggle-pill {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 999px;
      background: rgba(255,255,255,0.08);
      color: var(--phone-muted);
      flex-shrink: 0;
    }

    #${WIDGET_ID} .cd-phone-toggle-pill.is-on {
      background: rgba(52, 199, 89, 0.25);
      color: #6ee79b;
    }

    #${WIDGET_ID} .cd-phone-unread-pill {
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 999px;
      background: #0a84ff;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    #${WIDGET_ID} .cd-phone-list-item.is-unread .cd-phone-list-title,
    #${WIDGET_ID} .cd-phone-list-item.is-unread .cd-phone-list-sub {
      color: var(--phone-text);
      font-weight: 700;
    }

    #${WIDGET_ID} .cd-phone-header-right {
      gap: 6px;
    }

    #${WIDGET_ID} .cd-phone-header-icon-btn {
      width: 22px;
      height: 22px;
      border-radius: 999px;
      border: none;
      background: rgba(255,255,255,0.08);
      color: var(--phone-muted);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      cursor: pointer;
    }

    #${WIDGET_ID} .cd-phone-header-icon-btn:hover {
      background: rgba(255, 69, 58, 0.22);
      color: #ff6961;
    }

    #${WIDGET_ID} .cd-phone-app-view {
      position: relative;
    }

    #${WIDGET_ID} .cd-phone-modal-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.62);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 20;
    }

    #${WIDGET_ID} .cd-phone-modal {
      width: 100%;
      background: #1c1f2b;
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 14px;
      padding: 14px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    #${WIDGET_ID} .cd-phone-modal-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--phone-text);
    }

    #${WIDGET_ID} .cd-phone-modal-body {
      font-size: 11px;
      line-height: 1.4;
      color: var(--phone-muted);
    }

    #${WIDGET_ID} .cd-phone-modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 4px;
    }

    #${WIDGET_ID} .cd-phone-modal-btn {
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.08);
      color: var(--phone-text);
      font-size: 11px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 8px;
      cursor: pointer;
    }

    #${WIDGET_ID} .cd-phone-modal-btn.is-danger {
      background: #ff453a;
      border-color: #ff453a;
      color: #fff;
    }

    #${WIDGET_ID} .cd-phone-notice-banner i {
      color: var(--phone-accent);
      margin-top: 2px;
      flex-shrink: 0;
    }

    #${WIDGET_ID} .cd-phone-system-log .chat-message .message-header {
      display: flex !important;
      align-items: center;
      gap: 8px;
      flex-wrap: nowrap;
      padding: 6px 8px;
    }

    #${WIDGET_ID} .cd-phone-system-log .chat-message .message-header .message-sender {
      flex: 1;
      min-width: 0;
      display: flex !important;
      flex-direction: row !important;
      align-items: center;
      gap: 8px;
      margin: 0;
      line-height: 1.2;
    }

    #${WIDGET_ID} .cd-phone-system-log .chat-message .message-header .name-stacked {
      flex: 1;
      min-width: 0;
      display: flex !important;
      flex-direction: column !important;
      line-height: 1.2;
    }

    #${WIDGET_ID} .cd-phone-system-log .chat-message .message-header .message-metadata {
      margin-left: auto;
      flex-shrink: 0;
      font-size: 10px;
    }

    #${WIDGET_ID} .cd-phone-system-log .chat-message .message-header img,
    #${WIDGET_ID} .cd-phone-system-log .chat-message .portrait img,
    #${WIDGET_ID} .cd-phone-system-log .chat-message .avatar img {
      width: 28px !important;
      height: 28px !important;
      max-width: 28px !important;
      max-height: 28px !important;
      object-fit: cover;
      border-radius: 4px;
      flex-shrink: 0;
    }

    #${WIDGET_ID} .cd-phone-syslog-composer {
      flex-shrink: 0;
      border-top: 1px solid var(--phone-border);
      background: var(--phone-surface);
      display: flex;
      flex-direction: column;
    }

    #${WIDGET_ID} .cd-phone-syslog-toggle {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 7px 12px;
      background: transparent;
      border: 0;
      color: var(--phone-text);
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
    }

    #${WIDGET_ID} .cd-phone-syslog-toggle:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    #${WIDGET_ID} .cd-phone-syslog-form {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 4px 10px 10px;
      border-top: 1px solid var(--phone-border);
    }

    #${WIDGET_ID} .cd-phone-syslog-row {
      display: flex;
      gap: 6px;
    }

    #${WIDGET_ID} .cd-phone-syslog-input,
    #${WIDGET_ID} .cd-phone-syslog-select,
    #${WIDGET_ID} .cd-phone-syslog-textarea {
      background: var(--phone-bg);
      color: var(--phone-text);
      border: 1px solid var(--phone-border);
      border-radius: 8px;
      padding: 5px 8px;
      font-size: 11px;
      font-family: inherit;
      box-sizing: border-box;
    }

    #${WIDGET_ID} .cd-phone-syslog-input {
      flex: 1;
      min-width: 0;
    }

    #${WIDGET_ID} .cd-phone-syslog-select {
      max-width: 105px;
    }

    #${WIDGET_ID} .cd-phone-syslog-chips,
    #${WIDGET_ID} .cd-phone-syslog-tones {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    #${WIDGET_ID} .cd-phone-syslog-chip,
    #${WIDGET_ID} .cd-phone-syslog-tone {
      border: 1px solid var(--phone-border);
      background: var(--phone-bg);
      color: var(--phone-muted);
      border-radius: 999px;
      padding: 2px 7px;
      font-size: 10px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    #${WIDGET_ID} .cd-phone-syslog-chip:hover {
      color: var(--phone-text);
    }

    #${WIDGET_ID} .cd-phone-syslog-tone.active {
      color: var(--phone-text);
      border-color: var(--tone-accent, var(--phone-accent));
      background: rgba(255, 255, 255, 0.08);
    }

    #${WIDGET_ID} .cd-phone-syslog-send-row {
      display: flex;
      gap: 6px;
      align-items: flex-end;
    }

    #${WIDGET_ID} .cd-phone-syslog-textarea {
      flex: 1;
      resize: none;
      line-height: 1.3;
      min-height: 38px;
    }

    #${WIDGET_ID} .cd-phone-syslog-send {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      border: 0;
      background: var(--phone-accent);
      color: #fff;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .cd-syslog-card {
      border-radius: 6px;
      padding: 7px 9px;
      margin: 2px 0;
      font-size: 12px;
      line-height: 1.4;
    }

    .cd-syslog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      margin-bottom: 4px;
      font-size: 11px;
      font-weight: 700;
    }

    .cd-syslog-alias {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .cd-syslog-badge {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 1px 5px;
      border-radius: 999px;
      border: 1px solid currentColor;
      font-weight: 600;
    }

    .cd-syslog-body {
      word-break: break-word;
    }

    /* Notes App */
    #${WIDGET_ID} .cd-phone-notes-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    #${WIDGET_ID} .cd-phone-notes-new-btn,
    #${WIDGET_ID} .cd-phone-notes-icon-btn {
      border: 0;
      background: transparent;
      color: var(--phone-text);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      padding: 4px 6px;
      border-radius: 6px;
      transition: background 0.15s ease, color 0.15s ease;
    }

    #${WIDGET_ID} .cd-phone-notes-new-btn {
      color: #ffd60a;
      font-size: 14px;
    }

    #${WIDGET_ID} .cd-phone-notes-new-btn:hover,
    #${WIDGET_ID} .cd-phone-notes-icon-btn:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    #${WIDGET_ID} .cd-phone-notes-icon-btn.is-pinned {
      color: #ffd60a;
    }

    #${WIDGET_ID} .cd-phone-notes-icon-btn.is-danger:hover {
      color: #ff453a;
    }

    #${WIDGET_ID} .cd-phone-notes-actions {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    #${WIDGET_ID} .cd-phone-notes-search-wrap {
      position: relative;
      display: flex;
      align-items: center;
      margin: 0 10px 8px;
      padding: 0 8px;
      border-radius: 8px;
      background: var(--phone-surface);
      border: 1px solid var(--phone-border);
      color: var(--phone-muted);
      gap: 6px;
      font-size: 11px;
    }

    #${WIDGET_ID} .cd-phone-notes-search {
      flex: 1;
      border: 0;
      background: transparent;
      color: var(--phone-text);
      font-size: 12px;
      padding: 6px 0;
      outline: none;
      min-width: 0;
    }

    #${WIDGET_ID} .cd-phone-notes-search-clear {
      border: 0;
      background: transparent;
      color: var(--phone-muted);
      cursor: pointer;
      padding: 2px 4px;
      font-size: 11px;
    }

    #${WIDGET_ID} .cd-phone-note-pin-badge {
      color: #ffd60a;
      font-size: 10px;
      margin-right: 4px;
    }

    #${WIDGET_ID} .cd-phone-note-time {
      color: var(--phone-text);
      opacity: 0.75;
    }

    #${WIDGET_ID} .cd-phone-notes-confirm {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin: 0 10px 8px;
      padding: 6px 10px;
      border-radius: 8px;
      background: rgba(255, 69, 58, 0.14);
      border: 1px solid rgba(255, 69, 58, 0.35);
      font-size: 11px;
      color: var(--phone-text);
    }

    #${WIDGET_ID} .cd-phone-notes-confirm-btns {
      display: flex;
      gap: 6px;
    }

    #${WIDGET_ID} .cd-phone-notes-confirm-cancel,
    #${WIDGET_ID} .cd-phone-notes-confirm-del {
      border: 0;
      border-radius: 6px;
      padding: 3px 8px;
      font-size: 11px;
      cursor: pointer;
    }

    #${WIDGET_ID} .cd-phone-notes-confirm-cancel {
      background: rgba(255, 255, 255, 0.1);
      color: var(--phone-text);
    }

    #${WIDGET_ID} .cd-phone-notes-confirm-del {
      background: #ff453a;
      color: #fff;
      font-weight: 600;
    }

    #${WIDGET_ID} .cd-phone-notes-editor {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    #${WIDGET_ID} .cd-phone-notes-editor-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 6px 12px 8px;
      min-height: 0;
    }

    #${WIDGET_ID} .cd-phone-note-title-input {
      border: 0;
      border-bottom: 1px solid var(--phone-border);
      background: transparent;
      color: var(--phone-text);
      font-size: 15px;
      font-weight: 700;
      padding: 4px 0 6px;
      outline: none;
      width: 100%;
    }

    #${WIDGET_ID} .cd-phone-note-body-input {
      flex: 1;
      border: 0;
      background: transparent;
      color: var(--phone-text);
      font-size: 12px;
      line-height: 1.45;
      resize: none;
      outline: none;
      width: 100%;
      font-family: inherit;
      min-height: 120px;
    }

    #${WIDGET_ID} .cd-phone-notes-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 12px 6px;
      font-size: 10px;
      color: var(--phone-muted);
      border-top: 1px solid var(--phone-border);
    }
  `;
  document.head.appendChild(style);
}
