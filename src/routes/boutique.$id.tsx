import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/boutify/Navbar";
import { Footer } from "@/components/boutify/Footer";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Calendar,
  Instagram,
  Facebook,
  Youtube,
  Send,
  CheckCircle2,
  Store,
  CreditCard,
  ChevronLeft,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BoutiqueGallery } from "@/components/app/BoutiqueGallery";
import { type Profile } from "@/contexts/AuthContext";

export const Route = createFileRoute("/boutique/$id")({
  component: BoutiqueDetailsPage,
});

interface BoutiqueData extends Profile {
  alternate_mobile?: string;
  website?: string;
  gst_number?: string;
  registration_number?: string;
  year_established?: number;
  state?: string;
  district?: string;
  full_address?: string;
  landmark?: string;
  pincode?: string;
  google_maps_link?: string;
  working_days?: string;
  opening_time?: string;
  closing_time?: string;
  weekly_holiday?: string;
  blouse_starting_price?: number;
  saree_fall_pico_charges?: number;
  bridal_package_cost?: number;
  designer_dress_cost?: number;
  alteration_charges?: number;
  home_visit_charges?: number;
  instagram_url?: string;
  facebook_url?: string;
  youtube_channel?: string;
  whatsapp_number?: string;
  telegram_link?: string;
  categories: number[];
  services: number[];
}

function BoutiqueDetailsPage() {
  const { id } = Route.useParams();
  const { apiBase } = useAuth();
  const [data, setData] = useState<BoutiqueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<{
    categories: { id: number; name: string }[];
    services: { id: number; name: string }[];
  }>({ categories: [], services: [] });

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const [boutiqueRes, catsRes, svcsRes] = await Promise.all([
          fetch(`${apiBase}/api/boutique/${id}`),
          fetch(`${apiBase}/api/metadata/categories`),
          fetch(`${apiBase}/api/metadata/services`),
        ]);

        if (boutiqueRes.ok) setData(await boutiqueRes.json());
        if (catsRes.ok) {
          const cats = await catsRes.json();
          setMetadata((prev) => ({ ...prev, categories: Array.isArray(cats) ? cats : [] }));
        }
        if (svcsRes.ok) {
          const svcs = await svcsRes.json();
          setMetadata((prev) => ({ ...prev, services: Array.isArray(svcs) ? svcs : [] }));
        }
      } catch (err) {
        console.error("Failed to fetch boutique details", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
    window.scrollTo(0, 0);
  }, [id, apiBase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 space-y-8">
          <Skeleton className="h-12 w-1/3" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-[400px] w-full rounded-3xl" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full rounded-3xl" />
              <Skeleton className="h-64 w-full rounded-3xl" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold">Boutique not found</h1>
        <Link to="/" className="mt-4 text-primary hover:underline">
          Return to home
        </Link>
      </div>
    );
  }

  const boutiqueCategories = metadata.categories.filter((c) => data.categories?.includes(c.id));
  const boutiqueServices = metadata.services.filter((s) => data.services?.includes(s.id));

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      <main className="pt-24 pb-20">
        {/* Breadcrumb & Action */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Search
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Main Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Hero Section */}
              <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-border p-8 md:p-12 shadow-card-luxe">
                <div className="absolute top-0 right-0 p-8">
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-4 py-1.5 rounded-full flex gap-1.5 items-center">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verified Boutique
                  </Badge>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="h-24 w-24 rounded-3xl bg-gradient-purple flex items-center justify-center text-white shrink-0 shadow-lg">
                    <Store className="h-12 w-12" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="space-y-1">
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                        {data.boutique_name || "Unnamed Boutique"}
                      </h1>
                      <div className="flex items-center text-muted-foreground font-medium">
                        <MapPin className="h-4 w-4 mr-1.5 text-accent" />
                        {data.area}, {data.city}, {data.state}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {boutiqueCategories.map((cat) => (
                        <Badge
                          key={cat.id}
                          variant="secondary"
                          className="bg-muted/50 text-muted-foreground border-border px-3 py-1"
                        >
                          {cat.name}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-muted-foreground leading-relaxed text-lg max-w-2xl">
                      {data.boutique_description ||
                        "Professional fashion studio dedicated to creating unique styles and perfect fits. We specialize in custom tailoring and designer collections."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Gallery Section */}
              <BoutiqueGallery boutiqueId={id} />

              {/* Services & Specialities */}
              <div className="rounded-[2rem] bg-white border border-border p-8 shadow-card-luxe space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" /> Specialities & Services
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {boutiqueServices.length > 0 ? (
                    boutiqueServices.map((svc) => (
                      <div
                        key={svc.id}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50 group hover:bg-white hover:border-primary/20 hover:shadow-elegant transition-all"
                      >
                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-foreground/80">{svc.name}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground italic col-span-2">
                      Contact boutique for specific service list.
                    </p>
                  )}
                </div>
              </div>

              {/* Pricing Information */}
              <div className="rounded-[2rem] bg-white border border-border p-8 shadow-card-luxe space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" /> Pricing (Starting From)
                </h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {[
                    { label: "Blouse Stitching", val: data.blouse_starting_price },
                    { label: "Saree Fall/Pico", val: data.saree_fall_pico_charges },
                    { label: "Bridal Package", val: data.bridal_package_cost },
                    { label: "Designer Dress", val: data.designer_dress_cost },
                    { label: "Alterations", val: data.alteration_charges },
                    { label: "Home Visit", val: data.home_visit_charges },
                  ].map((p, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {p.label}
                      </div>
                      <div className="text-2xl font-black text-primary">₹{p.val || "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Sidebar */}
            <div className="space-y-6 lg:sticky lg:top-24">
              {/* Contact Card */}
              <div className="rounded-[2rem] bg-white border border-border p-8 shadow-card-luxe space-y-6">
                <h3 className="text-xl font-bold">Contact & Location</h3>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-muted-foreground uppercase">
                        Phone Number
                      </div>
                      <a
                        href={`tel:${data.mobile}`}
                        className="font-bold text-foreground hover:text-primary transition-colors"
                      >
                        {data.mobile}
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-muted-foreground uppercase">
                        Email Address
                      </div>
                      <div className="font-bold text-foreground truncate">
                        {data.email || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-muted-foreground uppercase">
                        Address
                      </div>
                      <div className="text-sm font-medium text-foreground/80 leading-relaxed">
                        {data.full_address || `${data.area}, ${data.city}`}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <Button
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                    asChild
                  >
                    <a
                      href={`https://wa.me/${data.whatsapp_number || data.mobile}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" /> Chat on WhatsApp
                    </a>
                  </Button>
                  {data.google_maps_link && (
                    <Button
                      variant="outline"
                      className="w-full h-12 rounded-xl border-border"
                      asChild
                    >
                      <a href={data.google_maps_link} target="_blank" rel="noreferrer">
                        <MapPin className="mr-2 h-5 w-5" /> Open in Google Maps
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Working Hours */}
              <div className="rounded-[2rem] bg-white border border-border p-8 shadow-card-luxe space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> Working Hours
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Working Days
                    </span>
                    <span className="font-bold">{data.working_days || "Mon - Sat"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Timings
                    </span>
                    <span className="font-bold text-emerald-600">
                      {data.opening_time?.slice(0, 5) || "10:00"} AM -{" "}
                      {data.closing_time?.slice(0, 5) || "08:00"} PM
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-rose-500" /> Weekly Holiday
                    </span>
                    <span className="font-bold text-rose-500">
                      {data.weekly_holiday || "Sunday"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Social Connect */}
              {(data.instagram_url ||
                data.facebook_url ||
                data.youtube_channel ||
                data.website) && (
                <div className="rounded-[2rem] bg-white border border-border p-8 shadow-card-luxe space-y-6">
                  <h3 className="text-xl font-bold">Social Connect</h3>
                  <div className="flex flex-wrap gap-4">
                    {data.instagram_url && (
                      <a
                        href={data.instagram_url}
                        target="_blank"
                        rel="noreferrer"
                        className="h-12 w-12 rounded-2xl bg-[#E4405F]/10 text-[#E4405F] flex items-center justify-center hover:bg-[#E4405F] hover:text-white transition-all shadow-sm"
                      >
                        <Instagram className="h-6 w-6" />
                      </a>
                    )}
                    {data.facebook_url && (
                      <a
                        href={data.facebook_url}
                        target="_blank"
                        rel="noreferrer"
                        className="h-12 w-12 rounded-2xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all shadow-sm"
                      >
                        <Facebook className="h-6 w-6" />
                      </a>
                    )}
                    {data.youtube_channel && (
                      <a
                        href={data.youtube_channel}
                        target="_blank"
                        rel="noreferrer"
                        className="h-12 w-12 rounded-2xl bg-[#FF0000]/10 text-[#FF0000] flex items-center justify-center hover:bg-[#FF0000] hover:text-white transition-all shadow-sm"
                      >
                        <Youtube className="h-6 w-6" />
                      </a>
                    )}
                    {data.website && (
                      <a
                        href={data.website}
                        target="_blank"
                        rel="noreferrer"
                        className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                      >
                        <Globe className="h-6 w-6" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
