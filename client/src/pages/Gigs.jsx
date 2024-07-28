import { useQuery } from "react-query";
import { useSearchParams } from "react-router-dom";
import api from "../utils/api.js";
import Loader from "../components/Loader.jsx";
import Error from "../components/Error.jsx";
import GigCard from "../components/GigCard.jsx";
import FilterArea from "../components/FilterArea.jsx";

const Gigs = () => {
  // urlden parametreleri al (aratılan kelime vs.)
  const [params] = useSearchParams();
  const search = params.get("query");
  const min = params.get("min");
  const max = params.get("max");

  // api den filtrelere uygun verileri al
  const { isLoading, error, data } = useQuery(["gigs", search, min, max], () =>
    api.get(`/gig`, { params: { search, min, max } }).then((res) => res.data)
  );

  return (
    <div>
      <h1 className="text-3xl mb-5">
        <span className="font-semibold">{search}</span> için sonuçlar
      </h1>

      <FilterArea />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 ">
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Error err={error} />
        ) : (
          data?.gigs?.map((gig) => <GigCard key={gig._id} gig={gig} />)
        )}
      </div>
    </div>
  );
};

export default Gigs;
