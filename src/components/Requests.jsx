import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequest } from "../utils/requestSlice";
import { useEffect } from "react";

const Requests = () => {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();

  const reviewRequest = async (status, _id) => {
    try {
      const res = await axios.post(
        BASE_URL + "/request/review/" + status + "/" + _id,
        {},
        { withCredentials: true }
      );

      dispatch(removeRequest(_id));
    } catch (err) {
      console.log("Error reviewing request:", err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/requests/received", {
        withCredentials: true,
      });

      dispatch(addRequests(res.data.data));
    } catch (err) {
      console.log("Error fetching requests:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (!requests) return null;

  if (requests.length === 0)
    return (
      <h1 className="text-center text-white text-2xl my-10">
        No Requests Found
      </h1>
    );

  return (
    <div className="text-center my-10 px-4">
      <h1 className="font-bold text-white text-3xl mb-8">
        Connection Requests
      </h1>

      <div className="max-w-5xl mx-auto">
        {requests.map((request) => {
          const {
            _id,
            firstName,
            lastName,
            photoUrl,
            age,
            gender,
            about,
          } = request.fromUserId;

          return (
            <div
              key={_id}
              className="flex items-center gap-5 m-4 p-5 rounded-lg bg-base-300 w-full min-h-[130px]"
            >
              {/* Profile Image */}
              <div className="shrink-0">
                <img
                  alt="photo"
                  className="w-20 h-20 rounded-full object-cover"
                  src={photoUrl}
                />
              </div>

              {/* User Information */}
              <div className="text-left flex-1 min-w-0">
                <h2 className="font-bold text-xl text-white">
                  {firstName + " " + lastName}
                </h2>

                {age && gender && (
                  <p className="text-white/90">
                    {age + ", " + gender}
                  </p>
                )}

                <p className="text-white/80 break-words">
                  {about}
                </p>
              </div>

              {/* Buttons */}
              <div className="shrink-0 flex items-center gap-3">
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    reviewRequest("rejected", request._id)
                  }
                >
                  Reject
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    reviewRequest("accepted", request._id)
                  }
                >
                  Accept
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Requests;