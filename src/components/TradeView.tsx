import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { FINANCE_ASSETS, ITEMS, Property, PROPERTIES } from '../types/game';
import PagedList from './PagedList';
import SceneBanner from './SceneBanner';

type TradeTab = 'items' | 'property' | 'finance';
type ItemDefinition = typeof ITEMS[keyof typeof ITEMS];

const TradeView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TradeTab>('items');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const {
    cash,
    advanceTime,
    buyItem,
    sellItem,
    buyProperty,
    sellProperty,
    buyFinance,
    sellFinance,
    archivedMessages,
    currentMessages,
    inventory,
    itemPrices,
    financeHoldings,
    financePrices,
    date,
  } = useGameStore();

  const shelter = inventory.properties[0] || null;
  const storageCapacity = 500 + (shelter?.space || 0) * 50;
  const currentStored = (inventory.items.food?.quantity || 0) + (inventory.items.water?.quantity || 0);

  const handleQuantityChange = (key: string, val: number) => {
    setQuantities(prev => ({ ...prev, [key]: Math.max(1, val) }));
  };

  const getEffectiveBuyQuantity = (item: ItemDefinition, qty: number) => {
    if (item.id !== 'food' && item.id !== 'water') return qty;
    return Math.min(qty, Math.max(0, storageCapacity - currentStored));
  };

  const handleBuyItem = (key: string, item: ItemDefinition) => {
    const qty = quantities[key] || 1;
    const effectiveQty = getEffectiveBuyQuantity(item, qty);
    const price = itemPrices[item.id] ?? item.defaultPrice;
    const totalCost = effectiveQty * price;
    if (effectiveQty <= 0) return;
    if (cash >= totalCost) {
      buyItem(item.id, item.name, effectiveQty, price);
      advanceTime(1);
    }
  };

  const handleSellItem = (key: string, item: ItemDefinition) => {
    const qty = quantities[key] || 1;
    const owned = inventory.items[key]?.quantity || 0;
    if (owned >= qty) {
      const price = itemPrices[item.id] ?? item.defaultPrice;
      sellItem(item.id, qty, price);
      advanceTime(1);
    }
  };

  const handleBuyProperty = (property: Property) => {
    if (cash >= property.price) {
      buyProperty(property, property.price);
      advanceTime(1);
    }
  };

  const handleSellProperty = (propertyId: string) => {
    sellProperty(propertyId);
    advanceTime(1);
  };

  const handleBuyFinance = (assetId: string) => {
    const qty = quantities[assetId] || 1;
    const price = financePrices[assetId] || 0;
    if (qty <= 0 || cash < qty * price) return;
    buyFinance(assetId, qty, price);
    advanceTime(1);
  };

  const handleSellFinance = (assetId: string) => {
    const qty = quantities[assetId] || 1;
    const price = financePrices[assetId] || 0;
    if ((financeHoldings[assetId]?.quantity || 0) < qty) return;
    sellFinance(assetId, qty, price);
    advanceTime(1);
  };

  const currentRumors = currentMessages.filter((m) => m.source === 'peace');
  const allArchived = archivedMessages;
  const rumorFilter = (type: TradeTab) => {
    if (type === 'finance') {
      return (m: typeof currentRumors[number]) => m.type === 'finance' || m.type === 'metal';
    }
    if (type === 'property') {
      return (m: typeof currentRumors[number]) => m.type === 'property';
    }
    return (m: typeof currentRumors[number]) => m.type === 'material' || m.type === 'location';
  };
  const visibleCurrentRumors = currentRumors.filter(rumorFilter(activeTab));
  const visibleArchivedRumors = allArchived.filter(rumorFilter(activeTab));

  const propertyItems = [
    ...PROPERTIES.map((property) => ({ type: 'buy' as const, property })),
    ...(inventory.properties[0] ? [{ type: 'sell' as const, property: inventory.properties[0] }] : []),
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-2 shrink-0">
        <SceneBanner
          image="market"
          title="地下市场"
          subtitle="价格会说谎，情报偶尔说真话。把末日前的每一小时花在刀刃上。"
          tone="amber"
        />
      </div>
      <div className="mb-2 flex shrink-0 gap-2 overflow-hidden pb-1">
        <button 
          onClick={() => setActiveTab('items')}
          className={`px-3 py-1 whitespace-nowrap rounded-full text-sm ${activeTab === 'items' ? 'bg-zinc-200 text-zinc-900' : 'bg-zinc-800 text-zinc-300'}`}
        >
          物资采购
        </button>
        <button 
          onClick={() => setActiveTab('property')}
          className={`px-3 py-1 whitespace-nowrap rounded-full text-sm ${activeTab === 'property' ? 'bg-zinc-200 text-zinc-900' : 'bg-zinc-800 text-zinc-300'}`}
        >
          地产交易
        </button>
        <button 
          onClick={() => setActiveTab('finance')}
          className={`px-3 py-1 whitespace-nowrap rounded-full text-sm ${activeTab === 'finance' ? 'bg-zinc-200 text-zinc-900' : 'bg-zinc-800 text-zinc-300'}`}
        >
          金融市场
        </button>
      </div>

      <div className="mb-2 flex shrink-0 justify-between items-center bg-zinc-900 p-2 rounded border border-zinc-800">
        <span className="text-zinc-400 text-sm">可用资金</span>
        <div className="text-right">
          <div className="text-yellow-500 font-mono font-bold">¥{cash.toLocaleString()}</div>
          <div className="text-[10px] text-zinc-500">食水储量 {currentStored}/{storageCapacity}</div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {(visibleCurrentRumors.length > 0 || visibleArchivedRumors.length > 0) && (
          <div className="mb-2 shrink-0 space-y-2">
            {visibleCurrentRumors.length > 0 && (
              <div className="bg-emerald-900/20 border border-emerald-800/40 p-2 rounded text-xs text-emerald-200">
                <div className="font-bold mb-1">本轮回小道消息（仅本世有效）：</div>
                <ul className="list-disc pl-4 space-y-1">
                  {visibleCurrentRumors.slice(0, 1).map(msg => (
                    <li key={msg.id} className="re-clamp-3">{msg.text}</li>
                  ))}
                </ul>
              </div>
            )}
            {visibleArchivedRumors.length > 0 && (
              <div className="bg-blue-900/30 border border-blue-800 p-2 rounded text-xs text-blue-300">
                <div className="font-bold mb-1">前世档案（仅本世可用）：</div>
                <ul className="list-disc pl-4 space-y-1">
                  {visibleArchivedRumors.slice(0, 1).map(msg => (
                    <li key={msg.id} className="re-clamp-3">{msg.text}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'items' && (
          <PagedList
            items={Object.entries(ITEMS)}
            pageSize={2}
            getKey={([key]) => key}
            renderItem={([key, item]) => (
              <div key={key} className="flex flex-col gap-2 bg-zinc-800/90 p-2.5 rounded border border-zinc-700/60 shadow-[0_12px_35px_rgba(0,0,0,0.2)]">
                {(() => {
                  const price = itemPrices[item.id] ?? item.defaultPrice;
                  const base = item.defaultPrice;
                  const diff = Math.round(((price - base) / base) * 100);
                  const qty = quantities[key] || 1;
                  const effectiveBuyQty = getEffectiveBuyQuantity(item, qty);
                  const storageBlocked = effectiveBuyQty <= 0 && (item.id === 'food' || item.id === 'water');
                  return (
                    <>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-zinc-200">
                            {item.name}
                            <span className="text-xs text-zinc-500 font-normal ml-2">持有: {inventory.items[key]?.quantity || 0}</span>
                          </div>
                          <div className="text-xs text-zinc-400 mt-1">{item.use}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-yellow-500 font-mono text-sm">¥{price}/份</div>
                          <div className={`text-xs ${diff > 0 ? 'text-red-400' : diff < 0 ? 'text-green-400' : 'text-zinc-500'}`}>较基准 {diff}%</div>
                          <div className="text-[10px] text-zinc-600">日期: {date}</div>
                          {storageBlocked && <div className="text-[10px] text-red-400">储量已满</div>}
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-3 mt-2 border-t border-zinc-700 pt-2">
                        <div className="flex items-center gap-1 bg-zinc-900 rounded p-1">
                          <button 
                            onClick={() => handleQuantityChange(key, (quantities[key] || 1) - 1)}
                            className="px-2 text-zinc-400 hover:text-zinc-200"
                          >-</button>
                          <input 
                            type="number" 
                            min="1" 
                            value={quantities[key] || 1}
                            onChange={(e) => handleQuantityChange(key, parseInt(e.target.value) || 1)}
                            className="w-12 bg-transparent text-center text-sm font-mono focus:outline-none"
                          />
                          <button 
                            onClick={() => handleQuantityChange(key, (quantities[key] || 1) + 1)}
                            className="px-2 text-zinc-400 hover:text-zinc-200"
                          >+</button>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleSellItem(key, item)}
                            disabled={(inventory.items[key]?.quantity || 0) < (quantities[key] || 1)}
                            className="bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded text-sm transition-colors text-red-400"
                          >
                            卖出 (1h)
                          </button>
                          <button 
                            onClick={() => handleBuyItem(key, item)}
                            disabled={effectiveBuyQty <= 0 || cash < effectiveBuyQty * price}
                            className="bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded text-sm transition-colors text-green-400"
                          >
                            买入{effectiveBuyQty < qty ? ` ${effectiveBuyQty}` : ''} (1h)
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          />
        )}

        {activeTab === 'property' && (
          <div className="flex h-full min-h-0 flex-col">
            {inventory.properties.length > 0 && (
              <div className="mb-3 shrink-0 rounded border border-amber-900/40 bg-amber-950/20 p-3 text-xs text-amber-200">
                当前只能持有一处地产。若要更换，请先卖出现有安全屋。
              </div>
            )}
            <PagedList
              items={propertyItems}
              pageSize={2}
              getKey={(entry) => `${entry.type}-${entry.property.id}`}
              renderItem={(entry) => entry.type === 'buy' ? (
              <div className="bg-zinc-800/90 p-2.5 rounded border border-zinc-700/60 shadow-[0_12px_35px_rgba(0,0,0,0.2)]">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold text-zinc-200">{entry.property.name}</div>
                  <span className="text-yellow-500 font-mono text-sm">¥{entry.property.price.toLocaleString()}</span>
                </div>
                <div className="text-xs text-zinc-400 grid grid-cols-2 gap-1 mb-3">
                  <div>结构: {entry.property.structure}</div>
                  <div>防护: {entry.property.defense}</div>
                  <div>空间: {entry.property.space}</div>
                  <div>舒适: {entry.property.comfort}</div>
                </div>
                <button 
                  onClick={() => handleBuyProperty(entry.property)}
                  disabled={cash < entry.property.price || inventory.properties.length > 0}
                  className="w-full bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed py-2 rounded text-sm transition-colors"
                >
                  购买地产 (1h)
                </button>
              </div>
              ) : (
              <button
                onClick={() => handleSellProperty(entry.property.id)}
                className="w-full rounded bg-red-950/70 py-2 text-sm font-bold text-red-200 hover:bg-red-900/70"
              >
                售出现有地产 {entry.property.name} (1h)
              </button>
              )}
            />
          </div>
        )}

        {activeTab === 'finance' && (
          <PagedList
            items={FINANCE_ASSETS}
            pageSize={2}
            getKey={(asset) => asset.id}
            renderItem={(asset) => {
              const price = financePrices[asset.id] ?? asset.defaultPrice;
              const owned = financeHoldings[asset.id]?.quantity || 0;
              const qty = quantities[asset.id] || 1;
              const diff = Math.round(((price - asset.defaultPrice) / asset.defaultPrice) * 100);
              return (
                <div key={asset.id} className="rounded bg-zinc-800/90 p-2.5 border border-zinc-700/60 shadow-[0_12px_35px_rgba(0,0,0,0.2)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-zinc-200">{asset.name}</div>
                      <div className="text-xs text-zinc-400">{asset.type === 'stock' ? '股票' : '贵金属'} | {asset.description}</div>
                      <div className="mt-1 text-xs text-zinc-500">持有: {owned}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-500 font-mono text-sm">¥{price}/份</div>
                      <div className={`text-xs ${diff > 0 ? 'text-red-400' : diff < 0 ? 'text-green-400' : 'text-zinc-500'}`}>较基准 {diff}%</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-3 border-t border-zinc-700 pt-2">
                    <div className="flex items-center gap-1 rounded bg-zinc-900 p-1">
                      <button onClick={() => handleQuantityChange(asset.id, qty - 1)} className="px-2 text-zinc-400 hover:text-zinc-200">-</button>
                      <input
                        type="number"
                        min="1"
                        value={qty}
                        onChange={(e) => handleQuantityChange(asset.id, parseInt(e.target.value) || 1)}
                        className="w-12 bg-transparent text-center text-sm font-mono focus:outline-none"
                      />
                      <button onClick={() => handleQuantityChange(asset.id, qty + 1)} className="px-2 text-zinc-400 hover:text-zinc-200">+</button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSellFinance(asset.id)}
                        disabled={owned < qty}
                        className="rounded bg-zinc-700 px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        卖出 (1h)
                      </button>
                      <button
                        onClick={() => handleBuyFinance(asset.id)}
                        disabled={cash < qty * price}
                        className="rounded bg-zinc-700 px-3 py-1.5 text-sm text-green-400 transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        买入 (1h)
                      </button>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TradeView;
