FROM node:22-alpine
WORKDIR /servers
COPY . .
ENV TZ=Asia/Hangzhou
RUN npm set registry=https://registry.npmmirror.com
RUN npm i -g pnpm && pnpm i && pnpm run build
EXPOSE 3333
CMD pnpm start:docker
