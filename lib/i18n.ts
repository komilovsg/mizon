import { cookies } from "next/headers";

export const LOCALES = ["ru", "tg", "en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_LABEL: Record<Locale, string> = { ru: "Рус", tg: "Тоҷ", en: "Eng", zh: "中文" };

const dict = {

  "dealer.status.pending": { ru: "На проверке", tg: "Дар санҷиш", en: "Pending", zh: "待审核" },
  "dealer.status.active": { ru: "Работает", tg: "Фаъол", en: "Active", zh: "已启用" },
  "dealer.status.blocked": { ru: "Заблокирован", tg: "Маҳдудшуда", en: "Blocked", zh: "已停用" },
  "dealer.approve": { ru: "Открыть доступ", tg: "Дастрасӣ кушодан", en: "Open access", zh: "开通权限" },
  "dealer.block": { ru: "Заблокировать", tg: "Маҳдуд кардан", en: "Block", zh: "停用" },
  "dealer.unblock": { ru: "Разблокировать", tg: "Кушодан", en: "Unblock", zh: "恢复" },
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

  "order.contact": { ru: "От кого заявка", tg: "Дархост аз кӣ", en: "Requested by", zh: "申请人" },
  "order.contact.hint": { ru: "Название фирмы или ФИО дилера", tg: "Номи фирма ё ННН-и дилер", en: "Company name or dealer's full name", zh: "公司名称或经销商姓名" },
  "order.when": { ru: "Дата и время заявки", tg: "Сана ва вақти дархост", en: "Order date and time", zh: "申请日期和时间" },
  "order.truck": { ru: "Машина и водитель", tg: "Мошин ва ронанда", en: "Truck and driver", zh: "车辆和司机" },
  "trip.model": { ru: "Марка машины", tg: "Маркаи мошин", en: "Truck make", zh: "车辆品牌" },
  "trip.model.hint": { ru: "КамАЗ, Howo, Shacman", tg: "КамАЗ, Howo, Shacman", en: "KamAZ, Howo, Shacman", zh: "卡玛斯、豪沃、陕汽" },
  "dealer.newBig": { ru: "Создать заявку", tg: "Дархост сохтан", en: "Create an order", zh: "创建订单" },
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
