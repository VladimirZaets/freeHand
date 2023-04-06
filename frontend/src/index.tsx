import ReactDOM from 'react-dom/client';
import './index.css';
import { Provider } from 'react-redux'
import reportWebVitals from './reportWebVitals';
import BaseLayoutRouter from './routes/BaseLayoutRouter'
import store from './store'
import theme from './theme'
import { BrowserRouter,Routes,Route } from "react-router-dom";
import InitialDataLoader from './components/InitialDataLoader';
import LoadingBackdrop from './components/LoadingBackdrop';
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(  
  <CssVarsProvider theme={theme}>
    <BrowserRouter>      
      <Provider store={store}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <InitialDataLoader/>
          <LoadingBackdrop/>
          <Routes>
            <Route path="/" element={<div>Hello world</div>} />
            <Route path="/*" element={<BaseLayoutRouter />} />
          </Routes>
        </LocalizationProvider>
      </Provider>      
    </BrowserRouter>
  </CssVarsProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
