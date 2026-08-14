import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  getSinglePost,
  updatePost,
} from "../../../AllStatesFeatures/SocialFeed/SocialFeedSlice";
import Loading from "../../General/Loading";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TextField, createTheme, ThemeProvider } from "@mui/material";
import {
  FileText,
  MapPin,
  Tag,
  X,
  Save,
  Edit3,
  Upload,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";

// MUI theme tuned to TripUp palette
const tripUpTheme = createTheme({
  palette: {
    mode: "light",
    background: { default: "#fff7ed", paper: "#ffffff" },
    primary: { main: "#f97316" },
    text: { primary: "#1c1917" },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#fff7ed",
          borderRadius: "12px",
          fontSize: "0.875rem",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#fb923c",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#f97316",
            borderWidth: "2px",
          },
        },
        notchedOutline: {
          borderColor: "#fed7aa",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { color: "#a8a29e", fontSize: "0.875rem" },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: { color: "#f97316" },
      },
    },
  },
});

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold tracking-wide text-stone-500 uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Input with icon ───────────────────────────────────────────────────────────
function IconInput({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      <Icon
        size={15}
        strokeWidth={2}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none"
      />
      <input
        {...props}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
      />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { singlePost: posts, loading } = useSelector((s) => s.socialFeed);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    travelDate: null,
    tags: "",
    visibility: "public",
    images: [],
  });
  const [oldImages, setOldImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState(new Set());
  const [previews, setPreviews] = useState([]);

  useEffect(() => { dispatch(getSinglePost(id)); }, [dispatch, id]);

  useEffect(() => {
    if (posts) {
      setFormData({
        title: posts.title || "",
        description: posts.description || "",
        location: posts.location || "",
        travelDate: posts.travelDate ? new Date(posts.travelDate) : null,
        tags: posts.tags ? posts.tags.join(", ") : "",
        visibility: posts.visibility || "public",
        images: [],
      });
      setOldImages(posts.images || []);
    }
  }, [posts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("location", formData.location);
    data.append("travelDate", formData.travelDate ? new Date(formData.travelDate).toISOString().split("T")[0] : "");
    data.append("tags", formData.tags);
    data.append("visibility", formData.visibility || "public");
    formData.images.forEach((file) => data.append("images", file));

    // Send images to remove
    Array.from(imagesToRemove).forEach((idx) => {
      data.append("imagesToRemove", oldImages[idx]);
    });

    dispatch(updatePost({ id, formData: data, navigate }));
  };

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    setFormData((f) => ({ ...f, images: files }));
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const removeNewImage = (idx) => {
    setFormData((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
    setPreviews((p) => p.filter((_, i) => i !== idx));
  };

  const toggleRemoveOldImage = (idx) => {
    setImagesToRemove((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  if (loading)
    return <Loading color="border-t-orange-500" message="Updating post…" />;

  return (
    <ThemeProvider theme={tripUpTheme}>
      <div className="min-h-screen bg-orange-50 py-10 px-4">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Back */}
          <Link
            to={`/post/${id}`}
            className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Back to post
          </Link>

          {/* Card */}
          <div className="bg-white border border-orange-200 rounded-2xl overflow-hidden shadow-sm">

            {/* Header */}
            <div className="px-6 py-5 border-b border-orange-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                <Edit3 size={16} className="text-orange-500" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-base font-bold text-stone-800">Edit Post</h1>
                <p className="text-xs text-stone-400">Update your travel story</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">

              {/* Title */}
              <Field label="Title">
                <IconInput
                  icon={FileText}
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Post title"
                />
              </Field>

              {/* Description */}
              <Field label="Description">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your experience…"
                  rows={5}
                  className="w-full px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                />
              </Field>

              {/* Location */}
              <Field label="Location">
                <IconInput
                  icon={MapPin}
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Where was this?"
                />
              </Field>

              {/* Date + Visibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Travel Date">
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      value={formData.travelDate}
                      onChange={(d) => setFormData({ ...formData, travelDate: d })}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth size="small" />
                      )}
                    />
                  </LocalizationProvider>
                </Field>

                <Field label="Visibility">
                  <div className="relative">
                    <Eye size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none" strokeWidth={2} />
                    <select
                      value={formData.visibility}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                      className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-stone-800 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all appearance-none"
                    >
                      <option value="public">Public</option>
                      <option value="followers">Followers</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </Field>
              </div>

              <Field label="Tags">
                <IconInput
                  icon={Tag}
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="travel, adventure, nature"
                />
              </Field>

              {/* Upload new images */}
              <Field label="Upload New Images">
                <input
                  type="file"
                  multiple
                  id="new-image-upload"
                  className="hidden"
                  onChange={handleNewImages}
                />
                <label
                  htmlFor="new-image-upload"
                  className="flex items-center justify-center gap-2 w-full py-5 rounded-xl bg-orange-50 border-2 border-dashed border-orange-200 hover:border-orange-400 hover:bg-orange-100/50 text-stone-400 hover:text-orange-500 cursor-pointer transition-all text-sm font-medium"
                >
                  <Upload size={16} strokeWidth={2} />
                  {previews.length > 0
                    ? `${previews.length} image${previews.length > 1 ? "s" : ""} selected`
                    : "Click to upload images"}
                </label>
              </Field>

              {/* New image previews */}
              {previews.length > 0 && (
                <Field label={`New Images (${previews.length})`}>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                    {previews.map((src, idx) => (
                      <div
                        key={idx}
                        className="relative group aspect-square rounded-xl overflow-hidden border border-orange-200 hover:border-orange-400 transition-all"
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 bg-white border border-orange-200 text-red-400 hover:text-red-500 hover:border-red-300 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                        >
                          <X size={10} strokeWidth={2.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                </Field>
              )}

              {/* Current images */}
              {oldImages.length > 0 && (
                <Field label={`Current Images (${oldImages.length - imagesToRemove.size}/${oldImages.length})`}>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                    {oldImages.map((img, idx) => {
                      const isMarkedForRemoval = imagesToRemove.has(idx);
                      return (
                        <div
                          key={idx}
                          className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${isMarkedForRemoval
                              ? "border-red-400 opacity-50 bg-red-50"
                              : "border-orange-200 hover:border-orange-400"
                            }`}
                          onClick={() => toggleRemoveOldImage(idx)}
                          title={isMarkedForRemoval ? "Click to keep" : "Click to remove"}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          {isMarkedForRemoval && (
                            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                              <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                REMOVE
                              </div>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRemoveOldImage(idx);
                            }}
                            className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm border ${isMarkedForRemoval
                                ? "bg-red-500 border-red-600 text-white"
                                : "bg-white border-orange-200 text-red-400 hover:text-red-500 hover:border-red-300"
                              }`}
                          >
                            <X size={10} strokeWidth={2.5} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {imagesToRemove.size > 0 && (
                    <p className="mt-2 text-xs text-red-600 font-medium">
                      {imagesToRemove.size} image{imagesToRemove.size > 1 ? "s" : ""} marked for removal
                    </p>
                  )}
                </Field>
              )}

              {/* Divider */}
              <div className="border-t border-orange-100 pt-4">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    to={`/post/${id}`}
                    className="px-5 py-2.5 border border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-stone-600 rounded-xl text-sm font-medium transition-all"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:bg-stone-200 disabled:text-stone-400 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:cursor-not-allowed shadow-sm"
                  >
                    <Save size={15} strokeWidth={2} />
                    {loading ? "Updating…" : "Update Post"}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}