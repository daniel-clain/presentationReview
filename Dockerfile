FROM node:boron
WORKDIR /app


ADD ./server.js /app
ADD ./package.json /app
#ADD ./presentationReviewData.json /app
#ADD ./reviewItems.json /app
ADD ./dist /app/dist
#ADD ./profilePics /app/profilePics

RUN npm install
EXPOSE 4000

CMD [ "node", "server.js" ]

