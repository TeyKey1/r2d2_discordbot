const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { checkPermission } = require("../guild/permissionmanager");
const { translate } = require("../utility/translate");
const { modifyGuild } = require("../guild/guildmanager");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("permissions")
		.setDescription("Manages user permissions for bot commands")
		.addSubcommandGroup((group) =>
			group
				.setName("admin")
				.setDescription("Modify admin command permissions")
				.addSubcommand((subcommand) =>
					subcommand
						.setName("addrole")
						.setDescription("Adds a role to the admin permission group")
						.addRoleOption((option) =>
							option
								.setName("role")
								.setDescription("Role to add")
								.setRequired(true)
						)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("removerole")
						.setDescription("Removes a role from the admin permission group")
						.addRoleOption((option) =>
							option
								.setName("role")
								.setDescription("Role to remove")
								.setRequired(true)
						)
				),
		)
		.addSubcommandGroup((group) =>
			group
				.setName("user")
				.setDescription("Modify user command permissions")
				.addSubcommand((subcommand) =>
					subcommand
						.setName("addrole")
						.setDescription("Adds a role to the user permission group")
						.addRoleOption((option) =>
							option
								.setName("role")
								.setDescription("Role to add")
								.setRequired(true)
						)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("removerole")
						.setDescription("Removes a role from the user permission group")
						.addRoleOption((option) =>
							option
								.setName("role")
								.setDescription("Role to remove")
								.setRequired(true)
						)
				),
		)
		.addSubcommandGroup((group) =>
			group
				.setName("list")
				.setDescription("List current permission settings")
				.addSubcommand((subcommand) =>
					subcommand
						.setName("all")
						.setDescription("Lists all current permission settings")
				),
		),
	async execute({ interaction, storedGuild, language }) {
		if (!checkPermission("admin", interaction.member, storedGuild)) {
			const embed = new MessageEmbed()
				.setColor("#ff1100")
				.setDescription(translate(language, "commands.errors.permission"));
			await interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		}

		switch (interaction.options.getSubcommandGroup()) {
			case "admin":
				await handleAdminSubcommand({ interaction, storedGuild, language });
				break;
			case "user":
				await handleUserSubcommand({ interaction, storedGuild, language });
				break;
			case "list":
				await handleListSubcommand({ interaction, storedGuild, language });
				break;
			default:
				throw new Error("Specified subcommand group does not exist");
		}
	},
};

async function handleAdminSubcommand({ interaction, storedGuild, language }) {
	var embed = new MessageEmbed();
	const role = interaction.options.getRole("role", true);

	switch (interaction.options.getSubcommand()) {
		case "addrole":
			if (storedGuild.adminRoles.includes(role.id)) {
				embed
					.setColor("#FF9200")
					.setDescription(translate(language, "commands.permissions.admin.addRoleExists"));
				interaction.reply({ embeds: [embed], ephemeral: true });
				return;
			}

			storedGuild.adminRoles.push(role.id);
			modifyGuild(storedGuild);

			embed
				.setColor("#0aa12d")
				.setDescription(translate(language, "commands.permissions.admin.addRole"));
			interaction.reply({ embeds: [embed] });
			break;
		case "removerole":
			if (!storedGuild.adminRoles.includes(role.id)) {
				embed
					.setColor("#FF9200")
					.setDescription(translate(language, "commands.permissions.admin.removeRoleNotExisting"));
				interaction.reply({ embeds: [embed], ephemeral: true });
				return;
			}

			storedGuild.adminRoles.splice(storedGuild.adminRoles.indexOf(role.id), 1);
			modifyGuild(storedGuild);

			embed
				.setColor("#0aa12d")
				.setDescription(translate(language, "commands.permissions.admin.removeRole"));
			interaction.reply({ embeds: [embed] });
			break;
		default:
			throw new Error("Specified subcommand does not exist");
	}
}

async function handleUserSubcommand({ interaction, storedGuild, language }) {
	var embed = new MessageEmbed();
	const role = interaction.options.getRole("role", true);

	switch (interaction.options.getSubcommand()) {
		case "addrole":
			if (storedGuild.userRoles.includes(role.id)) {
				embed
					.setColor("#FF9200")
					.setDescription(translate(language, "commands.permissions.user.addRoleExists"));
				interaction.reply({ embeds: [embed], ephemeral: true });
				return;
			}

			storedGuild.userRoles.push(role.id);
			modifyGuild(storedGuild);

			embed
				.setColor("#0aa12d")
				.setDescription(translate(language, "commands.permissions.user.addRole"));
			interaction.reply({ embeds: [embed] });
			break;
		case "removerole":
			if (!storedGuild.userRoles.includes(role.id)) {
				embed
					.setColor("#FF9200")
					.setDescription(translate(language, "commands.permissions.user.removeRoleNotExisting"));
				interaction.reply({ embeds: [embed], ephemeral: true });
				return;
			}

			storedGuild.userRoles.splice(storedGuild.userRoles.indexOf(role.id), 1);
			modifyGuild(storedGuild);

			embed
				.setColor("#0aa12d")
				.setDescription(translate(language, "commands.permissions.user.removeRole"));
			interaction.reply({ embeds: [embed] });
			break;
		default:
			throw new Error("Specified subcommand does not exist");
	}
}

async function handleListSubcommand({ interaction, storedGuild, language }) {
	switch (interaction.options.getSubcommand()) {
		case "all":
			var embed = new MessageEmbed();
			embed
				.setColor("#1CACE5")
				.setTitle(translate(language, "commands.permissions.list.title"))
				.setDescription(translate(language, "commands.permissions.list.description"))
				.addField("Admin", (() => {
					const array = storedGuild.adminRoles;

					if (array.length == 0) {
						return translate(language, "commands.permissions.list.adminRolesEmpty");
					}

					var str = "";
					array.forEach(element => {
						str += ":white_check_mark: :heavy_minus_sign: ";
						str += `<@&${element}> \n`;
					});
					str += "\n ** **";
					return str;
				})())
				.addField("User", (() => {
					const array = storedGuild.userRoles;

					if (array.length == 0) {
						return translate(language, "commands.permissions.list.userRolesEmpty");
					}

					var str = "";
					array.forEach(element => {
						str += ":white_check_mark: :heavy_minus_sign: ";
						str += `<@&${element}> \n`;
					});
					return str;
				})());

			interaction.reply({ embeds: [embed] });
			break;
		default:
			throw new Error("Specified subcommand does not exist");
	}
}