import React, {useEffect} from 'react';
import './App.css';
import MainPage from "./pages/MainPage";
import {HashRouter, NavLink, Route, Router, Routes} from "react-router-dom";
import SettingsPage from "./pages/SettingsPage";

function App() {

  return (
      <HashRouter basename={'/'}>
            <Routes>
              {/*<Route index path={"/"} element={<MainPage />} />*/}
              {/*<Route path="/5907-pit-display/settings" element={<SettingsPage />} />*/}

                {/*<Route path='/5907-pit-display'> /!* put url base here and nest children routes *!/*/}
                    <Route path='/' element={ <MainPage /> } />
                    <Route path='/settings' element={ <SettingsPage /> } />
                {/*</Route>*/}
                <Route path="/*" element={<NavLink to="/" />}  /> {/* navigate to default route if no url matched */}
            </Routes>

      </HashRouter>
  );
}

export default App;
