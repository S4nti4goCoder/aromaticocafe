# Landing Section Visibility System — Design

**Date:** 2026-04-10
**Status:** Approved (pending implementation plan)

## Problem

The landing page currently has no granular visibility control. Most sections render unconditionally (`AboutSection`, `FeaturedProductsSection`, `ContactSection`), while others hide themselves implicitly when content is missing (`GallerySection`, `TestimonialsSection`). Only `show_promotions` exists as an explicit toggle.

The café admin needs to turn individual sections and CTA buttons on and off from the admin panel without editing code or emptying content fields — e.g., temporarily hide "Reservas" during a remodel, or hide the gallery while curating new photos.

## Goals

- Explicit per-section visibility flags in the admin
- One dedicated place to see and toggle the entire landing layout at a glance
- Live preview so the admin sees changes before saving
- Zero regression: existing cafés continue seeing their full landing after the migration

## Non-goals

- Reordering sections (fixed order stays the same)
- Per-section styling or content variants
- Scheduling visibility ("hide from Monday to Friday")
- Role-based visibility (everyone sees the same landing)

## Scope

### Toggleable sections
1. Nuestra historia (`AboutSection`)
2. Favoritos (`FeaturedProductsSection`)
3. Promociones (`PromotionsSection`) — already has `show_promotions`
4. Galería (`GallerySection`)
5. Reseñas (`TestimonialsSection`)
6. Contacto (`ContactSection`)

### Toggleable CTA buttons
7. Botón "Reservar" en Navbar
8. Botón "Ver menú" en Hero
9. WhatsApp flotante (esquina inferior derecha)

### Not toggleable (by design)
`Navbar`, `HeroSection`, `Footer` — removing any of these would break the landing structurally.

## Design

### 1. Data model

Add eight boolean columns to `cafe_settings` (the ninth, `show_promotions`, already exists):

```sql
alter table cafe_settings
  add column show_about            boolean not null default true,
  add column show_featured         boolean not null default true,
  add column show_gallery          boolean not null default true,
  add column show_testimonials     boolean not null default true,
  add column show_contact          boolean not null default true,
  add column show_reserve_button   boolean not null default true,
  add column show_menu_button      boolean not null default true,
  add column show_whatsapp_float   boolean not null default true;
```

**Rationale:**
- `NOT NULL DEFAULT true` ensures existing rows get `true` retroactively — zero regression.
- Separate columns (vs. a single JSON `section_visibility`) gives strong TS typing after `gen:types` and makes future additions explicit migrations.
- Defaults mean the entire landing stays visible for any row that existed before the migration.

**Post-migration steps:**
- Run `npm run gen:types` (per the existing project rule in memory) to refresh `src/types/database.types.ts`.
- Update `CafeSettings` in `src/types/index.ts` to reflect the new boolean fields.

### 2. Admin UI — new "Secciones" tab

Add a new tab at the beginning of the tab bar in `src/features/settings/AppearancePage.tsx`, before "General":

```
[ Secciones ] [ General ] [ Imágenes ] [ Colores ] [ Contacto ] [ Nosotros ] [ Galería ] [ Reseñas ] [ Destacados ]
```

The tab contains three cards stacked vertically:

**Card 1 — "Secciones de la landing"** (6 switch rows)
- Nuestra historia — `show_about`
- Favoritos — `show_featured`
- Promociones — `show_promotions`
- Galería — `show_gallery`
- Reseñas — `show_testimonials`
- Contacto — `show_contact`

**Card 2 — "Botones de acción"** (3 switch rows)
- Botón "Reservar" (Navbar) — `show_reserve_button`
- Botón "Ver menú" (Hero) — `show_menu_button`
- WhatsApp flotante — `show_whatsapp_float`

**Card 3 — "Vista previa"** (live preview — see section 3)

**Row layout per switch:**
- Lucide icon on the left
- Label (bold) + muted description below
- shadcn `<Switch>` on the right
- Divider between rows (`border-border/50`)
- Hover state: `bg-accent/30`
- When a row has a dependency (e.g., "Reservar" requires `reservation_whatsapp`), show a muted hint beneath the description if the dependency is missing. The switch still toggles freely — the hint only informs.

**Form integration:**
- All eight new fields join the existing `useForm<FormData>` in `AppearancePage.tsx`.
- The floating "Guardar cambios" button already tracks dirty state via the existing `hasUnsavedChanges` pattern — the new fields get picked up automatically.
- `reset()` on successful save repopulates with saved values, same as other fields.

### 3. Live preview (iframe + postMessage)

Reuse the iframe-based preview pattern already in the Colors tab, with one addition: **instant updates via `window.postMessage`** so the admin sees switch changes without waiting for save.

**Parent side (`AppearancePage.tsx`):**

```tsx
const iframeRef = useRef<HTMLIFrameElement>(null);
const formValues = watch();

useEffect(() => {
  iframeRef.current?.contentWindow?.postMessage(
    { type: "preview-update", settings: formValues },
    window.location.origin
  );
}, [formValues]);
```

- `targetOrigin: window.location.origin` prevents leaking form state to unrelated windows.
- The iframe `src` is the existing `/landing` route — no new route needed.

**Child side (`LandingPage.tsx`):**

```tsx
const [previewOverrides, setPreviewOverrides] = useState<Partial<CafeSettings> | null>(null);

useEffect(() => {
  if (window.parent === window) return; // Not in iframe → skip listener entirely
  const handler = (e: MessageEvent) => {
    if (e.origin !== window.location.origin) return;
    if (e.data?.type === "preview-update") {
      setPreviewOverrides(e.data.settings);
    }
  };
  window.addEventListener("message", handler);
  return () => window.removeEventListener("message", handler);
}, []);

const effectiveSettings = useMemo(
  () => (previewOverrides ? { ...settings, ...previewOverrides } : settings),
  [settings, previewOverrides]
);
```

- The listener is a no-op in production: `window.parent === window` is true when the landing is opened directly (not inside an iframe).
- All reads of `settings` in `LandingPage.tsx` are replaced with `effectiveSettings`.
- In production `previewOverrides` stays `null`, so `effectiveSettings === settings` — no performance cost.

**Card placement:** the preview card sits below the two switch cards, takes full width, iframe height ~700px, scrollable, with a muted helper text: *"Los cambios se ven aquí pero no están guardados hasta que presiones Guardar."*

### 4. Landing render integration

**`LandingPage.tsx` section rendering** — add the new toggles **without removing or adding content guards** that weren't already there. The rule: preserve existing per-section behavior exactly, only layer the toggle on top.

Current state in LandingPage.tsx:
- `AboutSection` — rendered unconditionally → add only `show_about` toggle
- `FeaturedProductsSection` — rendered unconditionally → add only `show_featured` toggle
- `PromotionsSection` — already guarded by `show_promotions && activePromotions.length > 0` → unchanged
- `GallerySection` — already guarded by `gallery_urls?.length > 0` → add `show_gallery` toggle on top
- `TestimonialsSection` — already guarded by `testimonials?.length > 0` → add `show_testimonials` toggle on top
- `ContactSection` — rendered unconditionally → add only `show_contact` toggle

```tsx
{effectiveSettings?.show_about !== false && (
  <AboutSection settings={effectiveSettings} theme={theme} />
)}
{effectiveSettings?.show_featured !== false && (
  <FeaturedProductsSection products={featuredProducts} theme={theme} />
)}
{!!effectiveSettings?.show_promotions && activePromotions.length > 0 && (
  <PromotionsSection promotions={activePromotions} theme={theme} />
)}
{effectiveSettings?.show_gallery !== false &&
  !!effectiveSettings?.gallery_urls?.length && (
    <GallerySection galleryUrls={effectiveSettings.gallery_urls} theme={theme} />
  )}
{effectiveSettings?.show_testimonials !== false &&
  !!effectiveSettings?.testimonials?.length && (
    <TestimonialsSection testimonials={effectiveSettings.testimonials} theme={theme} />
  )}
{effectiveSettings?.show_contact !== false && (
  <ContactSection settings={effectiveSettings} theme={theme} />
)}
```

**Note on `!== false`:** this pattern treats `null`/`undefined` as `true`, so a stale cache or row missing the column still renders the section. The eight new columns all have `NOT NULL DEFAULT true`, so they should always be `true` or `false` — but the `!== false` guard adds a belt-and-suspenders safety for any code path that might read a partial object.

**Note on `show_promotions`:** stays as the existing strict truthy check (`!!effectiveSettings?.show_promotions`). This column predates the migration and may be `null` for some rows; the current behavior (null → hidden) is preserved.

**`navLinks` array** — add the toggle check to each existing `show` condition. The current array already has content guards (`about_title || about_description`, `featuredProducts.length > 0`, etc.); we layer the toggle **on top** without removing those:

```tsx
const navLinks: NavLink[] = [
  {
    id: "nosotros",
    label: "Nuestra historia",
    show:
      effectiveSettings?.show_about !== false &&
      !!(effectiveSettings?.about_title || effectiveSettings?.about_description),
  },
  {
    id: "menu", // This anchor scrolls to FeaturedProductsSection (label is "Favoritos")
    label: "Favoritos",
    show: effectiveSettings?.show_featured !== false && featuredProducts.length > 0,
  },
  {
    id: "promociones",
    label: "Promociones",
    show: !!(effectiveSettings?.show_promotions && activePromotions.length > 0),
  },
  {
    id: "galeria",
    label: "Galería",
    show:
      effectiveSettings?.show_gallery !== false &&
      !!(effectiveSettings?.gallery_urls && effectiveSettings.gallery_urls.length > 0),
  },
  {
    id: "resenas",
    label: "Reseñas",
    show:
      effectiveSettings?.show_testimonials !== false &&
      !!(effectiveSettings?.testimonials && effectiveSettings.testimonials.length > 0),
  },
  {
    id: "contacto",
    label: "Contacto",
    show:
      effectiveSettings?.show_contact !== false &&
      !!(
        effectiveSettings?.address ||
        effectiveSettings?.maps_embed_url ||
        effectiveSettings?.phone
      ),
  },
].filter((l) => l.show);
```

**Clarification on `show_menu_button`:** this toggle controls **only** the large "Ver menú" CTA button in `HeroSection`. The navbar does not currently have a separate "Menú" link (its `id: "menu"` entry scrolls to the *Favoritos* section with label "Favoritos"). So `show_menu_button` does not affect any navbar link.

**Three CTA button touchpoints:**

1. **`Navbar.tsx` lines 94 and 162** — "Reservar" button (desktop + mobile)
   - Before: `{settings?.reservation_whatsapp && (...)}`
   - After: `{settings?.show_reserve_button !== false && settings?.reservation_whatsapp && (...)}`

2. **`HeroSection.tsx`** — "Ver menú" button
   - Wrap the existing button in `{settings?.show_menu_button !== false && (...)}`
   - Pass `settings` (already has `theme`) as a prop from `LandingPage.tsx`.

3. **`FloatingButtons.tsx` line 25** — WhatsApp floating button
   - Before: `{(settings?.whatsapp || settings?.reservation_whatsapp) && (...)}`
   - After: `{settings?.show_whatsapp_float !== false && (settings?.whatsapp || settings?.reservation_whatsapp) && (...)}`

## Testing strategy

Manual E2E checks (no automated test infrastructure for the landing currently):

1. **Migration regression** — after running the SQL, open the existing café's landing. Everything must look identical (all eight new flags default to `true`).
2. **Each section toggle** — turn off each of the six section toggles one at a time. Verify: (a) section disappears from landing, (b) corresponding navbar link disappears, (c) scroll anchors still work for the remaining links.
3. **Each CTA toggle** — turn off each of the three button toggles. Verify: (a) button disappears, (b) other buttons still work, (c) no layout shift or empty space.
4. **Dependency hint** — clear `reservation_whatsapp`, verify the "Reservar" switch still toggles but shows the hint text.
5. **Live preview** — toggle a switch, verify the iframe updates without save. Press "Cancelar" (or discard changes), verify iframe reverts.
6. **Save + reload** — toggle several switches, save, reload the admin page. Verify switches reflect the saved state and the real landing respects them.
7. **Content-empty edge cases** — `show_gallery = true` with empty `gallery_urls` → section still hidden (content-guard wins). Same for testimonials.

## Risks and mitigations

- **Risk:** stale client-side caches (React Query) after save cause the landing to briefly show old state.
  **Mitigation:** the existing save flow already calls `queryClient.invalidateQueries(['cafe-settings'])` — no new work needed.

- **Risk:** `postMessage` listener leaks if `LandingPage` unmounts mid-conversation.
  **Mitigation:** the `useEffect` cleanup removes the listener.

- **Risk:** adding 8 boolean columns to a hot table (read on every landing pageview).
  **Mitigation:** booleans are 1 byte each in Postgres. `cafe_settings` has a single row per café — cost is negligible.

- **Risk:** the `!== false` defaulting pattern is subtle and could confuse future maintainers.
  **Mitigation:** add a one-line comment above each condition block explaining *"Defaults to visible if null/undefined (legacy rows)."*

## Open questions

None — all clarifying questions resolved during brainstorming:
- Location of the panel: new "Secciones" tab (decided).
- Reserve button vs. WhatsApp float: separate toggles (decided).
- Default state: all `true` (decided).
- Preview mechanism: iframe + postMessage (decided).

## Implementation order

Expected rough sequence (detailed plan to be produced by writing-plans skill):

1. SQL migration in Supabase → `gen:types` → update `CafeSettings` in `src/types/index.ts`.
2. New "Secciones" tab skeleton in `AppearancePage.tsx` with switches wired to the form (no preview yet).
3. Add `postMessage` listener in `LandingPage.tsx` and switch `settings` reads to `effectiveSettings`.
4. Add preview card with iframe + `postMessage` dispatcher in `AppearancePage.tsx`.
5. Apply the render conditions to `LandingPage.tsx` (sections + navLinks).
6. Apply CTA toggles to `Navbar.tsx`, `HeroSection.tsx`, `FloatingButtons.tsx`.
7. Manual E2E verification of all testing scenarios.
