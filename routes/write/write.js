var express = require('express');
var router = express.Router();
var loger = require('../../logmodule.js');                  //로그모듈
var multer = require('multer')                          //파일관련 모듈
var client = require('../../config/mysqlconfig.js');        //mysql 모듈
loger.info("메모리 로딩 시작. - write.js");

/* 대분류 */
router.get('/write/bigwrite', function (req, res, next) {
  res.render('write/bigwrite');
});

/* 중분류 */
router.get('/write/middlewrite', function (req, res, next) {
  res.render('write/middlewrite');
});

/* 소분류 글쓰기 */
router.get('/write/write', function (req, res, next) {
  res.render('write/write');
});

//파일 저장위치와 파일이름 설정
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //파일이 이미지 파일이면
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png") {
      cb(null, 'public/bigwriteimages');
      //텍스트 파일이면 
    } else {
      loger.info("그림파일만 등록할 수 있습니다.");
    };
  },
  //파일이름 설정
  filename: function (req, file, cb) {
    var nowdate = new Date().toLocaleString();
    var nowdate2 = nowdate.replace(' ','');
    var nowdate3 = nowdate2.replace(':','');
    var nowdate4 = nowdate3.replace('-','');
    var nowdate5 = nowdate4.replace('-','');
    var now = nowdate5.replace(':','');
    var filename = now + '.png';
    cb(null,filename);                          // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
});


//파일 업로드 모듈
var upload = multer({ storage: storage });
/* 대분류 저장 액션 */
router.post('/write/bigwritesaveimage', upload.single('fileupload') ,function (req, res, next) {
  loger.info('대분류 이미지 저장 진입  - /write/bigwritesaveimage - write.js ');
  //파일 경로 넘겨주기
  //var originalFileName = req.file.originalname;
  var nowdate = new Date().toLocaleString();
  var nowdate2 = nowdate.replace(' ','');
  var nowdate3 = nowdate2.replace(':','');
  var nowdate4 = nowdate3.replace('-','');
  var nowdate5 = nowdate4.replace('-','');
  var now = nowdate5.replace(':','');

  res.send({ result: 'success' , 'path' : 'public/bigwriteimages/'+ now + '.png' });
});

/* 대분류 저장 액션 */
router.post('/write/bigwritesave',function (req, res, next) {
  loger.info('대분류 저장 진입  - /write/bigwritesave - write.js');
  var section = req.body.sectiontext;
  var fileurl = req.body.fileurl;
  var title = req.body.title;
  var mainclose = req.body.mainclose;
  var pay = req.body.pay;
  var close = req.body.close;
  var price = req.body.price;
  var summernoteContent = req.body.summernoteContent;
  var imagepath = req.body.imagepath;


  var insertsql = 'insert into bigTbl (title,description,close,pay,mainclose,section,price,fileurl,image) values (?,?,?,?,?,?,?,?,?)';
  var params = [title, summernoteContent, close, pay , mainclose, section, price,fileurl ,imagepath];
  client.query(insertsql, params, function (err, rows, fields) {
    if (err) {
      loger.error('대분류 insert 쿼리에 오류가 있습니다. - /write/bigwritesave - write.js');
      loger.error(err);
    } else {
      if(rows.insertId){
        res.send({ result: 'success' , tocken:'저장성공'});
      }else{
        res.send({ result: 'fail' , tocken:'저장실패'});
      }
    }
  });
});


module.exports = router;
loger.info("메모리 로딩 완료. - write.js");


