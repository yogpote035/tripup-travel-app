import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchSavedPosts, toggleBookmark } from "../../../AllStatesFeatures/SocialFeed/savedPostsSlice";
import Loading from "../../General/Loading";
import { Bookmark, Heart, MessageCircle, Share2, ArrowLeft, Trash2 } from "lucide-react";

// Post card component
function PostCard({ post, onRemove }) {
    const [isRemoving, setIsRemoving] = useState(false);

    const handleRemoveBookmark = async () => {
        setIsRemoving(true);
        await onRemove(post._id);
        setIsRemoving(false);
    };

    return (
        <div className="bg-white rounded-2xl border border-orange-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
            {/* Image */}
            {post.images?.[0] && (
                <div className="h-48 overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50">
                    <img
                        src={post.images[0]}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                </div>
            )}

            {/* Content */}
            <div className="p-5 space-y-3">
                <div className="space-y-1">
                    <Link
                        to={`/post/${post._id}`}
                        className="text-base font-bold text-stone-800 hover:text-orange-600 transition-colors line-clamp-2"
                    >
                        {post.title}
                    </Link>
                    <p className="text-xs text-stone-500 flex items-center gap-1">
                        {post.author?.name || "Anonymous"}
                    </p>
                </div>

                <p className="text-sm text-stone-600 line-clamp-2">
                    {post.description}
                </p>

                {/* Location */}
                {post.location && (
                    <p className="text-xs text-orange-600 font-medium">
                        📍 {post.location}
                    </p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-stone-500 pt-2 border-t border-orange-100">
                    <span className="flex items-center gap-1">
                        <Heart size={14} />
                        {post.likes?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                        <MessageCircle size={14} />
                        {post.comments?.length || 0}
                    </span>
                    <span className="ml-auto">
                        {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <Link
                        to={`/post/${post._id}`}
                        className="flex-1 px-3 py-2 rounded-lg bg-orange-100 text-orange-600 font-medium text-sm hover:bg-orange-200 transition-colors text-center"
                    >
                        View
                    </Link>
                    <button
                        onClick={handleRemoveBookmark}
                        disabled={isRemoving}
                        className="px-3 py-2 rounded-lg bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
                        title="Remove bookmark"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Main component
export default function SavedPostsPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: savedPosts, loading, error, pagination } = useSelector(
        (state) => state.savedPosts
    );
    const { user } = useSelector((state) => state.auth);
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (user?.userId) {
            dispatch(fetchSavedPosts({ page, limit: 12 }));
        }
    }, [dispatch, page, user?.userId]);

    const handleRemoveBookmark = (postId) => {
        return dispatch(toggleBookmark(postId));
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-orange-50 py-10 px-4 flex items-center justify-center">
                <div className="bg-white rounded-2xl p-8 text-center max-w-md">
                    <Bookmark size={48} className="mx-auto mb-4 text-orange-400" strokeWidth={1.5} />
                    <h2 className="text-xl font-bold text-stone-800 mb-2">Sign in to view saved posts</h2>
                    <p className="text-stone-600 mb-6">You need to be logged in to see your bookmarked posts.</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="px-6 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (loading && savedPosts.length === 0) {
        return <Loading color="border-t-orange-500" message="Loading your saved posts…" />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-orange-50 py-10 px-4">
                <div className="max-w-4xl mx-auto">
                    <Link
                        to="/post"
                        className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 text-sm font-medium mb-6 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Feed
                    </Link>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-600 font-medium">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-orange-50 py-10 px-4">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <Link
                        to="/post"
                        className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 text-sm font-medium transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Feed
                    </Link>

                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                <Bookmark size={18} className="text-orange-600" strokeWidth={2} />
                            </div>
                            <h1 className="text-3xl font-bold text-stone-800">Saved Posts</h1>
                        </div>
                        <p className="text-stone-600">
                            {pagination?.total ? `${pagination.total} posts saved` : "No saved posts yet"}
                        </p>
                    </div>
                </div>

                {/* Posts Grid */}
                {savedPosts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedPosts.map((post) => (
                                <PostCard
                                    key={post._id}
                                    post={post}
                                    onRemove={handleRemoveBookmark}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination?.pages > 1 && (
                            <div className="flex items-center justify-center gap-4 pt-8 border-t border-orange-200">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 rounded-lg bg-white border border-orange-200 text-stone-700 font-medium hover:bg-orange-50 disabled:opacity-50 transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="text-stone-600 font-medium">
                                    Page {page} of {pagination.pages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                                    disabled={page === pagination.pages}
                                    className="px-4 py-2 rounded-lg bg-white border border-orange-200 text-stone-700 font-medium hover:bg-orange-50 disabled:opacity-50 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-2xl border border-orange-200 p-16 text-center">
                        <Bookmark size={48} className="mx-auto mb-4 text-orange-300" strokeWidth={1.5} />
                        <h3 className="text-lg font-bold text-stone-800 mb-2">No saved posts yet</h3>
                        <p className="text-stone-600 mb-6">Start bookmarking posts to see them here</p>
                        <Link
                            to="/social-feed"
                            className="inline-block px-6 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                        >
                            Browse Feed
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
