import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Image, Plus, Trash2, Loader2, Lock, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
  category: string | null;
  position: number;
}

interface GalleryManagerProps {
  profileId: string;
  isPremium: boolean;
  images: GalleryImage[];
  onImagesChange: (images: GalleryImage[]) => void;
}

const CATEGORIES = [
  { value: "milestone", label: "Milestone" },
  { value: "achievement", label: "Achievement" },
  { value: "portfolio", label: "Portfolio" },
  { value: "certificate", label: "Certificate" },
  { value: "memory", label: "Memory" },
  { value: "before-after", label: "Before & After" },
];

export function GalleryManager({ profileId, isPremium, images, onImagesChange }: GalleryManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isPremium) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${profileId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("gallery")
        .getPublicUrl(fileName);

      // Insert into database
      const { data: newImage, error: insertError } = await supabase
        .from("gallery_images")
        .insert({
          profile_id: profileId,
          image_url: publicUrl,
          position: images.length,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      onImagesChange([...images, newImage]);
      toast({ title: "Image uploaded!", description: "Your gallery image has been added." });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const updateImage = async (id: string, updates: Partial<GalleryImage>) => {
    const { error } = await supabase
      .from("gallery_images")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    onImagesChange(images.map(img => img.id === id ? { ...img, ...updates } : img));
    setEditingId(null);
  };

  const deleteImage = async (id: string, imageUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split("/gallery/");
      if (urlParts[1]) {
        await supabase.storage.from("gallery").remove([urlParts[1]]);
      }

      const { error } = await supabase.from("gallery_images").delete().eq("id", id);
      if (error) throw error;

      onImagesChange(images.filter(img => img.id !== id));
      toast({ title: "Image deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (!isPremium) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <Image className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Journey Gallery</h3>
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Create a visual timeline of your journey with photos of achievements, milestones, and memories. Premium feature.
        </p>
        <div className="grid grid-cols-3 gap-2 opacity-50">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square bg-muted/50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Image className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Journey Gallery</h3>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          size="sm"
          className="gap-2"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add Photo
        </Button>
      </div>

      {images.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Click to upload your first gallery image</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((image) => (
            <div key={image.id} className="relative group aspect-square">
              <img
                src={image.image_url}
                alt={image.title || "Gallery image"}
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col justify-between p-3">
                {editingId === image.id ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="Title"
                      defaultValue={image.title || ""}
                      className="h-8 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      onBlur={(e) => updateImage(image.id, { title: e.target.value })}
                    />
                    <select
                      defaultValue={image.category || "milestone"}
                      onChange={(e) => updateImage(image.id, { category: e.target.value })}
                      className="w-full h-8 text-sm bg-white/10 border border-white/20 rounded-md text-white"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value} className="bg-gray-800">
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingId(image.id)}
                    className="text-left"
                  >
                    <p className="text-white font-medium text-sm truncate">
                      {image.title || "Click to add title"}
                    </p>
                    {image.category && (
                      <span className="text-white/70 text-xs capitalize">{image.category}</span>
                    )}
                  </button>
                )}
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:text-red-400 hover:bg-red-500/20"
                    onClick={() => deleteImage(image.id, image.image_url)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
