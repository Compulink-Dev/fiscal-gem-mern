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
        padding: "6px 12px",
        backgroundColor: "#0F4D0F",
        color: "#fff",
        fontSize: "10px",
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
