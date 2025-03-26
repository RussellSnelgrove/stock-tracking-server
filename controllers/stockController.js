const getStock = (req, res) => {
    console.log('req', req);
    res.json({sample: 'alrighty'});
}

module.exports = { getStock };
