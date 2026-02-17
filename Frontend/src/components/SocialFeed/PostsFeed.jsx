import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus, MapPin, Calendar, Grid3x3, List,
  Newspaper, User, Globe, Hash, ArrowRight,
} from "lucide-react";
import { getAllPosts, getMyPosts } from "../../../AllStatesFeatures/SocialFeed/SocialFeedSlice";
import { Link } from "react-router-dom";
import Loading from "../../General/Loading";
import { FaPlane } from "react-icons/fa";

/* ══════════════════════════════════════════
   GRID CARD
═══════════════════════════════════════════ */
const GridCard = ({ post }) => (
  <Link to={`/post/${post._id}`} className="group block">
    <div className="bg-white border border-orange-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-orange-300 transition-all duration-300 hover:-translate-y-1 flex flex-col">

      {/* Image */}
      {post.images?.[0] ? (
        <div className="relative h-52 overflow-hidden flex-shrink-0">
          <img
            src={post.images[0]}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 via-transparent to-transparent" />
          {post.location && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-orange-100 px-2.5 py-1 rounded-full">
              <MapPin size={10} className="text-orange-500" />
              <span className="text-xs font-semibold text-stone-700 truncate max-w-[130px]">{post.location}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="h-28 flex-shrink-0 bg-orange-50 flex items-center justify-center border-b border-orange-100">
          <Newspaper size={32} className="text-orange-200" strokeWidth={1.5} />
        </div>
      )}

      {/* Body */}
      <div className="px-5 py-4 flex-1 flex flex-col">
        <h2 className="font-bold text-stone-900 group-hover:text-orange-500 transition-colors line-clamp-2 leading-snug text-base mb-2">
          {post.title}
        </h2>

        <div className="flex items-center gap-1.5 mb-3">
          <Calendar size={11} className="text-orange-400" />
          <span className="text-xs font-medium text-stone-400">
            {format(new Date(post.travelDate), "dd MMM yyyy")}
          </span>
        </div>

        <p className="text-stone-400 text-xs leading-relaxed line-clamp-3 mb-4 flex-1">
          {post.description}
        </p>

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 bg-orange-50 border border-orange-200 text-stone-500 text-xs px-2 py-0.5 rounded-full font-medium"
              >
                <Hash size={9} />{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-1 text-xs font-bold text-orange-500 group-hover:gap-2 transition-all">
          Read Story <ArrowRight size={13} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  </Link>
);

/* ══════════════════════════════════════════
   LIST CARD
═══════════════════════════════════════════ */
const ListCard = ({ post }) => (
  <Link to={`/post/${post._id}`} className="group block">
    <div className="bg-white border border-orange-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-orange-300 transition-all duration-300">
      <div className="flex flex-col md:flex-row">

        {/* Image */}
        {post.images?.[0] ? (
          <div className="relative md:w-64 lg:w-72 h-48 md:h-auto overflow-hidden flex-shrink-0">
            <img
              src={post.images[0]}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-stone-900/10 hidden md:block" />
          </div>
        ) : (
          <div className="md:w-48 h-28 md:h-auto bg-orange-50 flex items-center justify-center flex-shrink-0 border-r border-orange-100">
            <Newspaper size={28} className="text-orange-200" strokeWidth={1.5} />
          </div>
        )}

        {/* Divider */}
        <div className="hidden md:block w-px bg-orange-100 flex-shrink-0" />

        {/* Content */}
        <div className="flex-1 px-6 py-5 flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-stone-900 group-hover:text-orange-500 transition-colors leading-snug text-xl mb-3">
              {post.title}
            </h2>

            <div className="flex flex-wrap gap-4 mb-3">
              {post.location && (
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-6 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin size={11} className="text-orange-500" />
                  </span>
                  <span className="text-xs font-medium text-stone-500">{post.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-6 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar size={11} className="text-orange-500" />
                </span>
                <span className="text-xs font-medium text-stone-500">
                  {format(new Date(post.travelDate), "dd MMM yyyy")}
                </span>
              </div>
            </div>

            <p className="text-stone-400 text-sm leading-relaxed line-clamp-2 mb-4">
              {post.description}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex flex-wrap gap-1.5">
              {post.tags?.slice(0, 4).map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 bg-orange-50 border border-orange-200 text-stone-500 text-xs px-2.5 py-1 rounded-full font-medium hover:border-orange-400 hover:text-orange-500 transition-all"
                >
                  <Hash size={9} />{tag}
                </span>
              ))}
              {post.tags?.length > 4 && (
                <span className="bg-orange-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                  +{post.tags.length - 4}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-500 group-hover:gap-2.5 transition-all whitespace-nowrap">
              Read Story <ArrowRight size={13} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Link>
);

/* ══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function PostsFeed() {
  const dispatch = useDispatch();
  const [mode, setMode] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  const { posts, loading, error } = useSelector((state) => state.socialFeed);
  const isAuthenticated = useSelector((state) => state?.auth?.isAuthenticated);

  useEffect(() => {
    if (mode === "all") dispatch(getAllPosts());
    else dispatch(getMyPosts());
  }, [mode, dispatch]);

  const isEmpty = !posts || posts.length === 0;

  if (loading) return <Loading color="border-t-orange-500" message="Loading Posts..." />;

  return (
    <div className="min-h-screen bg-orange-50 pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white border border-orange-200 rounded-full px-4 py-1.5 mb-4">
            <FaPlane className="text-orange-400 text-xs" />
            <span className="text-xs font-bold tracking-widest text-stone-400 uppercase">Travel Stories</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-stone-900 mb-2">
            Travel <span className="text-orange-500">Stories</span>
          </h1>
          <p className="text-stone-400 text-sm">Discover amazing travel experiences from around the world</p>
        </div>

        {/* Controls Bar */}
        <div className="bg-white border border-orange-200 rounded-2xl px-5 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Feed toggle */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-1 flex gap-1">
              <button
                onClick={() => setMode("all")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                  mode === "all" ? "bg-orange-500 text-white shadow-sm" : "text-stone-500 hover:text-orange-500"
                }`}
              >
                <Globe size={13} /> All Posts
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => setMode("mine")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                    mode === "mine" ? "bg-orange-500 text-white shadow-sm" : "text-stone-500 hover:text-orange-500"
                  }`}
                >
                  <User size={13} /> My Posts
                </button>
              )}
            </div>

            {/* View toggle */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-1 flex gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid" ? "bg-orange-500 text-white" : "text-stone-400 hover:text-orange-500"
                }`}
              >
                <Grid3x3 size={15} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list" ? "bg-orange-500 text-white" : "text-stone-400 hover:text-orange-500"
                }`}
              >
                <List size={15} />
              </button>
            </div>

            {posts?.length > 0 && (
              <span className="text-xs font-semibold text-stone-400">
                {posts.length} post{posts.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {isAuthenticated && (
            <Link
              to="/create-post"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide shadow-sm transition-all"
            >
              <Plus size={14} strokeWidth={2.5} />
              Create Post
            </Link>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-white border border-red-200 rounded-xl px-5 py-4 mb-6">
            <p className="text-red-500 font-semibold text-sm">Error: {error}</p>
          </div>
        )}

        {/* Empty state */}
        {isEmpty && !loading && !error && (
          <div className="bg-white border border-orange-200 rounded-2xl px-8 py-16 text-center shadow-sm">
            <Newspaper size={44} className="text-orange-200 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-stone-700 font-bold text-lg mb-2">
              {mode === "mine" ? "No Posts Yet" : "No Stories Found"}
            </p>
            <p className="text-stone-400 text-sm mb-6">
              {mode === "mine"
                ? "You haven't posted anything yet"
                : "Be the first to share a travel story!"}
            </p>
            {mode === "mine" && isAuthenticated && (
              <Link
                to="/create-post"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition-all"
              >
                <Plus size={16} strokeWidth={2.5} />
                Create Your First Post
              </Link>
            )}
          </div>
        )}

        {/* Posts */}
        {posts?.length > 0 && (
          <div className={
            viewMode === "grid"
              ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-5"
          }>
            {posts.map((post) =>
              viewMode === "grid"
                ? <GridCard key={post._id} post={post} />
                : <ListCard key={post._id} post={post} />
            )}
          </div>
        )}

      </div>
    </div>
  );
}