import React from 'react';
// import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div>
        <div className="header">McDonald's Order Management</div>
        <div className="content">
            <div className="control-panel">
                <div className="control-panel-item">+ New Normal Order</div>
                <div className="control-panel-item">+ New VIP Order</div>
                <div className="control-panel-item">+ Bot</div>
                <div className="control-panel-item">- Bot</div>
            </div>
            <div className="container">
                <div className="item">
                    <div className="item-header">
                        Pending Orders
                    </div>
                    <div className="item-content"></div>
                </div>
                <div className="item">
                    <div className="item-header">
                        Completed Orders
                    </div>
                </div>
                <div className="item">
                    <div className="item-header">
                        Bots
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

export default App;
