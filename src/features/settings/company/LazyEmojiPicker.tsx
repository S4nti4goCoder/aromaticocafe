import EmojiPicker, { Theme } from "emoji-picker-react";

// Thin wrapper so the heavy `emoji-picker-react` library lives in its own chunk,
// loaded on demand (only when the user switches the logo to emoji mode) instead
// of shipping with the Settings page bundle.
interface LazyEmojiPickerProps {
  isDark: boolean;
  onPick: (emoji: string) => void;
}

export default function LazyEmojiPicker({ isDark, onPick }: LazyEmojiPickerProps) {
  return (
    <EmojiPicker
      onEmojiClick={(emojiData) => onPick(emojiData.emoji)}
      theme={isDark ? Theme.DARK : Theme.LIGHT}
      searchPlaceholder="Buscar emoji..."
      width="100%"
      height={380}
      lazyLoadEmojis
      previewConfig={{ showPreview: false }}
      skinTonesDisabled
    />
  );
}
