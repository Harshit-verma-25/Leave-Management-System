import React from "react";

export default function formatDate(dateString: string): React.ReactNode {
  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const ORDINAL_SUFFIXES = ["th", "st", "nd", "rd"];

  const [year, month, day] = dateString.split("-");

  const dayNumber = parseInt(day, 10);
  const suffixIndex =
    dayNumber % 10 <= 3 && Math.floor(dayNumber / 10) !== 1
      ? dayNumber % 10
      : 0;

  const monthIndex = parseInt(month, 10) - 1;
  return (
    <>
      {MONTHS[monthIndex]} {dayNumber}
      <sup>{ORDINAL_SUFFIXES[suffixIndex]}</sup>, {year}
    </>
  );
}
