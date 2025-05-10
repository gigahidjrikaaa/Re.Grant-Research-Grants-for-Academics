import type { Config } from "tailwindcss";
import plugin from 'tailwindcss/plugin';
import animate from "tailwindcss-animate";

const config : Config = {
  darkMode: "class",
  content: [
    // Ensure all relevant files within your /src directory are scanned
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Direct custom color definitions for utility classes like `bg-primary-blue`
      // These are your brand's named colors.
      colors: {
        'primary-blue': '#1E3A8A',
        'accent-yellow': '#D97706',
        'brand-background': '#F9FAFB',
        'content-background': '#FFFFFF',
        'text-primary': '#1F2937',
        'text-secondary': '#6B7280',
        'border-primary': '#E5E7EB',
        'border-input': '#D1D5DB',

        // Shadcn UI related colors are primarily driven by CSS variables in globals.css.
        // However, defining them here allows Tailwind to generate utility classes
        // like `bg-primary`, `text-accent` if you choose to use them directly,
        // and they will pick up the CSS variable values.
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))", // For `bg-background`
        foreground: "hsl(var(--foreground))", // For `text-foreground`
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom Status Colors (can be used directly with Tailwind classes)
        'status-success': '#10B981',
        'status-warning': '#D97706',
        'status-info': '#3B82F6',
        'status-danger': '#EF4444',
      },
      borderRadius: {
        lg: "var(--radius)", // from globals.css
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      textShadow: {
        DEFAULT: '0 0 8px hsl(var(--sky-300-hsl)/0.5)', // Uses CSS variable from globals.css
        hover: '0 0 16px hsl(var(--sky-300-hsl)/0.8)',
        sm: '1px 1px 2px var(--tw-shadow-color)',
        md: '2px 2px 4px var(--tw-shadow-color)',
        lg: '3px 3px 6px var(--tw-shadow-color)',
        none: 'none',
      },
    },
  },
  plugins: [
    animate,
    // Custom text-shadow plugin
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') }
      )
    }),
  ],
};

export default config;
