# Zluri Design System Reference

Quick reference for AI agents and developers building Zluri prototypes.

## Color Tokens

### Semantic Colors (use these first)

| Token | Zluri Color | Hex | Usage |
|-------|-------------|-----|-------|
| `--primary` | blue-600 | #0066FF | Primary actions, links |
| `--primary-foreground` | grey-50 | #FFFFFF | Text on primary |
| `--destructive` | red-600 | #E33F30 | Delete, errors |
| `--success` | green-600 | #229F2E | Success states |
| `--warning` | orange-500 | #F68009 | Warnings |
| `--foreground` | grey-800 | #222222 | Primary text |
| `--muted` | grey-100 | #F8F8F8 | Muted backgrounds |
| `--muted-foreground` | grey-500 | #909090 | Secondary text |
| `--border` | grey-200 | #E6E6E6 | Borders |
| `--ring` | blue-500 | #3388FF | Focus rings |
| `--background` | grey-50 | #FFFFFF | Page background |

### Core Color Scales

Use Tailwind classes like `bg-blue-600`, `text-grey-700`, `border-red-200`.

#### Grey
| Shade | Hex | Class |
|-------|-----|-------|
| 50 | #FFFFFF | `grey-50` |
| 100 | #F8F8F8 | `grey-100` |
| 200 | #E6E6E6 | `grey-200` |
| 300 | #D5D5D5 | `grey-300` |
| 400 | #B1B1B1 | `grey-400` |
| 500 | #909090 | `grey-500` |
| 600 | #6C6C6C | `grey-600` |
| 700 | #464646 | `grey-700` |
| 800 | #222222 | `grey-800` |

#### Blue (Primary)
| Shade | Hex | Class |
|-------|-----|-------|
| 50 | #E5F2FF | `blue-50` |
| 100 | #D6EBFF | `blue-100` |
| 200 | #BDDCFF | `blue-200` |
| 300 | #99C9FF | `blue-300` |
| 400 | #66A8FF | `blue-400` |
| 500 | #3388FF | `blue-500` |
| 600 | #0066FF | `blue-600` |
| 700 | #0052CC | `blue-700` |
| 800 | #003D99 | `blue-800` |

#### Green (Success)
| Shade | Hex | Class |
|-------|-----|-------|
| 50 | #E1FEE2 | `green-50` |
| 100 | #BEFDC0 | `green-100` |
| 500 | #20BA31 | `green-500` |
| 600 | #229F2E | `green-600` |
| 700 | #187E22 | `green-700` |

#### Red (Error/Destructive)
| Shade | Hex | Class |
|-------|-----|-------|
| 50 | #FDF1F2 | `red-50` |
| 100 | #FAD9D9 | `red-100` |
| 500 | #F2574E | `red-500` |
| 600 | #E33F30 | `red-600` |
| 700 | #A82B20 | `red-700` |

#### Orange (Warning)
| Shade | Hex | Class |
|-------|-----|-------|
| 50 | #FFEDE7 | `orange-50` |
| 100 | #FFD9CB | `orange-100` |
| 500 | #F68009 | `orange-500` |
| 600 | #D66B06 | `orange-600` |

#### Yellow
| Shade | Hex | Class |
|-------|-----|-------|
| 50 | #FEF9D7 | `yellow-50` |
| 100 | #FEEFA1 | `yellow-100` |
| 500 | #D3B200 | `yellow-500` |

---

## Typography

**Font families:**
- Display/Body: `Sora, sans-serif`
- Code: `Fragment Mono, monospace`

### Font Size Scale

| Token | Size | Line Height | Class | Typical Use |
|-------|------|-------------|-------|-------------|
| 4xs | 11px | 18px | `text-4xs` | Captions, fine print |
| 3xs | 12px | 20px | `text-3xs` | Small body, badges |
| 2xs | 14px | 24px | `text-2xs` | **Default body text** |
| xs | 16px | 28px | `text-xs` | Large body, subheadings |
| sm | 20px | 32px | `text-sm` | Subheadings, large labels |
| md | 24px | 36px | `text-md` | Subsection headings |
| lg | 28px | 40px | `text-lg` | Card/section titles |
| xl | 32px | 44px | `text-xl` | Page section headers |
| 2xl | 40px | 52px | `text-2xl` | Page titles (use sparingly) |
| 3xl | 64px | 84px | `text-3xl` | Marketing/hero only (see note) |

> **Typography sizing guidance:** This is an enterprise SaaS product UI — not a marketing site. Most UI text should fall in the `text-4xs` to `text-lg` range (11–28px). Sizes `text-xl` (32px) and above should be rare and intentional — reserved for top-level page titles or hero moments. `text-3xl` (64px) is almost never appropriate inside the app shell; use it only for standalone landing pages, empty states with a dramatic message, or marketing-style hero sections. When in doubt, go smaller — oversized text in a dense UI looks broken, not bold.

### Text Style Classes

| Style | Classes | Usage |
|-------|---------|-------|
| **Display** | `text-3xl font-bold` | Hero headings |
| **Heading XL** | `text-2xl font-bold` | Page titles |
| **Heading LG** | `text-xl font-bold` | Section headers |
| **Heading** | `text-lg font-bold` | Card titles |
| **Heading SM** | `text-md font-bold` | Subsections |
| **Subheading LG** | `text-sm font-semibold` | Large labels |
| **Subheading** | `text-xs font-semibold` | Labels, nav items |
| **Subheading SM** | `text-2xs font-semibold` | Small labels |
| **Body LG** | `text-xs` | Large body text |
| **Body** | `text-2xs` | Default body text |
| **Body SM** | `text-3xs` | Small body text |
| **Caption LG** | `text-3xs font-medium` | Large captions |
| **Caption MD** | `text-4xs font-medium` | Medium captions |
| **Caption SM** | `text-4xs` | Small captions |
| **Code LG** | `font-mono text-2xs` | Large code |
| **Code MD** | `font-mono text-3xs` | Default code |
| **Code SM** | `font-mono text-4xs` | Small code |

---

## Layout Shell

New prototypes use the `AppShell` component for consistent layout:

```
┌─────────────────────────────────────────────────────────┐
│  TOP HEADER (40px) - Dark gradient, logo, search, icons │
└─────────────────────────────────────────────────────────┘
┌──────┬──────────────────────────────────────────────────┐
│ SIDE │  Breadcrumb or Title (32px)                      │
│RIBBON├──────────────────────────────────────────────────┤
│ 48px │  ┌─────────┬────────────────────────────────┐    │
│      │  │Secondary│  Main Content (white, rounded) │    │
│      │  │Nav 170px│                                │    │
│      │  └─────────┴────────────────────────────────┘    │
└──────┴──────────────────────────────────────────────────┘
```

### Key Dimensions
- Top Header: 40px height, gradient `#001e54` → `#001131`
- Side Ribbon: 48px width, `#2266e2` blue
- Secondary Nav: 170px width (optional)
- Breadcrumb: 32px height
- Content background: `#e8f0fc`
- Main content: white with `rounded-lg`
- Gap/padding: 10px

### Usage

```tsx
import { AppShell } from '@/components/layout';

// Simple page with title
<AppShell title="Dashboard">
  <div className="p-6">Content here</div>
</AppShell>

// Page with breadcrumb
<AppShell
  breadcrumbs={[
    { label: 'Settings' },
    { label: 'Notifications' }
  ]}
>
  <div className="p-6">Content here</div>
</AppShell>

// Page with secondary nav
<AppShell
  title="Settings"
  secondaryNav={[
    {
      title: 'General',
      items: [
        { label: 'Account', route: '/settings/account', icon: UserIcon },
        { label: 'Profile', route: '/settings/profile', icon: ProfileIcon },
      ]
    }
  ]}
>
  <div className="p-6">Content here</div>
</AppShell>
```

---

## Component Patterns

### Buttons

```tsx
// Primary action
<Button>Save Changes</Button>

// Secondary action
<Button variant="secondary">Cancel</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// Ghost/subtle
<Button variant="ghost">Edit</Button>
```

### Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Form Elements

```tsx
// Input with label
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Enter email" />
</div>

// Select
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Choose option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="a">Option A</SelectItem>
    <SelectItem value="b">Option B</SelectItem>
  </SelectContent>
</Select>
```

### Badges/Status

```tsx
// Status indicators
<span className="rounded-full bg-green-100 px-2 py-0.5 text-3xs font-medium text-green-700">Active</span>
<span className="rounded-full bg-red-100 px-2 py-0.5 text-3xs font-medium text-red-700">Error</span>
<span className="rounded-full bg-orange-100 px-2 py-0.5 text-3xs font-medium text-orange-700">Pending</span>
<span className="rounded-full bg-grey-100 px-2 py-0.5 text-3xs font-medium text-grey-600">Inactive</span>
```

---

## Spacing Guidelines

- Use Tailwind spacing utilities: `p-1` (4px) through `p-8` (32px)
- Standard content padding: `p-6` (24px)
- Card internal padding: `p-4` or `p-6`
- Gap between elements: `gap-2` (8px), `gap-4` (16px), `gap-6` (24px)
- Section spacing: `space-y-6` or `space-y-8`

---

## Do's and Don'ts

### Do
- Use semantic color tokens (`text-foreground`, `bg-primary`) before raw colors
- Use the AppShell for all pages to maintain consistency
- Use `text-2xs` for default body text (14px)
- Use Sora font (automatically applied via CSS)
- Keep button text concise
- Use the provided shadcn-style components from `src/components/ui/`

### Don't
- Don't use hardcoded colors like `#000000` - use `text-grey-800` or `text-foreground`
- Don't mix font families - stick to Sora for text, Fragment Mono for code only
- Don't create custom button styles - use Button component with variants
- Don't use Tailwind's default gray - use `grey` (with an 'e')
- Don't skip the AppShell wrapper on pages
- Don't use default Tailwind text sizes - use the custom scale (`text-2xs`, `text-3xs`, etc.)
- Don't use `text-2xl`/`text-3xl` for regular UI elements — these are for page titles or hero sections only. Most headings should be `text-lg` or smaller.
