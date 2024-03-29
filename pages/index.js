import React, { useState, useContext, useEffect } from "react";
import { useRouter } from "next/dist/client/router";
import { Spinner, CornerDialog } from "evergreen-ui";
import { UserContext } from "../contexts/userContext";
import _ from "lodash";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Index() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { user, setUser } = useContext(UserContext);
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogIsShown, setDialogIsShown] = useState(false);
  const [messageTitle, setMessageTitle] = useState("");

  const [viewPort, setViewPort] = useState("login");

  const [userLoggedIn, setUserLoggedIn] = useState(true);

  let router = useRouter();

  useEffect(() => {
    let storedUser = window.localStorage.getItem("user");
    if (storedUser) {
      setUserLoggedIn(true);
      router.push("/main").then(() => {
        setLoading(true);
        setUser(JSON.parse(storedUser));
      });
    } else {
      setUserLoggedIn(false);
    }
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setDialogIsShown(false);

    fetch(`http://${process.env.NEXT_PUBLIC_HOST_SERVER_IP}:3001/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        let { token, error, message } = data;
        if (error) {
          toast.error(message, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          setLoading(false);
        } else {
          window.localStorage.setItem(
            "user",
            JSON.stringify({
              email: email,
              username: email.split("@")[0],
              password: password,
              companyName: data.companyName,
              selectedCompany: data.companyName,
              profile: data.profile,
            })
          );
          setUser({
            email: email,
            username: email.split("@")[0],
            password: password,
            companyName: data.companyName,
            selectedCompany: data.companyName,
            profile: data.profile,
            id: data._id,
          });

          router.push("main").then(() => setLoading(false));
        }
      })
      .catch((err) => {
        toast.error("Connection Error!", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setLoading(false);
        setUserLoggedIn(true);
      });
    // setLoading(false);
  };

  const onUpdatePassword = (e) => {
    e.preventDefault();
    setLoading(true);
    setDialogIsShown(false);

    fetch(`http://${process.env.NEXT_PUBLIC_HOST_SERVER_IP}:3001/users/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        oldPassword,
        newPassword,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        let { token, error, message } = data;

        if (error) {
          setDialogIsShown(true);
          setMessageTitle("Error!");
          setErrorMessage(message);
          setLoading(false);
        } else {
          fetch(
            `http://${process.env.NEXT_PUBLIC_HOST_SERVER_IP}:3001/email/send`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "riskinfo@cvl.co.rw",
                to: email,
                subject: "Password updated",
                messageType: "passwordUpdated",
                password,
              }),
            }
          )
            .then((res) => res.json())
            .then((res) => {})
            .catch((err) => toast.warning("Couldn't send notification email!"));

          setViewPort("login");
          setDialogIsShown(true);
          setMessageTitle("Updated Successfully");
          setErrorMessage(message);
          setLoading(false);
        }
      })
      .catch((err) => {
        setDialogIsShown(true);
        setMessageTitle("Connection Error");
        setErrorMessage(
          "Could not connect to the server. Please make sure the server is up!"
        );

        setLoading(false);
      });
    // setLoading(false);
  };

  function generatePassword() {
    var length = 10,
      charset =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }

  const onsendChangePassword = (e) => {
    e.preventDefault();
    setLoading(true);
    setDialogIsShown(false);
    setNewPassword(generatePassword());

    if (email.length > 0) {
      fetch(`http://${process.env.NEXT_PUBLIC_HOST_SERVER_IP}:3001/users/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          oldPassword,
          newPassword,
          reset: true,
        }),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          let { token, error, message } = data;

          if (error) {
            setDialogIsShown(true);
            setMessageTitle("Error!");
            setErrorMessage(message);
            setLoading(false);
          } else {
            fetch(
              `http://${process.env.NEXT_PUBLIC_HOST_SERVER_IP}:3001/email/send`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  from: "riskinfo@cvl.co.rw",
                  to: email,
                  subject: "Password reset",
                  messageType: "passwordReset",
                  password: newPassword,
                }),
              }
            )
              .then((res) => res.json())
              .then((res) => {
                if (res.error) {
                  console.log(res);
                  toast.error("Error occured while sending email!");
                  setViewPort("login");
                  setDialogIsShown(false);
                  setLoading(false);
                } else {
                  toast.success("Check your email!");
                  setViewPort("login");
                  setDialogIsShown(false);
                  setLoading(false);
                }
              })
              .catch((err) => {
                console.log(err);
                toast.error("Error occured while sending email!");
                setViewPort("login");
                setDialogIsShown(false);
                setLoading(false);
              });
          }
        })
        .catch((err) => {
          setDialogIsShown(true);
          setMessageTitle("Error");
          setErrorMessage("Email not found!");

          setLoading(false);
        });
    } else {
      toast.error("Email can't be empty!");
      setDialogIsShown(false);
    }
    // setLoading(false);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50 font-body">
      {!userLoggedIn && (
        <>
          <CornerDialog
            title={messageTitle}
            hasFooter={false}
            isShown={dialogIsShown}
            onCloseComplete={() => setDialogIsShown(false)}
          >
            {errorMessage}
          </CornerDialog>

          <ToastContainer />

          {viewPort === "login" && (
            <form
              // onSubmit={onSubmit}
              className="flex flex-col justify-center items-center md:w-1/4 w-full mx-10 md:mx-32 bg-white md:py-32 shadow-md"
            >
              <Image height="50" width="140" src="/logo.png" />
              {/* Title or Logo */}
              {/* <div className="text-lg font-bold uppercase text-gray-700">Login </div> */}
              {/* Form with email and passord */}
              <input
                className="focus:outline-none border-2 py-3 w-3/4 px-3 rounded-md focus:border-blue-cvl-600 mt-6 text-sm text-gray-600 shadow-inner"
                placeholder="email@company.example"
                type="email"
                autoFocus
                onChange={(e) => {
                  setEmail(e.target.value);
                  setDialogIsShown(false);
                }}
              />

              <input
                className="focus:outline-none border-2 py-3 w-3/4 px-3 rounded-md focus:border-blue-cvl-600 mt-3 text-sm text-gray-600 shadow-inner"
                placeholder="password"
                type="password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setDialogIsShown(false);
                }}
              />

              {loading && (
                <Spinner
                  className="container mx-auto w-3/4 justify-center items-center mt-6 py-3"
                  size={32}
                />
              )}

              {!loading && (
                <button
                  onClick={onSubmit}
                  className="mt-6 w-3/4 bg-blue-cvl-900 py-3 rounded-md text-white shadow-md hover:bg-blue-cvl-700 active:bg-blue-cvl-500"
                >
                  Submit
                </button>
              )}

              <div className="flex flex-row space-x-6">
                <button
                  className="text-sm text-center mt-10 text-gray-400 cursor-pointer p-1 hover:text-blue-cvl-500 hover:underline"
                  onClick={() => setViewPort("updatePassword")}
                >
                  Reset password
                </button>

                <button
                  className="text-sm text-center  mt-10 text-gray-400 cursor-pointer p-1 hover:text-blue-cvl-500 hover:underline"
                  onClick={() => setViewPort("forgotPassword")}
                >
                  Forgot password
                </button>
              </div>
            </form>
          )}

          {viewPort === "updatePassword" && (
            <form
              // onSubmit={onSubmit}
              className="flex flex-col justify-center items-center md:w-1/4 w-full mx-10 md:mx-32 bg-white md:py-32  shadow-md"
            >
              <Image height="50" width="140" src="/logo.png" />
              {/* Title or Logo */}
              {/* <div className="text-lg font-bold uppercase text-gray-700">Login </div> */}
              {/* Form with email and passord */}
              <input
                className="focus:outline-none border-2 py-3 w-3/4 px-3 rounded-md focus:border-blue-cvl-600 mt-3 text-sm text-gray-600 shadow-inner"
                placeholder="email@company.example"
                type="email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setDialogIsShown(false);
                }}
              />

              <input
                className="focus:outline-none border-2 py-3 w-3/4 px-3 rounded-md focus:border-blue-cvl-600 mt-3 text-sm text-gray-600 shadow-inner"
                placeholder="Current password"
                type="password"
                onChange={(e) => {
                  setOldPassword(e.target.value);
                  setDialogIsShown(false);
                }}
              />

              <input
                className="focus:outline-none border-2 py-3 w-3/4 px-3 rounded-md focus:border-blue-cvl-600 mt-3 text-sm text-gray-600 shadow-inner"
                placeholder="New password"
                type="password"
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setDialogIsShown(false);
                }}
              />

              {loading && (
                <Spinner
                  className="container mx-auto w-3/4 justify-center items-center mt-6 py-3"
                  size={32}
                />
              )}

              {!loading && (
                <button
                  className="mt-6 w-3/4 bg-blue-cvl-900 py-3 rounded-md text-white shadow-md hover:bg-blue-cvl-700 active:bg-blue-cvl"
                  onClick={onUpdatePassword}
                >
                  Update
                </button>
              )}

              <div
                className="text-sm text-center mt-10 text-gray-400 cursor-pointer hover:text-blue-cvl-500 hover:underline"
                onClick={() => setViewPort("login")}
              >
                Back to Login
              </div>
            </form>
          )}

          {viewPort === "forgotPassword" && (
            <form
              // onSubmit={onSubmit}
              className="flex flex-col justify-center items-center md:w-1/4 w-full mx-10 md:mx-32 bg-white md:py-32  shadow-md"
            >
              <Image height="50" width="140" src="/logo.png" />
              {/* Title or Logo */}
              {/* <div className="text-lg font-bold uppercase text-gray-700">Login </div> */}
              {/* Form with email and passord */}
              <input
                className="focus:outline-none border-2 py-3 w-3/4 px-3 rounded-md focus:border-blue-cvl-600 mt-3 text-sm text-gray-600 shadow-inner"
                placeholder="email@company.example"
                type="email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setDialogIsShown(false);
                }}
              />

              {loading && (
                <Spinner
                  className="container mx-auto w-3/4 justify-center items-center mt-6 py-3"
                  size={32}
                />
              )}

              {!loading && (
                <button
                  className="mt-6 w-3/4 bg-blue-cvl-900 py-3 rounded-md text-white shadow-md hover:bg-blue-cvl-700 active:bg-blue-cvl"
                  onClick={onsendChangePassword}
                >
                  Send me a new password
                </button>
              )}

              <div
                className="text-sm text-center mt-10 text-gray-400 cursor-pointer hover:text-blue-cvl-500 hover:underline"
                onClick={() => setViewPort("login")}
              >
                Back to Login
              </div>
            </form>
          )}
        </>
      )}

      {userLoggedIn && (
        <div className="flex flex-col items-center justify-center">
          <Spinner />{" "}
        </div>
      )}
    </div>
  );
}
