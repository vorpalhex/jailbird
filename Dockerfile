FROM node:14.2-slim


WORKDIR /var/opt/jailbird
ADD ./format .
ADD ./convert.sh .

RUN apt update && apt install -y unzip curl
RUN npm i -g jailbird
RUN curl -L -o tweego.zip https://github.com/tmedwards/tweego/releases/download/v2.1.1/tweego-2.1.1-linux-x64.zip
RUN unzip tweego.zip 
RUN chmod u+x tweego
RUN mkdir storyformats/jailbird
RUN cp format.js storyformats/jailbird/
RUN cd /usr/local/bin && ln -s /var/opt/jailbird/tweego . && cd -
CMD [ "/bin/bash", "/var/opt/jailbird/convert.sh" ]