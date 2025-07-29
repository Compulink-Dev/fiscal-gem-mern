import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  style?: any;
}

const Input: React.FC<InputProps> = ({ style = {}, ...props }) => {
  return (
    <input
      {...props}
      style={{
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        marginBottom: "8px",
        width: "100%",
        boxSizing: "border-box",
        ...style,
      }}
    />
  );
};

export default Input;
