import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RotateCcw, RotateCw, Upload, X, Crop } from "lucide-react";

export type UploadedImage = {
  id: string;
  file: File;
  url: string;
  rotation: number; // degrees
};

export default function PhotoUploader({ value, onChange }: { value: UploadedImage[]; onChange: (v: UploadedImage[]) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const next: UploadedImage[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      next.push({ id: `${file.name}-${crypto.randomUUID()}`.slice(0, 24), file, url, rotation: 0 });
    });
    if (next.length) onChange([...value, ...next]);
  };

  const rotate = (id: string, delta: number) => {
    onChange(value.map((img) => (img.id === id ? { ...img, rotation: (img.rotation + delta + 360) % 360 } : img)));
  };

  const removeImg = (id: string) => onChange(value.filter((i) => i.id !== id));

  const cropCenterSquare = async (img: UploadedImage) => {
    const imageEl = new Image();
    imageEl.crossOrigin = "anonymous";
    imageEl.src = img.url;
    await imageEl.decode().catch(() => {});

    const size = Math.min(imageEl.width, imageEl.height);
    const sx = (imageEl.width - size) / 2;
    const sy = (imageEl.height - size) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Apply rotation around center if needed
    if (img.rotation !== 0) {
      const tmp = document.createElement("canvas");
      const tctx = tmp.getContext("2d");
      if (!tctx) return;
      tmp.width = imageEl.width;
      tmp.height = imageEl.height;
      tctx.translate(tmp.width / 2, tmp.height / 2);
      tctx.rotate((img.rotation * Math.PI) / 180);
      tctx.drawImage(imageEl, -imageEl.width / 2, -imageEl.height / 2);
      // overwrite source vars
      imageEl.src = tmp.toDataURL("image/png");
      await imageEl.decode().catch(() => {});
    }

    ctx.drawImage(imageEl, sx, sy, size, size, 0, 0, size, size);
    const dataUrl = canvas.toDataURL("image/png");
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], img.file.name.replace(/\.[^.]+$/, "") + "-cropped.png", { type: "image/png" });
    const url = URL.createObjectURL(file);
    onChange(value.map((it) => (it.id === img.id ? { ...it, file, url, rotation: 0 } : it)));
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div
          className={cn(
            "relative flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center",
            dragOver ? "bg-accent/40" : "bg-background",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            onFiles(e.dataTransfer.files);
          }}
        >
          <Upload className="h-6 w-6 text-muted-foreground" aria-hidden />
          <div className="text-sm">Drag & drop images here, or</div>
          <div className="flex gap-2">
            <Button onClick={() => inputRef.current?.click()} size="sm">Choose files</Button>
            <Button onClick={() => inputRef.current?.click()} size="sm" variant="secondary">Use camera</Button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
        </div>

        {value.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {value.map((img) => (
              <div key={img.id} className="relative group">
                <img
                  src={img.url}
                  alt="Uploaded preview"
                  className="h-40 w-full rounded-md object-cover"
                  style={{ transform: `rotate(${img.rotation}deg)` }}
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-background/80 to-transparent">
                  <Button size="icon" variant="secondary" onClick={() => rotate(img.id, -90)} aria-label="Rotate left">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="secondary" onClick={() => cropCenterSquare(img)} aria-label="Crop to square">
                    <Crop className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="secondary" onClick={() => rotate(img.id, 90)} aria-label="Rotate right">
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => removeImg(img.id)} aria-label="Remove image">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
