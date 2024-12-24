import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const basePath = process.env.FILE_PATH;
const TARGET_PREFIX = process.env.TARGET_PREFIX;
const FILE_NAME = "data.json";

const BOOK_DIRECTORY_NAME_PATTERN = {
  MAJOR: /^[A-Za-z]?\d00$/,
  MINOR: /^[A-Za-z]?\d[1-9]0$/,
  SUB: /^[A-Za-z]?\d[1-9]0\.\d{2}$/,
};

const START_DISTANCE = 20;

const STAR_PATTERN = {
  TAG: /#(?!#)[^\s\n]+/g,
  LINK: /\[\[(.*?)\]\]/g,
  BOOK: /^KR\-.*/,
  TITLE: /title:\s(.*)/g,
  DESCRIPTION: /description:\s(.*)/g,
  TYPE: /^KR-P-/,
  GROUP: {
    STAR: /[a-zA-Z]$/,
    CONSTELLATION_P: /\d[1-9]0$/,
    ASSOCIATION_P: /\d00$/,
    CONSTELLATION_KR: /\.\d{2}$/,
    ASSOCIATION_KR: /\d[1-9]0$/,
    CLUSTER: /\d00$/,
  },
};

function checkVaild(stat, fullPath) {
  const baseName = path.basename(fullPath);
  const prefix = baseName.slice(0, 2);

  if (stat.isDirectory()) {
    return Object.values(BOOK_DIRECTORY_NAME_PATTERN).some((pattern) =>
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
  #position = [0, 0, 0];
  #type = "KR";
  #group = "";

  constructor(filePath, data) {
    this.#id = path.basename(filePath);
    this.#data = data;
  }

  initialize() {
    this.#updateTags();
    this.#updateLinks();
    this.#updateTitle();
    this.#updateDescription();
    this.#updateType();
    this.#updateGroup();
    this.#updatePosition();
  }

  #updatePosition() {
    if (this.#type === "KR") {
      let n = 0;
      switch (this.#group) {
        case "cluster":
          n = parseInt(Number(this.#id.replace(/\.md$/, "").slice(-3)) / 100);
          this.#position = [
            START_DISTANCE,
            Math.PI / 2,
            (n + 1) * (Math.PI / 4),
          ];
          break;
        case "association":
          n = parseInt(Number(this.#id.replace(/\.md$/, "").slice(-2)) / 10);
          this.#position = [
            2 * START_DISTANCE,
            (Math.PI / 12) * (4 + 2 * Math.min(n - 1, 8 - n - 1)),
            (Math.PI / 12) * (2 - Math.abs(((n - 1 + 2) % 8) - 4)),
          ];

          break;
        case "constellation":
          break;
        case "star":
          break;
      }
    }
  }
  #updateGroup() {
    const id = this.#id.replace(/\.md$/, "");

    if (this.#type === "P") {
      if (id.match(STAR_PATTERN.GROUP.STAR)) {
        this.#group = "star";
      } else if (id.match(STAR_PATTERN.GROUP.CONSTELLATION_P)) {
        this.#group = "constellation";
      } else if (id.match(STAR_PATTERN.GROUP.ASSOCIATION_P)) {
        this.#group = "association";
      } else {
        this.#group = "unknown";
      }
    } else {
      if (id.match(STAR_PATTERN.GROUP.STAR)) {
        this.#group = "star";
      } else if (id.match(STAR_PATTERN.GROUP.CONSTELLATION_KR)) {
        this.#group = "constellation";
      } else if (id.match(STAR_PATTERN.GROUP.ASSOCIATION_KR)) {
        this.#group = "association";
      } else if (id.match(STAR_PATTERN.GROUP.CLUSTER)) {
        this.#group = "cluster";
      } else {
        this.#group = "unknown";
      }
    }
  }
  #updateType() {
    if (this.#id.match(STAR_PATTERN.TYPE)) {
      this.#type = "P";
    }
  }
  #updateTags() {
    // /#(?!#)[^\s\n]+/g, 부정전방탐색 ##같이 #연속으로 발생하지않는 조건 and \s\n와같은 공백 전까지 한가지 이상의 문자, 전역 탐색

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
      position: this.#position,
      group: this.#group,
      type: this.#type,
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
      if (star.getStar().group === "cluster") {
        allStars.push(star.getStar());
      }
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
      console.log(`created ${FILE_NAME}`);
    }
  });
}

processFiles();
