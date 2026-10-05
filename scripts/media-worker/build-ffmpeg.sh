#!/usr/bin/env bash
# Builds the Phase 4E media-worker toolchain inside a Vercel Sandbox BUILD VM
# (never the processing VM; no customer data is present). Produces a minimal,
# LGPL-2.1-or-later, decode-oriented ffmpeg/ffprobe under /opt/media-worker.
# Sources are pinned by SHA-256; the ffmpeg tarball's PGP signature is
# verified by the caller before upload (key FCF986EA15E6E293A5644F10B4322F04D67658D8).
set -euo pipefail
FFMPEG_SHA256=7138d28c96d9d3e3af4ee3d8cad72741f8ffb40da90c1112235dea3ecd3178a3
ZIMG_SHA256=be89390f13a5c9b2388ce0f44a5e89364a20c1c57ce46d382b1fcc3967057577
SRC=/tmp/mw-src
PREFIX=/opt/media-worker
DEPS=/tmp/mw-deps

echo "$FFMPEG_SHA256  $SRC/ffmpeg-8.1.3.tar.xz" | sha256sum -c -
echo "$ZIMG_SHA256  $SRC/zimg-3.0.6.tar.gz" | sha256sum -c -

sudo apt-get update -qq
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq --no-install-recommends \
  build-essential nasm pkg-config autoconf automake libtool xz-utils zlib1g-dev >/dev/null

cd "$SRC"
tar xzf zimg-3.0.6.tar.gz
cd zimg-release-3.0.6
./autogen.sh >/dev/null
./configure --prefix="$DEPS" --enable-static --disable-shared >/dev/null
make -j"$(nproc)" >/dev/null
make install >/dev/null

cd "$SRC"
tar xJf ffmpeg-8.1.3.tar.xz
cd ffmpeg-8.1.3
PKG_CONFIG_PATH="$DEPS/lib/pkgconfig" ./configure \
  --prefix="$PREFIX" \
  --pkg-config-flags=--static \
  --extra-cflags="-I$DEPS/include" --extra-ldflags="-L$DEPS/lib" --extra-libs="-lstdc++ -lm" \
  --disable-everything --disable-autodetect --disable-network --disable-doc --disable-debug \
  --disable-ffplay --enable-ffmpeg --enable-ffprobe \
  --disable-shared --enable-static \
  --enable-zlib --enable-libzimg \
  --enable-protocol=file,pipe \
  --enable-demuxer=mov,matroska \
  --enable-decoder=h264,hevc,vp8,vp9,mpeg4,h263,aac,mp3,mp3float,opus,vorbis,amrnb,amrwb,alac,pcm_s16le,pcm_s16be,pcm_s24le,pcm_s24be,pcm_f32le \
  --enable-parser=h264,hevc,vp8,vp9,mpeg4video,h263,aac,opus,vorbis,mpegaudio \
  --enable-encoder=png,aac,wrapped_avframe \
  --enable-muxer=image2,mp4,ipod,null \
  --enable-filter=scale,zscale,tonemap,format,select,showinfo,null,anull,aresample,aformat,atrim,trim,setpts,transpose,hflip,vflip,rotate,metadata \
  > /tmp/mw-configure.log
make -j"$(nproc)" >/dev/null
make install >/dev/null

# Record exact provenance of the build.
"$PREFIX/bin/ffmpeg" -hide_banner -L | head -5 > "$PREFIX/LICENSE-BUILD.txt"
{
  echo "ffmpeg_source=ffmpeg-8.1.3.tar.xz sha256=$FFMPEG_SHA256 pgp=FCF986EA15E6E293A5644F10B4322F04D67658D8"
  echo "zimg_source=zimg release-3.0.6 sha256=$ZIMG_SHA256 licence=WTFPL"
  "$PREFIX/bin/ffmpeg" -hide_banner -version | head -2
  "$PREFIX/bin/ffmpeg" -hide_banner -buildconf
} > "$PREFIX/BUILD-INFO.txt"

# Remove the toolchain and sources from the VM before it is snapshotted.
rm -rf "$SRC" "$DEPS" /tmp/mw-configure.log
sudo DEBIAN_FRONTEND=noninteractive apt-get purge -y -qq build-essential nasm pkg-config autoconf automake libtool zlib1g-dev >/dev/null
sudo DEBIAN_FRONTEND=noninteractive apt-get autoremove -y -qq >/dev/null
sudo rm -rf /var/lib/apt/lists/*
# Processing VMs never need root: drop the default user's sudo rights.
sudo rm -f /etc/sudoers.d/* 2>/dev/null || true
sudo gpasswd -d ubuntu sudo >/dev/null 2>&1 || true
echo BUILD_OK
