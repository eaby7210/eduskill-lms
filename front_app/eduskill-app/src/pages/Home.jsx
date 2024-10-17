// import React from 'react';

import { useSelector } from "react-redux";
import { CategoryCard } from "../assets/components/Cards";
import Hero from "../assets/components/Hero";

const Home = () => {
  const user = useSelector((state) => state.user);
  console.log(user);
  return (
    <div>
      <Hero />
      <section className="grid md:grid-cols-2 sm:grid-cols-1  gap-3 items-center justify-items-center my-10">
        <CategoryCard title={"asdf"} content={"adsfasdfafd"} btnTXT={"btn"} />
        <CategoryCard title={"asdf"} content={"adsfasdfafd"} btnTXT={"btn"} />
        <CategoryCard title={"asdf"} content={"adsfasdfafd"} btnTXT={"btn"} />
        <CategoryCard title={"asdf"} content={"adsfasdfafd"} btnTXT={"btn"} />
      </section>
    </div>
  );
};

export default Home;
