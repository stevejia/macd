export const formatDate = (dateStr: string, seperator = "-") => {
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  const hour = dateStr.slice(8, 10);
  const minute = dateStr.slice(10, 12);
  const second = dateStr.slice(12, 14);

  return `${year}${month ? seperator + month : ""}${
    day ? seperator + day : ""
  }${hour ? " " + hour : ""}${minute ? `:${minute}` : ""}${
    second ? `:${second}` : ""
  }`;
};
