import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaHeart, FaRegHeart, FaComment } from "react-icons/fa";

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
  FilePenLine,
  Trash,
  Calendar,
  MapPin,
  Heart,
  Delete,
} from "lucide-react"; // Lucide icons
import { format, parseISO } from "date-fns";
import { useRef } from "react";
import { toast } from "react-toastify";

export default function SinglePostView() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [commentText, setCommentText] = useState("");
  const {
    singlePost: posts,
    loading,
    error,
    like,
    comments,
  } = useSelector((state) => state.socialFeed);
  const currentUser =
    localStorage.getItem("userId") ||
    useSelector((state) => state.auth.user.userId);
  const navigate = useNavigate();
  // Track current image index for gallery
  const [currentImage, setCurrentImage] = useState(0);
  useEffect(() => {
    if (id) {
      dispatch(getSinglePost(id));
    }
  }, [id, dispatch]);

  // for 0 when index when post changes
  useEffect(() => {
    setCurrentImage(0);
  }, [posts]);
  // for conform dialog exit or close

  // right left key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "ArrowRight") {
        nextImage();
      } else if (e.key === "Escape") {
        setShowConfirm(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [posts, currentImage]); // include posts & currentImage so it updates

  const handleDelete = async () => {
    if (!selectedId) return toast.warn("Itinerary Id Missing");

    setActionMsg("Deleting your Itinerary...");
    try {
      await dispatch(deletePost(selectedId, navigate));
      setShowConfirm(false);
    } catch (err) {
      toast.warn("Failed to Delete Itinerary.");
    }
  };

  if (loading) {
    return (
      <Loading
        message={actionMsg || "Searching For Post...."}
        color="border-t-red-500"
      />
    );
  }

  if (error) {
    return <p className="text-center mt-15 mb-15 text-red-500">{error}</p>;
  }

  if (!posts) {
    return (
      <p className="text-center mt-15 mb-15 text-gray-400">Post not found.</p>
    );
  }

  // Navigation functions
  const prevImage = () => {
    setCurrentImage(
      (prev) => (prev === 0 ? posts.images.length - 1 : prev - 1) //if current is 0th then go to last
    );
  };

  const nextImage = () => {
    setCurrentImage(
      (prev) => (prev === posts.images.length - 1 ? 0 : prev + 1) //if current is last then go to 0th
    );
  };

  return (
    <div className="bg-gray-900 min-h-screen mt-5 mb-5 text-white p-6">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/post"
          className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
        >
          ← Back to Posts
        </Link>
      </div>

      {/* Image Gallery */}
      {posts?.images?.length > 0 && (
        <div className="relative w-full h-[400px] mb-6">
          <img
            src={posts.images[currentImage]}
            alt={posts.title}
            className="w-full h-full object-cover rounded-xl shadow-lg"
          />

          {/* Prev Button */}
          {posts?.images?.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full transition"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              {/* Next Button */}
              <button
                onClick={nextImage}
                className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full transition"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Dots */}
          {posts?.images?.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {posts.images.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentImage(idx)}
                  className={`w-3 h-3 rounded-full cursor-pointer ${
                    idx === currentImage ? "bg-orange-500" : "bg-gray-500"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Title */}
      <div className="mb-4">
        <h1 className="text-4xl font-bold mb-2">{posts.title}</h1>
        <p className="text-gray-400 flex justify gap-2 items-center">
          <MapPin size={18} /> {posts.location} &nbsp;| <Calendar size={18} />{" "}
          {
            <>
              {" "}
              {posts?.travelDate
                ? format(parseISO(posts.travelDate), "dd MMM yyyy, hh:mm a")
                : "Date not available"}
            </>
          }
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {posts?.tags?.map((tag, idx) => (
          <span
            key={idx}
            className="bg-gray-800 text-xs px-3 py-1 rounded-full border border-gray-700"
          >
            #{tag}
          </span>
        ))}
      </div>
      {/* Edit & Delete */}
      <div className="flex items-center gap-6 mb-4">
        {posts?.author?.id?.toString() === currentUser?.toString() && (
          <button
            onClick={() => {
              navigate(`/post/update/${posts._id}`);
            }}
            className="bg-gray-800 flex  outline-none focus:outline-none items-center justify-between gap-2 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
          >
            <FilePenLine size={20} color="orange" /> Edit Post
          </button>
        )}
        {posts?.author?.id?.toString() === currentUser?.toString() && (
          <button
            onClick={() => {
              setSelectedId(posts._id);
              setShowConfirm(true);
            }}
            className="bg-gray-800 flex items-center outline-none focus:outline-none justify-between gap-2 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
          >
            <Trash color="red" size={20} /> Delete Post
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-lg text-gray-300 leading-relaxed mb-8">
        {posts.description}
      </p>

      {/* Likes & Comments */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => {
            dispatch(toggleLike(posts._id));
          }}
          className={`bg-gray-800  hover:bg-gray-700
           outline-none focus:outline-none px-4 py-2 flex items-center gap-2 rounded-lg transition`}
        >
          {like?.liked ? (
            <FaHeart color="red" size={15} />
          ) : (
            <FaRegHeart size={15} />
          )}{" "}
          {like?.likesCount} <>Likes</>
        </button>
      </div>
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowConfirm(false)} // Click outside = close
        >
          <div
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-black dark:text-white p-6 rounded-xl shadow-2xl border border-white/20 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()} // Prevent inner click from closing
          >
            <h3 className="text-lg font-semibold mb-2">Delete This Post?</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Are you sure you want to Delete this Post? This action cannot be
              undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded"
              >
                No
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Input */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Comments</h2>
        <form
          onSubmit={(e) => {
            if (!commentText.trim()) return;
            console.log("text from main: ", commentText);
            dispatch(addComment(posts._id, commentText));
            setCommentText("");
          }}
          className="flex gap-2"
        >
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 p-2 rounded border border-gray-700 bg-gray-800 text-white outline-none"
          />
          <button
            type="submit"
            onClick={(e) => {
              setActionMsg("Adding your comment...");
            }}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded"
          >
            Post
          </button>
        </form>

        {/* Comment List */}
        <div className="mt-4 space-y-4">
          {comments?.map((comment) => (
            <div
              key={comment._id}
              className="bg-gray-800 p-3 rounded flex justify-between"
            >
              <div>
                <div className="text-sm flex items-center justify-end text-gray-400">
                  <p> {comment.user.name} At:&nbsp; </p>
                  <p> {format(comment.createdAt, "dd-MMM-yyyy")}</p>
                </div>
                <p>{comment.text}</p>
              </div>
              {comment.user.id === currentUser && (
                <button
                  onClick={() => {
                    dispatch(deleteComment(posts._id, comment._id, navigate));
                    setActionMsg("Deleting your comment...");
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Delete size={25} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
