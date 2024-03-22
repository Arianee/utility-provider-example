import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const onBtnClick = () => {
    window.alert('Do something');
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Utility Provider Example
        </p>
        <button onClick={onBtnClick}>Click me</button>
      </header>
    </div>
  );
}

export default App;
