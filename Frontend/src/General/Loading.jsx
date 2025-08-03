const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Spinner */}
      <div>
        <div className="flex justify-center items-center">
          <div className="w-20 h-20 border-[6px] border-gray-300 border-t-yellow-500 rounded-full animate-spin"></div>
        </div>
        {/* Message */}
        <p className="ml-4 mt-6 text-center text-white font-medium text-lg">
          {message}
        </p>
      </div>
    </div>
  );
};

export default Loading;
