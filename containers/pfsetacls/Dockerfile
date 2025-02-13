
FROM golang:1.22.5-bookworm

ENV SEMAPHORE_VERSION="development" SEMAPHORE_ARCH="linux_amd64" \
    SEMAPHORE_CONFIG_PATH="${SEMAPHORE_CONFIG_PATH:-/etc/semaphore}" \
    APP_ROOT="/go/src/github.com/ansible-semaphore/semaphore/"

# hadolint ignore=DL3013
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -

RUN apt update && apt install -y gcc g++ make git mariadb-client python3 pip python3-openssl openssl ca-certificates curl libcurl4-openssl-dev openssh-client tini nodejs bash rsync && \
    apt install -y python3-dev libffi-dev python3-paramiko &&\
    rm -rf /var/cache/apt/*

RUN VER=`python3 -c 'import sys; val=sys.version_info;print(str(val.major)+"."+str(val.minor))'` ; \
    rm -rf /usr/lib/python$VER/EXTERNALLY-MANAGED && \
    pip3 install --upgrade pip cffi &&\
    pip3 install ansible && pip3 install ansible-pylibssh

RUN adduser --disabled-password -u 1002 --gecos 0 semaphore && \
    mkdir -p /go/src/github.com/ansible-semaphore/semaphore && \
    mkdir -p /tmp/semaphore && \
    mkdir -p /etc/semaphore && \
    mkdir -p /var/lib/semaphore && \
    chown -R semaphore:0 /go && \
    chown -R semaphore:0 /tmp/semaphore && \
    chown -R semaphore:0 /etc/semaphore && \
    chown -R semaphore:0 /var/lib/semaphore && \
    ssh-keygen -t rsa -q -f "/root/.ssh/id_rsa" -N ""       && \
    ssh-keyscan -H github.com > /root/.ssh/known_hosts

RUN cd $(go env GOPATH) && curl -sL https://taskfile.dev/install.sh | sh -s -- "v3.33.0"


RUN npm install -g npm@9.6.7

RUN git config --global --add safe.directory /go/src/github.com/ansible-semaphore/semaphore

# Copy in app source
WORKDIR ${APP_ROOT}
ARG source=https://github.com/ansible-semaphore/semaphore.git
ARG release=v2.8.90

RUN git clone -qq --depth 1 --single-branch --branch ${release} ${source} ./

RUN deployment/docker/ci/bin/install

USER semaphore
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/semaphore-wrapper"]
CMD ["./bin/semaphore", "server", "--config", "/etc/semaphore/config.json"]
