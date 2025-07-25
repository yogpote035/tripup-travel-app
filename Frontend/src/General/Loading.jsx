const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      {/* Spinner */}
      <div
        className="w-30 h-30 border-[9px] border-gray-600 border-t-yellow-500 rounded-full animate-[spin_.9s_linear_infinite]"
      ></div>

      {/* Message */}
      <p className="mt-6 text-lg text-white font-medium tracking-wide">
        {message}
      </p>
    </div>
  );
};

export default Loading;
