import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const basePath = process.env.FILE_PATH;
const targetFileName = process.env.FILE_NAME;
const TARGET_DIRECTORY_NAME = process.env.TARGET_DIRECTORY_NAME;

// console.log(fs.readdirSync(basePath));
// console.log(fs.statSync(basePath));

function findFiles(dir) {
  let results = []; // 결과 배열

  const files = fs.readdirSync(dir);

  for (const file of files) {
    console.log(file);
    if (TARGET_DIRECTORY_NAME !== file) {
      continue;
    }
    const fullPath = path.join(dir, file); // 현재 경로
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // 하위 디렉터리 재귀 탐색
      results = results.concat(findFiles(fullPath));
    } else {
      // 파일이면 결과 배열에 추가
      results.push(fullPath);
    }
  }
  return results; // 모든 파일 경로 반환
}

const foundFilePathArray = findFiles(basePath);
console.log(foundFilePathArray);

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
