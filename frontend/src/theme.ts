import { experimental_extendTheme as extendTheme} from '@mui/material/styles';

declare module '@mui/material/styles' {    
    interface PaletteOptions {
        borders: string,
        commonWhiteAlpha15: string
        commonWhiteAlpha25: string
        gray: PaletteOptions['primary']
    }    
}


const theme = extendTheme({
  cssVarPrefix: 'fh',
  // palette: {
  //   neutral: {
  //     main: '#64748B',
  //     contrastText: '#fff',
  //   },
  // },
  colorSchemes: {
    light: {
      palette: {
        gray: {
          main: '#64748B',
          light: '#f4f4f4'
        },
        borders: "#dcdcdc",
        commonWhiteAlpha15: "rgba(255,255,255, 0.15)",
        commonWhiteAlpha25: "rgba(255,255,255, 0.25)"
      },
    }
  },
  typography: {
    h2: {
      fontSize: '32px'
    },
    h3: {
      fontSize: '24px'
    }
  }
});

export default theme