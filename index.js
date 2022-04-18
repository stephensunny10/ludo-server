
var express = require('express');
var _ = require("lodash");
var bcrypt = require('bcryptjs');
var app = express();
var server = require('http').createServer(app);
//var io = require('socket.io').listen(server);
var io = require('socket.io')({
    transports: ['websocket'],
});

io.attach(4567);
var bodyParser = require('body-parser');
const moment = require('moment');
var MongoClient = require('mongodb').MongoClient;
//var uri = "mongodb+srv://ludofirst:kargan82@ludo.gyzkr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
var uri = "mongodb+srv://john:9UmSVdNkiT4nJRzB@cluster0.vdojp.mongodb.net/ludofirst?retryWrites=true&w=majority";
let referralCodeGenerator = require('referral-code-generator')


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.set('port', process.env.PORT || 4000);

app.get('/', function (req, res) {
	console.log(" Client connecting....");
	res.send("Hello express");
});


var pokerClients = [];
var socketInfo = {};

var totalCards = ["Ac", "Kc", "Qc", "Jc", "Tc", "9c", "8c", "7c", "6c", "5c", "4c", "3c", "2c", "Ad", "Kd", "Qd", "Jd", "Td", "9d", "8d", "7d", "6d", "5d", "4d", "3d", "2d", "Ah", "Kh",
	"Qh", "Jh", "Th", "9h", "8h", "7h", "6h", "5h", "4h", "3h", "2h", "As", "Ks", "Qs", "Js", "Ts", "9s", "8s", "7s", "6s", "5s", "4s", "3s", "2s"];
var totalCards2 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", '14', "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25",
	"26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51"];
var PLAYER_LIST = {};
var botName = ["Liam", "Noah", "William", "James", "Oliver", "Benjamin", "Lucas", "Elijah", "Mason", "Logan", "Alexander", "Ethan", "Jacob", "Michael", "Daniel", "Henry",
	"Jackson", "Sebastian", "Aiden", "Matthew", "Samuel", "David", "Joseph", "Carter", "Owen", "Wyatt", "John", "Jack", "Luke", "Jayden", "Dylan", "Grayson", "Levi",
	"Issac", "Gabriel", "Julian", "Mateo", "Anthony", "Jaxon", "Lincoln", "Joshua", "Christopher",
	"Andrew", "Theodore", "Caleb", "Ryan", "Asher", "Nathan", "Thomas", "Leo"];
var playerRoutePos1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
	27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57];
var playerRoutePos2 = [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
	0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 64, 65, 66, 67, 68, 69];
var playerRoutePos3 = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
	50, 51, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 58, 59, 60, 61, 62, 63];
var playerRoutePos4 = [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
	27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 70, 71, 72, 73, 74, 75];
var safeDice = [9, 22, 35, 48, 1, 14, 27, 40];

const mysql = require('mysql');
const pool = mysql.createPool({
	host: '162.241.123.123',
	user: 'a1608bal_ludo_user',
	password: 'H=TczXhrmPlH',
	database: 'a1608bal_ludo_db',
});

app.get("/online", function (req, res) {
	res.json(clients);
});


function myFunc(arg) {
	setTimeout(myFunc, 10, 'funky');
}

setInterval(function () {

	for (var i in socketInfo) {
		var lSocket = socketInfo[i];
		if (lSocket.socket.adapter.rooms[lSocket.room] != undefined) {
			lSocket.socket.adapter.rooms[lSocket.room].searchOne = 0;
		}
	}
	for (var i in socketInfo) {
		var lSocket = socketInfo[i];
		var socRoom = lSocket.socket.adapter.rooms[lSocket.room];
		if (socRoom != undefined) {
			if (socRoom.play == 1 && socRoom.searchOne == 0) {
				socRoom.searchOne = 1;
				socRoom.waitingCount += 1;
				if (socRoom.waitingCount == 1) {
					for (var k in socketInfo) {
						var lSocket4 = socketInfo[k];
						if (lSocket4.room == lSocket.room) {
							VerifyChips(lSocket4.email, socRoom.entryFee);
							lSocket4.socket.emit("DiceInit", { seat: (lSocket4.seat - 1) });
							lSocket4.socket.broadcast.in(lSocket4.room).emit("DiceInit", { seat: (lSocket4.seat - 1) });
						}
					}
				}
				if (socRoom.waitingCount >= 3) {
					socRoom.waitingCount = 0;
					socRoom.play = 2;
					lSocket.socket.emit("StartPlay", {
						currPlay: socRoom.currPlay
					});
					lSocket.socket.broadcast.in(lSocket.room).emit("StartPlay", {
						currPlay: socRoom.currPlay
					});
					socRoom.start_timer = moment();
				}
			} else if (socRoom.play == 22 && socRoom.searchOne == 0) {
				for (var i in socketInfo) {
					var lSocket4 = socketInfo[i];
					if (lSocket4.room == lSocket.room && socRoom.currPlay == (lSocket4.seat - 1)) {
						if (lSocket4.skip >= 3) {
							removeFunction(lSocket4.socket);
						}
					}
				}

				socRoom.searchOne = 1;
				socRoom.play = 2;
				lSocket.socket.emit("StartPlay2", {
					currPlay: socRoom.currPlay
				});
				lSocket.socket.broadcast.in(lSocket.room).emit("StartPlay2", {
					currPlay: socRoom.currPlay
				});
				getGameTimer(socRoom, lSocket);

			} else if (socRoom.play == 2 && socRoom.searchOne == 0) {
				socRoom.searchOne = 1;
				socRoom.GameTimer += 1;
				getGameTimer(socRoom, lSocket);
				if (socRoom.GameTimer >= 20) {
					for (var i in socketInfo) {
						var lSocket4 = socketInfo[i];
						if (lSocket4.room == lSocket.room && socRoom.currPlay == (lSocket4.seat - 1)) {
							ClickFunc(lSocket4, socRoom);
						}
					}
				}
			} else if (socRoom.play == 3 && socRoom.searchOne == 0) {
				socRoom.searchOne = 1;
				getGameTimer(socRoom, lSocket);
				socRoom.GameTimer += 0.5;
				if (socRoom.GameTimer >= 5) {
					for (var i in socketInfo) {
						var lSocket4 = socketInfo[i];
						if (lSocket4.room == lSocket.room && socRoom.currPlay == (lSocket4.seat - 1)) {
							socRoom.GameTimer = 0;
							if (lSocket4.diceSeatValue1 != 56 && (lSocket4.diceSeatValue1 + socRoom.currRValue) <= 56)
								lSocket4.diceSelectValue = 1;
							else if (lSocket4.diceSeatValue2 != 56 && (lSocket4.diceSeatValue2 + socRoom.currRValue) <= 56)
								lSocket4.diceSelectValue = 2;
							else if (lSocket4.diceSeatValue3 != 56 && (lSocket4.diceSeatValue3 + socRoom.currRValue) <= 56)
								lSocket4.diceSelectValue = 3;
							else if (lSocket4.diceSeatValue4 != 56 && (lSocket4.diceSeatValue4 + socRoom.currRValue) <= 56)
								lSocket4.diceSelectValue = 4;
							SelectDiceFunc(lSocket4, socRoom);
						}
					}
				}
			} else if (socRoom.play == 4 && socRoom.searchOne == 0) {
				socRoom.searchOne = 1;
				getGameTimer(socRoom, lSocket);
				socRoom.GameTimer += 1;
				if (socRoom.GameTimer == 1) {
					for (var i in socketInfo) {
						var lSocket4 = socketInfo[i];
						if (lSocket4.room == lSocket.room && socRoom.currPlay == (lSocket4.seat - 1)) {
							var lsValue = 0;
							var preValue = 0;
							/*var lPlayerRoot;
							if ((lSocket4.seat - 1) == 0)
								lPlayerRoot = playerRoutePos1;
							else if ((lSocket4.seat - 1) == 1)
								lPlayerRoot = playerRoutePos2;
							else if ((lSocket4.seat - 1) == 2)
								lPlayerRoot = playerRoutePos3;
							else if ((lSocket4.seat - 1) == 3)
								lPlayerRoot = playerRoutePos4;*/
							if (lSocket4.diceSelectValue == 1) {
								preValue = lSocket4.diceSeatValue1;
								lSocket4.diceSeatValue1 += socRoom.currRValue;
								lsValue = lSocket4.diceSeatValue1;
								if (lSocket4.diceSeatValue1 == 56)
									socRoom.DiceHome = 1;
							} else if (lSocket4.diceSelectValue == 2) {
								preValue = lSocket4.diceSeatValue2;
								lSocket4.diceSeatValue2 += socRoom.currRValue;
								lsValue = lSocket4.diceSeatValue2;
								if (lSocket4.diceSeatValue2 == 56)
									socRoom.DiceHome = 1;
							} else if (lSocket4.diceSelectValue == 3) {
								preValue = lSocket4.diceSeatValue3;
								lSocket4.diceSeatValue3 += socRoom.currRValue;
								lsValue = lSocket4.diceSeatValue3;
								if (lSocket4.diceSeatValue3 == 56)
									socRoom.DiceHome = 1;
							} else if (lSocket4.diceSelectValue == 4) {
								preValue = lSocket4.diceSeatValue4;
								lSocket4.diceSeatValue4 += socRoom.currRValue;
								lsValue = lSocket4.diceSeatValue4;
								if (lSocket4.diceSeatValue4 == 56)
									socRoom.DiceHome = 1;
							}
							var fSix = 0;
							if (lSocket4.diceSeatValue1 == 56)
								fSix += 1;
							if (lSocket4.diceSeatValue2 == 56)
								fSix += 1;
							if (lSocket4.diceSeatValue3 == 56)
								fSix += 1;
							if (lSocket4.diceSeatValue4 == 56)
								fSix += 1;
							if (fSix == 4)
								lSocket4.status = "full";


							var lScore = lSocket4.score;
							lSocket4.score += socRoom.currRValue;
							if(socRoom.DiceHome==1)
								lSocket4.score += lSocket4.score;
							
							lSocket4.socket.emit("MoveDice", {
								currPlay: socRoom.currPlay, diceSeat: lsValue, diceSelectValue: (lSocket4.diceSelectValue - 1), preValue: preValue,
								score: lSocket4.score, lScore: lScore
							});
							lSocket4.socket.broadcast.in(lSocket4.room).emit("MoveDice", {
								currPlay: socRoom.currPlay, diceSeat: lsValue, diceSelectValue: (lSocket4.diceSelectValue - 1), preValue: preValue,
								score: lSocket4.score, lScore: lScore
							});
						}
					}
				}
				if (socRoom.GameTimer == 3) {
					var oneDiceChe = true;
					for (var i in socketInfo) {
						var lSocket4 = socketInfo[i];
						if (lSocket4.room == lSocket.room && socRoom.currPlay == (lSocket4.seat - 1)) {
							var lsValue = 0;
							var preValue = 0;
							var lPlayerRoot;
							if ((lSocket4.seat - 1) == 0)
								lPlayerRoot = playerRoutePos1;
							else if ((lSocket4.seat - 1) == 1)
								lPlayerRoot = playerRoutePos2;
							else if ((lSocket4.seat - 1) == 2)
								lPlayerRoot = playerRoutePos3;
							else if ((lSocket4.seat - 1) == 3)
								lPlayerRoot = playerRoutePos4;
							if (lSocket4.diceSelectValue == 1) {
								preValue = lSocket4.diceSeatValue1;
								lsValue = lSocket4.diceSeatValue1;
							} else if (lSocket4.diceSelectValue == 2) {
								preValue = lSocket4.diceSeatValue2;
								lsValue = lSocket4.diceSeatValue2;
							} else if (lSocket4.diceSelectValue == 3) {
								preValue = lSocket4.diceSeatValue3;
								lsValue = lSocket4.diceSeatValue3;
							} else if (lSocket4.diceSelectValue == 4) {
								preValue = lSocket4.diceSeatValue4;
								lsValue = lSocket4.diceSeatValue4;
							}
							///cut cut cut cut 
							var myData = [];
							myData.push(lSocket4);
							var myData2 = [];
							myData2.push((lSocket4.diceSelectValue - 1));
							var myData3 = [];
							myData3.push(lsValue);
							for (var k in socketInfo) {
								var lSocket3 = socketInfo[k];
								if (lSocket3.room == lSocket4.room) {
									var lPlayerRoot2;
									if ((lSocket3.seat - 1) == 0)
										lPlayerRoot2 = playerRoutePos1;
									else if ((lSocket3.seat - 1) == 1)
										lPlayerRoot2 = playerRoutePos2;
									else if ((lSocket3.seat - 1) == 2)
										lPlayerRoot2 = playerRoutePos3;
									else if ((lSocket3.seat - 1) == 3)
										lPlayerRoot2 = playerRoutePos4;
									if (lPlayerRoot[lsValue] == lPlayerRoot2[lSocket3.diceSeatValue1]) {
										var ch6 = true;
										for (var j = 0; j < 8; j++)
											if (lPlayerRoot[lsValue] == safeDice[j])
												ch6 = false;
										//console.log("sssss " + lsValue + " " + lSocket3.diceSeatValue1);
										if (ch6 && lSocket3.seat != lSocket4.seat) {
											socRoom.cutDice = 1;
											var lScore = lSocket3.score;
											lSocket3.score -= lSocket3.diceSeatValue1;
											lSocket3.socket.emit("CutDice", {
												seat: (lSocket3.seat - 1), diceSeat: lSocket3.diceSeatValue1, diceSelectValue: 0,
												score: lSocket3.score, lScore: lScore
											});
											lSocket3.socket.broadcast.in(lSocket3.room).emit("CutDice", {
												seat: (lSocket3.seat - 1), diceSeat: lSocket3.diceSeatValue1, diceSelectValue: 0,
												score: lSocket3.score, lScore: lScore
											});
											lSocket3.diceSeatValue1 = 0;
										} else {
											var bChe = true;
											if (lSocket3.seat == lSocket4.seat && lSocket3.diceSelectValue == 1)
												bChe = false;
											if (bChe) {
												myData.push(lSocket3);
												myData2.push(0);
												myData3.push(lSocket3.diceSeatValue1);
											}
										}
									}
									if (lPlayerRoot[lsValue] == lPlayerRoot2[lSocket3.diceSeatValue2]) {
										var ch6 = true;
										for (var j = 0; j < 8; j++)
											if (lPlayerRoot[lsValue] == safeDice[j])
												ch6 = false;
										//console.log("sssss2 " + lsValue + " " + lSocket3.diceSeatValue2);
										if (ch6 && lSocket3.seat != lSocket4.seat) {
											socRoom.cutDice = 1;
											var lScore = lSocket3.score;
											lSocket3.score -= lSocket3.diceSeatValue2;
											lSocket3.socket.emit("CutDice", {
												seat: (lSocket3.seat - 1), diceSeat: lSocket3.diceSeatValue2, diceSelectValue: 1,
												score: lSocket3.score, lScore: lScore
											});
											lSocket3.socket.broadcast.in(lSocket3.room).emit("CutDice", {
												seat: (lSocket3.seat - 1), diceSeat: lSocket3.diceSeatValue2, diceSelectValue: 1,
												score: lSocket3.score, lScore: lScore
											});
											lSocket3.diceSeatValue2 = 0;
										} else {
											var bChe = true;
											if (lSocket3.seat == lSocket4.seat && lSocket3.diceSelectValue == 2)
												bChe = false;
											if (bChe) {
												myData.push(lSocket3);
												myData2.push(1);
												myData3.push(lSocket3.diceSeatValue2);
											}

										}
									}
									if (lPlayerRoot[lsValue] == lPlayerRoot2[lSocket3.diceSeatValue3]) {
										var ch6 = true;
										for (var j = 0; j < 8; j++)
											if (lPlayerRoot[lsValue] == safeDice[j])
												ch6 = false;
										//console.log("sssss2 " + lsValue + " " + lSocket3.diceSeatValue2);
										if (ch6 && lSocket3.seat != lSocket4.seat) {
											socRoom.cutDice = 1;
											var lScore = lSocket3.score;
											lSocket3.score -= lSocket3.diceSeatValue3;
											lSocket3.socket.emit("CutDice", {
												seat: (lSocket3.seat - 1), diceSeat: lSocket3.diceSeatValue3, diceSelectValue: 2,
												score: lSocket3.score, lScore: lScore
											});
											lSocket3.socket.broadcast.in(lSocket3.room).emit("CutDice", {
												seat: (lSocket3.seat - 1), diceSeat: lSocket3.diceSeatValue3, diceSelectValue: 2,
												score: lSocket3.score, lScore: lScore
											});
											lSocket3.diceSeatValue3 = 0;
										} else {
											var bChe = true;
											if (lSocket3.seat == lSocket4.seat && lSocket3.diceSelectValue == 3)
												bChe = false;
											if (bChe) {
												myData.push(lSocket3);
												myData2.push(2);
												myData3.push(lSocket3.diceSeatValue3);
											}
										}
									}
									if (lPlayerRoot[lsValue] == lPlayerRoot2[lSocket3.diceSeatValue4]) {
										var ch6 = true;
										for (var j = 0; j < 8; j++)
											if (lPlayerRoot[lsValue] == safeDice[j])
												ch6 = false;
										//console.log("sssss2 " + lsValue + " " + lSocket3.diceSeatValue2);
										if (ch6 && lSocket3.seat != lSocket4.seat) {
											socRoom.cutDice = 1;
											var lScore = lSocket3.score;
											lSocket3.score -= lSocket3.diceSeatValue4;
											lSocket3.socket.emit("CutDice", {
												seat: (lSocket3.seat - 1), diceSeat: lSocket3.diceSeatValue4, diceSelectValue: 3,
												score: lSocket3.score, lScore: lScore
											});
											lSocket3.socket.broadcast.in(lSocket3.room).emit("CutDice", {
												seat: (lSocket3.seat - 1), diceSeat: lSocket3.diceSeatValue4, diceSelectValue: 3,
												score: lSocket3.score, lScore: lScore
											});
											lSocket3.diceSeatValue4 = 0;
										} else {
											var bChe = true;
											if (lSocket3.seat == lSocket4.seat && lSocket3.diceSelectValue == 4)
												bChe = false;
											if (bChe) {
												myData.push(lSocket3);
												myData2.push(3);
												myData3.push(lSocket3.diceSeatValue4);
											}
										}
									}
								}
							}
							if (myData.length >= 2) {
								for (var m = 0; m < myData.length; m++) {
									myData[m].socket.emit("SplitDice", {
										seat: (myData[m].seat - 1), diceSelectValue: myData2[m], order: (m + 1), lsValue: myData3[m]
									});
									myData[m].socket.broadcast.in(myData[m].room).emit("SplitDice", {
										seat: (myData[m].seat - 1), diceSelectValue: myData2[m], order: (m + 1), lsValue: myData3[m]
									});
								}
							}
						}
					}
				}

				if (socRoom.GameTimer >= 4) {
					var ch7 = true;
					for (var i in socketInfo) {
						var lSocket4 = socketInfo[i];
						if (lSocket4.room == lSocket.room && socRoom.currPlay == (lSocket4.seat - 1) && lSocket4.status == "full") {
							socRoom.gameOverInfo.push(lSocket4);
							callGameOver(socRoom, lSocket);
							ch7 = false;
						}
					}

					var ch8 = true;
					if ((socRoom.currRValue == 6 && socRoom.con_six <= 1)) {
						socRoom.con_six += 1;
						socRoom.GameTimer = 0;
						socRoom.play = 22;
						ch8 = false;
					} else if (socRoom.cutDice == 1) {
						socRoom.GameTimer = 0;
						socRoom.play = 22;
						socRoom.cutDice = 0;
						socRoom.con_six = 0;
						ch8 = false;
					} else if (socRoom.DiceHome == 1 && ch7) {
						socRoom.DiceHome = 0;
						socRoom.GameTimer = 0;
						socRoom.play = 22;
						socRoom.con_six = 0;
						ch8 = false;
					}

					if (ch8) {
						lSocket.socket.emit("PlayerEnd", {
							currPlay: socRoom.currPlay
						});
						lSocket.socket.broadcast.in(lSocket.room).emit("PlayerEnd", {
							currPlay: socRoom.currPlay
						});
						Find_NextPlayer(socRoom, lSocket);
						socRoom.GameTimer = 0;
						socRoom.play = 5;
						socRoom.DiceHome = 0;
						socRoom.cutDice = 0;
					}
				}

			} else if (socRoom.play == 5 && socRoom.searchOne == 0) {
				socRoom.searchOne = 1;
				getGameTimer(socRoom, lSocket);
				socRoom.GameTimer += 1;
				if (socRoom.GameTimer >= 1) {
					socRoom.GameTimer = 0;
					socRoom.play = 22;
				}
			} else if (socRoom.play == 6 && socRoom.searchOne == 0) {
				socRoom.searchOne = 1;
				for (var i in socketInfo) {
					var lSocket4 = socketInfo[i];
					if (lSocket4.room == lSocket.room) {
						//console.log("removed user");
						//delete socketInfo[lSocket4.localSocketId];
					}
				}
			}
		}
	}

}, 500);
function callGameOver(socRoom, lSocket2) {
	var lValue = 0;
	if (socRoom.player_count == 2)
		lValue = 1;
	else if (socRoom.player_count == 3)
		lValue = 2;
	else if (socRoom.player_count == 4)
		lValue = 3;

	if (socRoom.gameOverInfo.length == lValue) {
		for (var k in socketInfo) {
			var lSocket = socketInfo[k];
			if (lSocket2.room == lSocket.room && lSocket.status != "out" && lSocket.status != "full")
				socRoom.gameOverInfo.push(lSocket);
		}
	} else if (socRoom.gameOverInfo.length == 0) {
		for (var k in socketInfo) {
			var lSocket = socketInfo[k];
			if (lSocket2.room == lSocket.room && lSocket.status == "over")
				socRoom.gameOverInfo.push(lSocket);
		}
	}
	//console.log("3game " + lValue + " " + socRoom.gameOverInfo.length);
	if (socRoom.gameOverInfo.length == socRoom.player_count) {
		var points = [];
		for (var i = 0; i < socRoom.gameOverInfo.length; i++) {
			points.push(socRoom.gameOverInfo[i].score);
		}
		points.sort(function (a, b) { return b - a });
		for (var i = 0; i < points.length; i++) {
			for (var j = 0; j < socRoom.gameOverInfo.length; j++) {
				if (socRoom.gameOverInfo[j].score == points[i]) {
					var sStr;
					if (i == 0)
						sStr = socRoom.prize1;
					else if (i == 1)
						sStr = socRoom.prize2;
					else if (i == 2)
						sStr = socRoom.prize3;
					else if (i == 3)
						sStr = 0;
					if (socRoom.gameOverInfo[j].status == "out")
						sStr = "out";
					if (sStr != "out" && sStr != 0) {
						VerifyCash(socRoom.gameOverInfo[j].email, sStr);
					}
					console.log("name : " + socRoom.gameOverInfo[j].seat);
					socRoom.gameOverInfo[j].socket.emit("GameOverDetail", {
						seat: (socRoom.gameOverInfo[j].seat - 1), name: socRoom.gameOverInfo[j].name, score: sStr
					});
					socRoom.gameOverInfo[j].socket.broadcast.in(socRoom.gameOverInfo[j].room).emit("GameOverDetail", {
						seat: (socRoom.gameOverInfo[j].seat - 1), name: socRoom.gameOverInfo[j].name, score: sStr
					});
				}
			}
			for (var j = 0; j < socRoom.gameOverInfo.length; j++) {
				if (socRoom.gameOverInfo[j].score == points[i]) {
					console.log("over : " + socRoom.gameOverInfo[j].seat);
					socRoom.gameOverInfo[j].socket.emit("GameOver", {
					});
					socRoom.gameOverInfo[j].socket.broadcast.in(socRoom.gameOverInfo[j].room).emit("GameOver", {
					});
				}
			}

		}

		for (var j = 0; j < socRoom.gameOverInfo.length; j++) {
			socRoom.gameOverInfo[j].active = false;
			socRoom.gameOverInfo[j].socket.leave(socRoom.gameOverInfo[j].room);
		}
		socRoom.gameover = 1;
		socRoom.play = 6;
	}


}
function ClickFunc(lSocket, socRoom) {
	var cChe = false;
	var cEnableChe = "";
	if (socRoom.GameTimer >= 20) {
		lSocket.skip += 1;
		cEnableChe = "yes";
		cChe = true;
	}
	socRoom.GameTimer = 20;
	var rIndex = Math.floor(Math.random() * 6);
	rIndex += 1;
	//rIndex = 3;
	socRoom.currRValue = rIndex;
	socRoom.play = 3;
	if (cChe)
		socRoom.GameTimer = 20;
	else socRoom.GameTimer = 0;
	var ch7 = true;
	if ((lSocket.diceSeatValue1 + socRoom.currRValue) <= 56)
		ch7 = false;
	if ((lSocket.diceSeatValue2 + socRoom.currRValue) <= 56)
		ch7 = false;
	if ((lSocket.diceSeatValue3 + socRoom.currRValue) <= 56)
		ch7 = false;
	if ((lSocket.diceSeatValue4 + socRoom.currRValue) <= 56)
		ch7 = false;

	lSocket.socket.emit("CLICKOUT", {
		currPlay: socRoom.currPlay, diceRValue: rIndex,
		value1: lSocket.diceSeatValue1,
		value2: lSocket.diceSeatValue2,
		value3: lSocket.diceSeatValue3,
		value4: lSocket.diceSeatValue4,
		skip: lSocket.skip,
		cEnableChe: cEnableChe
	});
	lSocket.socket.broadcast.in(lSocket.room).emit("CLICKOUT", {
		currPlay: socRoom.currPlay, diceRValue: rIndex,
		value1: lSocket.diceSeatValue1,
		value2: lSocket.diceSeatValue2,
		value3: lSocket.diceSeatValue3,
		value4: lSocket.diceSeatValue4,
		skip: lSocket.skip,
		cEnableChe: cEnableChe
	});
	if (ch7) {
		Find_NextPlayer(socRoom, lSocket);
		socRoom.GameTimer = 0;
		socRoom.play = 5;
	}
}
function SelectDiceFunc(lSocket, socRoom) {
	socRoom.play = 4;
	socRoom.GameTimer = 0;
	lSocket.socket.emit("SelectDiceEnd", { currPlay: socRoom.currPlay });
	lSocket.socket.broadcast.in(lSocket.room).emit("SelectDiceEnd", { currPlay: socRoom.currPlay });
}

function Find_NextPlayer(socRoom, lSocket2) {
	var localCPlay = socRoom.currPlay;
	var eChe = true;
	var releaseCount = 0;
	while (eChe) {
		socRoom.currPlay += 1;
		if (socRoom.currPlay >= 4)
			socRoom.currPlay = 0;
		for (var k in socketInfo) {
			var lSocket4 = socketInfo[k];
			if (socRoom.currPlay == (lSocket4.seat - 1) && lSocket2.room == lSocket4.room &&
				localCPlay != socRoom.currPlay && lSocket4.status != "full") {
				eChe = false;
				socRoom.con_six = 0;
			}
		}
		releaseCount += 1;
		if (releaseCount >= 5)
			eChe = false;

	}
}


function getGameTimer(socRoom, lSocket) {
	var now = moment();
	var start = socRoom.start_timer;
	var config = "DD/MM/YYYY HH:mm:ss";
	var ms = moment(now, config).diff(moment(start, config));
	var cMinutes = moment.utc(ms).format("mm:ss");
	lSocket.socket.emit("tTimer", {
		tTimer: cMinutes
	});
	lSocket.socket.broadcast.in(lSocket.room).emit("tTimer", {
		tTimer: cMinutes
	});
	if (moment.utc(ms).format("mm") >= 10) {
		for (var k in socketInfo) {
			var lSocket2 = socketInfo[k];
			if (lSocket2.room == lSocket.room && lSocket2.status == "") {
				lSocket2.status = "over";
			}
		}
		callGameOver(socRoom, lSocket);
	}
}

function removeFunction(socket2) {
	var lSocket = socketInfo[socket2.id];
	console.log("call");
	if (lSocket != undefined) {
		var pCount = 0;
		for (var k in socketInfo) {
			var lSocket = socketInfo[k];
			if (socketInfo[socket2.id].room == lSocket.room && lSocket.socket.id != socket2.id)
				pCount += 1;
		}
		if (pCount >= 1) {
			var socRoom = socket2.adapter.rooms[socketInfo[socket2.id].room];
			if (socRoom != undefined) {
				if (socRoom.gameover == 0) {
					console.log("rremove user" + socketInfo[socket2.id].seat);
					socketInfo[socket2.id].status = "out";
					socketInfo[socket2.id].score = -1;
					socRoom.gameOverInfo.push(socketInfo[socket2.id]);

					socketInfo[socket2.id].socket.emit("PlayerEnd", { currPlay: socRoom.currPlay });
					socketInfo[socket2.id].socket.broadcast.in(socketInfo[socket2.id].room).emit("PlayerEnd", { currPlay: socRoom.currPlay });
					Find_NextPlayer(socRoom, socketInfo[socket2.id]);
					socRoom.GameTimer = 0;
					socRoom.play = 5;
					callGameOver(socRoom, socketInfo[socket2.id]);
				}
			}
		}

		for (var k in socketInfo) {
			var lSocket = socketInfo[k];
			if (lSocket.socket.id == socket2.id) {
				lSocket.active = false;
				//delete socketInfo[lSocket.localSocketId];
			}
		}
	}
}

io.on('connection', function (socket) {


	/*const today = moment();
	var now  = "26/02/2014 10:31:30";
var then = "25/02/2014 10:20:30";

var config = "DD/MM/YYYY HH:mm:ss";
var ms = moment(now, config).diff(moment(then,config));
var d = moment.duration(ms);
var s =  moment.utc(ms).format("mm:ss");
console.log(s); */

	/*var points = [40, 100,];
	points.push(2);
	points.sort(function (a, b) { return b - a });
	//console.log(points+" "+points.length);*/

	/*const array = [2, 5, 9];
	console.log(array);
	const index = array.indexOf(5);
	if (index > -1) {
		array.splice(index, 1);
	}
	console.log(array);*/


	console.log("server connected");
	socket.on("StartGame", function () {
		socket.emit("Server_Started", {});

	});

	socket.on("Room", function (data) {
		var alreadyPlay = false;
		if (alreadyPlay) {
			//socket.emit("AlreadyPlay", {});
		} else {
			var ch2 = true;
			var chEnter = true;
			var roomStart;
			var roomEnd;
			console.log("ro " + data.room);
			if (data.play_friends == "yes") {
				roomStart = parseInt(data.room);
				roomEnd = parseInt(data.room);
				var soRoom = socket.adapter.rooms[data.room];
				if (data.join == "yes") {
					if (soRoom == undefined) {
						chEnter = false;
						console.log("ro " + data.room);
						socket.emit("RoomNotAvailable", { status: "no" });
					} else {
						socket.emit("RoomNotAvailable", { status: "yes" });
					}
				}

			} else {
				if (parseInt(data.player_count) == 2) {
					roomStart = 2000001;
					roomEnd = 3000000;
				} else if (parseInt(data.player_count) == 3) {
					roomStart = 3000001;
					roomEnd = 4000000;
				} else if (parseInt(data.player_count) == 4) {
					roomStart = 4000001;
					roomEnd = 5000000;
				}
			}

			if (chEnter) {
				for (var i = roomStart; i <= roomEnd && ch2; i++) {
					var roomSocket = io.sockets.adapter.rooms[i + ""];
					if (roomSocket == undefined) {
						socket.join(i + "");
						console.log("roomid " + i + " " + roomStart + " " + roomEnd);
						socket.emit("RoomConnected", { room: parseInt(i + "") });
						socket.adapter.rooms[i + ""].currPlay = 0;
						socket.adapter.rooms[i + ""].play = 0;
						socket.adapter.rooms[i + ""].searchOne = 0;
						socket.adapter.rooms[i + ""].waitingCount = 0;
						socket.adapter.rooms[i + ""].player_count = parseInt(data.player_count);
						socket.adapter.rooms[i + ""].GameTimer = 0;
						socket.adapter.rooms[i + ""].winCount = 0;
						socket.adapter.rooms[i + ""].currRValue = 0;
						socket.adapter.rooms[i + ""].con_six = 0;
						socket.adapter.rooms[i + ""].gameover = 0;
						socket.adapter.rooms[i + ""].tTimer = 0;
						socket.adapter.rooms[i + ""].start_timer;
						socket.adapter.rooms[i + ""].gameOverInfo = [];
						socket.adapter.rooms[i + ""].prize1 = parseInt(data.prize1);
						socket.adapter.rooms[i + ""].prize2 = parseInt(data.prize2);
						socket.adapter.rooms[i + ""].prize3 = parseInt(data.prize3);
						socket.adapter.rooms[i + ""].entryFee = parseInt(data.entry);
						socket.adapter.rooms[i + ""].cutDice = 0;
						socket.adapter.rooms[i + ""].DiceHome = 0;
						ch2 = false;
					} else {
						if (roomSocket.length < parseInt(data.player_count)) {
							console.log("roomid2 " + i + " " + roomStart + " " + roomEnd);
							socket.join(i + "");
							socket.emit("RoomConnected", { room: parseInt(i) });
							ch2 = false;
						}
					}

				}
			}
		}
	});

	socket.on("PlayerJoin", function (data) {
		var soRoom = socket.adapter.rooms[data.room];
		for (var j = 0; j < 1; j++) {
			var socId;
			if (j == 0)
				socId = socket.id;
			else if (j == 1 || j == 2)
				socId = socket.id + j;
			socketInfo[socId] = [];
			socketInfo[socId].socket = socket;

			socketInfo[socId].name = data.name;
			socketInfo[socId].email = data.email;
			socketInfo[socId].points = parseInt(data.points);
			socketInfo[socId].room = data.room;
			socketInfo[socId].localSocketId = socId;
			socketInfo[socId].win = 0;
			socketInfo[socId].commission = parseInt(data.commission);
			socketInfo[socId].removePlayer = 0;
			socketInfo[socId].entryPoint = parseInt(data.entryPoint);
			socketInfo[socId].winPoint = parseInt(data.winPoint);

			socketInfo[socId].diceSeatValue1 = 0;
			socketInfo[socId].diceSeatValue2 = 0;
			socketInfo[socId].diceSeatValue3 = 0;
			socketInfo[socId].diceSeatValue4 = 0;
			socketInfo[socId].diceSelectValue = 0;
			socketInfo[socId].score = 0;
			socketInfo[socId].status = "";
			socketInfo[socId].skip = 0;
			socketInfo[socId].active = true;


			if (soRoom.play >= 1)
				socketInfo[socId].wait = 1;
			else
				socketInfo[socId].wait = 0;

			var ch2 = true;
			let floop;
			if (soRoom.player_count == 2)
				floop = [1, 2];
			else if (soRoom.player_count == 3)
				floop = [1, 2, 3];
			else if (soRoom.player_count == 4)
				floop = [1, 2, 3, 4];
			for (let i of floop) {
				if (ch2) {
					var seatAvailable = false;
					for (var k in socketInfo) {
						var lSocket = socketInfo[k];
						if (i == lSocket.seat && data.room == lSocket.room)
							seatAvailable = true;
					}
					if (!seatAvailable) {
						ch2 = false;
						socketInfo[socId].seat = i;
					}
				}
			}
			if (socketInfo[socId].seat == 2) {
				//socketInfo[socId].diceSeatValue1 = 29;
				//socketInfo[socId].diceSeatValue2 = 29;
			}

			//console.log("seat " + (socketInfo[socId].seat - 1) + " " + socketInfo[socId].room + " " + soRoom.player_count);
			for (var k in socketInfo) {
				var lSocket = socketInfo[k];
				if (lSocket.active == true) {
					lSocket.socket.emit("PlayerJoin", {
						seat: (lSocket.seat - 1),
						name: lSocket.name,
						points: lSocket.points,
						wait: lSocket.wait
					});
					lSocket.socket.broadcast.in(lSocket.room).emit("PlayerJoin", {
						seat: (lSocket.seat - 1),
						name: lSocket.name,
						points: lSocket.points,
						wait: lSocket.wait
					});
				}
			}
		}
		socket.emit("YOU", { seat: (socketInfo[socket.id].seat - 1), wait: socketInfo[socket.id].wait });
		if (socketInfo[socket.id].wait == 1) {
			for (var k in socketInfo) {
				var lSocket4 = socketInfo[k];
				if (lSocket4.room == data.room) {
					socket.emit("WatchPlayerJoin", {
						seat: (lSocket4.seat - 1),
						name: lSocket4.name,
						points: lSocket4.points,
						wait: lSocket4.wait
					});
				}
			}
		}
		if (socket.adapter.rooms[data.room].play == 0 && soRoom.length >= soRoom.player_count)
			socket.adapter.rooms[data.room].play = 1;

	});
	socket.on("CLICK", function () {
		var socRoom = socket.adapter.rooms[socketInfo[socket.id].room];
		var lSocket = socketInfo[socket.id];
		ClickFunc(lSocket, socRoom);

	});
	socket.on("SelectDice", function (data) {
		var socRoom = socket.adapter.rooms[socketInfo[socket.id].room];
		var lSocket = socketInfo[socket.id];
		lSocket.diceSelectValue = parseInt(data.select_dice);
		SelectDiceFunc(lSocket, socRoom);
	});

	socket.on("UserRegister", function (data) {
		RegisterMySql(data, socket);
	});
	socket.on("VerifyUser", function (data) {
		VerifyUserMongoDB(data, socket);
	});
	socket.on("Withdraw", function (data) {
		WithdrawMongoDB(socket, data);
	});
	socket.on("UpdateChips", function (data) {
		Updated_Chips(socketInfo[socket.id].email, parseInt(data.points));

	});

	socket.on("ProfileEdit", function (data) {
		ProfileUpdate(socket, data.email, data.profile_edit, data.profile_edit_str);
	});
	socket.on("UpdateCash", function (data) {
		var poValue = parseInt(data.winPoint);
		var perc = (poValue / 100.0);
		var comm = perc * (100 - socketInfo[socket.id].commission);
		socketInfo[socket.id].cash += comm;
		var comm2 = perc * socketInfo[socket.id].commission;
		InsertCommission(socketInfo[socket.id], comm2);
		//Updated_Cash(socketInfo[socket.id], socketInfo[socket.id].email, comm);
		socket.emit("UpdateCash", {
			seat: (socketInfo[socket.id].seat - 1),
			points: comm
		});
	});
	socket.on("ReferCommission", function (data) {
		ReferCommission(data, socket);
	});
	socket.on("CreateTable", function (data) {
		PrivateTable(socket, data);
	});
	socket.on("JoinPrivateRoom", function (data) {
		JoinRoom(socket, data);
	});
	socket.on("GetDocuments", function (data) {
		GetAllDocumentMongoDB(data, socket);
	});
	socket.on("GetPrivate", function (data) {
		GetPrivateTable(data, socket);
	});
	socket.on("GetChipsAndCash", function (data) {
		GetChipsAndCash(data, socket);
	});
	socket.on("RemoveUser", function (data) {
		removeFunction(socket);
		/*var lSocket = socketInfo[socket.id];
		console.log("call");
		if (lSocket != undefined) {
			var pCount = 0;
			for (var k in socketInfo) {
				var lSocket = socketInfo[k];
				if (socketInfo[socket.id].room == lSocket.room && lSocket.socket.id != socket.id)
					pCount += 1;
			}
			if (pCount >= 1) {
				var socRoom = socket.adapter.rooms[socketInfo[socket.id].room];
				if (socRoom != undefined) {
					if (socRoom.gameover == 0) {
						console.log("remove user" + socketInfo[socket.id].seat);
						socketInfo[socket.id].status = "out";
						socketInfo[socket.id].score = -1;
						socRoom.gameOverInfo.push(socketInfo[socket.id]);

						socketInfo[socket.id].socket.emit("PlayerEnd", { currPlay: socRoom.currPlay });
						socketInfo[socket.id].socket.broadcast.in(socketInfo[socket.id].room).emit("PlayerEnd", { currPlay: socRoom.currPlay });
						Find_NextPlayer(socRoom, socketInfo[socket.id]);
						socRoom.GameTimer = 0;
						socRoom.play = 5;
						callGameOver(socRoom, socketInfo[socket.id]);
					}
				}
			}

			for (var k in socketInfo) {
				var lSocket = socketInfo[k];
				if (lSocket.socket.id == socket.id) {
					lSocket.active = false;
					//delete socketInfo[lSocket.localSocketId];
				}
			}
		}*/
	});

	socket.on("CheckInternet", function (data) {
		var lSocket = socketInfo[socket.id];
		if (lSocket != undefined)
			lSocket.cheInternet = "quit";
	});
	socket.on("CheckInternet2", function (data) {
		var lSocket = socketInfo[socket.id];
		if (lSocket != undefined)
			lSocket.cheInternet = "";
	});
	socket.on("disconnect", function () {
		console.log("dis_remove user" + socket.id);
		/*var pCount = 0;
		for (var k in socketInfo) {
			var lSocket = socketInfo[k];
			if (socketInfo[socket.id] != undefined)
				if (socketInfo[socket.id].room == lSocket.room && lSocket.socket.id != socket.id)
					pCount += 1;
		}

		if (pCount >= 1) {
			var socRoom = socket.adapter.rooms[socketInfo[socket.id].room];
			if (socRoom.gameover == 0) {
				console.log("remove user" + socketInfo[socket.id].seat);
				socketInfo[socket.id].status = "out";
				socketInfo[socket.id].score = -1;
				socRoom.gameOverInfo.push(socketInfo[socket.id]);

				socketInfo[socket.id].socket.emit("PlayerEnd", { currPlay: socRoom.currPlay });
				socketInfo[socket.id].socket.broadcast.in(socketInfo[socket.id].room).emit("PlayerEnd", { currPlay: socRoom.currPlay });
				Find_NextPlayer(socRoom, socketInfo[socket.id]);
				socRoom.GameTimer = 0;
				socRoom.play = 5;

				callGameOver(socRoom, socketInfo[socket.id]);
			}
		}*/

		for (var k in socketInfo) {
			var lSocket = socketInfo[k];
			if (lSocket.socket.id == socket.id) {
				delete socketInfo[lSocket.localSocketId];
			}
		}
	});
});

function RegisterMySql(data, lSocket) {
	MongoClient.connect(uri, function (err, db) {
		var dbo = db.db("ludofirst");
		var query = { email: data.email };
		dbo.collection("player").find(query).toArray(function (err, result) {
			if (err) {
			} else {
				console.log("available user" + result.length);
				if (result.length == 0) {
					RegisterMySql2(data, lSocket);
				} else {
					//lSocket.emit("AlreadyRegisterd", {});
				}
			}
			db.close();
		});
	});
}
function RegisterMySql2(data, lSocket) {
	MongoClient.connect(uri, function (err, db) {
		var today = new Date();
		var pWord = bcrypt.hashSync(data.password, bcrypt.genSaltSync(8), null);
		var myobj = {
			firstname: data.name,
			username: data.username,
			email: data.email,
			password: pWord,
			mobile: data.mobile,
			chips: 1000,
			cash: 0,
			appId: "",
			lastname: "",
			isFbLogin: false,
			emailverified: false,
			emailme: false,
			status: "active",
			clubStatus: "",
			clubStatusValidTill: "",
			sessionId: "",
			socketId: "",
			bankName: "",
			accountNumber: "",
			accountHolderName: "",
			ifscCode: "",
			rating: 0,
			mobilelverified: false,
			tdsAmount: "0",
			updatedAt: today,
			createdAt: today,
			deviceId: "abcd",
			profilePic: "default.png",
			cashTransaction: "0",
			rewardPoint: 0,
			mobile: "9894483629",
			otp: 0,
		};
		var dbo = db.db("ludofirst");
		dbo.collection("player").insertOne(myobj, function (err, res) {
			if (err) {
			} else {
				VerifyUserMongoDB(data, lSocket);
			}

			console.log("1 document inserted");
			db.close();
		});
	});
}
function VerifyUserMongoDB(data, lSocket) {
	MongoClient.connect(uri, function (err, db) {
		var pWord = bcrypt.hashSync(data.password, bcrypt.genSaltSync(8), null);
		var dbo = db.db("ludofirst");
		//console.log(data.email + " " + data.password);
		var query = { email: data.email };
		dbo.collection("player").find(query).toArray(function (err, result) {
			if (err) {
				lSocket.emit("VerifyUser", { email: data.email, status: "no" });
			} else {
				if (result.length != 0) {
					const ppp = bcrypt.compareSync(data.password, result[0].password);
					if (ppp) {
						lSocket.emit("VerifyUser", {
							_id: result[0]._id, name: result[0].name, username: result[0].username, email: result[0].email, chips: result[0].chips,
							password: data.password, cash: result[0].cash, mobile: result[0].mobile, accountNumber: result[0].accountNumber, status: "yes",
							accountHolderName: result[0].accountHolderName, bankName: result[0].bankName, ifscCode: result[0].ifscCode,
						});
						//GetSettingsMongoDB(lSocket);
					} else {
						lSocket.emit("VerifyUser", { email: data.email, status: "no" });
					}
				} else {
					lSocket.emit("VerifyUser", { email: data.email, status: "no" });
				}
			}
			//console.log(result);
			db.close();
		});
	});
}


function GetCommission(lSocket) {
	pool.query("SELECT * FROM settings", function (err, result, fields) {
		lSocket.emit("Settings", {
			commission: result[0].conversion_rate, bonusRate: result[0].currency, private_price: result[0].question_time,
			upgrade_url: result[0].completed_option
		});
	});
}
function WithdrawMongoDB(lSocket, data) {
	MongoClient.connect(uri, function (err, db) {
		var dbo = db.db("ludofirst");
		var today = new Date();
		var myobj = { playerId: data._id, amount: data.withdrawAmt, status: "Pending" };
		dbo.collection("withdrawHistory").insertOne(myobj, function (err, res) {
			if (!err) {
				WithdrawVerifyCash(data.email, data.withdrawAmt, data, lSocket);
				lSocket.emit("Withdraw", { status: "success" });
				console.log(res);
			} else {
				lSocket.emit("Withdraw", { status: "failed" });
			}
			console.log("1 document inserted");
			db.close();
		});
	});
}

function WithdrawVerifyCash(email, user_cash, data, lSocket) {
	MongoClient.connect(uri, function (err, db) {
		if (err)
			console.log("not connected ");
		var dbo = db.db("ludofirst");
		var query = { email: email };
		dbo.collection("player").find(query).toArray(function (err, result) {
			if (err) {
			} else {
				if (result.length != 0) {
					var chValue = parseInt(result[0].cash, 10);
					chValue -= parseInt(user_cash, 10);
					console.log("cash " + result[0].email + " " + chValue);
					WithdrawUpdated_Cash(result[0].email, chValue, data, lSocket);
				}
			}
			//console.log(result);
			db.close();
		});
	});
}
function WithdrawUpdated_Cash(email, cash, data, lSocket) {
	MongoClient.connect(uri, function (err, db) {
		var dbo = db.db("ludofirst");
		var myquery = { email: email };
		var newvalues = { $set: { cash: cash } };
		dbo.collection("player").updateOne(myquery, newvalues, function (error, result) {
			if (error) {
				console.log("error update document");
			} else {
				GetChipsAndCash(data, lSocket);
				console.log("update success");
			}
			db.close();
		});
	});
}
function VerifyChips(email, user_chips) {
	MongoClient.connect(uri, function (err, db) {
		if (err)
			console.log("not connected ");
		var dbo = db.db("ludofirst");
		var query = { email: email };
		dbo.collection("player").find(query).toArray(function (err, result) {
			if (err) {
			} else {
				if (result.length != 0) {
					var chValue = parseInt(result[0].chips, 10);
					chValue += parseInt(user_chips, 10);
					//console.log("chips " + result[0].email + " " + chValue);
					Updated_Chips(result[0].email, chValue);
				}
			}
			db.close();
		});
	});
}
function Updated_Chips(email, chips) {
	MongoClient.connect(uri, function (err, db) {
		var dbo = db.db("ludofirst");
		var myquery = { email: email };
		var newvalues = { $set: { chips: chips } };
		dbo.collection("player").updateOne(myquery, newvalues, function (error, result) {
			if (error) {
				console.log("error update document");
			} else {
				//console.log("update success");
			}
			db.close();
		});
	});
}
function VerifyCash(email, user_cash) {
	MongoClient.connect(uri, function (err, db) {
		if (err)
			console.log("not connected ");
		var dbo = db.db("ludofirst");
		var query = { email: email };
		dbo.collection("player").find(query).toArray(function (err, result) {
			if (err) {
			} else {
				if (result.length != 0) {
					var chValue = parseInt(result[0].cash, 10);
					chValue += parseInt(user_cash, 10);
					//console.log("cash " + result[0].email + " " + chValue);
					Updated_Cash(result[0].email, chValue);
				}
			}
			//console.log(result);
			db.close();
		});
	});
}
function Updated_Cash(email, cash) {
	MongoClient.connect(uri, function (err, db) {
		var dbo = db.db("ludofirst");
		var myquery = { email: email };
		var newvalues = { $set: { cash: cash } };
		dbo.collection("player").updateOne(myquery, newvalues, function (error, result) {
			if (error) {
				console.log("error update document");
			} else {
				//console.log("update success");
			}
			db.close();
		});
	});
}

function GetChipsAndCash(data, lSocket) {
	MongoClient.connect(uri, function (err, db) {
		var dbo = db.db("ludofirst");
		var query = { email: data.email };
		dbo.collection("player").find(query).toArray(function (err, result) {
			if (err) {
			} else {
				if (result.length != 0) {
					console.log("cc " + result[0].cash);
					lSocket.emit("GetChipsAndCash", {
						chips: result[0].chips, cash: result[0].cash
					});
				}
			}
			db.close();
		});
	});
}

function ProfileUpdate(lSocket, email, edit, pStr) {
	MongoClient.connect(uri, function (err, db) {
		var dbo = db.db("ludofirst");
		var myquery = { email: email };

		var newvalues = { $set: { mobile: pStr } };
		if (edit == "MobileEdit") {
			newvalues = { $set: { mobile: pStr } };
		} else if (edit == "ANameEdit") {
			newvalues = { $set: { accountHolderName: pStr } };
			console.log("edit " + edit + " " + pStr);
		} else if (edit == "BankNameEdit")
			newvalues = { $set: { bankName: pStr } };
		else if (edit == "AccNumEdit")
			newvalues = { $set: { accountNumber: pStr } };
		else if (edit == "IfscEdit")
			newvalues = { $set: { ifscCode: pStr } };

		dbo.collection("player").updateOne(myquery, newvalues, function (error, result) {
			if (error) {
				console.log("error update document");
			} else {
				console.log("update success");
				lSocket.emit("ProfileEdit", {
					pStr: pStr, edit: edit

				});
			}
			db.close();
		});
	});
}

function ReferCommission(data, lSocket) {
	var sql = 'SELECT * FROM categories WHERE referby_friends = ?';
	pool.query(sql, [data.referby_friends], function (error, result, fields) {
		for (var i in result) {
			if (result[i].referby_friends == data.referby_friends) {
				var pCount = result[i].cash;
				pCount += parseInt(data.commission);
				ReferCommission2(pCount, data, lSocket);
			}
		}
	});
}
function ReferCommission2(cashPlusCommission, data, lSocket) {
	var sql = "UPDATE categories set cash = ? WHERE referral_code = ?";
	pool.query(sql, [cashPlusCommission, data.referby_friends], function (err, result) {
		if (!err) {
			lSocket.emit("CommissionSuccess", {});
		}
	});
}
function InsertCommission(lSocket, comm) {
	var today = new Date();
	var post = {
		method: lSocket.username, commission: comm, game_name: "Ludo",
		created_At: today, updated_at: today
	};
	pool.query('INSERT INTO payment_methods SET ?', post, function (error, result, fields) {
		if (error) {
		} else {
		}
	});
}

function GetAllDocumentMongoDB(data, lSocket) {
	MongoClient.connect(uri, function (err, db) {
		var empty = 0;
		if (err)
			console.log("not connected ");
		var dbo = db.db("ludofirst");
		dbo.collection("gameSettings").find({}).toArray(function (err, result) {
			if (err) {
			}
			for (var i = 0; i < result.length; i++) {
				lSocket.emit("GetDocuments", {
					id: result[i]._id, points: result[i].points, players: result[i].players, firstprize: result[i].firstprize,
					secondprize: result[i].secondprize, thirdprize: result[i].thirdprize, status: "yes"
				});
				empty = 1;
			}
			//console.log(result);
			db.close();
			if (empty == 0) {
				lSocket.emit("GetDocuments", { status: "no" });
			}
		});
	});
}

function GetPrivateTable(data, lSocket) {
	var sql = 'SELECT * FROM private_table WHERE email = ?';
	pool.query(sql, [data.email], function (error, result, fields) {
		var empty = 0;
		for (var i = 0; i < result.length; i++) {
			if (result[i].table_player == "2" || result[i].table_player == "4") {
				var roomCount = io.sockets.adapter.rooms[result[i].id];
				lSocket.emit("GetDocuments", {
					id: result[i].room_id, BootValue: result[i].boot_value, MaxBlind: result[i].max_blind,
					tablename: result[i].room_id, tableType: result[i].table_player, status: "yes"
				});
				empty = 1;
			}
		}
		if (empty == 0) {
			lSocket.emit("GetDocuments", { status: "no" });
		}
	});
}
function PrivateTable(lSocket, data) {
	var today = new Date();
	var rValue = Math.floor(Math.random() * 90000);
	rValue += 10000;
	var post = {
		room_id: rValue, email: data.email, table_name: "private", boot_value: parseInt(data.BootAmt), max_blind: parseInt(data.MaxBlind), table_player: data.tableType,
		created_At: today
	};
	pool.query('INSERT INTO private_table SET ?', post, function (error, result, fields) {
		if (error) {

		} else {
			lSocket.emit("CreateTable", { room_id: rValue });
			Updated_Chips(data.email, parseInt(data.ptprice));
		}
	});
}
function JoinRoom(lSocket, data) {
	var sql = 'SELECT * FROM private_table WHERE room_id = ?';
	pool.query(sql, [data.room_id], function (error, result, fields) {
		if (error) {
			//console.log("avai 1");
			lSocket.emit("JoinPrivateRoom", { status: "no" });
		} else {
			//console.log("avai 2");
			for (var i in result)
				lSocket.emit("JoinPrivateRoom", { id: result[i].room_id, BootValue: result[i].boot_value, MaxBlind: result[i].max_blind, tablePlayer: result[i].table_player, status: "yes" });

			if (result.length == 0) {
				lSocket.emit("JoinPrivateRoom", { status: "no" });
			}

		}
	});
}

listOfUsers = function () {
	for (var i = 0; i < clients.length; i++) {
		console.log("Now " + clients[i].name + " ONLINE");
	}
}

server.listen(app.get('port'), function () {
	console.log("Server is Running : " + server.address().port);
});








