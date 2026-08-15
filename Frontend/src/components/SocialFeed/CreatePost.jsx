import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "../../../AllStatesFeatures/SocialFeed/SocialFeedSlice";
import { createLocation, searchLocations } from "../../../AllStatesFeatures/Location/locationSlice";
import { useState, useEffect, useRef } from "react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { createTheme, ThemeProvider } from "@mui/material";
import Loading from "../../General/Loading";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FileText,
  MapPin,
  Eye,
  Tag,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#f97316" },
    background: { default: "#fff7ed", paper: "#ffffff" },
    text: { primary: "#1c1917" },
  },
});

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold tracking-wide uppercase text-stone-400">
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all";

const iconInputCls =
  "w-full pl-10 pr-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all";

const CreatePost = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.socialFeed);
  const { loading: locationLoading, searchResults } = useSelector((state) => state.locations);
  const navigate = useNavigate();
  const { register, handleSubmit, reset, setValue } = useForm();
  const [images, setImages] = useState([]);
  const [travelDate, setTravelDate] = useState(null);
  const [locationInput, setLocationInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [creatingLocation, setCreatingLocation] = useState(false);
  const suggestionsRef = useRef(null);

  const handleImageChange = (e) => setImages(Array.from(e.target.files));
  const removeImage = (index) => setImages(images.filter((_, i) => i !== index));

  useEffect(() => {
    if (locationInput.trim().length >= 2) {
      const timer = window.setTimeout(() => {
        dispatch(searchLocations(locationInput.trim()));
        setShowSuggestions(true);
      }, 250);
      return () => window.clearTimeout(timer);
    }
    setShowSuggestions(false);
  }, [locationInput, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationChange = (value) => {
    setLocationInput(value);
    setValue("location", value);
  };

  const handleSelectLocation = (locationName) => {
    setLocationInput(locationName);
    setValue("location", locationName);
    setShowSuggestions(false);
  };

  const handleCreateLocation = async () => {
    const trimmed = locationInput.trim();
    if (!trimmed) return;
    setCreatingLocation(true);

    try {
      const location = await dispatch(createLocation({ name: trimmed })).unwrap();
      setLocationInput(location.name);
      setValue("location", location.name);
      setShowSuggestions(false);
      toast.success(`Created location “${location.name}”`);
    } catch (createError) {
      toast.error(createError || "Unable to create location");
    } finally {
      setCreatingLocation(false);
    }
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("location", data.location);
    formData.append("travelDate", travelDate ? travelDate.toISOString().split("T")[0] : "");
    formData.append("visibility", data.visibility);
    formData.append("tags", data.tags);
    images.forEach((img) => formData.append("images", img));
    dispatch(createPost(formData, navigate));
    reset();
    setImages([]);
    setTravelDate(null);
    setLocationInput("");
    setShowSuggestions(false);
  };

  if (loading) return <Loading message="Creating your post…" color="border-t-orange-500" />;

  return (
    <ThemeProvider theme={muiTheme}>
      <div className="min-h-screen bg-orange-50 py-10 px-4">
        <div className="max-w-xl mx-auto space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Create a post</h1>
            <p className="text-sm text-stone-500 mt-1">Share your travel experience with the community.</p>
          </div>

          {/* Card */}
          <div className="bg-white border border-orange-200 rounded-2xl shadow-sm overflow-hidden">
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">

              {/* Title */}
              <Field label="Title">
                <div className="relative">
                  <FileText size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" strokeWidth={2} />
                  <input
                    required
                    type="text"
                    placeholder="Give your post a title"
                    {...register("title", { required: true })}
                    className={iconInputCls}
                  />
                </div>
              </Field>

              {/* Description */}
              <Field label="Description">
                <textarea
                  required
                  placeholder="Share your travel story…"
                  {...register("description", { required: true })}
                  className={`${inputCls} resize-none`}
                  rows={4}
                />
              </Field>

              {/* Location */}
              <Field label="Location">
                <div className="relative" ref={suggestionsRef}>
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" strokeWidth={2} />
                  <input
                    required
                    type="text"
                    placeholder="Where did you travel?"
                    {...register("location", { required: true })}
                    value={locationInput}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    onFocus={() => {
                      if (locationInput.trim().length >= 2) {
                        setShowSuggestions(true);
                      }
                    }}
                    className={iconInputCls}
                  />

                  {showSuggestions && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-orange-200 bg-white shadow-xl">
                      {locationLoading ? (
                        <div className="p-3 text-sm text-stone-500">Searching locations…</div>
                      ) : searchResults && searchResults.length > 0 ? (
                        searchResults.map((location) => (
                          <button
                            key={location._id}
                            type="button"
                            onClick={() => handleSelectLocation(location.name)}
                            className="w-full text-left px-4 py-3 text-sm text-stone-800 hover:bg-orange-50"
                          >
                            {location.name}
                          </button>
                        ))
                      ) : (
                        <div className="space-y-2 p-4 text-sm text-stone-500">
                          <p>No locations found.</p>
                          <button
                            type="button"
                            onClick={handleCreateLocation}
                            disabled={creatingLocation}
                            className="w-full rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {creatingLocation ? "Creating…" : `Create "${locationInput.trim()}"`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Field>

              {/* Travel Date */}
              <Field label="Travel Date">
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={travelDate}
                    closeOnSelect
                    onChange={(newDate) => {
                      setTravelDate(newDate);
                      setValue("travelDate", newDate);
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        size: "small",
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "#fff7ed",
                            borderRadius: "12px",
                            fontSize: "0.875rem",
                            "& fieldset": { borderColor: "#fed7aa" },
                            "&:hover fieldset": { borderColor: "#fb923c" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#fb923c",
                              boxShadow: "0 0 0 2px rgba(251,146,60,0.15)",
                            },
                          },
                          "& .MuiInputBase-input": { color: "#1c1917", padding: "10px 14px" },
                          "& .MuiSvgIcon-root": { color: "#f97316" },
                          "& .MuiInputLabel-root": { display: "none" },
                          "& legend": { display: "none" },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </Field>

              {/* Visibility & Tags */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Visibility">
                  <div className="relative">
                    <Eye size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" strokeWidth={2} />
                    <select
                      {...register("visibility")}
                      required
                      className={`${iconInputCls} appearance-none pr-8`}
                    >
                      <option value="public">Public</option>
                      <option value="followers">Followers</option>
                      <option value="private">Private</option>
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400" width="10" height="6" viewBox="0 0 10 6" fill="none">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </Field>

                <Field label="Tags">
                  <div className="relative">
                    <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" strokeWidth={2} />
                    <input
                      required
                      type="text"
                      placeholder="travel, nature…"
                      {...register("tags")}
                      className={iconInputCls}
                    />
                  </div>
                </Field>
              </div>

              {/* Images upload */}
              <Field label="Images">
                <input
                  required={images.length === 0}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center gap-2 w-full py-6 rounded-xl bg-orange-50 border-2 border-dashed border-orange-200 hover:border-orange-400 hover:bg-orange-100 text-stone-500 hover:text-orange-500 cursor-pointer transition-all text-sm font-medium"
                >
                  <ImageIcon size={18} strokeWidth={1.5} />
                  {images.length > 0
                    ? `${images.length} image${images.length > 1 ? "s" : ""} selected`
                    : "Click to upload images"}
                </label>
              </Field>

              {/* Image previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group aspect-square rounded-xl overflow-hidden border border-orange-200 hover:border-orange-400 transition-all"
                    >
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`preview-${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-white/90 hover:bg-red-50 border border-red-200 text-red-400 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle size={15} className="text-red-400 shrink-0" />
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold py-3 rounded-xl transition-all active:scale-95 disabled:cursor-not-allowed text-sm"
              >
                <CheckCircle2 size={16} strokeWidth={2} />
                {loading ? "Creating…" : "Create post"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </ThemeProvider>
  );
};

export default CreatePost;
