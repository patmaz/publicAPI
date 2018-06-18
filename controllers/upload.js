const { saveImg } = require('../services/firebaseApi');
const config = require('../config');

exports.upload = async (req, res) => {
    const data = req.body.data;
    const pass = req.body.pass;

    if (pass !== config.somePass) {
        return res.status(422).json({ data: 'wrong pass' });
    }

    if (!data) {
        return res.status(422).json({ data: 'no data' });
    }

    try {
        const response = await saveImg(data);
        res.status(200).json({ data: response });
    } catch (err) {
        console.log(err);
        res.status(500).json({ data: 'OMFG' });
    }
};