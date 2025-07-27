const { SlashCommandBuilder } = require('@discordjs/builders');
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    GuildVerificationLevel,
} = require('discord.js');

function chunkArray(arr, size) {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
    );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Comprehensive server information and management commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Show detailed server information with advanced pagination')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('icon')
                .setDescription('Display the server icon in high quality')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('banner')
                .setDescription('Show the server banner if available')
        )
        .addSubcommand(sub => sub.setName('membercount').setDescription('Detailed member statistics and analytics'))
        .addSubcommand(sub => sub.setName('roles').setDescription('Complete list of server roles with details'))
        .addSubcommand(sub => sub.setName('emojis').setDescription('Display all server emojis categorized'))
        .addSubcommand(sub => sub.setName('channels').setDescription('Comprehensive channel summary and statistics'))
        .addSubcommand(sub => sub.setName('boosts').setDescription('Server boost information and perks'))
        .addSubcommand(sub => sub.setName('region').setDescription('Server region and locale information'))
        .addSubcommand(sub => sub.setName('verification').setDescription('Current verification level details'))
        .addSubcommand(sub => sub.setName('features').setDescription('All enabled server features and capabilities')),

    async execute(interaction) {
        let sender = interaction.user;
        let subcommand;
        let isSlashCommand = false;

        // Check if it's a slash command or prefix command
        if (interaction.isCommand && interaction.isCommand()) {
            isSlashCommand = true;
            await interaction.deferReply();
            subcommand = interaction.options.getSubcommand();
        } else {
            // Handle prefix command
            const message = interaction;
            sender = message.author;
            const args = message.content.split(' ');
            args.shift(); // Remove command name
            subcommand = args[0] || 'help';
        }

        const server = isSlashCommand ? interaction.guild : interaction.guild;
        
        // Helper function to send reply
        const sendReply = async (options) => {
            if (isSlashCommand) {
                return interaction.editReply(options);
            } else {
                return interaction.reply(options);
            }
        };

        if (!server) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff4757')
                .setTitle('❌ **ERROR**')
                .setDescription('```\n⚠️ This command must be used in a server!\n```')
                .setTimestamp();
            return sendReply({ embeds: [errorEmbed] });
        }

        // Enhanced INFO subcommand with futuristic design
        if (subcommand === 'info') {
            try {
                const owner = await server.fetchOwner();
                const emojis = server.emojis.cache;
                const roles = server.roles.cache.filter(role => role.id !== server.id);
                const channels = server.channels.cache;
        
                const textChannels = channels.filter(c => c.type === ChannelType.GuildText).size;
                const voiceChannels = channels.filter(c => c.type === ChannelType.GuildVoice).size;
                const categories = channels.filter(c => c.type === ChannelType.GuildCategory).size;
                const stageChannels = channels.filter(c => c.type === ChannelType.GuildStageVoice).size;
                const totalChannels = textChannels + voiceChannels + stageChannels + categories;
        
                const boostCount = server.premiumSubscriptionCount || 0;
                const boostLevel = server.premiumTier || 0;
        
                // === PAGE 1: Enhanced Server Info ===
                const baseEmbed = new EmbedBuilder()
                    .setColor('#00d4ff')
                    .setTitle('🏰 **SERVER INFORMATION**')
                    .setDescription(`\`\`\`
🏰 SERVER ANALYTICS DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``)
                    .setThumbnail(server.iconURL({ dynamic: true, size: 1024 }))
                    .addFields([
                        { name: '📛 **Server Name**', value: `\`${server.name}\`\n🏷️ Identity`, inline: true },
                        { name: '👑 **Owner**', value: `<@${owner.id}>\n🎯 Administrator`, inline: true },
                        { name: '🆔 **Server ID**', value: `\`${server.id}\`\n🔢 Unique`, inline: true },
                        { name: '👥 **Total Members**', value: `\`${server.memberCount.toLocaleString()}\`\n📈 Community`, inline: true },
                        { name: '🤖 **Bot Count**', value: `\`${server.members.cache.filter(m => m.user.bot).size}\`\n🔧 Automation`, inline: true },
                        { name: '🚀 **Boost Status**', value: `\`${boostCount} Boosts\`\n\`Level ${boostLevel}\`\n${boostLevel === 0 ? '🔘' : boostLevel === 1 ? '🟡' : boostLevel === 2 ? '🟠' : '🔴'} Tier`, inline: true },
                        { name: '📂 **Categories**', value: `\`${categories}\`\n📊 Organization`, inline: true },
                        { name: '💬 **Text Channels**', value: `\`${textChannels}\`\n📝 Communication`, inline: true },
                        { name: '🔊 **Voice Channels**', value: `\`${voiceChannels}\`\n🎤 Audio`, inline: true },
                        { name: '🎭 **Total Roles**', value: `\`${roles.size}\`\n🛡️ Hierarchy`, inline: true },
                        { name: '😀 **Custom Emojis**', value: `\`${emojis.size}\`\n🎨 Expression`, inline: true },
                        { name: '🆕 **Server Created**', value: `<t:${Math.floor(server.createdTimestamp / 1000)}:F>\n<t:${Math.floor(server.createdTimestamp / 1000)}:R>`, inline: false },
                    ])
                    .setFooter({ text: `📊 Page 1 of ${Math.ceil(emojis.size / 25) + 2} • Advanced Analytics` })
                    .setTimestamp();
        
                // === PAGE 2: Enhanced Roles ===
                const sortedRoles = roles.sort((a, b) => b.position - a.position);
                const roleEmbed = new EmbedBuilder()
                    .setColor('#8e44ad')
                    .setTitle('🎭 **ROLE HIERARCHY**')
                    .setDescription(`\`\`\`
🎭 PERMISSION STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

${sortedRoles.size > 0 ? 
    sortedRoles.map(role => `<@&${role.id}> \`(${role.members.size} members)\``).join('\n') : 
    '`No custom roles found`'
}

\`\`\`yaml
Statistics:
  Total Roles: ${roles.size}
  Highest Role: ${sortedRoles.first()?.name || 'None'}
  Most Members: ${sortedRoles.sort((a, b) => b.members.size - a.members.size).first()?.name || 'None'}
\`\`\``)
                    .setThumbnail(server.iconURL({ dynamic: true }))
                    .setFooter({ text: `🎭 Page 2 of ${Math.ceil(emojis.size / 25) + 2} • Role Management` })
                    .setTimestamp();
        
                // === PAGE 3+: Enhanced Emojis ===
                const animatedEmojis = emojis.filter(e => e.animated);
                const staticEmojis = emojis.filter(e => !e.animated);
                const emojiChunks = chunkArray(emojis.map(e => e.toString()), 25);
                
                const emojiEmbeds = emojiChunks.map((chunk, i) =>
                    new EmbedBuilder()
                        .setColor('#f39c12')
                        .setTitle(`😀 **EMOJI COLLECTION** (${i + 1}/${emojiChunks.length})`)
                        .setDescription(`\`\`\`
😀 EMOJI LIBRARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

${chunk.join(' ')}

\`\`\`yaml
Collection Stats:
  Total Emojis: ${emojis.size}
  Animated: ${animatedEmojis.size}
  Static: ${staticEmojis.size}
  Page: ${i + 1}/${emojiChunks.length}
\`\`\``)
                        .setThumbnail(server.iconURL({ dynamic: true }))
                        .setFooter({ text: `😀 Page ${i + 3} of ${Math.ceil(emojis.size / 25) + 2} • Emoji Manager` })
                        .setTimestamp()
                );
        
                // Combine all pages
                const embeds = [baseEmbed, roleEmbed, ...emojiEmbeds];
        
                // Enhanced Navigation Buttons
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('◀️ Previous')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next ▶️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(embeds.length <= 1)
                );
        
                let currentPage = 0;
                await sendReply({ embeds: [embeds[currentPage]], components: [row] });
        
                if (embeds.length > 1) {
                    const filter = i => ['previous', 'next'].includes(i.customId) && i.user.id === sender.id;
                    const collector = (isSlashCommand ? interaction.channel : interaction.channel).createMessageComponentCollector({ filter, time: 300000 });
        
                    collector.on('collect', async i => {
                        if (i.customId === 'previous') currentPage--;
                        if (i.customId === 'next') currentPage++;
        
                        row.components[0].setDisabled(currentPage === 0);
                        row.components[1].setDisabled(currentPage === embeds.length - 1);
        
                        await i.update({ embeds: [embeds[currentPage]], components: [row] });
                    });
        
                    collector.on('end', async () => {
                        try {
                            if (isSlashCommand) {
                                await interaction.editReply({ components: [] });
                            } else {
                                // For prefix commands, we need to handle differently
                                row.components.forEach(button => button.setDisabled(true));
                                await interaction.edit({ components: [row] });
                            }
                        } catch (err) {
                            console.error('Failed to remove buttons after collector ended:', err);
                        }
                    });
                }
        
            } catch (error) {
                console.error('Error fetching server information:', error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff4757')
                    .setTitle('❌ **ERROR**')
                    .setDescription('```\n⚠️ Failed to fetch server information\n```')
                    .setTimestamp();
                return sendReply({ embeds: [errorEmbed] });
            }
        }
        
        // Enhanced ICON subcommand
        else if (subcommand === 'icon') {
            const iconURL = server.iconURL({ format: 'png', dynamic: true, size: 1024 });
            if (!iconURL) {
                const embed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🖼️ **SERVER ICON**')
                    .setDescription(`\`\`\`
🖼️ ICON DISPLAY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

❌ **No server icon found**

\`\`\`yaml
Suggestion:
  Upload a server icon in Server Settings
  Recommended: 512x512 pixels
  Formats: PNG, JPG, GIF
\`\`\``)
                    .setTimestamp();
                return sendReply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setColor('#7c3aed')
                .setTitle('🖼️ **SERVER ICON**')
                .setDescription(`\`\`\`
🖼️ ICON GALLERY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

🏰 **${server.name}**

🔗 **[Download Original](${iconURL})**

\`\`\`yaml
Image Details:
  Format: High Quality PNG
  Resolution: 1024x1024
  Type: ${server.iconURL({ dynamic: true }) !== server.iconURL({ dynamic: false }) ? 'Animated' : 'Static'}
\`\`\``)
                .setImage(iconURL)
                .setFooter({ text: `🎨 Server Icon • ${server.memberCount.toLocaleString()} members` })
                .setTimestamp();
            
            await sendReply({ embeds: [embed] });
        } 
        
        // Enhanced BANNER subcommand
        else if (subcommand === 'banner') {
            const bannerURL = server.bannerURL({ format: 'png', dynamic: true, size: 1024 });
            if (!bannerURL) {
                const embed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🎨 **SERVER BANNER**')
                    .setDescription(`\`\`\`
🎨 BANNER DISPLAY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

❌ **No server banner found**

\`\`\`yaml
Requirements:
  Boost Level: 2 or higher required
  Current Level: ${server.premiumTier}
  Needed Boosts: ${server.premiumTier < 2 ? (15 - (server.premiumSubscriptionCount || 0)) : 0}
\`\`\`

> 🚀 **Boost this server to unlock banners!**`)
                    .setTimestamp();
                return sendReply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setColor('#00d4ff')
                .setTitle('🎨 **SERVER BANNER**')
                .setDescription(`\`\`\`
🎨 BANNER SHOWCASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

🏰 **${server.name}**

🔗 **[Download Original](${bannerURL})**

\`\`\`yaml
Banner Details:
  Format: High Quality PNG
  Resolution: 1920x1080
  Boost Level: ${server.premiumTier}
  Status: Premium Feature
\`\`\``)
                .setImage(bannerURL)
                .setFooter({ text: `🎨 Server Banner • Level ${server.premiumTier} Boosted` })
                .setTimestamp();
            
            await sendReply({ embeds: [embed] });
        }
        
        // Enhanced MEMBERCOUNT subcommand
        else if (subcommand === 'membercount') {
            const members = await server.members.fetch();
            const humans = members.filter(m => !m.user.bot).size;
            const bots = members.filter(m => m.user.bot).size;

            const statuses = {
                online: members.filter(m => m.presence?.status === 'online').size,
                idle: members.filter(m => m.presence?.status === 'idle').size,
                dnd: members.filter(m => m.presence?.status === 'dnd').size,
                offline: members.filter(m => !m.presence || m.presence.status === 'offline').size
            };

            const embed = new EmbedBuilder()
                .setColor('#00bfff')
                .setTitle('👥 **MEMBER ANALYTICS**')
                .setDescription(`\`\`\`
👥 COMMUNITY STATISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``)
                .addFields(
                    { name: '📊 **Total Members**', value: `\`${members.size.toLocaleString()}\`\n🌐 Community`, inline: true },
                    { name: '👤 **Human Users**', value: `\`${humans.toLocaleString()}\`\n🧑‍🤝‍🧑 Real People`, inline: true },
                    { name: '🤖 **Bot Users**', value: `\`${bots.toLocaleString()}\`\n⚙️ Automation`, inline: true },
                    { name: '🟢 **Online**', value: `\`${statuses.online.toLocaleString()}\`\n✅ Active`, inline: true },
                    { name: '🌙 **Idle**', value: `\`${statuses.idle.toLocaleString()}\`\n⏰ Away`, inline: true },
                    { name: '🔴 **Do Not Disturb**', value: `\`${statuses.dnd.toLocaleString()}\`\n🚫 Busy`, inline: true },
                    { name: '⚪ **Offline**', value: `\`${statuses.offline.toLocaleString()}\`\n💤 Inactive`, inline: true }
                )
                .setThumbnail(server.iconURL({ dynamic: true }))
                .setFooter({ text: `📈 Member Analytics • ${((humans/members.size)*100).toFixed(1)}% Human Ratio` })
                .setTimestamp();

            return sendReply({ embeds: [embed] });
        }

        // Enhanced ROLES subcommand
        else if (subcommand === 'roles') {
            const roles = server.roles.cache
                .filter(role => role.id !== server.id)
                .sort((a, b) => b.position - a.position);

            const roleList = roles.map(role => {
                const colorHex = role.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#000000';
                return `${role} \`${role.id}\` \`${colorHex}\` - \`${role.members.size} members\``;
            });

            const embed = new EmbedBuilder()
                .setColor('#8e44ad')
                .setTitle(`🎭 **ROLE MANAGEMENT** [${roles.size}]`)
                .setDescription(`\`\`\`
🎭 HIERARCHY SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

${roleList.length > 0 ? roleList.join('\n') : '`No custom roles found`'}

\`\`\`yaml
Role Statistics:
  Total Roles: ${roles.size}
  Hoisted Roles: ${roles.filter(r => r.hoist).size}
  Mentionable: ${roles.filter(r => r.mentionable).size}
  With Permissions: ${roles.filter(r => r.permissions.bitfield > 0n).size}
\`\`\``)
                .setThumbnail(server.iconURL({ dynamic: true }))
                .setFooter({ text: `🎭 Role Hierarchy • ${roles.size} Total Roles` })
                .setTimestamp();

            return sendReply({ embeds: [embed] });
        }

        // Enhanced EMOJIS subcommand
        else if (subcommand === 'emojis') {
            const emojis = server.emojis.cache;
            const animated = emojis.filter(e => e.animated);
            const staticEmojis = emojis.filter(e => !e.animated);

            const embed = new EmbedBuilder()
                .setColor('#f39c12')
                .setTitle('😀 **EMOJI COLLECTION**')
                .setDescription(`\`\`\`
😀 EMOJI LIBRARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``)
                .addFields(
                    { 
                        name: '🎞️ **Animated Emojis**', 
                        value: animated.size > 0 ? 
                            animated.map(e => e.toString()).join(' ') || 'None' : 
                            '`No animated emojis`', 
                        inline: false 
                    },
                    { 
                        name: '🖼️ **Static Emojis**', 
                        value: staticEmojis.size > 0 ? 
                            staticEmojis.map(e => e.toString()).join(' ') || 'None' : 
                            '`No static emojis`', 
                        inline: false 
                    }
                )
                .setFooter({ text: `😀 Emoji Collection • ${emojis.size} Total (${animated.size} animated, ${staticEmojis.size} static)` })
                .setTimestamp();

            return sendReply({ embeds: [embed] });
        }

        // Enhanced CHANNELS subcommand
        else if (subcommand === 'channels') {
            const channels = server.channels.cache;

            const counts = {
                categories: channels.filter(c => c.type === ChannelType.GuildCategory).size,
                text: channels.filter(c => c.type === ChannelType.GuildText).size,
                voice: channels.filter(c => c.type === ChannelType.GuildVoice).size,
                stage: channels.filter(c => c.type === ChannelType.GuildStageVoice).size,
                threads: channels.filter(c => c.isThread()).size,
                news: channels.filter(c => c.type === ChannelType.GuildNews).size,
                forum: channels.filter(c => c.type === ChannelType.GuildForum).size
            };

            const embed = new EmbedBuilder()
                .setColor('#2ecc71')
                .setTitle('📚 **CHANNEL OVERVIEW**')
                .setDescription(`\`\`\`
📚 CHANNEL INFRASTRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``)
                .addFields(
                    { name: '📂 **Categories**', value: `\`${counts.categories}\`\n🗂️ Organization`, inline: true },
                    { name: '💬 **Text Channels**', value: `\`${counts.text}\`\n📝 Discussion`, inline: true },
                    { name: '🔊 **Voice Channels**', value: `\`${counts.voice}\`\n🎤 Audio Chat`, inline: true },
                    { name: '🎭 **Stage Channels**', value: `\`${counts.stage}\`\n🎪 Presentations`, inline: true },
                    { name: '🧵 **Active Threads**', value: `\`${counts.threads}\`\n💭 Discussions`, inline: true },
                    { name: '📰 **News Channels**', value: `\`${counts.news}\`\n📢 Announcements`, inline: true },
                    { name: '🏛️ **Forum Channels**', value: `\`${counts.forum}\`\n💬 Q&A`, inline: true }
                )
                .setThumbnail(server.iconURL({ dynamic: true }))
                .setFooter({ text: `📚 Channel System • ${Object.values(counts).reduce((a, b) => a + b, 0)} Total Channels` })
                .setTimestamp();

            return sendReply({ embeds: [embed] });
        }

        // Enhanced BOOSTS subcommand
        else if (subcommand === 'boosts') {
            const boostCount = server.premiumSubscriptionCount || 0;
            const boostLevel = server.premiumTier;
            
            const boostPerks = {
                0: ['📱 Mobile streaming', '🎧 Voice quality: 96kbps'],
                1: ['🎬 Screen sharing: 720p 60fps', '📊 Custom emoji: 50 total', '🎧 Voice quality: 128kbps'],
                2: ['🎬 Screen sharing: 1080p 60fps', '📊 Custom emoji: 100 total', '🎨 Server banner', '📁 Upload limit: 50MB'],
                3: ['🎬 Screen sharing: 4K 60fps', '📊 Custom emoji: 250 total', '🎨 Animated server icon', '📁 Upload limit: 100MB', '🎵 Custom invite background']
            };

            const nextLevelBoosts = boostLevel < 3 ? [7, 14, 30][boostLevel] : null;
            const boostsNeeded = nextLevelBoosts ? Math.max(0, nextLevelBoosts - boostCount) : 0;

            const embed = new EmbedBuilder()
                .setColor('#ff73fa')
                .setTitle('🚀 **BOOST ANALYTICS**')
                .setDescription(`\`\`\`
🚀 BOOST DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``)
                .addFields(
                    { name: '💎 **Current Level**', value: `\`Level ${boostLevel}\`\n${boostLevel === 0 ? '🔘' : boostLevel === 1 ? '🟡' : boostLevel === 2 ? '🟠' : '🔴'} Tier ${boostLevel}`, inline: true },
                    { name: '🚀 **Active Boosts**', value: `\`${boostCount.toLocaleString()}\`\n💝 Supporters`, inline: true },
                    { name: '📈 **Next Level**', value: nextLevelBoosts ? `\`${boostsNeeded} more needed\`\n🎯 Target: ${nextLevelBoosts}` : '`Max Level Reached`\n🏆 Elite Status', inline: true }
                )
                .addFields({
                    name: `🎁 **Level ${boostLevel} Perks**`,
                    value: boostPerks[boostLevel].map(perk => `• ${perk}`).join('\n'),
                    inline: false
                })
                .setThumbnail('https://cdn.discordapp.com/emojis/853314249405071390.gif')
                .setFooter({ text: `🚀 Boost System • Learn more: discord.com/nitro` })
                .setTimestamp();

            return sendReply({ embeds: [embed] });
        }

        // Enhanced REGION subcommand
        else if (subcommand === 'region') {
            const embed = new EmbedBuilder()
                .setColor('#95a5a6')
                .setTitle('🌍 **SERVER REGION**')
                .setDescription(`\`\`\`
🌍 REGIONAL SETTINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

🗺️ **Preferred Locale:** \`${server.preferredLocale || 'English (US)'}\`

\`\`\`yaml
Region Benefits:
  🌐 Optimized connections
  📊 Localized features
  🎯 Targeted content
  ⚡ Reduced latency
\`\`\`

> 🔧 **Admins can change this in Server Settings**`)
                .setThumbnail(server.iconURL({ dynamic: true }))
                .setFooter({ text: `🌍 Server Region • ${server.memberCount.toLocaleString()} global members` })
                .setTimestamp();

            return sendReply({ embeds: [embed] });
        }

// Enhanced VERIFICATION subcommand (continued)
else if (subcommand === 'verification') {
    const levelMap = {
        [GuildVerificationLevel.None]: { name: "None", desc: "No verification required", emoji: "🔓", color: "#95a5a6" },
        [GuildVerificationLevel.Low]: { name: "Low", desc: "Email verification required", emoji: "📧", color: "#3498db" },
        [GuildVerificationLevel.Medium]: { name: "Medium", desc: "Account age > 5 minutes", emoji: "⏰", color: "#f39c12" },
        [GuildVerificationLevel.High]: { name: "High", desc: "Member for 10+ minutes", emoji: "🔒", color: "#e74c3c" },
        [GuildVerificationLevel.VeryHigh]: { name: "Very High", desc: "Phone number required", emoji: "📱", color: "#8e44ad" }
    };

    const currentLevel = levelMap[server.verificationLevel] || levelMap[GuildVerificationLevel.None];

    const embed = new EmbedBuilder()
        .setColor(currentLevel.color)
        .setTitle('🔐 **VERIFICATION SYSTEM**')
        .setDescription(`\`\`\`
🔐 SECURITY DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``)
        .addFields(
            { name: '🛡️ **Current Level**', value: `${currentLevel.emoji} **${currentLevel.name}**\n🔧 Security`, inline: true },
            { name: '📋 **Requirements**', value: `\`${currentLevel.desc}\`\n✅ Active`, inline: true },
            { name: '🎯 **Protection**', value: `\`Enhanced Security\`\n🛡️ ${currentLevel.name} Level`, inline: true }
        )
        .addFields({
            name: '📊 **Verification Levels**',
            value: `${server.verificationLevel === GuildVerificationLevel.None ? '🔘' : '⚪'} **None** - No restrictions
${server.verificationLevel === GuildVerificationLevel.Low ? '🔘' : '⚪'} **Low** - Email verification
${server.verificationLevel === GuildVerificationLevel.Medium ? '🔘' : '⚪'} **Medium** - Account age required
${server.verificationLevel === GuildVerificationLevel.High ? '🔘' : '⚪'} **High** - Member duration required
${server.verificationLevel === GuildVerificationLevel.VeryHigh ? '🔘' : '⚪'} **Very High** - Phone verification`,
            inline: false
        })
        .setThumbnail(server.iconURL({ dynamic: true }))
        .setFooter({ text: `🔐 Verification System • ${currentLevel.name} Level Active` })
        .setTimestamp();

    return sendReply({ embeds: [embed] });
}

// Enhanced FEATURES subcommand
else if (subcommand === 'features') {
    const features = server.features;
    const featureDescriptions = {
        'ANIMATED_BANNER': '🎬 Animated Banner',
        'ANIMATED_ICON': '🎭 Animated Icon',
        'APPLICATION_COMMAND_PERMISSIONS_V2': '⚙️ Advanced Permissions',
        'AUTO_MODERATION': '🤖 Auto Moderation',
        'BANNER': '🎨 Server Banner',
        'COMMUNITY': '🌐 Community Server',
        'DEVELOPER_SUPPORT_SERVER': '👨‍💻 Developer Support',
        'DISCOVERABLE': '🔍 Server Discovery',
        'FEATURABLE': '⭐ Featurable',
        'INVITES_DISABLED': '🚫 Invites Disabled',
        'INVITE_SPLASH': '🌊 Invite Splash',
        'MEMBER_VERIFICATION_GATE_ENABLED': '🔐 Member Screening',
        'MORE_EMOJI': '😀 Extended Emojis',
        'NEWS': '📰 News Channels',
        'PARTNERED': '🤝 Discord Partner',
        'PREVIEW_ENABLED': '👁️ Server Preview',
        'PRIVATE_THREADS': '🧵 Private Threads',
        'ROLE_ICONS': '🎭 Role Icons',
        'THREADS_ENABLED': '💬 Threads Enabled',
        'THREE_DAY_THREAD_ARCHIVE': '📦 3-Day Thread Archive',
        'TICKETED_EVENTS_ENABLED': '🎟️ Ticketed Events',
        'VANITY_URL': '🔗 Vanity URL',
        'VERIFIED': '✅ Verified Server',
        'VIP_REGIONS': '🌍 VIP Voice Regions',
        'WELCOME_SCREEN_ENABLED': '👋 Welcome Screen'
    };

    const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setTitle('🛠️ **SERVER FEATURES**')
        .setDescription(`\`\`\`
🛠️ FEATURE DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``)
        .addFields({
            name: '🎯 **Enabled Features**',
            value: features.length > 0 ? 
                features.map(f => featureDescriptions[f] || `🔹 ${f.replaceAll('_', ' ').toLowerCase()}`).join('\n') : 
                '`No special features enabled`',
            inline: false
        })
        .addFields(
            { name: '📊 **Feature Count**', value: `\`${features.length}\`\n🔧 Total Features`, inline: true },
            { name: '🎨 **Customization**', value: `\`${features.filter(f => ['BANNER', 'ANIMATED_ICON', 'VANITY_URL'].includes(f)).length}\`\n🖌️ Visual Features`, inline: true },
            { name: '🛡️ **Security**', value: `\`${features.filter(f => ['AUTO_MODERATION', 'MEMBER_VERIFICATION_GATE_ENABLED'].includes(f)).length}\`\n🔒 Safety Features`, inline: true }
        )
        .setThumbnail(server.iconURL({ dynamic: true }))
        .setFooter({ text: `🛠️ Server Features • ${features.length} Active Features` })
        .setTimestamp();

    return sendReply({ embeds: [embed] });
}

// Help/Default subcommand
else {
    const embed = new EmbedBuilder()
        .setColor('#7289da')
        .setTitle('🏰 **SERVER COMMAND HELP**')
        .setDescription(`\`\`\`
🏰 COMMAND NAVIGATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``)
        .addFields(
            { name: '📊 **Information**', value: '`/server info` - Detailed server overview\n`/server membercount` - Member analytics\n`/server verification` - Security settings', inline: true },
            { name: '🎨 **Visual**', value: '`/server icon` - Server icon display\n`/server banner` - Server banner view\n`/server emojis` - Emoji collection', inline: true },
            { name: '⚙️ **Management**', value: '`/server roles` - Role hierarchy\n`/server channels` - Channel overview\n`/server features` - Server capabilities', inline: true },
            { name: '🚀 **Premium**', value: '`/server boosts` - Boost information\n`/server region` - Server locale\n`/server features` - Premium features', inline: true }
        )
        .setThumbnail(server.iconURL({ dynamic: true }))
        .setFooter({ text: `🏰 Server Tools • ${server.name}` })
        .setTimestamp();

    return sendReply({ embeds: [embed] });
}
},
};