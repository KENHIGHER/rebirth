import React from 'react';
import { useGameStore } from '../store/gameStore';
import PagedList from './PagedList';

const PropertyView: React.FC = () => {
  const { inventory, upgradeProperty, isDoomsday } = useGameStore();
  const property = inventory.properties[0] || null;
  const materials = inventory.items.materials?.quantity || 0;

  const upgrades = property
    ? [
        { key: 'structure' as const, label: '结构', value: property.structure, level: property.structureLevel, base: property.baseStructure, cost: property.structureLevel * 3 },
        { key: 'defense' as const, label: '防护', value: property.defense, level: property.defenseLevel, base: property.baseDefense, cost: property.defenseLevel * 3 },
        { key: 'space' as const, label: '空间', value: property.space, level: property.spaceLevel, base: property.baseSpace, cost: property.spaceLevel * 2 },
        { key: 'comfort' as const, label: '舒适', value: property.comfort, level: property.comfortLevel, base: property.baseComfort, cost: property.comfortLevel * 2 },
      ]
    : [];

  return (
    <div className="h-full min-h-0">
      <div className="flex h-full min-h-0 flex-col rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100">安全屋管理</h2>
          <div className="text-right text-xs text-zinc-500">
            <div>建材: {materials}</div>
            <div>{isDoomsday ? '末日中也可升级' : '和平期可提前改造'}</div>
          </div>
        </div>
        {!property ? (
          <p className="text-zinc-500 text-sm text-center py-4">暂无地产，请前往交易界面购置安全屋</p>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="mb-3 shrink-0 rounded border border-zinc-700 bg-zinc-800 p-4">
              <div className="font-bold text-zinc-200 mb-3">{property.name}</div>
              <div className="grid grid-cols-2 gap-2 text-sm text-zinc-300">
                <div className="bg-zinc-900 p-2 rounded flex justify-between">
                  <span className="text-zinc-500">结构</span>
                  <span>{property.structure}</span>
                </div>
                <div className="bg-zinc-900 p-2 rounded flex justify-between">
                  <span className="text-zinc-500">防护</span>
                  <span>{property.defense}</span>
                </div>
                <div className="bg-zinc-900 p-2 rounded flex justify-between">
                  <span className="text-zinc-500">空间</span>
                  <span>{property.space}</span>
                </div>
                <div className="bg-zinc-900 p-2 rounded flex justify-between">
                  <span className="text-zinc-500">舒适</span>
                  <span>{property.comfort}</span>
                </div>
              </div>
            </div>

            <PagedList
              items={upgrades}
              pageSize={2}
              getKey={(upgrade) => upgrade.key}
              renderItem={(upgrade) => (
                  <div key={upgrade.key} className="rounded bg-zinc-900 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="font-bold text-zinc-200">
                        {upgrade.label} Lv.{upgrade.level}
                      </div>
                      <div className="text-xs text-zinc-500">
                        下一级 +{upgrade.base}
                      </div>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-zinc-400">
                      <span>当前数值 {upgrade.value}</span>
                      <span>消耗建材 {upgrade.cost}</span>
                    </div>
                    <button
                      onClick={() => upgradeProperty(property.id, upgrade.key)}
                      disabled={materials < upgrade.cost}
                      className="mt-2 w-full rounded bg-zinc-700 py-2 text-xs font-bold text-zinc-100 transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      升级{upgrade.label}
                    </button>
                  </div>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyView;
