import React from "react";
import { Link } from "react-router-dom";

export default function PicnicNav() {
  return (
    <div style={navBar}>
      <Link to="/picnic-registration" style={navBtn}>
        ➕ সদস্য রেজিস্ট্রেশন
      </Link>

      <Link to="/registered-members" style={navBtn}>
        📋 রেজিস্ট্রেশন লিস্ট
      </Link>
    </div>
  );
}

const navBar = {
  display: "flex",
  gap: "10px",
  marginBottom: "20px",
  padding: "10px 0",
  flexWrap: "wrap"
};

const navBtn = {
  background: "#6A1B9A",
  padding: "10px 15px",
  borderRadius: "8px",
  color: "white",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: "600"
};