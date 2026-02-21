"use client";

import { useState } from "react";
import { MapPin, Menu, Mail, Download, Printer, MoreVertical } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

// --- Mock Data --- 
const MOCK_CHART_DATA = [
  { val: 10 }, { val: 12 }, { val: 11 }, { val: 15 }, { val: 14 },
  { val: 30 }, { val: 28 }, { val: 45 }, { val: 25 }, { val: 18 },
  { val: 60 }, { val: 55 }, { val: 40 }, { val: 45 }, { val: 20 },
  { val: 22 }, { val: 18 }, { val: 15 }, { val: 12 }, { val: 10 },
];

const MOCK_SELLS_DATA = MOCK_CHART_DATA.map(d => ({ val: d.val * 0.3 + 5 }));
const MOCK_XFERS_DATA = MOCK_CHART_DATA.map(d => ({ val: d.val * 0.1 + 8 }));

const INITIAL_TRADING_BALANCE = 847866;

export default function AZCashDashboard() {
  const [tradingBal, setTradingBal] = useState(INITIAL_TRADING_BALANCE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"BUY" | "SELL" | "XFER" | null>(null);

  const formatChit = (num: number) => `⌀${num.toLocaleString('en-US')}`;

  const openAction = (action: "BUY" | "SELL" | "XFER") => {
    setModalType(action);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen w-full bg-[#161616] overflow-hidden text-[#e5e7eb]">

      {/* 1. SIDEBAR (Left Panel) */}
      <aside className="w-[340px] flex-shrink-0 bg-[#222222] border-r border-[#333333] flex flex-col h-full overflow-y-auto">
        <div className="p-8">
          {/* Logo */}
          <div className="mb-10">
            <h1 className="text-3xl font-semibold text-white tracking-wide">AZ.Cash</h1>
            <p className="text-[#9ca3af] text-sm mt-1">chit marketplace</p>
          </div>

          {/* Market Summary */}
          <div className="mb-8">
            <h3 className="text-[#9ca3af] text-xs font-semibold mb-4 ml-1">Market Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#9ca3af]">Assurance Balance</span>
                <span className="font-medium">$10,999,217,368.64</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9ca3af]">Listed for sale</span>
                <span className="font-medium">⌀125,101</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9ca3af]">Circulation</span>
                <span className="font-medium">⌀9,985,243,683</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <button onClick={() => openAction("BUY")} className="bg-white text-black py-4 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">BUY</button>
            <button onClick={() => openAction("SELL")} className="bg-white text-black py-4 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">SELL</button>
            <button onClick={() => openAction("XFER")} className="bg-white text-black py-4 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">XFER</button>
          </div>

          {/* Pricing Card */}
          <div className="mb-8">
            <h3 className="text-[#9ca3af] text-xs font-semibold mb-3 ml-1">Pricing</h3>
            <div className="border border-[#333333] rounded-xl p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#9ca3af]">New Issue</span>
                <span>$1.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9ca3af]">Market Price</span>
                <span>$1.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9ca3af]">Redemption Price</span>
                <span>$1.00</span>
              </div>
            </div>
          </div>

          {/* Funding Account */}
          <div className="mb-10 pl-1">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[#e5e7eb] font-semibold text-[0.95rem]">Funding Account</h3>
              <span className="text-[#9ca3af] text-xs font-bold">USD</span>
            </div>
            <div className="space-y-1 mb-2">
              <div className="flex items-center justify-between">
                <div className="text-2xl text-[#9ca3af]">$5,999,168,212.50</div>
                <div className="text-xs text-[#9ca3af]">Alpha</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xl text-[#9ca3af]">$8,224,574.00</div>
                <div className="text-xs text-[#9ca3af]">Beta</div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-xl font-bold text-white">$6,007,392,786.50</div>
              <div className="text-[0.65rem] font-bold text-white">Sub Accounts</div>
            </div>
          </div>

          {/* Trading Account */}
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

      {/* 2. MAIN TRADING DASHBOARD (Right Panel) */}
      <main className="flex-1 flex flex-col h-full bg-[#161616] p-10 overflow-y-auto">

        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Trade</h2>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-[#dcfce7] text-[#166534] px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
              <MapPin className="w-4 h-4" /> Full Access
            </button>
            <button className="bg-[#e5e7eb] text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-300 transition-colors">
              Eric Miller
            </button>
            <button className="bg-white text-black p-2 rounded-lg hover:bg-gray-200 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Top Stat Cards Row */}
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

        {/* Recharts Row */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <ChartCard title="Buys" data={MOCK_CHART_DATA} />
          <ChartCard title="Sells" data={MOCK_SELLS_DATA} />
          <ChartCard title="Xfers" data={MOCK_XFERS_DATA} />
        </div>

        {/* Tables Section */}
        <div className="flex gap-2 mb-4">
          <button className="bg-white text-black px-8 py-2.5 rounded-t-xl font-bold text-sm">Trades</button>
          <button className="border border-[#333333] text-[#9ca3af] px-8 py-2.5 rounded-t-xl font-medium text-sm hover:text-white hover:border-[#444444] transition-colors">Listed</button>
          <button className="border border-[#333333] text-[#9ca3af] px-8 py-2.5 rounded-t-xl font-medium text-sm hover:text-white hover:border-[#444444] transition-colors">Pending</button>
        </div>

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
                    <Mail className="w-4 h-4 cursor-pointer hover:text-white" />
                    <Download className="w-4 h-4 cursor-pointer hover:text-white" />
                    <Printer className="w-4 h-4 cursor-pointer hover:text-white" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-[#2a2a2a] transition-colors group">
                <td className="py-4 px-6">Oct 29,<br /><span className="text-[#9ca3af] text-xs">2024</span></td>
                <td className="py-4 px-6">81823</td>
                <td className="py-4 px-6">Eric Miller</td>
                <td className="py-4 px-6">usr-<br /><span className="text-[#9ca3af] text-xs">ed33c809-8eab</span></td>
                <td className="py-4 px-6">⌀(34,444)</td>
                <td className="py-4 px-6">
                  <span className="bg-[#bbf7d0] text-[#166534] text-[0.65rem] font-bold px-2.5 py-1 rounded mr-2">Delivered</span>
                  <span className="bg-[#bbf7d0] text-[#166534] text-[0.65rem] font-bold px-2.5 py-1 rounded">Note</span>
                </td>
                <td className="py-4 px-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4 ml-auto text-[#9ca3af] cursor-pointer" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </main>

      {/* Basic Mock Action Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#222222] border border-[#333333] w-[400px] p-8 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-white">Execute {modalType}</h2>
            <p className="text-sm text-[#9ca3af] mb-8">This action is protected by Deep Authentication. Geolocation verified.</p>

            <button
              onClick={() => {
                if (modalType === "XFER" || modalType === "SELL") setTradingBal(p => p - 1000);
                if (modalType === "BUY") setTradingBal(p => p + 1000);
                setIsModalOpen(false);
              }}
              className="w-full bg-white text-black py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
            >
              Confirm Mock Execution
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full text-[#9ca3af] mt-4 text-xs font-bold hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function ChartCard({ title, data }: { title: string, data: any[] }) {
  return (
    <div className="bg-[#333333] rounded-2xl p-5 flex flex-col justify-between h-[160px]">
      <div>
        <h4 className="font-bold text-white text-sm">{title}</h4>
        <div className="text-[#9ca3af] text-[0.65rem] mt-0.5">Sep 30 - Oct 30</div>
      </div>
      <div className="h-[60px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey="val" stroke="#f3f4f6" strokeWidth={1.5} dot={{ r: 1.5, fill: "#f3f4f6" }} activeDot={{ r: 4 }} />
            <Tooltip content={<div className="hidden" />} cursor={{ stroke: '#555555', strokeWidth: 1 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
