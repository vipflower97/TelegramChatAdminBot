// Include Telegraf module
const Telegraf = require("telegraf");
// Import replies file
const replies = require("./replies");

// ENV
const botToken = process.env.TOKEN;
const secretPath = process.env.SECRET_PATH;
const port = process.env.PORT;

console.log(botToken);
console.log(secretPath);
console.log(port);

// Create a bot using TOKEN provided as environment variable
const bot = new Telegraf(botToken);

//Helpers

// Extract reply_to_message.message_id field from Telegraf ctx
// If not present, return null
const getReplyToMessageId = ctx =>
  ctx.message.reply_to_message ? ctx.message.reply_to_message.message_id : null;

// This method will send the reply, based on the answer type
// (text / gif / sticker). See replies.js for objects structure.
const sendReply = (ctx, reply) => {
  // reply method will be the Telegraf method for sending the reply
  let replyMethod = {
    text: ctx.reply,
    gif: ctx.replyWithDocument,
    sticker: ctx.replyWithSticker
  }[reply.type];

  replyMethod(reply.value, {
    // this will make the bot reply to the original message instead of just sending it
    reply_to_message_id: getReplyToMessageId(ctx)
  });
};

const testMenu = Telegraf.Extra.markdown().markup(m =>
  m.inlineKeyboard([m.callbackButton("Test button", "test")])
);

const aboutMenu = Telegraf.Extra.markdown().markup(m =>
  m.keyboard([m.callbackButton("⬅️ Back")]).resize()
);

// Commmands

bot.start(ctx => ctx.reply("Welcome. How may I help?"));

bot.command("help", ctx => {
  ctx.reply("Available triggers:\n\n" + Object.keys(replies).join("\n"));
});

// /list command - will send all the triggers defined in replies.js.
bot.command("list", ctx => {
  ctx.reply("Available triggers:\n\n" + Object.keys(replies).join("\n"));
});

//Events

// Listen on every text message, if message.text is one of the trigger,
// send the reply
bot.on("text", ctx => {
  let cmd = ctx.message.text.toLowerCase();
  console.log(cmd);
  if (cmd in replies) sendReply(ctx, replies[cmd]);
});

bot.on("new_chat_members", ctx => {
  console.log(ctx);
  debugger;
  for (let member of ctx.update.message.new_chat_members) {
    if (member.is_bot) {
      //TODO: Kick out. currentlly just report
      //ctx.reply(`נא לשים לב: ${member.first_name} הוא בוט ולא משתמש רגיל`);
      console.log(`A bot joind the group: ${member.first_name}`);
    } else {
      ctx.reply(`ברוך הבא ${member.first_name}`);
    }
  }
});

bot.on("left_chat_member", ctx => {
  console.log("left: " + ctx);
});

bot.on("contact", ctx => {
  console.log("contact: " + ctx);
});

// MISC.
bot.hears("hi", ctx => ctx.reply("Hey there"));
bot.hears(/buy/i, ctx => ctx.reply("Buy-buy"));

bot.hears("test", ctx => {
  ctx.reply("test message", testMenu).then(() => {
    ctx.reply("about", aboutMenu);
  });
});

bot.hears("shutdownMySecretKey", ctx => {
  telegraf.stop([callback]);
});

// Actions - for buttons?

bot.action("test", ctx => ctx.answerCallbackQuery("Yay!"));

// Main App
/*
 * If you want to use polling methods, first should uncomment bellow line and comments Webhook lines.
 *
 * Note that the '/secret-path' in the 'SetWebHook' function isn't required and can be a different value, such as 'newMessages'.
 * According to Telegram Documentation the port of 'StartWebHook' function can be '443', '80', '88', '8443'.
 * If you don't have ssl certificates pass second parameter as 'null' value.
 */

// Polling method
//bot.startPolling();
// const timeout = 0;
// bot.startPolling(timeout);

// WebHook method

//bot.telegram.setWebhook(`https://api.telegram.org/bot${botToken}/${secretPath}`)
bot.telegram.setWebhook(`https://chat-admin.now.sh:${port}/${secretPath}`);
bot.startWebhook(`/${secretPath}`, null, port);
