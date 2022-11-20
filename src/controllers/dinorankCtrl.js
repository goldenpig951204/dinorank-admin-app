const settingModel = require("../models/setting");
const dvAxios = require("devergroup-request").default;
const axios = new dvAxios({
    axiosOpt: {
        timeout: 30000
    }
});
const { dinorankLog } = require("../services/logger");
const { get } = require("lodash");

const login = async (req, res) => {
    let { email, password } = req.body;
    try {
        let body = `nombreUsuario=${email}&clave=${password}&permanecer=si&elemento=`;
        let response = await axios.instance.post(
            "https://dinorank.com/ajax/login.php",
            body,
            {
                headers: {
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
                    "content-type": "application/x-www-form-urlencoded",
                    "content-length": Buffer.byteLength(body),
                }
            }
        );
        console.log(response.data)
        if (response.data.status === "activo") {
            console.log("URL====>", response.data.message);
            let cookie = axios.cookieJar.getCookieStringSync(response.data.message);
            console.log("COOKIE=====>", cookie);
            await settingModel.findOneAndUpdate(null, {
                dinorankCookie: cookie
            }, {
                upsert: true
            });
            dinorankLog.info(`Start session with ${email} successfully.`);
            res.send('Login successfully.');
        } else {
            res.status(500).send('Credential is incorrect.');
        }
    } catch (err) {
        dinorankLog.error(`Start session with ${email} failed: ${get(err, "response.data.message") || err.message}`);
        res.status(500).send(get(err, "response.data.message") || err.message);
    }
}

module.exports = {
    login
};