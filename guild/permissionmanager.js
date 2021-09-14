const { getGuild, modifyGuild } = require("../guild/guildmanager");

/*
*   Checks if permission of user is sufficient to run command
*/
function checkPermission(level, guildMember, storedGuild) {
    var allowedRoles = [];

    //Bypass if user is Admin/Owner of Guild
    if (guildMember.permissions.has("ADMINISTRATOR", true)) {
        return true;
    }

    switch (level) {
        case "admin":
            allowedRoles = storedGuild.adminRoles;

            if (allowedRoles.length == 0) {
                return false;
            }

            return allowedRoles.some(item => guildMember.roles.cache.has(item));
        case "user":
            allowedRoles = storedGuild.userRoles;

            if (allowedRoles.length == 0) {
                return true;
            }

            return allowedRoles.some(item => guildMember.roles.cache.has(item));
        default:
            return false;
    }

}

function deleteRole(role) {
    var storedGuild = getGuild(role.guild);

    if (storedGuild.userRoles.includes(role.id)) {
        storedGuild.userRoles.splice(storedGuild.userRoles.indexOf(role.id), 1);
    }

    if (storedGuild.adminRoles.includes(role.id)) {
        storedGuild.adminRoles.splice(storedGuild.adminRoles.indexOf(role.id), 1);
    }

    modifyGuild(storedGuild);
}

module.exports.checkPermission = checkPermission;
module.exports.deleteRole = deleteRole;