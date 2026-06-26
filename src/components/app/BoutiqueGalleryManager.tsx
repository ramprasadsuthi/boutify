import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Shirt,
  Loader2,
  Upload,
  Link as LinkIcon,
  Maximize2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface BoutiqueImage {
  id: number;
  image_type: string;
  image_url: string;
  created_at: string;
}

interface BoutiqueProduct {
  id: number;
  product_name: string;
  category: string;
  price_range: string;
  description: string;
  material: string;
  available_sizes: string;
  images: string; // JSON string
  created_at: string;
}

export function BoutiqueGalleryManager() {
  const { profile, apiBase } = useAuth();
  const [images, setImages] = useState<BoutiqueImage[]>([]);
  const [products, setProducts] = useState<BoutiqueProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("photos");

  // Mode states (Upload or URL)
  const [photoMode, setPhotoMode] = useState<"upload" | "url">("upload");
  const [designMode, setDesignMode] = useState<"upload" | "url">("upload");

  // Form states for new image
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageType, setNewImageType] = useState("sample_design");
  const [addingImage, setAddingImage] = useState(false);
  const photoFileRef = useRef<HTMLInputElement>(null);

  // Form states for new product
  const [newProductName, setNewProductName] = useState("");
  const [newProductImage, setNewProductImage] = useState("");
  const [addingProduct, setAddingProduct] = useState(false);
  const designFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchData();
    }
  }, [profile?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [imgsRes, prodsRes] = await Promise.all([
        fetch(`${apiBase}/api/boutique/${profile?.id}/images`),
        fetch(`${apiBase}/api/boutique/${profile?.id}/products`),
      ]);
      if (imgsRes.ok) setImages(await imgsRes.json());
      if (prodsRes.ok) setProducts(await prodsRes.json());
    } catch (err) {
      console.error("Error fetching gallery data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${apiBase}/api/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Upload failed");
      }
      const data = await res.json();
      return `${apiBase}${data.url}`;
    } catch (err) {
      console.error("Upload error:", err);
      throw err;
    }
  };

  const addImage = async () => {
    let finalUrl = newImageUrl;

    if (photoMode === "upload") {
      const file = photoFileRef.current?.files?.[0];
      if (!file) return toast.error("Please select a file to upload");
      setAddingImage(true);
      try {
        finalUrl = await handleFileUpload(file);
      } catch (err) {
        setAddingImage(false);
        return toast.error("Failed to upload image");
      }
    } else {
      if (!newImageUrl) return toast.error("Please provide an image URL");
      setAddingImage(true);
    }

    try {
      const res = await fetch(`${apiBase}/api/boutique/${profile?.id}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageType: newImageType, imageUrl: finalUrl }),
      });
      if (!res.ok) throw new Error("Failed to add image");
      toast.success("Image added to gallery");
      setNewImageUrl("");
      if (photoFileRef.current) photoFileRef.current.value = "";
      fetchData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
    } finally {
      setAddingImage(false);
    }
  };

  const deleteImage = async (id: number) => {
    try {
      const res = await fetch(`${apiBase}/api/boutique/images/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete image");
      toast.success("Image removed");
      setImages(images.filter((img) => img.id !== id));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const addProduct = async () => {
    let finalUrl = newProductImage;

    if (designMode === "upload") {
      const file = designFileRef.current?.files?.[0];
      if (!file) return toast.error("Please select a file to upload");
      if (!newProductName) return toast.error("Please enter a dress/design name");
      setAddingProduct(true);
      try {
        finalUrl = await handleFileUpload(file);
      } catch (err) {
        setAddingProduct(false);
        return toast.error("Failed to upload image");
      }
    } else {
      if (!newProductName || !newProductImage)
        return toast.error("Please provide name and image URL");
      setAddingProduct(true);
    }

    try {
      const res = await fetch(`${apiBase}/api/boutique/${profile?.id}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: newProductName,
          images: [finalUrl],
          category: "Dress",
          priceRange: "Contact for Price",
        }),
      });
      if (!res.ok) throw new Error("Failed to add design");
      toast.success("Design added to catalog");
      setNewProductName("");
      setNewProductImage("");
      if (designFileRef.current) designFileRef.current.value = "";
      fetchData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
    } finally {
      setAddingProduct(false);
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const res = await fetch(`${apiBase}/api/boutique/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete design");
      toast.success("Design removed");
      setProducts(products.filter((p) => p.id !== id));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="photos" className="gap-2">
            <ImageIcon className="h-4 w-4" /> Boutique Photos
          </TabsTrigger>
          <TabsTrigger value="designs" className="gap-2">
            <Shirt className="h-4 w-4" /> Designs & Dresses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="photos" className="mt-6 space-y-6">
          <Card className="border-border/50 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-xl">Add New Photo</CardTitle>
                <CardDescription>Upload shop front, interior, or team photos.</CardDescription>
              </div>
              <div className="flex bg-muted p-1 rounded-lg scale-90">
                <Button
                  variant={photoMode === "upload" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() => setPhotoMode("upload")}
                >
                  <Upload className="h-3.5 w-3.5" /> Upload
                </Button>
                <Button
                  variant={photoMode === "url" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() => setPhotoMode("url")}
                >
                  <LinkIcon className="h-3.5 w-3.5" /> URL
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Image Type</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newImageType}
                    onChange={(e) => setNewImageType(e.target.value)}
                  >
                    <option value="shop_front">Shop Front</option>
                    <option value="interior">Interior</option>
                    <option value="trial_room">Trial Room</option>
                    <option value="team">Our Team</option>
                    <option value="sample_design">Sample Work</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>{photoMode === "upload" ? "Select Photo" : "Image URL"}</Label>
                  {photoMode === "upload" ? (
                    <Input
                      type="file"
                      accept="image/*"
                      ref={photoFileRef}
                      className="cursor-pointer file:cursor-pointer file:text-primary"
                    />
                  ) : (
                    <Input
                      placeholder="https://example.com/photo.jpg"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                    />
                  )}
                </div>
              </div>
              <Button
                onClick={addImage}
                disabled={addingImage}
                className="w-full sm:w-auto font-bold"
              >
                {addingImage ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Add to Gallery
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img) => (
              <Dialog key={img.id}>
                <DialogTrigger asChild>
                  <div className="group relative aspect-video overflow-hidden rounded-2xl border border-border bg-muted shadow-sm transition-all hover:shadow-elegant cursor-zoom-in">
                    <img
                      src={img.image_url}
                      alt={img.image_type}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-4">
                      <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm text-white hover:bg-white/30 transition-colors">
                        <Maximize2 className="h-6 w-6" />
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-10 w-10 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteImage(img.id);
                        }}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-sm">
                        {img.image_type.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-transparent shadow-none flex flex-col items-center justify-center">
                  <DialogTitle className="sr-only">Boutique Photo Preview</DialogTitle>
                  <DialogDescription className="sr-only">
                    Full-screen preview of a boutique photo
                  </DialogDescription>
                  <img
                    src={img.image_url}
                    alt={img.image_type}
                    className="max-w-full max-h-[85vh] object-contain rounded-2xl"
                  />
                </DialogContent>
              </Dialog>
            ))}
            {images.length === 0 && (
              <div className="col-span-full flex h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border text-muted-foreground">
                <ImageIcon className="mb-2 h-8 w-8 opacity-20" />
                <p>No photos added yet.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="designs" className="mt-6 space-y-6">
          <Card className="border-border/50 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-xl">Add New Design/Dress</CardTitle>
                <CardDescription>Showcase your best creations and latest arrivals.</CardDescription>
              </div>
              <div className="flex bg-muted p-1 rounded-lg scale-90">
                <Button
                  variant={designMode === "upload" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() => setDesignMode("upload")}
                >
                  <Upload className="h-3.5 w-3.5" /> Upload
                </Button>
                <Button
                  variant={designMode === "url" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() => setDesignMode("url")}
                >
                  <LinkIcon className="h-3.5 w-3.5" /> URL
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Dress/Design Name</Label>
                  <Input
                    placeholder="e.g. Bridal Silk Lehanga"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{designMode === "upload" ? "Select Photo" : "Image URL"}</Label>
                  {designMode === "upload" ? (
                    <Input
                      type="file"
                      accept="image/*"
                      ref={designFileRef}
                      className="cursor-pointer file:cursor-pointer file:text-primary"
                    />
                  ) : (
                    <Input
                      placeholder="https://example.com/dress.jpg"
                      value={newProductImage}
                      onChange={(e) => setNewProductImage(e.target.value)}
                    />
                  )}
                </div>
              </div>
              <Button
                onClick={addProduct}
                disabled={addingProduct}
                className="w-full sm:w-auto font-bold"
              >
                {addingProduct ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Add Design
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((prod) => {
              const productImages = JSON.parse(prod.images || "[]");
              return (
                <Dialog key={prod.id}>
                  <DialogTrigger asChild>
                    <Card className="overflow-hidden border-border/50 shadow-soft group cursor-zoom-in">
                      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                        {productImages[0] && (
                          <img
                            src={productImages[0]}
                            alt={prod.product_name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-4">
                          <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm text-white hover:bg-white/30 transition-colors">
                            <Maximize2 className="h-5 w-5" />
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProduct(prod.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">{prod.product_name}</CardTitle>
                        <CardDescription>{prod.category}</CardDescription>
                      </CardHeader>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-transparent shadow-none flex flex-col items-center justify-center">
                    <DialogTitle className="sr-only">Design Image Preview</DialogTitle>
                    <DialogDescription className="sr-only">
                      Full-screen preview of a boutique design or dress
                    </DialogDescription>
                    {productImages[0] && (
                      <img
                        src={productImages[0]}
                        alt={prod.product_name}
                        className="max-w-full max-h-[85vh] object-contain rounded-2xl"
                      />
                    )}
                  </DialogContent>
                </Dialog>
              );
            })}
            {products.length === 0 && (
              <div className="col-span-full flex h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border text-muted-foreground">
                <Shirt className="mb-2 h-8 w-8 opacity-20" />
                <p>No designs added yet.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
