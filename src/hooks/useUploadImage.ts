import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface UploadResult {
  url: string;
  path: string;
}

export function useUploadImage() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (
    file: File,
    folder: string = "general",
  ): Promise<UploadResult | null> => {
    setIsUploading(true);
    setError(null);

    const ext = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, file, { upsert: false });

    if (uploadError) {
      setError("Error al subir la imagen. Intenta de nuevo.");
      setIsUploading(false);
      return null;
    }

    const { data } = supabase.storage.from("images").getPublicUrl(fileName);

    setIsUploading(false);
    return { url: data.publicUrl, path: fileName };
  };

  const remove = async (path: string): Promise<boolean> => {
    const { error } = await supabase.storage.from("images").remove([path]);
    return !error;
  };

  return { upload, remove, isUploading, error };
}
