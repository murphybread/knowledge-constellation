## 프로젝트 목적

블로그글들을 별처럼 표현하여 전체적인 지식베이스 유니버스를 보여주는 서비스

## 시나리오

어느 정도 블로그용 글이 싸인 머피는 자신의 블로그글이 좀더 화려한 방식으로 방문자에게 보여주기를 원합니다.
그래서 별자리라는 테마를 생각하게 돼었는데요.
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

### 기능 목록

- 데이터 변환 작업: 현재 작성한 블로그글 MD파일들을 목적에 따라 JSON형태로 변환
- 데이터 전처리: D3.js를 활용하여 JSON데이터를 렌더링하기 위해 가공
  - 별 클릭시 해당 글로 이동
- 3D 렌더링: Three.js를 활용하여 D3의 데이터를 별로 표현
  - 링크가 많은 만큼 별 크게 보이기
  - 링크가 존재하면 두 노드에 대해 선이 보여야함(나중에 별끼리 모였을때 별자리처럼 보이게)

데이터구조
link의 1번째 값은 항상 자기 자신의 링크
별 1개의 구조

```
{
  id: 실제 저장된 파일이름,
  tag: [tag1,tag2...],
  link: [selfFileName, linkedFileName1, linkedFileName2 ...]
  title: 메타태그의 타이틀,
  description: 메타태그의 디스크립션
}
```
