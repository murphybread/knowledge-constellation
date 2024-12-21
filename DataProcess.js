import fs from "fs";
import path from "path";

const FILE_NAME = "Call Number Index KR.md";

fs.readFile(FILE_NAME, "utf-8", (err, data) => {
  console.log(data);
});
