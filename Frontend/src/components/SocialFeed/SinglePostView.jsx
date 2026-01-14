import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSinglePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
} from "../../../AllStatesFeatures/SocialFeed/SocialFeedSlice";
import Loading from "../../General/Loading";
import { 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  Calendar, 
  MapPin, 
  Heart, 
  MessageCircle,
  ArrowLeft,
  Hash,
  Send,
  AlertTriangle,
  User,
  X
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";

export default function SinglePostView() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [commentText, setCommentText] = useState("");
  const [currentImage, setCurrentImage] = useState(0);

  const {
    singlePost: posts,
    loading,
    error,
    like,
    comments,
  } = useSelector((state) => state.socialFeed);

  const currentUser =
    localStorage.getItem("userId") ||
    useSelector((state) => state?.auth?.user?.userId);

  useEffect(() => {
    if (id) {
      dispatch(getSinglePost(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    setCurrentImage(0);
  }, [posts]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") prevImage();
      else if (e.key === "ArrowRight") nextImage();
      else if (e.key === "Escape") setShowConfirm(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [posts, currentImage]);

  const handleDelete = async () => {
    if (!selectedId) return toast.warn("Post Id Missing");
    setActionMsg("Deleting your post...");
    try {
      await dispatch(deletePost(selectedId, navigate));
      setShowConfirm(false);
    } catch (err) {
      toast.warn("Failed to delete post.");
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    dispatch(addComment(posts._id, commentText));
    setCommentText("");
    setActionMsg("Adding your comment...");
  };

  if (loading) {
    return <Loading message={actionMsg || "Loading post..."} color="border-t-pink-500" />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 px-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (!posts) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 px-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-md text-center">
          <MessageCircle size={64} className="text-gray-600 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-gray-400 text-lg">Post not found.</p>
        </div>
      </div>
    );
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? posts.images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev === posts.images.length - 1 ? 0 : prev + 1));
  };

  const isAuthor = posts?.author?.id?.toString() === currentUser?.toString();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white p-6 mt-10 mb-10">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link
          to="/post"
          className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 px-4 py-2.5 rounded-xl transition-all mb-6 font-medium"
        >
          <ArrowLeft size={18} strokeWidth={2} />
          Back to Posts
        </Link>

        {/* Main Content Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
          {/* Image Gallery */}
          {posts?.images?.length > 0 && (
            <div className="relative w-full h-[500px] bg-black">
              <img
                src={posts.images[currentImage]}
                alt={posts.title}
                className="w-full h-full object-contain"
              />

              {posts?.images?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/70 hover:bg-black/90 p-3 rounded-full transition-all shadow-lg"
                  >
                    <ChevronLeft size={24} className="text-white" strokeWidth={2} />
                  </button>

                  <button
                    onClick={nextImage}
                    className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/70 hover:bg-black/90 p-3 rounded-full transition-all shadow-lg"
                  >
                    <ChevronRight size={24} className="text-white" strokeWidth={2} />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 px-3 py-2 rounded-full backdrop-blur-sm">
                    {posts.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImage(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === currentImage ? "bg-pink-500 w-6" : "bg-gray-400 hover:bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="absolute top-4 right-4 bg-black/70 px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
                    {currentImage + 1} / {posts.images.length}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Content Section */}
          <div className="p-8">
            {/* Title */}
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              {posts.title}
            </h1>

            {/* Location & Date */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2 bg-pink-500/20 border border-pink-500/30 px-4 py-2 rounded-xl">
                <MapPin size={16} className="text-pink-400" />
                <span className="text-gray-300 font-medium">{posts.location}</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 px-4 py-2 rounded-xl">
                <Calendar size={16} className="text-blue-400" />
                <span className="text-gray-300 font-medium">
                  {posts?.travelDate
                    ? format(parseISO(posts.travelDate), "dd MMM yyyy")
                    : "Date not available"}
                </span>
              </div>
            </div>

            {/* Tags */}
            {posts?.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {posts.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-gray-900/50 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-full text-sm hover:border-pink-500 hover:text-pink-400 transition-all"
                  >
                    <Hash size={14} />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            {isAuthor && (
              <div className="flex flex-wrap gap-3 mb-6 pb-6 border-b border-gray-700">
                <button
                  onClick={() => navigate(`/post/update/${posts._id}`)}
                  className="flex items-center gap-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 hover:border-orange-500 text-orange-400 px-4 py-2.5 rounded-xl transition-all font-medium"
                >
                  <Edit3 size={18} strokeWidth={2} />
                  Edit Post
                </button>
                <button
                  onClick={() => {
                    setSelectedId(posts._id);
                    setShowConfirm(true);
                  }}
                  className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500 text-red-400 px-4 py-2.5 rounded-xl transition-all font-medium"
                >
                  <Trash2 size={18} strokeWidth={2} />
                  Delete Post
                </button>
              </div>
            )}

            {/* Description */}
            <p className="text-lg text-gray-300 leading-relaxed mb-8 whitespace-pre-line">
              {posts.description}
            </p>

            {/* Like Button */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => dispatch(toggleLike(posts._id))}
                disabled={!currentUser}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all font-semibold ${
                  like?.liked
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                    : "bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300"
                } ${!currentUser ? "cursor-not-allowed opacity-50" : "hover:scale-105"}`}
              >
                <Heart 
                  size={20} 
                  strokeWidth={2} 
                  fill={like?.liked ? "currentColor" : "none"}
                />
                <span>{like?.likesCount || 0} {like?.likesCount === 1 ? "Like" : "Likes"}</span>
              </button>
            </div>

            {/* Comments Section */}
            {currentUser && (
              <div className="border-t border-gray-700 pt-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <MessageCircle size={24} className="text-pink-400" />
                  Comments ({comments?.length || 0})
                </h2>

                {/* Comment Input */}
                <form onSubmit={handleCommentSubmit} className="mb-8">
                  <div className="flex gap-3">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-xl transition-all font-semibold disabled:cursor-not-allowed shadow-lg"
                    >
                      <Send size={18} strokeWidth={2} />
                      Post
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments?.map((comment) => (
                    <div
                      key={comment._id}
                      className="bg-gray-900/50 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="bg-pink-500/20 p-2 rounded-full">
                              <User size={16} className="text-pink-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-white">{comment.user.name}</p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(comment.createdAt), "dd MMM yyyy, HH:mm")}
                              </p>
                            </div>
                          </div>
                          <p className="text-gray-300 leading-relaxed">{comment.text}</p>
                        </div>
                        {comment.user.id === currentUser && (
                          <button
                            onClick={() => {
                              dispatch(deleteComment(posts._id, comment._id, navigate));
                              setActionMsg("Deleting comment...");
                            }}
                            className="flex-shrink-0 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500 text-red-400 p-2 rounded-lg transition-all"
                          >
                            <Trash2 size={18} strokeWidth={2} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {comments?.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No comments yet. Be the first to comment!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-gray-800 border border-gray-700 text-white p-6 rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500/20 p-3 rounded-xl">
                <AlertTriangle size={24} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold">Delete This Post?</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}