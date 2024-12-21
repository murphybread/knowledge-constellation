import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const basePath = process.env.FILE_PATH;
const targetFileName = process.env.FILE_NAME;
const TARGET_PREFIX = process.env.TARGET_PREFIX;

const patterns = {
  MAJOR: /^[A-Za-z]?\d00$/,
  MINOR: /^[A-Za-z]?\d[1-9]0$/,
  SUB: /^[A-Za-z]?\d[1-9]0\.\d{2}$/,
};

function checkVaild(stat, fullPath) {
  const baseName = path.basename(fullPath);
  const prefix = baseName.slice(0, 2);

  if (stat.isDirectory()) {
    return Object.values(patterns).some((pattern) => pattern.test(baseName));
  }
  console.log(prefix, TARGET_PREFIX);
  if (stat.isFile() && prefix !== TARGET_PREFIX) {
    return false;
  }

  return true;
}

const results = [];

function findFiles(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file); // 현재 경로
    const stat = fs.statSync(fullPath);

    console.log(`fullPath ${fullPath}  stat ${stat}`);
    if (!checkVaild(stat, fullPath)) {
      continue;
    }

    console.log(`vaild ${fullPath}`);

    if (stat.isDirectory()) {
      findFiles(fullPath);
    } else {
      results.push(fullPath);
    }
  }
  return results; // 모든 파일 경로 반환
}

const foundFilePathArray = findFiles(basePath);
console.log(`foundFilePathArray ${foundFilePathArray}`);

// if (foundPath) {
//   fs.readFile(foundPath, "utf-8", (err, data) => {
//     if (err) {
//       console.error("파일 읽기 오류:", err);
//       return;
//     }
//     console.log("파일 내용:", data);
//   });
// } else {
//   console.log("파일을 찾을 수 없습니다.");
// }
