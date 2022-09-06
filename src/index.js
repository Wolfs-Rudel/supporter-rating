"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const fs_1 = require("fs");
const json5_1 = require("json5");
const client = new discord_js_1.Client({ intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_MEMBERS] });
const config = (0, json5_1.parse)((0, fs_1.readFileSync)("./config/config.json5", "utf-8"));
client.login(config.token);
client.on("ready", async () => {
    console.info("⭐ Supporter Rating Bot is online!");
    const guild = await client.guilds.fetch(config.guild);
    guild.commands.create({
        name: "bewerten",
        nameLocalizations: {
            "de": "bewerten",
            "en-US": "rate",
        },
        description: "Bewerte einen Supporter",
        descriptionLocalizations: {
            "de": "Bewerte einen Supporter",
            "en-US": "Rate a supporter",
        },
        options: [
            {
                name: "supporter",
                type: "USER",
                required: true,
                description: "Der Supporter, den du bewerten möchtest",
                descriptionLocalizations: {
                    "de": "Der Supporter, den du bewerten möchtest",
                    "en-US": "The supporter you want to rate",
                },
            },
            {
                name: "bewertung",
                type: "STRING",
                description: "Die Bewertung, die du vergeben möchtest",
                descriptionLocalizations: {
                    "de": "Die Bewertung, die du vergeben möchtest",
                    "en-US": "The rating you want to give",
                },
                required: true,
                choices: [
                    {
                        name: "⭐",
                        value: "1",
                    },
                    {
                        name: "⭐⭐",
                        value: "2",
                    },
                    {
                        name: "⭐⭐⭐",
                        value: "3",
                    },
                    {
                        name: "⭐⭐⭐⭐",
                        value: "4",
                    },
                    {
                        name: "⭐⭐⭐⭐⭐",
                        value: "5",
                    },
                ],
            },
        ],
    });
});
client.on("interactionCreate", async (interaction) => {
    if (!interaction || !interaction.guild)
        return;
    if (interaction.isCommand()) {
        if (interaction.commandName === "bewerten") {
            const supporter = interaction.options.data.find(x => x.name === "supporter")?.member;
            const rating = interaction.options.data.find(x => x.name === "bewertung")?.value;
            if (!supporter || !rating)
                return;
            if (!supporter.roles.cache.get(config.roles.supporter))
                return await interaction.reply({ ephemeral: true, content: ":x: Dieser Nutzer ist kein Supporter!" });
            const modal = new discord_js_1.Modal()
                .setTitle("Supporter Bewertung")
                .setCustomId(`suprating_${supporter.id}_${rating}`)
                .addComponents((new discord_js_1.MessageActionRow().addComponents((new discord_js_1.TextInputComponent()
                .setCustomId("rating")
                .setPlaceholder("Bewertung")
                .setMinLength(1)
                .setMaxLength(1000)
                .setStyle("PARAGRAPH")
                .setLabel("Bewertung")))));
            return await interaction.showModal(modal);
        }
    }
    else if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith("suprating_")) {
            const supporter = await interaction.guild.members.fetch(interaction.customId.split("_")[1]);
            if (!supporter)
                return;
            const rating = parseInt(interaction.customId.split("_")[2]);
            if (!rating)
                return;
            const text = interaction.fields.getField("rating")?.value;
            if (!text)
                return;
            if (!supporter.roles.cache.get(config.roles.supporter))
                return await interaction.reply({ ephemeral: true, content: ":x: Dieser Nutzer ist kein Supporter!" });
            const channel = await client.channels.fetch(config.channels.ratings).catch(console.error);
            if (!channel || !channel.isText())
                return;
            await channel.send({
                embeds: [
                    new discord_js_1.MessageEmbed()
                        .setTitle("Support Feedback")
                        .setDescription(`**Spieler:** <@!${interaction.user.id}>\n**Teammitglied:** <@!${supporter.user.id}>\n**Bewertung:** ${"⭐".repeat(rating)}\n**Feedback:** ${text}`),
                ],
            });
            await interaction.reply({ ephemeral: true, content: ":white_check_mark: Deine Bewertung wurde gesendet!" });
        }
    }
});
