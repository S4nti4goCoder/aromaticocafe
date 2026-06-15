import { motion } from "framer-motion";
import type { CafeSettings } from "@/types";
import type { CafeTheme } from "../cafeTheme";

interface TopBarProps {
  settings: CafeSettings | undefined;
  theme: CafeTheme;
  onAction: () => void;
}

export const TOP_BAR_HEIGHT = 36;

export function TopBar({ settings, theme, onAction }: TopBarProps) {
  if (!settings?.top_bar_enabled || !settings.top_bar_message) return null;

  const isClickable =
    settings.top_bar_action_type !== "none" && !!settings.top_bar_action_target;

  const handleClick = () => {
    if (isClickable) onAction();
  };

  return (
    <motion.div
      initial={{ y: -TOP_BAR_HEIGHT, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4"
      style={{
        height: `${TOP_BAR_HEIGHT}px`,
        background: `linear-gradient(90deg, ${theme.gold}, ${theme.amber})`,
        color: theme.bg,
        cursor: isClickable ? "pointer" : "default",
      }}
      onClick={handleClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : -1}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
    >
      <p className="text-xs font-semibold tracking-wide text-center">
        {settings.top_bar_message}
        {isClickable && <span className="ml-1.5">→</span>}
      </p>
    </motion.div>
  );
}
