const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const cmdIcons = require('../../UI/icons/commandicons');
const moment = require('moment');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Advanced user profile and analytics tools.')
    .addSubcommand(sub => 
      sub.setName('permissions')
        .setDescription('Detailed channel permissions analysis.')
        .addChannelOption(o => o.setName('channel').setDescription('Channel to analyze').setRequired(true))
        .addUserOption(o => o.setName('target').setDescription('Target user').setRequired(false))
    )
    .addSubcommand(sub => sub.setName('mutuals').setDescription('Mutual servers analysis.').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(true)))
    .addSubcommand(sub => 
      sub.setName('nickname')
        .setDescription('Nickname management (Admin only).')
        .addStringOption(o => o.setName('action').setDescription('Action to perform').setRequired(true).addChoices({ name: 'view', value: 'view' }, { name: 'reset', value: 'reset' }))
        .addUserOption(o => o.setName('target').setDescription('Target user').setRequired(true))
    )
    .addSubcommand(sub => sub.setName('info').setDescription('Comprehensive user information and analytics.').addUserOption(o => o.setName('target').setDescription('Target user to analyze').setRequired(false)))
    .addSubcommand(sub => sub.setName('avatar').setDescription('Display user avatar in high resolution.').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(false)))
    .addSubcommand(sub => sub.setName('banner').setDescription('Show user profile banner.').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(false)))
    .addSubcommand(sub => sub.setName('roles').setDescription('Analyze user roles and permissions.').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(false)))
    .addSubcommand(sub => sub.setName('joinedat').setDescription('Server join date and member analytics.').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(false)))
    .addSubcommand(sub => sub.setName('badges').setDescription('Discord badges and achievements.').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(false)))
    .addSubcommand(sub => sub.setName('createdat').setDescription('Account creation date and age.').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(false)))
    .addSubcommand(sub => sub.setName('boosting').setDescription('Server boost status and history.').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(false)))
    .addSubcommand(sub => sub.setName('activity').setDescription('User activity and presence status.').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(false)))
    .addSubcommand(sub => sub.setName('security').setDescription('Account security analysis.').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(false)))
    .addSubcommand(sub => sub.setName('stats').setDescription('Advanced user statistics.').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(false))),

  async execute(interaction) {
    let sender = interaction.user;
    let subcommand;
    let targetUser;
    let isSlashCommand = false;
    let channel = null;
    let action = null;

    // Check if it's a slash command or prefix command
    if (interaction.isCommand && interaction.isCommand()) {
      isSlashCommand = true;
      await interaction.deferReply();
      subcommand = interaction.options.getSubcommand();
      targetUser = interaction.options.getUser('target') || interaction.user;
      channel = interaction.options.getChannel('channel');
      action = interaction.options.getString('action');
    } else {
      // Handle prefix command
      const message = interaction;
      sender = message.author;
      const args = message.content.split(' ');
      args.shift(); // Remove command name
      subcommand = args[0] || 'help';
      
      // Parse user mention or ID
      if (args[1]) {
        const userMention = args[1].replace(/[<@!>]/g, '');
        targetUser = await message.client.users.fetch(userMention).catch(() => null) || message.author;
      } else {
        targetUser = message.author;
      }
      
      // Parse channel for permissions command
      if (subcommand === 'permissions' && args[2]) {
        const channelMention = args[2].replace(/[<#>]/g, '');
        channel = message.guild.channels.cache.get(channelMention);
      }
      
      // Parse action for nickname command
      if (subcommand === 'nickname' && args[2]) {
        action = args[2];
      }
    }

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    const client = isSlashCommand ? interaction.client : interaction.client;

    // Helper function to send reply
    const sendReply = async (embed) => {
      if (isSlashCommand) {
        return interaction.editReply({ embeds: [embed] });
      } else {
        return interaction.reply({ embeds: [embed] });
      }
    };

    // Enhanced user info command
    if (subcommand === 'info') {
      const roles = member?.roles.cache.filter(r => r.name !== '@everyone') || [];
      const joinPosition = member ? (await interaction.guild.members.fetch()).sort((a, b) => a.joinedTimestamp - b.joinedTimestamp).map(m => m.id).indexOf(member.id) + 1 : 'N/A';
      const accountAge = moment(targetUser.createdAt).fromNow();
      const serverAge = member ? moment(member.joinedAt).fromNow() : 'Not in server';
      
      const embed = new EmbedBuilder()
        .setColor('#00d4ff')
        .setTitle('🔍 **USER PROFILE ANALYSIS**')
        .setDescription(`
\`\`\`
🔍 IDENTITY SCANNER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
          { 
            name: '👤 **Identity**', 
            value: `**Tag:** \`${targetUser.tag}\`\n**ID:** \`${targetUser.id}\`\n**Type:** ${targetUser.bot ? '🤖 Bot' : '👨‍💻 User'}`, 
            inline: true 
          },
          { 
            name: '📅 **Timeline**', 
            value: `**Created:** ${accountAge}\n**Joined:** ${serverAge}\n**Position:** #${joinPosition}`, 
            inline: true 
          },
          { 
            name: '⚡ **Status**', 
            value: `**Presence:** ${member?.presence?.status || 'offline'}\n**Activity:** ${member?.presence?.activities[0]?.name || 'None'}\n**Boost:** ${member?.premiumSince ? '💎 Yes' : '❌ No'}`, 
            inline: true 
          }
        )
        .addFields(
          { 
            name: '🏆 **Server Profile**', 
            value: member ? `**Highest Role:** ${member.roles.highest.name}\n**Role Count:** ${roles.size}\n**Permissions:** ${member.permissions.has('Administrator') ? '🔑 Admin' : '👤 Member'}` : 'Not in server', 
            inline: false 
          },
          { 
            name: '🎭 **Roles**', 
            value: roles.size > 0 ? (roles.size > 10 ? `${roles.map(r => `<@&${r.id}>`).slice(0, 10).join(' ')} *+${roles.size - 10} more*` : roles.map(r => `<@&${r.id}>`).join(' ')) : 'No roles', 
            inline: false 
          }
        )
        .setFooter({ text: `🔍 Profile scanned by ${sender.tag}`, iconURL: sender.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced avatar command
    if (subcommand === 'avatar') {
      const embed = new EmbedBuilder()
        .setColor('#7c3aed')
        .setTitle('🖼️ **AVATAR DISPLAY**')
        .setDescription(`
\`\`\`
🖼️ AVATAR VIEWER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**User:** ${targetUser.tag}
**Resolution:** 1024x1024px
**Format:** ${targetUser.displayAvatarURL({ dynamic: true }).includes('.gif') ? 'GIF (Animated)' : 'PNG (Static)'}

🔗 **[Download Avatar](${targetUser.displayAvatarURL({ dynamic: true, size: 1024 })})**`)
        .setImage(targetUser.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setThumbnail(cmdIcons.rippleIcon)
        .setFooter({ text: `🎨 Avatar requested by ${sender.tag}` })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced banner command
    if (subcommand === 'banner') {
      const user = await client.users.fetch(targetUser.id, { force: true });
      const banner = user.bannerURL({ dynamic: true, size: 1024 });
      
      const embed = new EmbedBuilder()
        .setColor(user.accentColor || '#00ff88')
        .setTitle('🌟 **PROFILE BANNER**')
        .setDescription(`
\`\`\`
🌟 BANNER VIEWER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**User:** ${targetUser.tag}
**Accent Color:** ${user.accentColor ? `#${user.accentColor.toString(16).padStart(6, '0')}` : 'Default'}
**Banner Status:** ${banner ? '✅ Available' : '❌ Not Set'}

${banner ? `🔗 **[Download Banner](${banner})**` : '💡 *User has not set a custom banner*'}`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `🎨 Banner requested by ${sender.tag}` })
        .setTimestamp();

      if (banner) {
        embed.setImage(banner);
      }

      return sendReply(embed);
    }

    // Enhanced roles command
    if (subcommand === 'roles') {
      const roles = member?.roles.cache.filter(r => r.name !== '@everyone').sort((a, b) => b.position - a.position);
      const roleList = roles?.map(r => `<@&${r.id}> \`${r.name}\``).join('\n') || 'No roles assigned';
      
      const embed = new EmbedBuilder()
        .setColor('#8e44ad')
        .setTitle('🎭 **ROLE ANALYSIS**')
        .setDescription(`
\`\`\`
🎭 ROLE HIERARCHY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**Target:** ${targetUser.tag}
**Total Roles:** ${roles?.size || 0}
**Highest Role:** ${member?.roles.highest.name || 'None'}
**Role Color:** ${member?.roles.highest.hexColor || '#000000'}

**📋 Role List:**
${roleList}`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `🎭 Roles analyzed by ${sender.tag}` })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced permissions command
    if (subcommand === 'permissions') {
      if (!channel) {
        return sendReply(new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ **ERROR**')
          .setDescription('Please specify a valid channel!')
        );
      }

      const permissions = channel.permissionsFor(targetUser)?.toArray() || [];
      const adminPerms = permissions.filter(p => ['Administrator', 'ManageGuild', 'ManageChannels', 'ManageRoles'].includes(p));
      const modPerms = permissions.filter(p => ['ManageMessages', 'KickMembers', 'BanMembers', 'ModerateMembers'].includes(p));
      const basicPerms = permissions.filter(p => !adminPerms.includes(p) && !modPerms.includes(p));

      const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setTitle('🔐 **PERMISSION ANALYSIS**')
        .setDescription(`
\`\`\`
🔐 CHANNEL PERMISSIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**Channel:** ${channel.name}
**User:** ${targetUser.tag}
**Total Permissions:** ${permissions.length}`)
        .addFields(
          { 
            name: '🔑 **Admin Permissions**', 
            value: adminPerms.length > 0 ? adminPerms.map(p => `• ${p}`).join('\n') : 'None', 
            inline: true 
          },
          { 
            name: '🛡️ **Moderation Permissions**', 
            value: modPerms.length > 0 ? modPerms.map(p => `• ${p}`).join('\n') : 'None', 
            inline: true 
          },
          { 
            name: '📝 **Basic Permissions**', 
            value: basicPerms.length > 0 ? basicPerms.slice(0, 10).map(p => `• ${p}`).join('\n') + (basicPerms.length > 10 ? `\n*+${basicPerms.length - 10} more*` : '') : 'None', 
            inline: false 
          }
        )
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `🔐 Permissions analyzed by ${sender.tag}` })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced joinedat command
    if (subcommand === 'joinedat') {
      if (!member) {
        return sendReply(new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ **ERROR**')
          .setDescription('User is not in this server!')
        );
      }

      const joinPosition = (await interaction.guild.members.fetch()).sort((a, b) => a.joinedTimestamp - b.joinedTimestamp).map(m => m.id).indexOf(member.id) + 1;
      const joinAge = moment(member.joinedAt).fromNow();
      const daysSinceJoin = Math.floor((Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24));

      const embed = new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle('📅 **JOIN DATE ANALYSIS**')
        .setDescription(`
\`\`\`
📅 MEMBERSHIP TIMELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**User:** ${targetUser.tag}
**Join Date:** <t:${Math.floor(member.joinedTimestamp / 1000)}:F>
**Time Ago:** ${joinAge}
**Days Active:** ${daysSinceJoin}
**Join Position:** #${joinPosition}

**🏆 Member Status:**
${daysSinceJoin > 365 ? '🌟 Veteran Member' : daysSinceJoin > 180 ? '💎 Experienced Member' : daysSinceJoin > 30 ? '🔥 Active Member' : '🌱 New Member'}`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `📅 Join date checked by ${sender.tag}` })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced badges command
    if (subcommand === 'badges') {
      const user = await client.users.fetch(targetUser.id, { force: true });
      const flags = user.flags?.toArray() || [];
      const badgeEmojis = {
        'Staff': '👑',
        'Partner': '🤝',
        'Hypesquad': '🎉',
        'BugHunterLevel1': '🐛',
        'BugHunterLevel2': '🐛',
        'HypesquadOnlineHouse1': '🏠',
        'HypesquadOnlineHouse2': '🏠',
        'HypesquadOnlineHouse3': '🏠',
        'PremiumEarlySupporter': '💎',
        'TeamPseudoUser': '🤖',
        'VerifiedBot': '✅',
        'VerifiedDeveloper': '🔨',
        'CertifiedModerator': '🛡️',
        'BotHTTPInteractions': '🔗',
        'ActiveDeveloper': '⚡'
      };

      const embed = new EmbedBuilder()
        .setColor('#f1c40f')
        .setTitle('🏅 **BADGE COLLECTION**')
        .setDescription(`
\`\`\`
🏅 ACHIEVEMENT SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**User:** ${targetUser.tag}
**Badge Count:** ${flags.length}
**Profile Status:** ${flags.length > 0 ? '🌟 Distinguished' : '👤 Standard'}

**🏆 Badge Collection:**
${flags.length > 0 ? flags.map(badge => `${badgeEmojis[badge] || '🏅'} **${badge.replace(/([A-Z])/g, ' $1').trim()}**`).join('\n') : '📝 No badges earned yet'}

> 💡 **Tip:** Badges are earned through Discord achievements and contributions!`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `🏅 Badges viewed by ${sender.tag}` })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced createdat command
    if (subcommand === 'createdat') {
      const accountAge = moment(targetUser.createdAt).fromNow();
      const daysSinceCreation = Math.floor((Date.now() - targetUser.createdTimestamp) / (1000 * 60 * 60 * 24));
      const accountStatus = daysSinceCreation > 1095 ? '🌟 Veteran Account' : daysSinceCreation > 365 ? '💎 Mature Account' : daysSinceCreation > 30 ? '🔥 Established Account' : '🌱 New Account';

      const embed = new EmbedBuilder()
        .setColor('#2d98da')
        .setTitle('🎂 **ACCOUNT CREATION**')
        .setDescription(`
\`\`\`
🎂 ACCOUNT TIMELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**User:** ${targetUser.tag}
**Created:** <t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>
**Age:** ${accountAge}
**Days Old:** ${daysSinceCreation}
**Account Status:** ${accountStatus}

**📊 Account Metrics:**
• **Years Active:** ${Math.floor(daysSinceCreation / 365)}
• **Months Active:** ${Math.floor(daysSinceCreation / 30)}
• **Experience Level:** ${daysSinceCreation > 730 ? 'Expert' : daysSinceCreation > 365 ? 'Advanced' : daysSinceCreation > 90 ? 'Intermediate' : 'Beginner'}`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `🎂 Account age checked by ${sender.tag}` })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced boosting command
    if (subcommand === 'boosting') {
      const boostStatus = member?.premiumSince;
      const boostDuration = boostStatus ? moment(boostStatus).fromNow() : null;
      const boostLevel = interaction.guild.premiumTier;

      const embed = new EmbedBuilder()
        .setColor('#e84393')
        .setTitle('🚀 **BOOST ANALYSIS**')
        .setDescription(`
\`\`\`
🚀 NITRO BOOST STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**User:** ${targetUser.tag}
**Boost Status:** ${boostStatus ? '💎 Active Booster' : '❌ Not Boosting'}
**Server Level:** ${boostLevel ? `Level ${boostLevel}` : 'No Level'}
**Total Boosts:** ${interaction.guild.premiumSubscriptionCount || 0}

${boostStatus ? `**🎉 Boost Details:**
• **Started:** ${boostDuration}
• **Duration:** <t:${Math.floor(boostStatus / 1000)}:R>
• **Contribution:** Server Enhancement
• **Benefits:** Exclusive perks unlocked` : `**💡 Boost Benefits:**
• Higher audio quality
• Custom server emoji
• Enhanced upload limits
• Priority support`}`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `🚀 Boost status checked by ${sender.tag}` })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced mutuals command
    if (subcommand === 'mutuals') {
      const mutuals = client.guilds.cache.filter(g => g.members.cache.has(targetUser.id));
      const mutualList = mutuals.map(g => `• **${g.name}** (${g.memberCount} members)`).join('\n');

      const embed = new EmbedBuilder()
        .setColor('#1abc9c')
        .setTitle('🌐 **MUTUAL SERVERS**')
        .setDescription(`
\`\`\`
🌐 NETWORK ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**User:** ${targetUser.tag}
**Mutual Servers:** ${mutuals.size}
**Network Reach:** ${mutuals.reduce((acc, g) => acc + g.memberCount, 0).toLocaleString()} total members

**🏰 Shared Servers:**
${mutuals.size > 0 ? (mutuals.size > 10 ? mutualList.split('\n').slice(0, 10).join('\n') + `\n*+${mutuals.size - 10} more servers*` : mutualList) : 'No mutual servers found'}

> 🔍 **Network Score:** ${mutuals.size > 10 ? 'High' : mutuals.size > 5 ? 'Medium' : 'Low'}`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `🌐 Network scanned by ${sender.tag}` })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced activity command
    if (subcommand === 'activity') {
      const presence = member?.presence;
      const status = presence?.status || 'offline';
      const activities = presence?.activities || [];
      const statusEmoji = {
        'online': '🟢',
        'idle': '🟡',
        'dnd': '🔴',
        'offline': '⚫'
      };

      const embed = new EmbedBuilder()
        .setColor('#9b59b6')
        .setTitle('⚡ **ACTIVITY MONITOR**')
        .setDescription(`
\`\`\`
⚡ PRESENCE TRACKER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**User:** ${targetUser.tag}
**Status:** ${statusEmoji[status]} ${status.toUpperCase()}
**Activities:** ${activities.length}
**Platform:** ${presence?.clientStatus ? Object.keys(presence.clientStatus).join(', ') : 'Unknown'}

**🎮 Current Activities:**
${activities.length > 0 ? activities.map(activity => {
  const type = activity.type === 0 ? '🎮 Playing' : 
               activity.type === 1 ? '📺 Streaming' : 
               activity.type === 2 ? '🎵 Listening' : 
               activity.type === 3 ? '👀 Watching' : 
               activity.type === 4 ? '📝 Custom' : 
               activity.type === 5 ? '🏆 Competing' : '❓ Unknown';
  
  return `${type} **${activity.name}**${activity.details ? `\n  └ ${activity.details}` : ''}${activity.state ? `\n  └ ${activity.state}` : ''}`;
}).join('\n\n') : '💤 No active status'}`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `⚡ Activity checked by ${sender.tag}` })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced nickname command
    if (subcommand === 'nickname') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
        return sendReply(new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ **ACCESS DENIED**')
          .setDescription('🔒 You need `Manage Nicknames` permission to use this command!')
        );
      }

      const nickname = member?.nickname || 'No nickname set';
      
      if (action === 'reset') {
        try {
          await member.setNickname(null);
          return sendReply(new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ **NICKNAME RESET**')
            .setDescription(`Successfully reset ${targetUser.tag}'s nickname!`)
          );
        } catch (error) {
          return sendReply(new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ **ERROR**')
            .setDescription('Failed to reset nickname. Check role hierarchy!')
          );
        }
      }

      const embed = new EmbedBuilder()
        .setColor('#34495e')
        .setTitle('🏷️ **NICKNAME MANAGER**')
        .setDescription(`
\`\`\`
🏷️ NICKNAME SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**User:** ${targetUser.tag}
**Current Nickname:** ${nickname}
**Display Name:** ${member?.displayName || targetUser.username}
**Can Modify:** ${member && interaction.member.roles.highest.position > member.roles.highest.position ? '✅ Yes' : '❌ No'}

**🔧 Management Options:**
• Use \`reset\` action to clear nickname
• Check role hierarchy for permissions
• Nickname history is not tracked`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `🏷️ Nickname managed by ${sender.tag}` })
        .setTimestamp();

      return sendReply(embed);
    }
// New security command
if (subcommand === 'security') {
  const accountAge = Math.floor((Date.now() - targetUser.createdTimestamp) / (1000 * 60 * 60 * 24));
  const user = await client.users.fetch(targetUser.id, { force: true });
  const flags = user.flags?.toArray() || [];
  const hasAvatar = targetUser.avatar !== null;
  const isVerified = flags.includes('VerifiedBot') || flags.includes('VerifiedDeveloper');
  
  const securityScore = 
    (accountAge > 30 ? 25 : accountAge > 7 ? 15 : 0) +
    (hasAvatar ? 20 : 0) +
    (flags.length > 0 ? 30 : 0) +
    (isVerified ? 25 : 0);

  const embed = new EmbedBuilder()
    .setColor(securityScore > 70 ? '#00ff00' : securityScore > 40 ? '#ffff00' : '#ff0000')
    .setTitle('🔐 **SECURITY ANALYSIS**')
    .setDescription(`
\`\`\`
🔐 ACCOUNT SECURITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**User:** ${targetUser.tag}
**Security Score:** ${securityScore}/100
**Risk Level:** ${securityScore > 70 ? '🟢 Low' : securityScore > 40 ? '🟡 Medium' : '🔴 High'}

**🔍 Security Factors:**
• **Account Age:** ${accountAge > 30 ? '✅' : accountAge > 7 ? '⚠️' : '❌'} ${accountAge} days
• **Profile Picture:** ${hasAvatar ? '✅' : '❌'} ${hasAvatar ? 'Set' : 'Default'}
• **Discord Badges:** ${flags.length > 0 ? '✅' : '❌'} ${flags.length} badges
• **Verification:** ${isVerified ? '✅ Verified' : '❌ Standard'}

**🛡️ Risk Assessment:**
${securityScore > 70 ? '🟢 **LOW RISK** - Established account' : 
  securityScore > 40 ? '🟡 **MEDIUM RISK** - Moderate verification' : 
  '🔴 **HIGH RISK** - Limited account history'}`)
    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: `🔐 Security scanned by ${sender.tag}` })
    .setTimestamp();

  return sendReply(embed);
}
 //Enhanced stats command
    if (subcommand === 'stats') {
      const accountAge = Math.floor((Date.now() - targetUser.createdTimestamp) / (1000 * 60 * 60 * 24));
      const serverAge = member ? Math.floor((Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24)) : 0;
      const roles = member?.roles.cache.filter(r => r.name !== '@everyone') || [];
      const user = await client.users.fetch(targetUser.id, { force: true });
      const flags = user.flags?.toArray() || [];
      const mutuals = client.guilds.cache.filter(g => g.members.cache.has(targetUser.id));

      const embed = new EmbedBuilder()
        .setColor('#16a085')
        .setTitle('📊 **ADVANCED STATISTICS**')
        .setDescription(`
\`\`\`
📊 COMPREHENSIVE ANALYTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**User:** ${targetUser.tag}
**Overall Score:** ${Math.floor((accountAge/10) + (serverAge/5) + (roles.size*2) + (flags.length*5) + (mutuals.size*3))}`)
        .addFields(
          { 
            name: '📈 **Account Metrics**', 
            value: `• Account Age: ${accountAge} days\n• Server Time: ${serverAge} days\n• Total Badges: ${flags.length}\n• Bot Status: ${targetUser.bot ? 'Yes' : 'No'}`, 
            inline: true 
          },
          { 
            name: '🎭 **Server Profile**', 
            value: member ? `• Role Count: ${roles.size}\n• Highest Role: ${member.roles.highest.name}\n• Boost Status: ${member.premiumSince ? 'Active' : 'None'}\n• Join Position: Computing...` : 'Not in server', 
            inline: true 
          },
          { 
            name: '🌐 **Network Data**', 
            value: `• Mutual Servers: ${mutuals.size}\n• Network Reach: ${mutuals.reduce((acc, g) => acc + g.memberCount, 0).toLocaleString()}\n• Presence: ${member?.presence?.status || 'offline'}\n• Platform: ${member?.presence?.clientStatus ? Object.keys(member.presence.clientStatus).join(', ') : 'Unknown'}`, 
            inline: false 
          }
        )
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `📊 Statistics compiled by ${sender.tag}` })
        .setTimestamp();

      return sendReply(embed);
    }

    // Help command
    if (subcommand === 'help' || !subcommand) {
      const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setTitle('🔍 **USER COMMAND HELP**')
        .setDescription(`
\`\`\`
🔍 ADVANCED USER TOOLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**📋 Available Commands:**
Use \`/user <subcommand>\` or \`${isSlashCommand ? '/user' : '!user'} <subcommand>\``)
        .addFields(
          { 
            name: '📊 **Profile Commands**', 
            value: `• \`info\` - Complete user profile analysis\n• \`avatar\` - High-resolution avatar display\n• \`banner\` - Profile banner viewer\n• \`createdat\` - Account creation timeline\n• \`badges\` - Discord achievements`, 
            inline: true 
          },
          { 
            name: '🏰 **Server Commands**', 
            value: `• \`roles\` - Role hierarchy analysis\n• \`permissions\` - Channel permissions\n• \`joinedat\` - Server join analytics\n• \`boosting\` - Boost status tracker\n• \`nickname\` - Nickname management (Admin)`, 
            inline: true 
          },
          { 
            name: '🌐 **Network Commands**', 
            value: `• \`mutuals\` - Mutual server analysis\n• \`activity\` - Presence monitoring\n• \`security\` - Account security scan\n• \`stats\` - Advanced statistics\n• \`help\` - This command guide`, 
            inline: false 
          }
        )
        .addFields(
          { 
            name: '💡 **Usage Examples**', 
            value: `• \`/user info @username\` - Analyze user profile\n• \`/user permissions @user #channel\` - Check permissions\n• \`/user mutuals @user\` - View mutual servers\n• \`/user security\` - Scan your account security`, 
            inline: false 
          },
          { 
            name: '🔧 **Features**', 
            value: `• **Hybrid Support** - Works with slash commands and prefix\n• **Advanced Analytics** - Comprehensive user insights\n• **Permission Checks** - Detailed permission analysis\n• **Security Scanning** - Account safety assessment\n• **Network Mapping** - Mutual server discovery`, 
            inline: false 
          }
        )
        .setThumbnail(cmdIcons.rippleIcon)
        .setFooter({ text: `🔍 Help requested by ${sender.tag} | Version 2.0` })
        .setTimestamp();

      return sendReply(embed);
    }

    // Default fallback
    return sendReply(new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('❌ **UNKNOWN COMMAND**')
      .setDescription(`Unknown subcommand: \`${subcommand}\`\n\nUse \`[prefix ex: !user help]\` to see all available commands.`)
    );
  }
};