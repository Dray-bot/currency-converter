import { useState, useEffect } from "react";
import axios from "axios";
import { Sun, Moon, ArrowLeftRight, Copy } from "lucide-react";
import { motion } from "framer-motion";

const API_KEY = "47c2f3c216f800c612088d92";
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/`;

function App() {
  const [currencies, setCurrencies] = useState([]);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [amount, setAmount] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}USD`)
      .then(res => setCurrencies(Object.keys(res.data.conversion_rates)))
      .catch(err => console.error("Error fetching currencies:", err));
  }, []);

  useEffect(() => {
    if (from && to) convert();
    const interval = setInterval(() => convert(), 300000);
    return () => clearInterval(interval);
  }, [from, to, amount]);

  const convert = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}${from}`);
      const rate = res.data.conversion_rates[to];
      const converted = (amount * rate).toFixed(2);
      setResult(converted);

      setHistory(prev => {
        if (prev.length > 0) {
          const lastEntry = prev[0];
          if (lastEntry.from === from && lastEntry.to === to && lastEntry.amount === amount) {
            return prev;
          }
        }
        return [{ from, to, amount, converted, id: Date.now() }, ...prev].slice(0, 5);
      });
    } catch (error) {
      console.error("Conversion error:", error);
    }
    setLoading(false);
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const copy = () => {
    navigator.clipboard.writeText(`${amount} ${from} = ${result} ${to}`);
  };

  const getFlag = code => `https://flagcdn.com/w40/${code.slice(0, 2).toLowerCase()}.png`;

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} min-h-screen flex flex-col items-center justify-center p-6`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl relative"
      >
        <button onClick={() => setDarkMode(!darkMode)} className="absolute top-4 right-4">
          {darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>

        <h1 className="text-2xl font-bold mb-4 text-center">Currency Converter</h1>

        <div className="flex flex-col gap-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="p-3 border rounded-lg dark:bg-gray-700 dark:text-white"
          />

          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <img src={getFlag(from)} alt="" className="absolute left-3 top-3 w-6 h-6 rounded-full" />
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="p-3 pl-12 border rounded-lg w-full dark:bg-gray-700 dark:text-white"
              >
                {currencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>

            <button onClick={swap} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              <ArrowLeftRight size={20} />
            </button>

            <div className="flex-1 relative">
              <img src={getFlag(to)} alt="" className="absolute left-3 top-3 w-6 h-6 rounded-full" />
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="p-3 pl-12 border rounded-lg w-full dark:bg-gray-700 dark:text-white"
              >
                {currencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-blue-500">Converting...</p>
          ) : (
            result !== null && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 text-lg font-semibold text-center flex items-center justify-center gap-2"
              >
                {amount} {from} = {result} {to}
                <button onClick={copy} className="ml-2 p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
                  <Copy size={16} />
                </button>
              </motion.div>
            )
          )}

          {history.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Recent Conversions</h2>
              <ul className="text-sm bg-gray-200 dark:bg-gray-700 p-3 rounded-lg">
                {history.map((entry) => (
                  <li key={entry.id} className="mb-1">
                    {entry.amount} {entry.from} ➝ {entry.converted} {entry.to}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default App;