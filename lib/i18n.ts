import { cookies } from "next/headers";

export const LOCALES = ["ru", "tg", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_LABEL: Record<Locale, string> = { ru: "Рус", tg: "Тоҷ", en: "Eng" };

const dict = {

  "login.title": { ru: "Вход", tg: "Ворид шудан", en: "Sign in" },
  "login.phone": { ru: "Телефон", tg: "Телефон", en: "Phone" },
  "login.pin": { ru: "PIN-код", tg: "Рамзи PIN", en: "PIN" },
  "login.submit": { ru: "Войти", tg: "Даромадан", en: "Sign in" },
  "login.error": { ru: "Телефон или PIN не подходят", tg: "Телефон ё PIN нодуруст аст", en: "Phone or PIN is wrong" },
  "login.demo": { ru: "Демо-доступы", tg: "Дастрасии намоишӣ", en: "Demo accounts" },
  "login.register": { ru: "Работаете с нами впервые? Оставьте заявку на доступ", tg: "Бори аввал ҳамкорӣ мекунед? Дархост барои дастрасӣ гузоред", en: "First time working with us? Request access" },

  "reg.title": { ru: "Заявка на доступ", tg: "Дархост барои дастрасӣ", en: "Access request" },
  "reg.lead": { ru: "Заполните данные организации. Диспетчер проверит их и откроет доступ — обычно в тот же день.", tg: "Маълумоти ташкилотро пур кунед. Диспетчер онро месанҷад ва дастрасӣ мекушояд — одатан ҳамон рӯз.", en: "Fill in your company details. The dispatcher checks them and opens access, usually the same day." },
  "reg.company": { ru: "Название фирмы или ФИО", tg: "Номи фирма ё ННН", en: "Company name or full name" },
  "reg.inn": { ru: "ИНН", tg: "РМА", en: "Tax ID" },
  "reg.contact": { ru: "Контактное лицо", tg: "Шахси тамос", en: "Contact person" },
  "reg.phone": { ru: "Телефон для входа", tg: "Телефон барои воридшавӣ", en: "Phone to sign in with" },
  "reg.pin": { ru: "Придумайте PIN из 4 цифр", tg: "PIN-и 4-рақама интихоб кунед", en: "Choose a 4-digit PIN" },
  "reg.submit": { ru: "Отправить заявку", tg: "Дархостро фиристодан", en: "Send request" },
  "reg.done": { ru: "Заявка отправлена", tg: "Дархост фиристода шуд", en: "Request sent" },
  "reg.doneBody": { ru: "Диспетчер проверит данные и откроет доступ. Войдите по своему телефону и PIN — статус будет виден сразу.", tg: "Диспетчер маълумотро месанҷад ва дастрасӣ мекушояд. Бо телефон ва PIN-и худ ворид шавед — ҳолат дарҳол намоён мешавад.", en: "The dispatcher will check your details and open access. Sign in with your phone and PIN — you will see the status right away." },
  "reg.taken": { ru: "Этот телефон уже зарегистрирован. Войдите или позвоните диспетчеру.", tg: "Ин телефон аллакай сабт шудааст. Ворид шавед ё ба диспетчер занг занед.", en: "This phone is already registered. Sign in or call the dispatcher." },

  "dealer.status.pending": { ru: "На проверке", tg: "Дар санҷиш", en: "Pending" },
  "dealer.status.active": { ru: "Работает", tg: "Фаъол", en: "Active" },
  "dealer.status.blocked": { ru: "Заблокирован", tg: "Маҳдудшуда", en: "Blocked" },
  "dealer.approve": { ru: "Открыть доступ", tg: "Дастрасӣ кушодан", en: "Open access" },
  "dealer.block": { ru: "Заблокировать", tg: "Маҳдуд кардан", en: "Block" },
  "dealer.unblock": { ru: "Разблокировать", tg: "Кушодан", en: "Unblock" },
  "dealer.add": { ru: "Добавить дилера", tg: "Дилер илова кардан", en: "Add dealer" },
  "dealer.added": { ru: "Дилер добавлен. Продиктуйте ему телефон и PIN:", tg: "Дилер илова шуд. Телефон ва PIN-ро ба ӯ гӯед:", en: "Dealer added. Read out the phone and PIN to them:" },
  "dealer.pendingNotice": { ru: "Доступ ещё не открыт. Диспетчер проверяет ваши данные — заявку можно будет создать сразу после этого.", tg: "Дастрасӣ ҳанӯз кушода нашудааст. Диспетчер маълумоти шуморо месанҷад — пас аз он дархост сохта метавонед.", en: "Access is not open yet. The dispatcher is checking your details; you can create orders right after that." },
  "dealer.blockedNotice": { ru: "Доступ закрыт. Свяжитесь с диспетчером.", tg: "Дастрасӣ баста аст. Бо диспетчер тамос гиред.", en: "Access is closed. Contact the dispatcher." },
  "dealer.empty": { ru: "Дилеров пока нет", tg: "Ҳоло дилер нест", en: "No dealers yet" },
  "dealer.waiting": { ru: "Ждут проверки", tg: "Интизори санҷиш", en: "Waiting for review" },
  "dealer.working": { ru: "Работают", tg: "Фаъол", en: "Working" },
  "logout": { ru: "Выйти", tg: "Баромадан", en: "Sign out" },

  "nav.orders": { ru: "Заявки", tg: "Дархостҳо", en: "Orders" },
  "nav.new": { ru: "Новая заявка", tg: "Дархости нав", en: "New order" },
  "nav.gate": { ru: "КПП", tg: "Назоратгоҳ", en: "Gate" },
  "nav.dealers": { ru: "Дилеры", tg: "Дилерҳо", en: "Dealers" },
  "nav.board": { ru: "Доска", tg: "Тахта", en: "Board" },
  "nav.reports": { ru: "Отчёты", tg: "Ҳисоботҳо", en: "Reports" },

  "board.title": { ru: "Машины сегодня", tg: "Мошинҳои имрӯз", en: "Trucks today" },
  "board.empty": { ru: "Пусто", tg: "Холӣ", en: "Empty" },
  "board.dragHint": { ru: "Карточку можно перетащить в соседнюю колонку — это то же действие, что кнопка", tg: "Кортро ба сутуни ҳамсоя кашидан мумкин аст — ин ҳамон амалест, ки тугма мекунад", en: "Drag a card to the next column — it does the same thing as the button" },
  "rep.title": { ru: "Отчёты", tg: "Ҳисоботҳо", en: "Reports" },
  "rep.period": { ru: "Период", tg: "Давра", en: "Period" },
  "rep.today": { ru: "Сегодня", tg: "Имрӯз", en: "Today" },
  "rep.d7": { ru: "7 дней", tg: "7 рӯз", en: "7 days" },
  "rep.d30": { ru: "30 дней", tg: "30 рӯз", en: "30 days" },
  "rep.d90": { ru: "90 дней", tg: "90 рӯз", en: "90 days" },
  "rep.shipped": { ru: "Вывезено", tg: "Бароварда шуд", en: "Shipped out" },
  "rep.arrived": { ru: "Машин заехало", tg: "Мошин ворид шуд", en: "Trucks in" },
  "rep.departed": { ru: "Машин выехало", tg: "Мошин баромад", en: "Trucks out" },
  "rep.avg": { ru: "Средняя загрузка", tg: "Бори миёна", en: "Average load" },
  "rep.ordersMade": { ru: "Заявок принято", tg: "Дархост қабул шуд", en: "Orders taken" },
  "rep.ordered": { ru: "Заказано по заявкам", tg: "Аз рӯи дархостҳо фармоиш шуд", en: "Ordered" },
  "rep.plan": { ru: "план", tg: "нақша", en: "plan" },
  "rep.byDay": { ru: "Отгрузка по дням", tg: "Боркунӣ аз рӯи рӯзҳо", en: "Shipped by day" },
  "rep.byProduct": { ru: "По товарам", tg: "Аз рӯи молҳо", en: "By product" },
  "rep.byDealer": { ru: "По дилерам", tg: "Аз рӯи дилерҳо", en: "By dealer" },
  "rep.empty": { ru: "За этот период отгрузок не было", tg: "Дар ин давра боркунӣ набуд", en: "No shipments in this period" },
  "rep.export": { ru: "Выгрузить в CSV", tg: "Ба CSV содир кардан", en: "Export to CSV" },
  "rep.trucksShort": { ru: "машин", tg: "мошин", en: "trucks" },

  "board.needWeight": { ru: "Сначала весовая", tg: "Аввал тарозу", en: "Weighbridge first" },
  "nav.scale": { ru: "Весы", tg: "Тарозу", en: "Weighbridge" },

  "role.dealer": { ru: "Дилер", tg: "Дилер", en: "Dealer" },
  "role.dispatcher": { ru: "Диспетчер", tg: "Диспетчер", en: "Dispatcher" },
  "role.gate": { ru: "Охрана", tg: "Посбон", en: "Gate guard" },
  "role.scale": { ru: "Весовщик", tg: "Тарозудор", en: "Weigher" },
  "role.admin": { ru: "Администратор", tg: "Маъмур", en: "Admin" },

  "order.one": { ru: "Заявка", tg: "Дархост", en: "Order" },
  "order.number": { ru: "Номер", tg: "Рақам", en: "Number" },
  "order.dealer": { ru: "От кого", tg: "Аз кӣ", en: "From" },
  "order.dealerPick": { ru: "Выберите дилера", tg: "Дилерро интихоб кунед", en: "Choose a dealer" },
  "order.product": { ru: "Товар", tg: "Мол", en: "Product" },
  "order.tonsHint": { ru: "Вес по весовой, в тоннах", tg: "Вазн аз рӯи тарозу, бо тонна", en: "Weighbridge weight, in tons" },
  "order.tons": { ru: "Тонн", tg: "Тонна", en: "Tons" },
  "order.destination": { ru: "Назначение", tg: "Таъинот", en: "Destination" },
  "order.destination.hint": { ru: "Куда повезут товар: объект, город, адрес", tg: "Мол ба куҷо бурда мешавад: объект, шаҳр, суроға", en: "Where the goods go: site, city, address" },
  "order.note": { ru: "Примечание", tg: "Эзоҳ", en: "Note" },
  "order.created": { ru: "Создана", tg: "Сохта шуд", en: "Created" },
  "order.channel.phone": { ru: "Принята по телефону", tg: "Бо телефон қабул шуд", en: "Taken by phone" },
  "order.loaded": { ru: "Отгружено", tg: "Бор карда шуд", en: "Shipped" },
  "order.of": { ru: "из", tg: "аз", en: "of" },
  "order.remaining": { ru: "Остаток", tg: "Боқимонда", en: "Remaining" },
  "order.empty": { ru: "Заявок пока нет", tg: "Ҳоло дархост нест", en: "No orders yet" },
  "order.create": { ru: "Создать заявку", tg: "Дархост сохтан", en: "Create order" },
  "order.approve": { ru: "Подтвердить", tg: "Тасдиқ кардан", en: "Approve" },
  "order.reject": { ru: "Отклонить", tg: "Рад кардан", en: "Reject" },
  "order.close": { ru: "Закрыть заявку", tg: "Дархостро пӯшидан", en: "Close order" },

  "status.new": { ru: "Новая", tg: "Нав", en: "New" },
  "status.approved": { ru: "Подтверждена", tg: "Тасдиқшуда", en: "Approved" },
  "status.rejected": { ru: "Отклонена", tg: "Радшуда", en: "Rejected" },
  "status.closed": { ru: "Закрыта", tg: "Пӯшида", en: "Closed" },
  "status.cancelled": { ru: "Отменена", tg: "Бекоршуда", en: "Cancelled" },

  "trip.many": { ru: "Машины", tg: "Мошинҳо", en: "Trucks" },
  "trip.add": { ru: "Добавить машину", tg: "Мошин илова кардан", en: "Add truck" },
  "trip.plate": { ru: "Госномер", tg: "Рақами давлатӣ", en: "Plate" },
  "trip.trailer": { ru: "Прицеп", tg: "Тиркаш", en: "Trailer" },
  "trip.driver": { ru: "ФИО водителя", tg: "ННН ронанда", en: "Driver name" },
  "trip.driverPhone": { ru: "Телефон водителя", tg: "Телефони ронанда", en: "Driver phone" },
  "trip.empty": { ru: "Машины ещё не приехали", tg: "Мошинҳо ҳанӯз наомадаанд", en: "No trucks yet" },
  "trip.arrived": { ru: "Приехала", tg: "Омад", en: "Arrived" },
  "trip.left": { ru: "Уехала", tg: "Рафт", en: "Left" },
  "trip.status.expected": { ru: "Ожидается", tg: "Интизор", en: "Expected" },
  "trip.status.on_site": { ru: "На территории", tg: "Дар ҳудуд", en: "On site" },
  "trip.status.loaded": { ru: "Загружена", tg: "Бор шуд", en: "Loaded" },
  "trip.status.departed": { ru: "Выехала", tg: "Баромад", en: "Departed" },
  "trip.status.cancelled": { ru: "Отменена", tg: "Бекор шуд", en: "Cancelled" },

  "gate.title": { ru: "Контроль въезда и выезда", tg: "Назорати вуруд ва баромад", en: "Gate control" },
  "gate.search": { ru: "Госномер или номер заявки", tg: "Рақами давлатӣ ё рақами дархост", en: "Plate or order number" },
  "gate.in": { ru: "Впустить", tg: "Дохил кардан", en: "Let in" },
  "gate.out": { ru: "Выпустить", tg: "Баровардан", en: "Let out" },
  "gate.onSite": { ru: "Сейчас на территории", tg: "Ҳоло дар ҳудуд", en: "On site now" },
  "gate.expected": { ru: "Ждём сегодня", tg: "Имрӯз интизорем", en: "Expected today" },
  "gate.waitScale": { ru: "Ждём весовую — без веса выпускать нельзя", tg: "Интизори тарозу — бе вазн баровардан мумкин нест", en: "Waiting for the weighbridge — no exit without a weight" },
  "gate.nothing": { ru: "Ничего не нашли. Проверьте номер.", tg: "Чизе ёфт нашуд. Рақамро санҷед.", en: "Nothing found. Check the number." },

  "scale.gross": { ru: "Вес с грузом, кг", tg: "Вазн бо бор, кг", en: "Weight loaded, kg" },
  "scale.tare": { ru: "Вес пустой машины, кг", tg: "Вазни мошини холӣ, кг", en: "Empty truck weight, kg" },
  "scale.net": { ru: "Груз", tg: "Бор", en: "Load" },
  "scale.save": { ru: "Записать вес", tg: "Вазнро сабт кардан", en: "Save weight" },
  "scale.title": { ru: "Взвешивание", tg: "Баркашидан", en: "Weighing" },

  "waybill": { ru: "Накладная", tg: "Борхат", en: "Waybill" },
  "waybill.print": { ru: "Печать накладной", tg: "Чопи борхат", en: "Print waybill" },

  "sync.pending": { ru: "Ждёт отправки в 1С", tg: "Интизори ирсол ба 1С", en: "Queued for 1C" },
  "sync.sent": { ru: "Передано в 1С", tg: "Ба 1С фиристода шуд", en: "Sent to 1C" },
  "sync.failed": { ru: "1С не ответила, повторим", tg: "1С ҷавоб надод, такрор мекунем", en: "1C did not answer, will retry" },

  "error.title": { ru: "Что-то сломалось", tg: "Чизе вайрон шуд", en: "Something broke" },
  "error.body": { ru: "Данные не загрузились. Повторите, а если повторится — сообщите диспетчеру.", tg: "Маълумот бор нашуд. Такрор кунед, агар боз такрор шавад — ба диспетчер хабар диҳед.", en: "The data did not load. Try again, and tell the dispatcher if it repeats." },
  "error.retry": { ru: "Повторить", tg: "Такрор", en: "Try again" },
  "error.home": { ru: "На главную", tg: "Ба саҳифаи асосӣ", en: "Go home" },
  "notfound.title": { ru: "Страница не найдена", tg: "Саҳифа ёфт нашуд", en: "Page not found" },
  "notfound.body": { ru: "Заявку удалили или ссылка устарела.", tg: "Дархост нест карда шуд ё истинод кӯҳна аст.", en: "The order was deleted or the link is out of date." },

  "t": { ru: "т", tg: "т", en: "t" },
  "save": { ru: "Сохранить", tg: "Нигоҳ доштан", en: "Save" },
  "cancel": { ru: "Отмена", tg: "Бекор", en: "Cancel" },
  "back": { ru: "Назад", tg: "Бозгашт", en: "Back" },
} satisfies Record<string, Record<Locale, string>>;

export type Key = keyof typeof dict;

export async function getLocale(): Promise<Locale> {
  const c = (await cookies()).get("locale")?.value as Locale | undefined;
  return c && LOCALES.includes(c) ? c : "ru";
}

export function translator(locale: Locale) {
  return (key: Key) => dict[key][locale];
}

export async function getT() {
  return translator(await getLocale());
}
