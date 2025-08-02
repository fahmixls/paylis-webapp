import { useState } from "react";
import { X } from "lucide-react";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="w-full bg-pink-400 text-white text-sm font-medium py-2 px-4 shadow-md z-50 flex items-center justify-between gap-2">
      <div aria-hidden className="mr-auto" />
      <span>
        🎉 You get lucky!{" "}
        <a
          href="/faucet"
          className="underline underline-offset-2 font-semibold hover:text-white/90 ml-1"
        >
          Claim faucet here
        </a>
      </span>
      <button
        onClick={() => setVisible(false)}
        className="ml-auto text-white hover:text-white/80 transition"
        aria-label="Close"
      >
        <X size={18} />
      </button>
    </div>
  );
}
