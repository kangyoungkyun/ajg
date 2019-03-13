var express = require('express');
var router = express.Router();
var crypto = require('crypto');                             //암호화 모듈
var nodemailer = require('nodemailer');                     //메일 전송 모듈
var smtpTransport = require('nodemailer-smtp-transport');   //smtp 서버를 사용하기 위한 모듈.
var loger = require('../../logmodule.js');                  //로그모듈
var client = require('../../config/mysqlconfig.js');        //mysql 모듈
loger.info("메모리 로딩 시작. - login.js");

/* 로그인 page. */
router.get('/login/login', function (req, res, next) {
  res.render('login/login');
});

/* 유저 신청 가입 page. */
router.get('/login/usersign', function (req, res, next) {
  res.render('login/usersign');
});


/* 유저 신청 가입 post action */
router.post('/login/usersignup', function (req, res, next) {

  var nickname = req.body.nickname;
  var email = req.body.email;
  var pwd = req.body.pwd;

  //이미 존재하는 닉네임인지 확인
  client.query('SELECT ?? FROM ?? WHERE ?? = ?',
  ['id', 'userTbl', 'nickname', nickname], function (err, rows, results) {

      if (err) {
        loger.error('가입할때 닉네임 중복체크 쿼리 문장에 오류가 있습니다. - login.js - /login/usersignup');
        loger.error(err);
      } else {
        if (rows.length > 0) {
          //이미 존재하는 닉네임 입니다.
          res.send({ result: 'nicknamefail', tocken: '이미 존재하는 닉네임 입니다.' });
        } else {
          //이미 존재하는 이메일인지 확인하는 쿼리!!!  
          client.query('SELECT ?? FROM ?? WHERE ?? = ?',
          ['nickname', 'userTbl', 'id', email], function (err, rows2, results) {

              if (err) {
                loger.error('가입할때 이메일 중복체크 쿼리 문장에 오류가 있습니다. - login.js - /login/usersignup');
                loger.error(err);

              } else {
                if (rows2.length > 0) {
                  //이미 존재하는 이메일 입니다.
                  res.send({ result: 'emailfail', tocken: '이미 존재하는 이메일 입니다.' });
                } else {
                        //가입할때
                        crypto.randomBytes(64, function (err, buf) {
                          crypto.pbkdf2(pwd, buf.toString('base64'), 106636, 64, 'sha512', (err, key) => {
                            //암호화된 비밀번호
                            var pwdhashkey = key.toString('base64');
                            //salt 같이 db저장
                            var salt = buf.toString('base64');

                            //mysql db에 유저 정보 넣어주기
                            client.query('insert into userTbl (nickname, id, pw, stop, stopdate,salt,auth) values (?,?,?,?,?,?,?)',
                              [nickname, email, pwdhashkey, 'n', 'n', salt,'3'],
                              function (error, result, fields) {
                                if (error) {
                                  loger.error('유저 가입시 정보 삽입 쿼리 문장에 오류가 있습니다. - login.js - /login/usersignup');
                                  loger.error(error);
                                } else {

                                  //사용자 nickname을 세션 데이터로 저장
                                  req.session.authId = email;
                                  req.session.nickname = nickname;
                                  req.session.authnum = '3';
                                  req.session.save(function () {
                                    res.send({ result: 'success', tocken: '가입을 축하합니다.' });
                                  });
                                }
                              });
                          });
                        });
                }
              }
            });
        }
      }
    });
});


/* 로그아웃  page. */
router.get('/login/logout', function (req, res, next) {
  req.session.destroy(function () {
    res.locals.whoami = undefined;
    res.locals.email = undefined;
    res.render('login/login');
  });
});


// /* 로그인 post action. */
router.post('/login/loginup', function (req, res, next) {

  var email = req.body.email;
  var pwd = req.body.pwd;

  client.query('SELECT ??, ??, ??, ??,?? FROM ?? WHERE ?? = ?',
    ['auth' ,'id','nickname', 'pw', 'salt', 'userTbl', 'id', email], function (err, rows, results) {

      if (err) {
        loger.error('로그인 쿼리 문장에 오류가 있습니다. - login.js - /login/loginup');
        loger.error(err);
      } else {
        if (rows.length > 0) {
          //아이디가 존재할 경우
          crypto.pbkdf2(pwd, rows[0].salt, 106636, 64, 'sha512', function (err, key) {
            if (key.toString('base64') === rows[0].pw) {

                      //로그인 성공 : 사용자 nickname을 세션 데이터로 저장
                      req.session.authId = rows[0].id;
                      req.session.nickname = rows[0].nickname;
                      req.session.authnum = rows[0].auth;
                      req.session.save(function () {
                        res.send({ result: 'success', tocken: '로그인 성공' });
                      });

            } else {
              //비밀번호가 틀릴경우
              res.send({ result: 'pwfail', tocken: '비밀번호를 확인해주세요.' });
              
            }
          });
        } else {
          //아이디가 존재하지 않을경우
          res.send({ result: 'idfail', tocken: '존재하지 않는 아이디입니다.' });
          
        }
      }
    });
});












// /* 이메일 인증 */
// router.get('/login/auth', function (req, res, next) {
//   var tokenstring = "jio2jkldfae";
//   var email = req.query.email;
//   var token = req.query.token;

//   //토큰이 같고
//   if (tokenstring == token) {
//     var sql = ' SELECT user.id ' +
//               'FROM userTbl as user INNER JOIN churchTbl as church ' +
//               'ON user.churchTbl_num = church.num ' +
//               'WHERE user.id = ?'
//     var param = [email];
//     client.query(sql, param, function (err, results) {
//       if (err) {
//         loger.error('교회 리스트 조회 쿼리 문장에 오류가 있습니다. - login.js - /login/auth');
//         loger.error(err);

//       } else {
//         if (results.length > 0) {

//           var userid = results[0]['id'];
//           if (email == userid) {
//             //해당 관리자 user stop을 no 업데이트 해주기
//             var sql = 'UPDATE userTbl SET stop=? WHERE id= ?';
//             var params = ['n', email];
//             client.query(sql, params, function (err, rows, fields) {
//               if (err) {
//                 loger.error('사역자 유저 stop칼럼 y -> n 업데이트 쿼리문장에 오류가 있습니다. - login.js - /login/auth');
//                 loger.error(err);
//               } else {
//                 loger.info('이메일 인증 성공:' + email + ' - login.js - /login/auth');
//                 //이메일 인증 성공
//                 res.render('login/emailauthmsg', {
//                   title: "주보사랑-인증결과",
//                   result: "인증성공",
//                   msg : "이메일 인증에 성공하셨습니다."
//                 });
//               }
//             });

//           } else {
//             loger.error('가입된 이메일과 다릅니다. 관리자에게 문의해주세요. - login.js - /login/auth');
//             res.render('login/emailauthmsg', {
//               title: '주보사랑-인증결과',
//               result: "인증실패",
//               msg : "가입된 이메일과 다릅니다. 관리자에게 문의해주세요."
//             });
//           }

//         } else {
//           loger.error('가입되어있지 않은 email 입니다. 관리자에게 문의해주세요. - login.js - /login/auth');
//           res.render('login/emailauthmsg', {
//             title: "주보사랑-인증결과",
//             result: "인증실패",
//             msg : "가입되어있지 않은 email 입니다. 관리자에게 문의해주세요."
//           });
//         }
//       }
//     });
//   }
// });

// /* 비밀번호찾기 page. */
// router.get('/login/idpwfind', function (req, res, next) {
//   res.render('login/idpwfind', {
//     title: "주보사랑-비밀번호 찾기",
//   })
// });


// /* 비밀번호찾기 post action. */
// router.post('/login/idpwfind', function (req, res, next) {

//   var email = req.body.email;
//   var selectSql = 'SELECT ??, ??,?? FROM ?? WHERE ?? = ?';
//   var selectParams = ['nickname', 'pw', 'salt', 'userTbl', 'id', email];

//   //db에서 존재하는 이메일인지 체크하고
//   client.query(selectSql, selectParams, function (err, rows, results) {
//     if (err) {
//       loger.error('비밀번호 찾기에서 기존비번 가져오는 쿼리문장에 오류가 있습니다 - login.js - /login/idpwfind');
//       loger.error(err);
//       return false;

//     } else {

//       if (rows.length > 0) {
//         //아이디가 존재할 경우
//         //숫자 + 문자 + 특수문자 새로운 비밀번호 생성하고
//         var arr = "0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,~,`,!,@,#,$,%,^,&,*,(,),-,+,|,_,=,\,[,],{,},<,>,?,/,.,;".split(",");
//         var randomPw = createCode(arr, 10);

//         //암호화 해주고 //db에 업데이트 해주기
//         crypto.randomBytes(64, function (err, buf) {
//           crypto.pbkdf2(randomPw, buf.toString('base64'), 106636, 64, 'sha512', (err, key) => {
//             //암호화된 비밀번호
//             var pwdhashkey = key.toString('base64');
//             //salt 같이 db저장
//             var salt = buf.toString('base64');

//             var sql = 'UPDATE userTbl SET pw=?, salt=? WHERE id=?';
//             var params = [pwdhashkey, salt, email];

//             //mysql db에 업데이트
//             client.query(sql, params, function (error, result, fields) {
//               if (error) {
//                 loger.error('비밀번호 찾기에서 새 비밀번호 업데이트시 쿼리 문장에 오류가 있습니다. - login.js - /login/idpwfind');
//                 loger.error(error);

//               } else {
//                 //노드메일러를 이용해서 메일보내기
//                 if (sendNewPwFunc(email, randomPw)) {
//                   loger.info('새로운 비밀번호가 성공적으로 생성되었습니다. - login.js - /login/idpwfind');
//                   res.send({ result: 'success', tocken: '새로운 비밀번호가 발송되었습니다.' });
//                 } else {
//                   loger.error('메일발송중에 오류가 발생 - login.js - /login/idpwfind');
//                   res.send({ result: 'failmailer', tocken: '죄송합니다. 메일 발송중에 오류가 발생했습니다. 관리자에게 문의해주세요.' });
//                 }
//               }
//             });
//           });
//         });
//       }
//       else {
//         //아이디가 존재하지 않을경우
//         //존재하지 않는다면 알림창 띄워주기
//         res.send({ result: 'failnotemail', tocken: '존재하지 않는 메일입니다.' });
//         return false;
//       }
//     }
//   });

// });

// //난수 생성 함수
// function createCode(objArr, iLength) {
//   var arr = objArr;
//   var randomStr = "";
//   for (var j = 0; j < iLength; j++) {
//     randomStr += arr[Math.floor(Math.random() * arr.length)];
//   }

//   return randomStr
// }

// //이메일 발송함수
// function sendNewPwFunc(email, pw) {

//   var transporter = nodemailer.createTransport(smtpTransport({
//     service: 'gmail',
//     host: 'smtp.gmail.com',
//     auth: {
//       user: 'thanksman1211@gmail.com',
//       pass: 'project100$100'
//     }
//   }));

//   var mailOptions = {
//     from: 'thanksman1211@gmail.com',
//     to: email,
//     subject: '주보사랑 새비밀번호',
//     html: '<h2>주보사랑에서 새로운 비밀번호를 보내드립니다.</h2> <h3>새비밀번호 : ' + pw + '</h3>'
//   };

//   transporter.sendMail(mailOptions, function (error, info) {
//     if (error) {
//       loger.error('새로운 비밀번호 메일 전송중 오류가 발생했습니다. login.js - sendNewPwFunc()');
//       loger.error(error);
//       return false;
//     } else {
//       loger.info("새로운 비밀번호가 발송되었습니다.");
//       loger.info('Email 발송 : ' + info.response);
//       return true;
//     }
//   });

//   return true;
// }


// //이메일 인증함수
// function sendAuthFunc(email) {
//   var transporter = nodemailer.createTransport(smtpTransport({
//     service: 'gmail',
//     host: 'smtp.gmail.com',
//     auth: {
//       user: 'thanksman1211@gmail.com',
//       pass: 'project100$100'
//     }
//   }));

//   var mailOptions = {
//     from: 'thanksman1211@gmail.com',
//     to: email,
//     subject: '주보사랑 이메일인증',
//     html: '<p>아래의 인증링크를 클릭해주세요</p>' +
//           "<a href='http://joobolove.com/login/auth?email="+ email +"&token=jio2jkldfae'>인증하기</a>" 

//   };

//   transporter.sendMail(mailOptions, function (error, info) {
//     if (error) {
//       loger.error('메일 전송중 오류가 발생했습니다. login.js - sendAuthFunc()');
//       loger.error(error);
//       return false;
//     } else {
//       loger.info("인증 메일이 발송되었습니다.");
//       loger.info('Email 발송 : ' + info.response);
      
//       return true;
//     }
//   });

//   return true;
// }


// /* 교회 이름 뿌려주기 - 유저가입시 */
// router.post('/login/showchurchList', function (req, res, next) {
//   var sql = 'SELECT churchname FROM churchTbl order by churchname asc';
//   client.query(sql, function (err, result) {

//     if (err) {
//       loger.error('교회 이름 리스트 조회 쿼리 문장에 오류가 있습니다. login.js - /login/showchurchList');
//       loger.error(err);
//     } else {
//       res.send({ result: 'success', data: result });
//     }

//   });

// });


// /* mypage */
// router.get('/login/mypage', function (req, res, next) {
//   var email = req.session.authId;     //mail or undefined
//   if (email != undefined) {
//     var sql = 'SELECT user.churchTbl_num, user.stop, user.position, church.permission ' +
//               'FROM userTbl as user INNER JOIN churchTbl as church ' +
//               'ON user.churchTbl_num = church.num ' +
//               'WHERE user.id = ?'

//     var param = [email];

//     client.query(sql, param, function (err, result) {
//       if (err) {
//         loger.error('직분, 허가비허가 조회 쿼리 문장에 오류가 있습니다. - login.js - /login/mypage');
//         loger.error(err);
//       } else {
//         var churchnum = result[0]['churchTbl_num'];
//         var stop = result[0]['stop'];
//         var position = result[0]['position'];
//         var permission = result[0]['permission'];

//         if (position == 'user') {
//           //사역자가 아닌 사람
//           //position이 user면 버튼들 완전 숨김 - 닉네임, 비밀번호, 교회변경 보이게
//           loger.error('사역자만 사용할 수 있습니다. - login.js - /login/mypage');
//           res.render('login/mypage', {
//             title: "주보사랑-마이페이지",
//             position: position,
//             permission: permission,
//             stop: stop
//           });
//         } else if (permission == 'n') {
//           //비허가면 클릭했을때 비허가 조치 되었습니다. 관리자에게 문의하세요. 
//           //사역자인데 허가가 안난사람
//           loger.error('주보 수정 비허가 상태입니다. - login.js - /login/mypage');
//           res.render('login/mypage', {
//             title: "주보사랑-마이페이지",
//             position: position,
//             permission: permission,
//             stop: stop
//           });
//         } else if (stop == 'y') {
//           //사역자이고 허가가 났지만 이메일 인증이 안된사람.
//           //이메일 인증이 안된 사람이 클릭했으면, 이메일 인증먼저 해주세요.
//           loger.error('이메일 인증이 안된 상태입니다. - login.js - /login/mypage');
//           res.render('login/mypage', {
//             title: "주보사랑-마이페이지",
//             position: position,
//             permission: permission,
//             stop: stop
//           });
//         } else {
//           //사역자이고, 허가가 났고, 이메일인증이 된사람
//           //이메일 인증이 된 사람이면 , 주보제작, 주보 리스트 보기 버튼 사용가능!  모두 활성화!
//           res.render('login/mypage', {
//             title: "주보사랑-마이페이지",
//             position: position,
//             permission: permission,
//             stop: stop
//           });
//         }
//       }
//     });

//   } else {

//     loger.error('로그인 안되어 있습니다. - login.js - /login/mypage');
//     return;
//   }

// });


module.exports = router;

loger.info("메모리 로딩 완료. - login.js");