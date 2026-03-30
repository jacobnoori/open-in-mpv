#!/bin/sh
set -ex

# When the addon is installed or updated, there is one last thing to do.
# To use the extension, run the following commands in your terminal:

mkdir -p ~/.local/share/applications

if [ -f mpv-scheme-handler.desktop ]; then
    cp -f mpv-scheme-handler.desktop ~/.local/share/applications/mpv-scheme-handler.desktop
else
    curl -sSf "https://raw.githubusercontent.com/jacobnoori/open-in-mpv/main/mpv-scheme-handler.desktop" >~/.local/share/applications/mpv-scheme-handler.desktop
fi

set +ex
