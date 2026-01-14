import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Grid3x3,
  List,
  Newspaper,
  User,
  Globe,
  Sparkles,
  Hash
} from "lucide-react";

import {
  getAllPosts,
  getMyPosts,
} from "../../../AllStatesFeatures/SocialFeed/SocialFeedSlice";
import { Link } from "react-router-dom";
import Loading from "../../General/Loading";

export default function PostsFeed() {
  const dispatch = useDispatch();
  const [mode, setMode] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const currentUser =
    useSelector((state) => state?.auth?.user?.userId) ||
    localStorage.getItem("userId");
  const { posts, loading, error } = useSelector((state) => state.socialFeed);
  const isAuthenticated = useSelector((state) => state?.auth?.isAuthenticated);

  useEffect(() => {
    if (mode === "all") {
      dispatch(getAllPosts());
    } else {
      dispatch(getMyPosts());
    }
  }, [mode, dispatch]);

  const isEmpty = !posts || posts.length === 0;

  if (loading) {
    return <Loading color="border-t-orange-500" message="Loading Posts..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white p-6 mt-10 mb-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-3 rounded-xl shadow-lg">
              <Newspaper size={28} className="text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              Travel Stories
            </h1>
          </div>
          <p className="text-gray-400 ml-14">Discover amazing travel experiences from around the world</p>
        </div>

        {/* Controls Bar */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-4 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left: Mode Toggle */}
            <div className="flex items-center gap-4">
              <div className="bg-gray-900 rounded-xl p-1 flex border border-gray-700">
                <button
                  onClick={() => setMode("all")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all ${
                    mode === "all"
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <Globe size={18} strokeWidth={2} />
                  <span className="font-medium">All Posts</span>
                </button>
                {isAuthenticated && (
                  <button
                    onClick={() => setMode("mine")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all ${
                      mode === "mine"
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    <User size={18} strokeWidth={2} />
                    <span className="font-medium">My Posts</span>
                  </button>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="bg-gray-900 rounded-xl p-1 flex border border-gray-700">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-pink-500 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                  title="Grid view"
                >
                  <Grid3x3 size={18} strokeWidth={2} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-pink-500 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                  title="List view"
                >
                  <List size={18} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Right: Create Post */}
            {isAuthenticated && (
              <Link
                to="/create-post"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all font-semibold"
              >
                <Plus size={20} strokeWidth={2} />
                <span>Create Post</span>
              </Link>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8 flex items-center gap-3">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}

        {/* Empty State */}
        {isEmpty && !loading && !error && (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-12 text-center">
            <Newspaper size={64} className="text-gray-600 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-gray-400 text-lg mb-2">
              {mode === "mine" ? "You haven't posted anything yet" : "No posts found"}
            </p>
            {mode === "mine" && isAuthenticated && (
              <Link
                to="/create-post"
                className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
              >
                <Plus size={20} strokeWidth={2} />
                Create Your First Post
              </Link>
            )}
          </div>
        )}

        {/* Posts Grid/List */}
        <div className={viewMode === "grid" 
          ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" 
          : "space-y-6"
        }>
          {posts.length > 0 &&
            posts?.map((post) => (
              <Link
                key={post._id}
                to={`/post/${post._id}`}
                className="group"
              >
                <div className={`bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-gray-600 rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                  viewMode === "list" ? "flex flex-col md:flex-row my-2" : ""
                }`}>
                  {/* Cover Image */}
                  {post.images?.[0] && (
                    <div className={`relative overflow-hidden ${
                      viewMode === "list" ? "md:w-80 md:h-auto h-48" : "h-56"
                    }`}>
                      <img
                        src={post.images[0]}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  )}

                  {/* Content */}
                  <div className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
                    <h2 className="text-2xl font-bold mb-3 text-white group-hover:text-pink-400 transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    {/* Location & Date */}
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <div className="bg-pink-500/20 p-1.5 rounded-lg">
                          <MapPin size={14} className="text-pink-400" />
                        </div>
                        <span className="text-sm font-medium">{post.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <div className="bg-blue-500/20 p-1.5 rounded-lg">
                          <Calendar size={14} className="text-blue-400" />
                        </div>
                        <span className="text-sm font-medium">
                          {format(new Date(post.travelDate), "dd MMM yyyy")}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 mb-4">
                      {post.description}
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 4).map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 bg-gray-900/50 border border-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-full hover:border-pink-500 hover:text-pink-400 transition-all"
                          >
                            <Hash size={12} />
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 4 && (
                          <span className="inline-flex items-center gap-1 bg-pink-500/20 border border-pink-500/30 text-pink-400 text-xs px-3 py-1.5 rounded-full font-medium">
                            +{post.tags.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}