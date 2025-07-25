import SearchTrain from "./SearchTrain";
import TrainList from "./TrainList";

const TrainPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20 px-4 pb-10">
      <SearchTrain />
      <TrainList />
    </div>
  );
};

export default TrainPage;
