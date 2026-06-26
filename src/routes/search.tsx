import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/boutify/Navbar";
import { Footer } from "@/components/boutify/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  Tag,
  Store,
  ChevronRight,
  SlidersHorizontal,
  X,
  Loader2,
} from "lucide-react";

interface Boutique {
  id: string;
  boutique_name?: string;
  full_name?: string;
  city?: string;
  area?: string;
  categories?: string[];
  services?: string[];
  user_type?: string;
}

interface CategoryOrService {
  id: number;
  name: string;
}

type SearchParams = {
  city?: string;
  category?: string;
  q?: string;
};

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      city: typeof search.city === "string" ? search.city : "all",
      category: typeof search.category === "string" ? search.category : "all",
      q: typeof search.q === "string" ? search.q : "",
    };
  },
  component: SearchResultsPage,
});

function SearchResultsPage() {
  const { apiBase } = useAuth();
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });

  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [cityList, setCityList] = useState<string[]>([]);
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Local state initialized from query params
  const [city, setCity] = useState(searchParams.city || "all");
  const [category, setCategory] = useState(searchParams.category || "all");
  const [query, setQuery] = useState(searchParams.q || "");

  // Sync state if query params change externally
  useEffect(() => {
    setCity(searchParams.city || "all");
    setCategory(searchParams.category || "all");
    setQuery(searchParams.q || "");
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
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
          // Filter to only include boutique owners
          setBoutiques(data.filter((b: Boutique) => b.user_type !== "customer"));
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
        setLoading(false);
      }
    }
    fetchData();
  }, [apiBase]);

  // Apply filtering
  const filteredBoutiques = useMemo(() => {
    return boutiques.filter((b) => {
      const matchCity = city === "all" || b.city === city;
      const matchCategory =
        category === "all" ||
        (b.categories && b.categories.includes(category)) ||
        (b.services && b.services.includes(category));
      const matchName =
        !query ||
        b.boutique_name?.toLowerCase().includes(query.toLowerCase()) ||
        b.full_name?.toLowerCase().includes(query.toLowerCase());
      return matchCity && matchCategory && matchName;
    });
  }, [boutiques, city, category, query]);

  // Update query params when filter values change
  const handleFilterChange = (updates: Partial<SearchParams>) => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...updates,
      }),
    });
  };

  const clearFilters = () => {
    setCity("all");
    setCategory("all");
    setQuery("");
    navigate({
      search: {
        city: "all",
        category: "all",
        q: "",
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans flex flex-col justify-between">
      <div>
        <Navbar isDarkHeader={true} />
        
        {/* Header Hero Area */}
        <div className="relative pt-24 pb-12 lg:pt-32 lg:pb-16 bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-950 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(147,51,234,0.15),transparent_50%)]" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-3xl">
              <span className="text-accent font-bold text-sm tracking-widest uppercase">
                Boutique Directory
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-2">
                Explore Verified Boutiques
              </h1>
              <p className="mt-4 text-slate-300 text-base sm:text-lg">
                Discover exceptional craftspeople, tailors, and fashion designers in your neighborhood.
              </p>
            </div>
          </div>
        </div>

        {/* Search Results Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="grid lg:grid-cols-4 gap-8">
            
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-soft sticky top-24 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    <span>Search Filters</span>
                  </div>
                  {(city !== "all" || category !== "all" || query !== "") && (
                    <button
                      onClick={clearFilters}
                      className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> Clear All
                    </button>
                  )}
                </div>

                {/* Name search input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Boutique Name
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-primary transition-all rounded-xl"
                      placeholder="Search boutique name..."
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        handleFilterChange({ q: e.target.value });
                      }}
                    />
                  </div>
                </div>

                {/* City select dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Select City
                  </label>
                  <Select
                    value={city}
                    onValueChange={(val) => {
                      setCity(val);
                      handleFilterChange({ city: val });
                    }}
                  >
                    <SelectTrigger className="h-11 bg-slate-50/50 border-slate-200 rounded-xl">
                      <div className="flex items-center gap-2 text-slate-700">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        <SelectValue placeholder="All Cities" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">All Cities</SelectItem>
                      {cityList.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category select dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Specialty / Service
                  </label>
                  <Select
                    value={category}
                    onValueChange={(val) => {
                      setCategory(val);
                      handleFilterChange({ category: val });
                    }}
                  >
                    <SelectTrigger className="h-11 bg-slate-50/50 border-slate-200 rounded-xl">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Tag className="h-4 w-4 text-primary shrink-0" />
                        <SelectValue placeholder="All Specialties" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">All Specialties & Services</SelectItem>
                      {categoryList.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-[11px] text-slate-400 font-medium">
                  Showing {filteredBoutiques.length} of {boutiques.length} registered boutiques
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="lg:col-span-3 space-y-6">
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 rounded-3xl shadow-soft">
                  <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                  <p className="text-slate-500 font-medium">Loading boutiques catalog...</p>
                </div>
              ) : filteredBoutiques.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredBoutiques.map((b) => {
                    // Combine categories and services for tags display
                    const tags = Array.from(
                      new Set([...(b.categories || []), ...(b.services || [])]),
                    ).slice(0, 3);

                    return (
                      <div
                        key={b.id}
                        className="group flex flex-col justify-between bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-soft hover:shadow-elegant-lg hover:-translate-y-1.5 transition-all duration-300"
                      >
                        <div>
                          {/* Boutique profile banner header */}
                          <div className="flex items-center gap-4 mb-5">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-100 to-indigo-100 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-300">
                              <Store className="h-7 w-7" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors truncate">
                                {b.boutique_name || "Unnamed Boutique"}
                              </h3>
                              <p className="text-xs text-slate-500 font-semibold truncate">
                                Owner: {b.full_name || "N/A"}
                              </p>
                            </div>
                          </div>

                          {/* Location details */}
                          <div className="flex items-start gap-2 text-slate-600 text-sm mb-4">
                            <MapPin className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                            <span className="truncate">
                              {b.area ? `${b.area}, ` : ""}{b.city}
                            </span>
                          </div>

                          {/* Tags display */}
                          {tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 mb-6">
                              {tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 border border-primary/10 px-2.5 py-1 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="mb-6 h-[26px]" /> // Maintain height consistency
                          )}
                        </div>

                        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                            Verified Boutique
                          </span>
                          <Link to={`/boutique/${b.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="font-bold text-primary hover:bg-primary/5 gap-1 group/btn pr-2"
                            >
                              View Details
                              <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 bg-white border border-slate-200/80 rounded-3xl shadow-soft px-4">
                  <div className="mx-auto h-16 w-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6">
                    <Store className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">No boutiques found</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                    We couldn't find any boutiques matching your search filters. Try adjusting your inputs or clearing filters.
                  </p>
                  <Button
                    onClick={clearFilters}
                    className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl"
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
