export function configcommand() {
    return {
        name: "help",
        node_dependencies: [],
    }
}

export function command(api, event, args) {
    var help = global.commands.keys();
    var help_res = ``;
    var a = 1
    for (var i of help) {
        help_res += `${a}. ${i}\n`;
        a++;
    }
    api.sendMessage(help_res, event.threadID, event.messageID);
}
