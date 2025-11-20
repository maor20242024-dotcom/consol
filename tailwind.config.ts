import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
        extend: {
                colors: {
                        // IMPERIUM GATE Luxury Palette
                        panel: 'var(--panel)',
                        'panel-foreground': 'var(--panel-foreground)',
                        'panel-soft': 'var(--panel-soft)',
                        'border-soft': 'var(--border-soft)',
                        // Sky Blue Deep Color Scheme - Professional AI Theme
                        primary: {
                            DEFAULT: '#0ea5e9', // Sky Blue 500
                            '50': '#eff6ff',
                            '100': '#dbeafe',
                            '200': '#bfdbfe',
                            '300': '#93c5fd',
                            '400': '#60a5fa',
                            '500': '#3b82f6', // Sky Blue 500 - Primary
                            '600': '#2563eb', // Sky Blue 600
                            '700': '#1d4ed8',
                            '800': '#1e40af',
                            '900': '#1e3a8a',
                            '950': '#172554',
                        },
                        secondary: {
                            DEFAULT: '#cbd5e1', // Slate 300 - Light text
                            '50': '#f8fafc',
                            '100': '#f1f5f9',
                            '200': '#e2e8f0',
                            '300': '#cbd5e1',
                            '400': '#94a3b8',
                            '500': '#64748b',
                            '600': '#475569',
                            '700': '#334155',
                            '800': '#1e293b',
                            '900': '#0f172a',
                            '950': '#020617',
                        },
                        background: {
                            DEFAULT: '#0a0b10', // Deep Navy Blue - Almost black
                            light: '#f8fafc', // Light Gray
                            dark: '#0a0b10', // Deep Navy Blue
                        },
                        foreground: {
                            DEFAULT: '#f8fafc', // Light text
                            dark: '#f1f5f9', // Lighter text
                        },
                        accent: {
                            DEFAULT: '#38bdf8', // Light Navy Blue
                        },
                        success: {
                            DEFAULT: '#22c55e', // Green 500
                        },
                        error: {
                            DEFAULT: '#ef4444', // Red 500
                        },
                        // Glassmorphism colors
                        glass: {
                            DEFAULT: 'rgba(255, 255, 255, 0.1)', // White glass
                            border: 'rgba(255, 255, 255, 0.2)', // White border
                            bg: 'rgba(255, 255, 255, 0.05)', // Very light white bg
                        },
                        // Keep existing shadcn/ui colors for compatibility
                        card: {
                                DEFAULT: 'hsl(var(--card))',
                                foreground: 'hsl(var(--card-foreground))'
                        },
                        popover: {
                                DEFAULT: 'hsl(var(--popover))',
                                foreground: 'hsl(var(--popover-foreground))'
                        },
                        muted: {
                                DEFAULT: 'hsl(var(--muted))',
                                foreground: 'hsl(var(--muted-foreground))'
                        },
                        destructive: {
                                DEFAULT: 'hsl(var(--destructive))',
                                foreground: 'hsl(var(--destructive-foreground))'
                        },
                        border: 'hsl(var(--border))',
                        input: 'hsl(var(--input))',
                        ring: 'hsl(var(--ring))',
                        chart: {
                                '1': 'hsl(var(--chart-1))',
                                '2': 'hsl(var(--chart-2))',
                                '3': 'hsl(var(--chart-3))',
                                '4': 'hsl(var(--chart-4))',
                                '5': 'hsl(var(--chart-5))'
                        }
                },
                borderRadius: {
                        lg: 'var(--radius)',
                        md: 'calc(var(--radius) - 2px)',
                        sm: 'calc(var(--radius) - 4px)'
                },
                animation: {
                        'float': 'float 6s ease-in-out infinite',
                        'shimmer': 'shimmer 2s ease-in-out infinite',
                        'glow': 'glow 3s ease-in-out infinite',
                        'slide-up': 'slide-up 0.5s ease-out',
                        'slide-down': 'slide-down 0.5s ease-out',
                        'scale-in': 'scale-in 0.3s ease-out',
                        'fade-in': 'fade-in 0.5s ease-out',
                },
                keyframes: {
                        float: {
                                '0%, 100%': { transform: 'translateY(-15px)' },
                                '50%': { transform: 'translateY(0px)' },
                        },
                        shimmer: {
                                '0%': { backgroundPosition: '-200% 0' },
                                '100%': { backgroundPosition: '200% 0' },
                        },
                        glow: {
                                '0%, 100%': { opacity: '0.35' },
                                '50%': { opacity: '0.8' },
                        },
                        'slide-up': {
                                '0%': { transform: 'translateY(100%)', opacity: '0' },
                                '100%': { transform: 'translateY(0)', opacity: '1' },
                        },
                        'slide-down': {
                                '0%': { transform: 'translateY(-100%)', opacity: '0' },
                                '100%': { transform: 'translateY(0)', opacity: '1' },
                        },
                        'scale-in': {
                                '0%': { transform: 'scale(0.9)', opacity: '0' },
                                '100%': { transform: 'scale(1)', opacity: '1' },
                        },
                        'fade-in': {
                                '0%': { opacity: '0' },
                                '100%': { opacity: '1' },
                        },
                },
                backdropBlur: {
                        xs: '2px',
                        sm: '4px',
                        md: '8px',
                        lg: '16px',
                        xl: '24px',
                }
        }
  },
  plugins: [tailwindcssAnimate],
};
export default config;
