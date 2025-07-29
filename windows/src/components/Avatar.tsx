import React from "react";

interface AvatarProps {
  src: string;
  alt?: string;
  size: number;
  style?: any;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  size = 40,
  alt = "Avatar",
  style = {},
}) => {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        ...style,
      }}
    />
  );
};

export default Avatar;
