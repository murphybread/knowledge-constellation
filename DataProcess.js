import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const basePath = process.env.FILE_PATH;
const targetFileName = process.env.FILE_NAME;
const TARGET_PREFIX = process.env.TARGET_PREFIX;
const FILE_NAME = "data.json";

const BOOK_NAME_PATTERN = {
  MAJOR: /^[A-Za-z]?\d00$/,
  MINOR: /^[A-Za-z]?\d[1-9]0$/,
  SUB: /^[A-Za-z]?\d[1-9]0\.\d{2}$/,
};

const STAR_PATTERN = {
  TAG: /#(?!#)[^\s\n]+/g,
  LINK: /\[\[(.*?)\]\]/g,
  BOOK: /^KR\-.*/,
  TITLE: /title:\s(.*)/g,
  DESCRIPTION: /description:\s(.*)/g,
};

function checkVaild(stat, fullPath) {
  const baseName = path.basename(fullPath);
  const prefix = baseName.slice(0, 2);

  if (stat.isDirectory()) {
    return Object.values(BOOK_NAME_PATTERN).some((pattern) =>
      pattern.test(baseName)
    );
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
    this.#updateLinks();
    this.#updateTitle();
    this.#updateDescription();
  }

  #updateTags() {
    // 부정전방탐색 ##같이 #연속으로 발생하지않는 조건 and \s\n와같은 공백 전까지 한가지 이상의 문자, 전역 탐색

    // 코드블럭상의 내용 필터링
    const filteredData = this.#data
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^]*`/g, "");

    const tag = filteredData.match(STAR_PATTERN.TAG);
    this.#tag = tag;
  }

  #updateLinks() {
    // /\[\[(.*?)\]\]/g 과 같이 [[]]안의 한가지 이상의 문자에대해 캡처그룹 생성. [[]]안에 [[]]이 선언될 수도있어서 비탐욕적이쿼드?사용
    const link = [...this.#data.matchAll(STAR_PATTERN.LINK)].map(
      (match) => match[1]
    );

    // /^KR\-.*/ KR-로 시작하는지 여부로 Link 패턴여부 Vaildate
    const filteredLink = link.filter((link) => STAR_PATTERN.BOOK.test(link));
    this.#link = filteredLink;
  }

  #updateTitle() {
    const matches = [...this.#data.matchAll(STAR_PATTERN.TITLE)][0][1];
    this.#title = matches;
  }

  #updateDescription() {
    const matches = [...this.#data.matchAll(STAR_PATTERN.DESCRIPTION)][0][1];
    this.#description = matches;
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
  fs.writeFile(FILE_NAME, JSON.stringify(allStars, null, 2), (err) => {
    if (err) {
      console.log(err.stack);
    } else {
      console.log(FILE_NAME);
    }
  });
}

processFiles();
