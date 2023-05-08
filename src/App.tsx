import React from 'react';
import logo from './resources/logo.svg';
import './App.css';
import Header from "./Header";

function App() {
  return (
    <div className="App">
        <Header/>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
    </div>
  );
}

export default App;
