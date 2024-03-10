import React from "react";
import "./LandingPage.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
}

const LandingPageButton: React.FC<ButtonProps> = ({ title, ...props }) => {
  return <button className="landing-button-page" {...props}>{title}</button>;
};

export default LandingPageButton;
