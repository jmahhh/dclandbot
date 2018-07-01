FROM golang:1.9.4-alpine3.7

RUN apk update
RUN apk add --no-cache make gcc musl-dev linux-headers git

RUN git clone https://github.com/ethereum/go-ethereum.git
RUN cd go-ethereum && git reset --hard 4bb3c89d44e372e6a9ab85a8be0c9345265c763a
# 4bb3c89d44e372e6a9ab85a8be0c9345265c763a 1.7.3
# b8b9f7f4476a30a0aaf6077daade6ae77f969960 1.8.2
RUN cd go-ethereum && make geth
RUN cp go-ethereum/build/bin/geth /usr/local/bin/

EXPOSE 8545 8546 30303 30303/udp 30304/udp

CMD ["geth", \
	"--rpc", \
	"--rpcaddr", "0.0.0.0", \
	"--rpccorsdomain", "'*'", \
	"--rpcapi", "eth,net,web3,admin,personal" \
	# "--rpcvhosts", "*" \
]
