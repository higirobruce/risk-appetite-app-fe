"use strict";
import React, { useState, useEffect, useContext } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import readXlsxFile from "read-excel-file";
import { Button } from "semantic-ui-react";
import { RatioContext } from "../../contexts/ratioContext";
import { DataLoadedContext } from "../../contexts/dataLoadedContext";
import { CornerDialog } from "evergreen-ui";
import ToleranceInput from "../common/toleranceInput";

export default function InputView() {
  const [startDate, setStartDate] = useState(new Date());
  const [fetchingData, setfetchingData] = useState(false);
  const [fileName, setFileName] = useState("INPUT 1");
  const [file1Uploaded, setFile1Uploaded] = useState(false);
  const [fileName2, setFileName2] = useState("INPUT 2");
  const [currentFigures, setCurrentFigures] = useState({});
  const [previousFigures, setPreviousFigures] = useState({});
  const [ytdFigures, setYtdFigures] = useState({});
  const [currBalancesheetFigures, setCurrBalancesheetFigures] = useState({});
  const [prevBalancesheetFigures, setPrevBalancesheetFigures] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogIsShown, setDialogIsShown] = useState(false);
  const [messageTitle, setMessageTitle] = useState("");
  const [presetValues, setPresetValues] = useState({});
  const { ratios, setRatios } = useContext(RatioContext);
  const { loaded, setLoaded } = useContext(DataLoadedContext);

  const saveData = () => {
    console.log(ratios);
  };

  useEffect(() => {
    Promise.all([
      //Operational Efficiency -- 0
      fetch(
        `http://localhost:3001/operationalEfficiency/${currentFigures["currentOperatingProfit"]}/${currentFigures["currentTotalRevenues"]}`,
        {
          method: "GET",
        }
      ),
      // 1
      fetch(
        `http://localhost:3001/operationalEfficiency/${previousFigures["prevOperatingProfit"]}/${previousFigures["prevTotalRevenues"]}`,
        {
          method: "GET",
        }
      ),

      //Liquidity --2
      fetch(
        `http://localhost:3001/liquidity/${currBalancesheetFigures["currentTotalCurrentAssets"]}/${currBalancesheetFigures["currentTotalCurrentLiabilities"]}/${currBalancesheetFigures["currentInventories"]}`,
        {
          method: "GET",
        }
      ),
      // --3
      fetch(
        `http://localhost:3001/liquidity/${prevBalancesheetFigures["previousTotalCurrentAssets"]}/${prevBalancesheetFigures["previousTotalCurrentLiabilities"]}/${prevBalancesheetFigures["previousInventories"]}`,
        {
          method: "GET",
        }
      ),

      //Profitability -- 4
      fetch(
        `http://localhost:3001/profitability/${currentFigures["currentGrossProfit"]}/${currentFigures["currentTotalRevenues"]}/${currentFigures["currentEBITDA"]}/${currentFigures["currentNetProfit"]}/${currBalancesheetFigures["currentTotalCapitalAndReserves"]}/${currBalancesheetFigures["currentTotalAssets"]}/`,
        {
          method: "GET",
        }
      ),
      //--5
      fetch(
        `http://localhost:3001/profitability/${previousFigures["prevGrossProfit"]}/${previousFigures["prevTotalRevenues"]}/${previousFigures["prevEBITDA"]}/${previousFigures["prevNetProfit"]}/${prevBalancesheetFigures["previousTotalCapitalAndReserves"]}/${prevBalancesheetFigures["previousTotalAssets"]}/`,
        {
          method: "GET",
        }
      ),
      //Credit Risk -- 6
      fetch(
        `http://localhost:3001/creditRisk/${currentFigures["currentTotalRevenues"]}/${currBalancesheetFigures["currentTotalReceivables"]}`,
        {
          method: "GET",
        }
      ),
      //--7
      fetch(
        `http://localhost:3001/creditRisk/${previousFigures["prevTotalRevenues"]}/${prevBalancesheetFigures["previousTotalReceivables"]}`,
        {
          method: "GET",
        }
      ),
      //Marketing -- 8
      fetch(
        `http://localhost:3001/marketing/${currentFigures["currentTotalRevenues"]}/${ytdFigures["ytdTotalRevenues"]}`,
        {
          method: "GET",
        }
      ),
      //Marketing -- 9
      fetch(
        `http://localhost:3001/marketing/${previousFigures["prevTotalRevenues"]}/${ytdFigures["ytdTotalRevenues"]}`,
        {
          method: "GET",
        }
      ),
      //Business Continuity -- 10
      fetch(
        `http://localhost:3001/businessContinuity/${currentFigures["currentNetProfit"]}/${currentFigures["currentDepreciation"]}/${currBalancesheetFigures["currentTotalNonCurrentLiabilites"]}/${currBalancesheetFigures["currentTotalCurrentLiabilities"]}`,
        {
          method: "GET",
        }
      ),
      //Business Continuity -- 11
      fetch(
        `http://localhost:3001/businessContinuity/${previousFigures["prevNetProfit"]}/${previousFigures["prevDepreciation"]}/${prevBalancesheetFigures["previousTotalNonCurrentLiabilities"]}/${prevBalancesheetFigures["previousTotalCurrentLiabilities"]}`,
        {
          method: "GET",
        }
      ),
    ])
      .then(function (responses) {
        // Get a JSON object from each of the responses
        return Promise.all(
          responses.map(function (response) {
            return response.json();
          })
        );
      })
      .then(function (data) {
        // Log the data to the console
        // You would do something with both sets of data here
        let _ratios = [
          {
            metric: "Operating Expenses",
            category: "operationalEfficiency",
            currentPerformance: data[0].operatingExpenses,
            previousPerformance: data[1].operatingExpenses, //TODO
            riskTolerance: presetValues["operatingExpenses"],
          },
          {
            metric: "System Uptime",
            category: "operationalEfficiency",
            currentPerformance: data[0].systemUptime,
            previousPerformance: data[1].systemUptime, //TODO
            riskTolerance: presetValues["systemUptime"],
          },
          {
            metric: "Machinery Uptime",
            category: "operationalEfficiency",
            currentPerformance: data[0].machineryUptime,
            previousPerformance: data[1].machineryUptime, //TODO
            riskTolerance: presetValues["machineryUptime"],
          },
          {
            metric: "Current Ratio",
            category: "liquidity",
            currentPerformance: data[2].currentRatio,
            previousPerformance: data[3].currentRatio,
            riskTolerance: presetValues["currentRatio"],
          },
          {
            metric: "Quick Ratio",
            category: "liquidity",
            currentPerformance: data[2].quickRatio,
            previousPerformance: data[3].quickRatio, //TODO
            riskTolerance: presetValues["quickRatio"],
          },
          {
            metric: "GP Margin",
            category: "profitability",
            currentPerformance: data[4].gpMargin,
            previousPerformance: data[5].gpMargin, //TODO
            riskTolerance: presetValues["gpMargin"],
          },

          {
            metric: "EBITDA Margin",
            category: "profitability",
            currentPerformance: data[4].ebitdaMargin,
            previousPerformance: data[5].ebitdaMargin, //TODO
            riskTolerance: presetValues["ebitda"],
          },
          {
            metric: "Return On Equity",
            category: "profitability",
            currentPerformance: data[4].returnOnEquity,
            previousPerformance: data[5].returnOnEquity, //TODO
            riskTolerance: presetValues["roe"],
          },
          {
            metric: "Return On Assets",
            category: "profitability",
            currentPerformance: data[4].returnOnAsset,
            previousPerformance: data[5].returnOnAsset,
            riskTolerance: presetValues["roa"],
          },
          {
            metric: "Net Profit Margin",
            category: "profitability",
            currentPerformance: data[4].netProfitMargin,
            previousPerformance: data[5].netProfitMargin, //TODO
            riskTolerance: presetValues["netProfitMargin"],
          },
          {
            metric: "Average Collection Period",
            category: "creditRisk",
            currentPerformance: data[6].averageCollectionPeriod,
            previousPerformance: data[7].averageCollectionPeriod, //TODO
            riskTolerance: presetValues["averageCollectionPeriod"],
          },
          {
            metric: "Total Receivables/Sales",
            category: "creditRisk",
            currentPerformance: data[6].totalReceivablePerSales,
            previousPerformance: data[7].totalReceivablePerSales, //TODO
            riskTolerance: presetValues["totalReceivablePerSales"],
          },
          {
            metric: "Revenue Growth",
            category: "marketing",
            currentPerformance: data[8].revenueGrowth,
            previousPerformance: data[9].revenueGrowth, //TODO
            riskTolerance: presetValues["revenueGrowth"],
          },
          {
            metric: "Market Share",
            category: "marketing",
            currentPerformance: data[8].marketShare,
            previousPerformance: data[9].marketShare, //TODO
            riskTolerance: presetValues["marketShare"],
          },
          {
            metric: "New Customers",
            category: "marketing",
            currentPerformance: data[8].newCustomers,
            previousPerformance: data[9].newCustomers, //TODO
            riskTolerance: presetValues["newCustomers"],
          },
          {
            metric: "Employee Turnover",
            category: "businessContinuity",
            currentPerformance: data[10].employeeTurnover,
            previousPerformance: data[11].employeeTurnover, //TODO
            riskTolerance: presetValues["employeeTurnover"],
          },
          {
            metric: "Loss on major Upheaval",
            category: "businessContinuity",
            currentPerformance: data[10].lossOnMajorUpheaval,
            previousPerformance: data[11].lossOnMajorUpheaval, //TODO
            riskTolerance: presetValues["lossOnMajorUpheaval"],
          },
          {
            metric: "Solvency Ratio",
            category: "businessContinuity",
            currentPerformance: data[10].solvencyRatioMetric,
            previousPerformance: data[11].solvencyRatioMetric, //TODO
            riskTolerance: presetValues["solvencyRatio"],
          },
        ];
        setRatios(_ratios);
      });
  }, [loaded, currentFigures, currBalancesheetFigures, presetValues]);

  return (
    <div className="flex flex-col">
      <CornerDialog
        title={messageTitle}
        hasFooter={false}
        isShown={dialogIsShown}
        onCloseComplete={() => setDialogIsShown(false)}
      >
        {errorMessage}
      </CornerDialog>
      {/* Title */}
      <div className="font-semibold text-gray-600">Input</div>
      {/* Input form */}
      <div className="mt-10 mb-10">
        <form>
          <div className="flex flex-col w-1/2 mt-2 mr-5">
            <label className="font-semibold text-gray-500 text-sm mb-1 ml-1">
              Reporting Date
            </label>
            <DatePicker
              className="border-2 py-2 px-3 text-sm text-gray-500 focus:border-gray-100 rounded-lg "
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              placeholderText="Reporting Date"
              showPopperArrow={false}
            />
          </div>

          <ToleranceInput setPresetValues={setPresetValues} />

          <div className="flex flex-row w-3/5">
            <div className="flex h-16 pt-5 mr-10">
              <label className="w-36 flex flex-row justify-center items-center bg-white text-blue-400 rounded-lg shadow-lg tracking-wide uppercase border border-blue-400 cursor-pointer transition duration-300 ease-in-out hover:bg-blue-400 hover:text-white">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
                </svg>
                <span className="pl-2 text-sm font-semibold leading-normal">
                  {fileName}
                </span>
                <input
                  type="file"
                  className="hidden"
                  webkitdirectory
                  directory
                  multiple
                  // value={fileName}
                  onChange={(e) => {
                    setFileName("Done!");
                    readXlsxFile(e.target.files[0])
                      .then((rows) => {
                        // console.log(rows);
                        //previous quater figures
                        let prevTotalRevenues = rows[12][10];
                        let prevDepreciation = rows[17][10];
                        let prevGrossProfit = rows[21][10];
                        let prevOperatingProfit = rows[27][10];
                        let prevNetProfit = rows[32][10];
                        let prevEBITDA = rows[34][10];

                        setPreviousFigures({
                          prevTotalRevenues,
                          prevDepreciation,
                          prevGrossProfit,
                          prevOperatingProfit,
                          prevNetProfit,
                          prevEBITDA,
                        });
                        //current quater figures
                        let currentTotalRevenues = rows[12][15];
                        let currentDepreciation = rows[17][15];
                        let currentGrossProfit = rows[21][15];
                        let currentOperatingProfit = rows[27][15];
                        let currentNetProfit = rows[32][15];
                        let currentEBITDA = rows[34][15];

                        setCurrentFigures({
                          currentTotalRevenues,
                          currentDepreciation,
                          currentGrossProfit,
                          currentOperatingProfit,
                          currentNetProfit,
                          currentEBITDA,
                        });

                        //YTD figures
                        let ytdTotalRevenues = rows[12][16];
                        let ytdDepreciation = rows[17][16];
                        let ytdGrossProfit = rows[21][16];
                        let ytdOperatingProfit = rows[27][16];
                        let ytdNetProfit = rows[32][16];
                        let ytdEBITDA = rows[34][16];

                        setYtdFigures({
                          ytdTotalRevenues,
                          ytdDepreciation,
                          ytdGrossProfit,
                          ytdOperatingProfit,
                          ytdNetProfit,
                          ytdEBITDA,
                        });

                        setMessageTitle("Success!");
                        setErrorMessage(
                          "INPUT 1 Data successfully read. Please Upload INPUT 2 data also."
                        );
                        setDialogIsShown(true);
                        setFile1Uploaded(true);
                      })
                      .catch((err) => {
                        setFileName2("Error!");
                        setMessageTitle("File format Issue!");
                        setErrorMessage(
                          "There was an issue uploading the file. Please check the file format against the template excel template!"
                        );
                        setDialogIsShown(true);
                      });
                  }}
                />
              </label>
            </div>

            <div className="flex h-16 pt-5 mr-10">
              <label
                className={
                  file1Uploaded
                    ? "w-36 flex flex-row justify-center items-center bg-white text-blue-400 rounded-lg shadow-lg tracking-wide uppercase border border-blue-400 cursor-pointer transition duration-300 ease-in-out hover:bg-blue-400 hover:text-white"
                    : "w-36 flex flex-row justify-center items-center bg-white text-gray-400 rounded-lg shadow-lg tracking-wide uppercase border border-gray-400 cursor-not-allowed"
                }
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
                </svg>
                <span className="pl-2 text-sm font-semibold leading-normal">
                  {fileName2}
                </span>
                <input
                  disabled={!file1Uploaded}
                  type="file"
                  className="hidden"
                  webkitdirectory
                  directory
                  multiple
                  // value={fileName}
                  onChange={(e) => {
                    setFileName2("Done!");
                    readXlsxFile(e.target.files[0])
                      .then((rows) => {
                        let currentTotalNonCurrentAssets = rows[11][2];
                        let currentTotalCurrentAssets = rows[18][2];
                        let currentTotalAssets = rows[19][2];
                        let currentTradeReceivables = rows[14][2];
                        let currentRelatedPartyReceivables = rows[16][2];
                        let currentTotalReceivables =
                          currentTradeReceivables +
                          currentRelatedPartyReceivables;
                        let currentTotalNonCurrentLiabilites = rows[32][2];
                        let currentTotalCurrentLiabilities = rows[39][2];
                        let currentInventories = rows[13][2];
                        let currentTotalCapitalAndReserves = rows[28][2];

                        let currentBalancesheetFigures = {
                          currentTotalNonCurrentAssets,
                          currentTotalCurrentAssets,
                          currentTotalAssets,
                          currentTotalReceivables,
                          currentTotalNonCurrentLiabilites,
                          currentTotalCurrentLiabilities,
                          currentInventories,
                          currentTotalCapitalAndReserves,
                        };

                        setCurrBalancesheetFigures(currentBalancesheetFigures);

                        let previousTotalNonCurrentAssets = rows[11][3];
                        let previousTotalCurrentAssets = rows[18][3];
                        let previousTotalAssets = rows[19][3];
                        let previousTradeReceivables = rows[14][3];
                        let previousRelatedPartyReceivables = rows[16][3];
                        let previousTotalReceivables =
                          previousTradeReceivables +
                          previousRelatedPartyReceivables;
                        let previousTotalNonCurrentLiabilities = rows[32][3];
                        let previousTotalCurrentLiabilities = rows[39][3];
                        let previousInventories = rows[13][3];
                        let previousTotalCapitalAndReserves = rows[28][3];

                        let previousBalancesheetFigures = {
                          previousTotalNonCurrentAssets,
                          previousTotalCurrentAssets,
                          previousTotalAssets,
                          previousTotalReceivables,
                          previousTotalNonCurrentLiabilities,
                          previousTotalCurrentLiabilities,
                          previousInventories,
                          previousTotalCapitalAndReserves,
                        };
                        setMessageTitle("Success!");
                        setErrorMessage(
                          "Data successfully read. Check the Output Section."
                        );
                        setDialogIsShown(true);

                        setPrevBalancesheetFigures(previousBalancesheetFigures);
                        setLoaded(true);
                      })
                      .catch((err) => {
                        setFileName2("Error!");
                        setMessageTitle("File format Issue!");
                        setErrorMessage(
                          "There was an issue uploading the file. Please check the file format against the excel template!"
                        );
                        setDialogIsShown(true);
                      });
                  }}
                />
              </label>
            </div>
          </div>
        </form>
        <div className="pt-5">
          <Button onClick={() => saveData()} color="blue">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
