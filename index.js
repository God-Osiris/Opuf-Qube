if (Number(process.version.slice(1).split(".")[0]) < 16) throw new Error("Node 16.x or higher is required. Update Node on your system.");

const Discord = require("discord.js");
const { Client, Intents} = require('discord.js');
const mongooose = require('mongoose');
require('dotenv').config()

const prefix = '~';

const User = require("./database/user.js")

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

client.once('ready', () => {
    console.log('Bot works!')
})

client.on('messageCreate', async message => {
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift()?.toLowerCase();

    if(message.author.bot) return;

    if(command === 'register'){
        const user = await User.findOne({id: message.author.id});
        if(user === null){
            User.create({
                id: message.author.id,
                name: message.author.username,
                files: [{name: null, content: null}, {name: null, content: null}, {name: null, content: null}, {name: null, content: null}, {name: null, content: null}]
            })
            message.channel.send("You are now registered in our database! You can now use `~new <fileName>` command and start saving and sharing notes!")
        } else if(user !== null){
            message.channel.send("You are already registered!")
        }
    }

    if(command === 'new'){
        const user = await User.findOne({id: message.author.id});
        if(user === null){
            message.channel.send("You need to register first using `~register`!");
        } else if(user !== null){
            if(args[0] && typeof(args[0]) === 'string'){
                let i = 0;
                while(user.files[i].name !== null && i < 5){
                    if(i !== 4){
                        i+=1;
                    }
                }
                if(user.files[4].name !== null){
                    message.channel.send("You have reached the limit of file creation! Please delete a file using `~delete <fileName>` to make a new one!")
                } else if(user.files[i].name === null){
                    user.files[i].name = args[0].concat('.txt');
                    user.save();
                    message.channel.send(`Created new text file called ${args[0].concat('.txt')}! To start saving your notes in the file, use \`~open <fileName>\``);
                } 
            } else{
                message.channel.send('Invalid Command Usage!')
            }
        }
    }

    // if(command === 'delete'){
    //     const user = await User.findOne({id: message.author.id});
    //     if(user === null){
    //         message.channel.send("You need to register first using `~register`!");
    //     } else if(user !== null){
    //         if(args[0] && typeof(args[0]) === 'string'){

    //             while(user.files[i].name !== null && i < 5){
    //                 if(i !== 4){
    //                     i+=1;
    //                 }
    //             }
    //             if(user.files[4].name !== null){
    //                 message.channel.send("You have reached the limit of file creation! Please delete a file using `~delete <fileName>` to make a new one!")
    //             } else if(user.files[i].name === null){
    //                 user.files[i].name = args[0].concat('.txt');
    //                 user.save();
    //                 message.channel.send(`Created new text file called ${args[0].concat('.txt')}! To start saving your notes in the file, use \`~open <fileName>\``);
    //             } 
    //         } else{
    //             message.channel.send('Invalid Command Usage!')
    //         }
    //     }
    // }
})

mongooose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to database!');
}).catch((err) => {
  console.log(`Oh no! I encountered an error with the database :(\nHere is the error: ${err}`);
});

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));

client.login(process.env.TOKEN);