import React, { useContext } from "react";
import { UsersIcon } from "@heroicons/react/solid";
import { ViewContext } from "../../../contexts/viewContext";

export default function Users() {
  const { view, setView } = useContext(ViewContext);
  return (
    <div
      onClick={() => {
        setView("users");
      }}
      className={
        view === "users"
          ? "flex flex-row h-10 w-full items-center justify-start hover:cursor-pointer px-2 py-7 space-x-2 bg-gray-50  border-l-4 border-blue-cvl-600 ml-2"
          : "flex flex-row h-10 w-full items-center justify-start hover:cursor-pointer px-2 py-7 space-x-2 hover:scale-105 transition ease-in-out duration-200"
      }
    >
      <div className="pl-4">
        <UsersIcon
          className={
            view === "users"
              ? "h-5 w-5 text-blue-cvl-900"
              : "h-5 w-5 text-gray-100"
          }
        />
      </div>
      <div
        className={
          view === "users"
            ? "hidden md:block font-semibold text-blue-cvl-900"
            : "hidden md:block font-semibold text-gray-100"
        }
      >
        Users
      </div>
    </div>
  );
}
