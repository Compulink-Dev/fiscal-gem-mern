import React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  style?: any;
  htmlFor: string;
}

const Label: React.FC<LabelProps> = ({ children, htmlFor, style = {} }) => {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "block",
        marginBottom: "6px",
        fontSize: "12px",
        fontWeight: "bold",
        ...style,
      }}
    >
      {children}
    </label>
  );
};

export default Label;
