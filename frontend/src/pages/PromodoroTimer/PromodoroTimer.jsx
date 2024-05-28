import React, { useState, useEffect, useRef } from "react";
import FlipCountdown from "@rumess/react-flip-countdown";
import Sidebar from "../../components/Sidebar/Sidebar";
import "tailwindcss/tailwind.css";
import breakSound from "../../assets/EndSound.mp3";
import { time } from "echarts";
import axios from "axios";
import { useUser } from "../../hook/useUser";
import { Navigate } from "react-router-dom";

const Pomodoro = () => {
  const [sessionLength, setSessionLength] = useState(25);
  const [breakLength, setBreakLength] = useState(5);
  const [breakStatus, setBreakStatus] = useState(false);
  const [currentPhase, setCurrentPhase] = useState("pomodoro");
  const [timeLeft, setTimeLeft] = useState(sessionLength * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [startMinutes, setStartMinutes] = useState(0);
  const [dataPosting, setDataPosting] = useState(false);
  const intervalRef = useRef(null);
  const [task, setTask] = useState("");
  const { loading, userData } = useUser();

  if (!loading && userData.length == 0) {
    return <Navigate to="/signin" />;
  }
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime === 0) {
            if (currentPhase === "session") {
              setCurrentPhase("break");
              return breakLength * 60;
            } else {
              setCurrentPhase("session");
              return sessionLength * 60;
            }
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, currentPhase, breakLength, sessionLength]);

  const handleStart = () => {
    let task1 = prompt("Please enter your task");
    while (task1 === "") {
      task1 = prompt("Please enter a valid task");
    }
    if (task1 === null) return;
    const mins = new Date().getTime() / 60000;
    setStartMinutes(mins);
    setTask(task1);
    setIsRunning(true);
    setCurrentPhase(task1);
    // console.log(task);
  };

  const handleStartBreak = () => {
    setIsRunning(true);
    setBreakStatus(true);
    setTimeLeft(breakLength * 60);
    setCurrentPhase("break");
  };

  const handleStopBreak = () => {
    setIsRunning(false);
    alert("Break ended! Its time to start your session!");
    setCurrentPhase("session");
    setBreakStatus(false);
  };

  const handleStop = async () => {
    console.log(task);
    const stopMinutes = new Date().getTime() / 60000;
    const minutes = stopMinutes - startMinutes;
    const totalHours = minutes;
    if (totalHours < 3) {
      alert("You have not  for atleast 4 minutes. Please continue studying.");
      return;
    }
    setIsRunning(false);
    const period = new Date().getHours();
    const age = userData.age;
    setDataPosting(true);
    try {
      const res = await axios.post(
        "/api/stats",
        { minutes, task },
        { withCredentials: true }
      );
      const fetchBreak = await axios.post("https://ai.tanish.me/predict", {
        period,
        totalHours,
        age,
      });
      alert(
        "Session ended! Its time for your break! You also can reload the page to start a new session."
      );
      setBreakLength(Math.ceil(fetchBreak.data.break / 60));
      setDataPosting(false);
      setCurrentPhase("break");
      setBreakStatus(true);
    } catch (e) {
      console.log(e);
      alert("Cannot save your session data. Please try again later.");
      setDataPosting(false);
    }
  };

  const handleClear = () => {
    setIsRunning(false);
    setCurrentPhase("pomodoro");
    setTimeLeft(sessionLength * 60);
  };

  const handleSessionIncrement = () => {
    setSessionLength((prev) => prev + 1);
  };

  const handleSessionDecrement = () => {
    setSessionLength((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleBreakIncrement = () => {
    setBreakLength((prev) => prev + 1);
  };

  const handleBreakDecrement = () => {
    setBreakLength((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleSessionChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setSessionLength(isNaN(value) ? 1 : value);
  };

  const handleBreakChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setBreakLength(isNaN(value) ? 1 : value);
  };

  function formatDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  function getFutureDate(timeLeftInSeconds) {
    const currentTimeInSeconds = new Date().getTime() / 1000;
    const futureTimeInSeconds = currentTimeInSeconds + timeLeftInSeconds;
    const futureDate = new Date(futureTimeInSeconds * 1000);

    return formatDateTime(futureDate);
  }

  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(sessionLength * 60);
    }
  }, [sessionLength, isRunning]);

  return (
    <div
      className="flex items-center justify-center w-screen min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          'url("https://static.pexels.com/photos/6663/desk-white-black-header.jpg")',
      }}
    >
      <Sidebar />
      <div className="bg-transparent p-6 rounded-lg w-full max-w-lg mx-auto text-center">
        {!isRunning ? (
          <>
            <div className="flex justify-center mb-4">
              {!breakStatus ? (
                <div className="text-center">
                  <p className="text-black pb-2">Session Length (in Mins)</p>
                  <div className="flex items-center justify-center">
                    <button
                      className="bg-black hover:bg-white hover:text-black text-lg text-white px-4 py-2 rounded"
                      onClick={handleSessionDecrement}
                    >
                      -
                    </button>
                    <div className="mx-2 text-lg px-11 py-3 text-black">
                      <input
                        type="text"
                        className="bg-transparent w-8 text-center"
                        value={sessionLength}
                        onChange={handleSessionChange}
                      />
                    </div>
                    <button
                      className="bg-black hover:bg-white hover:text-black text-lg text-white px-4 py-2 rounded"
                      onClick={handleSessionIncrement}
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  {/* {alert (`Your suggested break length is ${breakLength} mins. You also change the break length.`)} */}
                  <p className="text-black pb-2">Break Length (in Mins)</p>
                  <div className="flex items-center justify-center">
                    <button
                      className="bg-black hover:bg-white hover:text-black text-lg text-white px-4 py-2 rounded"
                      onClick={handleBreakDecrement}
                    >
                      -
                    </button>
                    <div className="mx-2 text-lg px-11 py-3 text-black">
                      <input
                        type="text"
                        className="bg-transparent w-8 text-center"
                        value={breakLength}
                        onChange={handleBreakChange}
                      />
                    </div>
                    <button
                      className="bg-black hover:bg-white hover:text-black text-lg text-white px-4 py-2 rounded"
                      onClick={handleBreakIncrement}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-center text-black text-xs items-center mb-4">
              <FlipCountdown
                hideYear
                hideMonth
                hideDay
                hourTitle="Hours"
                minuteTitle="Minutes"
                secondTitle="Seconds"
                theme="dark"
                size="medium"
                // onTimeUp={() => {const audio = new Audio (breakSound); audio.play();}}
                endAtZero
                endAt={getFutureDate(0)} // End time in Unix timestamp
              />
            </div>
          </>
        ) : (
          <div
            div
            className="flex justify-center text-black text-xs items-center mb-4"
          >
            <FlipCountdown
              hideYear
              hideMonth
              hideDay
              hourTitle="Hours"
              minuteTitle="Minutes"
              secondTitle="Seconds"
              theme="dark"
              size="medium"
              // onTimeUp={() => {const audio = new Audio (breakSound); audio.play();}}
              endAtZero
              endAt={getFutureDate(timeLeft)} // End time in Unix timestamp
            />
          </div>
        )}
        {/* <FlipCountdown
            hideYear
            hideMonth
            hideDay
            hourTitle="Hours"
            minuteTitle="Minutes"
            secondTitle="Seconds"
            theme="dark"
            size="medium"
            onTimeUp={() => {const audio = new Audio (breakSound); audio.play();}}
            endAtZero
            endAt={getFutureDate(timeLeft)} // End time in Unix timestamp
            
          /> */}

        <div className="text-center mb-4 flex items-center justify-center">
          <div
            id="stats"
            className="bg-gray-800 items-center justify-center text-gray-200 h-16 py-1 px-1 rounded-lg text-5xl"
          >
            {currentPhase}
          </div>
        </div>
        {!isRunning ? (
          <div className="flex justify-center space-x-4">
            {breakStatus ? (
              <button
                className="bg-black hover:text-black hover:bg-white text-white px-4 py-2 rounded-lg"
                onClick={handleStartBreak}
              >
                Start Break
              </button>
            ) : (
              <button
                className="bg-black hover:text-black hover:bg-white text-white px-4 py-2 rounded-lg"
                onClick={handleStart}
              >
                Start Session
              </button>
            )}
            {/* <button className="bg-black hover:text-black hover:bg-white text-white px-4 py-2 rounded-lg" onClick={handleStop}>Stop</button> */}
            {/* <button className="bg-black hover:text-black hover:bg-white text-white px-4 py-2 rounded-lg" onClick={handleClear}>Reset</button> */}
          </div>
        ) : (
          <div className="flex justify-center space-x-4">
            {breakStatus ? (
              <button
                className="bg-black hover:text-black hover:bg-white text-white px-4 py-2 rounded-lg"
                onClick={handleStopBreak}
              >
                End Break
              </button>
            ) : (
              <button
                className="bg-black hover:text-black hover:bg-white text-white px-4 py-2 rounded-lg"
                onClick={handleStop}
              >
                {dataPosting ? <p>Saving Your Session</p> : <p>End Session</p>}
              </button>
            )}
            {/* <button className="bg-black hover:text-black hover:bg-white text-white px-4 py-2 rounded-lg" onClick={handleStop}>End Session</button> */}
            {/* <button className="bg-black hover:text-black hover:bg-white text-white px-4 py-2 rounded-lg" onClick={handleStop}>Stop</button> */}
            {/* <button className="bg-black hover:text-black hover:bg-white text-white px-4 py-2 rounded-lg" onClick={handleClear}>Reset</button> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pomodoro;