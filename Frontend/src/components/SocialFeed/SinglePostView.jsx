import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSinglePost,
  deletePost,
  toggleLike,
  toggleBookmark,
  addComment,
  deleteComment,
  reviewLocation,
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
  Bookmark,
  Star,
  Eye,
  Lock,
  Users,
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
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const { singlePost: posts, loading, error, like, bookmark, comments } =
    useSelector((state) => state.socialFeed);

  const currentUser =
    localStorage.getItem("userId") ||
    useSelector((state) => state?.auth?.user?.userId);

  useEffect(() => { if (id) dispatch(getSinglePost(id)); }, [id, dispatch]);
  useEffect(() => { setCurrentImage(0); }, [posts]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prevImage();
      else if (e.key === "ArrowRight") nextImage();
      else if (e.key === "Escape") setShowConfirm(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [posts, currentImage]);

  const handleDelete = async () => {
    if (!selectedId) return toast.warn("Post ID missing");
    setActionMsg("Deleting post…");
    try {
      await dispatch(deletePost(selectedId, navigate));
      setShowConfirm(false);
    } catch {
      toast.warn("Failed to delete post.");
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    dispatch(addComment(posts._id, commentText));
    setCommentText("");
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    dispatch(reviewLocation(posts._id, { rating: reviewRating, review: reviewText }));
    setReviewText("");
  };

  const prevImage = () =>
    setCurrentImage((p) => (p === 0 ? posts.images.length - 1 : p - 1));
  const nextImage = () =>
    setCurrentImage((p) => (p === posts.images.length - 1 ? 0 : p + 1));

  if (loading)
    return <Loading message={actionMsg || "Loading…"} color="border-t-orange-500" />;

  if (error)
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6">
        <div className="bg-white border border-orange-200 rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
          <AlertTriangle size={32} className="text-orange-400 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-stone-500 text-sm">{error}</p>
        </div>
      </div>
    );

  if (!posts)
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6">
        <div className="bg-white border border-orange-200 rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
          <MessageCircle size={32} className="text-stone-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-stone-500 text-sm">Post not found.</p>
        </div>
      </div>
    );

  const isAuthor = posts?.author?.id?.toString() === currentUser?.toString();
  const visibilityBadge =
    posts?.visibility === "private"
      ? { label: "Private", icon: Lock }
      : posts?.visibility === "followers"
        ? { label: "Followers", icon: Users }
        : { label: "Public", icon: Eye };
  const VisibilityIcon = visibilityBadge.icon;

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Back */}
        <Link
          to="/post"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Back to posts
        </Link>

        {/* Card */}
        <div className="bg-white border border-orange-200 rounded-2xl overflow-hidden shadow-sm">

          {/* Image gallery */}
          {posts?.images?.length > 0 && (
            <div className="relative w-full h-80 bg-stone-100">
              <img
                src={posts.images[currentImage]}
                alt={posts.title}
                className="w-full h-full object-cover"
              />
              {posts.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/90 hover:bg-white border border-orange-200 p-2 rounded-lg shadow-sm transition-all active:scale-95"
                  >
                    <ChevronLeft size={15} className="text-stone-700" strokeWidth={2} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/90 hover:bg-white border border-orange-200 p-2 rounded-lg shadow-sm transition-all active:scale-95"
                  >
                    <ChevronRight size={15} className="text-stone-700" strokeWidth={2} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {posts.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImage(idx)}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === currentImage
                            ? "bg-orange-500 w-5"
                            : "bg-white/70 hover:bg-white w-1.5"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="absolute top-3 right-3 bg-stone-900/60 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    {currentImage + 1} / {posts.images.length}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">

            {/* Title */}
            <h1 className="text-2xl font-bold text-stone-800 mb-3">{posts.title}</h1>

            {/* Location & date */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 text-sm text-stone-500 font-medium">
                <MapPin size={14} className="text-orange-400" />
                {posts.location}
              </span>
              <span className="text-stone-300">·</span>
              <span className="inline-flex items-center gap-1.5 text-sm text-stone-500 font-medium">
                <Calendar size={14} className="text-orange-400" />
                {posts?.travelDate
                  ? format(parseISO(posts.travelDate), "dd MMM yyyy")
                  : "Date not set"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 text-sm text-stone-500 font-medium bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
                <VisibilityIcon size={14} className="text-orange-400" />
                {visibilityBadge.label}
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-stone-500 font-medium bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
                <Star size={14} className="text-orange-400" />
                {posts?.locationRating ? posts.locationRating.toFixed(1) : "No ratings yet"}
              </span>
            </div>

            {/* Tags */}
            {posts?.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {posts.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-500 px-2.5 py-1 rounded-lg text-xs font-medium"
                  >
                    <Hash size={10} strokeWidth={2.5} />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line mb-6">
              {posts.description}
            </p>

            {/* Author */}
            <div className="flex items-center gap-2 mb-6 pb-6 border-b border-orange-100">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <User size={14} className="text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-700">{posts?.author?.name || "Traveller"}</p>
                <p className="text-xs text-stone-400">Author</p>
              </div>

              {/* Author actions pushed right */}
              {isAuthor && (
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() => navigate(`/post/update/${posts._id}`)}
                    className="flex items-center gap-1.5 border border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-stone-600 hover:text-stone-800 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  >
                    <Edit3 size={13} strokeWidth={2} />
                    Edit
                  </button>
                  <button
                    onClick={() => { setSelectedId(posts._id); setShowConfirm(true); }}
                    className="flex items-center gap-1.5 border border-red-100 hover:border-red-300 hover:bg-red-50 text-red-400 hover:text-red-500 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  >
                    <Trash2 size={13} strokeWidth={2} />
                    Delete
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => dispatch(toggleLike(posts._id))}
                disabled={!currentUser}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  like?.liked
                    ? "bg-orange-500 hover:bg-orange-400 text-white"
                    : "bg-white border border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-stone-600"
                } ${!currentUser ? "opacity-50 cursor-not-allowed" : "active:scale-95"}`}
              >
                <Heart size={14} strokeWidth={2} fill={like?.liked ? "currentColor" : "none"} />
                {like?.likesCount || 0} {like?.likesCount === 1 ? "like" : "likes"}
              </button>
              <button
                onClick={() => dispatch(toggleBookmark(posts._id))}
                disabled={!currentUser}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  bookmark?.bookmarked
                    ? "bg-stone-900 hover:bg-stone-800 text-white"
                    : "bg-white border border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-stone-600"
                } ${!currentUser ? "opacity-50 cursor-not-allowed" : "active:scale-95"}`}
              >
                <Bookmark size={14} strokeWidth={2} fill={bookmark?.bookmarked ? "currentColor" : "none"} />
                {bookmark?.bookmarksCount || 0} saved
              </button>
            </div>
          </div>

          <div className="border-t border-orange-100 px-6 py-6 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-stone-700 flex items-center gap-2 mb-3">
                <Star size={14} className="text-orange-500" />
                Location Review
              </h2>
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setReviewRating(value)}
                      className={`rounded-full px-3 py-1.5 text-sm font-semibold border transition-all ${reviewRating === value ? "bg-orange-500 text-white border-orange-500" : "bg-white border-orange-200 text-stone-600 hover:border-orange-400"}`}
                    >
                      {value}★
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share how this place felt for you…"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg bg-orange-50 border border-orange-200 text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                />
                <button type="submit" className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-400 transition-all">
                  Submit review
                </button>
              </form>
            </div>
            <div className="space-y-3">
              {(posts?.locationReviews || []).length > 0 ? posts.locationReviews.map((review) => (
                <div key={review._id || `${review.user?.id}-${review.createdAt}`} className="rounded-xl border border-orange-100 bg-orange-50 p-4 text-sm">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-semibold text-stone-700">{review.user?.name || "Traveller"}</span>
                    <span className="text-orange-500 font-semibold">{review.rating}★</span>
                  </div>
                  <p className="text-stone-600">{review.review}</p>
                </div>
              )) : <p className="text-sm text-stone-400">No location reviews yet.</p>}
            </div>
          </div>

          {/* Comments */}
          {currentUser && (
            <div className="border-t border-orange-100 px-6 py-6">
              <h2 className="text-sm font-semibold text-stone-700 flex items-center gap-2 mb-4">
                <MessageCircle size={14} className="text-orange-500" />
                Comments
                <span className="ml-auto bg-orange-100 text-orange-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {comments?.length || 0}
                </span>
              </h2>

              {/* Input */}
              <form onSubmit={handleCommentSubmit} className="flex gap-2 mb-5">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment…"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-orange-50 border border-orange-200 text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 disabled:bg-stone-200 disabled:text-stone-400 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-95 disabled:cursor-not-allowed"
                >
                  <Send size={14} strokeWidth={2} />
                  Post
                </button>
              </form>

              {/* List */}
              <div className="space-y-2.5">
                {comments?.map((comment) => (
                  <div
                    key={comment._id}
                    className="flex items-start gap-3 bg-orange-50 border border-orange-100 rounded-xl p-4 hover:border-orange-200 transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User size={12} className="text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs font-semibold text-stone-700">
                          {comment.user.name}
                        </span>
                        <span className="text-xs text-stone-400">
                          {format(new Date(comment.createdAt), "dd MMM yyyy, HH:mm")}
                        </span>
                      </div>
                      <p className="text-sm text-stone-600">{comment.text}</p>
                    </div>
                    {comment.user.id === currentUser && (
                      <button
                        onClick={() => {
                          dispatch(deleteComment(posts._id, comment._id));
                          setActionMsg("Deleting comment…");
                        }}
                        className="shrink-0 text-stone-300 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 size={13} strokeWidth={2} />
                      </button>
                    )}
                  </div>
                ))}
                {comments?.length === 0 && (
                  <p className="text-center text-stone-400 text-sm py-4">No comments yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white border border-orange-200 rounded-2xl shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle size={16} className="text-red-400" />
              </div>
              <p className="font-semibold text-stone-800">Delete this post?</p>
            </div>
            <p className="text-stone-500 text-sm mb-5 pl-12">
              This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-stone-600 rounded-lg text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-lg text-sm font-semibold transition-all active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}