"use client";

import { useState, useEffect } from "react";
import { MapPin, Menu, Mail, Download, Printer, MoreVertical, X, CheckCircle2, Loader2 } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

// --- Types & Initial Data ---
type TabType = "Trades" | "Listed" | "Pending";
type ModalAction = "BUY" | "SELL" | "XFER" | "CASH_PICKUP" | "CASH_DROP" | "WIRE_OUT" | null;
type Transaction = {
  id: string;
  date: string;
  receiptId: string;
  from: string;
  to: string;
  asset: number;
  status: "Delivered" | "Pending" | "Listed";
  isNote?: boolean;
};

const MOCK_CHART_DATA = [
  { val: 10 }, { val: 12 }, { val: 11 }, { val: 15 }, { val: 14 },
  { val: 30 }, { val: 28 }, { val: 45 }, { val: 25 }, { val: 18 },
  { val: 60 }, { val: 55 }, { val: 40 }, { val: 45 }, { val: 20 },
  { val: 22 }, { val: 18 }, { val: 15 }, { val: 12 }, { val: 10 },
];
const MOCK_SELLS_DATA = MOCK_CHART_DATA.map(d => ({ val: d.val * 0.3 + 5 }));
const MOCK_XFERS_DATA = MOCK_CHART_DATA.map(d => ({ val: d.val * 0.1 + 8 }));

const INITIAL_TRX: Transaction[] = [
  { id: "1", date: "Oct 29, 2024", receiptId: "81823", from: "Eric Miller", to: "usr-ed33c809-8eab", asset: 34444, status: "Delivered", isNote: true }
];

export default function UtradeDashboard() {
  // --- Global State ---
  const [alphaBal, setAlphaBal] = useState(1000000);
  const [betaBal, setBetaBal] = useState(0);
  const [tradingBal, setTradingBal] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // --- UI State ---
  const [activeTab, setActiveTab] = useState<TabType>("Trades");
  const [modalType, setModalType] = useState<ModalAction>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Modal Form State
  const [amount, setAmount] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Input, 2: Processing, 3: Success
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Mobile Detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const formatCurrency = (num: number) => `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatChit = (num: number) => `⌀${num.toLocaleString('en-US')}`;

  const closeModal = () => {
    setModalType(null);
    setAmount("");
    setRecipient("");
    setLocation("");
    setStep(1);
    setErrorMsg(null);
  };

  const handleSimulatePayment = () => {
    setIsMenuOpen(false);
    const amount = Math.floor(Math.random() * 50000) + 1000;
    const receipt = Math.floor(10000 + Math.random() * 90000).toString();
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const users = ["usr-781b-9a", "usr-33ca-8c", "usr-910f-2b", "usr-881e-1a", "usr-bb45-21"];
    const fromUser = users[Math.floor(Math.random() * users.length)];

    setTradingBal(p => p + amount);
    const newTrx: Transaction = { id: receipt, date, receiptId: receipt, from: fromUser, to: "Eric Miller", asset: amount, status: "Delivered" };
    setTransactions(prev => [newTrx, ...prev]);
  };

  const handleExecute = () => {
    setErrorMsg(null);
    const val = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(val) || val <= 0) {
      setErrorMsg("Please enter a valid amount greater than 0.");
      return;
    }

    if ((modalType === "CASH_PICKUP" || modalType === "CASH_DROP") && !location) {
      setErrorMsg("Please select a pre-authorized facility location.");
      return;
    }

    if ((modalType === "BUY" || modalType === "CASH_DROP" || modalType === "WIRE_OUT") && val > alphaBal + betaBal) {
      setErrorMsg("Insufficient USD in Funding Account.");
      return;
    }

    if ((modalType === "SELL" || modalType === "XFER") && val > tradingBal) {
      setErrorMsg("Insufficient CHIT in Trading Account.");
      return;
    }

    setStep(2); // Processing

    setTimeout(() => {
      const receipt = Math.floor(10000 + Math.random() * 90000).toString();
      const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      let newTrx: Transaction;

      if (modalType === "BUY") {
        if (alphaBal >= val) setAlphaBal(p => p - val);
        else {
          const remainder = val - alphaBal;
          setAlphaBal(0);
          setBetaBal(p => p - remainder);
        }
        setTradingBal(p => p + val);
        newTrx = { id: receipt, date, receiptId: receipt, from: "Funding Accounts", to: "Trading Vault", asset: val, status: "Delivered" };
      }
      else if (modalType === "SELL") {
        setTradingBal(p => p - val);
        setAlphaBal(p => p + val);
        newTrx = { id: receipt, date, receiptId: receipt, from: "Trading Vault", to: "Alpha Fund", asset: val, status: "Delivered" };
      }
      else if (modalType === "XFER") {
        setTradingBal(p => p - val);
        newTrx = { id: receipt, date, receiptId: receipt, from: "Eric Miller", to: recipient || "usr-unknown", asset: val, status: "Pending" };
      }
      else if (modalType === "CASH_PICKUP") {
        setTradingBal(p => p + val);
        newTrx = { id: receipt, date, receiptId: receipt, from: `Physical Vault (${location})`, to: "Trading Vault", asset: val, status: "Pending" };
      }
      else if (modalType === "CASH_DROP") {
        if (alphaBal >= val) setAlphaBal(p => p - val);
        else {
          const remainder = val - alphaBal;
          setAlphaBal(0);
          setBetaBal(p => p - remainder);
        }
        newTrx = { id: receipt, date, receiptId: receipt, from: "Funding Accounts", to: `Physical Vault (${location})`, asset: val, status: "Pending" };
      }
      else if (modalType === "WIRE_OUT") {
        if (alphaBal >= val) setAlphaBal(p => p - val);
        else {
          const remainder = val - alphaBal;
          setAlphaBal(0);
          setBetaBal(p => p - remainder);
        }
        newTrx = { id: receipt, date, receiptId: receipt, from: "Funding Accounts", to: "Bank (****6789)", asset: val, status: "Delivered" };
      }

      setTransactions(prev => [newTrx!, ...prev]);
      setStep(3); // Success
    }, 2000);
  };

  const filteredTrx = transactions.filter(t => {
    if (activeTab === "Trades") return t.status === "Delivered";
    if (activeTab === "Pending") return t.status === "Pending";
    if (activeTab === "Listed") return t.status === "Listed";
    return true;
  });

  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-[#161616] text-[#e5e7eb] p-10 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-widest mb-1">UTRADE</h1>
          <p className="text-[0.6rem] text-[#9ca3af] uppercase tracking-[0.3em] font-black">chit marketplace</p>
        </div>
        <div className="max-w-sm">
          <p className="text-xl font-medium text-white/90">
            Sorry, you need a desktop.
          </p>
          <div className="mt-6 h-[1px] w-12 bg-white/10 mx-auto"></div>
          <p className="text-[0.7rem] text-[#9ca3af] mt-6 leading-relaxed uppercase tracking-widest font-bold">
            Terminal Access Restricted to Desktop
          </p>
        </div>
      </div>
    );
  }

  // Helper for Modal Rendering to avoid duplication
  function renderModal() {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-end sm:items-center justify-center z-[100] backdrop-blur-md">
        <div className="bg-[#222222] border-t sm:border border-[#444444] w-full sm:w-[450px] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden relative pb-8 sm:pb-0">
          <button onClick={closeModal} className="absolute top-6 right-6 text-[#9ca3af] hover:text-white"><X className="w-6 h-6" /></button>

          {step === 1 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-1 text-white">
                {modalType === "BUY" ? "Fund Operation" :
                  modalType === "SELL" ? "Redeem Assets" :
                    modalType === "XFER" ? "Transfer CHITs" :
                      modalType === "CASH_PICKUP" ? "Schedule Cash Pick Up" :
                        modalType === "CASH_DROP" ? "Schedule Cash Drop-Off" :
                          "Wire Out USD"}
              </h2>
              <p className="text-xs text-[#9ca3af] mb-8 font-medium">Deep Auth & Geolocation Active.</p>

              <div className="space-y-6">
                <div>
                  <label className="text-[0.65rem] font-black text-[#9ca3af] uppercase tracking-tighter">Amount ({modalType === "SELL" || modalType === "XFER" ? "CHIT" : "USD"})</label>
                  <div className="mt-2 relative">
                    <span className="absolute left-4 top-3.5 text-white font-mono text-xl">{modalType === "SELL" || modalType === "XFER" ? "⌀" : "$"}</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#161616] border border-[#333333] text-white font-mono text-2xl rounded-2xl py-3.5 pl-10 pr-4 focus:outline-none focus:border-white transition-all shadow-inner"
                    />
                  </div>
                </div>

                {modalType === "XFER" && (
                  <div>
                    <label className="text-[0.65rem] font-black text-[#9ca3af] uppercase tracking-tighter">Recipient</label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="usr-abc123"
                      className="w-full mt-2 bg-[#161616] border border-[#333333] text-white rounded-2xl py-3.5 px-5 focus:outline-none focus:border-white font-mono text-sm"
                    />
                  </div>
                )}

                {(modalType === "CASH_PICKUP" || modalType === "CASH_DROP") && (
                  <div>
                    <label className="text-[0.65rem] font-black text-[#9ca3af] uppercase tracking-tighter">Location</label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full mt-2 bg-[#161616] border border-[#333333] text-white rounded-2xl py-4 px-5 focus:outline-none focus:border-white cursor-pointer appearance-none text-sm "
                    >
                      <option value="">Select Facility...</option>
                      <option value="store-1">Retail Store #001 (MIA)</option>
                      <option value="store-2">Distribution Hub (ORL)</option>
                      <option value="store-3">Processing Center (TPA)</option>
                    </select>
                  </div>
                )}

                <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                  <div className="flex justify-between text-xs mb-3">
                    <span className="text-[#9ca3af] font-bold">Est. Result</span>
                    <span className="text-[#4ade80] font-mono font-black">
                      {modalType === "BUY" ? formatChit(tradingBal + (parseFloat(amount) || 0)) :
                        modalType === "SELL" ? formatCurrency(alphaBal + betaBal + (parseFloat(amount) || 0)) :
                          modalType === "XFER" ? formatChit(tradingBal - (parseFloat(amount) || 0)) :
                            modalType === "CASH_PICKUP" ? formatChit(tradingBal + (parseFloat(amount) || 0)) :
                              modalType === "CASH_DROP" || modalType === "WIRE_OUT" ? formatCurrency(alphaBal + betaBal - (parseFloat(amount) || 0)) :
                                ""}
                    </span>
                  </div>
                  <button
                    onClick={handleExecute}
                    disabled={!amount || isNaN(parseFloat(amount))}
                    className="w-full bg-white text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[0.98] active:scale-95 transition-all disabled:opacity-20 shadow-xl"
                  >
                    Execute {modalType}
                  </button>
                </div>

                {errorMsg && (
                  <div className="text-red-400 text-[0.65rem] font-black bg-red-950/40 p-3 rounded-xl border border-red-900/50 uppercase text-center">
                    {errorMsg}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-20 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-16 h-16 text-white animate-spin mb-6 opacity-80" />
              <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Securing</h3>
              <p className="text-[#9ca3af] text-xs font-bold animate-pulse uppercase tracking-widest">Running Origin Verification...</p>
            </div>
          )}

          {step === 3 && (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-[#4ade80]" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Confirmed</h3>
              <p className="text-[#9ca3af] text-xs font-medium mb-10">Ledger synchronized successfully.</p>
              <button onClick={closeModal} className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#161616] overflow-hidden text-[#e5e7eb]">

      {/* 1. SIDEBAR */}
      <aside className="w-[340px] flex-shrink-0 bg-[#222222] border-r border-[#333333] flex flex-col h-full overflow-y-auto">
        <div className="p-8">
          <div className="mb-10">
            <h1 className="text-3xl font-semibold text-white tracking-wide">UTRADE</h1>
            <p className="text-[#9ca3af] text-sm mt-1">chit marketplace</p>
          </div>

          <div className="mb-8">
            <h3 className="text-[#9ca3af] text-xs font-semibold mb-4 ml-1">Market Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[#9ca3af]">Assurance Balance</span><span className="font-medium">$10,999,217,368.64</span></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">Listed for sale</span><span className="font-medium">⌀125,101</span></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">Circulation</span><span className="font-medium">⌀9,985,243,683</span></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <button onClick={() => setModalType("BUY")} className="bg-white text-black py-4 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">BUY</button>
            <button onClick={() => setModalType("SELL")} className="bg-white text-black py-4 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">SELL</button>
            <button onClick={() => setModalType("XFER")} className="bg-white text-black py-4 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">XFER</button>
          </div>

          <div className="mb-8">
            <h3 className="text-[#9ca3af] text-xs font-semibold mb-3 ml-1">Pricing</h3>
            <div className="border border-[#333333] rounded-xl p-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[#9ca3af]">New Issue</span><span>$1.00</span></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">Market Price</span><span>$1.00</span></div>
              <div className="flex justify-between"><span className="text-[#9ca3af]">Redemption Price</span><span>$1.00</span></div>
            </div>
          </div>

          <div className="mb-10 pl-1">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[#e5e7eb] font-semibold text-[0.95rem]">Funding Account</h3>
              <span className="text-[#9ca3af] text-xs font-bold">USD</span>
            </div>
            <div className="space-y-1 mb-2">
              <div className="flex items-center justify-between">
                <div className="text-2xl text-[#9ca3af]">{formatCurrency(alphaBal)}</div>
                <div className="text-xs text-[#9ca3af]">Alpha</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xl text-[#9ca3af]">{formatCurrency(betaBal)}</div>
                <div className="text-xs text-[#9ca3af]">Beta</div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-xl font-bold text-white">{formatCurrency(alphaBal + betaBal)}</div>
              <div className="text-[0.65rem] font-bold text-white">Sub Accounts</div>
            </div>
          </div>

          <div className="pl-1">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[#e5e7eb] font-semibold text-[0.95rem]">Trading Account</h3>
              <span className="text-[#9ca3af] text-xs font-bold">CHIT</span>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-white tracking-tight">{formatChit(tradingBal)}</div>
              <div className="text-right">
                <div className="text-xs text-[#9ca3af]">Desktop Vault</div>
                <div className="text-[0.65rem] text-white font-semibold">Micro Commodity</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN TRADING DASHBOARD */}
      <main className="flex-1 flex flex-col h-full p-10 overflow-y-auto relative">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Trade</h2>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-[#dcfce7] text-[#166534] px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
              <MapPin className="w-4 h-4" /> Full Access
            </button>
            <button className="bg-[#e5e7eb] text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-300 transition-colors">
              Eric Miller
            </button>
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="bg-white text-black p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#222222] border border-[#333333] rounded-xl shadow-2xl py-2 z-40">
                  <button
                    onClick={() => { setModalType("CASH_PICKUP"); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm text-white font-semibold hover:bg-[#333333] transition-colors"
                  >
                    Schedule Cash Pick Up (CIT)
                  </button>
                  <button
                    onClick={() => { setModalType("CASH_DROP"); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm text-[#f87171] font-semibold hover:bg-[#333333] transition-colors"
                  >
                    Schedule Cash Drop-Off (CIT)
                  </button>
                  <button
                    onClick={() => { setModalType("WIRE_OUT"); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm text-white font-semibold hover:bg-[#333333] transition-colors"
                  >
                    Wire Money Out (Fiat)
                  </button>
                  <div className="border-t border-[#333333] my-1"></div>
                  <button
                    onClick={handleSimulatePayment}
                    className="w-full text-left px-4 py-3 text-sm text-[#4ade80] font-semibold hover:bg-[#333333] transition-colors"
                  >
                    Simulate Incoming Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="border border-[#333333] rounded-2xl p-6 bg-[#161616]">
            <div className="text-xs text-[#9ca3af] mb-4">Buy Orders</div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold tracking-tight">⌀25,032,809,951</div>
              <span className="bg-[#bbf7d0] text-[#166534] text-[0.65rem] font-bold px-2 py-0.5 rounded">126</span>
            </div>
          </div>
          <div className="border border-[#333333] rounded-2xl p-6 bg-[#161616]">
            <div className="text-xs text-[#9ca3af] mb-4">Sell Orders</div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold tracking-tight">⌀10,030,678,193</div>
              <span className="bg-[#bbf7d0] text-[#166534] text-[0.65rem] font-bold px-2 py-0.5 rounded">208</span>
            </div>
          </div>
          <div className="border border-[#333333] rounded-2xl p-6 bg-[#161616]">
            <div className="text-xs text-[#9ca3af] mb-4">Redemptions</div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold tracking-tight">⌀14,032,076,695</div>
              <span className="bg-[#bbf7d0] text-[#166534] text-[0.65rem] font-bold px-2 py-0.5 rounded">144</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <ChartCard title="Buys" data={MOCK_CHART_DATA} />
          <ChartCard title="Sells" data={MOCK_SELLS_DATA} />
          <ChartCard title="Xfers" data={MOCK_XFERS_DATA} />
        </div>

        {/* Dynamic Table Navigation */}
        <div className="flex gap-2 mb-4">
          {(["Trades", "Listed", "Pending"] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 rounded-t-xl font-bold text-sm transition-colors border ${activeTab === tab
                ? "bg-white text-black border-white"
                : "border-[#333333] text-[#9ca3af] hover:text-white hover:border-[#444444]"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dynamic Transaction Table */}
        <div className="flex-1 bg-[#222222] border border-[#333333] rounded-b-2xl rounded-tr-2xl p-2 min-h-[300px]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[#9ca3af] border-b border-[#333333]">
                <th className="font-normal py-4 px-6">Date</th>
                <th className="font-normal py-4 px-6">Receipt ID</th>
                <th className="font-normal py-4 px-6">From</th>
                <th className="font-normal py-4 px-6">To</th>
                <th className="font-normal py-4 px-6">Asset</th>
                <th className="font-normal py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">
                  <div className="flex justify-end gap-4 text-[#9ca3af]">
                    <Mail className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
                    <Download className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
                    <Printer className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTrx.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-[#9ca3af] italic">
                    No {activeTab.toLowerCase()} records found.
                  </td>
                </tr>
              )}
              {filteredTrx.map(t => (
                <tr key={t.id} className="hover:bg-[#2a2a2a] transition-colors group">
                  <td className="py-4 px-6">{t.date}</td>
                  <td className="py-4 px-6">{t.receiptId}</td>
                  <td className="py-4 px-6">{t.from}</td>
                  <td className="py-4 px-6">{t.to}</td>
                  <td className="py-4 px-6 font-mono text-white">⌀{t.asset.toLocaleString()}</td>
                  <td className="py-4 px-6">
                    <span className={`text-[0.65rem] font-bold px-2.5 py-1 rounded mr-2 ${t.status === 'Pending' ? 'bg-amber-200 text-amber-800' : 'bg-[#bbf7d0] text-[#166534]'}`}>
                      {t.status}
                    </span>
                    {t.isNote && <span className="bg-[#bbf7d0] text-[#166534] text-[0.65rem] font-bold px-2.5 py-1 rounded">Note</span>}
                  </td>
                  <td className="py-4 px-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4 ml-auto text-[#9ca3af] cursor-pointer hover:text-white" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL (REUSED) */}
        {modalType && renderModal()}
      </main>
    </div>
  );
}

function ChartCard({ title, data }: { title: string, data: any[] }) {
  return (
    <div className="bg-[#333333] rounded-2xl p-5 flex flex-col justify-between h-[160px] hover:shadow-lg transition-shadow">
      <div>
        <h4 className="font-bold text-white text-sm">{title}</h4>
        <div className="text-[#9ca3af] text-[0.65rem] mt-0.5">Sep 30 - Oct 30</div>
      </div>
      <div className="h-[60px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey="val" stroke="#f3f4f6" strokeWidth={1.5} dot={{ r: 1.5, fill: "#f3f4f6" }} activeDot={{ r: 4 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }}
              itemStyle={{ color: "#fff", fontSize: "12px", fontFamily: "monospace" }}
              labelStyle={{ display: "none" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
