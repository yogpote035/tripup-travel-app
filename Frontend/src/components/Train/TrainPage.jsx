import { useState } from "react";
import SearchTrain from "./SearchTrain";
import TrainList from "./TrainList";

const TrainPage = () => {
  const [searchDate, setSearchDate] = useState(""); // for get date from search page

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20 pb-10">
      <SearchTrain onDateChange={setSearchDate} />
      <TrainList searchDate={searchDate} />
    </div>
  );
};

export default TrainPage;
