'use client';

import { useEffect } from 'react';

interface HowToClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToClaimModal({ isOpen, onClose }: HowToClaimModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-amber-500/30 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-amber-500 transition-colors z-10">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8 md:p-10">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-amber-500 mb-2">如何申請繼承？</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full" />
          </div>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
              <span className="text-2xl">📜</span> 什麼是未辦繼承土地？
            </h3>
            <div className="bg-zinc-800/50 border border-amber-500/20 rounded-lg p-5 space-y-3">
              <p className="text-zinc-300 leading-relaxed">
                <strong className="text-amber-400">未辦繼承土地</strong>是指土地所有權人過世後，繼承人在法定期限內（6個月）未向地政事務所辦理繼承登記的土地。
              </p>
              <p className="text-zinc-300 leading-relaxed">
                根據《土地法》第73條之1規定，逾期未辦理者，經地政機關查明後，該土地將被列冊管理。
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
              <span className="text-2xl">👥</span> 繼承順位說明
            </h3>
            <div className="grid gap-3">
              {[
                { order: '配偶', desc: '當然繼承人，與任何順位繼承人共同繼承' },
                { order: '第一順位', desc: '直系血親卑親屬（子女、孫子女等）' },
                { order: '第二順位', desc: '父母' },
                { order: '第三順位', desc: '兄弟姊妹' },
                { order: '第四順位', desc: '祖父母' },
              ].map((item, index) => (
                <div key={index} className="bg-zinc-800/50 border border-amber-500/20 rounded-lg p-4 hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-900 font-bold rounded-full text-sm">{item.order}</span>
                    <span className="text-zinc-300">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span> 申請流程
            </h3>
            <div className="space-y-4">
              {[
                { step: '1', title: '確認繼承身份', desc: '取得被繼承人除戶謄本、繼承系統表' },
                { step: '2', title: '準備必要文件', desc: '戶籍謄本、遺產稅證明、印鑑證明等' },
                { step: '3', title: '地政事務所辦理', desc: '攜帶文件至土地所在地地政事務所辦理登記' },
              ].map((step, index) => (
                <div key={index} className="bg-zinc-800/50 border border-amber-500/20 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-zinc-900 font-bold text-xl shadow-lg">
                      {step.step}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-amber-400 mb-1">{step.title}</h4>
                      <p className="text-zinc-300">{step.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-8 bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h4 className="text-amber-400 font-bold mb-2">重要提醒</h4>
                <ul className="space-y-2 text-zinc-300 text-sm">
                  <li>• 繼承登記期限為被繼承人死亡之日起 <strong className="text-amber-400">6個月內</strong></li>
                  <li>• 逾期辦理可能面臨罰鍰</li>
                  <li>• 建議委託專業地政士協助辦理</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
