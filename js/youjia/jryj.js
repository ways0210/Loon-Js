
/**
 * ========================
 * 今日汽油价格通知
 * Author: zqzess
 * Modified: ChatGPT
 * Version: v1.1.0
 *
 * 适用：Loon 3.5.3
 * BoxJS：gasolinePrice
 *
 * 油号格式：92,95,98,0
 * 显示顺序：92 → 95 → 98 → 0
 * ========================
 */

const title = '🔔今日油价';
const keyName = 'gasolinePrice';
const $ = new Env(title, true);

// 默认配置
const defaultConfig = {
    location: '江苏',
    type: '92',
    isNotify: 'true',
    isShowAll: 'true'
};

// 读取 BoxJS
let locateInfo = $.getjson(keyName) || {};
locateInfo = Object.assign({}, defaultConfig, locateInfo);

// 日期
const now = new Date();
const year = String(now.getFullYear());
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');

// 油价接口
const host = 'https://raw.githubusercontent.com/zqzess/openApiData/main/gasolinePrice/';

const option = {
    url: host + year + '/' + month + '/' + year + month + day + '.json',
    headers: {}
};

// 固定油号顺序
const typeOrder = ['92', '95', '98', '0'];

// 判断布尔值
function isTrue(value) {
    return value === true ||
        String(value).toLowerCase() === 'true' ||
        String(value) === '1';
}

// 标准化油号
function normalizeType(type) {
    type = String(type || '')
        .replace(/号|汽油|柴油|#|＃/g, '')
        .trim();

    if (type === '0') return '0';
    if (type === '92') return '92';
    if (type === '95') return '95';
    if (type === '98') return '98';

    return '';
}

// 识别接口油号
function getOilType(name) {
    name = String(name || '');

    if (/柴油/.test(name) || /(^|[^0-9])0\s*(号|#|＃)/.test(name)) {
        return '0';
    }

    if (/92/.test(name)) return '92';
    if (/95/.test(name)) return '95';
    if (/98/.test(name)) return '98';

    return '';
}

// 价格格式
function formatPrice(price) {
    let value = String(price).trim();

    if (!value.endsWith('元')) {
        value += '元';
    }

    return value;
}

// 开始执行
console.log('========== 今日油价 ==========');
console.log('地区：' + locateInfo.location);
console.log('BoxJS油号：' + locateInfo.type);
console.log('请求地址：' + option.url);

// 解析 BoxJS 多选油号
const selectedTypes = String(locateInfo.type || '92')
    .split(/[,，]/)
    .map(item => normalizeType(item))
    .filter(item => typeOrder.includes(item));

// 去重并按照固定顺序排列
const orderedTypes = typeOrder.filter(type =>
    selectedTypes.includes(type)
);

console.log('实际选择油号：' + orderedTypes.join(','));

if (orderedTypes.length === 0) {

    $.msg(
        '❌油价配置错误',
        'BoxJS油号设置无效',
        '请填写92、95、98、0，多个油号使用英文逗号分隔'
    );

    $.done();

} else {

    // 请求数据
    $.get(option, function (error, response, data) {

        try {

            if (error) {
                throw new Error('请求失败：' + error);
            }

            if (!response) {
                throw new Error('接口没有返回数据');
            }

            const status = response.statusCode || response.status;

            if (status && status !== 200) {
                throw new Error('HTTP状态码：' + status);
            }

            const responseBody = response.body || data;

            if (!responseBody) {
                throw new Error('返回内容为空');
            }

            const jsonObj = JSON.parse(responseBody);

            const group = jsonObj.group || [];
            const titles = jsonObj.title || [];

            // 查找地区
            const location = String(locateInfo.location || '江苏');

            const region = group.find(function (item) {
                return item.location &&
                    (
                        item.location.includes(location) ||
                        location.includes(item.location)
                    );
            });

            if (!region) {
                throw new Error('没有找到地区：' + location);
            }

            const prices = region.data || [];

            // 油号和价格配对
            let priceList = [];

            titles.forEach(function (item, index) {

                const oilType = getOilType(item);

                if (!oilType) return;

                if (prices[index] === undefined ||
                    prices[index] === null) return;

                priceList.push({
                    type: oilType,
                    price: formatPrice(prices[index])
                });

            });

            // 去重
            let uniqueList = [];

            priceList.forEach(function (item) {

                if (!uniqueList.some(function (i) {
                    return i.type === item.type;
                })) {
                    uniqueList.push(item);
                }

            });

            priceList = uniqueList;

            // 根据 BoxJS 选择的油号筛选
            priceList = priceList.filter(function (item) {
                return orderedTypes.includes(item.type);
            });

            // 按照 92、95、98、0 排序
            priceList.sort(function (a, b) {
                return typeOrder.indexOf(a.type) -
                    typeOrder.indexOf(b.type);
            });

            if (priceList.length === 0) {
                throw new Error('没有获取到所选油号的价格');
            }

            // 只显示价格，不显示油号名称
            // 每个价格之间一个空格
const notifyContent = priceList.map(function (item) {
    return item.type +'#:'+ item.price;
}).join('  ');

            const message = jsonObj.message || '';

            console.log('========== 查询成功 ==========');
            console.log('地区：' + location);
            console.log('显示油号：' +
                priceList.map(i => i.type).join(','));
            console.log('通知内容：' + notifyContent);

            // 通知开关
            if (isTrue(locateInfo.isNotify)) {

                $.msg(
                    '🔔' + location + '今日油价',
                    notifyContent,
                    message
                );

            }

            // Surge / Stash 样式
            let body = {};

            if ($.isSurge()) {

                body = {
                    title: '⛽️' + location + '今日油价',
                    content: notifyContent + '\n' + message,
                    icon: 'fuelpump',
                    'icon-color': '#FFCD00'
                };

            } else {

                body = {
                    title: title,
                    content: notifyContent + '\n' + message,
                    icon: 'oilcan',
                    backgroundColor: '#FFCD00'
                };

            }

            if ($.isSurge() || $.isStash()) {
                $.done(body);
            } else {
                $.done();
            }

        } catch (e) {

            console.log('❌油价获取失败：' + e.message);

            $.msg(
                '❌今日油价获取失败',
                e.message,
                ''
            );

            $.done();

        }

    });

}


/*********************************
 * Env 环境代码
 * Loon / Surge / Stash / QX
 *********************************/

function Env(t, e) {

    return new class {

        constructor(t, e) {
            this.name = t;
            this.startTime = Date.now();
            this.isMute = false;
            Object.assign(this, e);
            this.log('🔔' + this.name + ' 开始执行');
        }

        getEnv() {
            if (typeof $environment !== 'undefined' &&
                $environment['surge-version']) return 'Surge';

            if (typeof $environment !== 'undefined' &&
                $environment['stash-version']) return 'Stash';

            if (typeof $task !== 'undefined') return 'Quantumult X';

            if (typeof $loon !== 'undefined') return 'Loon';

            if (typeof $rocket !== 'undefined') return 'Shadowrocket';

            return 'Loon';
        }

        isSurge() {
            return this.getEnv() === 'Surge';
        }

        isStash() {
            return this.getEnv() === 'Stash';
        }

        isLoon() {
            return this.getEnv() === 'Loon';
        }

        getjson(key, fallback) {
            let value = this.getdata(key);

            if (value) {
                try {
                    return JSON.parse(value);
                } catch (e) {
                    this.log('BoxJS配置解析失败：' + e);
                }
            }

            return fallback;
        }

        getdata(key) {
            switch (this.getEnv()) {
                case 'Surge':
                case 'Loon':
                case 'Stash':
                case 'Shadowrocket':
                    return $persistentStore.read(key);

                case 'Quantumult X':
                    return $prefs.valueForKey(key);

                default:
                    return null;
            }
        }

        setdata(value, key) {
            switch (this.getEnv()) {
                case 'Surge':
                case 'Loon':
                case 'Stash':
                case 'Shadowrocket':
                    return $persistentStore.write(value, key);

                case 'Quantumult X':
                    return $prefs.setValueForKey(value, key);

                default:
                    return false;
            }
        }

        get(option, callback) {

            switch (this.getEnv()) {

                case 'Quantumult X':

                    $task.fetch(option).then(response => {
                        callback(
                            null,
                            {
                                statusCode: response.statusCode,
                                status: response.statusCode,
                                headers: response.headers,
                                body: response.body
                            },
                            response.body
                        );
                    }).catch(error => {
                        callback(error);
                    });

                    break;

                default:

                    $httpClient.get(option, (error, response, data) => {

                        if (!error && response) {
                            response.body = data;
                            response.statusCode =
                                response.status || response.statusCode;
                        }

                        callback(error, response, data);

                    });

                    break;
            }
        }

        msg(title, subtitle = '', body = '', options) {

            if (this.isMute) return;

            switch (this.getEnv()) {

                case 'Quantumult X':
                    $notify(title, subtitle, body, options);
                    break;

                default:
                    $notification.post(title, subtitle, body, options);
                    break;
            }

        }

        log(...args) {
            console.log(args.join('\n'));
        }

        done(data = {}) {
            this.log(
                '🔔' + this.name +
                ' 执行结束，用时 ' +
                ((Date.now() - this.startTime) / 1000) +
                ' 秒'
            );

            $done(data);
        }

    }(t, e);

}
