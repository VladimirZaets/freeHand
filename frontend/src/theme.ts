import { experimental_extendTheme as extendTheme} from '@mui/material/styles';

declare module '@mui/material/styles' {    
    interface PaletteOptions {
        borders: string,
        commonWhiteAlpha15: string
        commonWhiteAlpha25: string
    }    
}


const theme = extendTheme({
  cssVarPrefix: 'fh',
  colorSchemes: {
    light: {
      palette: {
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