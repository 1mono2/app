FROM node:22.0-bookworm-slim

# アプリケーションのソースコードを格納するディレクトリを指定
WORKDIR /usr/src/app
# curl：ヘルスチェック用
RUN apt update && apt install -y \
    curl \
    && apt clean \
    && rm -rf /var/lib/apt/lists/*

# アプリケーションの依存関係をインストールするためにpackage.json (およびpackage-lock.jsonがあれば) をコピー
COPY package*.json ./
RUN npm ci && npm cache clean --force

# # アプリケーションのソースコードをコンテナ内にコピー
COPY . .

RUN npm run build

# # アプリケーションがリッスンするポートを指定
EXPOSE 443

# # コンテナ起動時にアプリケーションを起動
CMD ["npm", "start"]
