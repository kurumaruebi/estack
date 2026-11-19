# syntax=docker/dockerfile:1
# The estack Docker image: the Linux release, run as a self-hosted server (docs/docker.md). You
# build it from the AppImage you built from this repository:
#
#   docker build --file docker/Dockerfile <folder that has estack.AppImage>
#
# The server scripts and the package list come from the unpacked release, so they always match the
# build that they run.
ARG BASE=ubuntu:24.04@sha256:a853f94d226358a79c740cfc7bce0c289748f3fe3488d921d038ccd752c61b60

FROM ${BASE} AS release
# The static AppImage runtime unpacks itself with no system library. Unpacked, the release needs no FUSE.
COPY estack.AppImage /tmp/estack.AppImage
WORKDIR /tmp
RUN chmod 0700 estack.AppImage \
  && ./estack.AppImage --appimage-extract >/dev/null \
  && chmod -R u+rwX,go=rX squashfs-root \
  && test -x squashfs-root/resources/hosting/estack-container

FROM ${BASE}
ARG DEBIAN_FRONTEND=noninteractive
COPY --from=release /tmp/squashfs-root/resources/hosting/packages.txt /tmp/packages.txt
# The packages of a self-hosted server, without AppArmor, which only the host can load. tini is PID 1:
# it reaps the processes that agents leave, and gives the stop signal to estack, which stops them.
# Agents run their commands in this image, so it also has the tools that they use most. The CJK fonts
# let the embedded browser render Chinese, Japanese and Korean text, which DejaVu alone cannot.
RUN apt-get update \
  && sed -e '/^#/d' -e '/^$/d' -e '/^apparmor$/d' /tmp/packages.txt \
    | xargs apt-get install --yes --no-install-recommends \
      fonts-noto-cjk git less openssh-client procps ripgrep tini unzip xz-utils \
  && rm -rf /var/lib/apt/lists/* /tmp/packages.txt
# Not root. The image of Ubuntu has the user ubuntu with the UID 1000, which estack takes. The home
# folder is the data volume.
RUN userdel --remove ubuntu \
  && useradd --uid 1000 --user-group --home-dir /data --create-home --shell /bin/bash estack \
  && install -d -o estack -g estack -m 0700 /run/estack
# Mount points of the update folders that docker/instances/compose.yaml gives an instance. Its root
# file system is read-only. With no folders mounted, estack offers no update.
RUN install -d -m 0755 /var/lib/estack-update/requests /var/lib/estack-update/status
# Root owns the release, so the user and its agents cannot change it. chrome-sandbox has no SUID bit:
# the sandbox uses user namespaces, which the seccomp profile in docker/ permits.
COPY --from=release /tmp/squashfs-root /opt/estack/app
RUN install -d -m 0755 /opt/estack/hosted \
  && printf 'container\n' >/opt/estack/hosted/mode \
  && ln -s /opt/estack/app/resources/hosting/estack /usr/local/bin/estack

ARG VERSION=unknown
ARG REVISION=unknown
# GitHub links the package to the repository through `source`.
LABEL org.opencontainers.image.title=estack \
  org.opencontainers.image.source=https://github.com/kurumaruebi/estack \
  org.opencontainers.image.licenses=PolyForm-Noncommercial-1.0.0 \
  org.opencontainers.image.version=${VERSION} \
  org.opencontainers.image.revision=${REVISION}
ENV LANG=C.UTF-8 XDG_RUNTIME_DIR=/run/estack
# Only /data stays when an update replaces the container, so the tools that the user and agents
# install go to ~/.local/bin, for example with uv or pipx. A login shell finds that folder only
# through ~/.profile, which an empty bind mount does not have.
ENV PATH=${PATH}:/data/.local/bin
USER estack
WORKDIR /data
VOLUME /data
STOPSIGNAL SIGTERM
ENTRYPOINT ["/usr/bin/tini", "--", "/opt/estack/app/resources/hosting/estack-container"]
