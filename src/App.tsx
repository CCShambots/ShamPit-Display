import React from 'react';
import './App.css';
import MainPage from "./pages/MainPage";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
