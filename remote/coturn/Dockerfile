FROM coturn/coturn:4.17.2-r0
COPY remote/coturn/turnserver.conf /etc/coturn/estack.conf
COPY remote/coturn/entrypoint.sh /usr/local/bin/estack-coturn
ENTRYPOINT ["/usr/local/bin/estack-coturn"]
