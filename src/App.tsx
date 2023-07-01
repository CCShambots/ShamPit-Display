import React from 'react';
import './App.css';
import MainPage from "./pages/MainPage";
import {HashRouter, NavLink, Route, Routes} from "react-router-dom";
import SettingsPage from "./pages/SettingsPage";

function App() {


  return (
      <HashRouter basename={`/`}>
            <Routes>
                    <Route path='' element={ <MainPage /> } />
                    <Route path='settings' element={ <SettingsPage /> } />

                <Route path="/*" element={<NavLink to="/" />}  /> {/* navigate to default route if no url matched */}
            </Routes>

      </HashRouter>
  );
}

export default App;
