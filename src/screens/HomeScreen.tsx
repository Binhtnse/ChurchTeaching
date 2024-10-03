import React, { useEffect } from "react";
import usePageTitle from "../hooks/usePageTitle";

const HomeScreen: React.FC = () => {
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle("Trang chủ", "#4154f1");
  }, [setPageTitle]);

  return (
    <div>
      <div style={{ marginLeft: "256px", padding: "20px" }}>
        <h1 className="text-3xl font-bold mb-6"></h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">
              Latest Church Teachings
            </h2>
            <p className="text-gray-600 mb-4">
              Explore the most recent teachings and insights from our church
              leaders.
            </p>
            <a href="#" className="text-blue-600 hover:underline">
              Read more
            </a>
          </article>
          <article className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Upcoming Events</h2>
            <p className="text-gray-600 mb-4">
              Stay informed about our church's upcoming events and gatherings.
            </p>
            <a href="#" className="text-blue-600 hover:underline">
              View calendar
            </a>
          </article>
          <article className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Community Outreach</h2>
            <p className="text-gray-600 mb-4">
              Learn about our ongoing community service projects and how you can
              get involved.
            </p>
            <a href="#" className="text-blue-600 hover:underline">
              Volunteer now
            </a>
          </article>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
