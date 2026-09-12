"use client";

import { toPng } from "html-to-image";
import { useEffect, useRef, useState } from "react";
import { CATEGORY_META, LOTTERY_CONFIG } from "@/lib/config";
import type { Gift, GiftCategory } from "@/lib/gifts";

interface LotteryProps {
  gifts: Record<GiftCategory, Gift[]>;
}

type Stage = "pick" | "rolling" | "reveal";

const CATEGORIES: GiftCategory[] = ["food", "other"];
const ROLL_MS = 2400; // 单次滚动动画时长
const TICK_MS = 90; // 每帧切换间隔
const CONFETTI_EMOJIS = ["🎉", "🎊", "💖", "✨", "🎈"];

interface WinItem {
  gift: Gift;
  category: GiftCategory;
}

export default function Lottery({ gifts }: LotteryProps) {
  const total = LOTTERY_CONFIG.totalChances;

  const [stage, setStage] = useState<Stage>("pick");
  const [chancesUsed, setChancesUsed] = useState(0);
  const [winners, setWinners] = useState<WinItem[]>([]);
  // 每类还剩几份可抽
  const [remaining, setRemaining] = useState<Record<GiftCategory, number>>(() => ({
    food: gifts.food.length,
    other: gifts.other.length,
  }));
  // 每类还没被抽走的礼物
  const [pool, setPool] = useState<Record<GiftCategory, Gift[]>>(() => ({
    food: [...gifts.food],
    other: [...gifts.other],
  }));
  const [rollingCategory, setRollingCategory] = useState<GiftCategory | null>(null);
  const [lastWin, setLastWin] = useState<WinItem | null>(null);
  const [face, setFace] = useState(""); // 滚动中卡片显示的图片
  const [burst, setBurst] = useState(0); // 每次揭晓彩带重新触发
  const [today, setToday] = useState("");
  const ticketRef = useRef<HTMLElement | null>(null);
  const [slipImage, setSlipImage] = useState<string | null>(null); // 兑奖单图片 dataURL
  const [generating, setGenerating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setToday(new Date().toLocaleDateString("zh-CN"));
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const randomFace = (category: GiftCategory): string => {
    const poolArr = gifts[category];
    return poolArr[Math.floor(Math.random() * poolArr.length)].src;
  };

  const pickCategory = (category: GiftCategory) => {
    if (stage !== "pick" || remaining[category] <= 0 || chancesUsed >= total) return;

    // 从该类剩余奖池里随机抽走一个
    const poolArr = [...pool[category]];
    const idx = Math.floor(Math.random() * poolArr.length);
    const [win] = poolArr.splice(idx, 1);
    setPool((p) => ({ ...p, [category]: poolArr }));

    setRollingCategory(category);
    setFace(randomFace(category));
    setStage("rolling");

    timerRef.current = setInterval(() => setFace(randomFace(category)), TICK_MS);
    timeoutRef.current = setTimeout(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      setFace(win.src);
      setLastWin({ gift: win, category });
      setWinners((w) => [...w, { gift: win, category }]);
      setRemaining((r) => ({ ...r, [category]: r[category] - 1 }));
      setChancesUsed((c) => c + 1);
      setBurst((b) => b + 1);
      setStage("reveal");
    }, ROLL_MS);
  };

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStage("pick");
    setChancesUsed(0);
    setWinners([]);
    setRemaining({ food: gifts.food.length, other: gifts.other.length });
    setPool({ food: [...gifts.food], other: [...gifts.other] });
    setRollingCategory(null);
    setLastWin(null);
    setFace("");
  };

  // 把兑奖单 DOM 渲染成 PNG 图片，方便保存 / 长按存相册
  const generateSlip = async () => {
    if (!ticketRef.current || generating) return;
    setGenerating(true);
    try {
      const dataUrl = await toPng(ticketRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });
      setSlipImage(dataUrl);
    } catch (error) {
      console.error("生成兑奖单图片失败", error);
      alert("生成失败，请重试～");
    } finally {
      setGenerating(false);
    }
  };

  const done = chancesUsed >= total || CATEGORIES.every((c) => remaining[c] <= 0);
  const nextChance = chancesUsed + 1;
  const confettiPieces = stage === "reveal" ? Array.from({ length: 18 }, (_, i) => i) : [];

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-4 py-10">
      {/* 揭晓彩带 */}
      {confettiPieces.map((i) => (
        <span
          key={`${burst}-${i}`}
          className="confetti-emoji no-print"
          style={{
            left: `${(i * 53) % 100}%`,
            fontSize: `${14 + (i % 3) * 6}px`,
            animationDelay: `${(i % 8) * 0.12}s`,
          }}
        >
          {CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length]}
        </span>
      ))}

      <h1 className="anim-title text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600">
        {LOTTERY_CONFIG.title}
      </h1>
      <p className="mt-2 text-center text-sm text-gray-500">{LOTTERY_CONFIG.subtitle}</p>

      {/* 抽奖进度圆点 */}
      <div className="mt-5 flex items-center gap-2">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-3.5 w-3.5 rounded-full transition ${
              i < chancesUsed ? "bg-pink-500 shadow-sm" : "bg-white/80 ring-1 ring-pink-300"
            }`}
          />
        ))}
        <span className="ml-2 text-xs font-medium text-gray-500">
          {done ? `${total} 次机会用完啦！` : `还剩 ${total - chancesUsed} 次机会`}
        </span>
      </div>

      {/* 选择类别 */}
      {!done && stage === "pick" && (
        <div className="mt-6 w-full">
          <p className="mb-3 text-center text-sm font-semibold text-gray-600">
            开始第 {nextChance} 次！想抽哪一类？
          </p>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((category) => {
              const left = remaining[category];
              const disabled = left <= 0;
              return (
                <button
                  key={category}
                  onClick={() => pickCategory(category)}
                  disabled={disabled}
                  className={`rounded-2xl bg-white/90 p-5 text-center shadow-lg ring-2 ring-white/60 transition active:scale-95 ${
                    disabled ? "cursor-not-allowed opacity-40 grayscale" : "hover:brightness-105"
                  }`}
                >
                  <span className="text-4xl">{CATEGORY_META[category].emoji}</span>
                  <span className="mt-2 block text-base font-bold text-gray-700">
                    {CATEGORY_META[category].label}
                  </span>
                  <span className="mt-1 block text-xs text-gray-400">
                    {disabled ? "已经抽完啦" : `还剩 ${left} 份`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 滚动中 */}
      {stage === "rolling" && rollingCategory && (
        <div className="mt-8 flex w-full flex-col items-center">
          <div className="anim-roll relative aspect-square w-56 overflow-hidden rounded-3xl shadow-xl ring-4 ring-white/70">
            <img src={face} alt="" className="h-full w-full object-cover" draggable={false} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-2 pt-6 text-center text-sm font-medium text-white">
              ?
            </div>
          </div>
          <p className="mt-5 animate-pulse text-base font-semibold text-pink-500">
            正在「{CATEGORY_META[rollingCategory].label}」里翻牌…
          </p>
        </div>
      )}

      {/* 揭晓 */}
      {stage === "reveal" && lastWin && (
        <div className="mt-8 flex w-full flex-col items-center">
          <div className="anim-pop relative aspect-square w-56 overflow-hidden rounded-3xl shadow-xl ring-4 ring-pink-300">
            <img
              src={lastWin.gift.src}
              alt={lastWin.gift.name}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
          <p className="mt-4 text-xl font-extrabold text-gray-800">{lastWin.gift.name}</p>
          <p className="mt-1 text-xs text-gray-500">
            来自「{CATEGORY_META[lastWin.category].emoji} {CATEGORY_META[lastWin.category].label}」的惊喜
          </p>
          {!done && (
            <button
              onClick={() => setStage("pick")}
              className="mt-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-10 py-3.5 text-base font-bold text-white shadow-lg shadow-pink-300/60 transition hover:brightness-105 active:scale-95"
            >
              {LOTTERY_CONFIG.continueButton.replace("{n}", String(nextChance))}
            </button>
          )}
        </div>
      )}

      {/* 兑奖单（图片导出区域） */}
      {winners.length > 0 && (
        <section
          ref={ticketRef}
          className={`mt-8 w-full rounded-3xl border-2 border-dashed bg-white p-6 shadow-xl ${
            done ? "border-pink-400 ring-4 ring-pink-100" : "border-pink-300"
          }`}
        >
          <h3 className="text-center text-2xl font-extrabold text-pink-600">
            {done ? LOTTERY_CONFIG.redeemTitle : "🎟️ 抽到的礼物"}
          </h3>
          <p className="mt-1 text-center text-sm text-gray-500">
            {today && <span>抽奖日期：{today}　　</span>}
            {LOTTERY_CONFIG.redeemHint}
          </p>
          <div className="mt-4 space-y-2">
            {winners.map((item, i) => (
              <div
                key={`${item.gift.name}-${i}`}
                className="flex items-center gap-3 rounded-xl bg-pink-50/60 px-3 py-2"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-500 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <img
                  src={item.gift.src}
                  alt={item.gift.name}
                  className="h-11 w-11 rounded-lg object-cover"
                  draggable={false}
                />
                <span className="flex-1 text-sm font-medium text-gray-700">{item.gift.name}</span>
                <span className="text-xs text-gray-400">{CATEGORY_META[item.category].emoji}</span>
                <span className="text-emerald-500">✓</span>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-dashed border-gray-200 pt-3 text-center text-sm font-medium text-gray-500">
            {LOTTERY_CONFIG.redeemFooter}
          </p>
        </section>
      )}

      {/* 抽完后的操作 */}
      {done && winners.length > 0 && (
        <div className="no-print mt-6 flex w-full flex-col items-center gap-3">
          <button
            onClick={generateSlip}
            disabled={generating}
            className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-10 py-3.5 text-base font-bold text-white shadow-lg shadow-pink-300/60 transition hover:brightness-105 active:scale-95 disabled:opacity-60"
          >
            {generating ? "正在生成图片…" : LOTTERY_CONFIG.saveButton}
          </button>
          <button
            onClick={reset}
            className="w-full rounded-full border-2 border-pink-300 bg-white px-10 py-3 text-base font-bold text-pink-500 transition hover:bg-pink-50 active:scale-95"
          >
            {LOTTERY_CONFIG.redrawButton}
          </button>
        </div>
      )}

      {/* 兑奖单图片预览弹窗 */}
      {slipImage && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/75 p-6"
          onClick={() => setSlipImage(null)}
        >
          <img
            src={slipImage}
            alt="兑奖单"
            className="max-h-[70vh] max-w-full rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="mt-4 text-sm text-white/90">长按图片可保存到相册 📱</p>
          <div className="mt-3 flex gap-3">
            <a
              href={slipImage}
              download="生日礼物兑奖单.png"
              className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition active:scale-95"
            >
              ⬇️ 下载图片
            </a>
            <button
              onClick={() => setSlipImage(null)}
              className="rounded-full bg-white/20 px-6 py-2.5 text-sm font-bold text-white transition active:scale-95"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
