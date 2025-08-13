import React, { useState, useEffect, useCallback } from 'react';
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


    const handleNewOrder = (isVip: boolean) => {
        // Get the new order id
        const newOrderId = orderId + 1;

        // Create the new order details
        const newOrderDetails: Order = { id: newOrderId, isVip: isVip, status: 'PENDING', completedByBotId: null };

        // Create the combined order array
        let combinedOrder: Order[] = [];

        if(isVip) {
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
        } else {
            // For normal orders, insert the new order details at the end of the orders array
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

            // Find the order that the bot is processing
            const processingOrderId = botWithLongestTimeLeft.currentOrderId;

            // If the order is not found, do nothing
            if (!processingOrderId) {
                return;
            }

            // Update the order status to PENDING
            const updatedOrders: Order[] = orders.map(order => 
                order.id === processingOrderId 
                    ? { ...order, status: 'PENDING', completedByBotId: null }
                    : order
            );

            // Update the orders array
            setOrders(updatedOrders);

            // Remove the bot from the bots array
            const combinedBots = bots.filter(bot => bot.id !== botWithLongestTimeLeft.id);

            // Update the bots array
            setBots(combinedBots);
            return;
        }
        
    };

    const handleAssignOrderToBot = useCallback(() => {
        // 1. Check if there are idle bots
        const idleBots = bots.filter(bot => bot.status === 'IDLE');

        if (idleBots.length > 0) {
            // Find the first pending order
            const firstPendingOrder = orders.find(order => order.status === 'PENDING');
            if (!firstPendingOrder) {
                return;
            }

            // Find the first idle bot to process the order
            const firstIdleBotId = idleBots[0].id;

            // Get the id of the first pending order
            const firstPendingOrderId = firstPendingOrder.id;

            // Assign the order to the first idle bot
            const updatedBots: bot[] = bots.map(bot => 
                bot.id === firstIdleBotId
                    ? { ...bot, status: 'BUSY', currentOrderId: firstPendingOrderId, currentOrderSecondsLeft: 10 }
                    : bot
            );
            
            // Update the order status to PROCESSING
            const updatedOrders: Order[] = orders.map(order => 
                order.id === firstPendingOrderId 
                    ? { ...order, status: 'PROCESSING', completedByBotId: firstIdleBotId }
                    : order
            );
            
            // Update both arrays
            setBots(updatedBots);
            setOrders(updatedOrders);
            return;
        }
    
    }, [bots, orders]);

    // Real-time countdown timer
    useEffect(() => {
        const interval = setInterval(() => {
            setBots(prevBots => {
                const updatedBots = prevBots.map(bot => {
                    if (bot.status === 'BUSY' && bot.currentOrderSecondsLeft !== null && bot.currentOrderSecondsLeft > 0) {
                        return { ...bot, currentOrderSecondsLeft: bot.currentOrderSecondsLeft - 1 };
                    }
                    return bot;
                });

                // Check if any bot has reached 0 seconds and complete their orders
                const completedBots = updatedBots.filter(bot => bot.status === 'BUSY' && bot.currentOrderSecondsLeft === 0);
                
                if (completedBots.length > 0) {
                    // Complete orders for bots that reached 0 seconds
                    setOrders(prevOrders => {
                        return prevOrders.map(order => {
                            const completingBot = completedBots.find(bot => bot.currentOrderId === order.id);
                            if (completingBot && order.status === 'PROCESSING') {
                                return { ...order, status: 'COMPLETE' };
                            }
                            return order;
                        });
                    });

                    // Set completed bots back to idle
                    return updatedBots.map(bot => {
                        if (completedBots.some(completedBot => completedBot.id === bot.id)) {
                            return { ...bot, status: 'IDLE', currentOrderId: null, currentOrderSecondsLeft: null };
                        }
                        return bot;
                    });
                }

                return updatedBots;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        handleAssignOrderToBot();
    }, [handleAssignOrderToBot]);

  return (
    <div className="app-container">
        <div className="header">McDonald's Order Management</div>
        <div className="content">
            <div className="control-panel">
                <div className="control-panel-item" onClick={() => handleNewOrder(false)}>+ New Normal Order</div>
                <div className="control-panel-item" onClick={() => handleNewOrder(true)}>+ New VIP Order</div>
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
                                    <span className="bot-status-time">{bot.currentOrderId ? ` (${bot.currentOrderSecondsLeft}` : ''}</span>{bot.currentOrderId ? ` seconds left)` : ''}
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
                                <div className="order-item-is-vip">{order.completedByBotId ? `Completed by Bot #${order.completedByBotId}` : ''} {order.isVip ? ' (VIP)' : ' (Normal)'}</div>
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
