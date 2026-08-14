import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import {
    fetchLocationDetail,
    fetchLocationPosts,
    fetchLocationReviews,
    addLocationReview,
    markLocationVisitor,
} from "../../../AllStatesFeatures/Location/locationSlice";
import Loading from "../../General/Loading";
import { Star, MapPin, Users, MessageSquare, ArrowLeft, Heart, Send } from "lucide-react";

// Review form component
function ReviewForm({ locationId, onSubmit, loading }) {
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ rating, review });
        setRating(5);
        setReview("");
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl border border-orange-200 p-5 space-y-4"
        >
            <h3 className="font-bold text-stone-800">Share Your Experience</h3>

            <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-600 uppercase">Rating</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="transition-transform hover:scale-110"
                        >
                            <Star
                                size={24}
                                fill={star <= rating ? "#f97316" : "none"}
                                stroke={star <= rating ? "#f97316" : "#d6d3d1"}
                                strokeWidth={2}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-600 uppercase">Review</label>
                <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Share your thoughts about this location…"
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-lg bg-orange-50 border border-orange-200 text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                />
            </div>

            <button
                type="submit"
                disabled={loading || !review.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
                <Send size={16} />
                Post Review
            </button>
        </form>
    );
}

// Review card component
function ReviewCard({ review }) {
    return (
        <div className="bg-white rounded-xl border border-orange-100 p-4 space-y-2">
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-semibold text-stone-800">{review.user?.name}</p>
                    <p className="text-xs text-stone-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={14}
                            fill={i < review.rating ? "#f97316" : "none"}
                            stroke={i < review.rating ? "#f97316" : "#d6d3d1"}
                            strokeWidth={2}
                        />
                    ))}
                </div>
            </div>
            <p className="text-sm text-stone-700">{review.text}</p>
        </div>
    );
}

// Post card component
function PostCard({ post }) {
    return (
        <Link
            to={`/post/${post._id}`}
            className="group bg-white rounded-xl border border-orange-100 overflow-hidden hover:shadow-lg transition-all"
        >
            {post.images?.[0] && (
                <div className="h-32 overflow-hidden bg-orange-100">
                    <img
                        src={post.images[0]}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                </div>
            )}
            <div className="p-3 space-y-2">
                <p className="font-semibold text-stone-800 line-clamp-1 group-hover:text-orange-600">
                    {post.title}
                </p>
                <p className="text-xs text-stone-500">{post.author?.name}</p>
            </div>
        </Link>
    );
}

// Main component
export default function LocationDetail() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentLocation, locationReviews, locationPosts, loading, error } =
        useSelector((state) => state.locations);
    const { user } = useSelector((state) => state.auth);
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);

    useEffect(() => {
        if (id) {
            dispatch(fetchLocationDetail(id));
            dispatch(fetchLocationReviews({ locationId: id }));
            dispatch(fetchLocationPosts({ locationId: id }));
            if (user?.userId) {
                dispatch(markLocationVisitor(id));
            }
        }
    }, [dispatch, id, user?.userId]);

    const handleAddReview = async (data) => {
        setReviewSubmitting(true);
        try {
            await dispatch(
                addLocationReview({
                    locationId: id,
                    rating: data.rating,
                    text: data.review,
                })
            ).unwrap();
            // Refresh reviews
            dispatch(fetchLocationReviews({ locationId: id }));
        } catch (err) {
            console.error("Failed to add review:", err);
        } finally {
            setReviewSubmitting(false);
        }
    };

    if (loading && !currentLocation) {
        return <Loading color="border-t-orange-500" message="Loading location…" />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-orange-50 py-10 px-4">
                <div className="max-w-4xl mx-auto">
                    <Link
                        to="/locations"
                        className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 text-sm font-medium mb-6 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Locations
                    </Link>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-600 font-medium">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentLocation) {
        return (
            <div className="min-h-screen bg-orange-50 py-10 px-4 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-stone-600">Location not found</p>
                </div>
            </div>
        );
    }

    const images = currentLocation.images || [];

    return (
        <div className="min-h-screen bg-orange-50 py-10 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Back Button */}
                <Link
                    to="/locations"
                    className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 text-sm font-medium transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Locations
                </Link>

                {/* Image Gallery */}
                {images.length > 0 && (
                    <div className="space-y-2">
                        <div className="h-96 rounded-2xl overflow-hidden bg-orange-100">
                            <img
                                src={images[imageIndex]}
                                alt={currentLocation.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setImageIndex(idx)}
                                        className={`flex-shrink-0 h-20 w-20 rounded-lg overflow-hidden border-2 transition-colors ${idx === imageIndex
                                            ? "border-orange-500"
                                            : "border-orange-200"
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`${currentLocation.name} ${idx}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Header Info */}
                <div className="bg-white rounded-2xl border border-orange-200 p-6 space-y-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-stone-800">{currentLocation.name}</h1>
                        <div className="flex items-center gap-2 text-stone-600">
                            <MapPin size={16} />
                            <p>{currentLocation.category || "Destination"}</p>
                        </div>
                    </div>

                    <p className="text-stone-700">{currentLocation.description}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-orange-100">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-orange-600 font-bold">
                                <Star size={16} fill="currentColor" />
                                {(typeof currentLocation.avgRating === "number" ? currentLocation.avgRating.toFixed(1) : "N/A")}
                            </div>
                            <p className="text-xs text-stone-500">
                                {currentLocation.reviewCount || 0} reviews
                            </p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-orange-600 font-bold">
                                <MessageSquare size={16} />
                                {currentLocation.postCount || 0}
                            </div>
                            <p className="text-xs text-stone-500">posts</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-orange-600 font-bold">
                                <Users size={16} />
                                {currentLocation.visitorCount || 0}
                            </div>
                            <p className="text-xs text-stone-500">visited</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Reviews Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Add Review Form */}
                        {user ? (
                            <ReviewForm
                                locationId={id}
                                onSubmit={handleAddReview}
                                loading={reviewSubmitting}
                            />
                        ) : (
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
                                <p className="text-stone-600 mb-4">Sign in to leave a review</p>
                                <Link
                                    to="/login"
                                    className="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                                >
                                    Sign In
                                </Link>
                            </div>
                        )}

                        {/* Reviews List */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                                <Star size={18} className="text-orange-500" fill="currentColor" />
                                Reviews ({locationReviews.length})
                            </h2>
                            {locationReviews.length > 0 ? (
                                <div className="space-y-3">
                                    {locationReviews.map((review) => (
                                        <ReviewCard key={review._id} review={review} />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl border border-orange-100 p-8 text-center">
                                    <p className="text-stone-600">No reviews yet. Be the first!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Posts Sidebar */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                            <Heart size={18} className="text-red-500" fill="currentColor" />
                            Posts ({locationPosts.length})
                        </h2>
                        {locationPosts.length > 0 ? (
                            <div className="space-y-3">
                                {locationPosts.map((post) => (
                                    <PostCard key={post._id} post={post} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-orange-100 p-6 text-center">
                                <p className="text-stone-600 text-sm">No posts yet about this location</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
