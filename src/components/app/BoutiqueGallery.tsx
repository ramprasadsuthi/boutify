import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImageIcon, Shirt, Loader2, Maximize2 } from "lucide-react";
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

export function BoutiqueGallery({ boutiqueId }: { boutiqueId: string }) {
  const { apiBase } = useAuth();
  const [images, setImages] = useState<BoutiqueImage[]>([]);
  const [products, setProducts] = useState<BoutiqueProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [imgsRes, prodsRes] = await Promise.all([
        fetch(`${apiBase}/api/boutique/${boutiqueId}/images`),
        fetch(`${apiBase}/api/boutique/${boutiqueId}/products`),
      ]);
      if (imgsRes.ok) setImages(await imgsRes.json());
      if (prodsRes.ok) setProducts(await prodsRes.json());
    } catch (err) {
      console.error("Error fetching gallery data:", err);
    } finally {
      setLoading(false);
    }
  }, [apiBase, boutiqueId]);

  useEffect(() => {
    if (boutiqueId) {
      fetchData();
    }
  }, [boutiqueId, fetchData]);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (images.length === 0 && products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Gallery & Collections</h2>
      </div>

      <Tabs defaultValue="photos" className="w-full">
        <TabsList className="bg-white border border-border shadow-sm p-1 rounded-xl">
          <TabsTrigger
            value="photos"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg"
          >
            <ImageIcon className="h-4 w-4" /> Photos
          </TabsTrigger>
          <TabsTrigger
            value="designs"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg"
          >
            <Shirt className="h-4 w-4" /> Collections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="photos" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img) => (
              <Dialog key={img.id}>
                <DialogTrigger asChild>
                  <div className="group relative aspect-video overflow-hidden rounded-[1.5rem] border border-border bg-white cursor-zoom-in">
                    <img
                      src={img.image_url}
                      alt={img.image_type}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                      <Maximize2 className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-sm">
                        {img.image_type.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-transparent shadow-none flex flex-col items-center justify-center">
                  <DialogTitle className="sr-only">Boutique Image Preview</DialogTitle>
                  <DialogDescription className="sr-only">
                    Full-screen view of the boutique image
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
              <div className="col-span-full py-12 text-center text-muted-foreground bg-white rounded-[1.5rem] border border-dashed">
                No photos available.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="designs" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((prod) => {
              const productImages = JSON.parse(prod.images || "[]");
              return (
                <Card
                  key={prod.id}
                  className="overflow-hidden border-border/50 shadow-card-luxe group rounded-[2rem] bg-white"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                    {productImages[0] && (
                      <img
                        src={productImages[0]}
                        alt={prod.product_name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <CardHeader className="p-6">
                    <CardTitle className="text-xl font-bold">{prod.product_name}</CardTitle>
                    <CardDescription className="font-medium text-primary">
                      {prod.category}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
            {products.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground bg-white rounded-[1.5rem] border border-dashed">
                No collections available yet.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
