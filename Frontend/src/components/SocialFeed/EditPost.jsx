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
import { TextField } from "@mui/material";

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { singlePost:posts, loading } = useSelector((state) => state.socialFeed);

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-600 to-gray-700 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800  mt-10 mb-10 text-gray-300 w-full max-w-2xl rounded-xl shadow-lg p-6 sm:p-8 space-y-6"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-orange-600">
          ✏️ Edit Post
        </h1>

        {/* Title */}
        <div>
          <label className="block mb-1 font-semibold">Title</label>
          <input
            className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-semibold">Description</label>
          <textarea
            className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none min-h-[120px]"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        {/* Location */}
        <div>
          <label className="block mb-1 font-semibold">Location</label>
          <input
            className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
          />
        </div>

        {/* Travel Date */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div>
            <label className="block mb-1 font-semibold">Travel Date</label>
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
                      bgcolor: "#fff",
                      borderRadius: "8px",
                    },
                    "& .MuiSvgIcon-root": { color: "#000" },
                    "& input": { color: "#000" },
                  }}
                />
              )}
            />
          </div>
        </LocalizationProvider>

        {/* Tags */}
        <div>
          <label className="block mb-1 font-semibold">
            Tags (comma separated)
          </label>
          <input
            className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
            value={formData.tags}
            onChange={(e) =>
              setFormData({
                ...formData,
                tags: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Upload New Images</label>
          <input
            type="file"
            multiple
            className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
            onChange={(e) => {
              const files = Array.from(e.target.files);
              setFormData({ ...formData, images: files });

              // Create preview URLs
              const previews = files.map((file) => URL.createObjectURL(file));
              setPreviews(previews);
            }}
          />
        </div>

        {/* New Images Preview */}
        {previews.length > 0 && (
          <div>
            <label className="block mb-1 font-semibold">
              New Images Preview
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-2">
              {previews.map((src, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={src}
                    alt="Preview"
                    className="w-full aspect-square object-cover rounded border"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition"
                    onClick={() => {
                      const updatedFiles = formData.images.filter(
                        (_, i) => i !== idx
                      );
                      const updatedPreviews = previews.filter(
                        (_, i) => i !== idx
                      );
                      setFormData({ ...formData, images: updatedFiles });
                      setPreviews(updatedPreviews);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Images */}
        {oldImages.length > 0 && (
          <div>
            <label className="block mb-1 font-semibold">Previous Images</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-2">
              {oldImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={img}
                    alt="Old"
                    className="w-full aspect-square object-cover rounded border"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition"
                    onClick={() => {
                      const updated = oldImages.filter((_, i) => i !== idx);
                      setOldImages(updated);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-orange-500 px-6 py-2 rounded-lg text-white font-semibold hover:bg-orange-600 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
