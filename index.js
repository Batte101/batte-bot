const Discord = require('discord.js');
const bot = new Discord.Client();

let config = require('./botconfig.json'); 
let token = config.token;
let myID = config.myID; 
let prefix = config.prefix;

var msgID = String;
var devMode = Boolean; 
var otpravleno = Boolean;

// Запуск бота
bot.on('ready', () => { 
    bot.user.setActivity('Minecraft');
    console.log('Bot is Online.');
    msgID = null;
    devMode = false;
    otpravleno = true;
    bot.generateInvite(['CREATE_INSTANT_INVITE','ADD_REACTIONS','VIEW_CHANNEL',
    'SEND_MESSAGES','SEND_TTS_MESSAGES','MANAGE_MESSAGES','EMBED_LINKS','ATTACH_FILES',
    'READ_MESSAGE_HISTORY','MENTION_EVERYONE','USE_EXTERNAL_EMOJIS','VIEW_GUILD_INSIGHTS',
    'SPEAK','CHANGE_NICKNAME']).then(link => { 
        console.log(link);
    });
});

// Dev mode
bot.on('message', msg => {    
    if (msg.author.id == myID && msg.content.toLowerCase() == prefix + 'dev') {
        // Включение dev mode
        if (!devMode) {
            msg.channel.send('-------- Начало НРП чата. --------');
            devMode = true;
        } else 
        // Выключение dev mode
        if (devMode) {
            msg.channel.send('-------- Конец НРП чата. --------');
            devMode = false;
        }

        if (msg.guild !== null) {
            msg.delete();
        }
    } 
})

// Реакция на мои сообщения на Серверах (не ЛС)
bot.on('message', msg => {
    if (msg.author.id == myID && !devMode && msg.guild !== null) {
        // Замена сообщений
        if (msg.attachments.size > 0) {
            msg.channel.send(msg.content, msg.attachments.first());
            setTimeout(function(){ 
                msg.delete();
            }, 1000);            
        } else {
            if (msg.content.toLowerCase() !== prefix + 'dev'){ 
                msg.channel.send(msg.content);
            }
            msg.delete();
        }   

        // Очистка чата
        let args = msg.content.substring(prefix.length).split(" ");
        switch(args[0]) {
            case 'clear':
                msg.channel.bulkDelete(100);
                break;
        }
    }
})

// Уведомление в ЛС при упоминании бота
bot.on('message', msg => {
    if (msg.mentions.has(bot.user.id) && !msg.author.bot && !devMode) {
        bot.users.fetch(myID).then((user) => {
            user.send('Сервер: ' + msg.guild.name + '. Канал: #' + msg.channel.name 
            + '. От ' + msg.author.username + ': ' + msg.content);
        })
    }
})

// Пересылка ЛС
bot.on('message', msg => {
    if (!msg.author.bot && msg.guild === null && msg.author != myID && !devMode) {
        bot.users.fetch(myID).then((user) => {
            user.send('ЛС от ' + msg.author.username + ': ' + msg.content + 
            '    (' + msg.author.id + ')');
        })
    }
})

// Ответ из ЛС
bot.on('message', msg => {
    if (msg.guild === null && msg.author == myID) {
        
        if (msgID !== null && !msg.content.includes('~')) {
            otpravleno = false;
            bot.users.fetch(msgID).then((user) => {                
                if (msg.attachments.size > 0) {
                    user.send(msg.content, msg.attachments.first());           
                } else {
                    if (msg.content.toLowerCase() !== prefix + 'dev'){ 
                        user.send(msg.content);
                    }
                } 
                               
            })
            setTimeout(function(){
                otpravleno = true; 
                msg.channel.send('Отправлено.');
            }, 500);               
        }

        let args = msg.content.substring(prefix.length).split(" ");
        switch(args[0]) {
            case 'ID':
                msgID = args[1];
                bot.users.fetch(msgID).then((user) => {
                    msg.channel.send('Выбран пользователь ' + user.username 
                    + '.');
                })
                break;
            case 'stop':
                msgID = null;
                msg.channel.send('ID обнулен.');
                break;
            case 'clear':
                msg.channel.delete();
                break;
        }        
    }
})

// Очистка ЛС от бота
bot.on('message', msg => {
    if (msg.guild === null && msg.author.bot && msg.content == 'Отправлено.' 
    && otpravleno) {
        setTimeout(function(){ 
            msg.delete();
        }, 3000);  
    }
})

bot.login(token);
