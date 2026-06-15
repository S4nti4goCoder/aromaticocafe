import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useUploadImage } from "@/hooks/useUploadImage";

// Drop target that uploads a gallery image to Supabase Storage.
export function GalleryUploader({ onUpload }: { onUpload: (url: string) => void }) {
  const { upload, isUploading } = useUploadImage();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await upload(file, "cafe/gallery");
    if (result) {
      onUpload(result.url);
      toast.success("Imagen subida correctamente");
    }
    e.target.value = "";
  };

  return (
    <label className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
        disabled={isUploading}
      />
      {isUploading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        <Plus className="h-5 w-5 text-muted-foreground" />
      )}
      <span className="text-sm text-muted-foreground">
        {isUploading ? "Subiendo..." : "Subir imagen"}
      </span>
    </label>
  );
}
