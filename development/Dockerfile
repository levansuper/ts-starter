FROM node:8.11.1-stretch


RUN curl -o- -L https://yarnpkg.com/install.sh | bash
RUN yarn global add gulp-cli

RUN mkdir /code

WORKDIR /code

CMD [ "yarn", "run", "start:watch" ]