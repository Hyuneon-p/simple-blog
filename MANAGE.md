Nuxt + Nuxt UI + Cloudflare D1. 현재는 **로컬 개발 환경만** 구성되어 있습니다.
원격 DB 생성, 배포, 도메인 연결은 직접 설정해야 합니다.



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
- `/admin/categories`: 카테고리 추가·이름 수정·삭제

글 작성·수정에서 카테고리를 선택하고, 메인 화면의 “기록” 드롭다운으로 글을 필터링합니다.
카테고리를 삭제하면 글은 유지되고 미분류로 변경됩니다.
메인 목록은 최신순으로 20개씩 조회하며, 목록 끝에 도달하면 다음 20개를 자동으로 불러옵니다.
카테고리를 변경하면 목록을 초기화하고 서버에서 다시 조회합니다. 조회 실패 시 다시 시도할 수 있습니다.
- `/admin/editor/[slug]`: 수정·삭제
- `/admin`: 글 관리로 이동

저장하면 바로 발행되고 상세 페이지로 이동합니다. 

slug는 제목에서 자동 생성하며,
중복은 숫자 접미사로 처리합니다. 

수정 시 기존 URL을 유지합니다.
Nuxt UI Editor 본문은 HTML로 저장하고 서버에서 정제합니다. 문단 정렬을 지원하며 Markdown 본문도 읽을 수 있습니다. 

사진은 Nuxt UI 업로드 블록에서 선택하거나 끌어 놓아 추가합니다.

브라우저에서 WebP(품질 85%, 긴 변 최대 2560px)로 변환한 뒤 R2에 저장합니다.

JPG·PNG·WebP 원본 최대 10MB/4천만 화소, 변환 결과 최대 5MB를 지원합니다.

업로드 실패 시 같은 블록에서 다시 선택할 수 있습니다. 업로드 블록이 남아 있으면 저장을 막습니다.

### 로컬 이미지 업로드 확인

`pnpm dev`에서 D1과 함께 R2 `IMAGES` 바인딩을 로컬로 에뮬레이션합니다.
Cloudflare 로그인이나 원격 버킷 생성 없이 `/admin/editor`의 사진 버튼으로 테스트하세요.
사진 업로드 → 저장 → 글 상세 표시 → 수정 화면 재진입 및 서버 재시작 후 표시를 확인할 수 있습니다.
이미지는 `.wrangler/state/v3/`에 유지되며 원격 R2로 전송되지 않습니다.
`/images/[key]`가 R2 이미지를 제공하므로 공개 버킷이나 CORS 설정은 필요 없습니다.
배포 시 실제 `simple-blog-images` 버킷을 만들거나 `bucket_name`을 실제 버킷 이름으로 변경하세요.
로컬 이미지는 배포 시 자동 이관되지 않습니다. 본문에서 제거하거나 저장을 취소한 이미지의 자동 삭제는 지원하지 않습니다.

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

글 작성·수정 화면의 “상단에 고정” 토글을 켜면 메인 기록 위에 제목만 작게 표시됩니다.
고정 글은 카테고리 필터와 무관하게 최신순으로 표시되며 일반 목록에도 유지됩니다.
