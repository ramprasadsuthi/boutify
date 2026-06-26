import { Search, MapPin, Store, ChevronRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import mapImg from "@/assets/boutify/india-map.jpg";

interface Boutique {
  id: string;
  boutique_name?: string;
  full_name?: string;
  city?: string;
  area?: string;
  categories?: string[];
  services?: string[];
}

interface CategoryOrService {
  id: number;
  name: string;
}

export function SearchSection() {
  const { apiBase } = useAuth();
  const navigate = useNavigate();
  const [cityList, setCityList] = useState<string[]>([]);
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingMetadata(true);
        const [citiesRes, boutiquesRes, categoriesRes, servicesRes] = await Promise.all([
          fetch(`${apiBase}/api/metadata/cities`),
          fetch(`${apiBase}/api/boutiques`),
          fetch(`${apiBase}/api/metadata/categories`),
          fetch(`${apiBase}/api/metadata/services`),
        ]);

        if (citiesRes.ok) {
          const data = await citiesRes.json();
          setCityList(data);
        }

        if (boutiquesRes.ok) {
          const data = await boutiquesRes.json();
          setBoutiques(data);
        }

        if (categoriesRes.ok && servicesRes.ok) {
          const cats: CategoryOrService[] = await categoriesRes.json();
          const svcs: CategoryOrService[] = await servicesRes.json();
          const combined = Array.from(
            new Set([...cats.map((c) => c.name), ...svcs.map((s) => s.name)]),
          ).sort();
          setCategoryList(combined);
        }
      } catch (err) {
        console.error("Failed to fetch search data", err);
      } finally {
        setLoadingMetadata(false);
      }
    }
    fetchData();
  }, [apiBase]);

  const filteredBoutiques = useMemo(() => {
    return boutiques
      .filter((b) => {
        const matchCity = selectedCity === "all" || b.city === selectedCity;
        const matchCategory =
          selectedCategory === "all" ||
          (b.categories && b.categories.includes(selectedCategory)) ||
          (b.services && b.services.includes(selectedCategory));
        const matchName =
          !searchQuery ||
          b.boutique_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCity && matchCategory && matchName;
      })
      .slice(0, 5); // Limit results for the dropdown
  }, [boutiques, selectedCity, selectedCategory, searchQuery]);

  return (
    <section id="boutiques" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-bold text-accent uppercase tracking-wider mb-3">Discover</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Find <span className="text-gradient-purple">Boutique Owners</span> Near You
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Browse verified boutiques across your city. Filter by specialty, service, or search by
              name.
            </p>

            <div className="mt-8 rounded-2xl bg-white border border-border shadow-card-luxe p-5 sm:p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground/70 mb-1.5 block">
                    City
                  </label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="h-11">
                      <MapPin className="h-4 w-4 text-primary mr-1" />
                      <SelectValue placeholder={loadingMetadata ? "Loading..." : "Select City"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {cityList.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground/70 mb-1.5 block">
                    Specialty / Service
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-11">
                      <Tag className="h-4 w-4 text-primary mr-1" />
                      <SelectValue
                        placeholder={loadingMetadata ? "Loading..." : "Select Specialty"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specialties & Services</SelectItem>
                      {categoryList.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="relative">
                <label className="text-xs font-semibold text-foreground/70 mb-1.5 block">
                  Boutique Name
                </label>
                <Input
                  className="h-11"
                  placeholder="Search boutique name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                />

                {isFocused && searchQuery && (
                  <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-border rounded-xl shadow-luxe z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {filteredBoutiques.length > 0 ? (
                      <div className="divide-y divide-border">
                        {filteredBoutiques.map((b) => (
                          <button
                            key={b.id}
                            className="w-full p-3 text-left hover:bg-muted/50 flex items-center gap-3 transition-colors"
                            onClick={() => navigate({ to: `/boutique/${b.id}` })}
                          >
                            <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center">
                              <Store className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-foreground truncate">
                                {b.boutique_name || "Unnamed Boutique"}
                              </div>
                              <div className="text-[10px] text-muted-foreground truncate">
                                {b.area}, {b.city}
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        No boutiques found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Button
                className="w-full h-11 bg-gradient-purple text-primary-foreground font-semibold hover:opacity-95 shadow-luxe"
                onClick={() => {
                  navigate({
                    to: "/search",
                    search: {
                      city: selectedCity,
                      category: selectedCategory,
                      q: searchQuery,
                    },
                  });
                }}
              >
                <Search className="mr-2 h-4 w-4" />
                Search Boutiques
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-purple-gold opacity-10 blur-3xl rounded-full" />
            <div className="relative rounded-3xl bg-white border border-border p-6 shadow-card-luxe">
              <img
                src={mapImg}
                alt="Boutique locations across India"
                loading="lazy"
                width={1024}
                height={1024}
                className="w-full h-auto"
              />
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
                  <span className="text-sm font-medium text-foreground/80">
                    {cityList.length} active cities
                  </span>
                </div>
                <span className="text-sm font-bold text-primary">
                  {boutiques.length} verified boutiques
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
