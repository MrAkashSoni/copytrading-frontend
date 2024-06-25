import axios from 'axios';
import { useState, useEffect } from 'react';

export default function Home() {
  const [tradeDetails, setTradeDetails] = useState(null);
  const [status, setStatus] = useState('Disconnected');
  const [socket, setSocket] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_BASE_URL);
    setSocket(ws);

    ws.onopen = () => setStatus('Connected');
    ws.onclose = () => setStatus('Disconnected');
    ws.onmessage = (message) => {
      const data = message.data;
      if (data.startsWith('{') && data.endsWith('}')) {
        // If the data is JSON, it's the trade details
        setTradeDetails(JSON.parse(data));
      } else {
        // Otherwise, it's a status message
        setLogs((prevLogs) => [...prevLogs, data]);
      }
    };

    return () => ws.close();
  }, []);

  const handleTrade = async () => {
    try {
      setLogs((prevLogs) => [...prevLogs, 'Trade initiated']);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/trade`);
      console.log('response --> ', response);
      setLogs((prevLogs) => [...prevLogs, 'Trade completed']);
    } catch (error) {
      setLogs((prevLogs) => [...prevLogs, 'Trade failed']);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Copytrading SaaS</h1>
      <button
        onClick={handleTrade}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Trade
      </button>
      <div className="mt-4">
        <p>Status: {status}</p>
        <div className="mt-2">
          <h2 className="text-xl">Logs:</h2>
          <ul className="list-disc list-inside">
            {logs.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>
        </div>
        {tradeDetails && (
          <div className="mt-4">
            <h2 className="text-xl">Trade Details:</h2>
            <pre>{JSON.stringify(tradeDetails, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
