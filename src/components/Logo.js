import React from "react";
import { Link } from "react-router-dom";
import "./fonts.css";

const Logo = (props) => {
  return (
    <div style={{ display: "flex" }}>
      {/* <img src="/static/imgs/logo-head.png" width="40px"></img> */}
      <Link to="/">
        <p
          id="logo-text"
          style={{ fontFamily: "Poppins", fontWeight: 900, fontSize: "25px" }}
        >
          whacky.app
        </p>
      </Link>
    </div>
  );
};

export default Logo;
