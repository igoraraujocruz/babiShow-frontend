import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  colors: {
    'color-bg': '#F5EBE0',
    'color-icons': '#655E56',
    'color-input-bg': '#D5BDAF',
  },
  fonts: {
    heading: 'Anek Devanagari',
    body: 'Anek Devanagari',
  },
  styles: {
    global: {
      body: {
        bg: 'color-bg',
        color: 'color-icons',
      },
    },
  },
});
