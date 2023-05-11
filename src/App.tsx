import React, {useEffect} from 'react';
import './App.css';
import MainPage from "./pages/MainPage";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import SettingsPage from "./pages/SettingsPage";

function App() {

  return (
      <BrowserRouter>
        <Routes>
          <Route path="/5907-pit-display" element={<MainPage />} />
          <Route path="/5907-pit-display/settings" element={<SettingsPage />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
