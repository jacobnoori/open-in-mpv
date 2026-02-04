/**
 * @name open in mpv
 * @author binarynoise
 * @description Use the context menu to open a video in mpv.
 * @version 2.4.0
 * @source https://github.com/binarynoise/open-in-mpv
 * @donate https://paypal.me/binarynoise
 */

'use strict';

// change this when mpv-scheme-handler.desktop changes
const desktopFileVersion = 3;

const settings = {
    locallyInstalledVersion: null
};

function createMpvSchemeURI(url) {
    const decodedURL = decodeURI(url);
    const encodedURL = encodeURI(decodedURL).replace(/'/g, "%27");
    // console.debug({url, encodedURL, same: decodedURL === decodeURI(encodedURL)});
    return `mpv://watch#${encodedURL}`;
}

function contextMenuPatch(tree, context) {
    // console.debug(tree, context)
    let href = [context.target.href, context.target.parentNode?.href].find(e => e && !/^https:\/\/(\w+\.)?discord.com\//.test(e))

    if (href === undefined) {
        const attachments = context.message.attachments
        if (attachments) {
            const filtered = attachments.map(e => e.url).filter(e => e);
            if (filtered && filtered.length === 1) {
                href = filtered[0]
            }
        }
    }
    if (href === undefined) {
        const embeds = context.message.embeds
        if (embeds) {
            const filtered = embeds.map(e => e.video || e.image || e).filter(e => e).map(e => e.contentType !== "text/html" && e.url).filter(e => e);
            const unique = filtered.filter((value, index, array) => array.indexOf(value) === index)
            if (unique && unique.length === 1) {
                href = unique[0]
            }
        }
    }

    if (href !== undefined) {
        const children = tree.props.children?.props?.children || tree.props.children
        children.push(BdApi.ContextMenu.buildItem({
            type: "separator",
        }))
        children.push(BdApi.ContextMenu.buildItem({
            type: "text", label: "open in mpv", action: () => {
                console.log("open-in-mpv: link is " + href);

                if (settings.locallyInstalledVersion && settings.locallyInstalledVersion >= desktopFileVersion) {
                    const newWindow = window.open(createMpvSchemeURI(href), "_blank", "noopener noreferrer");

                    if (newWindow === null) { // is null because opens in external application
                        BdApi.UI.showToast(`${href} opened in mpv.`, { type: "success" });
                        console.log("open-in-mpv: success");
                    } else {
                        BdApi.UI.showToast(`${href} failed to open in mpv.`, { type: "error" });
                        console.log(`open-in-mpv: failed to open ${createMpvSchemeURI(href)} in mpv.`);
                    }
                } else {
                    BdApi.UI.showConfirmationModal("Open in mpv",
                        "Open in mpv was updated or freshly installed. Please download and run setup.sh (again).",
                        {
                            confirmText: "Download setup.sh", onConfirm: () => {
                                downloadSetup();
                            },
                        }
                    )
                }
            },
        }))
    }
}

function downloadSetup() {
    const newWindow = window.open("https://raw.githubusercontent.com/binarynoise/open-in-mpv/main/setup.sh", "_blank", "noopener noreferrer",);
    if (newWindow === null) { // is null because opens in external browser
        settings.locallyInstalledVersion = desktopFileVersion;
        BdApi.Data.save("open-in-mpv", "settings", settings);
    }
}

module.exports = () => ({
    start() {
        const saved = BdApi.Data.load("open-in-mpv", "settings");
        if (saved && !isEmpty(saved)) Object.assign(settings, saved);
        BdApi.ContextMenu.patch("message", contextMenuPatch);
    }, stop() {
        BdApi.ContextMenu.unpatch("message", contextMenuPatch);
    }, //getSettingsPanel: () => React.createElement(SettingComponent),
});

function isEmpty(obj) {
    for (const prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            return false;
        }
    }

    return true
}
