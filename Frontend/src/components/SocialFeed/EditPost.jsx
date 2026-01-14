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
  Calendar,
  Tag,
  Image as ImageIcon,
  X,
  Save,
  Edit3,
  Upload
} from "lucide-react";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#111827", paper: "#1f2937" },
    primary: { main: "#f97316" }, // orange-500
    text: { primary: "#ffffff" },
  },
});

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { singlePost: posts, loading } = useSelector((state) => state.socialFeed);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    travelDate: null,
    tags: "",
    images: [],
  });
  const [oldImages, setOldImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    dispatch(getSinglePost(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (posts) {
      setFormData({
        title: posts.title || "",
        description: posts.description || "",
        location: posts.location || "",
        travelDate: posts.travelDate ? new Date(posts.travelDate) : null,
        tags: posts.tags ? posts.tags.join(", ") : "",
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
    data.append("travelDate", formData.travelDate);
    data.append("tags", formData.tags);
    formData.images.forEach((file) => data.append("images", file));

    dispatch(updatePost({ id, formData: data, navigate }));
  };

  if (loading) {
    return <Loading color="border-t-black" message="Updating Post..." />;
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white p-6 mt-10 mb-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg mb-4">
              <Edit3 size={32} className="text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Edit Post
            </h1>
            <p className="text-gray-400 mt-2">Update your travel story</p>
          </div>

          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 shadow-xl space-y-5"
          >
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <FileText size={18} />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Post title"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your experience"
                rows={5}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <MapPin size={18} />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Where was this?"
                />
              </div>
            </div>

            {/* Travel Date & Tags Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Travel Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Travel Date
                </label>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={formData.travelDate}
                    onChange={(newDate) =>
                      setFormData({ ...formData, travelDate: newDate })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "#111827",
                            borderRadius: "12px",
                            border: "1px solid #374151",
                            "&:hover": { borderColor: "#f97316" },
                            "&.Mui-focused": { 
                              borderColor: "#f97316",
                              boxShadow: "0 0 0 2px rgba(249, 115, 22, 0.2)"
                            }
                          },
                          "& .MuiInputLabel-root": { color: "#9ca3af" },
                          "& .MuiSvgIcon-root": { color: "#f97316" },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Tag size={18} />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tags: e.target.value,
                      })
                    }
                    placeholder="travel, adventure, nature"
                  />
                </div>
              </div>
            </div>

            {/* Upload New Images */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload New Images
              </label>
              <div className="relative">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="new-image-upload"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    setFormData({ ...formData, images: files });
                    const previews = files.map((file) => URL.createObjectURL(file));
                    setPreviews(previews);
                  }}
                />
                <label
                  htmlFor="new-image-upload"
                  className="w-full flex items-center justify-center gap-3 px-4 py-6 rounded-xl bg-gray-900 border-2 border-dashed border-gray-700 hover:border-orange-500 text-gray-400 hover:text-orange-400 cursor-pointer transition-all"
                >
                  <Upload size={20} />
                  <span className="font-medium">
                    {previews.length > 0 ? `${previews.length} new image(s) selected` : "Click to upload new images"}
                  </span>
                </label>
              </div>
            </div>

            {/* New Images Preview */}
            {previews.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  New Images ({previews.length})
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {previews.map((src, idx) => (
                    <div key={idx} className="relative group aspect-square border-2 border-gray-700 rounded-xl overflow-hidden hover:border-orange-500 transition-all">
                      <img
                        src={src}
                        alt={`New preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                        onClick={() => {
                          const updatedFiles = formData.images.filter((_, i) => i !== idx);
                          const updatedPreviews = previews.filter((_, i) => i !== idx);
                          setFormData({ ...formData, images: updatedFiles });
                          setPreviews(updatedPreviews);
                        }}
                      >
                        <X size={14} strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Current Images */}
            {oldImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Current Images ({oldImages.length})
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {oldImages.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square border-2 border-gray-700 rounded-xl overflow-hidden hover:border-orange-500 transition-all">
                      <img
                        src={img}
                        alt={`Current image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                        onClick={() => {
                          const updated = oldImages.filter((_, i) => i !== idx);
                          setOldImages(updated);
                        }}
                      >
                        <X size={14} strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-2"
                disabled={loading}
              >
                <Save size={20} strokeWidth={2} />
                {loading ? "Updating..." : "Update Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ThemeProvider>
  );
}