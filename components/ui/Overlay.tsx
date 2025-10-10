import React from "react";

interface OverlayProps {
  isVisible: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  zIndex?: number;
  children?: React.ReactNode;
}

const Overlay: React.FC<OverlayProps> = ({
  isVisible,
  onClick,
  className = "",
  zIndex = 1000,
  children,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/25 ${className}`}
      style={{ zIndex }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Overlay;
