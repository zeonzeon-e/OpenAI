# OpenAI

Chatgpt와 함께 코딩하기

## Projects

### TED English Companion
React + TypeScript + Tailwind CSS로 제작한 TED 영상 기반 영어 학습 데모 애플리케이션입니다.

```bash
cd ted-english
npm install
npm run dev
```

### GitHub Pages 배포

레포지토리를 GitHub Pages에 연결해 TED English Companion을 배포하려면 아래 절차를 따르면 됩니다.

1. GitHub에서 레포지토리의 **Settings → Pages** 메뉴로 이동하여 배포 브랜치를 `main`, 디렉터리를 `/(root)` 로 설정합니다.
2. 기본으로 추가된 GitHub Actions 워크플로(`Deploy TED English Companion`)가 main 브랜치에 푸시될 때마다 자동으로 빌드하고 Pages에 업로드합니다.
3. 워크플로가 완료되면 `https://<사용자명>.github.io/<레포지토리명>/` 주소에서 사이트를 확인할 수 있습니다.
