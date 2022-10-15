FROM node:8

#ENV RUNASUSER=nobody
#ENV RUNASGROUP=nogroup
#ENV OWN=$RUNASUSER:$RUNASGROUP
ENV OWN=node:node
RUN cat /etc/passwd && cat /etc/group
RUN mkdir -p /app && mkdir -p /home/node
RUN    chown -R $OWN /app && \
        chown -R $OWN /home/node
WORKDIR /app

USER $RUNASUSER
COPY *.json /app/
RUN npm install  --loglevel=warn

COPY . /app

CMD [ "npm", "start" ]
