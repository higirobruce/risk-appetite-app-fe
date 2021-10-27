import React, { useContext } from "react";
import { DocumentDuplicateIcon } from "@heroicons/react/solid";
import { ViewContext } from "../../../contexts/viewContext";

export default function Reports() {
  const { view, setView } = useContext(ViewContext);
  return (
    <div
      onClick={() => {
        setView("reports");
      }}
      className="flex flex-row h-10 w-full items-center justify-start hover:cursor-pointer mb-10 pt-10"
    >
      <div className="pl-4 w-1/3">
        <DocumentDuplicateIcon className="h-8 w-8 text-gray-600" />
      </div>
      <div className="font-semibold text-gray-600">Reports</div>
    </div>
  );
}
