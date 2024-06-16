const {createBot,createProvider,createFlow,addKeyword,EVENTS,} = require("@bot-whatsapp/bot");
require ("dotenv").config



const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/mock");
//const { delay } = require("@whiskeysockets/baileys");
const path = require("path");
const fs = require("fs");
const chat = require("./chatGPT");

const menuPath = path.join(__dirname, "mensajes", "menu.txt");
const menu = fs.readFileSync(menuPath, "utf-8");

const PathConsultar = path.join(__dirname, "mensajes", "promptConsultas.txt");
const promptConsultas = fs.readFileSync(PathConsultar, "utf-8");

const flowPrincipal = addKeyword(["hola", "ole", "alo"])
  .addAnswer("En que puedo ayudarte?");
  //.addCaptureIntent(
    //"menu_intent",
    //async (ctx) => {
      //const message = ctx.body.toLowerCase();
      //return message === "menu" || message === "menú";
    //},
    //async (ctx) => {
      //return await gotoFlow(menuFlow);
    //}
  //);

const flowMenuRest = addKeyword(EVENTS.ACTION).addAnswer(
  "Este es el Flow menu",
  {
    media: "https://www.instagram.com/bowerswilkins?igsh=eXUxazF0MDc4a2xn",
  }
);

const flowCotizar = addKeyword(EVENTS.ACTION).addAnswer(
  "Este es el Flow Cotizar"
);

const flowConsulta = addKeyword(EVENTS.ACTION)
  .addAnswer("Este es el Flow Consulta")
  .addAnswer("Hace tu consulta", { capture: true }, async (ctx, ctxFn) => {
    const prompt = promptConsultas
    const consulta = ctx.body;
    const answer = await chat(prompt, consulta);
    console.log[answer.content];
  });
const menuFlow = addKeyword("Menu").addAnswer(
  menu,
  { capture: true },
  async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
    if (!["1", "2", "3", "0"].includes(ctx.body)) {
      return fallBack(
        "Respuesta no válida, por favor selecciona una de las opciones."
      );
    }
    switch (ctx.body) {
      case "1":
        return gotoFlow("Esta es la opcion 1");
      case "2":
        return gotoFlow("Esta es la opcion 2");
      case "3":
        return gotoFlow("Esta es la opcion 3");
      case "0":
        return await flowDynamic(
          "Saliendo... Puedes volver a acceder a este menú escribiendo 'Menu'"
        );
    }
  }
);
const main = async () => {
  const adapterDB = new MockAdapter();
  const adapterFlow = createFlow([flowPrincipal,menuFlow,flowMenuRest,flowCotizar,flowConsulta,]);
  const adapterProvider = createProvider(BaileysProvider);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  QRPortalWeb();
};

main();
