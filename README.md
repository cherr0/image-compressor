# 이미지 압축 도구 (Image Compressor)

Node.js 기반의 이미지 일괄 압축 및 경량화 도구입니다.

## 주요 기능

- 🖼️ **다양한 포맷 지원**: JPEG, PNG, WebP
- ⚡ **고성능 처리**: Sharp + Imagemin 조합으로 빠른 처리
- 📁 **배치 처리**: 폴더 내 모든 이미지 일괄 처리
- ⚙️ **세밀한 제어**: 품질, 크기, 포맷 등 다양한 옵션
- 📊 **진행률 표시**: 실시간 처리 상황 확인
- 🔒 **안전성**: 원본 파일 보존

## 설치

```bash
npm install
npm run setup
```

## 사용법

### 1. 기본 사용법 (가장 간단)

```bash
# 1단계: 압축할 이미지들을 ./images 폴더에 넣기
# 2단계: 다음 명령어 실행
npm start
```

**이렇게 하면:**
- `./images` 폴더의 모든 이미지가 자동으로 압축됩니다
- 하위 폴더가 있어도 모두 처리됩니다
- 압축된 파일은 `./compressed` 폴더에 저장됩니다
- 원본 폴더 구조가 그대로 유지됩니다

### 2. 고급 사용법

#### 기본 압축
```bash
# 원하는 폴더의 이미지들을 압축
npm run compress ./내이미지폴더
```

#### 품질 조정
```bash
# 품질을 낮춰서 더 작은 파일로 만들기 (1-100)
npm run compress ./images -q 70
```

#### 크기 조정
```bash
# 이미지 크기를 줄이기 (픽셀 단위)
npm run compress ./images -w 1920 -h 1080
```

#### 포맷 변환
```bash
# WebP로 변환 (더 작은 파일)
npm run compress ./images -f webp

# JPEG로 변환
npm run compress ./images -f jpg
```

#### 메타데이터 제거
```bash
# 파일 크기를 더 줄이기 위해 메타데이터 제거
npm run compress ./images --remove-metadata
```

#### 출력 폴더 지정
```bash
# 압축된 파일을 다른 폴더에 저장
npm run compress ./images -o ./압축결과
```

### 3. 대화형 모드 (단계별 설정)

```bash
# 질문에 따라 설정을 선택할 수 있는 모드
npm run interactive
```

**대화형 모드에서는:**
- 입력 폴더 경로 입력
- 출력 폴더 경로 입력  
- 압축 품질 선택 (1-100)
- 출력 포맷 선택 (자동/JPEG/PNG/WebP)
- 메타데이터 제거 여부 선택
- 크기 조정 여부 선택

## 옵션 설명

| 옵션 | 설명 | 예시 |
|------|------|------|
| `-q, --quality` | 압축 품질 (1-100, 숫자가 클수록 품질 좋음) | `-q 80` |
| `-w, --width` | 이미지 최대 너비 (픽셀) | `-w 1920` |
| `-h, --height` | 이미지 최대 높이 (픽셀) | `-h 1080` |
| `-f, --format` | 출력 포맷 (auto/jpg/png/webp) | `-f webp` |
| `-o, --output` | 압축된 파일을 저장할 폴더 | `-o ./결과` |
| `--remove-metadata` | 파일 크기를 더 줄이기 위해 메타데이터 제거 | `--remove-metadata` |

## 지원 포맷

### 입력 포맷
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### 출력 포맷
- JPEG (MozJPEG 최적화)
- PNG (PNGQuant 최적화)
- WebP (Google WebP)

## 실제 사용 예제

### 📸 사진 압축하기
```bash
# 여행 사진들을 압축해서 용량 줄이기
npm run compress ./여행사진 -q 85 -o ./압축된사진
```

### 🖼️ 웹용 이미지 만들기
```bash
# 웹사이트용으로 이미지 크기 줄이고 WebP로 변환
npm run compress ./원본이미지 -w 1200 -h 800 -f webp -o ./웹용이미지
```

### 📱 모바일용 이미지 만들기
```bash
# 모바일에서 빠르게 로드되도록 작은 크기로 압축
npm run compress ./이미지 -w 800 -h 600 -q 70 --remove-metadata
```

### 🎨 고품질 보존
```bash
# 품질을 최대한 유지하면서 압축
npm run compress ./중요한이미지 -q 95
```

### 🔄 대화형으로 설정하기
```bash
# 질문에 따라 단계별로 설정
npm run interactive
```

## 💡 압축 팁

### 📊 용량 절약 효과
- **WebP 변환**: JPEG 대비 25-35% 용량 절약
- **메타데이터 제거**: 10-30% 추가 용량 절약

### 🎯 품질 설정 가이드
- **70-80%**: 웹사이트, 블로그용 (권장)
- **85-90%**: 인쇄용, 고품질 필요시
- **95-100%**: 원본과 거의 동일한 품질 유지

### 📁 폴더 구조
- 하위 폴더가 있어도 모두 자동으로 처리됩니다
- 원본 폴더 구조가 그대로 유지됩니다
- 예: `images/여행/일본/도쿄.jpg` → `compressed/여행/일본/도쿄.jpg`

## 프로젝트 구조

```
개인작업/
├── index.js              # 메인 CLI 애플리케이션 (자동 실행 모드)
├── interactive.js        # 대화형 모드 스크립트
├── setup.js              # 초기 설정 스크립트
├── test.js               # 테스트 스크립트
├── package.json          # 프로젝트 설정 및 의존성
├── README.md             # 상세한 사용법 문서
├── LICENSE               # MIT 라이선스
├── .gitignore            # Git 무시 파일 목록
├── config/
│   └── default.json      # 기본 설정 파일
└── examples/
    └── example-usage.js  # 사용 예제 스크립트
```

### 주요 파일 설명

- **`index.js`**: 메인 CLI 애플리케이션. 기본값으로 자동 실행되며, 명령행 옵션도 지원
- **`interactive.js`**: 대화형 모드. 사용자 입력을 통해 압축 옵션을 설정
- **`setup.js`**: 프로젝트 초기 설정. 필요한 폴더들을 자동 생성
- **`test.js`**: 테스트 이미지 생성 및 기능 테스트
- **`config/default.json`**: 기본 압축 설정 (품질, 포맷 등)
- **`examples/example-usage.js`**: 다양한 사용 예제

