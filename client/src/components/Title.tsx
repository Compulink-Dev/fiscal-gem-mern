import { Gem } from "lucide-react";

interface TitleProps {
  collapsed?: boolean;
}

export function Title({ collapsed }: TitleProps) {
  return (
    <div className="text-green-600  flex items-center gap-1 p-2">
      {!collapsed && (
        <h1 className="text-xl font-semibold">
          {" "}
          <p className="text-lg font-bold">Fiscal </p>
        </h1>
      )}
      <span className="">
        <Gem />
      </span>
    </div>
  );
}
