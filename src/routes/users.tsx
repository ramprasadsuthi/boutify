import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth, type Profile } from "@/contexts/AuthContext";
import { AppShell } from "@/components/app/AppShell";
import {
  Trash2,
  LogOut,
  Users,
  Plus,
  Store,
  MapPin,
  CheckSquare,
  Clock,
  Share2,
  DollarSign,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/users")({
  component: UsersPage,
});

function UsersPage() {
  const { user, profile, loading: authLoading, signOut, apiBase } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "customer" | "boutique_owner" | "admin">("all");

  // Registration/Edit State
  const [addOpen, setAddOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [adding, setAdding] = useState(false);

  // Form Fields
  const initialForm = {
    fullName: "",
    boutiqueName: "",
    userid: "",
    mobile: "",
    password: "",
    alternateMobile: "",
    email: "",
    website: "",
    gstNumber: "",
    registrationNumber: "",
    yearEstablished: "",
    state: "",
    district: "",
    city: "",
    area: "",
    fullAddress: "",
    landmark: "",
    pincode: "",
    googleMapsLink: "",
    workingDays: "Monday-Saturday",
    openingTime: "10:00",
    closingTime: "20:00",
    weeklyHoliday: "Sunday",
    blouseStartingPrice: "",
    sareeFallPicoCharges: "",
    bridalPackageCost: "",
    designerDressCost: "",
    alterationCharges: "",
    homeVisitCharges: "",
    instagramUrl: "",
    facebookUrl: "",
    youtubeChannel: "",
    whatsappNumber: "",
    telegramLink: "",
    categories: [] as number[],
    services: [] as number[],
  };

  const [form, setForm] = useState<any>(initialForm);

  const [metadata, setMetadata] = useState<{ categories: any[]; services: any[] }>({
    categories: [],
    services: [],
  });

  useEffect(() => {
    if (!authLoading && (!user || profile?.user_type !== "admin")) {
      navigate({ to: "/login" });
    }
  }, [user, profile, authLoading, navigate]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/users`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const [cats, svcs] = await Promise.all([
        fetch(`${apiBase}/api/metadata/categories`).then((r) => r.json()),
        fetch(`${apiBase}/api/metadata/services`).then((r) => r.json()),
      ]);

      setMetadata({
        categories: Array.isArray(cats) ? cats : [],
        services: Array.isArray(svcs) ? svcs : [],
      });

      if (!Array.isArray(cats) || !Array.isArray(svcs)) {
        console.error("Metadata API returned non-array:", { cats, svcs });
        toast.error("Please run the new SQL schema. Categories/Services missing.");
      }
    } catch (e) {
      console.error("Failed to load metadata", e);
    }
  };

  useEffect(() => {
    if (profile?.user_type === "admin") {
      load();
      loadMetadata();
    }
  }, [profile]);

  const onAddBoutique = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const url = editMode
        ? `${apiBase}/api/boutique/${editingId}`
        : `${apiBase}/api/auth/register`;
      const method = editMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          userType: "boutique_owner",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Operation failed");

      toast.success(
        editMode ? "Boutique details updated" : "Boutique owner registered successfully",
      );
      setAddOpen(false);
      setForm(initialForm);
      load();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setAdding(false);
    }
  };

  const startEdit = async (u: Profile) => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/boutique/${u.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setForm({
        fullName: data.full_name || "",
        boutiqueName: data.boutique_name || "",
        userid: data.userid || "",
        mobile: data.mobile || "",
        password: "", // Don't prepopulate password for security, leave blank unless changing
        alternateMobile: data.alternate_mobile || "",
        email: data.email || "",
        website: data.website || "",
        gstNumber: data.gst_number || "",
        registrationNumber: data.registration_number || "",
        yearEstablished: data.year_established || "",
        state: data.state || "",
        district: data.district || "",
        city: data.city || "",
        area: data.area || "",
        fullAddress: data.full_address || "",
        landmark: data.landmark || "",
        pincode: data.pincode || "",
        googleMapsLink: data.google_maps_link || "",
        latitude: data.latitude || "",
        longitude: data.longitude || "",
        workingDays: data.working_days || "Monday-Saturday",
        openingTime: data.opening_time || "10:00",
        closingTime: data.closing_time || "20:00",
        weeklyHoliday: data.weekly_holiday || "Sunday",
        blouseStartingPrice: data.blouse_starting_price || "",
        sareeFallPicoCharges: data.saree_fall_pico_charges || "",
        bridalPackageCost: data.bridal_package_cost || "",
        designerDressCost: data.designer_dress_cost || "",
        alterationCharges: data.alteration_charges || "",
        homeVisitCharges: data.home_visit_charges || "",
        instagramUrl: data.instagram_url || "",
        facebookUrl: data.facebook_url || "",
        youtubeChannel: data.youtube_channel || "",
        whatsappNumber: data.whatsapp_number || "",
        telegramLink: data.telegram_link || "",
        categories: data.categories || [],
        services: data.services || [],
      });

      setEditingId(u.id);
      setEditMode(true);
      setAddOpen(true);
    } catch (err: any) {
      toast.error("Failed to load details: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "active" | "restricted") => {
    try {
      const res = await fetch(`${apiBase}/api/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success(`User ${status}`);
      load();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`${apiBase}/api/users/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("User profile deleted successfully");
      load();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filtered = users.filter((u) => {
    if (filter !== "all" && u.user_type !== filter) return false;
    if (!q) return true;
    return (
      u.full_name?.toLowerCase().includes(q.toLowerCase()) ||
      u.userid?.toLowerCase().includes(q.toLowerCase()) ||
      u.mobile?.includes(q) ||
      u.email?.toLowerCase().includes(q.toLowerCase())
    );
  });

  const isInitialLoading = authLoading || (loading && users.length === 0);

  const updateForm = (key: string, val: any) => setForm((prev: any) => ({ ...prev, [key]: val }));

  const toggleList = (key: "categories" | "services", id: number) => {
    setForm((prev: any) => {
      const list = prev[key] as number[];
      if (list.includes(id)) return { ...prev, [key]: list.filter((i) => i !== id) };
      return { ...prev, [key]: [...list, id] };
    });
  };

  return (
    <AppShell>
      <div className="space-y-6 p-6 md:p-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin: User Management</h1>
            <p className="mt-1 text-muted-foreground font-medium">
              View and manage all users across the platform.
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog
              open={addOpen}
              onOpenChange={(v) => {
                setAddOpen(v);
                if (!v) {
                  setEditMode(false);
                  setEditingId(null);
                  setForm(initialForm);
                  setActiveTab("basic");
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-primary text-primary-foreground rounded-xl shadow-elegant"
                  onClick={() => {
                    setEditMode(false);
                    setForm(initialForm);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" /> Register Boutique
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {editMode ? "Edit Boutique Profile" : "Register New Boutique"}
                  </DialogTitle>
                  <DialogDescription>
                    {editMode
                      ? "Modify the existing boutique information."
                      : "Fill in all business details to onboard a new boutique partner."}
                  </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                  <TabsList className="grid grid-cols-5 w-full bg-muted/50 p-1">
                    <TabsTrigger value="basic" className="flex gap-2 items-center text-xs">
                      <Users className="h-3.5 w-3.5" /> Basic
                    </TabsTrigger>
                    <TabsTrigger value="location" className="flex gap-2 items-center text-xs">
                      <MapPin className="h-3.5 w-3.5" /> Location
                    </TabsTrigger>
                    <TabsTrigger value="category" className="flex gap-2 items-center text-xs">
                      <CheckSquare className="h-3.5 w-3.5" /> Cat/Svc
                    </TabsTrigger>
                    <TabsTrigger value="ops" className="flex gap-2 items-center text-xs">
                      <DollarSign className="h-3.5 w-3.5" /> Pricing
                    </TabsTrigger>
                    <TabsTrigger value="social" className="flex gap-2 items-center text-xs">
                      <Share2 className="h-3.5 w-3.5" /> Social
                    </TabsTrigger>
                  </TabsList>

                  <form onSubmit={onAddBoutique}>
                    <TabsContent value="basic" className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Owner Full Name</Label>
                          <Input
                            required
                            value={form.fullName}
                            onChange={(e) => updateForm("fullName", e.target.value)}
                            placeholder="Full name of the owner"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Boutique Name</Label>
                          <Input
                            required
                            value={form.boutiqueName}
                            onChange={(e) => updateForm("boutiqueName", e.target.value)}
                            placeholder="Registered business name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Primary Mobile</Label>
                          <Input
                            required
                            value={form.mobile}
                            onChange={(e) => updateForm("mobile", e.target.value)}
                            placeholder="10-digit mobile"
                            disabled={editMode}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Alternate Mobile</Label>
                          <Input
                            value={form.alternateMobile}
                            onChange={(e) => updateForm("alternateMobile", e.target.value)}
                            placeholder="Backup contact"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Business Email</Label>
                          <Input
                            type="email"
                            value={form.email}
                            onChange={(e) => updateForm("email", e.target.value)}
                            placeholder="business@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Website URL</Label>
                          <Input
                            value={form.website}
                            onChange={(e) => updateForm("website", e.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>User ID (Unique login)</Label>
                          <Input
                            required
                            value={form.userid}
                            onChange={(e) =>
                              updateForm("userid", e.target.value.toLowerCase().replace(/\s/g, ""))
                            }
                            placeholder="e.g. boutique_unq"
                            disabled={editMode}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Login Password {editMode && "(Leave blank to keep same)"}</Label>
                          <Input
                            required={!editMode}
                            type="password"
                            value={form.password}
                            onChange={(e) => updateForm("password", e.target.value)}
                            placeholder={editMode ? "••••••" : "Minimum 6 characters"}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>GST Number</Label>
                          <Input
                            value={form.gstNumber}
                            onChange={(e) => updateForm("gstNumber", e.target.value)}
                            placeholder="GSTIN"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Registration Number</Label>
                          <Input
                            value={form.registrationNumber}
                            onChange={(e) => updateForm("registrationNumber", e.target.value)}
                            placeholder="Udyam/Trade License"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Year Established</Label>
                          <Input
                            type="number"
                            value={form.yearEstablished}
                            onChange={(e) => updateForm("yearEstablished", e.target.value)}
                            placeholder="YYYY"
                          />
                        </div>
                      </div>
                      <div className="pt-4 flex justify-end">
                        <Button
                          type="button"
                          onClick={() => setActiveTab("location")}
                          className="gap-2"
                        >
                          Next: Location <Clock className="h-4 w-4 rotate-[270deg]" />
                        </Button>
                      </div>
                    </TabsContent>

                    {/* ... (rest of the tabs same as before) */}
                    <TabsContent value="location" className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>State</Label>
                          <Input
                            value={form.state}
                            onChange={(e) => updateForm("state", e.target.value)}
                            placeholder="e.g. Andhra Pradesh"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>District</Label>
                          <Input
                            value={form.district}
                            onChange={(e) => updateForm("district", e.target.value)}
                            placeholder="e.g. Visakhapatnam"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input
                            required
                            value={form.city}
                            onChange={(e) => updateForm("city", e.target.value)}
                            placeholder="e.g. Vizag"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Area / Locality</Label>
                          <Input
                            required
                            value={form.area}
                            onChange={(e) => updateForm("area", e.target.value)}
                            placeholder="e.g. MVP Colony"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Full Address</Label>
                          <Textarea
                            value={form.fullAddress}
                            onChange={(e) => updateForm("fullAddress", e.target.value)}
                            placeholder="Complete business address"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Landmark</Label>
                          <Input
                            value={form.landmark}
                            onChange={(e) => updateForm("landmark", e.target.value)}
                            placeholder="Nearby landmark"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Pincode</Label>
                          <Input
                            value={form.pincode}
                            onChange={(e) => updateForm("pincode", e.target.value)}
                            placeholder="6-digit code"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Google Maps Link</Label>
                          <Input
                            value={form.googleMapsLink}
                            onChange={(e) => updateForm("googleMapsLink", e.target.value)}
                            placeholder="https://maps.app.goo.gl/..."
                          />
                        </div>
                      </div>
                      <div className="pt-4 flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveTab("basic")}
                        >
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setActiveTab("category")}
                          className="gap-2"
                        >
                          Next: Categories <Clock className="h-4 w-4 rotate-[270deg]" />
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="category" className="space-y-6 pt-4">
                      <div>
                        <Label className="text-lg font-bold">Boutique Categories</Label>
                        <p className="text-xs text-muted-foreground mb-4">
                          Select all that apply to this boutique.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {metadata.categories.map((cat) => (
                            <div
                              key={cat.id}
                              className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                            >
                              <Checkbox
                                id={`cat-${cat.id}`}
                                checked={form.categories.includes(cat.id)}
                                onCheckedChange={() => toggleList("categories", cat.id)}
                              />
                              <Label
                                htmlFor={`cat-${cat.id}`}
                                className="text-xs font-medium leading-none cursor-pointer flex-1"
                              >
                                {cat.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <Label className="text-lg font-bold">Services Offered</Label>
                        <p className="text-xs text-muted-foreground mb-4">
                          Select the specific services this boutique provides.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {metadata.services.map((svc) => (
                            <div
                              key={svc.id}
                              className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                            >
                              <Checkbox
                                id={`svc-${svc.id}`}
                                checked={form.services.includes(svc.id)}
                                onCheckedChange={() => toggleList("services", svc.id)}
                              />
                              <Label
                                htmlFor={`svc-${svc.id}`}
                                className="text-xs font-medium leading-none cursor-pointer flex-1"
                              >
                                {svc.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveTab("location")}
                        >
                          Back
                        </Button>
                        <Button type="button" onClick={() => setActiveTab("ops")} className="gap-2">
                          Next: Pricing <Clock className="h-4 w-4 rotate-[270deg]" />
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="ops" className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Working Days</Label>
                          <Input
                            value={form.workingDays}
                            onChange={(e) => updateForm("workingDays", e.target.value)}
                            placeholder="e.g. Mon-Sat"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Weekly Holiday</Label>
                          <Input
                            value={form.weeklyHoliday}
                            onChange={(e) => updateForm("weeklyHoliday", e.target.value)}
                            placeholder="e.g. Sunday"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Opening Time</Label>
                          <Input
                            type="time"
                            value={form.openingTime}
                            onChange={(e) => updateForm("openingTime", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Closing Time</Label>
                          <Input
                            type="time"
                            value={form.closingTime}
                            onChange={(e) => updateForm("closingTime", e.target.value)}
                          />
                        </div>

                        <div className="md:col-span-2 pt-4">
                          <Label className="text-base font-bold">
                            Pricing Information (Starting from)
                          </Label>
                        </div>

                        <div className="space-y-2">
                          <Label>Blouse Stitching (₹)</Label>
                          <Input
                            type="number"
                            value={form.blouseStartingPrice}
                            onChange={(e) => updateForm("blouseStartingPrice", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Saree Fall/Pico (₹)</Label>
                          <Input
                            type="number"
                            value={form.sareeFallPicoCharges}
                            onChange={(e) => updateForm("sareeFallPicoCharges", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Bridal Package (₹)</Label>
                          <Input
                            type="number"
                            value={form.bridalPackageCost}
                            onChange={(e) => updateForm("bridalPackageCost", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Designer Dress (₹)</Label>
                          <Input
                            type="number"
                            value={form.designerDressCost}
                            onChange={(e) => updateForm("designerDressCost", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Alteration Charges (₹)</Label>
                          <Input
                            type="number"
                            value={form.alterationCharges}
                            onChange={(e) => updateForm("alterationCharges", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Home Visit Charges (₹)</Label>
                          <Input
                            type="number"
                            value={form.homeVisitCharges}
                            onChange={(e) => updateForm("homeVisitCharges", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="pt-4 flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveTab("category")}
                        >
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setActiveTab("social")}
                          className="gap-2"
                        >
                          Next: Social Media <Clock className="h-4 w-4 rotate-[270deg]" />
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="social" className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Instagram URL</Label>
                          <Input
                            value={form.instagramUrl}
                            onChange={(e) => updateForm("instagramUrl", e.target.value)}
                            placeholder="https://instagram.com/..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Facebook URL</Label>
                          <Input
                            value={form.facebookUrl}
                            onChange={(e) => updateForm("facebookUrl", e.target.value)}
                            placeholder="https://facebook.com/..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>YouTube Channel</Label>
                          <Input
                            value={form.youtubeChannel}
                            onChange={(e) => updateForm("youtubeChannel", e.target.value)}
                            placeholder="Channel URL"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>WhatsApp Number</Label>
                          <Input
                            value={form.whatsappNumber}
                            onChange={(e) => updateForm("whatsappNumber", e.target.value)}
                            placeholder="Mobile with country code"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Telegram Link</Label>
                          <Input
                            value={form.telegramLink}
                            onChange={(e) => updateForm("telegramLink", e.target.value)}
                            placeholder="t.me/..."
                          />
                        </div>
                      </div>

                      <div className="pt-8 border-t border-border mt-8">
                        <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
                          <p className="text-sm text-primary font-medium mb-1">
                            {editMode ? "Ready to save changes?" : "Ready to onboard?"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {editMode
                              ? "This will update the existing boutique profile."
                              : "This will create a new boutique profile with all the information provided across all tabs."}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-between">
                        <Button type="button" variant="outline" onClick={() => setActiveTab("ops")}>
                          Back
                        </Button>
                        <Button
                          type="submit"
                          className="bg-gradient-primary text-primary-foreground font-bold h-11 px-8"
                          disabled={adding}
                        >
                          {adding
                            ? editMode
                              ? "Saving..."
                              : "Onboarding..."
                            : editMode
                              ? "Save Changes"
                              : "Complete Registration"}
                        </Button>
                      </div>
                    </TabsContent>
                  </form>
                </Tabs>
              </DialogContent>
            </Dialog>
            <Button
              onClick={load}
              variant="outline"
              size="sm"
              disabled={loading}
              className="hidden md:flex rounded-xl shadow-soft"
            >
              {loading ? "Refreshing..." : "Refresh list"}
            </Button>
          </div>
        </div>

        {isInitialLoading ? (
          <div className="space-y-4">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/50">
                <Skeleton className="h-4 w-full" />
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 border-b border-border last:border-0">
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3">
              <Input
                className="max-w-xs"
                placeholder="Search name, user id, mobile…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              {(["all", "admin", "boutique_owner", "customer"] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className={filter === f ? "bg-gradient-primary text-primary-foreground" : ""}
                >
                  {f.replace("_", " ")}
                </Button>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">User ID</th>
                    <th className="px-4 py-3">Mobile</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Wallet</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{u.full_name}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                        {u.userid ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.mobile ?? "—"}</td>
                      <td className="px-4 py-3 capitalize">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                            u.user_type === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : u.user_type === "boutique_owner"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {u.user_type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                            u.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : u.status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              u.status === "active"
                                ? "bg-emerald-500"
                                : u.status === "pending"
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                            }`}
                          />
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">
                        ₹{u.wallet_balance || "0.00"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {u.user_type === "boutique_owner" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-primary text-primary hover:bg-primary/10"
                              onClick={() => startEdit(u)}
                            >
                              Edit Details
                            </Button>
                          )}

                          {u.status === "active" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(u.id, "restricted")}
                            >
                              Restrict
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(u.id, "active")}
                            >
                              Activate
                            </Button>
                          )}

                          {u.id !== user?.id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete <strong>{u.full_name}</strong>'s
                                    profile from the database. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteUser(u.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete User
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length && !loading && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="h-8 w-8 opacity-20" />
                          <p>No users found matching your search.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
