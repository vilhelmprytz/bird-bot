"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleData = exports.handleScript = void 0;
const handleReqBody_1 = require("./handleReqBody");
const handleScript = (client, req, res) => {
    const apiData = client.apiData.get(req.params.id);
    if (!apiData) {
        res.status(404).send('echo "Not found"');
        return;
    }
    const script = client.script.replace('LINK', `${client.config.expressFQDN +
        client.config.expressAliasPort +
        `/data/${req.params.id}`}`);
    res.status(200).send(script);
};
exports.handleScript = handleScript;
const handleData = async (client, req, res) => {
    var _a;
    const apiData = client.apiData.get(req.params.id);
    if (!apiData) {
        res.status(404).send('echo "Not found"');
        return;
    }
    client.apiData.delete(req.params.id);
    const guild = client.guilds.cache.find((g) => g.id === apiData.guild);
    const channel = guild.channels.cache.find((c) => c.id === apiData.channel);
    const adminChannel = guild.channels.cache.find((c) => c.id === apiData.adminChannel);
    if (!req.body) {
        res.status(422).send({
            code: 422,
            description: `Data can't be proccesed`,
            success: false,
        });
        channel.send(client.embed({
            title: 'Bad data received',
            description: 'Bad **POST** request was received. Stopping this support!',
            color: apiData.settings.embedColor,
            timestamp: new Date(),
        }));
        (_a = channel.parent) === null || _a === void 0 ? void 0 : _a.delete('Bad request body');
        channel.delete('Bad request body');
        client.logger(`Invalid data received! Stopping ${apiData.user.toString()} support instance!`, 'warn');
        return;
    }
    else {
        res.status(200).send({
            code: 200,
            description: 'Data received',
            success: true,
        });
        const reply = await handleReqBody_1.handleBody(client, req.body, apiData.settings);
        channel.send(reply);
        adminChannel.send(apiData.user.toString(), reply);
        const rez = await client.functions
            .awaitReply(apiData.user.id, channel, 'Continue? (y/N):', 999999)
            .catch();
        if (rez === 'y') {
            channel.delete('End of support');
            channel.parent.delete('End of support');
        }
    }
};
exports.handleData = handleData;