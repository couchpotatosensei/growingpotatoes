# Parked Feature: Smartphone Embedded Dice Stuff App

Saved implementation for embedding Dice Stuff's compact view directly inside the Smartphone widget (`modules/smartphone-widget.js`) as an in-phone app instead of opening a separate Foundry `Dialog`.

## 1. `modules/custom-rolls.js` Changes

1. **In `window.CustomRolls.openActionDialog(initialMode = "d20", explicitActor = null, dialogOptions = {})`:**
   - Detect embedded mode:
     ```js
     const mountContainer = dialogOptions?.mountContainer || null;
     const isEmbedded = Boolean(mountContainer);
     ```
   - Guard owner/permission warning when embedded (return `null` quietly if `!actor || !actor.isOwner`).
   - Force compact mode when embedded:
     ```js
     const isInitiallyCompact = isEmbedded ? true : (localStorage.getItem(COMPACT_STORAGE_KEY) === "true");
     ```
   - Use flex sizing on `#dice-stuff-main-container` when embedded:
     ```js
     ${isEmbedded ? "flex: 1; min-height: 0; width: 100%;" : "height: 520px;"}
     ```
   - Extract `mountActionView(html, dialogApp, dlg)` from `Dialog`'s `render`:
     - Scope `#cheapdice-theme-styles` to `:is(.app.dialog, .cd-phone-dice-stuff-host)` via `.replaceAll(".app.dialog", ":is(.app.dialog, .cd-phone-dice-stuff-host)")`.
     - Extract `openSettingsMenu()` and `refreshActionView()`.
     - Guard Dialog-only features (`dialog-buttons`, `dialogApp.css({ width })`, header button injection, `dlg.setPosition`, `dlg.maximize`, `renderSideTabs()`, `dlg._gpMinHooked`, `persistDiceStuffPos`, `dlg._gpCenteredOnce`) with `if (!isEmbedded && dlg)`.
     - Return `{ destroy, refresh: refreshActionView, openSettings: openSettingsMenu, openFullDialog: () => window.CustomRolls.openActionDialog(currentMode, actor) }`.
   - When `isEmbedded` is `true`, mount directly into `mountContainer` with class `cd-phone-dice-stuff-host` and return `mountActionView(html, dialogApp, null)`.
2. **Export `window.CustomRolls.mountCompactApp`:**
   ```js
   window.CustomRolls.mountCompactApp = async function (containerEl, explicitActor = null, options = {}) {
     if (!containerEl) return null;
     return window.CustomRolls.openActionDialog(options.initialMode || "d20", explicitActor, {
       ...options,
       mountContainer: containerEl
     });
   };
   ```

## 2. `modules/smartphone-widget.js` Changes

1. **State & Cleanup:**
   - Add `let _diceStuffController = null;`
   - At the top of `renderPhoneContents()`, call `_diceStuffController?.destroy?.()` and reset `_diceStuffController = null`.
2. **Routing & Rendering:**
   - In `renderCurrentAppScreen()`, add `case "dice-stuff": return renderDiceStuffApp();`.
   - Add `renderDiceStuffApp()` with `.cd-phone-app-header` (Refresh, Settings/Theme, Open Full Window buttons) and `.cd-phone-dice-stuff-body`.
   - In `bindPhoneEvents(root)`:
     - Remove the special-case `if (nextApp === "dice-stuff")` early return so clicking the tile navigates to `app: "dice-stuff"`.
     - When `_currentApp === "dice-stuff"`, call `window.CustomRolls.mountCompactApp(bodyEl, ownerActor, { onRefresh: () => renderPhoneContents() })`, guard against stale async mounts (`!bodyEl.isConnected || _currentApp !== "dice-stuff"`), and wire `[data-dice-stuff-refresh]`, `[data-dice-stuff-settings]`, and `[data-dice-stuff-popout]`.
3. **Styles (`injectStyles()`):**
   - Style `.cd-phone-dice-stuff-actions`, `.cd-phone-dice-stuff-body` (with `.cheapdice-theme-slate`, `.cheapdice-theme-arcane`, `.cheapdice-theme-glass` backgrounds), and `.cd-phone-dice-stuff-body #dice-stuff-main-container` (`flex: 1; min-height: 0; width: 100%; overflow: hidden;`).
