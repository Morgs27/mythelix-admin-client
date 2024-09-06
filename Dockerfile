FROM node:18-alpine as BUILD_IMAGE

WORKDIR /app/react-app

# install app dependencies
COPY package.json .

RUN npm install

# compy remaining files
COPY . ./

#run build
RUN npm run build

#here, we are implementing the multi-stage build. It greatly reduces our size
# it also won't expose our code in our ocntainer as we will only copy 
# the build output from the first stage.

#beggining of second stage
FROM node:18-alpine as PRODUCTION_IMAGE

WORKDIR /app/react-app

#here we are copying dist fold from BUILD_IMAGE to this image stage.
COPY --from=BUILD_IMAGE /app/react-app/dist/ /app/react-app/dist/

EXPOSE 8080

# to run npm commands as : npm run preview,
# we need package.json
COPY package.json .
COPY vite.config.ts . 

# we also need typescript as this project is based on typescript
RUN npm install typescript

EXPOSE 8080
CMD ["npm", "run", "preview"]

