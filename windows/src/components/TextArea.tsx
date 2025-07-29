import React from "react";

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  style?: any;
}

const TextArea: React.FC<TextAreaProps> = ({ style = {}, ...props }) => {
  return (
    <textarea
      {...props}
      style={{
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        width: "100%",
        boxSizing: "border-box",
        resize: "vertical",
        ...style,
      }}
    />
  );
};

export default TextArea;
