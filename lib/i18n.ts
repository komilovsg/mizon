import { cookies } from "next/headers";

export const LOCALES = ["ru", "tg", "en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_LABEL: Record<Locale, string> = { ru: "Рус", tg: "Тоҷ", en: "Eng", zh: "中文" };

const dict = {

  "lp.hero.title": { ru: "Заявка, машина и накладная — в одном месте", tg: "Дархост, мошин ва борхат — дар як ҷо", en: "Order, truck and waybill in one place", zh: "订单、车辆、随货单，集中在一处" },
  "lp.hero.lead": { ru: "Заявку заполняют в один экран: товар, тонны, куда везти, водитель и машина. Охрана на КПП видит, кого ждать. Весовая записывает вес. На выезде рождается накладная и уходит в 1С.", tg: "Дархост дар як экран пур мешавад: мол, тонна, ҷои боркунӣ, ронанда ва мошин. Посбон дар назоратгоҳ мебинад, киро интизор аст. Тарозу вазнро сабт мекунад. Ҳангоми баромад борхат сохта шуда ба 1С меравад.", en: "An order is filled in on one screen: product, tons, destination, driver and truck. The gate sees who is expected. The weighbridge records the weight. On exit a waybill is created and sent to 1C.", zh: "订单一屏填完：货物、吨数、送达地点、司机和车辆。门岗知道该等哪辆车。地磅记录重量。车辆出厂时生成随货单并传入 1C。" },
  "lp.hero.cta": { ru: "Создать заявку", tg: "Дархост сохтан", en: "Create an order", zh: "创建订单" },
  "lp.hero.login": { ru: "Все заявки", tg: "Ҳамаи дархостҳо", en: "All orders", zh: "全部订单" },
  "lp.hero.note": { ru: "Программа работает внутри завода. Входить никуда не нужно — нажмите кнопку и заполните заявку.", tg: "Барнома дар дохили завод кор мекунад. Ворид шудан лозим нест — тугмаро зер кунед ва дархостро пур кунед.", en: "The app runs inside the plant. No sign-in — press the button and fill the order.", zh: "程序在厂内运行，无需登录——点按钮填写订单即可。" },

  "lp.before.title": { ru: "Как это происходит сейчас", tg: "Ҳоло чӣ тавр мегузарад", en: "How it works today", zh: "现在是怎么做的" },
  "lp.before.1": { ru: "Дилер звонит и говорит: «нужно 30 тонн»", tg: "Дилер занг зада мегӯяд: «30 тонна лозим аст»", en: "A dealer calls: “we need 30 tons”", zh: "经销商打电话说：需要 30 吨" },
  "lp.before.2": { ru: "Менеджер записывает на бумагу", tg: "Менеҷер ба коғаз менависад", en: "The manager writes it on paper", zh: "业务员记在纸上" },
  "lp.before.3": { ru: "Какая машина приедет и кто за рулём — неизвестно до самых ворот", tg: "Кадом мошин меояд ва кӣ ронанда аст — то дарвоза маълум нест", en: "Which truck comes and who drives is unknown until the gate", zh: "来的是哪辆车、谁开车，到了门口才知道" },
  "lp.before.4": { ru: "Накладную пишут от руки — это единственное доказательство", tg: "Борхатро бо даст менависанд — ин ягона далел аст", en: "The waybill is handwritten — the only proof there is", zh: "随货单手写填写，这是唯一的凭证" },
  "lp.before.5": { ru: "Папки с бумагами, потом ручной ввод в 1С", tg: "Ҷузвадонҳои коғаз, баъд ворид кардани дастӣ ба 1С", en: "Folders of paper, then manual entry into 1C", zh: "一摞纸质单据，之后再手工录入 1C" },

  "lp.after.title": { ru: "Как это работает здесь", tg: "Дар ин ҷо чӣ тавр кор мекунад", en: "How it works here", zh: "这里是怎么做的" },
  "lp.after.1": { ru: "Заявку заполняют на месте: товар, тонны, куда везти, водитель и машина", tg: "Дархост дар ҷо пур мешавад: мол, тонна, ҷои боркунӣ, ронанда ва мошин", en: "The order is filled in on the spot: product, tons, destination, driver and truck", zh: "当场填写订单：货物、吨数、送达地点、司机和车辆" },
  "lp.after.2": { ru: "Охране остаётся сверить номер с металлом и нажать «Впустить»", tg: "Ба посбон танҳо муқоисаи рақам ва зеркунии «Дохил кардан» мемонад", en: "The guard just matches the plate with the truck and taps “Let in”", zh: "门岗只需核对车牌并点「放行入场」" },
  "lp.after.3": { ru: "Весовая пишет вес, нетто считается само", tg: "Тарозу вазнро менависад, нетто худаш ҳисоб мешавад", en: "The weighbridge records weight, net is calculated", zh: "地磅记录重量，净重自动算出" },
  "lp.after.4": { ru: "Без взвешивания выпустить нельзя — это запрещает программа", tg: "Бе баркашидан баровардан мумкин нест — барнома иҷозат намедиҳад", en: "No exit without weighing — the app forbids it", zh: "未过磅不得放行，这是程序强制的" },
  "lp.after.5": { ru: "На выезде накладная уходит в 1С сама", tg: "Ҳангоми баромад борхат худаш ба 1С меравад", en: "On exit the waybill goes to 1C by itself", zh: "出厂时随货单自动传入 1C" },

  "lp.roles.title": { ru: "Кто чем пользуется", tg: "Кӣ бо чӣ кор мекунад", en: "Who uses what", zh: "谁用什么" },
  "lp.roles.lead": { ru: "Разделы открыты всем — каждый работает со своим экраном.", tg: "Бахшҳо барои ҳама кушодаанд — ҳар кас бо экрани худ кор мекунад.", en: "All sections are open — each person works on their own screen.", zh: "各板块对所有人开放，各自使用自己的界面。" },
  "lp.roles.job": { ru: "Ваша работа", tg: "Кори шумо", en: "Your job", zh: "你的工作" },
  "lp.roles.look": { ru: "Посмотрите", tg: "Бубинед", en: "Try this", zh: "请试试" },
  "lp.roles.enter": { ru: "Открыть", tg: "Кушодан", en: "Open", zh: "打开" },

  "lp.r.dispatcher.job": { ru: "Принимаете звонки, подтверждаете заявки, заводите дилеров, смотрите отчётность.", tg: "Зангҳоро қабул мекунед, дархостҳоро тасдиқ мекунед, дилерҳоро сабт мекунед, ҳисоботро мебинед.", en: "Take calls, approve orders, register dealers, watch the numbers.", zh: "接听来电、确认订单、登记经销商、查看报表。" },
  "lp.r.dispatcher.look": { ru: "Доску машин и отчёты за 30 дней с графиком и выгрузкой.", tg: "Тахтаи мошинҳо ва ҳисоботи 30-рӯза бо график ва содирот.", en: "The truck board and the 30-day report with chart and export.", zh: "车辆看板，以及带图表和导出的 30 天报表。" },
  "lp.r.dealer.job": { ru: "Заказываете товар: сколько тонн, куда везти, кто поедет.", tg: "Мол фармоиш медиҳед: чанд тонна, ба куҷо, кӣ меравад.", en: "Order goods: how many tons, where to, and who drives.", zh: "下单：要多少吨、送到哪里、谁来拉。" },
  "lp.r.dealer.look": { ru: "Нажмите большую кнопку «Создать заявку» — всё на одном экране.", tg: "Тугмаи калони «Дархост сохтан»-ро зер кунед — ҳама чиз дар як экран.", en: "Tap the big “Create an order” button — it all fits one screen.", zh: "点那个大按钮「创建订单」——一屏填完。" },
  "lp.r.gate.job": { ru: "Сверяете машину с заявкой, впускаете и выпускаете.", tg: "Мошинро бо дархост муқоиса мекунед, дохил ва берун мекунед.", en: "Match the truck against the order, let it in and out.", zh: "核对车辆与订单，放行进出。" },
  "lp.r.gate.look": { ru: "Найдите машину по госномеру. Кнопки большие — палец в перчатке не промахнётся.", tg: "Мошинро аз рӯи рақам ёбед. Тугмаҳо калонанд — ангушт дар дастпӯшак хато намекунад.", en: "Find a truck by plate. The buttons are big enough for a gloved hand.", zh: "按车牌查车。按钮很大，戴手套也点得准。" },
  "lp.r.scale.job": { ru: "Записываете вес машины с грузом и пустой.", tg: "Вазни мошинро бо бор ва холӣ сабт мекунед.", en: "Record the truck weight loaded and empty.", zh: "记录车辆的重车重量和空车重量。" },
  "lp.r.scale.look": { ru: "Откройте машину на территории и запишите вес — нетто посчитается само.", tg: "Мошини дар ҳудудбударо кушоед ва вазнро сабт кунед — нетто худаш ҳисоб мешавад.", en: "Open a truck on site and save the weight — net is computed for you.", zh: "打开厂区内的车辆并录入重量，净重会自动算好。" },

  "lp.flow.title": { ru: "Путь одной машины", tg: "Роҳи як мошин", en: "One truck, end to end", zh: "一辆车的全过程" },
  "lp.flow.1": { ru: "Заявка", tg: "Дархост", en: "Order", zh: "下单" },
  "lp.flow.1d": { ru: "Дилер указывает товар, тонны, адрес, водителя и машину", tg: "Дилер мол, тонна, суроға, ронанда ва мошинро нишон медиҳад", en: "The dealer states product, tons, address, driver and truck", zh: "经销商写明货物、吨数、地址、司机和车辆" },
  "lp.flow.2": { ru: "Въезд", tg: "Вуруд", en: "Entry", zh: "进厂" },
  "lp.flow.2d": { ru: "Охрана сверяет номер и впускает машину", tg: "Посбон рақамро месанҷад ва мошинро дохил мекунад", en: "The guard checks the plate and lets the truck in", zh: "门岗核对车牌后放行入场" },
  "lp.flow.3": { ru: "Весы", tg: "Тарозу", en: "Weighing", zh: "过磅" },
  "lp.flow.3d": { ru: "Вес с грузом минус вес пустой машины — это и есть отгрузка", tg: "Вазн бо бор минус вазни холӣ — ҳамин боркунӣ аст", en: "Loaded minus empty — that is the shipment", zh: "重车减空车，差额就是本次发货量" },
  "lp.flow.4": { ru: "Выезд", tg: "Баромад", en: "Exit", zh: "出厂" },
  "lp.flow.4d": { ru: "Рождается накладная и уходит в 1С", tg: "Борхат сохта шуда ба 1С меравад", en: "A waybill is created and sent to 1C", zh: "生成随货单并传入 1C" },

  "lp.onec.title": { ru: "1С остаётся на месте", tg: "1С дар ҷои худ мемонад", en: "1C stays where it is", zh: "1C 保持原样" },
  "lp.onec.body": { ru: "Приход, расход и остаток по-прежнему считает 1С — бизнес-логику никуда не переносим. Программа берёт на себя то, что раньше жило на бумаге: заявки, пропуск машин, вес и накладные. Готовый документ уходит в 1С сам, вводить руками больше нечего.", tg: "Даромад, хароҷот ва бақия ҳамчунон дар 1С ҳисоб мешавад — мантиқи корӣ кӯчонида намешавад. Барнома он чизеро ба ӯҳда мегирад, ки пештар дар коғаз буд: дархостҳо, гузаштани мошинҳо, вазн ва борхатҳо. Ҳуҷҷати тайёр худаш ба 1С меравад.", en: "1C still does the accounting — none of that logic moves. The app takes over what used to live on paper: orders, gate passes, weights and waybills. The finished document goes to 1C on its own.", zh: "进货、出货和结存仍由 1C 计算，业务逻辑一律不搬。本系统接管过去靠纸张完成的部分：订单、车辆通行、称重和随货单。成单后自动传入 1C，不必再手工录入。" },

  "lp.demo.title": { ru: "Что важно знать про этот стенд", tg: "Дар бораи ин намоишгоҳ чӣ донистан лозим", en: "About this demo", zh: "关于这个演示环境" },
  "lp.demo.1": { ru: "Данные придуманы. Дилеры, машины и отгрузки — вымышленные, за 30 дней.", tg: "Маълумот сохта шудааст. Дилерҳо, мошинҳо ва боркуниҳо хаёлӣанд, барои 30 рӯз.", en: "The data is made up: fictional dealers, trucks and shipments over 30 days.", zh: "数据是虚构的：经销商、车辆和发货记录均为示例，覆盖最近 30 天。" },
  "lp.demo.2": { ru: "Обмена с 1С здесь нет — до неё из интернета не достучаться. Документы копятся в очереди.", tg: "Дар ин ҷо мубодила бо 1С нест — аз интернет ба он расидан мумкин нест. Ҳуҷҷатҳо дар навбат ҷамъ мешаванд.", en: "No 1C exchange here — it is unreachable from the internet. Documents queue up instead.", zh: "此处没有与 1C 的对接，从互联网无法访问它。单据会先在队列中排队。" },
  "lp.demo.3": { ru: "Пробуйте что угодно. Сломать нельзя, данные восстанавливаются одной командой.", tg: "Ҳар чизро санҷед. Вайрон кардан мумкин нест, маълумот бо як фармон барқарор мешавад.", en: "Try anything. Nothing breaks; the data restores with one command.", zh: "随便试。弄不坏，数据一条命令即可恢复。" },
  "lp.demo.4": { ru: "Открывается на телефоне и ставится на домашний экран как обычное приложение.", tg: "Дар телефон кушода мешавад ва ба экрани асосӣ ҳамчун барномаи оддӣ насб мешавад.", en: "Works on a phone and installs to the home screen like a normal app.", zh: "手机可用，并可像普通应用一样添加到主屏幕。" },

  "lp.langs": { ru: "Интерфейс на русском, таджикском и английском — переключается в любой момент.", tg: "Интерфейс бо русӣ, тоҷикӣ ва англисӣ — ҳар лаҳза иваз мешавад.", en: "Russian, Tajik and English — switch at any time.", zh: "界面支持俄语、塔吉克语、英语和中文，随时切换。" },
  "lp.feedback": { ru: "Что непонятно или мешает — скажите. Стенд для того и сделан.", tg: "Чизе нофаҳмо ё халалрасон бошад — гӯед. Намоишгоҳ барои ҳамин аст.", en: "Tell us what is confusing or in the way. That is what this demo is for.", zh: "哪里看不懂、哪里别扭，请直说。这个演示就是为此而建。" },

  "dealer.status.pending": { ru: "На проверке", tg: "Дар санҷиш", en: "Pending", zh: "待审核" },
  "dealer.status.active": { ru: "Работает", tg: "Фаъол", en: "Active", zh: "已启用" },
  "dealer.status.blocked": { ru: "Заблокирован", tg: "Маҳдудшуда", en: "Blocked", zh: "已停用" },
  "dealer.approve": { ru: "Открыть доступ", tg: "Дастрасӣ кушодан", en: "Open access", zh: "开通权限" },
  "dealer.block": { ru: "Заблокировать", tg: "Маҳдуд кардан", en: "Block", zh: "停用" },
  "dealer.unblock": { ru: "Разблокировать", tg: "Кушодан", en: "Unblock", zh: "恢复" },
  "dealer.pendingNotice": { ru: "Доступ ещё не открыт. Диспетчер проверяет ваши данные — заявку можно будет создать сразу после этого.", tg: "Дастрасӣ ҳанӯз кушода нашудааст. Диспетчер маълумоти шуморо месанҷад — пас аз он дархост сохта метавонед.", en: "Access is not open yet. The dispatcher is checking your details; you can create orders right after that.", zh: "权限尚未开通。调度正在核对你的信息，核对完成后即可创建订单。" },
  "dealer.blockedNotice": { ru: "Доступ закрыт. Свяжитесь с диспетчером.", tg: "Дастрасӣ баста аст. Бо диспетчер тамос гиред.", en: "Access is closed. Contact the dispatcher.", zh: "权限已关闭。请联系调度。" },
  "dealer.empty": { ru: "Дилеров пока нет", tg: "Ҳоло дилер нест", en: "No dealers yet", zh: "暂无经销商" },
  "dealer.waiting": { ru: "Ждут проверки", tg: "Интизори санҷиш", en: "Waiting for review", zh: "等待审核" },
  "dealer.working": { ru: "Работают", tg: "Фаъол", en: "Working", zh: "使用中" },

  "nav.orders": { ru: "Заявки", tg: "Дархостҳо", en: "Orders", zh: "订单" },
  "nav.new": { ru: "Новая заявка", tg: "Дархости нав", en: "New order", zh: "新建订单" },
  "nav.gate": { ru: "КПП", tg: "Назоратгоҳ", en: "Gate", zh: "门岗" },
  "nav.dealers": { ru: "Дилеры", tg: "Дилерҳо", en: "Dealers", zh: "经销商" },
  "nav.board": { ru: "Доска", tg: "Тахта", en: "Board", zh: "看板" },
  "nav.reports": { ru: "Отчёты", tg: "Ҳисоботҳо", en: "Reports", zh: "报表" },

  "board.title": { ru: "Машины сегодня", tg: "Мошинҳои имрӯз", en: "Trucks today", zh: "今日车辆" },
  "board.empty": { ru: "Пусто", tg: "Холӣ", en: "Empty", zh: "空" },
  "board.dragHint": { ru: "Карточку можно перетащить в соседнюю колонку — это то же действие, что кнопка", tg: "Кортро ба сутуни ҳамсоя кашидан мумкин аст — ин ҳамон амалест, ки тугма мекунад", en: "Drag a card to the next column — it does the same thing as the button", zh: "可以把卡片拖到相邻列，效果和按钮一样" },
  "rep.title": { ru: "Отчёты", tg: "Ҳисоботҳо", en: "Reports", zh: "报表" },
  "rep.period": { ru: "Период", tg: "Давра", en: "Period", zh: "时间范围" },
  "rep.today": { ru: "Сегодня", tg: "Имрӯз", en: "Today", zh: "今天" },
  "rep.d7": { ru: "7 дней", tg: "7 рӯз", en: "7 days", zh: "7 天" },
  "rep.d30": { ru: "30 дней", tg: "30 рӯз", en: "30 days", zh: "30 天" },
  "rep.d90": { ru: "90 дней", tg: "90 рӯз", en: "90 days", zh: "90 天" },
  "rep.shipped": { ru: "Вывезено", tg: "Бароварда шуд", en: "Shipped out", zh: "已发出" },
  "rep.arrived": { ru: "Машин заехало", tg: "Мошин ворид шуд", en: "Trucks in", zh: "进厂车辆" },
  "rep.departed": { ru: "Машин выехало", tg: "Мошин баромад", en: "Trucks out", zh: "出厂车辆" },
  "rep.avg": { ru: "Средняя загрузка", tg: "Бори миёна", en: "Average load", zh: "平均装载" },
  "rep.ordersMade": { ru: "Заявок принято", tg: "Дархост қабул шуд", en: "Orders taken", zh: "已受理订单" },
  "rep.ordered": { ru: "Заказано по заявкам", tg: "Аз рӯи дархостҳо фармоиш шуд", en: "Ordered", zh: "订单需求量" },
  "rep.plan": { ru: "план", tg: "нақша", en: "plan", zh: "计划" },
  "rep.byDay": { ru: "Отгрузка по дням", tg: "Боркунӣ аз рӯи рӯзҳо", en: "Shipped by day", zh: "按日发货量" },
  "rep.byProduct": { ru: "По товарам", tg: "Аз рӯи молҳо", en: "By product", zh: "按货物" },
  "rep.byDealer": { ru: "По дилерам", tg: "Аз рӯи дилерҳо", en: "By dealer", zh: "按经销商" },
  "rep.empty": { ru: "За этот период отгрузок не было", tg: "Дар ин давра боркунӣ набуд", en: "No shipments in this period", zh: "此时间段内没有发货" },
  "rep.export": { ru: "Выгрузить в CSV", tg: "Ба CSV содир кардан", en: "Export to CSV", zh: "导出 CSV" },
  "rep.trucksShort": { ru: "машин", tg: "мошин", en: "trucks", zh: "车次" },

  "board.needWeight": { ru: "Сначала весовая", tg: "Аввал тарозу", en: "Weighbridge first", zh: "先去过磅" },
  "nav.scale": { ru: "Весы", tg: "Тарозу", en: "Weighbridge", zh: "地磅" },

  "role.dealer": { ru: "Дилер", tg: "Дилер", en: "Dealer", zh: "经销商" },
  "role.dispatcher": { ru: "Диспетчер", tg: "Диспетчер", en: "Dispatcher", zh: "调度" },
  "role.gate": { ru: "Охрана", tg: "Посбон", en: "Gate guard", zh: "门岗" },
  "role.scale": { ru: "Весовщик", tg: "Тарозудор", en: "Weigher", zh: "司磅员" },
  "role.admin": { ru: "Администратор", tg: "Маъмур", en: "Admin", zh: "管理员" },

  "order.contact": { ru: "От кого заявка", tg: "Дархост аз кӣ", en: "Requested by", zh: "申请人" },
  "order.contact.hint": { ru: "Название фирмы или ФИО дилера", tg: "Номи фирма ё ННН-и дилер", en: "Company name or dealer's full name", zh: "公司名称或经销商姓名" },
  "order.when": { ru: "Дата и время заявки", tg: "Сана ва вақти дархост", en: "Order date and time", zh: "申请日期和时间" },
  "order.truck": { ru: "Машина и водитель", tg: "Мошин ва ронанда", en: "Truck and driver", zh: "车辆和司机" },
  "trip.model": { ru: "Марка машины", tg: "Маркаи мошин", en: "Truck make", zh: "车辆品牌" },
  "trip.model.hint": { ru: "КамАЗ, Howo, Shacman", tg: "КамАЗ, Howo, Shacman", en: "KamAZ, Howo, Shacman", zh: "卡玛斯、豪沃、陕汽" },
  "dealer.newBig": { ru: "Создать заявку", tg: "Дархост сохтан", en: "Create an order", zh: "创建订单" },
  "dealer.myOrders": { ru: "Мои заявки", tg: "Дархостҳои ман", en: "My orders", zh: "我的订单" },
  "order.sent": { ru: "Заявка принята", tg: "Дархост қабул шуд", en: "Order received", zh: "订单已收到" },
  "order.sentBody": { ru: "Мы получили её. Диспетчер подтвердит и машину будут ждать на заводе.", tg: "Мо онро гирифтем. Диспетчер тасдиқ мекунад ва мошинро дар завод интизор мешаванд.", en: "We have it. The dispatcher will confirm and the plant will expect your truck.", zh: "我们已收到。调度确认后，工厂会等你的车。" },
  "order.newAgain": { ru: "Создать ещё одну", tg: "Боз як дархост", en: "Create another", zh: "再建一个" },
  "order.one": { ru: "Заявка", tg: "Дархост", en: "Order", zh: "订单" },
  "order.number": { ru: "Номер", tg: "Рақам", en: "Number", zh: "编号" },
  "order.dealer": { ru: "От кого", tg: "Аз кӣ", en: "From", zh: "来自" },
  "order.product": { ru: "Товар", tg: "Мол", en: "Product", zh: "货物" },
  "order.tonsHint": { ru: "Вес по весовой, в тоннах", tg: "Вазн аз рӯи тарозу, бо тонна", en: "Weighbridge weight, in tons", zh: "以地磅为准，单位吨" },
  "order.tons": { ru: "Тонн", tg: "Тонна", en: "Tons", zh: "吨数" },
  "order.destination": { ru: "Назначение", tg: "Таъинот", en: "Destination", zh: "送达地点" },
  "order.destination.hint": { ru: "Куда повезут товар: объект, город, адрес", tg: "Мол ба куҷо бурда мешавад: объект, шаҳр, суроға", en: "Where the goods go: site, city, address", zh: "货物运往何处：工地、城市、地址" },
  "order.note": { ru: "Примечание", tg: "Эзоҳ", en: "Note", zh: "备注" },
  "order.created": { ru: "Создана", tg: "Сохта шуд", en: "Created", zh: "创建于" },
  "order.loaded": { ru: "Отгружено", tg: "Бор карда шуд", en: "Shipped", zh: "已发货" },
  "order.of": { ru: "из", tg: "аз", en: "of", zh: "共" },
  "order.remaining": { ru: "Остаток", tg: "Боқимонда", en: "Remaining", zh: "剩余" },
  "order.empty": { ru: "Заявок пока нет", tg: "Ҳоло дархост нест", en: "No orders yet", zh: "暂无订单" },
  "order.create": { ru: "Создать заявку", tg: "Дархост сохтан", en: "Create order", zh: "创建订单" },
  "order.approve": { ru: "Подтвердить", tg: "Тасдиқ кардан", en: "Approve", zh: "确认" },
  "order.reject": { ru: "Отклонить", tg: "Рад кардан", en: "Reject", zh: "驳回" },
  "order.close": { ru: "Закрыть заявку", tg: "Дархостро пӯшидан", en: "Close order", zh: "关闭订单" },

  "status.new": { ru: "Новая", tg: "Нав", en: "New", zh: "新建" },
  "status.approved": { ru: "Подтверждена", tg: "Тасдиқшуда", en: "Approved", zh: "已确认" },
  "status.rejected": { ru: "Отклонена", tg: "Радшуда", en: "Rejected", zh: "已驳回" },
  "status.closed": { ru: "Закрыта", tg: "Пӯшида", en: "Closed", zh: "已关闭" },
  "status.cancelled": { ru: "Отменена", tg: "Бекоршуда", en: "Cancelled", zh: "已取消" },

  "trip.many": { ru: "Машины", tg: "Мошинҳо", en: "Trucks", zh: "车辆" },
  "trip.add": { ru: "Добавить машину", tg: "Мошин илова кардан", en: "Add truck", zh: "添加车辆" },
  "trip.plate": { ru: "Госномер", tg: "Рақами давлатӣ", en: "Plate", zh: "车牌号" },
  "trip.trailer": { ru: "Прицеп", tg: "Тиркаш", en: "Trailer", zh: "挂车" },
  "trip.driver": { ru: "ФИО водителя", tg: "ННН ронанда", en: "Driver name", zh: "司机姓名" },
  "trip.driverPhone": { ru: "Телефон водителя", tg: "Телефони ронанда", en: "Driver phone", zh: "司机电话" },
  "trip.empty": { ru: "Машины ещё не приехали", tg: "Мошинҳо ҳанӯз наомадаанд", en: "No trucks yet", zh: "车辆尚未到达" },
  "trip.arrived": { ru: "Приехала", tg: "Омад", en: "Arrived", zh: "到达" },
  "trip.left": { ru: "Уехала", tg: "Рафт", en: "Left", zh: "离开" },
  "trip.status.expected": { ru: "Ожидается", tg: "Интизор", en: "Expected", zh: "等待中" },
  "trip.status.on_site": { ru: "На территории", tg: "Дар ҳудуд", en: "On site", zh: "厂区内" },
  "trip.status.loaded": { ru: "Загружена", tg: "Бор шуд", en: "Loaded", zh: "已装车" },
  "trip.status.departed": { ru: "Выехала", tg: "Баромад", en: "Departed", zh: "已出厂" },
  "trip.status.cancelled": { ru: "Отменена", tg: "Бекор шуд", en: "Cancelled", zh: "已取消" },

  "gate.title": { ru: "Контроль въезда и выезда", tg: "Назорати вуруд ва баромад", en: "Gate control", zh: "进出厂管控" },
  "gate.search": { ru: "Госномер или номер заявки", tg: "Рақами давлатӣ ё рақами дархост", en: "Plate or order number", zh: "车牌号或订单编号" },
  "gate.in": { ru: "Впустить", tg: "Дохил кардан", en: "Let in", zh: "放行入场" },
  "gate.out": { ru: "Выпустить", tg: "Баровардан", en: "Let out", zh: "放行出场" },
  "gate.onSite": { ru: "Сейчас на территории", tg: "Ҳоло дар ҳудуд", en: "On site now", zh: "当前在厂区" },
  "gate.expected": { ru: "Ждём сегодня", tg: "Имрӯз интизорем", en: "Expected today", zh: "今日待到" },
  "gate.waitScale": { ru: "Ждём весовую — без веса выпускать нельзя", tg: "Интизори тарозу — бе вазн баровардан мумкин нест", en: "Waiting for the weighbridge — no exit without a weight", zh: "等待过磅，没有重量不能放行" },
  "gate.nothing": { ru: "Ничего не нашли. Проверьте номер.", tg: "Чизе ёфт нашуд. Рақамро санҷед.", en: "Nothing found. Check the number.", zh: "没有找到。请核对号码。" },

  "scale.gross": { ru: "Вес с грузом, кг", tg: "Вазн бо бор, кг", en: "Weight loaded, kg", zh: "重车重量，公斤" },
  "scale.tare": { ru: "Вес пустой машины, кг", tg: "Вазни мошини холӣ, кг", en: "Empty truck weight, kg", zh: "空车重量，公斤" },
  "scale.net": { ru: "Груз", tg: "Бор", en: "Load", zh: "净重" },
  "scale.save": { ru: "Записать вес", tg: "Вазнро сабт кардан", en: "Save weight", zh: "保存重量" },
  "scale.title": { ru: "Взвешивание", tg: "Баркашидан", en: "Weighing", zh: "称重" },

  "waybill": { ru: "Накладная", tg: "Борхат", en: "Waybill", zh: "随货单" },
  "waybill.print": { ru: "Печать накладной", tg: "Чопи борхат", en: "Print waybill", zh: "打印随货单" },

  "sync.pending": { ru: "Ждёт отправки в 1С", tg: "Интизори ирсол ба 1С", en: "Queued for 1C", zh: "等待发往 1C" },
  "sync.sent": { ru: "Передано в 1С", tg: "Ба 1С фиристода шуд", en: "Sent to 1C", zh: "已发往 1C" },
  "sync.failed": { ru: "1С не ответила, повторим", tg: "1С ҷавоб надод, такрор мекунем", en: "1C did not answer, will retry", zh: "1C 无响应，将重试" },

  "error.title": { ru: "Что-то сломалось", tg: "Чизе вайрон шуд", en: "Something broke", zh: "出错了" },
  "error.body": { ru: "Данные не загрузились. Повторите, а если повторится — сообщите диспетчеру.", tg: "Маълумот бор нашуд. Такрор кунед, агар боз такрор шавад — ба диспетчер хабар диҳед.", en: "The data did not load. Try again, and tell the dispatcher if it repeats.", zh: "数据没有加载出来。请重试，如果仍然如此，请告知调度。" },
  "error.retry": { ru: "Повторить", tg: "Такрор", en: "Try again", zh: "重试" },
  "error.home": { ru: "На главную", tg: "Ба саҳифаи асосӣ", en: "Go home", zh: "回首页" },
  "notfound.title": { ru: "Страница не найдена", tg: "Саҳифа ёфт нашуд", en: "Page not found", zh: "页面不存在" },
  "notfound.body": { ru: "Заявку удалили или ссылка устарела.", tg: "Дархост нест карда шуд ё истинод кӯҳна аст.", en: "The order was deleted or the link is out of date.", zh: "订单已删除，或链接已失效。" },

  "t": { ru: "т", tg: "т", en: "t", zh: "吨" },
  "save": { ru: "Сохранить", tg: "Нигоҳ доштан", en: "Save", zh: "保存" },
  "cancel": { ru: "Отмена", tg: "Бекор", en: "Cancel", zh: "取消" },
  "back": { ru: "Назад", tg: "Бозгашт", en: "Back", zh: "返回" },
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
