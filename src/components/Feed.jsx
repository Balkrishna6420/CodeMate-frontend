import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../utils/feedSlice";
import { useEffect, useState } from "react";
import UserCard from "./UserCard";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const getFeed = async (pageNumber) => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/feed?page=${pageNumber}&limit=10`,
        {
          withCredentials: true,
        }
      );

      const newUsers = res?.data?.data || [];

      if (newUsers.length === 0) {
        setHasMore(false);
        return;
      }

      // Add the new 10 users to the existing feed
      dispatch(
        addFeed(
          pageNumber === 1
            ? newUsers
            : [...(feed || []), ...newUsers]
        )
      );
    } catch (err) {
      console.error("Feed API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load first 10 users
  useEffect(() => {
    getFeed(1);
  }, []);

  // When current feed becomes empty,
  // fetch the next 10 users
  useEffect(() => {
    if (feed && feed.length === 0 && !loading && hasMore) {
      const nextPage = page + 1;

      setPage(nextPage);
      getFeed(nextPage);
    }
  }, [feed]);

  if (!feed) {
    return (
      <div className="flex justify-center my-10">
        <p>Loading...</p>
      </div>
    );
  }

  if (feed.length === 0 && !hasMore) {
    return (
      <h1 className="flex justify-center my-10">
        No new users found!!!
      </h1>
    );
  }

  return (
    <div className="flex justify-center my-10">
      {feed.length > 0 && <UserCard user={feed[0]} />}

      {loading && (
        <p className="absolute mt-96">
          Loading more users...
        </p>
      )}
    </div>
  );
};

export default Feed;