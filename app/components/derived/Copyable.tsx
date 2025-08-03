import { Check, Clipboard } from "lucide-react";
import { useState } from "react";
import { cn, maskApiKey, shortenAddress } from "~/lib/utils";

type CopyableTextProps = {
  text: string;
  className?: string;
  copyButtonClassName?: string;
  isSecret: boolean;
};

export function CopyableText({
  text,
  className,
  copyButtonClassName,
  isSecret,
}: CopyableTextProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const word = isSecret ? maskApiKey(text) : text;

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span className="font-mono text-sm truncate max-w-xs">
        {shortenAddress(word, 8, 16)}
      </span>
      <button
        onClick={handleCopy}
        className={cn(
          "gap-3 px-2 py-1 w-16 text-center bg-gray-100 hover:bg-gray-200 rounded border text-gray-700 transition-all",
          copyButtonClassName
        )}
      >
        {copied ? <Check className="w-4 h-4 text-green-600" /> : "Copy"}
      </button>
    </div>
  );
}
