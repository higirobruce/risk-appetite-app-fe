import React, { useEffect, useState, useContext } from "react";

import MainScreen from "../components/mainScreen";
import SideBar from "../components/sidebar";
import { ViewContext } from "../contexts/viewContext";
import { UserContext } from "../contexts/userContext";
import { useRouter } from "next/dist/client/router";

import "semantic-ui-css/semantic.min.css";
import Navbar from "../components/nav/navbar";
import { Spinner } from "evergreen-ui";

export default function Home() {
  const [view, setView] = useState("dashboard");
  const { user, setUser } = useContext(UserContext);
  const router = useRouter();

  useEffect(() => {
    let storedUser = window.localStorage.getItem("user");
    let jsonStoreUser = JSON.parse(storedUser);

    if (!user.username && !jsonStoreUser?.username) router.push("/");
    else if (jsonStoreUser?.username) {
      setUser({
        email: jsonStoreUser.email,
        username: jsonStoreUser.email.split("@")[0],
        password: jsonStoreUser.password,
        companyName: jsonStoreUser.companyName,
        selectedCompany: jsonStoreUser.companyName,
        profile: jsonStoreUser.profile,
        id: user.id,
      });
    }
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {user.username && (
        <ViewContext.Provider value={{ view, setView }}>
          <Navbar />
          <div className="flex flex-row bg-gray-50 font-body">
            <SideBar />
            <MainScreen />
            {/* <DetailsScreen /> */}
          </div>
        </ViewContext.Provider>
      )}

      {!user.username && (
        <div className="flex justify-center items-center h-screen bg-gray-50 font-body">
          <div className="flex flex-col items-center justify-center">
            <Spinner />{" "}
          </div>
        </div>
      )}
    </div>
  );
}
