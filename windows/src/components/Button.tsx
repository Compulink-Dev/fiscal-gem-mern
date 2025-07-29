import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  style?: any;
  onClick: any;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  style = {},
  children,
  onClick,
  ...rest
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 20px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
