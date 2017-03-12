var express = require('express');
var chaincode = require('./chaincode');
var router = express.Router();
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: '糖果电影' });
});




router.post("/picture.json", function (req, res, next) {
  var ip = req.query.ip
  var prefix = "";
  if (!ip)
    ip = com + ".mybluemix.net";
  else
    prefix = "https://" + ip + "/" + com + "/";
  res.json(
    [
      { href: prefix + '/images/Chrysanthemum.jpg', type: 'image/jpeg', title: 'Chrysanthemum' },
      { href: prefix + '/images/Desert.jpg', type: 'image/jpeg', title: 'Desert' },
      { href: prefix + '/images/Hydrangeas.jpg', type: 'image/jpeg', title: 'Hydrangeas' },
      { href: prefix + '/images/Jellyfish.jpg', type: 'image/jpeg', title: 'Jellyfish' },
      { href: prefix + '/images/Koala.jpg', type: 'image/jpeg', title: 'Koala' },
      { href: prefix + '/images/Lighthouse.jpg', type: 'image/jpeg', title: 'Lighthouse' },
      { href: prefix + '/images/Penguins.jpg', type: 'image/jpeg', title: 'Penguins' },
      { href: prefix + '/images/Tulips.jpg', type: 'image/jpeg', title: 'Tulips' }
    ]);
})

/*
function lookUpDSNNode(ip) {
  chaincode.locateCDN(ip, com, function() {
  });
  return "";
}
*/
router.post("/video.json", function (req, res, next) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  // ::ffff:9.123.229.184
  var posn = ip.lastIndexOf(':');
  if (posn !== -1) {
    ip = ip.substring(posn + 1);
  }
  console.log(req.body);
  console.log(req.body.cdn);
  // This UUID is on CDN
  com = '61fee44e-9365-403d-95ec-41be918b8cca';
  console.log('Locating CDN for ', ip, com);
  var prefix = "";
  if (!req.body.cdn || req.body.cdn == 'false') {
    generateVideoJSon(prefix, res);
  } else {
    chaincode.locateCDN(ip, com, function (cdnNode) {
      prefix = "https://" + cdnNode + "/" + com + "/";
      generateVideoJSon(prefix, res);
    });
  }
});

module.exports = router;

function generateVideoJSon(prefix, res) {
  console.log("Prefix:" + prefix);
  res.json(
    [
      {
        title: '蓝精灵',
        href: prefix + 'videos/Smurfs_1080.mp4',
        type: 'video/mp4',
        poster: 'images/Smurfs2.jpg'
      },
      {
        title: '生化危机',
        href: prefix + 'videos/RESIDENT_EVIL_1080.mp4',
        type: 'video/mp4',
        poster: 'images/shenghua.jpg'
      },
      {
        title: '记忆大师',
        href: prefix + 'videos/Master_1080.mp4',
        type: 'video/mp4',
        poster: 'images/Master2.jpg'
      }
    ]);
}