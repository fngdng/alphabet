//env
import fs from 'fs';
import { dirname, resolve, join } from 'path';
import { fileURLToPath } from 'url';
import stripBom from 'strip-bom';
import { pathToFileURL } from 'node:url';
import child_process from 'node:child_process';
import login from "fb-chat-api";
import twofactor from "node-2fa";
import puppeteer from "puppeteer";
import readline from "readline";
import log from "npmlog";

var date = new Date();
const __dirname = dirname(fileURLToPath(import.meta.url));

//handleCommands
class handleCommands {
  constructor() {
    this.commands = new Map();
  }
  async load() {
    var files = fs.readdirSync(resolve(__dirname, "./core/branch"));
    for (var i = 0; i < files.length; i++) {
      if (files[i].endsWith(".js")) {
        var command = pathToFileURL(resolve(__dirname, "./core/branch", files[i]));
        var commandconfig = (await import(command)).configcommand();
        var commandurl = command
        var commandname = commandconfig.name;
        this.commands.set(commandname, commandconfig);
        this.commands.get(commandname).url = commandurl.href;
      }
    }
    global.commands = this.commands;
    return this.install();
  };
  async install() {
    for (var [key, value] of this.commands) {
      if (value.node_dependencies) {
        for (var i = 0; i < value.node_dependencies.length; i++) {
          if (!fs.existsSync(resolve(__dirname, `./node_modules/${value.node_dependencies[i]}`))) {
            console.log(`installing ${value.node_dependencies[i]} for ${key}...`);
            fs.mkdirSync(resolve(__dirname, `./node_modules/${value.node_dependencies[i]}`));
            fs.writeFileSync(resolve(__dirname, `./node_modules/${value.node_dependencies[i]}/package.json`), JSON.stringify({ name: value.node_dependencies[i] }, null, 2));
            child_process.execSync(`npm install ${value.node_dependencies[i]} --prefix ${resolve(__dirname, "./node_modules")}`, { stdio: "inherit" });
          }
        }
      }
    }
    return new logins().login();
  }
}

//config
class config {
  constructor() {
    this.config = {
      env: {
        mode: "USER|DEV",
        debug: false,
        savesection: false,
        reportbugtoserver: false,
      },
      bot: {
        login: {
          use_puppeteer: false,
          email: "email",
          password: "password",
          twofasecret: "2FASECRETKEY"
        },
        prefix: "!",
        permission: {
          ops: ["OPID", "OPID2"],
          allowops: {
            shutdownbychat: false,
            restartbychat: false,
            reloadbychat: false,
            reloadconfigbychat: false,
            reloadcommandbychat: false,
          },
          push_identification_code_to_server: true,
        },
        listen: {
          event: true,

        }
      },
      server: {
        url: "http://example:6969",
        api: {
          notyet: "will update soon! >_<"
        }
      }
    }
  }
  create() {
    if (!fs.existsSync(resolve(__dirname, "./config.json"))) {
      fs.writeFileSync(resolve(__dirname, "./config.json"), JSON.stringify(this.config, null, 2));
      console.log("config.json has created!");
      console.log("please edit config.json and restart the bot!");
      process.exit(100);
    } else {
      console.log("config.json has found!");
      this.load()
      return new handleCommands().load();
    }
  }
  load() {
    try {
      JSON.parse(stripBom(fs.readFileSync(join(__dirname, "./config.json"), { encoding: "utf8" })));
      global.config = JSON.parse(stripBom(fs.readFileSync(join(__dirname, "./config.json"), { encoding: "utf8" })));
    } catch (err) {
      console.error(err);
      console.error("can't read config.json, please check your config.json file!");
      process.exit(100);
    }
  }
}

new config().create();

//data
class data {
  constructor() {
    this.data = {}
  }
  create() {
    if (!fs.existsSync(resolve(__dirname, "./data.json"))) {
      fs.writeFileSync(resolve(__dirname, "./data.json"), JSON.stringify(this.data, null, 2));
      console.log("data.json has created!");
    } else {
      console.log("data.json has found!");
      this.load()
    }
  }
  load() {
    try {
      JSON.parse(stripBom(fs.readFileSync(join(__dirname, "./data.json"), { encoding: "utf8" })));
      global.data = JSON.parse(stripBom(fs.readFileSync(join(__dirname, "./data.json"), { encoding: "utf8" })));
    } catch (err) {
      console.error(err);
      console.error("can't read data.json, please check your data.json file!");
      process.exit(100);
    }
  }
}

new data().create();

//2fa
function twofa() {
  if (global.config.bot.login.twofasecret != "2FASECRETKEY" || global.config.bot.login.twofasecret != "" || global.config.bot.login.twofasecret != null) {
    var twofagen = JSON.parse(JSON.stringify(twofactor.generateToken(global.config.bot.login.twofasecret.replace(" ", "")))).token;
    return twofagen;
  } else {
    return null;
  };
}

class logins {
  constructor() {

  }
  async login() {
    if (!fs.existsSync(resolve(__dirname, "./login_folder"))) {
      fs.mkdirSync(resolve(__dirname, "./login_folder"));
      console.log("login_folder has created!");
      console.log("please put your credentials.json in login_folder and restart the bot!");
      process.exit(100);
    } else {
      return this.start_login();
    }
  }
  async start_login() {
    if (!fs.existsSync(resolve(__dirname, "./login_folder/credentials.json"))) {
      //use puppeteer to login
      //if this system is not windows, you cannot use this method to login
      console.log("We see that your system is windows, but we won't automatically login for you by puppeteer, because it's not finished yet! You should use login with credentials.json method to login!")
      console.log("The default config set login method is credentials.json, so we will continue to login with credentials.json method!")
      console.log("If you want to use puppeteer to login, please set login method to puppeteer in config.json!")
      console.log("Credentials.json can be cookie/appstate/fbstate, is the same but different name, you can use any one of them to login!")
      console.log("Now we will continue to login with credentials.json method!")
      if (global.config.bot.login.use_puppeteer == true) {
        if (process.platform == "win32") {

          var browser = await puppeteer.launch({ headless: false });
          var page = await browser.newPage();
          await page.goto("https://www.facebook.com/login");
          await page.type("input[name='email']", global.config.bot.login.email);
          await page.type("input[name='pass']", global.config.bot.login.password);
          await page.click("button[name='login']");
          await page.waitForNavigation();
          var url;
          url = page.url();
          if (url == "https://www.facebook.com/") {
            console.log("login success!");
          } else if (url == "https://www.facebook.com/checkpoint/?next") {
            await page.waitForSelector("input[name='approvals_code']");
            await page.type("input[name='approvals_code']", twofa());
            await page.click("button[name='submit[Continue]']");
            await page.waitForNavigation();
            url = page.url();
            if (url == "https://www.facebook.com/checkpoint/?next") {
              await page.click("button[name='submit[Continue]']");
              await page.waitForNavigation();
              url = page.url();
              if (url == "https://www.facebook.com/") {
                console.log("login success!");
              } else {
                console.log("login failed!");
              }
            } else {
              console.log("login failed!");
            }
          } else {
            console.log("login failed!");
          }
          //await browser.close();
        }
      } else {
        //this login_file can be anyfile end with .json, not only credentials.json
        var login_files = fs.readdirSync(resolve(__dirname, "./login_folder"));
        if (login_files.length == 0) {
          console.log("We see that you don't have any login file in login_folder, please put your login file in login_folder and restart the bot!")
          process.exit(100);
        } else {
          var login_file = login_files[0];
          if (login_file.endsWith(".json")) {
            var json = JSON.parse(fs.readFileSync(resolve(__dirname, "./login_folder/" + login_file), { encoding: "utf8" }));
            if (json.url && json.cookies) {
              console.log("Found J2TEAM Login File...")
              let appstate = [];
              for (const i of json.cookies) {
                appstate.push({
                  key: i.name,
                  value: i.value,
                  expires: i.expirationDate || "",
                  domain: i.domain.replace(".", ""),
                  path: i.path
                })
              }
              log.emitLog = () => { };
              return login({ appState: JSON.parse(JSON.stringify(appstate)) }, (err, api) => {
                if (err) {
                  console.log(JSON.stringify(err))
                  console.log('Not logged in');
                  console.log("Please recheck your login file and restart the bot!")
                  return process.exit()
                }
                console.log('[FACEBOOK] Logged in with J2TEAM Login File');
                return new bot().start(api)
              })
            } else {
              console.log("Found C3C Login File...")
              log.emitLog = () => { };
              return login({ appState: JSON.parse(JSON.stringify(json)) }, (err, api) => {
                if (err) {
                  console.log(JSON.stringify(err))
                  console.log('Not logged in');
                  console.log("Please recheck your login file and restart the bot!")
                  return process.exit()
                }
                console.log('[FACEBOOK] Logged in with C3C Login File');
                return new bot().start(api)
              })
            }
          } else if (login_file.endsWith(".txt")) {

          } else {
            console.log("We see that you have a login file in login_folder, but we can't read it, please check your login file!")
            process.exit(100);
          }
        }
      }
    }
  }
}

class bot {
  constructor() {
  }
  async start(api) {
    api.setOptions({
      selfListen: false,
      logLevel: "silent",
      updatePresence: false,
      listenEvents: true,
      forceLogin: true,
      userAgent: "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Mobile Safari/537.36"
    });
    api.listenMqtt((err, event) => {
      if (err) return console.error(err);
      switch (event.type) {
        case "log:subscribe":
        case "message_reply":
        case "message":
          if (event.attachments.length != 0) {
            console.log(JSON.stringify(event, null, 4));
          }
          else {
            console.log(`[${event.senderID} to ${event.threadID}] : ${event.body}`);
          }
          break;
        case "event":
          break;
        default:
      }
      if (event.body) {
        if (event.body.slice(0, global.config.bot.prefix.length) == global.config.bot.prefix) {
          var args = event.body.slice(global.config.bot.prefix.length).trim().split(/ +/);
          this.request_command(api, event, args);
        }
      }
    })
  }
  async request_command(api, event, args) {
    if (global.commands.get(args[0]) != undefined) {
      (await import(global.commands.get(args[0]).url)).command(api, event, args);
    } else {
      api.sendMessage("Command not found!", event.threadID);
    }
  }
}