const axios = require('axios');
const { Telegraf } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_API_KEY);

let image_count = 1;
let prompt = '';

bot.start((ctx) => ctx.reply(`Welcome ${ctx.chat.first_name}\n\nI am a bot designed by Srihari S with the functionalities of Lexica. I can fetch images based on your prompts.`));

bot.hears('hi', (ctx) => ctx.reply('Hey there'));

bot.command('generate', async(ctx) => {
    ctx.reply('Generating image...');
    if(parseInt(ctx.message.text.split(' ')[1])!=NaN && parseInt(ctx.message.text.split(' ')[1])>0){
        image_count = parseInt(ctx.message.text.split(' ')[1]);
        prompt = encodeURI(ctx.message.text.split(' ').slice(2).join(' '));
    }
    else if(parseInt(ctx.message.text.split(' ')[1])!=NaN && parseInt(ctx.message.text.split(' ')[1])<=0){
        ctx.reply('Please enter a valid number of images to generate.');
        return;
    }
    else{
        image_count = 1;
        prompt = encodeURI(ctx.message.text.split(' ').slice(1).join(' '));
    }
    await axios.get(process.env.LEXICA_API_URL + prompt).then((response) => {
        if(response.data.images.length==0){
            ctx.reply('Sorry, I could not generate an image for you. Please try again.');
            return;
        }
        else if(image_count>response.data.images.length){
            ctx.reply(`I can only generate ${response.data.images.length} images for you for this prompt.`);
            image_count = response.data.images.length;
            for(let i=0;i<image_count;i++){
                ctx.replyWithPhoto(response.data.images[i].src);
            }
            return;
        }
        for(let i=0;i<image_count;i++){
            ctx.replyWithPhoto(response.data.images[i].src);
        }
    }).catch((error) => {
        ctx.reply('Sorry, I could not generate an image for you. Please try again.');
    });
});

bot.command('help', (ctx) => ctx.replyWithMarkdownV2(`*Commands*\n\n/start: Start the bot\n/generate _prompt_: Generate an image based on the prompt\n/generate _n_ _prompt_: Generate n images based on the prompt\n/help: Get help`));


// Launch the bot
bot.launch();