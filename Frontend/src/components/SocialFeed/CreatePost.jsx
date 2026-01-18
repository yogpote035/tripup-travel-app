import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "../../../AllStatesFeatures/SocialFeed/SocialFeedSlice";
import { useState } from "react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TextField, createTheme, ThemeProvider } from "@mui/material";
import Loading from "../../General/Loading";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  MapPin, 
  Calendar,
  Eye,
  EyeOff,
  Tag,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from "lucide-react";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#111827", paper: "#1f2937" },
    primary: { main: "#ec4899" }, // pink-500
    text: { primary: "#ffffff" },
  },
});

const CreatePost = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.socialFeed);
  const navigate = useNavigate();
  const { register, handleSubmit, reset, setValue } = useForm();
  const [images, setImages] = useState([]);
  const [travelDate, setTravelDate] = useState(null);

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("location", data.location);
    formData.append(
      "travelDate",
      travelDate ? travelDate.toISOString().split("T")[0] : ""
    );
    formData.append("visibility", data.visibility);
    formData.append("tags", data.tags);

    images.forEach((img) => {
      formData.append("images", img);
    });

    dispatch(createPost(formData, navigate));
    reset();
    setImages([]);
    setTravelDate(null);
  };

  if (loading) {
    return <Loading message="Creating Your Post..." color="border-t-rose-400" />;
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white p-6 mt-10 mb-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg mb-4">
              <FileText size={32} className="text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-2">
              Create New Post
            </h2>
            <div className="flex items-center justify-center gap-2">
              <Sparkles size={16} className="text-pink-400" />
              <p className="text-gray-400">Share your travel experiences</p>
              <Sparkles size={16} className="text-pink-400" />
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 shadow-xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Post Title *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <FileText size={18} />
                  </div>
                  <input
                    required
                    type="text"
                    placeholder="Give your post a catchy title"
                    {...register("title", { required: true })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  placeholder="Share your travel story and experiences..."
                  {...register("description", { required: true })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all resize-none"
                  rows={5}
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <MapPin size={18} />
                  </div>
                  <input
                    required
                    type="text"
                    placeholder="Where did you travel?"
                    {...register("location", { required: true })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Travel Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Travel Date *
                </label>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Travel Date"
                    value={travelDate}
                    onChange={(newDate) => {
                      setTravelDate(newDate);
                      setValue("travelDate", newDate);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "#111827",
                            borderRadius: "12px",
                            border: "1px solid #374151",
                            "&:hover": { borderColor: "#ec4899" },
                            "&.Mui-focused": { 
                              borderColor: "#ec4899",
                              boxShadow: "0 0 0 2px rgba(236, 72, 153, 0.2)"
                            }
                          },
                          "& .MuiInputLabel-root": { color: "#9ca3af" },
                          "& .MuiSvgIcon-root": { color: "#ec4899" },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </div>

              {/* Visibility & Tags Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Visibility */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Visibility *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <Eye size={18} />
                    </div>
                    <select
                      {...register("visibility")}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all appearance-none"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                        <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <Tag size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      placeholder="travel, adventure, nature"
                      {...register("tags")}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Images *
                </label>
                <div className="relative">
                  <input
                    required
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="w-full flex items-center justify-center gap-3 px-4 py-8 rounded-xl bg-gray-900 border-2 border-dashed border-gray-700 hover:border-pink-500 text-gray-400 hover:text-pink-400 cursor-pointer transition-all"
                  >
                    <ImageIcon size={24} />
                    <span className="font-medium">
                      {images.length > 0 ? `${images.length} image(s) selected` : "Click to upload images"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Preview ({images.length})
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group aspect-square border-2 border-gray-700 rounded-xl overflow-hidden hover:border-pink-500 transition-all"
                      >
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`preview-${idx}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                        >
                          <X size={14} strokeWidth={2} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={20} strokeWidth={2} />
                {loading ? "Creating..." : "Create Post"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default CreatePost;