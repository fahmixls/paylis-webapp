import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group text-base font-sans rounded-md shadow-md border px-4 py-3"
      style={
        {
          "--normal-bg": "#f1f1f1",
          "--normal-text": "#23282d",
          "--normal-border": "#ccd0d4",

          "--success-bg": "#dff0d8",
          "--error-bg": "#f2dede",
          "--info-bg": "#d9edf7",
          "--warning-bg": "#fcf8e3",

          "--success-text": "#3c763d",
          "--error-text": "#a94442",
          "--info-text": "#31708f",
          "--warning-text": "#8a6d3b",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
