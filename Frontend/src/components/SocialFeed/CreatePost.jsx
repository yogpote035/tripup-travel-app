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

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#111827", paper: "#1f2937" }, // gray-900 & gray-800
    primary: { main: "#3b82f6" }, // blue-500
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
      <div className="min-h-screen bg-gray-900 text-white p-6 mt-5 mb-5">
        <div className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">Create New Post</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <input
              required
              type="text"
              placeholder="Title"
              {...register("title", { required: true })}
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded text-white focus:outline-none"
            />

            {/* Description */}
            <textarea
              placeholder="Description"
              {...register("description", { required: true })}
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded text-white focus:outline-none"
              rows={4}
            />

            {/* Location */}
            <input
              required
              type="text"
              placeholder="Location"
              {...register("location", { required: true })}
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded text-white focus:outline-none"
            />

            {/* Travel Date - MUI DatePicker */}
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
                        bgcolor: "#374151", // gray-700
                        borderRadius: "8px",
                      },
                      "& .MuiInputLabel-root": { color: "#9ca3af" },
                      "& .MuiSvgIcon-root": { color: "#ffffff" },
                    }}
                  />
                )}
              />
            </LocalizationProvider>

            {/* Visibility */}
            <select
              {...register("visibility")}
              required
              className="w-full bg-gray-700 mt-5 border border-gray-600 p-3 rounded text-white focus:outline-none"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>

            {/* Tags */}
            <input
              required
              type="text"
              placeholder="Tags (comma separated)"
              {...register("tags")}
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded text-white focus:outline-none"
            />

            {/* Images */}
            <input
              required
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded text-white"
            />

            {/* Preview */}
            {images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="w-20 h-20 border rounded overflow-hidden border-gray-600"
                  >
                    <img
                      src={URL.createObjectURL(img)}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 transition-colors text-white p-3 rounded"
            >
              {loading ? "Creating..." : "Create Post"}
            </button>
          </form>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default CreatePost;
