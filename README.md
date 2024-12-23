## 프로젝트 목적

블로그글들을 별처럼 표현하여 전체적인 지식베이스 유니버스를 보여주는 서비스입니다

시나리오등에 언급되지 않는 내용은 임의로 판단하여 작성할 것

## 시나리오

어느 정도 블로그에 작성된 글이 쌓인 머피는 자신의 블로그글이 좀더 화려한 방식으로 방문자에게 보여주기를 원합니다.
그래서 별자리라는 테마를 생각하게 됐는데요.
각 글은 md파일형태로 저장돼 있으며 이는 하나의 별을 표현합니다. 블로그글은 Link와 Tag라는 특수한 속성이 존재합니다.

Link는 글 본문에서 [[파일이름]]과 같은 형식으로 작성돼있으며 이는 Link관계라고합니다.
Tag는 #Tag와 같이 글 본문에서 특정 태그를 나타냅니다.
이외에 메타태그 title이 있으며 다음과같은 형태로 선언됩니다(파일 이름과는 다름)

---

dg-publish: true
title: Debugging
description: 디버깅과 관련된 부분중 기술적인 내용에 대한 글 입니다.

---

블로그글은 일반적으로 2개의 종류가 있습니다. 카테고리 글과 컨텐츠 글입니다.
카테고리글은 마지막에 영어로 끝나지 않는 모든 글들입니다.
[[KR-000]] 기술 스택

- [[KR-010]] Dev
  - [[KR-010.00]] Debugging

컨텐츠 글은 파일 이름 마지막에 영어로 끝나면 특정 주제에대한 설명이 들어가 있습니다.

- [[KR-010.00 a]] VSCode 브레이크 포인트를 활용한 디버깅

위와 같은 md파일을 활용하여 해당 파일들을 별자리 처럼 볼 수 있게 만드는 사이트를 구축해주세요

예시 사이트
[서울대 지식 유니버스](https://likesnu.snu.ac.kr/usr/popup/popupMobileUniverse.do)
![image](https://github.com/user-attachments/assets/a3d42253-3cdf-4327-afa1-a8a66c268c79)

### 기능 목록

- 데이터 변환 작업: 현재 작성한 블로그글 MD파일들을 목적에 따라 JSON형태로 변환

  - recursive하게 가장 상위 디렉터리에서 시작하여 파일 탐색
  - 유효한 파일 경로들 탐색 후 각 파일 별로 해당 작업 수행

    - 정규표현식 활용하여 블로그글에 해당하는 파일인 경우 경로 반환 후 배열에 추가
    - [x] id 필터링된 경로값으로 등록
    - [x] tag 프로퍼티 감지 #문자 형태를 정규표현식으로 사용하여 전처리후 저장
    - [x] link 프로퍼티 감지 [[]] 형태로 Link관계 탐색
      - [x] 가장 먼저 나온 패턴 형태로 배열에 추가. 자기 자신링크에 대한 경우 0번쨰 인덱스
    - [x] title: metatag의 `title: `패턴의 첫번쨰 값 사용
    - [x] description: metatag의 `description: `패턴의 첫번 째 값 사용
    - [] weblink 실제 웹상에서 배포된 글 링크. 추후 웹연동시 고려하기
    - [ ] position 태그에 기반. 레벨에 따라 그룹 분류 (r,phi, theta)

      - Cluster (r, Math.PI/2 , 360도 8등분)
      - Assocation (2r, Math.PI/12 (4 + 2\* Math.min(n-1,8-)n-1)) ) , (Math.PI / 12) \* (2 - Math.abs(((n - 1 + 2) % 8) - 4)))
      - Constellation (4r, 2\*pi/4(n-1) ,pi/12[2- abs( (((n-1)+2))mod8)-4) ])
      - Star 해당 constellation중심으로 랜덤한 값의 r,phi,theta추가

    - [x] group 해당 글이 어떤 그룹에 속하는지 고정된 4개의 값중 하나 [Cluster, Association, Constellation, Star]

      - 단위: 별 [[KR-010.10 a]](글 1개)
      - 단위: 별자리 - [[KR-010.10]] HTML,CSS,JavaScript (글 여러개)
      - 단위: 성협 [[KR-010]] Dev (별자리가 1개 이상)
      - 단위: 성단 [[KR-000]] 기술 스택 (성협이 1개이상)
      - 단 type이 P인경우 별->별자리->성협만을 단위로 가짐

    - [x] type P or KR을 확인하는 태그. P의 경우 개인적인 내용의 글이라는 의미

  - [x] 최종 star 클래스의 값을 배열에 담아 파일 형태로 저장

- 3D 렌더링: Three.js를 활용하여 데이터 객체를 기준으로 별로 표현
  - 검색 창
    - 노드 제목을 통한 검색 기능
    - 노드 태그 기반 검색 기능
  - 첫 화면에 모든 노드들이 보이게하기 (글자 안 보이게)
  - 노드 관련
    - hover시 제목과 정보 표시
    - 링크가 많은 만큼 별 크게 보이기
    - 링크가 존재하면 두 노드에 대해 선이 보여야함(나중에 별끼리 모였을때 별자리처럼 보이게)
    - 각 태그 별로 색을 구분하게 할 것
  - [ ] 마우스 휠을 통한 확대, 축소 기능
  - [ ] 마우스 클릭한 상태에서 카메라 시야각도 회전 기능

## 현재 프로그램 흐름

### DataProcess.js (로컬의 md파일들을 원하는 형태의 JSON으로 저장)

1. findFiles를통해 유용한 경로를 가지는 md파일의 경로만을 배열에 저장
2. updateJsonFromFiles를 통해 해당 경로 파일들에 대한 star클래스와 정보를 업데이트한 후 저장
3. allStars에 저장된 해당 값을 fs.writeFile을 통해 json파일로 저장

데이터구조
link의 1번째 값은 항상 자기 자신의 링크
별 1개의 구조

```
{
  id: "실제 저장된 파일이름",
  tag: [tag1,tag2...],
  link: [selfFileName, linkedFileName1, linkedFileName2 ...]
  title: "메타태그의 타이틀",
  description: "메타태그의 디스크립션",
  data: "글 본문",
  webLink: url,
  position: [x,y,z],
  group: [Cluster or Association or Constellation or Star]
  type: [KR or P]
}
```
