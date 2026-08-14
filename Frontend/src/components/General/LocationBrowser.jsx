import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
    fetchLocations,
    searchLocations,
    fetchPopularLocations,
} from "../../../AllStatesFeatures/Location/locationSlice";
import Loading from "../../General/Loading";
import { Search, MapPin, Star, ArrowLeft, Filter, Users, MessageSquare } from "lucide-react";

// Location card component
function LocationCard({ location }) {
    return (
        <Link
            to={`/location/${location._id}`}
            className="group bg-white rounded-2xl border border-orange-200 overflow-hidden shadow-sm hover:shadow-lg transition-all"
        >
            {/* Image */}
            {location.images?.[0] && (
                <div className="h-40 overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50 relative">
                    <img
                        src={location.images[0]}
                        alt={location.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    {location.isPopular && (
                        <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            Popular
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="p-5 space-y-3">
                <div className="space-y-1">
                    <h3 className="text-base font-bold text-stone-800 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {location.name}
                    </h3>
                    <p className="text-xs text-stone-500">
                        {location.category || "Destination"}
                    </p>
                </div>

                <p className="text-sm text-stone-600 line-clamp-2">
                    {location.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-orange-100">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-orange-600 font-bold">
                            <Star size={14} />
                            {(typeof location.avgRating === "number" ? location.avgRating.toFixed(1) : "N/A")}
                        </div>
                        <p className="text-stone-400">{location.reviewCount || 0} reviews</p>
                    </div>
                    <div className="text-center border-l border-r border-orange-100">
                        <div className="flex items-center justify-center gap-1 text-stone-600 font-bold">
                            <MessageSquare size={14} />
                            {location.postCount || 0}
                        </div>
                        <p className="text-stone-400">posts</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-stone-600 font-bold">
                            <Users size={14} />
                            {location.visitorCount || 0}
                        </div>
                        <p className="text-stone-400">visited</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// Main component
export default function LocationBrowser() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
        locations,
        popularLocations,
        loading,
        error,
        searchResults,
    } = useSelector((state) => state.locations);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [sortBy, setSortBy] = useState("rating");
    const [showSearch, setShowSearch] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [displayedLocations, setDisplayedLocations] = useState([]);

    useEffect(() => {
        if (!locations.length) {
            dispatch(fetchLocations({ limit: 50 }));
        }
        if (!popularLocations.length) {
            dispatch(fetchPopularLocations());
        }
    }, [dispatch, locations.length, popularLocations.length]);

    useEffect(() => {
        const query = searchTerm.trim();
        if (query.length >= 2) {
            setSearchLoading(true);
            const timer = window.setTimeout(() => {
                dispatch(searchLocations(query)).finally(() => setSearchLoading(false));
                setShowSearch(true);
            }, 250);
            return () => window.clearTimeout(timer);
        }

        setSearchLoading(false);
        if (!query) {
            setShowSearch(false);
        }
    }, [searchTerm, dispatch]);

    // Update displayed locations based on filters
    useEffect(() => {
        let result = showSearch ? searchResults : locations;

        if (filterCategory && !showSearch) {
            result = result.filter(
                (loc) =>
                    loc.category?.toLowerCase() === filterCategory.toLowerCase()
            );
        }

        result = Array.isArray(result) ? [...result] : [];

        if (sortBy === "rating") {
            result.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
        } else if (sortBy === "popular") {
            result.sort((a, b) => (b.postCount || 0) - (a.postCount || 0));
        } else if (sortBy === "recent") {
            result.sort(
                (a, b) =>
                    new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            );
        }

        setDisplayedLocations(result);
    }, [locations, searchResults, filterCategory, sortBy, showSearch]);

    const handleSearch = (e) => {
        e.preventDefault();
        const query = searchTerm.trim();
        if (query.length >= 2) {
            setSearchLoading(true);
            dispatch(searchLocations(query)).finally(() => setSearchLoading(false));
            setShowSearch(true);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        setShowSearch(false);
        setSearchLoading(false);
    };

    if (loading && locations.length === 0) {
        return <Loading color="border-t-orange-500" message="Loading locations…" />;
    }

    return (
        <div className="min-h-screen bg-orange-50 py-10 px-4">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 text-sm font-medium transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back Home
                    </Link>

                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                <MapPin size={18} className="text-orange-600" strokeWidth={2} />
                            </div>
                            <h1 className="text-3xl font-bold text-stone-800">Explore Locations</h1>
                        </div>
                        <p className="text-stone-600">
                            Discover travel destinations and see what others are sharing
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                <form
                    onSubmit={handleSearch}
                    className="bg-white rounded-2xl border border-orange-200 p-4 shadow-sm"
                >
                    <div className="flex gap-2 flex-col sm:flex-row">
                        <div className="flex-1 relative">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none"
                            />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search locations by name or description…"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                                onFocus={() => {
                                    if (searchTerm.trim().length >= 2) setShowSearch(true);
                                }}
                            />
                            {searchTerm.trim().length >= 2 && (
                                <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-orange-200 bg-white shadow-xl">
                                    {searchLoading ? (
                                        <div className="p-3 text-sm text-stone-500">Searching locations…</div>
                                    ) : searchResults && searchResults.length > 0 ? (
                                        searchResults.slice(0, 8).map((location) => (
                                            <button
                                                key={location._id}
                                                type="button"
                                                onClick={() => {
                                                    navigate(`/location/${location._id}`);
                                                }}
                                                className="w-full text-left px-4 py-3 text-sm text-stone-800 hover:bg-orange-50"
                                            >
                                                <span className="font-semibold">{location.name}</span>
                                                <span className="block text-xs text-stone-500">{location.category || "Destination"}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-3 text-sm text-stone-500">No locations found.</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                            >
                                Search
                            </button>
                            {showSearch && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="px-4 py-2.5 bg-gray-100 text-stone-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </form>

                {/* Filters */}
                <div className="flex gap-3 flex-wrap items-center">
                    <Filter size={16} className="text-stone-600" />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-white border border-orange-200 text-stone-700 text-sm focus:outline-none focus:border-orange-400"
                    >
                        <option value="">All Categories</option>
                        <option value="Beach">Beach</option>
                        <option value="Mountain">Mountain</option>
                        <option value="City">City</option>
                        <option value="Heritage">Heritage</option>
                        <option value="Adventure">Adventure</option>
                        <option value="Cultural">Cultural</option>
                        <option value="Nature">Nature</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-white border border-orange-200 text-stone-700 text-sm focus:outline-none focus:border-orange-400"
                    >
                        <option value="rating">Top Rated</option>
                        <option value="popular">Most Popular</option>
                        <option value="recent">Recently Added</option>
                    </select>

                    <span className="text-xs text-stone-500 ml-auto">
                        {displayedLocations.length} location{displayedLocations.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Popular Locations Section */}
                {!showSearch && popularLocations.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Star size={18} className="text-orange-500" strokeWidth={2} />
                            <h2 className="text-xl font-bold text-stone-800">Popular Right Now</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {popularLocations.slice(0, 4).map((location) => (
                                <LocationCard key={location._id} location={location} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-600 font-medium">{error}</p>
                    </div>
                )}

                {/* Locations Grid */}
                {displayedLocations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedLocations.map((location) => (
                            <LocationCard key={location._id} location={location} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-orange-200 p-16 text-center">
                        <MapPin size={48} className="mx-auto mb-4 text-orange-300" strokeWidth={1.5} />
                        <h3 className="text-lg font-bold text-stone-800 mb-2">No locations found</h3>
                        <p className="text-stone-600 mb-6">
                            {showSearch
                                ? "Try adjusting your search terms"
                                : "No locations match your filters"}
                        </p>
                        {showSearch && (
                            <button
                                onClick={handleClearSearch}
                                className="inline-block px-6 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
