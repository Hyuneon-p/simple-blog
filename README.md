# Simple Blog

Nuxt + Nuxt UI + Cloudflare D1. 현재는 **로컬 개발 환경만** 구성되어 있습니다.
원격 DB 생성, 배포, 도메인 연결은 수행하지 않습니다.

## 실행

Node.js 24 LTS와 pnpm을 사용합니다.

```sh
pnpm install
pnpm dev
```

`pnpm dev`는 먼저 로컬 D1 마이그레이션을 적용한 뒤 Nuxt 개발 서버를 실행합니다.
Cloudflare 계정 로그인 없이 로컬 DB로 개발할 수 있습니다.
데이터는 `.wrangler/state/v3/`에 유지됩니다. 이 디렉터리를 삭제하면 로컬 DB가 사라집니다.
`wrangler.jsonc`의 DB ID는 로컬용 자리표시자이고 `remote: false`로 설정되어 있습니다.

- `/`: 발행된 글 목록
- `/posts/[slug]`: 글 상세
- `/admin/editor`: 새 글 작성
- `/admin/manage`: 글 목록 관리
- `/admin/editor/[slug]`: 수정·삭제
- `/admin`: 글 관리로 이동

저장하면 바로 발행되고 상세 페이지로 이동합니다. slug는 제목에서 자동 생성하며,
중복은 숫자 접미사로 처리합니다. 수정 시 기존 URL을 유지합니다.
Nuxt UI Editor 본문은 HTML로 저장하고 서버에서 정제합니다. 문단 정렬을 지원하며
이전 Markdown 본문도 읽을 수 있습니다. 이미지 업로드는 아직 구현하지 않았습니다.

이번 환경 구성에서 기존 글 1개를 로컬 D1으로 가져왔고 원본과 일치함을 확인했습니다.
아래 가져오기 명령은 이미 데이터가 있는 현재 로컬 DB에 다시 실행하지 마세요.

## 기존 SQLite 데이터 가져오기 (새 로컬 DB에서만)

원본 `data/blog.sqlite`는 그대로 보존됩니다. 기존 앱에서 쓰기를 멈춘 뒤 실행하세요.

```sh
pnpm db:export:sqlite
pnpm db:migrate:local
pnpm exec wrangler d1 execute DB --local --file data/d1-import.sql
```

내보내기는 원본을 읽기 전용으로 열고 데이터 INSERT만 생성합니다.
SQL 파일이 이미 있으면 덮어쓰지 않습니다. 다른 경로는 다음처럼 지정합니다.

```sh
pnpm db:export:sqlite data/blog.sqlite data/d1-import-2.sql
```

가져오기는 빈 `posts` 테이블에 한 번만 수행하세요. 기존 ID/slug와 충돌하면 실패하며
기존 행을 덮어쓰지 않습니다. 가져오기 전후 글 수와 내용을 비교하세요.

## 검증

```sh
pnpm cf:types
pnpm typecheck
pnpm build
pnpm preview
```

`pnpm preview`는 빌드 결과를 로컬 Workers 런타임에서 실행합니다.
개발 서버(`pnpm dev`)만 관리자 인증을 생략합니다. 빌드된 서버는 Access 설정이 없으면
관리 API를 차단하므로 preview에서는 공개 화면과 인증 차단을 확인할 수 있습니다.

## 구조

- `app/pages/`: 화면
- `server/api/`: 비동기 D1 SQL 호출
- `server/utils/db.ts`: 요청별 D1 바인딩 접근
- `migrations/`: 버전 관리하는 D1 스키마
- `scripts/export-sqlite.mjs`: 기존 SQLite를 D1용 SQL로 내보내기

향후 배포할 때 실제 D1 ID, 도메인 및 Access 정책을 설정해야 합니다.
Access 대상은 `/admin`, `/admin/*`, `/api/admin`, `/api/admin/*`이며,
환경변수는 `NUXT_ACCESS_TEAM_DOMAIN`, `NUXT_ACCESS_AUDIENCE`입니다.
