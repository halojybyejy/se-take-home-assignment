import React, { useState } from 'react';
// import logo from './logo.svg';
import './App.css';



interface Order {
  id: number;
  isVip: boolean;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETE';
  completedByBotId: number | null;
}

interface bot {
  id: number;
  status: 'IDLE' | 'BUSY';
  currentOrderId: number | null;
  currentOrderSecondsLeft: number | null;
}

function App() {
  const [orderId, setOrderId] = useState(0);
  const [botId, setBotId] = useState(0);
  const [bots, setBots] = useState<bot[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const handleNewNormalOrder = () => {
    // Get the new order id
    const newOrderId = orderId + 1;

    // Create the new order details
    const newOrderDetails: Order = { id: newOrderId, isVip: false, status: 'PENDING', completedByBotId: null };

    // For normal orders, insert the new order details at the end of the orders array
    const combinedOrder = [...orders, newOrderDetails];

    // Update the order id and the orders array
    setOrderId(newOrderId);
    setOrders(combinedOrder);
  };

  const handleNewVipOrder = () => {
    // Get the new order id
    const newOrderId = orderId + 1;

    // Create the new order details
    const newOrderDetails: Order = { id: newOrderId, isVip: true, status: 'PENDING', completedByBotId: null };

    // Create the combined order array
    let combinedOrder: Order[] = [];

    // Find the index of the first normal order
    const firstNormalIndex = orders.findIndex(order => !order.isVip);

    if (firstNormalIndex !== -1) {
      // For VIP orders, if there are normal orders, insert the new order details at the beginning of the orders array
      combinedOrder = [
        ...orders.slice(0, firstNormalIndex),
        newOrderDetails,
        ...orders.slice(firstNormalIndex)
      ];

    } else {
      // If there are no normal orders, insert the new order details at the end of the orders array
      combinedOrder = [...orders, newOrderDetails];
      
    }

    // Update the order id and the orders array
    setOrderId(newOrderId);
    setOrders(combinedOrder);

  };

  const handleNewBot = () => {
    // Get the new bot id
    const newBotId = botId + 1;

    // Create the new bot details
    const newBotDetails: bot = { id: newBotId, status: 'IDLE', currentOrderId: null, currentOrderSecondsLeft: null };

    // Create the combined bots array
    const combinedBots = [...bots, newBotDetails];

    // Update the bot id and the bots array
    setBotId(newBotId);
    setBots(combinedBots);
  };

  const handleDeleteBot = () => {
    // Order of priority:
    // 1. Check if bot exists
    // 2. Remove idle bots
    // 3. Remove the bot which has the longest time left completing the current order

    
    // 1. If there are no bots, do nothing
    if(bots.length === 0) {
        return;
    }

    // 2. Remove idle bots first
    const idleBots = bots.filter(bot => bot.status === 'IDLE');
    if (idleBots.length > 0) {
        // Remove the first idle bot from the bots array
        const combinedBots = bots.filter(bot => bot.id !== idleBots[0].id);

        // Update the bots array
        setBots(combinedBots);
        
        return;
    }
    
    // 3. Remove the bot which left the longest time ago
    const busyBots = bots.filter(bot => bot.status === 'BUSY');
    if (busyBots.length > 0) {
        // Compare the currentOrderSecondsLeft of busy bots and return the bot with the longest time left
        const botWithLongestTimeLeft = busyBots.reduce((prev, curr) => {
            if (!prev.currentOrderSecondsLeft || !curr.currentOrderSecondsLeft) {
                return prev; // skip if the currentOrderSecondsLeft is null
            }
            return prev.currentOrderSecondsLeft > curr.currentOrderSecondsLeft ? prev : curr;
        });

        const combinedBots = bots.filter(bot => bot.id !== botWithLongestTimeLeft.id);

        // Update the bots array
        setBots(combinedBots);
        return;
    }
    
  };

  return (
    <div className="app-container">
        <div className="header">McDonald's Order Management</div>
        <div className="content">
            <div className="control-panel">
                <div className="control-panel-item" onClick={handleNewNormalOrder}>+ New Normal Order</div>
                <div className="control-panel-item" onClick={handleNewVipOrder}>+ New VIP Order</div>
                <div className="control-panel-item" onClick={handleNewBot}>+ Bot</div>
                <div className="control-panel-item" onClick={handleDeleteBot}>- Bot</div>
            </div>
            <div className="container">
                <div className="item">
                    <div className="item-header">
                        Pending Orders
                    </div>
                    <div className="item-content">
                        {orders.map((order) => order.status === 'PENDING' && (
                            <div className="order-item" key={order.id}>
                                <div className="order-item-number"># Order ID: {order.id}</div>
                                <div className="order-item-is-vip">{order.isVip ? ' (VIP)' : ' (Normal)'}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="item">
                    <div className="item-header">
                        Bots
                    </div>
                    <div className="item-content">
                        {bots.map((bot) => (
                            <div className="bot-item" key={bot.id}>
                                <div className="bot-number">Bot #{bot.id} </div>
                                <div className="bot-status" style={{color: bot.currentOrderId ? 'green' : 'grey'}}>
                                    {bot.currentOrderId ? `Processing Order ID: #${bot.currentOrderId}` : 'Idle'}
                                    <span className="bot-status-time">
                                        {bot.currentOrderId ? `Time Left: ${bot.currentOrderSecondsLeft} seconds` : ''}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="item">
                    <div className="item-header">
                        Completed Orders
                    </div>
                    <div className="item-content">
                        {orders.map((order) => order.status === 'COMPLETE' && (
                            <div className="order-item" key={order.id}>
                                <div className="order-item-number"># Order ID: {order.id}</div>
                                <div className="order-item-is-vip">{order.isVip ? ' (VIP)' : ' (Normal)'}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

export default App;
