FROM n8nio/n8n:latest

USER root

ENV DB_TYPE=postgresdb \
    N8N_LISTEN_ADDRESS=0.0.0.0 \
    N8N_PATH=/ \
    N8N_PROTOCOL=https \
    N8N_PROXY_HOPS=1

COPY docker-entrypoint-railway.sh /docker-entrypoint-railway.sh
RUN chmod +x /docker-entrypoint-railway.sh

USER node

ENTRYPOINT ["tini", "--", "/docker-entrypoint-railway.sh"]

EXPOSE 5678
