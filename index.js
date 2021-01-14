const Discord = require('discord.js');
const bot = new Discord.Client();

let config = require('./botconfig.json'); 
let token = config.token;
let myID = config.myID; 
let prefix = config.prefix;

var msgID = String;
var chatID = String; 
var replyMode = Boolean;
//var devMode = Boolean; 
var mute = Boolean;
var cmnd = Boolean;
var otpravleno = Boolean;

// Запуск бота
bot.on('ready', () => { 
    bot.user.setActivity('Minecraft');
    console.log('Bot is Online.');
    msgID = null;
    chatID = null;
    //devMode = false;
    mute = false;
    cmnd = false;
    otpravleno = true;
    replyMode = false;
    bot.generateInvite(['CREATE_INSTANT_INVITE','ADD_REACTIONS','VIEW_CHANNEL',
    'SEND_MESSAGES','SEND_TTS_MESSAGES','MANAGE_MESSAGES','EMBED_LINKS','ATTACH_FILES',
    'READ_MESSAGE_HISTORY','MENTION_EVERYONE','USE_EXTERNAL_EMOJIS','VIEW_GUILD_INSIGHTS',
    'SPEAK','CHANGE_NICKNAME']).then(link => { 
        console.log(link);
    });
});

// Mute Mode
function muteUpdate(msg) {
    // Включение Mute Mode
    if (!mute) {
        msg.channel.send('-------- Начало НРП чата. --------');
        mute = true;
    } else 
    // Выключение Mute Mode
    if (mute) {
        msg.channel.send('-------- Конец НРП чата. --------');
        mute = false;
    }

    if (msg.guild !== null) {
        msg.delete();
    }
}

// Reply Mode
function replyUpdate(msg) {
    // Включение Reply Mode
    if (!replyMode) {
        msg.channel.send('Я кому-то понадобился?');
        replyMode = true;
    } else 
    // Выключение Reply Mode
    if (replyMode) {
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

// Остановка бота (принудительная)
function crash() {
    msg.channel.send('Hello world!');
}

// Реакция на мои сообщения
bot.on('message', msg => {
    if (msg.author.id == myID) {

        // Реакция на сообщения на серверах:
        if (msg.guild !== null) {
            // Замена моих сообщений
            if (!mute && !msg.content.startsWith(prefix)) { 
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
        let args = msg.content.substring(prefix.length).split(" ");
        switch(args[0]) {
            // Очистка чата
            case 'clear':
                if (msg.guild !== null && args[1] !== null) {
                    msg.channel.bulkDelete(args[1]);
                }             
                break;
            // Reply Mode
            case 'reply':
                replyUpdate(msg);                     
                break;
            // Mute Mode
            case 'mute':
                muteUpdate(msg);                       
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
                    crash();
                }                                            
                break;
        }
    }
})

// Очистка от бота
bot.on('message', msg => {
    if (msg.guild === null && msg.author.bot && msg.content == 'Отправлено.' 
    && otpravleno) {
        setTimeout(function(){ 
            msg.delete();
        }, 3000);  
    }
})

// Уведомление в ЛС при упоминании бота
bot.on('message', msg => {
    if (msg.mentions.has(bot.user.id) && !msg.author.bot) {
        bot.users.fetch(myID).then((user) => {
            user.send('Сервер: ' + msg.guild.name + '. Канал: #' + 
            msg.channel.name + '. От ' + msg.author.username + ': ' + 
            msg.content);
        })
    }
})

// Пересылка из ЛС бота мне
bot.on('message', msg => {
    if (!msg.author.bot && msg.guild === null && msg.author != myID) {
        bot.users.fetch(myID).then((user) => {
            user.send('ЛС от ' + msg.author.username + ': ' + msg.content 
            + '    (' + msg.author.id + ')');
        })
    }
})

// Реплай при пинге (Reply Mode)
bot.on('message', msg => {
    if (replyMode && (msg.mentions.has(bot.user.id) || msg.mentions.has(myID)) 
    && !msg.author.bot) {
        msg.reply('Что?');
    }
})

// Пересылка всего канала в ЛС, если выбран канал
bot.on('message', msg => {
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
})

bot.login(token);