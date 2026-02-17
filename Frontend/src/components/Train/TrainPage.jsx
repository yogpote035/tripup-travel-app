import { useState } from "react";
import SearchTrain from "./SearchTrain";
import TrainList from "./TrainList";

const TrainPage = () => {
  const [searchDate, setSearchDate] = useState(""); // for get date from search page

  return (
    <div className="min-h-screen bg-orange-50 text-black pt-20 pb-10">
      <SearchTrain onDateChange={setSearchDate} />
      <TrainList searchDate={searchDate} />
    </div>
  );
};

export default TrainPage;
