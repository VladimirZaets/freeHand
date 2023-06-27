import ReactDOM from 'react-dom/client';
import './index.css';
import {Provider} from 'react-redux'
import reportWebVitals from './reportWebVitals';
import Base from './routes/Layout'
import store from './store'
import theme from './theme'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import LoadingBackdrop from './components/LoadingBackdrop';
import {Experimental_CssVarsProvider as CssVarsProvider} from '@mui/material/styles';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns'
import RequestHandler from "./layout/RequestHandler";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <CssVarsProvider theme={theme}>
    <BrowserRouter>
      <Provider store={store}>
        <RequestHandler>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <LoadingBackdrop/>
            <Routes>
              <Route path="*" element={<div>
                <Base/>
                <a
                  href={`${process.env.REACT_APP_API_SERVICE}/auth/github/login?site=${process.env.REACT_APP_SITE}&from=${process.env.REACT_APP_FRONTEND_SERVICE}/account/create`}
                  onClick={() => window.close()}>github</a>
                <br></br>
              </div>}/>
              <Route path="*" element={<Base/>}/>
            </Routes>
          </LocalizationProvider>
        </RequestHandler>
      </Provider>
    </BrowserRouter>
  </CssVarsProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
