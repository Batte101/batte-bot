const Discord = require('discord.js');
const bot = new Discord.Client();

let config = require('./botconfig.json');
let token = config.token;
let myID = config.myID;
let prefix = config.prefix;
let devID = config.devID;

var msgID = String;
var chatID = String;
var replyMode = Boolean;
var devMode = Boolean;
var muteMode = Boolean;
var otpravleno = Boolean;
const helpList = 'Бот умеет принимать личные сообщения, ' + 
'отвечать на них, информировать об упоминаниях в чате и заменять ' + 
'сообщения хозяина на свои.\n\
\n\
Доступные команды:\n\
**'+ prefix +'help** - Вывод этого сообщения.\n\
**'+ prefix +'mute** - Включение/выключение замены сообщений.\n\
**'+ prefix +'reply** - Включение/выключение Режима Автоответа.\n\
**'+ prefix +'dev** - Включение/выключение Режима Разработки.\n\
\n\
Только в ЛС:\n\
**'+ prefix +'ID** <12345> - Выбор пользователя для отправки сообщений.\n\
**'+ prefix +'chatID** <12345> - Выбор канала для чтения и отправки сообщений в канале.\n\
**'+ prefix +'stop** - Сброс выбора пользователя/канала.\n\
**'+ prefix +'crash yes** - Остановка работы бота.\n\
\n\
Только на сервере:\n\
**'+ prefix +'clear** <100> - Удаление сообщений.\n\
**'+ prefix +'delete** <msgID> - Удалить сообщение по его ID.\n\
**'+ prefix +'nick** <NAME> - Замена ника бота. При пустом - сброс.';

// Запуск бота
bot.on('ready', () => {
    bot.user.setActivity('Minecraft');
    console.log('Bot is Online.');
    msgID = null;
    chatID = null;
    devMode = false;
    muteMode = false;
    replyMode = false;
    otpravleno = true;
    bot.generateInvite(['CREATE_INSTANT_INVITE','ADD_REACTIONS','VIEW_CHANNEL',
    'SEND_MESSAGES','SEND_TTS_MESSAGES','MANAGE_MESSAGES','EMBED_LINKS','ATTACH_FILES',
    'READ_MESSAGE_HISTORY','MENTION_EVERYONE','USE_EXTERNAL_EMOJIS','VIEW_GUILD_INSIGHTS',
    'SPEAK','CHANGE_NICKNAME']).then(link => {
        console.log(link);
    });
});

// Dev Mode
function devUpdate(msg) {
    // Включение Dev Mode
    if (!devMode) {
        msg.channel.send('-- Dev Mode **ON** --');
        devMode = true;
    } else
    // Выключение Dev Mode
    if (devMode) {
        msg.channel.send('-- Dev Mode **OFF** --');
        devMode = false;
    }
    if (msg.guild !== null) {
        msg.delete();
    }
}

// Mute Mode
function muteUpdate(msg) {
    // Включение Mute Mode
    if (!muteMode) {
        msg.channel.send('-- Bot **Muted** --');
        muteMode = true;
    } else
    // Выключение Mute Mode
    if (muteMode) {
        msg.channel.send('-- Bot **Unmuted** --');
        muteMode = false;
    }
    if (msg.guild !== null) {
        msg.delete();
    }
}

// Reply Mode
function replyUpdate(msg) {
    // Включение Reply Mode
    if (!replyMode) {
        msg.channel.send('-- Reply Mode **ON** --');
        replyMode = true;
    } else
    // Выключение Reply Mode
    if (replyMode) {
        msg.channel.send('-- Reply Mode **OFF** --');
        replyMode = false;
    }
    if (msg.guild !== null) {
        msg.delete();
    }
}

// Отправка сообщения
function sendMsg(msg, adres) {
    if (msg.attachments.size > 0) {
        adres.send(msg.content, msg.attachments.first());
    } else {
        adres.send(msg.content);
    }
}

// Выбор рандомного по максимуму
function randomTime(max) {
    Math.floor(Math.random() * Math.floor(max));
}

// Остановка бота (принудительная)
function crash() {
    msg.channel.send('Hello world!');
}

bot.on('message', msg => {
    if (!devMode || msg.guild == null || msg.guild.id == devID) {
        // Реакция на мои сообщения
        if (msg.author.id == myID) {

            // Реакция на сообщения на серверах:
            if (msg.guild !== null) {
                // Замена моих сообщений
                if (!muteMode && !msg.content.startsWith(prefix)) {
                    sendMsg(msg, msg.channel);
                    if (msg.attachments.size > 0) {
                        setTimeout(function(){
                            msg.delete();
                        }, 1000);
                    } else {
                        msg.delete();
                    }
                }
            }

            // Реакция на сообщения в ЛС
            else {
                // Ответ в ЛС
                if (msgID !== null && !msg.content.startsWith(prefix)) {
                    otpravleno = false;
                    bot.users.fetch(msgID).then((user) => {
                        sendMsg(msg, user);
                    })
                    setTimeout(function(){
                        otpravleno = true;
                        msg.channel.send('Отправлено.');
                    }, 500);
                }

                // Отправление в канал
                if (chatID !== null && !msg.content.startsWith(prefix)) {
                    otpravleno = false;
                    bot.channels.fetch(chatID).then((chat) => {                
                        sendMsg(msg, chat);
                    })
                    setTimeout(function(){
                        otpravleno = true; 
                        msg.channel.send('Отправлено.');
                    }, 500);               
                }
            }       

            // Префикс-команды
            if (msg.content.startsWith(prefix)) {
            let args = msg.content.substring(prefix.length).split(" ");
            switch(args[0]) {
                // Вывод инструкций
                case 'help':
                    const embed = new Discord.MessageEmbed()
                    .setAuthor('by Batte')
                    .setTitle('Команды персонального бота.')
                    .setThumbnail(bot.user.avatarURL())
                    .setDescription(helpList)
                    .setColor('#88b6c4');
                    msg.channel.send(embed);
                    if (msg.guild !== null) {
                        msg.delete();
                    }
                    break;
                // Очистка чата
                case 'clear':
                    if (msg.guild !== null && args[1] !== null) {
                        msg.channel.bulkDelete(args[1]);
                    }
                    break;
                // Удалить сообщение по ID
                case 'delete':
                    msg.channel.messages.fetch(args[1]).then(sms => {
                        sms.delete()
                    });
                    msg.delete();
                    break;
                // Reply Mode
                case 'reply':
                    replyUpdate(msg);
                    break;
                // Mute Mode
                case 'mute':
                    muteUpdate(msg);
                    break;
                // Dev Mode
                case 'dev':
                    devUpdate(msg);
                    break;
                // Выбор пользователя для отправки ЛС
                case 'ID':
                    if (msg.guild === null) {
                        chatID = null;
                        msgID = args[1];
                        bot.users.fetch(msgID).then((user) => {
                            msg.channel.send('Выбран пользователь ' +
                            user.username + '.');
                        })
                    }
                    break;
                // Выбор канала для прослушки и отправки
                case 'chatID':
                    if (msg.guild === null) {
                        msgID = null;
                        chatID = args[1];
                        bot.channels.fetch(chatID).then((chat) => {
                            msg.channel.send('Выбран чат ' + chat.toString() + '.');
                            msg.channel.send('----------------------------------');
                        })
                    }
                    break;
                // Сброс ЛС и канала
                case 'stop':
                    if (msg.guild === null) {
                        msgID = null;
                        chatID = null;
                        msg.channel.send('ID обнулен.');
                        msg.channel.send('----------------------------------');
                    }
                    break;
                // Краш бота (ПОНИМАЮ)
                case 'crash':
                    if (msg.guild === null && args[1] === 'yes') {
                        msg.channel.send('Бот отключен.');
                        crash();
                    }
                    break;
                // Изменение ника
                case 'nick':
                    msg.guild.members.fetch(bot.user.id).then(user => {
                        if (args[1] != null) {
                            user.setNickname(args[1]);
                        } else {
                            user.setNickname('Batte');
                        }
                    })
                    msg.delete();
                    break;
            }
        }

        // Очистка от бота
        if (msg.author.bot) {
            if (msg.guild === null && msg.content == 'Отправлено.' && 
            otpravleno){
                setTimeout(function(){
                    msg.delete();
                }, 3000);
            }
            if (msg.guild !== null) {
                if (msg.content.startsWith('-- ')) {
                    setTimeout(function(){
                        msg.delete();
                    }, 1500);
                }
            }
        }
        }

        // Уведомление в ЛС при упоминании бота
        if (msg.mentions.has(bot.user.id) && !msg.author.bot) {
            bot.users.fetch(myID).then((user) => {
                user.send('Сервер: ' + msg.guild.name + '. Канал: #' +
                msg.channel.name + '. От ' + msg.author.username + ': ' +
                msg.content);
            })
        }

        // Пересылка из ЛС бота мне
        if (!msg.author.bot && msg.guild === null && msg.author != myID) {
            bot.users.fetch(myID).then((user) => {
                user.send('ЛС от ' + msg.author.username + ': ' + msg.content
                + '    (' + msg.author.id + ')');
            })
        }

        // Реплай при пинге (Reply Mode)
        if (replyMode && (msg.mentions.has(bot.user.id) || msg.mentions.has(myID))
        && !msg.author.bot) {
            setTimeout(function(){
                msg.reply('Что?');
            }, randomTime(2000) + 2000);
        }

        // Пересылка всего канала в ЛС, если выбран канал
        if (msg.channel.id == chatID && msg.author.id != bot.user.id) {
            bot.users.fetch(myID).then((user) => {
                if (msg.attachments.size > 0) {
                    user.send(msg.author.username + ': ' + msg.content,
                    msg.attachments.first());
                } else {
                    user.send(msg.author.username + ': ' + msg.content);
                }
            })
        }
    }
})

bot.login(token);
