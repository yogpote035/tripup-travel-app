import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSinglePost,
  deletePost,
} from "../../../AllStatesFeatures/SocialFeed/SocialFeedSlice";
import Loading from "../../General/Loading";
import {
  ChevronLeft,
  ChevronRight,
  FilePenLine,
  Trash,
  Calendar,
  MapPin,
} from "lucide-react"; // Lucide icons
import { format, parseISO } from "date-fns";
import { useRef } from "react";
import { toast } from "react-toastify";

export default function SinglePostView() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const formRef = useRef(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const { posts, loading, error } = useSelector((state) => state.socialFeed);
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

  // Reset index when post changes
  useEffect(() => {
    setCurrentImage(0);
  }, [posts]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowConfirm(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);
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
        message={actionMsg || "Fetching All Itineraries...."}
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
        <button className="bg-orange-500  outline-none focus:outline-none hover:bg-orange-600 px-4 py-2 rounded-lg transition">
          ❤️ {posts?.likes?.length || 0} Likes
        </button>
        <button className="bg-gray-800  outline-none focus:outline-none hover:bg-gray-700 px-4 py-2 rounded-lg transition">
          💬 {posts?.comments?.length || 0} Comments
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
    </div>
  );
}
