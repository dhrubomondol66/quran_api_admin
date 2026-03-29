// components/QariLogo.jsx
import React from "react";

const QariLogo = ({ size = "auth" }) => {
  if (size === "sidebar") {
    return (
      <div className="flex items-end gap-[3px] h-5">
        {[10, 16, 20, 22, 20, 16, 10].map((h, i) => (
          <div
            key={i}
            style={{ height: h, background: "linear-gradient(to top, #c9a84c, #e8c97a)" }}
            className="w-[3px] rounded-sm"
          />
        ))}
      </div>
    );
  }

  const bars = [
    { h: 16, d: "0s" },
    { h: 26, d: "0.2s" },
    { h: 36, d: "0.4s" },
    { h: 40, d: "0.2s" },
    { h: 36, d: "0s" },
    { h: 26, d: "0.3s" },
    { h: 16, d: "0.1s" },
  ];

  return (
    <div className="text-center mb-7">
      <div className="flex items-end justify-center gap-[3px] h-10 mb-2">
        {bars.map((b, i) => (
          <div
            key={i}
            className="w-[5px] rounded-[3px]"
            style={{
              height: b.h,
              animationDelay: b.d,
              background: "linear-gradient(to top, #c9a84c, #e8c97a)",
              animation: `barPulse 1.4s ease-in-out ${b.d} infinite`,
            }}
          />
        ))}
      </div>
      <p className="text-[#c9a84c] text-[15px] tracking-[3px] font-semibold font-serif">
        QARI 24/7
      </p>
      <style>{`@keyframes barPulse{0%,100%{transform:scaleY(.5);opacity:.7}50%{transform:scaleY(1);opacity:1}}`}</style>
    </div>
  );
};

export default QariLogo;