import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { Plus, MapPin, Calendar } from "lucide-react"; // Lucide icons

import {
  getAllPosts,
  getMyPosts,
} from "../../../AllStatesFeatures/SocialFeed/SocialFeedSlice";
import { Link } from "react-router-dom";
import Loading from "../../General/Loading";

export default function PostsFeed() {
  const dispatch = useDispatch();
  const [mode, setMode] = useState("all");
  const currentUser =
    useSelector((state) => state?.auth?.user?.userId) ||
    localStorage.getItem("userId");
  const { posts, loading, error } = useSelector((state) => state.socialFeed);

  // Fetch posts depending on mode
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
    <div className="bg-gray-900 min-h-screen text-white p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold">Travel Posts</h1>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="bg-gray-800 rounded-full p-1 flex w-64">
            <button
              onClick={() => setMode("all")}
              className={`flex-1 px-5 py-2 rounded-full transition ${
                mode === "all"
                  ? "bg-orange-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              All Posts
            </button>
            {currentUser && (
              <button
                onClick={() => setMode("mine")}
                className={`flex-1 px-5 py-2 rounded-full transition ${
                  mode === "mine"
                    ? "bg-orange-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                My Posts
              </button>
            )}
          </div>
        </div>

        {/* Right: Create Post */}
        {/* Right: Create Post */}
        {currentUser && (
          <Link
            to="/create-post"
            className="mt-4 md:mt-0 flex items-center justify-center gap-2
             w-full sm:w-auto h-12 px-4
             bg-orange-500 hover:bg-orange-600 text-white 
             rounded-lg shadow transition-all duration-200
             font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Create Post</span>
          </Link>
        )}
      </div>

      {/* Loading & Errors */}
      {error && <p className="text-center text-red-500">Error: {error}</p>}

      {/* Empty State */}
      {isEmpty && !loading && !error && (
        <p className="text-center text-gray-400">
          {mode === "mine"
            ? "You haven't posted anything yet."
            : "No posts found."}
        </p>
      )}

      {/* Posts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.length > 0 &&
          posts?.map((post) => (
            <div
              key={post._id}
              className="bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:scale-105 transform transition"
            >
              <Link to={`/post/${post._id}`}>
                {/* Cover Image */}
                {post.images?.[0] && (
                  <img
                    src={post.images[0]}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}

                {/* Content */}
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                  <p className="text-gray-400 text-sm flex items-center gap-2 mb-3">
                    <MapPin size={15} />
                    {post.location} &nbsp;|
                    <Calendar size={18} />{" "}
                    {format(new Date(post.travelDate), "dd MMM yyyy")}
                  </p>
                  <p className="text-sm text-gray-300 line-clamp-3">
                    {post.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {post.tags?.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-700 text-xs px-2 py-1 rounded-full border border-gray-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
}
