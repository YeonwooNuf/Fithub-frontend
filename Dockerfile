# ✅ 개발 환경 (Development)
FROM node:18-alpine AS development
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 전체 코드 복사
COPY . .

# 핫 리로드를 위한 포트 설정
EXPOSE 3000

# 개발 환경에서는 React 개발 서버 실행
CMD ["npm", "start"]
