const https = require('https')
const fs = require('fs')
const moment = require('moment')

//"https://official.jtexpress.com.cn/official/waybill/trackingCustomerByWaybillNo/v_3?waybillList=JT0000131754417"

//前缀
const prefix = "JT0000"
//查询接口路径
const path = "/official/waybill/trackingCustomerByWaybillNo/v_3?waybillList="

//查询选项
const options = {
    protocol: "https:",
    host: 'official.jtexpress.com.cn',
    path: '',
    method: 'GET',
    port: 443,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36',
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
    }
}

//创建目录
try {
    fs.mkdirSync("JT")
} catch (e) { }

//在5分钟内查询完成,短时间查询过多单号会被拒绝
let time = 300000

function print(str) {
    console.log(`[${moment().format('LTS')}] ${str}`)
}

//分别查询
for (let i = 131754000; i < 131754100; ++i) {
    setTimeout(function () {
        //单号
        let order_id = prefix + i
        print(`查询单号 ${order_id} .`)
        options.path = path + order_id

        let req = https.request(options, (res) => {
            let get_data = ''
            res.on('data', function (chunk) {
                get_data += chunk
            })

            res.on('end', function () {
                try {
                    get_data = JSON.parse(get_data)
                } catch (err) {
                    print(`查询单号 ${order_id} 返回数据无法解析为json格式.`)
                    return
                }

                if (get_data.data[0].details == null) {
                    print(`单号 ${order_id} 无数据.`)
                    return
                }

                fs.writeFile("./JT/" + get_data.data[0].keyword + ".json", JSON.stringify(get_data.data[0].details, null, 4), (err) => {
                    if (err) {
                        print(`单号 ${order_id} 数据保存异常 ${err.message}`)
                    } else {
                        print(`单号 ${order_id} 数据保存完成`)
                    }
                })
            })
        })

        req.end()

    }, Math.floor(Math.random() * time))
}
