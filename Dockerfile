From mhart/alpine-node-base

WORKDIR .
ADD server.js .

CMD ["node", "server.js"]
