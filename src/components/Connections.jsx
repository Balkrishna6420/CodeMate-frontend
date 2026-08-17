import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/connectionSlice";
import { Link } from "react-router-dom";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();

  const fetchConnections = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });

      dispatch(addConnections(res.data.data));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (!connections) return;

  if (connections.length === 0)
    return (
      <h1 className="text-center text-white text-2xl my-10">
        No Connections Found
      </h1>
    );

  return (
    <div className="text-center my-10 px-4">
      <h1 className="font-bold text-white text-3xl mb-8">Connections</h1>

      <div className="max-w-4xl mx-auto">
        {connections.map((connection) => {
          const { _id, firstName, lastName, photoUrl, age, gender, about } =
            connection;

          return (
            <div
              key={_id}
              className="flex items-center gap-4 m-4 p-5 rounded-lg bg-base-300 w-full min-h-[130px]">
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
                <h2 className="font-bold text-xl text-white truncate">
                  {firstName + " " + lastName}
                </h2>

                {age && gender && (
                  <p className="text-white/90">{age + ", " + gender}</p>
                )}

                <p className="text-white/80 break-words">{about}</p>
              </div>

              {/* Chat Button */}
              <div className="shrink-0 w-24 flex justify-end">
                <Link to={"/chat/" + _id}>
                  <button className="btn btn-primary">Chat</button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Connections;
