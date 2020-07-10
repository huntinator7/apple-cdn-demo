import React from "react";

type size = "small" | "medium" | "large";

export const sizeToNumber: { [key in size]: { r: number; fill: string } } = {
  small: { r: 6, fill: "#AEECEF" },
  medium: { r: 8, fill: "#6D9DC5" },
  large: { r: 10, fill: "#3066BE" },
};

const latToX = (lat: number): number => {
  return (3821 * (lat + 180)) / 360 + 40;
};

const longToY = (long: number): number => {
  return (1982 * (-long + 90)) / 180 + 100;
};

export interface PointInfoType {
  lat: number;
  long: number;
  size: size;
  name: string;
}

export interface PointType extends PointInfoType {
  id: number;
  cache?: boolean;
}

const defaultPoint: PointType = {
  lat: 0,
  long: 0,
  size: "small",
  id: -1,
  name: "Null Island",
};

interface PointProps extends PointType {}

export const Point = ({ lat, long, size, name, cache }: PointProps) => {
  return (
    <circle
      cx={latToX(lat)}
      cy={longToY(long)}
      stroke="black"
      strokeWidth="2"
      style={{ zIndex: 1002 }}
      {...sizeToNumber[size]}
      {...(cache && { fill: "#0a0" })}
      {...(name === "Customer" && { fill: "#fff" })}
    />
  );
};

export interface LineType {
  id1: number;
  id2: number;
  weight: number;
}

interface LineProps extends LineType {
  nodes: PointProps[];
  shorterRes?: boolean;
  longerRes?: boolean;
}

export const Line = ({
  id1,
  id2,
  weight,
  nodes,
  shorterRes,
  longerRes,
}: LineProps) => {
  const firstCoord = nodes.find((n) => n.id === id1) ?? defaultPoint;
  const secondCoord = nodes.find((n) => n.id === id2) ?? defaultPoint;
  return (
    <line
      x1={latToX(firstCoord.lat)}
      y1={longToY(firstCoord.long)}
      x2={latToX(secondCoord.lat)}
      y2={longToY(secondCoord.long)}
      style={{
        stroke: shorterRes ? "#0a0" : longerRes ? "#a00" : "#0002",
        strokeWidth: Math.ceil(weight / 10),
        zIndex: 1001,
      }}
    />
  );
};
