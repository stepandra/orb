FROM ubuntu:18.04
COPY . /orbitez-server
RUN apt-get update && apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get update && apt-get -y install nodejs
COPY entrypoint.sh entrypoint.sh
ENTRYPOINT /entrypoint.sh