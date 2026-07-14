@import "tailwindcss";

@theme {
  /* BRAND */
  --color-brand: var(--brand-default);
  --color-brand-dark: var(--brand-dark);
  --color-brand-light: var(--brand-light);
  --color-brand-subtle: var(--brand-subtle);
  --color-brand-foreground: var(--brand-foreground);

  /* ACCENT */
  --color-accent: var(--accent-default);
  --color-accent-dark: var(--accent-dark);
  --color-accent-light: var(--accent-light);
  --color-accent-subtle: var(--accent-subtle);
  --color-accent-foreground: var(--accent-foreground);

  /* NEUTRAL */
  --color-neutral-50: var(--neutral-50);
  --color-neutral-100: var(--neutral-100);
  --color-neutral-200: var(--neutral-200);
  --color-neutral-300: var(--neutral-300);
  --color-neutral-400: var(--neutral-400);
  --color-neutral-500: var(--neutral-500);
  --color-neutral-600: var(--neutral-600);
  --color-neutral-700: var(--neutral-700);
  --color-neutral-800: var(--neutral-800);
  --color-neutral-900: var(--neutral-900);

  /* TEXT */
  --color-text-heading: var(--text-heading);
  --color-text-body: var(--text-body);
  --color-text-muted: var(--text-muted);
  --color-text-inverse: var(--text-inverse);
  --color-text-link: var(--text-link);

  /* BACKGROUND */
  --color-bg-page: var(--bg-page);
  --color-bg-surface: var(--bg-surface);
  --color-bg-elevated: var(--bg-elevated);
  --color-bg-sunken: var(--bg-sunken);

  /* BORDER */
  --color-border: var(--border-default);
  --color-border-strong: var(--border-strong);
  --color-border-subtle: var(--border-subtle);
  --color-border-focus: var(--border-focus);

  /* STATUS */
  --color-success: var(--success-default);
  --color-success-light: var(--success-light);
  --color-warning: var(--warning-default);
  --color-warning-light: var(--warning-light);
  --color-error: var(--error-default);
  --color-error-light: var(--error-light);
  --color-info: var(--info-default);
  --color-info-light: var(--info-light);

  /* GRADIENTS */
  --background-image-brand: var(--gradient-brand);
  --background-image-accent: var(--gradient-accent);
  --background-image-hero: var(--gradient-hero);
  --background-image-surface: var(--gradient-surface);
  --background-image-card: var(--gradient-card);

  /* SHADOWS */
  --shadow-sm: var(--shadow-sm);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-brand: var(--shadow-brand);

  /* RADIUS */
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);
  --radius-2xl: var(--radius-2xl);
  --radius-3xl: var(--radius-3xl);
  --radius-full: var(--radius-full);

  /* TYPOGRAPHY */
  --font-sans: var(--font-family-sans);
  --font-mono: var(--font-family-mono);
  --text-xs: var(--font-size-xs);
  --text-sm: var(--font-size-sm);
  --text-base: var(--font-size-base);
  --text-lg: var(--font-size-lg);
  --text-xl: var(--font-size-xl);
  --text-2xl: var(--font-size-2xl);
  --text-3xl: var(--font-size-3xl);
  --text-4xl: var(--font-size-4xl);
  --font-weight-normal: var(--font-weight-normal);
  --font-weight-medium: var(--font-weight-medium);
  --font-weight-bold: var(--font-weight-bold);
  --font-weight-black: var(--font-weight-black);
  --line-height-none: var(--line-height-none);
  --line-height-tight: var(--line-height-tight);
  --line-height-snug: var(--line-height-snug);
  --line-height-normal: var(--line-height-normal);
  --line-height-relaxed: var(--line-height-relaxed);
  --line-height-loose: var(--line-height-loose);

  /* SPACING */
  --spacing-0: var(--spacing-0);
  --spacing-1: var(--spacing-1);
  --spacing-2: var(--spacing-2);
  --spacing-3: var(--spacing-3);
  --spacing-4: var(--spacing-4);
  --spacing-5: var(--spacing-5);
  --spacing-6: var(--spacing-6);
  --spacing-8: var(--spacing-8);
  --spacing-10: var(--spacing-10);
  --spacing-12: var(--spacing-12);
  --spacing-16: var(--spacing-16);
  --spacing-20: var(--spacing-20);
  --spacing-24: var(--spacing-24);
  --spacing-32: var(--spacing-32);

  /* COMMON */
  --base-white: var(--base-white);
  --base-black: var(--base-black);
  --selection-background: var(--selection-background);
  --selection-foreground: var(--selection-foreground);
  --overlay: var(--overlay);
  --ring: var(--ring);
  --skeleton: var(--skeleton);

  /* BRAND SHADES */
  --color-brand-50: var(--brand-50);
  --color-brand-100: var(--brand-100);
  --color-brand-200: var(--brand-200);
  --color-brand-300: var(--brand-300);
  --color-brand-400: var(--brand-400);
  --color-brand-500: var(--brand-500);
  --color-brand-600: var(--brand-600);
  --color-brand-700: var(--brand-700);
  --color-brand-800: var(--brand-800);
  --color-brand-900: var(--brand-900);
  --color-brand-950: var(--brand-950);

  /* COMPONENT TOKENS (Semantic Aliases) */
  --color-button-primary: var(--color-brand);
  --color-button-primary-hover: var(--color-brand-dark);
  --color-button-primary-text: var(--color-brand-foreground);
  --color-card-bg: var(--color-bg-surface);
  --color-card-border: var(--color-border-subtle);
  --color-input-bg: var(--color-bg-sunken);
  --color-input-border: var(--color-border);
  --color-input-focus: var(--color-border-focus);

  /* LAYOUT TOKENS */
  --container-width: 1280px;
  --section-padding: 80px;
  --card-padding: 24px;
}

:root {
  /* BRAND */
  --brand-default: hsl(10, 35%, 33%);
  --brand-dark: hsl(9, 43%, 25%);
  --brand-light: hsl(11, 27%, 51%);
  --brand-subtle: hsl(10, 35%, 33%);
  --brand-foreground: hsl(0, 0%, 100%);

  /* ACCENT */
  --accent-default: hsl(160, 35%, 33%);
  --accent-dark: hsl(162, 50%, 24%);
  --accent-light: hsl(158, 25%, 52%);
  --accent-subtle: hsl(160, 35%, 33%);
  --accent-foreground: hsl(0, 0%, 100%);

  /* NEUTRAL */
  --neutral-50: hsl(0, 8%, 95%);
  --neutral-100: hsl(0, 2%, 84%);
  --neutral-200: hsl(0, 1%, 73%);
  --neutral-300: hsl(0, 1%, 62%);
  --neutral-400: hsl(0, 1%, 51%);
  --neutral-500: hsl(0, 1%, 41%);
  --neutral-600: hsl(0, 1%, 32%);
  --neutral-700: hsl(0, 2%, 22%);
  --neutral-800: hsl(0, 1%, 14%);
  --neutral-900: hsl(0, 8%, 5%);

  /* TEXT */
  --text-heading: hsl(0, 1%, 14%);
  --text-body: hsl(0, 2%, 22%);
  --text-muted: hsl(0, 1%, 41%);
  --text-inverse: hsl(0, 0%, 100%);
  --text-link: hsl(10, 35%, 33%);

  /* BACKGROUND */
  --bg-page: hsl(0, 8%, 95%);
  --bg-surface: hsl(0, 0%, 100%);
  --bg-elevated: hsl(0, 0%, 100%);
  --bg-sunken: hsl(0, 2%, 84%);

  /* BORDER */
  --border-default: hsl(0, 0%, 100%);
  --border-strong: hsl(0, 0%, 100%);
  --border-subtle: hsl(0, 0%, 100%);
  --border-focus: hsl(10, 35%, 33%);

  /* STATUS */
  --success-default: hsl(142, 65%, 36%);
  --success-light: hsl(135, 66%, 67%);
  --warning-default: hsl(38, 90%, 50%);
  --warning-light: hsl(51, 100%, 70%);
  --error-default: hsl(0, 84%, 60%);
  --error-light: hsl(6, 100%, 76%);
  --info-default: hsl(217, 90%, 60%);
  --info-light: hsl(211, 100%, 80%);

  /* GRADIENTS */
  --gradient-brand: linear-gradient(135deg, #5b2c24 0%, #37735f 100%);
  --gradient-accent: linear-gradient(135deg, #37735f 0%, #65a28c 100%);
  --gradient-hero: linear-gradient(135deg, #5b2c24 0%, #734137 50%, #37735f 100%);
  --gradient-surface: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  --gradient-card: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%);

  /* SHADOWS */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-brand: 0 0 20px rgb(115 65 55 / 0.2);

  /* RADIUS */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-3xl: 32px;
  --radius-full: 9999px;

  /* TYPOGRAPHY */
  --font-family-sans: Inter, system-ui, -apple-system, sans-serif;
  --font-family-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --font-size-3xl: 30px;
  --font-size-4xl: 36px;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
  --font-weight-black: 900;
  --line-height-none: 1;
  --line-height-tight: 1.25;
  --line-height-snug: 1.375;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  --line-height-loose: 2;

  /* SPACING */
  --spacing-0: 0px;
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-16: 64px;
  --spacing-20: 80px;
  --spacing-24: 96px;
  --spacing-32: 128px;

  /* COMMON */
  --base-white: #ffffff;
  --base-black: #000000;
  --selection-background: rgb(115 65 55 / 0.3);
  --selection-foreground: inherit;
  --overlay: rgba(0, 0, 0, 0.4);
  --ring: rgb(115 65 55 / 0.4);
  --skeleton: #d6d4d4;

  /* BRAND SHADES */
  --brand-50: hsl(17, 100%, 95%);
  --brand-100: hsl(11, 100%, 93%);
  --brand-200: hsl(11, 76%, 85%);
  --brand-300: hsl(10, 58%, 76%);
  --brand-400: hsl(10, 37%, 63%);
  --brand-500: hsl(10, 26%, 50%);
  --brand-600: hsl(11, 31%, 40%);
  --brand-700: hsl(10, 38%, 31%);
  --brand-800: hsl(9, 42%, 22%);
  --brand-900: hsl(10, 48%, 15%);
  --brand-950: hsl(9, 71%, 9%);

}

@layer base {
  * { border-color: var(--color-border); }
  body {
    background-color: var(--color-bg-page);
    color: var(--color-text-body);
    font-family: var(--font-sans);
  }
  h1, h2, h3, h4, h5, h6 {
    color: var(--color-text-heading);
    font-weight: 700;
  }
  a { color: var(--color-text-link); }
}

@layer utilities {
  .text-balance { text-wrap: balance; }
  .text-pretty { text-wrap: pretty; }
  .bg-elevated { background-color: var(--color-bg-elevated); }
  .bg-sunken { background-color: var(--color-bg-sunken); }
  .shadow-brand { box-shadow: var(--shadow-brand); }
}
