FROM node:boron
WORKDIR /app

RUN npm cache clean
RUN npm install -g @angular/cli
ADD ./server.js /app
ADD ./package.json /app
ADD ./.angular-cli.json /app
ADD ./tsconfig.json /app
ADD ./src /app/src

RUN npm install
RUN ng build --prod

EXPOSE 4000

CMD [ "node", "server.js" ]

