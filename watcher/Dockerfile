FROM golang:1.9.4-alpine3.7 as builder

RUN apk update
RUN apk add --no-cache make gcc musl-dev linux-headers git

RUN git clone https://gist.github.com/3758c56c040d186183dbe67fd0bced92.git
RUN git clone https://github.com/ethereum/go-ethereum.git
RUN cd go-ethereum && git reset --hard 4bb3c89d44e372e6a9ab85a8be0c9345265c763a

RUN cd go-ethereum && make geth


FROM node:alpine

COPY --from=builder go/go-ethereum/build/bin/geth /usr/local/bin/

RUN apk update
RUN apk add git
COPY /watcher_js /watcher_js
RUN cd watcher_js && npm install
CMD ["node", "watcher_js/main.js"]
#CMD ["sleep", "3600"]
