import React from 'react';
import { useGameStore } from '../store/gameStore';
import { ITEMS } from '../types/game';

const BackpackView: React.FC = () => {
  const { cash, inventory, financeHoldings, financePrices } = useGameStore();

  const itemsList = Object.values(inventory.items);
  const property = inventory.properties[0] || null;
  const storageCapacity = 500 + (property?.space || 0) * 50;
  const currentStored = (inventory.items.food?.quantity || 0) + (inventory.items.water?.quantity || 0);
  const holdingList = Object.values(financeHoldings);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
        <h2 className="text-lg font-bold text-zinc-100 mb-2">资金面板</h2>
        <p className="text-2xl text-yellow-500 font-mono">¥{cash.toLocaleString()}</p>
      </div>

      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
        <h2 className="text-lg font-bold text-zinc-100 mb-4">物资面板</h2>
        <div className="mb-3 rounded bg-zinc-800 p-3 text-xs text-zinc-400">
          食物+水储量: {currentStored}/{storageCapacity}
        </div>
        {itemsList.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-4">背包空空如也</p>
        ) : (
          <div className="space-y-3">
            {itemsList.map(item => {
              const baseItem = ITEMS[item.id as keyof typeof ITEMS];
              return (
                <div key={item.id} className="flex justify-between items-center bg-zinc-800 p-3 rounded">
                  <div>
                    <div className="font-bold text-zinc-200">{item.name}</div>
                    <div className="text-xs text-zinc-500">均价: ¥{item.buyPrice.toFixed(1)}</div>
                    {baseItem && <div className="text-xs text-zinc-400 mt-1">{baseItem.use}</div>}
                  </div>
                  <div className="text-xl font-mono text-zinc-300">
                    x{item.quantity}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
        <h2 className="text-lg font-bold text-zinc-100 mb-4">金融持仓</h2>
        {holdingList.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-4">暂无股票或贵金属持仓</p>
        ) : (
          <div className="space-y-3">
            {holdingList.map((holding) => {
              const currentPrice = financePrices[holding.id] || holding.buyPrice;
              const profit = Math.round(((currentPrice - holding.buyPrice) / holding.buyPrice) * 100);
              return (
                <div key={holding.id} className="bg-zinc-800 p-3 rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-zinc-200">{holding.name}</div>
                      <div className="text-xs text-zinc-500">{holding.type === 'stock' ? '股票' : '贵金属'} | 持有 {holding.quantity}</div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-zinc-300">买入 ¥{holding.buyPrice.toFixed(1)}</div>
                      <div className="text-yellow-500">现价 ¥{currentPrice}</div>
                      <div className={profit >= 0 ? 'text-green-400' : 'text-red-400'}>{profit >= 0 ? '+' : ''}{profit}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
        <h2 className="text-lg font-bold text-zinc-100 mb-4">已购地产</h2>
        {!property ? (
          <p className="text-zinc-500 text-sm text-center py-4">暂无地产</p>
        ) : (
          <div className="space-y-3">
            <div className="bg-zinc-800 p-3 rounded">
              <div className="font-bold text-zinc-200">{property.name}</div>
              <div className="text-xs text-zinc-400 grid grid-cols-2 gap-1 mt-2">
                <div>结构: {property.structure}</div>
                <div>防护: {property.defense}</div>
                <div>空间: {property.space}</div>
                <div>舒适: {property.comfort}</div>
                <div>结构等级: {property.structureLevel}</div>
                <div>防护等级: {property.defenseLevel}</div>
                <div>空间等级: {property.spaceLevel}</div>
                <div>舒适等级: {property.comfortLevel}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackpackView;
