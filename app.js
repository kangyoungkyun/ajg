var express = require('express'); 
//외부모듈 추출
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var morganlogger = require('morgan');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var client = require('./config/mysqlconfig.js');  //mysql 모듈
var loger = require('./logmodule.js');            //로그모듈
var app = express(); 


var options = {                                         //session을 mysql db에 저장시키기위한 옵션
  host	: 'localhost',
  port	: 3306,
  user	: 'root',
  password: 'eorn1145',		                              //데이터베이스 접근 비밀번호
  database: 'mydb3'		                                  //데이터베이스의 이름
  };
  
  var sessionStore = new MySQLStore(options);           //mysql session을 저장하기 위한 서버
  //미들웨어에 셋팅.
  app.use(session({
    cookie: {
      maxAge: 2400000 * 60 * 60 // 쿠키 유효기간 2400시간
    },
  secret : '1year1billion!!',
  resave: true,
  saveUninitialized: true,
  store: sessionStore
  }));


// 서버를 설정한다.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.set('case sensitive routes', true);                       //대소문자 구분하기

//미들웨어를 설정한다.
app.use(morganlogger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var menus;


function callMenu(){
  var sql = 'select * from bigTbl';
  client.query(sql, function (err, selectrows, results) {
  
    if (err) {
      loger.error(err);
      return;
    } else {
      loger.info("메뉴셋팅~!");
      menus = selectrows;
      loger.info("메뉴셋팅~ 완료");
    }
  }); 
}
callMenu();

app.use(function(req, res, next) {

  loger.info("공통페이지 진입 - app.js");
    if (req.session.nickname) {
      callMenu();
      loger.info("세션세팅");
      res.locals.email = req.session.authId;
      res.locals.whoami = req.session.nickname;

      res.locals.menus = menus;
      loger.info(res.locals.menus.length);
    } else {
      callMenu();
      res.locals.whoami = undefined;
      res.locals.email = undefined;
      res.locals.menus = menus;
    }
  
      next();
  });



 
//사용자 정의 모듈 추출
var indexRouter = require('./routes/index'); 
var writeRouter = require('./routes/write/write');    //글쓰기 /routes폴더 / write 폴더 / write.js
var readRouter = require('./routes/read/read');       //글읽기 /routes폴더 / read 폴더 / read.js
var loginRouter = require('./routes/login/login');        //글읽기 /routes폴더 / login 폴더 / login.js
var adminRouter = require('./routes/admin/admin');        

//session을 사용할 라우터 셋팅
app.use(indexRouter);
app.use(writeRouter);
app.use(readRouter);
app.use(loginRouter);
app.use(adminRouter);

//라우터 미들웨어를 설정한다.
app.use('/', indexRouter);
//write으로 들어오는 url 은 위의 writeRouter에서 처리
app.use('/write', writeRouter);
app.use('/read', readRouter);
app.use('/login', loginRouter);
app.use('/admin', adminRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
  });
  
  // error handler 개발 모드에서 에러 처리
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    //loger.error("error msg : " + res.locals.message);
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    //loger.error("error msg2 : " + res.locals.error);
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

var server = app.listen(3000, function(){ console.log('Server is running!'); })

loger.info("서버 작동. - index.js");
module.exports = app;