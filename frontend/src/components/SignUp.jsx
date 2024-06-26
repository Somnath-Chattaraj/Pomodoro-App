import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { styles } from "../style";
import { EarthCanvas2 } from "./canvas";
import { SectionWrapper } from "./hoc";
import { slideIn } from "../utils/motions";
import { Button } from "@nextui-org/react";

import axios from "axios";

const Signup = () => {
  const formRef = useRef();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    age: "",
    password: "",
  });

  const handleChange = (e) => {
    const { target } = e;
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate age
    const age = parseInt(form.age, 10);
    if (isNaN(age) || age <= 0) {
      alert("Age can't be negative or zero.");
      return;
    }

    const emailRegex = /^[\w-]+(\.[\w-]+)*@gmail\.com$/;
    if (!emailRegex.test(form.email)) {
      alert("Email must be a Gmail address. This is being done to combat spam");
      return;
    }

    setLoading(true);
    try {
      await axios
        .post("/api/user/", form, {
          withCredentials: true,
        })
        .then((res) => {
          console.log(res.data);
          setLoading(false);
          alert("Account created successfully. Please verify email");
          window.location.href = "/signin";
        });
    } catch (err) {
      console.log(err);
      setLoading(false);
      alert("Could not sign up. Please try again.");
    }
  };

  return (
    <div
      className={`xl:mt-12 flex xl:flex-row flex-col-reverse gap-10 overflow-hidden`}
    >
      <motion.div
        variants={slideIn("left", "tween", 0.2, 1)}
        className="flex-[0.75] bg-black-100 p-8 rounded-2xl h-full"
      >
        <p className="text-white font-bold text-[30px]">SignUp</p>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-12 flex flex-col gap-8"
        >
          <label className="flex flex-col">
            <span className="text-white font-medium mb-4">Username</span>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter your Username"
              className="bg-tertiary py-4 px-6 placeholder:text-secondary text-black rounded-lg outline-none border-none font-medium"
            />
          </label>
          <div className="flex flex-row">
            <label className="flex flex-col w-[380px]">
              <span className="text-white font-medium mb-4">Name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your Name"
                className="bg-tertiary py-4 px-6 placeholder:text-secondary text-black rounded-lg outline-none border-none font-medium"
              />
            </label>
            <div className="invisible">&nbsp</div>
            <label className="flex flex-col w-[90px]">
              <span className="text-white font-medium mb-4">Age</span>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                placeholder="Age"
                className="bg-tertiary py-4 px-6 placeholder:text-secondary text-black rounded-lg outline-none border-none font-medium"
              />
            </label>
          </div>
          <label className="flex flex-col">
            <span className="text-white font-medium mb-4">Email</span>
            <input
              type="text"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your Email"
              className="bg-tertiary py-4 px-6 placeholder:text-secondary text-black rounded-lg outline-none border-none font-medium"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-white font-medium mb-4">Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your Password"
              className="bg-tertiary py-4 px-6 placeholder:text-secondary text-black rounded-lg outline-none border-none font-medium"
            />
          </label>

          <Link to="/signin" className="flex items-center gap-2 text-white">
            Already have an account?
            <div className="text-cyan-200">Login</div>
          </Link>

          <Button
            type="submit"
            variant="bordered"
            className={
              loading
                ? "bg-purple-900 cursor-not-allowed py-3 px-8 rounded-xl w-fit text-white font-bold shadow-md shadow-primary"
                : "bg-purple-600 hover:bg-purple-900 py-3 px-8 rounded-xl w-fit text-white font-bold shadow-md shadow-primary"
            }
          >
            {loading ? "Loading..." : "SignUp"}
          </Button>
        </form>
      </motion.div>

      <motion.div
        variants={slideIn("right", "tween", 0.2, 1)}
        className="xl:flex-1 xl:h-auto md:h-[550px] h-[350px] w-[700px]"
      >
        <EarthCanvas2 />
      </motion.div>
    </div>
  );
};

export default SectionWrapper(Signup, "contact");
