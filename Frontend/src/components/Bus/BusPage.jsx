import BusSearch from "./SearchBus";
import ListBuses from "./ListBuses";

function BusPage() {
  return (
    <div className="min-h-screen bg-orange-50 text-black pt-20 pb-10">
      <BusSearch />
      <ListBuses />
    </div>
  );
}

export default BusPage;
