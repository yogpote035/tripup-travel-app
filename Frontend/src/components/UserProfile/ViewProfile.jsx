// components/ViewProfile.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetUserProfile } from "../../../AllStatesFeatures/UserProfile/UserProfileSlice";
import Loading from "../../General/Loading";
import { useNavigate } from "react-router-dom";

const ViewProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, totalBookings, loading, error } = useSelector(
    (state) => state.userProfile
  );

  useEffect(() => {
    dispatch(GetUserProfile());
  }, [dispatch]);

  if (loading) return <Loading message="Loading Your Information..." />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="max-w-lg mx-auto mt-16 px-6 py-8 bg-gray-800 text-white rounded-2xl shadow-lg border">
      <h2 className="text-3xl font-bold text-center text-white mb-8">
        User Profile
      </h2>

      {profile && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-y-4 text-sm sm:text-base">
            <p className="font-semibold text-white">Name:</p>
            <p>{profile.name}</p>

            <p className="font-semibold text-white">Email:</p>
            <p>{profile.email}</p>

            <p className="font-semibold text-white">Phone:</p>
            <p>{profile.phone}</p>

            <p className="font-semibold text-white">Joined:</p>
            <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="flex justify-between items-center border border-blue-300 px-4 py-3 rounded-md shadow-inner">
            <p className="text-base font-medium text-white">
              Total Bookings:{" "}
              <span className="font-bold text-lg text-yellow-300 ml-1">
                {totalBookings || 0}
              </span>
            </p>
            <button
              onClick={() => navigate("/train-bookings")}
              className="bg-white text-black py-1 px-3 rounded hover:bg-gray-200 transition font-medium"
            >
              See All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProfile;
