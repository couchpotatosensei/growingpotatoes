import assert from "node:assert/strict";
import { test } from "node:test";
import {
  PHONE_THEMES,
  PHONE_APPS,
  classifyChatMessageForPhone,
  formatPhoneMessage,
  stripHtmlToText,
  formatPhotoPageDate,
  buildPhotoJournalPageData,
  extractPhotoFromJournalPage,
  WALLPAPER_PRESETS,
  buildWallpaperStyle,
  filterPhoneMessagesByThread,
  getActivePhoneThreads,
  shouldNotifyUserForPhoneMessage,
  getMessageThreadIdForUser,
  sanitizePhoneImageUrl,
  isEmojiOnlyText,
  buildPhoneMessageHtml,
  toggleMessageReaction,
  getPhoneMessageThreadKey,
  summarizeAllPhoneThreads,
  removePhoneMessagesByThreadKey,
  sanitizePhoneColor,
  resolveContactDisplayColor,
  sanitizePhoneNickname,
  resolveContactDisplayName,
  sanitizeDisabledAppIds,
  getVisiblePhoneApps,
  normalizePhoneAppOrder,
  reorderPhoneAppIds,
  mergeVisibleAppOrder,
  removePhoneMessagesByUserId,
  removeUserFromPhoneGroups,
  buildPulldownNotifications,
  collectPhoneProfileSummaries,
  normalizeNpcContactAccessMap,
  getNpcContactAccessMode,
  canUserAccessNpcContact,
  formatNpcAccessSummary,
  SYSTEM_LOG_TONES,
  buildSystemLogMessageHtml,
  findContactsActorFolderFromList,
  isActorInContactsFolder,
  filterNpcContactsForFolder,
  getPlayerOwnedCharacters,
  resolveActivePhoneActor,
  findAlbumJournalInList,
  shouldHideSmartphoneSidebar,
  sanitizePhoneNote,
  normalizePhoneNotes,
  sortPhoneNotes,
  filterPhoneNotes,
  getNotePreviewText,
  formatNoteTimestamp,
  upsertPhoneNote,
  deletePhoneNote,
  togglePhoneNotePin,
  normalizePhoneDiceTrayCommand,
  submitPhoneDiceTrayRoll,
  openCombatEncounterWindow
} from "../modules/smartphone-widget.js";

test("PHONE_THEMES defaults to ios only", () => {
  assert.ok(PHONE_THEMES.ios);
  assert.deepEqual(Object.keys(PHONE_THEMES), ["ios"]);
});

test("PHONE_APPS exposes expected core apps", () => {
  const ids = PHONE_APPS.map((a) => a.id);
  assert.deepEqual(ids, ["messages", "system-log", "combat", "dice-stuff", "contacts", "academy", "notes", "camera", "photos", "music", "settings"]);
  const combatApp = PHONE_APPS.find((a) => a.id === "combat");
  assert.equal(combatApp?.icon, "fa-solid fa-swords");
});

test("openCombatEncounterWindow pops out ui.combat or falls back safely", () => {
  let poppedOut = false;
  assert.equal(openCombatEncounterWindow({ combat: { renderPopout: () => { poppedOut = true; } } }), true);
  assert.equal(poppedOut, true);

  let renderedArg = null;
  assert.equal(openCombatEncounterWindow({ combat: { render: (arg) => { renderedArg = arg; } } }), true);
  assert.equal(renderedArg, true);

  let warned = "";
  assert.equal(openCombatEncounterWindow({ notifications: { warn: (msg) => { warned = msg; } } }), false);
  assert.ok(warned.includes("Combat Tracker"));
});

test("classifyChatMessageForPhone separates rolls from RP text messages", () => {
  assert.equal(classifyChatMessageForPhone({ content: "Hey, meet at the courtyard!" }), "text");
  assert.equal(classifyChatMessageForPhone({ content: "1d20+5", rolls: [{}] }), "roll");
  assert.equal(classifyChatMessageForPhone({ content: '<div class="cd-chat-card">Attack</div>' }), "roll");
  assert.equal(classifyChatMessageForPhone({ content: '<div class="cd-syslog-card">Server Notice</div>' }), "roll");
  assert.equal(classifyChatMessageForPhone({ content: "<div>Notice</div>", flags: { cheapdice: { systemLog: true } } }), "roll");
  assert.equal(classifyChatMessageForPhone({ content: '<div class="beyond20-message">Longsword</div>', rolls: [] }), "roll");
  assert.equal(classifyChatMessageForPhone({ content: "<div>Roll</div>", flags: { beyond20: {} } }), "roll");
});

test("buildSystemLogMessageHtml escapes input and applies tone styling", () => {
  const html = buildSystemLogMessageHtml({
    text: "Mana-Fi <offline>\nLine 2",
    alias: "World <GM>",
    tone: "alert"
  });
  assert.ok(html.includes('class="cd-syslog-card cd-syslog-tone-alert"'));
  assert.ok(html.includes("World &lt;GM&gt;"));
  assert.ok(html.includes("Mana-Fi &lt;offline&gt;<br>Line 2"));
  assert.ok(html.includes(SYSTEM_LOG_TONES.alert.label));

  const fallback = buildSystemLogMessageHtml({ text: "Ping", tone: "unknown" });
  assert.ok(fallback.includes('cd-syslog-tone-log'));
});

test("formatPhoneMessage builds clean bubble view model", () => {
  const msg = {
    id: "m1",
    author: { id: "u1", name: "Player 1" },
    speaker: { alias: "Renji" },
    whisper: ["u2"],
    timestamp: 1700000000000,
    content: "<p>Did your <b>phone</b> just buzz?</p>"
  };

  const formatted = formatPhoneMessage(msg, "u1");
  assert.equal(formatted.id, "m1");
  assert.equal(formatted.kind, "text");
  assert.equal(formatted.sender, "Renji");
  assert.equal(formatted.isMine, true);
  assert.equal(formatted.isWhisper, true);
  assert.equal(formatted.plainText, "Did your phone just buzz?");
  assert.equal(stripHtmlToText("<style>a{}</style><span>Hello</span>"), "Hello");
});

test("buildPhotoJournalPageData and extractPhotoFromJournalPage round-trip WebP cloud photos", () => {
  const ts = 1763611200000;
  const photo = {
    id: "snap-1",
    dataUrl: "data:image/webp;base64,UklGRh4AAABXRUJQVlA4",
    timestamp: ts,
    sceneName: "Academy Courtyard"
  };

  const pageData = buildPhotoJournalPageData(photo);
  assert.equal(pageData.type, "text");
  assert.ok(pageData.name.includes("Academy Courtyard"));
  assert.ok(pageData.name.startsWith(formatPhotoPageDate(ts)));
  assert.ok(pageData.text.content.includes("data:image/webp;base64"));

  const extracted = extractPhotoFromJournalPage({ id: "page-1", ...pageData });
  assert.equal(extracted.id, "page-1");
  assert.equal(extracted.photoKey, "snap-1");
  assert.equal(extracted.dataUrl, photo.dataUrl);
  assert.equal(extracted.sceneName, "Academy Courtyard");
  assert.equal(extracted.source, "cloud");
});

test("WALLPAPER_PRESETS and buildWallpaperStyle handle presets, colors, and uploaded images", () => {
  assert.ok(WALLPAPER_PRESETS.length >= 4);
  assert.equal(buildWallpaperStyle({ bgType: "color", bgValue: "#123456" }), "background:#123456;");
  assert.ok(buildWallpaperStyle({ imageUrl: "data:image/webp;base64,ABC", bgValue: "#123456" }).includes("background-size:cover"));
  assert.equal(buildWallpaperStyle(null), "");
});

test("filterPhoneMessagesByThread separates Party Chat from 1-on-1 DM whispers", () => {
  const msgs = [
    formatPhoneMessage({ id: "1", author: { id: "u1" }, whisper: [], content: "Hello all" }, "u1"),
    formatPhoneMessage({ id: "2", author: { id: "u1" }, whisper: ["u2"], content: "Psst u2" }, "u1"),
    formatPhoneMessage({ id: "3", author: { id: "u2" }, whisper: ["u1"], content: "Hey u1" }, "u1"),
    formatPhoneMessage({ id: "4", author: { id: "u3" }, whisper: ["u1"], content: "Hey from u3" }, "u1")
  ];

  assert.deepEqual(filterPhoneMessagesByThread(msgs, "u1", "all").map((m) => m.id), ["1"]);
  assert.deepEqual(filterPhoneMessagesByThread(msgs, "u1", "u2").map((m) => m.id), ["2", "3"]);
  assert.deepEqual(filterPhoneMessagesByThread(msgs, "u1", "u3").map((m) => m.id), ["4"]);
});

test("filterPhoneMessagesByThread and getActivePhoneThreads isolate NPC threads per player and GM", () => {
  const raw = [
    { id: "n1", author: { id: "u1" }, whisper: ["gm"], npcId: "npcA", playerUserId: "u1", timestamp: 100, content: "Hey barkeep" },
    { id: "n2", author: { id: "npc:npcA" }, whisper: ["u1"], npcId: "npcA", playerUserId: "u1", timestamp: 200, content: "What'll it be?" },
    { id: "n3", author: { id: "u2" }, whisper: ["gm"], npcId: "npcA", playerUserId: "u2", timestamp: 300, content: "Got any rumors?" },
    { id: "d1", author: { id: "u2" }, whisper: ["u1"], timestamp: 150, content: "Psst u1" }
  ];

  const player1Msgs = raw.map((m) => formatPhoneMessage(m, "u1", false));
  assert.deepEqual(filterPhoneMessagesByThread(player1Msgs, "u1", "npc:npcA").map((m) => m.id), ["n1", "n2"]);
  assert.equal(player1Msgs[1].isMine, false);

  const p1Threads = getActivePhoneThreads(player1Msgs, "u1", false);
  assert.deepEqual(p1Threads.map((t) => t.threadId), ["npc:npcA", "u2"]);

  const gmMsgs = raw.map((m) => formatPhoneMessage(m, "gm", true));
  assert.equal(gmMsgs[1].isMine, true);
  assert.deepEqual(filterPhoneMessagesByThread(gmMsgs, "gm", "npc:npcA:u1").map((m) => m.id), ["n1", "n2"]);
  assert.deepEqual(filterPhoneMessagesByThread(gmMsgs, "gm", "npc:npcA:u2").map((m) => m.id), ["n3"]);

  const gmThreads = getActivePhoneThreads(gmMsgs, "gm", true);
  assert.deepEqual(gmThreads.map((t) => t.threadId), ["npc:npcA:u2", "npc:npcA:u1"]);
});

test("shouldNotifyUserForPhoneMessage only notifies intended recipients and ignores sender", () => {
  const npcToU1 = { id: "m1", authorId: "npc:npcA", whisper: ["u1"], npcId: "npcA", playerUserId: "u1", timestamp: 200 };
  assert.equal(shouldNotifyUserForPhoneMessage(npcToU1, "u1", false), true);
  assert.equal(shouldNotifyUserForPhoneMessage(npcToU1, "u2", false), false);
  assert.equal(shouldNotifyUserForPhoneMessage(npcToU1, "gm", true), false);

  const u1ToNpc = { id: "m2", authorId: "u1", whisper: ["gm"], npcId: "npcA", playerUserId: "u1", timestamp: 210 };
  assert.equal(shouldNotifyUserForPhoneMessage(u1ToNpc, "u1", false), false);
  assert.equal(shouldNotifyUserForPhoneMessage(u1ToNpc, "u2", false), false);
  assert.equal(shouldNotifyUserForPhoneMessage(u1ToNpc, "gm", true), true);
});

test("getActivePhoneThreads hides threads until a newer message arrives", () => {
  const msgs = [
    formatPhoneMessage({ id: "1", author: { id: "u2" }, whisper: ["u1"], timestamp: 100, content: "Old" }, "u1"),
    formatPhoneMessage({ id: "2", author: { id: "u3" }, whisper: ["u1"], timestamp: 200, content: "Active" }, "u1")
  ];

  assert.deepEqual(getActivePhoneThreads(msgs, "u1", false, { u2: 150 }).map((t) => t.threadId), ["u3"]);
  const withNewer = [...msgs, formatPhoneMessage({ id: "3", author: { id: "u2" }, whisper: ["u1"], timestamp: 300, content: "New" }, "u1")];
  assert.deepEqual(getActivePhoneThreads(withNewer, "u1", false, { u2: 150 }).map((t) => t.threadId), ["u2", "u3"]);
});

test("getMessageThreadIdForUser resolves thread IDs for Party Chat, DMs, and NPCs", () => {
  assert.equal(getMessageThreadIdForUser({ authorId: "u2", whisper: [] }, "u1", false), "all");
  assert.equal(getMessageThreadIdForUser({ authorId: "u2", whisper: ["u1"] }, "u1", false), "u2");
  assert.equal(getMessageThreadIdForUser({ authorId: "u1", whisper: ["u2"] }, "u1", false), "u2");
  assert.equal(getMessageThreadIdForUser({ authorId: "npc:npcA", whisper: ["u1"], npcId: "npcA", playerUserId: "u1" }, "u1", false), "npc:npcA");
  assert.equal(getMessageThreadIdForUser({ authorId: "u1", whisper: ["gm"], npcId: "npcA", playerUserId: "u1" }, "gm", true), "npc:npcA:u1");
});

test("sanitizePhoneImageUrl allows http(s) and image data URIs and rejects unsafe schemes", () => {
  assert.equal(sanitizePhoneImageUrl("https://example.com/pic.png"), "https://example.com/pic.png");
  assert.equal(sanitizePhoneImageUrl("  http://example.com/a.jpg "), "http://example.com/a.jpg");
  assert.equal(sanitizePhoneImageUrl("data:image/png;base64,AAAA"), "data:image/png;base64,AAAA");
  assert.equal(sanitizePhoneImageUrl("javascript:alert(1)"), "");
  assert.equal(sanitizePhoneImageUrl("not a url"), "");
});

test("isEmojiOnlyText detects 1-3 emoji messages", () => {
  assert.equal(isEmojiOnlyText("🔥"), true);
  assert.equal(isEmojiOnlyText("😂👍"), true);
  assert.equal(isEmojiOnlyText("⚔️ 🛡️ 🎲"), true);
  assert.equal(isEmojiOnlyText("🔥🔥🔥🔥"), false);
  assert.equal(isEmojiOnlyText("Hello 🔥"), false);
  assert.equal(isEmojiOnlyText(""), false);
});

test("buildPhoneMessageHtml escapes text and embeds sanitized image", () => {
  assert.equal(
    buildPhoneMessageHtml({ text: "Check <this> out", imageSrc: "https://example.com/img.png" }),
    '<p><img src="https://example.com/img.png" alt="Photo" /></p><p>Check &lt;this&gt; out</p>'
  );
  assert.equal(
    buildPhoneMessageHtml({ text: "Hi", imageSrc: "javascript:alert(1)" }),
    "<p>Hi</p>"
  );
});

test("toggleMessageReaction adds, increments, and removes user reactions", () => {
  const r1 = toggleMessageReaction({}, "👍", "u1");
  assert.deepEqual(r1, { "👍": ["u1"] });

  const r2 = toggleMessageReaction(r1, "👍", "u2");
  assert.deepEqual(r2, { "👍": ["u1", "u2"] });

  const r3 = toggleMessageReaction(r2, "👍", "u1");
  assert.deepEqual(r3, { "👍": ["u2"] });

  const r4 = toggleMessageReaction(r3, "👍", "u2");
  assert.deepEqual(r4, {});
});

test("summarizeAllPhoneThreads groups Party, player-to-player DMs, and NPC threads without contents", () => {
  const entries = [
    { id: "1", authorId: "u1", whisper: [], timestamp: 100, content: "Secret party text" },
    { id: "2", authorId: "u1", whisper: ["u2"], timestamp: 200, content: "Secret p2p 1" },
    { id: "3", authorId: "u2", whisper: ["u1"], timestamp: 350, content: "Secret p2p 2" },
    { id: "4", authorId: "u3", whisper: ["gm"], npcId: "npcA", playerUserId: "u3", timestamp: 300, content: "Secret npc" }
  ];

  const summary = summarizeAllPhoneThreads(entries);
  assert.equal(summary.length, 3);
  assert.equal(summary[0].threadKey, "dm:u1:u2");
  assert.equal(summary[0].count, 2);
  assert.deepEqual(summary[0].participants, ["u1", "u2"]);
  assert.equal(summary[1].threadKey, "npc:npcA:u3");
  assert.equal(summary[1].count, 1);
  assert.equal(summary[2].threadKey, "all");
  assert.equal(summary[2].count, 1);
  assert.equal("content" in summary[0], false);
});

test("removePhoneMessagesByThreadKey removes only the targeted thread entries", () => {
  const entries = [
    { id: "1", authorId: "u1", whisper: [], timestamp: 100 },
    { id: "2", authorId: "u1", whisper: ["u2"], timestamp: 200 },
    { id: "3", authorId: "u2", whisper: ["u1"], timestamp: 250 },
    { id: "4", authorId: "u3", whisper: ["gm"], npcId: "npcA", playerUserId: "u3", timestamp: 300 }
  ];

  const dmKey = getPhoneMessageThreadKey(entries[1]).threadKey;
  assert.deepEqual(removePhoneMessagesByThreadKey(entries, dmKey).map((m) => m.id), ["1", "4"]);
  assert.deepEqual(removePhoneMessagesByThreadKey(entries, "all").map((m) => m.id), ["2", "3", "4"]);
});

test("group chats isolate messages from Party Chat and 1-on-1 DMs and respect membership", () => {
  const raw = [
    { id: "1", author: { id: "u1" }, whisper: [], timestamp: 100, content: "Party msg" },
    { id: "2", author: { id: "u1" }, whisper: ["u2"], timestamp: 150, content: "DM u2" },
    { id: "3", author: { id: "u1" }, whisper: ["u1", "u2", "u3"], groupId: "grp-heist", timestamp: 200, content: "Group msg 1" },
    { id: "4", author: { id: "u2" }, whisper: ["u1", "u2", "u3"], groupId: "grp-heist", timestamp: 250, content: "Group msg 2" }
  ];

  const u1Msgs = raw.map((m) => formatPhoneMessage(m, "u1", false));
  assert.deepEqual(filterPhoneMessagesByThread(u1Msgs, "u1", "all").map((m) => m.id), ["1"]);
  assert.deepEqual(filterPhoneMessagesByThread(u1Msgs, "u1", "u2").map((m) => m.id), ["2"]);
  assert.deepEqual(filterPhoneMessagesByThread(u1Msgs, "u1", "group:grp-heist").map((m) => m.id), ["3", "4"]);

  assert.equal(getMessageThreadIdForUser(u1Msgs[2], "u1", false), "group:grp-heist");
  assert.equal(shouldNotifyUserForPhoneMessage(u1Msgs[2], "u1", false), false);
  assert.equal(shouldNotifyUserForPhoneMessage(u1Msgs[2], "u3", false), true);
  assert.equal(shouldNotifyUserForPhoneMessage(u1Msgs[2], "u4", false), false);

  const groups = [{ id: "grp-empty", name: "Scouts", memberIds: ["u1", "u3"], npcIds: [], createdAt: 300 }];
  const u1Threads = getActivePhoneThreads(u1Msgs, "u1", false, {}, groups);
  assert.deepEqual(u1Threads.map((t) => t.threadId), ["group:grp-empty", "group:grp-heist", "u2"]);

  const u4Threads = getActivePhoneThreads(u1Msgs, "u4", false, {}, groups);
  assert.deepEqual(u4Threads.map((t) => t.threadId), []);

  assert.equal(getPhoneMessageThreadKey(u1Msgs[2]).threadKey, "group:grp-heist");
  assert.equal(getPhoneMessageThreadKey(u1Msgs[2]).kind, "group");

  const npcGroupMsg = formatPhoneMessage(
    { id: "5", author: { id: "npc:npcA" }, speaker: { alias: "Durnan" }, whisper: ["u1", "gm"], groupId: "grp-heist", npcId: "npcA", timestamp: 260, content: "Drinks are ready" },
    "gm",
    true
  );
  assert.equal(npcGroupMsg.isMine, true);
  assert.equal(getMessageThreadIdForUser(npcGroupMsg, "u1", false), "group:grp-heist");
  assert.equal(shouldNotifyUserForPhoneMessage(npcGroupMsg, "u1", false), true);
  assert.equal(shouldNotifyUserForPhoneMessage(npcGroupMsg, "gm", true), false);
  assert.deepEqual(filterPhoneMessagesByThread([npcGroupMsg], "u1", "group:grp-heist").map((m) => m.id), ["5"]);
});

test("resolveContactDisplayColor prefers per-user override over Foundry player color", () => {
  assert.equal(sanitizePhoneColor("#ff9500"), "#ff9500");
  assert.equal(sanitizePhoneColor("red"), "");
  assert.equal(resolveContactDisplayColor("u1", "#33aaff", {}), "#33aaff");
  assert.equal(resolveContactDisplayColor("u1", "#33aaff", { u1: "#ff2d55" }), "#ff2d55");
  assert.equal(resolveContactDisplayColor("npc:npcA", "", { "npc:npcA": "#34c759" }), "#34c759");
  assert.equal(resolveContactDisplayColor("u1", "#33aaff", { u1: "invalid" }), "#33aaff");
});

test("resolveContactDisplayName prefers per-user nickname over default name", () => {
  assert.equal(sanitizePhoneNickname("  Shady Guy  "), "Shady Guy");
  assert.equal(sanitizePhoneNickname("   "), "");
  assert.equal(sanitizePhoneNickname("a".repeat(50)).length, 40);
  assert.equal(resolveContactDisplayName("u1", "Kaelen Voss", {}), "Kaelen Voss");
  assert.equal(resolveContactDisplayName("u1", "Kaelen Voss", { u1: "Bestie" }), "Bestie");
  assert.equal(resolveContactDisplayName("npc:npcA", "Captain Thorne", { "npc:npcA": "Docks Guy" }), "Docks Guy");
  assert.equal(resolveContactDisplayName("u1", "Kaelen Voss", { u1: "   " }), "Kaelen Voss");
});

test("sanitizeDisabledAppIds filters invalid IDs and never disables settings", () => {
  assert.deepEqual(sanitizeDisabledAppIds(["academy", "music", "settings", "unknown", "academy"]), ["academy", "music"]);
  assert.deepEqual(sanitizeDisabledAppIds(null), []);
});

test("getVisiblePhoneApps hides disabled apps only for non-GM players", () => {
  const playerApps = getVisiblePhoneApps(["academy", "music", "settings"], false);
  assert.equal(playerApps.some((a) => a.id === "academy"), false);
  assert.equal(playerApps.some((a) => a.id === "music"), false);
  assert.equal(playerApps.some((a) => a.id === "settings"), true);
  assert.equal(playerApps.length, PHONE_APPS.length - 2);

  const gmApps = getVisiblePhoneApps(["academy", "music"], true);
  assert.equal(gmApps.length, PHONE_APPS.length);
  assert.equal(gmApps.some((a) => a.id === "academy"), true);
});

test("removePhoneMessagesByUserId removes DM and NPC messages for a user while keeping party and other threads", () => {
  const entries = [
    { id: "m1", authorId: "u1", whisper: ["u2"], content: "dm1" },
    { id: "m2", authorId: "u2", whisper: ["u1"], content: "dm2" },
    { id: "m3", authorId: "u2", whisper: ["u3"], content: "other dm" },
    { id: "m4", authorId: "u1", npcId: "npc1", playerUserId: "u1", content: "npc1" },
    { id: "m5", authorId: "u2", npcId: "npc1", playerUserId: "u2", content: "npc2" },
    { id: "m6", authorId: "u1", whisper: [], content: "party msg" }
  ];
  const remaining = removePhoneMessagesByUserId(entries, "u1");
  assert.deepEqual(remaining.map((m) => m.id), ["m3", "m5", "m6"]);
});

test("removeUserFromPhoneGroups strips user from memberIds and drops empty groups", () => {
  const groups = [
    { id: "g1", memberIds: ["u1", "u2"], npcIds: [] },
    { id: "g2", memberIds: ["u1"], npcIds: [] },
    { id: "g3", memberIds: ["u1"], npcIds: ["npc1"] }
  ];
  const next = removeUserFromPhoneGroups(groups, "u1");
  assert.deepEqual(next, [
    { id: "g1", memberIds: ["u2"], npcIds: [] },
    { id: "g3", memberIds: [], npcIds: ["npc1"] }
  ]);
});

test("collectPhoneProfileSummaries aggregates active and orphaned player phone data", () => {
  const summaries = collectPhoneProfileSummaries({
    users: [
      { id: "gm1", name: "Gamemaster", isGM: true, hasUserFlags: true },
      { id: "u1", name: "Alice", isGM: false, hasUserFlags: true }
    ],
    albums: [
      { userId: "u1", photoCount: 3 },
      { userId: "u_left", photoCount: 2 }
    ],
    messages: [
      { id: "m1", authorId: "u1", whisper: ["u_left"], content: "hi" },
      { id: "m2", authorId: "u1", npcId: "npc1", playerUserId: "u1", content: "yo" }
    ],
    groups: [
      { id: "g1", memberIds: ["u1", "u_left"], npcIds: [] }
    ]
  });

  assert.equal(summaries.length, 2);
  assert.deepEqual(summaries[0], {
    userId: "u1",
    name: "Alice",
    isOrphan: false,
    photoCount: 3,
    dmThreadCount: 2,
    groupCount: 1,
    hasUserFlags: true
  });
  assert.equal(summaries[1].userId, "u_left");
  assert.equal(summaries[1].isOrphan, true);
  assert.equal(summaries[1].photoCount, 2);
  assert.equal(summaries[1].dmThreadCount, 1);
  assert.equal(summaries[1].groupCount, 1);
});

test("NPC contact access helpers support legacy arrays, per-player selection, and GM bypass", () => {
  assert.deepEqual(normalizeNpcContactAccessMap(["npc1", "", "npc2"]), {
    npc1: "all",
    npc2: "all"
  });

  const map = normalizeNpcContactAccessMap({
    npc1: "all",
    npc2: ["u1", "u2", "u1", ""],
    npc3: [],
    npc4: "invalid"
  });

  assert.deepEqual(map, {
    npc1: "all",
    npc2: ["u1", "u2"]
  });

  assert.equal(getNpcContactAccessMode(map, "npc1"), "all");
  assert.equal(getNpcContactAccessMode(map, "npc2"), "select");
  assert.equal(getNpcContactAccessMode(map, "npc3"), "off");

  assert.equal(canUserAccessNpcContact(map, "npc1", "u3", false), true);
  assert.equal(canUserAccessNpcContact(map, "npc2", "u1", false), true);
  assert.equal(canUserAccessNpcContact(map, "npc2", "u3", false), false);
  assert.equal(canUserAccessNpcContact(map, "npc3", "u1", false), false);
  assert.equal(canUserAccessNpcContact(map, "npc3", "gm1", true), true);

  assert.equal(formatNpcAccessSummary(map, "npc1"), "All players");
  assert.equal(formatNpcAccessSummary(map, "npc2"), "2 players");
  assert.equal(formatNpcAccessSummary({ npc2: ["u1"] }, "npc2"), "1 player");
  assert.equal(formatNpcAccessSummary(map, "npc3"), "Hidden from players");
});

test("Contacts folder lookup and NPC filtering scope actors to the Contacts folder and subfolders", () => {
  const journalContacts = { id: "fj1", type: "JournalEntry", name: "Contacts" };
  const actorContacts = { id: "fa1", type: "Actor", name: "Contacts" };
  const actorSubfolder = { id: "fa2", type: "Actor", name: "Guild", folder: actorContacts };
  const otherFolder = { id: "fa3", type: "Actor", name: "Monsters" };
  const folders = [journalContacts, actorContacts, actorSubfolder, otherFolder];

  assert.equal(findContactsActorFolderFromList(folders)?.id, "fa1");
  assert.equal(findContactsActorFolderFromList([journalContacts]), null);

  const npcDirect = { id: "a1", name: "Zara", hasPlayerOwner: false, folder: actorContacts };
  const npcNested = { id: "a2", name: "Bram", hasPlayerOwner: false, folder: "fa2" };
  const npcOutside = { id: "a3", name: "Goblin", hasPlayerOwner: false, folder: otherFolder };
  const pcInside = { id: "a4", name: "Hero", hasPlayerOwner: true, folder: actorContacts };
  const npcNoFolder = { id: "a5", name: "Stray", hasPlayerOwner: false, folder: null };

  assert.equal(isActorInContactsFolder(npcDirect, actorContacts, folders), true);
  assert.equal(isActorInContactsFolder(npcNested, actorContacts, folders), true);
  assert.equal(isActorInContactsFolder(npcOutside, actorContacts, folders), false);
  assert.equal(isActorInContactsFolder(npcNoFolder, actorContacts, folders), false);

  const filtered = filterNpcContactsForFolder(
    [npcDirect, npcNested, npcOutside, pcInside, npcNoFolder],
    actorContacts,
    folders
  );
  assert.deepEqual(filtered.map((a) => a.id), ["a2", "a1"]);
  assert.deepEqual(filterNpcContactsForFolder([npcDirect], null, folders), []);
});

test("getPlayerOwnedCharacters filters to player-owned character actors and skips GMs", () => {
  const pc1 = { id: "pc1", name: "Zelda", type: "character", isOwner: true };
  const pc2 = { id: "pc2", name: "Aria", type: "character", isOwner: true };
  const npcOwned = { id: "npc1", name: "Familiar", type: "npc", isOwner: true };
  const pcUnowned = { id: "pc3", name: "Rival", type: "character", isOwner: false };
  const actors = [pc1, npcOwned, pcUnowned, pc2];

  const playerUser = { id: "u1", isGM: false, character: pc1 };
  const gmUser = { id: "gm", isGM: true, character: null };

  assert.deepEqual(
    getPlayerOwnedCharacters(actors, playerUser).map((a) => a.id),
    ["pc2", "pc1"]
  );
  assert.deepEqual(getPlayerOwnedCharacters(actors, gmUser), []);
});

test("resolveActivePhoneActor prefers selected owned character and falls back to assigned character", () => {
  const pc1 = { id: "pc1", name: "Zelda", type: "character", isOwner: true };
  const pc2 = { id: "pc2", name: "Aria", type: "character", isOwner: true };
  const actors = [pc1, pc2];
  const playerUser = { id: "u1", isGM: false, character: pc1 };

  assert.equal(resolveActivePhoneActor(actors, playerUser, null)?.id, "pc1");
  assert.equal(resolveActivePhoneActor(actors, playerUser, "pc2")?.id, "pc2");
  assert.equal(resolveActivePhoneActor(actors, playerUser, "missing")?.id, "pc1");
  assert.equal(resolveActivePhoneActor(actors, { id: "gm", isGM: true, character: pc1 }, "pc2")?.id, "pc1");
});

test("findAlbumJournalInList scopes photo albums per actor with legacy fallback for primary character", () => {
  const legacyPrimary = { id: "j1", flags: { cheapdice: { phoneAlbumUserId: "u1" } } };
  const actor2Album = { id: "j2", flags: { cheapdice: { phoneAlbumUserId: "u1", phoneAlbumActorId: "pc2" } } };
  const actor1Album = { id: "j3", flags: { cheapdice: { phoneAlbumUserId: "u1", phoneAlbumActorId: "pc1" } } };

  assert.equal(findAlbumJournalInList([legacyPrimary, actor2Album], "u1", "pc1", "pc1")?.id, "j1");
  assert.equal(findAlbumJournalInList([legacyPrimary, actor2Album], "u1", "pc2", "pc1")?.id, "j2");
  assert.equal(findAlbumJournalInList([legacyPrimary], "u1", "pc2", "pc1"), null);
  assert.equal(findAlbumJournalInList([legacyPrimary, actor1Album, actor2Album], "u1", "pc1", "pc1")?.id, "j3");
});

test("NPC message threads isolate per playerActorId for both player and GM", () => {
  const m1 = formatPhoneMessage({
    id: "m1",
    author: { id: "u1", name: "Aria" },
    whisper: ["gm1"],
    npcId: "npc1",
    playerUserId: "u1",
    playerActorId: "pc1",
    timestamp: 100,
    content: "Hello from Aria"
  }, "u1", false);
  const m2 = formatPhoneMessage({
    id: "m2",
    author: { id: "npc:npc1", name: "Shopkeep" },
    whisper: ["u1"],
    npcId: "npc1",
    playerUserId: "u1",
    playerActorId: "pc2",
    timestamp: 200,
    content: "Hello to Bram"
  }, "u1", false);

  assert.equal(getMessageThreadIdForUser(m1, "u1", false), "npc:npc1:u1:pc1");
  assert.equal(getMessageThreadIdForUser(m2, "gm1", true), "npc:npc1:u1:pc2");

  const pc1Msgs = filterPhoneMessagesByThread([m1, m2], "u1", "npc:npc1:u1:pc1");
  assert.deepEqual(pc1Msgs.map((m) => m.id), ["m1"]);

  const pc2Threads = getActivePhoneThreads([m1, m2], "u1", false, {}, [], "pc2");
  assert.deepEqual(pc2Threads.map((t) => t.threadId), ["npc:npc1:u1:pc2"]);

  const gmThreads = getActivePhoneThreads([m1, m2], "gm1", true, {}, []);
  assert.deepEqual(gmThreads.map((t) => t.threadId).sort(), ["npc:npc1:u1:pc1", "npc:npc1:u1:pc2"]);
});

test("Player-to-player DM threads isolate per character actor while keeping GM DMs per user", () => {
  const charDm = formatPhoneMessage({
    id: "d1",
    author: { id: "u1", name: "Aria" },
    whisper: ["u2"],
    senderActorId: "pc1",
    targetActorId: "pc3",
    timestamp: 100,
    content: "Hey Lyra"
  }, "u1", false);
  const altCharDm = formatPhoneMessage({
    id: "d2",
    author: { id: "u1", name: "Bram" },
    whisper: ["u2"],
    senderActorId: "pc2",
    targetActorId: "pc3",
    timestamp: 200,
    content: "Hey Lyra, it's Bram"
  }, "u1", false);
  const gmDm = formatPhoneMessage({
    id: "d3",
    author: { id: "u1", name: "Bram" },
    whisper: ["gm1"],
    senderActorId: "pc2",
    timestamp: 300,
    content: "Question for GM"
  }, "u1", false);

  assert.equal(getMessageThreadIdForUser(charDm, "u1", false), "pc:pc1:u2:pc3");
  assert.equal(getMessageThreadIdForUser(charDm, "u2", false), "pc:pc3:u1:pc1");
  assert.equal(getMessageThreadIdForUser(gmDm, "gm1", true), "u1");

  const pc1Inbox = getActivePhoneThreads([charDm, altCharDm, gmDm], "u1", false, {}, [], "pc1");
  assert.deepEqual(pc1Inbox.map((t) => t.threadId).sort(), ["gm1", "pc:pc1:u2:pc3"]);

  const filteredPc2 = filterPhoneMessagesByThread([charDm, altCharDm, gmDm], "u1", "pc:pc2:u2:pc3");
  assert.deepEqual(filteredPc2.map((m) => m.id), ["d2"]);

  const filteredGm = filterPhoneMessagesByThread([charDm, altCharDm, gmDm], "gm1", "u1");
  assert.deepEqual(filteredGm.map((m) => m.id), ["d3"]);
});

test("shouldHideSmartphoneSidebar hides by default for players and respects player opt-in", () => {
  // Default: feature enabled, hideForPlayers true, player hasn't opted in -> hidden
  assert.equal(shouldHideSmartphoneSidebar({ featureEnabled: true, hideForPlayers: true, playerShowSidebar: false, isGM: false }), true);
  // Player toggles "Show Right Sidebar" ON -> visible
  assert.equal(shouldHideSmartphoneSidebar({ featureEnabled: true, hideForPlayers: true, playerShowSidebar: true, isGM: false }), false);
  // GM always sees sidebar regardless of toggle
  assert.equal(shouldHideSmartphoneSidebar({ featureEnabled: true, hideForPlayers: true, playerShowSidebar: false, isGM: true }), false);
  // World setting disabled or feature disabled -> visible
  assert.equal(shouldHideSmartphoneSidebar({ featureEnabled: true, hideForPlayers: false, playerShowSidebar: false, isGM: false }), false);
  assert.equal(shouldHideSmartphoneSidebar({ featureEnabled: false, hideForPlayers: true, playerShowSidebar: false, isGM: false }), false);
});

test("normalizePhoneAppOrder preserves valid custom order and appends missing apps", () => {
  const normalized = normalizePhoneAppOrder(["settings", "camera", "unknown-app", "camera", "messages"]);
  assert.deepEqual(normalized.slice(0, 3), ["settings", "camera", "messages"]);
  assert.equal(normalized.length, PHONE_APPS.length);
  assert.deepEqual(new Set(normalized), new Set(PHONE_APPS.map((a) => a.id)));
});

test("reorderPhoneAppIds moves dragged app to target slot", () => {
  const base = ["messages", "system-log", "dice-stuff", "contacts"];
  assert.deepEqual(reorderPhoneAppIds(base, "contacts", "messages"), ["contacts", "messages", "system-log", "dice-stuff"]);
  assert.deepEqual(reorderPhoneAppIds(base, "messages", "dice-stuff"), ["system-log", "dice-stuff", "messages", "contacts"]);
  assert.deepEqual(reorderPhoneAppIds(base, "messages", "messages"), base);
  assert.deepEqual(reorderPhoneAppIds(base, "missing", "messages"), base);
});

test("mergeVisibleAppOrder preserves hidden app slots while applying visible reorder", () => {
  const full = ["messages", "music", "system-log", "camera", "settings"];
  const visibleReordered = ["camera", "messages", "system-log", "settings"];
  const merged = mergeVisibleAppOrder(full, visibleReordered);
  assert.deepEqual(merged.slice(0, 5), ["camera", "music", "messages", "system-log", "settings"]);
});

test("getVisiblePhoneApps respects custom app order and GM disabled filtering", () => {
  const customOrder = ["settings", "photos", "messages"];
  const playerApps = getVisiblePhoneApps(["photos", "music"], false, customOrder);
  assert.equal(playerApps[0].id, "settings");
  assert.equal(playerApps[1].id, "messages");
  assert.equal(playerApps.some((a) => a.id === "photos"), false);
  assert.equal(playerApps.some((a) => a.id === "music"), false);

  const gmApps = getVisiblePhoneApps(["photos", "music"], true, customOrder);
  assert.deepEqual(gmApps.slice(0, 3).map((a) => a.id), ["settings", "photos", "messages"]);
});

test("buildPulldownNotifications combines unread message threads and system log alerts", () => {
  const items = buildPulldownNotifications({
    unreadByThread: { all: 2, "user-2": 0, "group:g1": 1 },
    unreadRolls: 3,
    messages: [
      { id: "m1", authorId: "user-2", sender: "Aria", plainText: "Meet at the gate", whisper: [] },
      { id: "m2", authorId: "user-3", sender: "Bram", plainText: "", imageSrc: "https://example.com/a.png", groupId: "g1", whisper: ["user-1"] }
    ],
    userId: "user-1",
    getThreadTitle: (tid) => (tid === "all" ? "Party Chat" : tid === "group:g1" ? "Squad" : tid)
  });

  assert.equal(items.length, 3);
  assert.deepEqual(items[0], {
    id: "msg:all",
    kind: "message",
    threadId: "all",
    title: "Party Chat",
    preview: "Aria: Meet at the gate",
    count: 2
  });
  assert.deepEqual(items[1], {
    id: "msg:group:g1",
    kind: "message",
    threadId: "group:g1",
    title: "Squad",
    preview: "Bram: Photo",
    count: 1
  });
  assert.deepEqual(items[2], {
    id: "system-log",
    kind: "system-log",
    title: "System Log",
    preview: "3 new roll or system entries",
    count: 3
  });

  assert.deepEqual(buildPulldownNotifications({ unreadByThread: {}, unreadRolls: 0 }), []);
});

test("phone notes helpers sanitize, sort, filter, upsert, pin, and delete", () => {
  assert.equal(sanitizePhoneNote(null), null);
  assert.equal(sanitizePhoneNote({ title: "No ID" }), null);

  let notes = [];
  notes = upsertPhoneNote(notes, { id: "n1", title: "Session 1", body: "Met the guildmaster", updatedAt: 1000 });
  notes = upsertPhoneNote(notes, { id: "n2", title: "Loot", body: "250 gp and a silver key", updatedAt: 2000 });
  assert.deepEqual(notes.map((n) => n.id), ["n2", "n1"]);

  // Pinning n1 puts it first even though n2 has a newer updatedAt
  notes = togglePhoneNotePin(notes, "n1");
  assert.deepEqual(notes.map((n) => n.id), ["n1", "n2"]);
  assert.equal(notes[0].pinned, true);

  // Updating n2 preserves n1 pinned first
  notes = upsertPhoneNote(notes, { id: "n2", title: "Loot List", body: "250 gp", updatedAt: 3000 });
  assert.equal(notes[1].title, "Loot List");
  assert.deepEqual(sortPhoneNotes(notes).map((n) => n.id), ["n1", "n2"]);

  // Filtering
  assert.deepEqual(filterPhoneNotes(notes, "guild").map((n) => n.id), ["n1"]);
  assert.deepEqual(filterPhoneNotes(notes, "250 gp").map((n) => n.id), ["n2"]);
  assert.deepEqual(filterPhoneNotes(notes, "").map((n) => n.id), ["n1", "n2"]);

  // Preview & timestamp formatting
  assert.equal(getNotePreviewText(""), "No additional text");
  assert.equal(getNotePreviewText("  Hello   world  ", 20), "Hello world");
  assert.equal(getNotePreviewText("abcdefghij", 6), "abcde…");
  assert.equal(formatNoteTimestamp(100000, 110000), "Just now");
  assert.equal(formatNoteTimestamp(100000, 100000 + 5 * 60000), "5m ago");
  assert.equal(formatNoteTimestamp(100000, 100000 + 3 * 3600000), "3h ago");

  // Delete & normalize deduplication
  const duped = normalizePhoneNotes([
    { id: "n1", title: "Old", body: "", updatedAt: 100 },
    { id: "n1", title: "New", body: "Body", updatedAt: 200 }
  ]);
  assert.equal(duped.length, 1);
  assert.equal(duped[0].title, "New");

  notes = deletePhoneNote(notes, "n1");
  assert.deepEqual(notes.map((n) => n.id), ["n2"]);
});

test("phone dice tray rolls default to public instead of inheriting whispered rollMode", async () => {
  assert.deepEqual(normalizePhoneDiceTrayCommand("/r 1d20 + 5"), {
    isExplicitWhisper: false,
    cleanFormula: "1d20 + 5",
    publicCommand: "/pr 1d20 + 5"
  });
  assert.deepEqual(normalizePhoneDiceTrayCommand("2d6"), {
    isExplicitWhisper: false,
    cleanFormula: "2d6",
    publicCommand: "/pr 2d6"
  });
  assert.deepEqual(normalizePhoneDiceTrayCommand("/gmr 1d20"), {
    isExplicitWhisper: true,
    cleanFormula: "/gmr 1d20",
    publicCommand: "/gmr 1d20"
  });

  const toMessageCalls = [];
  class FakeRoll {
    constructor(formula) {
      this.formula = formula;
    }
    async evaluate() {
      return this;
    }
    async toMessage(messageData, options) {
      toMessageCalls.push({ formula: this.formula, messageData, options });
    }
  }

  const chatCalls = [];
  const fakeUiChat = {
    async processMessage(msg) {
      chatCalls.push(msg);
    }
  };

  await submitPhoneDiceTrayRoll("/r 1d20 + 3", {
    RollClass: FakeRoll,
    uiChat: fakeUiChat,
    speaker: { alias: "Renji" },
    publicRollMode: "publicroll"
  });

  assert.equal(toMessageCalls.length, 1);
  assert.equal(toMessageCalls[0].formula, "1d20 + 3");
  assert.deepEqual(toMessageCalls[0].messageData, { speaker: { alias: "Renji" }, whisper: [] });
  assert.deepEqual(toMessageCalls[0].options, { rollMode: "publicroll" });
  assert.equal(chatCalls.length, 0);

  // Explicit whisper commands still route through ui.chat.processMessage
  await submitPhoneDiceTrayRoll("/gmr 1d20", {
    RollClass: FakeRoll,
    uiChat: fakeUiChat,
    speaker: { alias: "Renji" }
  });
  assert.deepEqual(chatCalls, ["/gmr 1d20"]);
});
