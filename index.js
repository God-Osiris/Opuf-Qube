if (Number(process.version.slice(1).split(".")[0]) < 16) throw new Error("Node 16.x or higher is required. Update Node on your system.");

const Discord = require("discord.js");
const { Client, Intents} = require('discord.js');
const mongooose = require('mongoose');
require('dotenv').config()

const prefix = '~';

const User = require("./database/user.js")

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

async function collectResponse(message, user, i) {
    const filter = msg => msg.author.id === message.author.id;
    const collector = message.channel.createMessageCollector({filter, max: 1});
  
    return new Promise((res, rej) => {
      collector.on("timeout", () => rej("timeout"))
      collector.on("end", async results => {
        const collectedMessage = await message.channel.messages.fetch(results.first().id)
        const messageContent = collectedMessage.content;
        user.files[i].content = messageContent;
        user.save();
        message.channel.send("File saved successfully! Use `~open <fileName>` to see the content!")
        res();
      })
    })
}

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
                    if(i == 4){
                        break;
                    }
                } if(user.files[i].name === null){
                    user.files[i].name = args[0].concat('.txt');
                    user.save();
                    message.channel.send(`Created new text file called ${args[0].concat('.txt')}! To start saving your notes in the file, use \`~edit <fileName>\``);
                } else if(user.files[4].name !== null){
                    message.channel.send("You have reached the limit of file creation! Please delete a file using `~delete <fileName>` to make a new one!")
                }
            } else{
                message.channel.send('Invalid Command Usage!')
            }
        }
    }

    if(command === 'delete'){
        const user = await User.findOne({id: message.author.id});
        if(user === null){
            message.channel.send("You need to register first using `~register`!");
        } else if(user !== null){
            if(args[0] && typeof(args[0]) === 'string'){
                let i = 0;
                while(user.files[i].name !== args[0].concat('.txt')){
                    if(i !== 4){
                        i+=1;
                    }
                    if(i === 4){
                        break;
                    }
                }
                if(user.files[i].name === args[0].concat('.txt')){
                    user.files[i].name = null;
                    user.files[i].content = null;
                    message.channel.send(`Deleted ${args[0].concat('.txt')}!`);
                    user.save();
                } else{
                    message.channel.send("Idk")
                }
            } else{
                message.channel.send('Invalid Command Usage!')
            }
        }
    }

    if(command === 'edit'){
        const user = await User.findOne({id: message.author.id});
        if(user === null){
            message.channel.send("You need to register first using `~register`!");
        } else if(user !== null){
            if(args[0] && typeof(args[0]) === 'string'){
                let i = 0;
                while(user.files[i].name !== args[0].concat('.txt') && i < 5){
                    if(i !== 4){
                        i+=1;
                    }
                    if(i == 4){
                        break;
                    }
                }
                if(user.files[i].name === args[0].concat('.txt')){
                    message.channel.send(`Opened ${args[0].concat('.txt')}! Please send your content and the bot will save it in the file!`)
                    collectResponse(message, user, i);
                } else if(user.files[i].name !== args[0].concat('.txt')){
                    message.channel.send("No such file found!");
                } else{
                    message.channel.send("Idk");
                }
            } else{
                message.channel.send("Invalid command usage!")
            }
        }
    }

    if(command === 'open'){
        const user = await User.findOne({id: message.author.id});
        
        if(user === null){
            message.channel.send("You need to register first using `~register`!");
        } else if(user !== null){
            if(args[0] && typeof(args[0]) === 'string'){
                let i = 0;
                while(user.files[i].name !== args[0].concat('.txt') && i < 5){
                    if(i !== 4){
                        i+=1;
                    }
                    if(i == 4){
                        break;
                    }
                }
                if(user.files[i].name === args[0].concat('.txt')){
                    message.channel.send(`Opened ${args[0].concat('.txt')}! Here's the content:`);
                    message.channel.send(`${user.files[i].content}`);
                } else if(user.files[i].name !== args[0].concat('.txt')){
                    message.channel.send("No such file found!");
                } else{
                    message.channel.send("Idk");
                }
            } else{
                message.channel.send("Invalid command usage!")
            }
        }
    }

    if(command === 'list'){

        const user = await User.findOne({id: message.author.id});

        if(user === null){
            message.channel.send("You need to register first using `~register`!");
        } else if(user !== null){
            const fileArray = [];
            for(let i = 0; i < 5; i++){
                fileArray.push(user.files[i].name);
            }

            message.channel.send(`\`\`\`${fileArray.join('\n')}\`\`\``);
        }
    }
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