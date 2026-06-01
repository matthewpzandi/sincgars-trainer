import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

const fctnPositions = ["OFF", "Z", "REM", "RXMT", "SQ OFF", "SQ ON", "LD", "TST", "STBY"];
const rfPositions = ["LO", "M", "HI", "PA"];
const modePositions = ["---", "FH", "SC"];
const cmscPositions = ["---", "CT", "PT"];
const chanPositions = ["---", "MAN", "1", "2", "3", "4", "5", "6", "CUE"];

const keypad = [
  { label: "CMSC", digit: "1" },
  { label: "RCU", digit: "2" },
  { label: "SYNC", digit: "3" },
  { label: "FREQ", digit: "" },
  { label: "DATA", digit: "4" },
  { label: "GPS", digit: "5" },
  { label: "SA", digit: "6" },
  { label: "ERF\nOFST", digit: "" },
  { label: "CHG", digit: "7" },
  { label: "CID", digit: "8" },
  { label: "LOUT", digit: "9" },
  { label: "TIME", digit: "" },
  { label: "MENU\nCLR", digit: "" },
  { label: "LOAD", digit: "0" },
  { label: "STO", digit: "" },
  { label: "BATT\nCALL", digit: "" },
];

function isDigit(value) {
  return typeof value === "string" && value.length === 1 && value >= "0" && value <= "9";
}

function nextFrom(list, current) {
  const idx = Math.max(0, list.indexOf(current));
  return list[(idx + 1) % list.length];
}

function Screw({ className = "" }) {
  return (
    <div className={`w-9 h-9 rounded-full bg-zinc-800 border-2 border-zinc-500 shadow-inner relative ${className}`}>
      <div className="absolute left-1/2 top-1/2 w-7 h-1 bg-zinc-400 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded" />
    </div>
  );
}

function CoaxConnector() {
  return (
    <div className="w-32 h-32 rounded-full bg-zinc-300 border-[14px] border-zinc-600 shadow-2xl flex items-center justify-center">
      <div className="w-17 h-17 rounded-full bg-zinc-100 border-[6px] border-zinc-500 flex items-center justify-center">
        <div className="w-5 h-5 rounded-full bg-zinc-700" />
      </div>
    </div>
  );
}

function RoundConnector({ label }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-32 h-32 rounded-full bg-zinc-500 border-[14px] border-zinc-700 shadow-2xl flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-sky-700 border-[6px] border-zinc-300 grid grid-cols-3 gap-1.5 p-3">
          {[0, 1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="rounded-full bg-amber-200 border border-zinc-800" />
          ))}
        </div>
      </div>
      <div className="text-2xl font-black leading-6 text-neutral-300 tracking-wide whitespace-pre-line">{label}</div>
    </div>
  );
}

function BoxedLabel({ active, children, style }) {
  return (
    <div
      className={`absolute border-2 border-neutral-300 px-1.5 py-0.5 text-[22px] font-black leading-6 tracking-tight select-none ${active ? "text-yellow-300 border-yellow-300 drop-shadow" : "text-neutral-200"}`}
      style={style}
    >
      {children}
    </div>
  );
}

function FunctionKnob({ value, onChange }) {
  const knob = { x: 150, y: 145, r: 59 };
  const targets = {
    RXMT: { x: 42, y: 36 },
    REM: { x: 98, y: 36 },
    Z: { x: 160, y: 38 },
    OFF: { x: 166, y: 74 },
    "SQ OFF": { x: 66, y: 102 },
    "SQ ON": { x: 70, y: 156 },
    LD: { x: 85, y: 222 },
    TST: { x: 145, y: 224 },
    STBY: { x: 218, y: 204 },
  };

  const target = targets[value] || targets.OFF;
  const angle = Math.atan2(target.y - knob.y, target.x - knob.x) * 180 / Math.PI;
  const labelBase = "absolute text-[22px] font-black leading-6 tracking-tight text-neutral-200 select-none";
  const active = (p) => (value === p ? " text-yellow-300 drop-shadow" : "");

  return (
    <div className="relative" style={{ width: 290, height: 290 }}>
      <div className={labelBase + active("RXMT")} style={{ left: 8, top: 22 }}>RXMT</div>
      <div className={labelBase + active("REM")} style={{ left: 78, top: 22 }}>REM</div>
      <BoxedLabel active={value === "Z"} style={{ left: 152, top: 16 }}>Z</BoxedLabel>
      <BoxedLabel active={value === "OFF"} style={{ left: 164, top: 54 }}>OFF</BoxedLabel>

      <div className={labelBase + active("SQ OFF")} style={{ left: 28, top: 84 }}>OFF</div>
      <div className="absolute text-[22px] font-black leading-6 tracking-tight text-neutral-200 select-none" style={{ left: 28, top: 116 }}>SQ</div>
      <div className={labelBase + active("SQ ON")} style={{ left: 32, top: 148 }}>ON</div>

      <div className={labelBase + active("LD")} style={{ left: 68, top: 214 }}>LD</div>
      <div className={labelBase + active("TST")} style={{ left: 126, top: 216 }}>TST</div>
      <BoxedLabel active={value === "STBY"} style={{ left: 198, top: 194 }}>STBY</BoxedLabel>
      <div className="absolute left-[40px] top-[246px] text-[21px] font-black text-neutral-200">FCTN</div>

      <button
        type="button"
        onClick={() => onChange(fctnPositions[(fctnPositions.indexOf(value) + 1) % fctnPositions.length])}
        className="absolute rounded-full bg-[#6c7468] border-4 border-[#2a3029] shadow-2xl active:scale-95 transition"
        style={{ left: knob.x - knob.r, top: knob.y - knob.r, width: knob.r * 2, height: knob.r * 2 }}
        title="Click to rotate FCTN knob"
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          <defs>
            <radialGradient id="knobShade" cx="30%" cy="25%" r="80%">
              <stop offset="0%" stopColor="#849080" />
              <stop offset="100%" stopColor="#424b40" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="46" fill="url(#knobShade)" />
          <g transform={`rotate(${angle} 50 50)`}>
            <polygon points="45,42 83,42 95,50 83,58 45,58" fill="#e8e0c7" stroke="#d7cfb5" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="5" fill="#31382f" />
          </g>
        </svg>
      </button>
    </div>
  );
}

export default function App() {
  const audioCtxRef = useRef(null);

  function getAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContextClass();
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    return audioCtxRef.current;
  }

  function playTone(freq = 900, duration = 60, volume = 0.04, type = "square") {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration / 1000 + 0.02);
  }

  function keyClick() {
    playTone(1100, 22, 0.025, "square");
  }

  function startupBeep() {
    playTone(850, 80, 0.045, "square");
    window.setTimeout(() => playTone(1250, 90, 0.045, "square"), 95);
  }

  function stoTone() {
    playTone(1000, 80, 0.045, "square");
    window.setTimeout(() => playTone(1400, 80, 0.045, "square"), 90);
  }

  function successTone() {
    playTone(700, 140, 0.04, "square");
  }

  const [fctn, setFctn] = useState("OFF");
  const [mode, setMode] = useState("---");
  const [chan, setChan] = useState("---");
  const [rf, setRf] = useState("LO");
  const [cmsc, setCmsc] = useState("---");
  const [freqs, setFreqs] = useState({ MAN: "00000", "1": "00000", "2": "00000", "3": "00000", "4": "00000", "5": "00000", "6": "00000", CUE: "00000" });
  const [screen, setScreen] = useState("HOME");
  const [entry, setEntry] = useState("");
  const [volume, setVolume] = useState(5);
  const [message, setMessage] = useState("Start by turning the FCTN knob to LD. The display will show WAIT for 3 seconds.");
  const [showHint, setShowHint] = useState(false);
  const [busy, setBusy] = useState(false);
  const [blink, setBlink] = useState(false);
  const successPlayedRef = useRef(false);

  const trainingComplete =
    fctn === "SQ ON" &&
    rf === "LO" &&
    mode === "SC" &&
    cmsc === "PT" &&
    chan === "2" &&
    freqs["2"] === "41300";

  useEffect(() => {
    if (trainingComplete && !successPlayedRef.current) {
      successPlayedRef.current = true;
      setShowHint(true);
      setMessage("SUCCESS");
      playTone(700, 110, 0.05, "square");
      window.setTimeout(() => playTone(1000, 110, 0.05, "square"), 125);
      window.setTimeout(() => playTone(1400, 180, 0.05, "square"), 250);
    }
    if (!trainingComplete) successPlayedRef.current = false;
  }, [trainingComplete]);

  const powered = fctn !== "OFF";
  const usableChannel = chan !== "---" ? chan : "1";
  const currentFreq = freqs[usableChannel] || "00000";

  const lcd = useMemo(() => {
    if (!powered) return { pwr: "", mode: "", chan: "", cmsc: "", lower: "" };
    if (busy) return { pwr: "WAIT", mode: "", chan: "", cmsc: "", lower: "WAIT" };
    if (fctn === "TST") return { pwr: "TST", mode: "", chan: "", cmsc: "", lower: "GOOD" };
    if (fctn === "STBY") return { pwr: "STBY", mode: "", chan: "", cmsc: "", lower: "" };
    if (screen === "VOL") return { pwr: "VOL", mode: "", chan: "", cmsc: "", lower: String(volume) };
    if (screen === "CHAN") return { pwr: "", mode, chan, cmsc, lower: "CHANNEL" };
    if (screen === "RF") return { pwr: rf, mode, chan, cmsc, lower: "POWER" };
    if (screen === "MODE") return { pwr: rf, mode, chan, cmsc, lower: "MODE" };
    if (screen === "COMSEC") return { pwr: rf, mode, chan, cmsc, lower: "COMSEC" };
    if (screen === "FREQ_ENTRY") return { pwr: rf, mode, chan, cmsc, lower: entry.padEnd(5, "-") };
    if (screen === "FREQ_VIEW") return { pwr: rf, mode, chan, cmsc, lower: currentFreq };
    if (blink) return { pwr: "STO", mode, chan, cmsc, lower: currentFreq };
    return { pwr: rf, mode, chan, cmsc, lower: currentFreq };
  }, [powered, busy, fctn, screen, volume, chan, rf, mode, cmsc, entry, currentFreq, blink]);

  function handleFctn(next) {
    keyClick();
    setShowHint(false);
    setFctn(next);
    setEntry("");
    setBlink(false);
    setScreen("HOME");
    if (next === "OFF") {
      setBusy(false);
      setMessage("RT off.");
      return;
    }
    if (next === "LD") {
      setBusy(true);
      setMessage("FCTN set to LD. WAIT displayed for 3 seconds.");
      window.setTimeout(() => {
        setBusy(false);
        startupBeep();
        setMessage("Load mode ready. Press MENU/CLR to step through Volume, Channel, Power, Mode, COMSEC.");
      }, 3000);
      return;
    }
    if (next === "Z") setMessage("Z position selected. Zeroize is visually represented only; no real COMSEC exists in this trainer.");
    else if (next === "SQ ON") setMessage("FCTN set to SQ ON. Normal operating position after loading.");
    else if (next === "SQ OFF") setMessage("FCTN set to SQ OFF. Squelch off position selected.");
    else if (next === "TST") {
      successTone();
      setMessage("Self-test simulated. Display should show GOOD.");
    }
    else setMessage(`FCTN set to ${next}.`);
  }

  function pressKey(label, digit) {
    keyClick();
    setShowHint(false);
    if (!powered) return setMessage("Radio is off. Turn the FCTN knob out of OFF first.");
    if (busy) return setMessage("WAIT is active. Hold until the radio is ready.");

    if (screen === "FREQ_ENTRY" && isDigit(digit)) {
      setEntry((prev) => (prev + digit).slice(0, 5));
      return setMessage("Enter all 5 frequency digits, then press STO.");
    }

    if (label === "MENU\nCLR") {
      if (screen === "FREQ_VIEW") {
        setScreen("FREQ_ENTRY");
        setEntry("");
        return setMessage("Frequency cleared to dashes. Enter 5 digits, for example 41300.");
      }
      if (screen === "FREQ_ENTRY") {
        setEntry((prev) => prev.slice(0, -1));
        return setMessage("CLR deleted the last digit.");
      }
      const order = ["VOL", "CHAN", "RF", "MODE", "COMSEC", "HOME"];
      const idx = order.indexOf(screen);
      const next = order[(idx + 1 + order.length) % order.length] || "VOL";
      setScreen(next);
      return setMessage("MENU cycles setup fields. Use CHG to change the displayed field.");
    }

    if (label === "CHG") {
      if (screen === "VOL") {
        setVolume((prev) => (prev >= 9 ? 1 : prev + 1));
        return setMessage("Volume changed. Set to 5 for the classroom checklist.");
      }
      if (screen === "CHAN") {
        const next = nextFrom(chanPositions, chan);
        setChan(next);
        return setMessage(`Channel changed to ${next}.`);
      }
      if (screen === "RF") {
        const next = nextFrom(rfPositions, rf);
        setRf(next);
        return setMessage(`Power changed to ${next}. Checklist may require PA.`);
      }
      if (screen === "MODE") {
        const next = nextFrom(modePositions, mode);
        setMode(next);
        return setMessage(`Mode changed to ${next}. Keep cycling until SC.`);
      }
      if (screen === "COMSEC") {
        const next = nextFrom(cmscPositions, cmsc);
        setCmsc(next);
        return setMessage(`COMSEC changed to ${next}. PT means plain text.`);
      }
      return setMessage("Press MENU/CLR until the field you want is displayed, then use CHG.");
    }

    if (label === "FREQ") {
      if (fctn !== "LD") return setMessage("Set FCTN to LD before loading a frequency.");
      if (mode !== "SC") return setMessage("Set MODE to SC first: MENU/CLR until MODE, then CHG until SC.");
      if (cmsc !== "PT") return setMessage("Set COMSEC to PT first: MENU/CLR until COMSEC, then CHG until PT.");
      if (chan === "---") return setMessage("Select a channel first: MENU/CLR until CHANNEL, then CHG to MAN/CUE/1-6.");
      setScreen("FREQ_VIEW");
      setEntry("");
      return setMessage(`FREQ selected for channel ${chan}. Press MENU/CLR to clear to dashes.`);
    }

    if (label === "STO") {
      if (screen === "FREQ_ENTRY" && entry.length === 5) {
        const stored = entry;
        setFreqs((prev) => ({ ...prev, [usableChannel]: stored }));
        setBlink(true);
        setScreen("HOME");
        setEntry("");
        setMessage(`Stored ${stored} in channel ${usableChannel}. Turn FCTN to SQ ON for normal operation.`);
        stoTone();
        window.setTimeout(() => setBlink(false), 900);
      } else setMessage("STO only stores after FREQ, MENU/CLR, and a complete 5-digit entry.");
      return;
    }

    if (label === "CMSC") return setScreen("COMSEC"), setMessage("COMSEC screen selected. Press CHG until PT for this training.");
    if (label === "RCU") return setScreen("MODE"), setMessage("MODE screen selected. Press CHG until SC for single channel.");
    if (label === "BATT\nCALL") return setMessage("Battery condition simulated: 87%.");
    if (isDigit(digit)) return setMessage("Digit keys enter numbers only after FREQ and MENU/CLR.");
    return setMessage(`${label.replace("\n", " ")} is present for panel familiarity but is not modeled for this SC drill.`);
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 flex flex-col items-center gap-4">
      <div className="w-full max-w-7xl">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">SINCGARS Radio Trainer</h1>
        <p className="text-sm text-neutral-300 mt-1">Visual-first RT-1523 style face panel for classroom SC setup practice.</p>
      </div>

      <div className="w-full overflow-x-auto pb-4 touch-pan-x">
        <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="min-w-[1200px] rounded-xl bg-[#3f4a39] border-[6px] border-[#171c15] shadow-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_70%_80%,rgba(0,0,0,0.28),transparent_45%)] pointer-events-none" />
          <div className="relative grid grid-cols-[285px_minmax(500px,1fr)_300px] gap-5 items-center min-h-[500px]">
          <div className="h-full rounded-l-xl bg-[#536049] border-2 border-[#30382d] p-4 flex flex-col justify-between relative">
            <div className="pt-6 pl-6"><CoaxConnector /></div>
            <div className="pb-2"><FunctionKnob value={fctn} onChange={handleFctn} /></div>
          </div>

          <div className="bg-[#596650] rounded-xl border-4 border-[#222920] p-6 shadow-inner relative">
            <div className="mx-auto max-w-[580px]">
              <div className="grid grid-cols-4 text-center text-3xl font-black text-neutral-100 tracking-wider mb-1 px-5">
                <div>PWR</div><div>MODE</div><div>CHAN</div><div>CMSC</div>
              </div>
              <div className="h-31 bg-[#aeb39b] border-[10px] border-[#2a3029] rounded-lg shadow-inner text-neutral-900 font-mono flex flex-col justify-center px-6 text-3xl tracking-[0.12em] mb-7">
                <div className="grid grid-cols-4 text-center font-black">
                  <div>{lcd.pwr}</div><div>{lcd.mode}</div><div>{lcd.chan}</div><div>{lcd.cmsc}</div>
                </div>
                <div className="text-center mt-2 tracking-[0.22em]">{lcd.lower}</div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {keypad.map((key, i) => (
                  <button key={`${key.label}-${i}`} type="button" onClick={() => pressKey(key.label, key.digit)} className="h-[62px] rounded-lg bg-zinc-800 border-2 border-zinc-950 shadow-[inset_0_2px_4px_rgba(255,255,255,.18),0_3px_0_rgba(0,0,0,.7)] active:translate-y-1 active:shadow-inner transition text-[15px] font-black text-yellow-300 whitespace-pre-line leading-4">
                    <span className="block">{key.label}</span>
                    {isDigit(key.digit) && <span className="block text-neutral-100 text-lg leading-5">{key.digit}</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="absolute bottom-[-2px] right-10 text-sm font-black text-neutral-300 tracking-wider">RXMT</div>
          </div>

            <div className="h-full rounded-r-xl bg-[#536049] border-2 border-[#30382d] p-5 relative flex flex-col justify-center gap-14">
              <RoundConnector label={<>AUD/<br />FILL</>} />
              <RoundConnector label={<>AUD/<br />DATA</>} />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="w-full max-w-7xl grid lg:grid-cols-[1fr_1fr] gap-4">
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 shadow">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="font-bold text-base">Need help?</div>
            <button
              type="button"
              onClick={() => setShowHint((prev) => !prev)}
              className="rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-2 text-sm font-bold hover:bg-neutral-700 active:translate-y-0.5 transition"
            >
              Hint
            </button>
          </div>
          {trainingComplete ? (
            <div className="text-2xl font-black text-green-400">SUCCESS</div>
          ) : showHint ? (
            <div className="text-lg text-yellow-200">{message}</div>
          ) : (
            <div className="text-sm text-neutral-500">Hint hidden. Click Hint if you get stuck.</div>
          )}
        </div>
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 shadow text-sm text-neutral-200">
          <div className="font-bold text-base mb-2">Success criteria</div>
          <div className="text-lg mb-3">Set radio to: <b>LO power</b>, <b>SC</b>, <b>PT</b>, <b>Channel 2</b>, frequency <b>41300</b>.</div>
          <ul className="list-disc pl-5 space-y-1">
            <li>FCTN starts at <b>LD</b> for loading.</li>
            <li>Use <b>MENU/CLR</b> to move between setup fields.</li>
            <li>Use <b>CHG</b> to change the displayed field.</li>
            <li>After storing the frequency, set FCTN to <b>SQ ON</b>.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
