const {getGuild} = require("./guildmanager");

/*
*   Checks if permission of user is sufficient to run command
*/
async function checkPermission(level, guildMember, guild){
    var guildData = getGuild(guild);
    var allowedRoles = [];

    const user = await guild.members.fetch(guildMember.user.id);

    //Bypass if user is Admin/Owner of Guild
    if(user.hasPermission("ADMINISTRATOR", true, true)){
        return true;
    }

    switch(level){
        case "admin":
            allowedRoles = guildData.adminRoles;

            if(allowedRoles.length == 0){
                return false;
            }

            return allowedRoles.some(item => guildMember.roles.has(item));
        case "user":
            allowedRoles = guildData.userRoles;

            if(allowedRoles.length == 0){
                return true;
            }

            return allowedRoles.some(item => guildMember.roles.has(item));
        default:
            return false;
    }

}

module.exports.checkPermission = checkPermission;