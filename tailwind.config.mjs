import typography from '@tailwindcss/typography'
import daisyui from 'daisyui'

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'text-rcs-cta',
    'text-rcs-sec',
    'text-rcs-bg',
    'bg-rcs-cta',
    'bg-rcs-sec', 
    'bg-rcs-bg',
    'border-rcs-cta',
    'border-rcs-sec',
    'border-rcs-bg',
    'group-hover:text-rcs-cta',
  ],
  plugins: [typography, daisyui],
  variants: {
    extend: {
      textColor: ['group-hover'],
    },
  },
  theme: {
    extend: {
      // Cores principais com variações de tonalidade
      colors: {
        'rcs-bg': {
          DEFAULT: '#ebebeb',
          '50': '#ffffff',
          '100': '#fafafa',
          '200': '#f5f5f5',
          '300': '#f0f0f0',
          '400': '#ebebeb',
          '500': '#e0e0e0',
          '600': '#d6d6d6',
          '700': '#c2c2c2',
          '800': '#adadad',
          '900': '#999999',
        },
        'rcs-sec': {
          DEFAULT: '#1e1e1e',
          '50': '#eaeaea',
          '100': '#d4d4d4',
          '200': '#a9a9a9',
          '300': '#7e7e7e',
          '400': '#535353',
          '500': '#292929',
          '600': '#1e1e1e',
          '700': '#191919',
          '800': '#121212',
          '900': '#0c0c0c',
        },
        'rcs-cta': {
          DEFAULT: '#d39521',
          '50': '#fef9ef',
          '100': '#fdf3de',
          '200': '#fbe7bd',
          '300': '#f8d48c',
          '400': '#f4be5b',
          '500': '#edad3a',
          '600': '#d39521',
          '700': '#b07418',
          '800': '#8c5a18',
          '900': '#734a19',
        },
        'base': {
          DEFAULT: '#1e1e1e',
          content: '#ebebeb',
          100: '#1e1e1e',
          200: '#292929',
          300: '#535353',
        },
      },
      
      // Classes barra com incrementos
      spacing: {
        'barra/2': '50%',
        'barra/3': '33.333333%',
        'barra/4': '25%',
        'barra/5': '20%',
        'barra/6': '16.666667%',
        'barra/8': '12.5%',
        'barra/10': '10%',
        'barra/12': '8.333333%',
        'barra/15': '6.666667%',
        'barra/20': '5%',
      },
      
      // Configuração de gradientes
      backgroundImage: {
        'gradient-rcs-primary': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'gradient-rcs-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-rcs-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-rcs-hero': 'linear-gradient(to bottom right, #1e293b, #0f172a)',
        'gradient-rcs-card': 'linear-gradient(to bottom, rgba(30,41,59,0.8), rgba(15,23,42,0.9))',
        'gradient-rcs-cta': 'linear-gradient(to right, #e11d48, #be123c)',
        'gradient-rcs-overlay': 'linear-gradient(to bottom, transparent, rgba(15,23,42,0.9))',
      },
      
      // Bordas com variação
      borderWidth: {
        'barra/1': '1px',
        'barra/2': '2px',
        'barra/3': '3px',
        'barra/4': '4px',
        'barra/5': '5px',
        'barra/8': '8px',
      },
      
      // Opacidades com frações
      opacity: {
        'barra/5': '0.05',
        'barra/10': '0.1',
        'barra/15': '0.15',
        'barra/20': '0.2',
        'barra/25': '0.25',
        'barra/30': '0.3',
        'barra/40': '0.4',
        'barra/60': '0.6',
        'barra/70': '0.7',
        'barra/80': '0.8',
        'barra/90': '0.9',
        'barra/95': '0.95',
      },
      
      // Configurações de sombras
      boxShadow: {
        'rcs-sm': '0 1px 2px 0 rgba(15,23,42,0.05)',
        'rcs-md': '0 4px 6px -1px rgba(15,23,42,0.1), 0 2px 4px -1px rgba(15,23,42,0.06)',
        'rcs-lg': '0 10px 15px -3px rgba(15,23,42,0.1), 0 4px 6px -2px rgba(15,23,42,0.05)',
        'rcs-xl': '0 20px 25px -5px rgba(15,23,42,0.1), 0 10px 10px -5px rgba(15,23,42,0.04)',
        'rcs-inner': 'inset 0 2px 4px 0 rgba(15,23,42,0.06)',
        'rcs-cta': '0 4px 10px -2px rgba(225,29,72,0.5)',
      },
      
      // Configurações de tamanho
      fontSize: {
        'barra/xs': '0.75rem',
        'barra/sm': '0.875rem',
        'barra/base': '1rem',
        'barra/lg': '1.125rem',
        'barra/xl': '1.25rem',
        'barra/2xl': '1.5rem',
        'barra/3xl': '1.875rem',
        'barra/4xl': '2.25rem',
        'barra/5xl': '3rem',
      },
    },
  },
  plugins: [
    typography,
    daisyui,
    // Adicionar plugin customizado para criar mais utilidades com barras
    function({ addUtilities }) {
      const newUtilities = {
        '.text-gradient-rcs-primary': {
          'background-image': 'linear-gradient(to right, #e11d48, #f43f5e)',
          'color': 'transparent',
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
        },
        '.text-gradient-rcs-dark': {
          'background-image': 'linear-gradient(to right, #1e293b, #334155)',
          'color': 'transparent',
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
        },
        '.bg-blur-rcs': {
          'backdrop-filter': 'blur(8px)',
        },
        '.bg-blur-rcs-sm': {
          'backdrop-filter': 'blur(4px)',
        },
        '.bg-blur-rcs-lg': {
          'backdrop-filter': 'blur(16px)',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}
