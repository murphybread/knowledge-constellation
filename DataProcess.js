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
  if (stat.isFile() && prefix.toLowerCase() !== TARGET_PREFIX.toLowerCase()) {
    return false;
  }

  return true;
}

function findFiles(dir) {
  const results = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file); // 현재 경로
    const stat = fs.statSync(fullPath);

    if (!checkVaild(stat, fullPath)) {
      continue;
    }

    if (stat.isDirectory()) {
      results.push(...findFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results; // 모든 파일 경로 반환
}

class Star {
  #id;
  #tag = [];
  #link = [];
  #title = "";
  #description = "";
  #data;
  #webLink = "";

  constructor(filePath, data) {
    this.#id = path.basename(filePath);
    this.#data = data;
  }

  initialize() {
    this.#updateTags();
  }

  #updateTags() {
    // 부정전방탐색 ##같이 #연속으로 발생하지않는 조건 and \s\n와같은 공백 전까지 한가지 이상의 문자, 전역 탐색
    const pattern = /#(?!#)[^\s\n]+/g;
    const tags = this.#data.match(pattern);

    this.#tag = tags;
  }

  getStar() {
    return {
      id: this.#id,
      tag: this.#tag,
      link: this.#link,
      title: this.#title,
      description: this.#description,
      data: this.#data,
      webLink: this.#webLink,
    };
  }
}

// {
//   id: "실제 저장된 파일이름",
//   tag: [tag1,tag2...],
//   link: [selfFileName, linkedFileName1, linkedFileName2 ...]
//   title: "메타태그의 타이틀",
//   description: "메타태그의 디스크립션",
//   data: "글 본문",
//   webLink: url,
// }

async function updateJsonFromFiles(FilePathArray) {
  const allStars = [];
  for (const filePath of FilePathArray) {
    try {
      const data = await fs.promises.readFile(filePath, "utf-8");
      const star = new Star(filePath, data);
      star.initialize();
      allStars.push(star.getStar());
    } catch (err) {
      console.error("파일 읽기 오류:", err);
    }
  }
  return allStars;
}

async function processFiles() {
  const FilePathArray = findFiles(basePath);

  const allStars = await updateJsonFromFiles(FilePathArray);
  console.log(JSON.stringify(allStars.slice(0, 2), null, 2));
}

processFiles();
