export default {
  async fetch(request, env) {
    if (request.method === 'POST') {
      const update = await request.json();
      await handleUpdate(update);
    }
    return new Response('OK');
  }
};

const BOT_TOKEN = "9148091243:AAHx8LZJ1mc9OA9qocwM5rBG3gcLXr8Qfcc";
const CHANNEL = "@logovo12";
const CHANNEL_URL = "https://t.me/logovo12";
const API = `https://api.telegram.org/bot${BOT_TOKEN}/`;

async function sendMessage(chatId, text, keyboard = null) {
  const body = { chat_id: chatId, text: text, parse_mode: 'HTML' };
  if (keyboard) body.reply_markup = { inline_keyboard: keyboard };
  await fetch(API + 'sendMessage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

async function editMessage(chatId, messageId, text, keyboard = null) {
  const body = { chat_id: chatId, message_id: messageId, text: text, parse_mode: 'HTML' };
  if (keyboard) body.reply_markup = { inline_keyboard: keyboard };
  await fetch(API + 'editMessageText', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

async function answerCallback(id, text) {
  await fetch(API + 'answerCallbackQuery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ callback_query_id: id, text: text }) });
}

const mainMenu = [[{ text: "Подключиться", callback_data: "connect" }], [{ text: "Подключить прокси", callback_data: "proxy" }]];
const connectMenu = [
  [{ text: "Чёрный список", callback_data: "sub:black" }],
  [{ text: "Белый список", callback_data: "sub:white" }],
  [{ text: "Для Incy", callback_data: "sub:incy" }],
  [{ text: "Назад", callback_data: "back_main" }]
];
const proxyMenu = [
  [{ text: "США", callback_data: "px:us" }],
  [{ text: "Германия", callback_data: "px:de" }],
  [{ text: "Франция", callback_data: "px:fr" }],
  [{ text: "Украина", callback_data: "px:ua" }],
  [{ text: "Назад", callback_data: "back_main" }]
];

const SUB_BLACK = "https://gist.githubusercontent.com/horko236/cb207302b58fdf64e06e79b7ac572f09/raw/pulod.txt?v=2";
const SUB_WHITE = "https://gist.githubusercontent.com/horko236/4766da8a03aee9044f3dd92b04290cc0/raw/279b7a2d4a8d266a68bc89cb2cfe6405ec111afa/pulod.txt";
const SUB_INCY  = "https://gist.githubusercontent.com/horko236/399bbbf8a9dea85300986fc22cac9d3e/raw/pulod.txt?v=2";

const PROXIES = {
  us: "https://t.me/proxy?server=web.gktmfrv.sbs&port=443&secret=ee8d2347ee3bfd6ba6299947017bf28dc16364656b2e7275",
  de: "https://t.me/proxy?server=static.antenna-mzt.live&port=443&secret=ee5a42e3752e724f2fdae9c117e7f076fe73746f72652e737465616d706f77657265642e636f6d",
  fr: "https://t.me/proxy?server=surf.suslik-cloud.com&port=443&secret=eed7f61466f824eafe116a533553e01bca737572662e7375736c696b2d636c6f75642e636f6d",
  ua: "https://t.me/proxy?server=posude79.fernlark.xyz&port=443&secret=ee37a60897c9ca648e94350eb8919ea47f706f7375646537392e6665726e6c61726b2e78797a"
};

async function handleUpdate(update) {
  if (update.message && update.message.text === '/start') {
    const text = "<b>Добро пожаловать в Chad VPN!</b>\n\nМы рады видеть тебя в нашем VPN.\n\nЗдесь ты найдёшь подписки для <b>Happ</b> и <b>Incy</b>.\nВыбирай нужный вариант и подключайся — VPN безлимитный и бесконечный.\n\nНажми кнопку ниже:";
    await sendMessage(update.message.chat.id, text, mainMenu);
  } 
  else if (update.callback_query) {
    const cb = update.callback_query;
    const chatId = cb.message.chat.id;
    const msgId = cb.message.message_id;
    const data = cb.data;

    if (data === "back_main") {
      await editMessage(chatId, msgId, "<b>Главное меню Chad VPN</b>\n\nВыбирай действие:", mainMenu);
      await answerCallback(cb.id, "");
    }
    else if (data === "connect") {
      await editMessage(chatId, msgId, "<b>Выбери тип подписки:</b>\n\nЧёрный список — базовый набор\nБелый список — расширенный\nДля Incy — отдельная подписка", connectMenu);
      await answerCallback(cb.id, "");
    }
    else if (data === "proxy") {
      await editMessage(chatId, msgId, "<b>Выбери страну прокси:</b>\n\nПосле выбора бот пришлёт кликабельную ссылку — нажми на неё, и Telegram предложит подключить прокси.", proxyMenu);
      await answerCallback(cb.id, "");
    }
    else if (data.startsWith("px:")) {
      const key = data.split(":")[1];
      const link = PROXIES[key];
      await sendMessage(chatId, `Прокси готов.\n\nНажми на ссылку, чтобы подключить:\n${link}`, null);
      await answerCallback(cb.id, "Ссылка отправлена");
    }
    else if (data.startsWith("sub:")) {
      const kind = data.split(":")[1];
      const member = await fetch(`${API}getChatMember?chat_id=${CHANNEL}&user_id=${cb.from.id}`).then(r => r.json());
      const isSub = member.ok && ['member', 'administrator', 'creator'].includes(member.result.status);

      if (!isSub) {
        const kb = [[{ text: "Подписаться", url: CHANNEL_URL }], [{ text: "Я подписался", callback_data: `check_sub:${kind}` }]];
        await editMessage(chatId, msgId, `<b>Доступ только для подписчиков.</b>\n\nЧтобы получить ссылку, подпишись на наш канал ${CHANNEL_URL}\n\nПосле подписки нажми «Я подписался».`, kb);
        await answerCallback(cb.id, "");
      } else {
        await giveSub(chatId, msgId, kind);
        await answerCallback(cb.id, "");
      }
    }
    else if (data.startsWith("check_sub:")) {
      const kind = data.split(":")[1];
      const member = await fetch(`${API}getChatMember?chat_id=${CHANNEL}&user_id=${cb.from.id}`).then(r => r.json());
      const isSub = member.ok && ['member', 'administrator', 'creator'].includes(member.result.status);
      if (!isSub) {
        await answerCallback(cb.id, "Ты ещё не подписался");
      } else {
        await answerCallback(cb.id, "Подписка подтверждена");
        await giveSub(chatId, msgId, kind);
      }
    }
  }
}

async function giveSub(chatId, msgId, kind) {
  let title, url;
  if (kind === "black") { title = "Чёрный список"; url = SUB_BLACK; }
  else if (kind === "white") { title = "Белый список"; url = SUB_WHITE; }
  else { title = "Для Incy"; url = SUB_INCY; }

  const text = `${title} — готово.\n\nТвоя ссылка подписки:\n<code>${url}</code>\n\n<b>Как подключить:</b>\nHapp — открой приложение, нажми «+», выбери «Импорт из буфера или по ссылке», вставь ссылку\nIncy — открой, выбери «Добавить подписку», вставь ссылку\n\nПодписка безлимитная и бесконечная.`;
  await editMessage(chatId, msgId, text, null);
}