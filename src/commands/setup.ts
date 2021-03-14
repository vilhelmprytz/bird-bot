import { RunFunction } from "../interfaces/Command";

export const run: RunFunction = async (client, message) => {
  try {
    const guild = message.guild;
    const confirm = await client.functions.awaitReply(
      message.author.id,
      message.channel,
      client.embed(
        {
          title: "**SETUP**",
          description:
            "You will be asked a few question about roles, prefix, embed color and channels to use.\n" +
            "All the channels / roles will be created if not already created.\n" +
            "It's better to leave the channel creation to the bot as then it also manages channels roles",
          fields: [
            {
              name: "Roles",
              value:
                "There are 2 roles:\n" +
                "1. Admins - people who can change the setting of the bot and run admin commands\n" +
                "2. Moderators / Helpers / Support - people who can access the logs channel and the human support channel",
            },
            {
              name: "Channels",
              value:
                "There are 3 channels needed:\n" +
                "1. Support message channel - the channel in which people can react to message to get support.\n" +
                "2. Human support channel - the channel to which people will get access when bot can't help with the error\n" +
                "3. Admin log channel - the channel where all the logs of peoples system go",
            },
            {
              name: "\u200b",
              value:
                "If you read everything and you are ready to continue type Y/y",
            },
          ],
        },
        message
      )
    );
    if (confirm.toLowerCase() !== "y")
      return message.channel.send(
        client.embed({ title: "Canceled!" }, message)
      );

    const prefix = await client.functions.awaitReply(
      message.author.id,
      message.channel,
      "What is the prefix you want to use?"
    );
    client.settings.set(message.guild.id, prefix, "prefix");

    const embedColor = await client.functions.awaitReply(
      message.author.id,
      message.channel,
      "What is the embed color you want to use? (PURPLE, RANDOM, #0000FF)"
    );
    client.settings.set(message.guild.id, embedColor, "embedColor");

    const adminRoleName = await client.functions.awaitReply(
      message.author.id,
      message.channel,
      "What is the name of the Admin Role?"
    );
    const adminRole = await client.functions.createGuilRole(message, {
      name: adminRoleName,
      options: {},
    });
    if (!adminRole) return;
    client.settings.set(guild.id, adminRoleName, "adminRole");

    const supportRoleName = await client.functions.awaitReply(
      message.author.id,
      message.channel,
      "What is the name of the support/helper/moderator Role?"
    );
    const supportRole = await client.functions.createGuilRole(message, {
      name: supportRoleName,
      options: {},
    });
    if (!supportRole) return;
    client.settings.set(guild.id, supportRoleName, "supportRole");

    const supportMsgChannelName = await client.functions.awaitReply(
      message.author.id,
      message.channel,
      "What is the channel to send message to react to name?"
    );

    const supportMsgChannel = await client.functions.createTextChannel(
      message,
      {
        name: supportMsgChannelName,
        options: {
          topic: "Support",
          permissionOverwrites: [
            {
              id: guild.roles.everyone,
              allow: ["VIEW_CHANNEL", "ADD_REACTIONS"],
              deny: ["SEND_MESSAGES"],
            },
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            { id: client.user!.id, allow: ["SEND_MESSAGES", "VIEW_CHANNEL"] },
          ],
          reason: "Support message channel!",
        },
      }
    );
    if (!supportMsgChannel) return;
    client.settings.set(guild.id, supportMsgChannel.id, "supportMsgChannel");

    const supportChannelName = await client.functions.awaitReply(
      message.author.id,
      message.channel,
      "What is the channel for human support name?"
    );

    const supportChannel = await client.functions.createTextChannel(message, {
      name: supportChannelName,
      options: {
        topic: "Human support",
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            deny: ["VIEW_CHANNEL"],
          },
          {
            id: adminRole.id,
            allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "MANAGE_MESSAGES"],
          },
          {
            id: supportRole.id,
            allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "MANAGE_MESSAGES"],
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          { id: client.user!.id, allow: ["SEND_MESSAGES", "VIEW_CHANNEL"] },
        ],
        reason: "Human support channel!",
      },
    });
    if (!supportChannel) return;
    client.settings.set(guild.id, supportChannel.id, "supportChannel");

    const adminChannelName = await client.functions.awaitReply(
      message.author.id,
      message.channel,
      "What is the channel for admin logs name?"
    );

    const adminChannel = await client.functions.createTextChannel(message, {
      name: adminChannelName,
      options: {
        topic: "Admin logs",
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            deny: ["VIEW_CHANNEL"],
          },
          {
            id: adminRole.id,
            allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "MANAGE_MESSAGES"],
          },
          {
            id: supportRole.id,
            allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "MANAGE_MESSAGES"],
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          { id: client.user!.id, allow: ["SEND_MESSAGES", "VIEW_CHANNEL"] },
        ],
        reason: "Admin logs channel!",
      },
    });
    if (!adminChannel) return;
    client.settings.set(guild.id, adminChannel.id, "adminChannel");

    message.channel.send("Successfully configured!");

    const msg = await supportMsgChannel.send(
      client.embed(client.config.supportMsg, message)
    );
    client.settings.set(guild.id, msg.id, "supportMsg");
    const supportCmd = client.commands.get("support");
    if (supportCmd?.setup) supportCmd.setup(client);
  } catch (e) {
    message.channel.send("An error has accured! check the console!");
    client.logger.error(`An error has accured: ${e}`);
    console.error(e);
    return;
  }
};

export const conf = {
  name: "setup",
  permLevel: "Administrator",
};
export const help = {
  category: "System",
  description: "Sets up your server for support",
  usage: "setup",
};
