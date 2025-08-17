const PALETTES: Record<string, { label: string; shades: Record<string, string> }> = {
  brand: {
    label: "Brand",
    shades: {
      25: "#F2F7FF",
      50: "#ECF3FF",
      100: "#DDE9FF",
      200: "#C2D6FF",
      300: "#9CB9FF",
      400: "#7592FF",
      500: "#465FFF",
      600: "#3641F5",
      700: "#2A31D8",
      800: "#252DAE",
      900: "#262E89",
      950: "#161950",
    },
  },
  gray: {
    label: "Gray",
    shades: {
      25: "#FCFCFD",
      50: "#F9FAFB",
      100: "#F2F4F7",
      200: "#E4E7EC",
      300: "#D0D5DD",
      400: "#98A2B3",
      500: "#667085",
      600: "#475467",
      700: "#344054",
      800: "#1D2939",
      900: "#101828",
      950: "#0C111D",
    },
  },
  success: {
    label: "Success",
    shades: {
      25: "#F6FEF9",
      50: "#ECFDF3",
      100: "#D1FADF",
      200: "#A6F4C5",
      300: "#6CE9A6",
      400: "#32D583",
      500: "#12B76A",
      600: "#039855",
      700: "#027A48",
      800: "#05603A",
      900: "#054F31",
      950: "#053321",
    },
  },
  warning: {
    label: "Warning",
    shades: {
      25: "#FFFCF5",
      50: "#FFFAEB",
      100: "#FEF0C7",
      200: "#FEDF89",
      300: "#FEC84B",
      400: "#FDB022",
      500: "#F79009",
      600: "#DC6803",
      700: "#B54708",
      800: "#93370D",
      900: "#7A2E0E",
      950: "#4E1D09",
    },
  },
  error: {
    label: "Error",
    shades: {
      25: "#FFFBFA",
      50: "#FEF3F2",
      100: "#FEE4E2",
      200: "#FECDCA",
      300: "#FDA29B",
      400: "#F97066",
      500: "#F04438",
      600: "#D92D20",
      700: "#B42318",
      800: "#912018",
      900: "#7A271A",
      950: "#55160C",
    },
  },
};

const TYPE_SCALE: { name: string; size: string; leading: string; className: string }[] = [
  { name: "Title / 2XL", size: "72px", leading: "90px", className: "text-[72px] leading-[90px]" },
  { name: "Title / XL", size: "60px", leading: "72px", className: "text-[60px] leading-[72px]" },
  { name: "Title / LG", size: "48px", leading: "60px", className: "text-[48px] leading-[60px]" },
  { name: "Title / MD", size: "36px", leading: "44px", className: "text-[36px] leading-[44px]" },
  { name: "Title / SM", size: "30px", leading: "38px", className: "text-[30px] leading-[38px]" },
  { name: "Theme / XL", size: "20px", leading: "30px", className: "text-[20px] leading-[30px]" },
  { name: "Theme / SM", size: "14px", leading: "20px", className: "text-[14px] leading-[20px]" },
  { name: "Theme / XS", size: "12px", leading: "18px", className: "text-[12px] leading-[18px]" },
];

const SHADOWS: { token: string; value: string }[] = [
  { token: "shadow-theme-xs", value: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)" },
  { token: "shadow-theme-sm", value: "0px 1px 3px 0px rgba(16, 24, 40, 0.10), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)" },
  { token: "shadow-theme-md", value: "0px 4px 8px -2px rgba(16, 24, 40, 0.10), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)" },
  { token: "shadow-theme-lg", value: "0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)" },
  { token: "shadow-theme-xl", value: "0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)" },
  { token: "shadow-focus-ring", value: "0px 0px 0px 4px rgba(70, 95, 255, 0.12)" },
];

function Swatch({ hex, label }: { hex: string; label: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
      <div className="h-16" style={{ backgroundColor: hex }} />
      <div className="p-3 text-sm flex items-center justify-between">
        <span className="font-medium text-gray-800">{label}</span>
        <span className="font-mono text-gray-600">{hex}</span>
      </div>
    </div>
  );
}

function Section({ title, children, subtitle }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

const Code = ({ children }: { children: React.ReactNode }) => (
  <pre className="whitespace-pre-wrap text-[13px] leading-5 rounded-xl border bg-gray-25 border-gray-200 p-4 font-mono overflow-x-auto">
    {children}
  </pre>
);

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-theme-xs">
    {children}
  </span>
);

export default function StyleGuide() {
  return (
    <div className="min-h-screen w-full bg-gray-25 text-gray-900">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/90 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[--brand-600]" style={{ backgroundColor: '#3641F5' }} />
            <div>
              <h1 className="text-xl font-semibold">TailAdmin Style Guide</h1>
              <p className="text-sm text-gray-600">React + Tailwind · Font: Outfit · Dark mode supported (class)</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Pill>Tailwind</Pill>
            <Pill>@tailwindcss/forms</Pill>
            <Pill>Shadows: theme-*</Pill>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Brand & Tokens */}
        <Section title="Identity" subtitle="Core tokens derived from your tailwind.config.js">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border bg-white border-gray-200 p-6 shadow-theme-sm">
              <h3 className="font-semibold mb-4">Font Family</h3>
              <p className="text-gray-700 mb-3">Primary: <strong>Outfit</strong> (fallback: sans-serif)</p>
              <div className="space-y-1">
                <p className="text-[32px] leading-9 font-semibold">Headlines use Outfit</p>
                <p className="text-[18px] leading-7 text-gray-700">Body copy uses Outfit for a clean, geometric look.</p>
              </div>
              <Code>{`// tailwind.config.js
export default {
  theme: { fontFamily: { outfit: ["Outfit", "sans-serif"] } },
};
// Usage: className="font-outfit"`}</Code>
            </div>

            <div className="rounded-2xl border bg-white border-gray-200 p-6 shadow-theme-sm">
              <h3 className="font-semibold mb-4">Color System</h3>
              <p className="text-gray-700 mb-3">Use semantic tokens: <code className="px-1.5 py-0.5 rounded bg-gray-50 border">brand</code>, <code className="px-1.5 py-0.5 rounded bg-gray-50 border">gray</code>, <code className="px-1.5 py-0.5 rounded bg-gray-50 border">success</code>, <code className="px-1.5 py-0.5 rounded bg-gray-50 border">warning</code>, <code className="px-1.5 py-0.5 rounded bg-gray-50 border">error</code>.</p>
              <Code>{`// Example
<div className="bg-brand-600 text-white">Primary</div>
<p className="text-gray-700">Body</p>
<button className="bg-success-600 hover:bg-success-700">Save</button>`}</Code>
            </div>
          </div>
        </Section>

        <Section title="Palettes">
          {Object.entries(PALETTES).map(([key, p]) => (
            <div key={key} className="mb-8">
              <h3 className="text-lg font-semibold mb-3">{p.label}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {Object.entries(p.shades).map(([shade, hex]) => (
                  <Swatch key={shade} hex={hex} label={⁠ ${key}-${shade} ⁠} />
                ))}
              </div>
            </div>
          ))}
        </Section>

        <Section title="Typography" subtitle="Type scale mapped to your theme tokens">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border bg-white border-gray-200 p-6 shadow-theme-sm">
              <div className="space-y-4">
                {TYPE_SCALE.map((t) => (
                  <div key={t.name} className="border-b last:border-none border-gray-200 pb-4">
                    <div className="text-sm text-gray-600 mb-1">{t.name} · {t.size}/{t.leading}</div>
                    <div className={t.className + " font-semibold text-gray-900"}>The quick brown fox jumps over the lazy dog</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border bg-white border-gray-200 p-6 shadow-theme-sm">
              <h4 className="font-semibold mb-3">Usage</h4>
              <Code>{`// Examples
<h1 className="text-[48px] leading-[60px] font-semibold text-gray-900">Dashboard</h1>
<p className="text-[14px] leading-[20px] text-gray-600">Helper description text</p>`}</Code>
              <h4 className="font-semibold mt-6 mb-2">Contrast & States</h4>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Headlines: <code>text-gray-900</code></li>
                <li>Body: <code>text-gray-700</code> / Secondary: <code>text-gray-600</code></li>
                <li>Disabled: <code>text-gray-400</code></li>
              </ul>
            </div>
          </div>
        </Section>

        <Section title="Buttons" subtitle="Primary, neutrals, and status variants">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Solid */}
            <div className="rounded-2xl border bg-white border-gray-200 p-6 shadow-theme-sm">
              <h4 className="font-semibold mb-3">Solid</h4>
              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-white shadow-theme-sm hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-600/20">Primary</button>
                <button className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-white shadow-theme-sm hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-800/20">Dark</button>
                <button className="inline-flex items-center gap-2 rounded-lg bg-success-600 px-4 py-2 text-white shadow-theme-sm hover:bg-success-700 focus:outline-none focus:ring-4 focus:ring-success-600/20">Success</button>
                <button className="inline-flex items-center gap-2 rounded-lg bg-warning-500 px-4 py-2 text-white shadow-theme-sm hover:bg-warning-600 focus:outline-none focus:ring-4 focus:ring-warning-500/20">Warning</button>
                <button className="inline-flex items-center gap-2 rounded-lg bg-error-600 px-4 py-2 text-white shadow-theme-sm hover:bg-error-700 focus:outline-none focus:ring-4 focus:ring-error-600/20">Danger</button>
              </div>
              <Code>{`<button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg shadow-theme-sm">...
</button>`}</Code>
            </div>

            {/* Outline & Ghost */}
            <div className="rounded-2xl border bg-white border-gray-200 p-6 shadow-theme-sm">
              <h4 className="font-semibold mb-3">Outline & Ghost</h4>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-lg border border-brand-600 text-brand-700 px-4 py-2 hover:bg-brand-50">Outline</button>
                <button className="rounded-lg border border-gray-300 text-gray-700 px-4 py-2 hover:bg-gray-50">Neutral</button>
                <button className="rounded-lg text-brand-700 px-4 py-2 hover:bg-brand-50">Ghost</button>
              </div>
              <Code>{⁠ <button className="border border-brand-600 text-brand-700 hover:bg-brand-50 rounded-lg px-4 py-2">...</button> ⁠}</Code>
            </div>
          </div>
        </Section>

        <Section title="Form Controls" subtitle="@tailwindcss/forms is enabled">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border bg-white border-gray-200 p-6 shadow-theme-sm space-y-4">
              <label className="block text-sm font-medium text-gray-700">Label</label>
              <input className="mt-1 block w-full rounded-lg border-gray-300 focus:border-brand-600 focus:ring-brand-600" placeholder="Text input" />
              <select className="block w-full rounded-lg border-gray-300 focus:border-brand-600 focus:ring-brand-600">
                <option>Option A</option>
                <option>Option B</option>
              </select>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" className="rounded border-gray-300 text-brand-600 focus:ring-brand-600" defaultChecked />
                  Checkbox
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input type="radio" name="r" className="border-gray-300 text-brand-600 focus:ring-brand-600" defaultChecked />
                  Radio
                </label>
              </div>
            </div>
            <div className="rounded-2xl border bg-white border-gray-200 p-6 shadow-theme-sm">
              <h4 className="font-semibold mb-3">Guidelines</h4>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Use <code>focus:ring-brand-600</code> for primary focus.</li>
                <li>Neutral borders: <code>border-gray-300</code>. Disabled: <code>bg-gray-50 text-gray-400</code>.</li>
                <li>Error state: <code>border-error-300</code> + <code>text-error-700</code>.</li>
              </ul>
              <Code>{⁠ <input className="rounded-lg border-gray-300 focus:border-brand-600 focus:ring-brand-600" /> ⁠}</Code>
            </div>
          </div>
        </Section>

        <Section title="Cards, Alerts & Tables">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="rounded-2xl border bg-white border-gray-200 p-6 shadow-theme-sm">
              <h4 className="font-semibold mb-3">Card</h4>
              <p className="text-gray-700">Use <code>rounded-2xl</code>, <code>border</code>, and <code>shadow-theme-sm</code>.</p>
              <button className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700">Call to action</button>
            </div>
            <div className="rounded-2xl border bg-white border-gray-200 p-6 shadow-theme-sm">
              <h4 className="font-semibold mb-3">Alerts</h4>
              <div className="space-y-3">
                <div className="rounded-lg border-l-4 border-success-600 bg-success-50 px-4 py-2 text-success-700">Success: saved!</div>
                <div className="rounded-lg border-l-4 border-warning-600 bg-warning-50 px-4 py-2 text-warning-700">Warning: be careful…</div>
                <div className="rounded-lg border-l-4 border-error-600 bg-error-50 px-4 py-2 text-error-700">Error: something went wrong.</div>
              </div>
            </div>
            <div className="rounded-2xl border bg-white border-gray-200 p-6 shadow-theme-sm overflow-x-auto">
              <h4 className="font-semibold mb-3">Table</h4>
              <table className="min-w-[520px] w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="text-[12px] uppercase text-gray-600">
                    <th className="bg-gray-50 px-4 py-2 first:rounded-tl-xl">Name</th>
                    <th className="bg-gray-50 px-4 py-2">Status</th>
                    <th className="bg-gray-50 px-4 py-2">Action</th>
                    <th className="bg-gray-50 px-4 py-2 first:rounded-tr-xl"></th>
                  </tr>
                </thead>
                <tbody className="text-[14px]">
                  {["Alpha", "Beta", "Gamma"].map((row, i) => (
                    <tr key={row} className="border-b border-gray-200 last:border-0">
                      <td className="px-4 py-2 text-gray-900">{row}</td>
                      <td className="px-4 py-2"><span className="rounded-full bg-brand-50 text-brand-700 px-2.5 py-1 text-xs">Active</span></td>
                      <td className="px-4 py-2"><button className="text-brand-700 hover:underline">View</button></td>
                      <td className="px-4 py-2 text-right text-gray-500">#{i + 1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        <Section title="Elevation (Shadows)">
          <div className="grid md:grid-cols-2 gap-6">
            {SHADOWS.map((s) => (
              <div key={s.token} className="rounded-2xl border bg-white border-gray-200 p-6 shadow-theme-sm">
                <div className={⁠ h-20 rounded-xl bg-white border border-gray-200 ${s.token} ⁠} />
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-medium">{s.token}</span>
                  <code className="text-gray-600">{s.value}</code>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Spacing & Radius" subtitle="Use Tailwind’s default scale; project extends fractional steps (e.g., 6.5, 7.5)">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border bg-white border-gray-200 p-6 shadow-theme-sm">
              <h4 className="font-semibold mb-3">Spacing examples</h4>
              <div className="flex items-end gap-3">
                {[1,2,3,4,5,6,7,8].map((n) => (
                  <div key={n} className="rounded-t-md bg-brand-600" style={{ width: 24, height: n * 6 }} title={⁠ p-${n} ⁠}></div>
                ))}
                <div className="rounded-t-md bg-brand-600" style={{ width: 24, height: 26 }} title="p-6.5" />
                <div className="rounded-t-md bg-brand-600" style={{ width: 24, height: 30 }} title="p-7.5" />
              </div>
              <Code>{`// Extended spacing (excerpt)
// ... 6.5: "1.625rem", 7.5: "1.875rem", 8.5: "2.125rem", 9.5: "2.375rem" ...`}</Code>
            </div>
            <div className="rounded-2xl border bg-white border-gray-200 p-6 shadow-theme-sm">
              <h4 className="font-semibold mb-3">Radius</h4>
              <div className="flex items-center gap-4">
                {[
                  { cls: "rounded-sm", label: "rounded-sm" },
                  { cls: "rounded-md", label: "rounded-md" },
                  { cls: "rounded-lg", label: "rounded-lg" },
                  { cls: "rounded-xl", label: "rounded-xl" },
                  { cls: "rounded-2xl", label: "rounded-2xl" },
                ].map((r) => (
                  <div key={r.cls} className={⁠ h-14 w-14 bg-brand-600 ${r.cls} ⁠} title={r.label} />
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Dark Mode" subtitle="The project uses class strategy (add .dark on <html> or a wrapper)">
          <div className="rounded-2xl border bg-white border-gray-200 p-6 shadow-theme-sm">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl border p-4 bg-white text-gray-900">
                <div className="font-medium mb-2">Light</div>
                <button className="rounded-lg bg-brand-600 px-3 py-1.5 text-white">Button</button>
                <p className="mt-3 text-gray-700">Body text</p>
              </div>
              <div className="rounded-xl border p-4 bg-gray-900 text-white">
                <div className="font-medium mb-2">Dark</div>
                <button className="rounded-lg bg-brand-600 px-3 py-1.5 text-white">Button</button>
                <p className="mt-3 text-gray-300">Body text</p>
              </div>
            </div>
            <Code>{`// Enable dark styles by toggling a class
<html class="dark"> ...
// Then use dark: variants
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">...</div>`}</Code>
          </div>
        </Section>

        <Section title="Code Snippets">
          <Code>{`// Primary button
<button className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-white shadow-theme-sm hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-600/20">CTA</button>

// Input with focus ring
<input className="block w-full rounded-lg border-gray-300 focus:border-brand-600 focus:ring-brand-600" />

// Success alert
<div className="rounded-lg border-l-4 border-success-600 bg-success-50 px-4 py-2 text-success-700">Saved!</div>`}</Code>
        </Section>

        <footer className="mt-16 text-center text-sm text-gray-500">
          Generated from your TailAdmin Tailwind tokens · Customize in <code>tailwind.config.js</code>
        </footer>
      </main>
    </div>
  );
}