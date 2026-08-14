import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchLikedPosts } from "../../../AllStatesFeatures/SocialFeed/likedPostsSlice";
import { toggleLike } from "../../../AllStatesFeatures/SocialFeed/SocialFeedSlice";
import Loading from "../../General/Loading";
import { Heart, MessageCircle, ArrowLeft, Trash2 } from "lucide-react";

function PostCard({ post, onUnlike }) {
    const [isUnliking, setIsUnliking] = useState(false);
    const handleUnlike = async () => {
        setIsUnliking(true);
        await onUnlike(post._id);
        setIsUnliking(false);
    };
    return (
        <div className="bg-white rounded-2xl border border-orange-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
            {post.images?.[0] && (
                <div className="h-48 overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50">
                    <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </div>
            )}
            <div className="p-5 space-y-3">
                <div className="space-y-1">
                    <Link to={`/post/${post._id}`} className="text-base font-bold text-stone-800 hover:text-orange-600 transition-colors line-clamp-2">{post.title}</Link>
                    <p className="text-xs text-stone-500 flex items-center gap-1">{post.author?.name || "Anonymous"}</p>
                </div>
                <p className="text-sm text-stone-600 line-clamp-2">{post.description}</p>
                <div className="flex items-center gap-3 text-xs text-stone-500 pt-2 border-t border-orange-100">
                    <span className="flex items-center gap-1"><Heart size={14} />{post.likes?.length || 0}</span>
                    <span className="flex items-center gap-1"><MessageCircle size={14} />{post.comments?.length || 0}</span>
                    <span className="ml-auto">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2 pt-2">
                    <Link to={`/post/${post._id}`} className="flex-1 px-3 py-2 rounded-lg bg-orange-100 text-orange-600 font-medium text-sm hover:bg-orange-200 transition-colors text-center">View</Link>
                    <button onClick={handleUnlike} disabled={isUnliking} className="px-3 py-2 rounded-lg bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 transition-colors disabled:opacity-50">Unlike</button>
                </div>
            </div>
        </div>
    );
}

export default function LikedPostsPage() {
    const dispatch = useDispatch();
    const { items: likedPosts, loading, error } = useSelector((s) => s.likedPosts || {});
    const { user } = useSelector((s) => s.auth);
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (user?.userId) dispatch(fetchLikedPosts({ page, limit: 12 }));
    }, [dispatch, page, user?.userId]);

    const handleUnlike = async (postId) => {
        await dispatch(toggleLike(postId));
        dispatch(fetchLikedPosts({ page, limit: 12 }));
    };

    if (!user) return (
        <div className="min-h-screen bg-orange-50 py-10 px-4 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 text-center max-w-md">
                <h2 className="text-xl font-bold text-stone-800 mb-2">Sign in to view liked posts</h2>
            </div>
        </div>
    );

    if (loading && (!likedPosts || likedPosts.length === 0)) return <Loading color="border-t-orange-500" message="Loading liked posts…" />;

    if (error) return (
        <div className="min-h-screen bg-orange-50 py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <Link to="/post" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 text-sm font-medium mb-6 transition-colors"><ArrowLeft size={16} />Back to Feed</Link>
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"><p className="text-red-600 font-medium">{error}</p></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-orange-50 py-10 px-4">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center"><Heart size={18} className="text-orange-600" strokeWidth={2} /></div>
                        <h1 className="text-3xl font-bold text-stone-800">Liked Posts</h1>
                    </div>
                </div>

                {likedPosts && likedPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {likedPosts.map((post) => <PostCard key={post._id} post={post} onUnlike={handleUnlike} />)}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-orange-200 p-16 text-center">
                        <h3 className="text-lg font-bold text-stone-800 mb-2">No liked posts yet</h3>
                        <p className="text-stone-600 mb-6">Like posts to see them here</p>
                    </div>
                )}
            </div>
        </div>
    );
}
