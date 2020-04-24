# Dirt Rally Leauge View
View application to make collected data look better.


### Front End Setup

# First clone this git,

# Go into src
`cd src`

# Install all dependencies
`npm install `

# Serve with hot reload at localhost:3000 for development purposes
` npm run dev`

# Build for production and launch server
` npm run build`
` npm run start`

# Generate static project to be uploaded
` npm run generate`

# How the spreadsheet way works
First of all, you need a Season spreadsheet like this: https://docs.google.com/spreadsheets/d/1P-hVIAbM4jcThP8JO3Nqf_qSqGAPx7UdvxFTEhL_vp4/edit#gid=0
and then you need a Event spreadsheet/s depending on how many you have like this: https://docs.google.com/spreadsheets/d/12ZsC_extanuhWRqS6z83bLXtEwW9sn9LGZFs51qoRP0/edit#gid=1450556730

Now that you have the spreadsheets (or made copies of them) you have to change the scripts of them. First of all lets look at the SoL | S2 E1 spreadsheet script. It contains this script, where we edit the values in "var data", and if you host it on another url, then change the ip at "var response":

```
var data = {
  wrc: "Rally",
  masterSheet: "1P-hVIAbM4jcThP8JO3Nqf_qSqGAPx7UdvxFTEhL_vp4"
};

var points = {
  overall: [],
  powerStage: []
};

var participants = {
  wrc: {},
};

var teams = {
  wrc: {},
};

var unknownDrivers = [];

function startUpdating() {
  var eventId = "" + SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data").getRange(1, 2).getValue();
  if(eventId.length < 1) {
    stopUpdating();
    Browser.msgBox("eventId puudu");
    return;
  }
  
  var triggers = ScriptApp.getProjectTriggers();
  if(triggers.length > 0) {
    return;
  }
  
  ScriptApp.newTrigger("fetchData").timeBased().everyMinutes(30).create();
}

function stopUpdating() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
}

function updateScoring() {
  this.ssCount = countSS();
  if(this.ssCount < 1) {
    return;
  }
  
  getPoints();
  getParticipants();
  for(var i = 1; i <= this.ssCount; i++) {
    if(i === this.ssCount) {
      parseSS(i, true);
    } else {
      parseSS(i);
    }
  }
  
  applyPenalties();
  
  calculatePoints();
  
  printDrivers();
  printTeams();
  
  var mainSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Overall");
  mainSheet.getRange(2, 4).setNumberFormat('[mm]":"ss"."000');
  mainSheet.getRange(2, 4).copyFormatToRange(mainSheet, 4, 4, 2, mainSheet.getMaxRows());
  mainSheet.getRange(2, 4).copyFormatToRange(mainSheet, 11, 11, 2, mainSheet.getMaxRows());
  mainSheet.getRange(2, 4).copyFormatToRange(mainSheet, 18, 18, 2, mainSheet.getMaxRows());
  
  updateGlobal();
  
  printUnknownDrivers();
  
  var foo = false;
}

function printRestarters(list) {
  var page = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");
  page.getRange(2, 8, page.getMaxRows() - 1, 2).clearContent();
  if(typeof list === "undefined") {
    return;
  }
  
  var listArray = [];
  for(var name in list) {
    listArray.push([
      name, list[name]
    ]);
  }
  page.getRange(2, 8, listArray.length, 2).setValues(listArray);
}

function printUnknownDrivers() {
  var rows = [];
  this.unknownDrivers.map(function(driver) {
    rows.push([driver]);
  });
  var page = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");
  page.getRange(2, 7, page.getMaxRows() - 1).clearContent();
  if(this.unknownDrivers.length > 0) {
    page.getRange(2, 7, this.unknownDrivers.length).setValues(rows);
  }
}

function updateGlobal() {
  var columnNumber = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data").getRange(4, 2).getValue();
  if(columnNumber < 1) {
    return;
  }
  
  var doc = SpreadsheetApp.openById(this.data.masterSheet);
  for(var class in this.participants) {
    var page = doc.getSheetByName(this.data[class]);
    var lastRow = page.getLastRow() - 1;
    if(lastRow < 1) lastRow = 1;
    var output = [];
    var teamOutput = [];
    
    createResultArray(this.participants[class]).sort(totalTimeComparator).map(driverGlobalPrinter.bind(this, output));
    createResultArray(this.teams[class]).sort(teamComparator).map(teamGlobalPrinter.bind(this, teamOutput));
    
    page.getRange(2, columnNumber, lastRow, 2).clearContent();
    if(output.length > 0) {
      page.getRange(2, columnNumber, output.length, 2).setValues(output);
    }
    page.getRange(2, columnNumber + 2, lastRow, 2).clearContent();
    if(teamOutput.length > 0) {
      page.getRange(2, columnNumber + 2, teamOutput.length, 2).setValues(teamOutput);
    }
  }
}

function driverGlobalPrinter(output, driver) {
  if(driver.ssCount > 0) {
    var result = [driver.name];
    if(driver.disqualified === true) {
      result.push("DQ");
    } else if(driver.ssCount < this.ssCount) {
      result.push("DNF");
    } else {
      result.push(driver.score);
    }
    output.push(result);
  }
}

function teamGlobalPrinter(output, team) {
  if(team.getParticipated() === true) {
    output.push([
      team.name,
      team.getScore()
    ]);
  }
}

function printDrivers() {
  var page = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Overall");
  var lastRow = page.getLastRow() - 1;
  if(lastRow < 1) lastRow = 1;
  var counter = 0;
  
  for(var class in this.participants) {
    var array = createResultArray(this.participants[class]).sort(totalTimeComparator);
    var output = [];
    array.map(driverPrinter.bind(this, output));
    
    page.getRange(2, 1 + counter * 7, lastRow, 4).clearContent();
    if(output.length > 0) {
      page.getRange(2, 1 + counter * 7, output.length, 4).setValues(output);
    }
    counter++;
  }
}

function driverPrinter(output, driver, index) {
  var result = [
    index + 1
  ];
  if(driver.disqualified === true) {
    result.push("");
    result.push(driver.name);
    result.push("DQ");
  } else if(driver.totalTimeSeconds !== null && driver.ssCount > 0) {
    result.push(driver.score);
    result.push(driver.name);
    result.push(driver.totalTimeSeconds / 60 / 60 / 24);
  } else if(driver.ssCount > 0) {
    result.push("");
    result.push(driver.name);
    result.push("DNF (SS" + driver.ssCount + ")");
  }
  if(result.length > 3) {
    output.push(result);
  }
}

function printTeams() {
  var page = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Team Stats");
  var lastRow = page.getLastRow() - 1;
  if(lastRow < 1) lastRow = 1;
  var counter = 0;
  
  for(var class in this.participants) {
    var array = createResultArray(this.teams[class]).sort(teamComparator);
    var output = [];
    array.map(teamPrinter.bind(this, output));
    
    page.getRange(2, 1 + counter * 4, lastRow, 3).clearContent();
    if(output.length > 0) {
      page.getRange(2, 1 + counter * 4, output.length, 3).setValues(output)
    }
    counter++;
  }
}

function teamPrinter(output, team, index) {
  var result = [
    index + 1
  ];
  var score = team.getScore();
  if(team.getParticipated()) {
    result.push(score);
  } else {
    result.push("");
  }
  result.push(team.name);
  
  if(score !== null) {
    output.push(result);
  }
}

function applyPenalties() {
  var page = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Punishments");
  var lastRow = page.getLastRow() - 1;
  if(lastRow < 1) lastRow = 1;
  var data = page.getRange(2, 1, lastRow, 2).getValues();
  data.map(function(row) {
    if(row[0].length === 0) {
      return;
    }
    
    var driver = getDriver(row[0]);
    if(row[1] === "DQ") {
      driver.disqualified = true;
      return;
    }
    if(typeof row[1] === "number") {
      driver.totalTimeSeconds += row[1] * 60;
    }
  });
}

function calculatePoints() {
  for(var class in this.participants) {
    var array = createResultArray(this.participants[class]);
    array.sort(powerStageTimeComparator);
    this.points.powerStage.map(function(points, index) {
      addPoints(array, index, points);
    });
    array.sort(totalTimeComparator);
    this.points.overall.map(function(points, index) {
      addPoints(array, index, points);
    });
  }
}

function addPoints(driverArray, index, points) {
  if(typeof driverArray[index] === "undefined") {
    return;
  }
  if(driverArray[index].lastSS < this.ssCount) {
    return;
  }
  if(driverArray[index].disqualified === true) {
    return true;
  }
  
  driverArray[index].score += points;
}

function createResultArray(series) {
  var results = [];
  Object.keys(series).map(function(key) {
    results.push(series[key]);
  });
  return results;
}

function parseTime(time) {
  if(typeof time === "undefined" || time === null) {
    return false;
  }
  var split = time.split(":").reverse();
  var time_seconds = parseFloat(split[0]);
  if(split.length > 1) {
    time_seconds += parseInt(split[1], 10) * 60;
    if(split.length > 2) {
      time_seconds += parseInt(split[2], 10) * 3600;
    }
  }
  return time_seconds;
}

function totalTimeComparator(driver1, driver2) {
  return driverComparator(driver1, driver2);
}

function powerStageTimeComparator(driver1, driver2) {
  return driverComparator(driver1, driver2, true);
}

function driverComparator(driver1, driver2, power) {
  if(power) {
    if(typeof driver1.powerStageTime === "undefined" && typeof driver2.powerStageTime === "undefined") {
      return 0;
    }
    if(typeof driver1.powerStageTime === "undefined") {
      return 1;
    }
    if(typeof driver2.powerStageTime === "undefined") {
      return -1;
    }
  } else {
    if(driver1.lastSS < this.ssCount && driver2.lastSS < this.ssCount) {
      if(driver1.lastSS > driver2.lastSS) return -1;
      if(driver1.lastSS < driver2.lastSS) return 1;
      return driver1.name.localeCompare(driver2.name);
    }
    if(driver1.lastSS < this.ssCount) {
      return 1;
    }
    if(driver2.lastSS < this.ssCount) {
      return -1;
    }
  }
  
  if(driver1.disqualified === true && driver2.disqualified === true) {
    return 0;
  }
  if(driver1.disqualified === true) {
    return 1;
  }
  if(driver2.disqualified === true) {
    return -1;
  }
  
  if(power) {
    var time1 = driver1.powerStageTime;
    var time2 = driver2.powerStageTime;
    if(time1 > time2) return 1;
    if(time1 < time2) return -1;
  } else {
    var time1 = driver1.totalTimeSeconds;
    var time2 = driver2.totalTimeSeconds;
    if(time1 < time2) return -1;
    if(time1 > time2) return 1;
  }
  return 0;
}

function teamComparator(team1, team2) {
  var score1 = team1.getScore();
  var score2 = team2.getScore();
  if(score1 === null) score1 = -1;
  if(score2 === null) score2 = -1;
  if(score1 !== score2) {
    return score2 - score1;
  }
  
  if(team1.getParticipated() === false && team2.getParticipated() === false) {
    return team1.name.localeCompare(team1.name);
  }
  if(team1.getParticipated() === false) {
    return 1;
  }
  if(team2.getParticipated() === false) {
    return -1;
  }
  
  if(score1 == score2) {
    return team1.name.localeCompare(team2.name);
  }
}

function countSS() {
  var pageList = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  var count = 0;
  for(var i = 0; i < pageList.length; i++) {
    if(pageList[i].getName().substr(0, 2) === "SS") {
      count++;
    }
  }
  return count;
}

function addUnknown(name) {
  if(this.unknownDrivers.indexOf(name) === -1) {
    this.unknownDrivers.push(name);
  }
}

function parseSS(ssNum, lastSS) {
  var pageList = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  var page = null;
  var pageName = "SS" + ssNum;
  for(var i = 0; i < pageList.length; i++) {
    if(pageList[i].getName().substr(0, pageName.length) === pageName) {
      page = pageList[i];
      break;
    }
  }
  if(page === null) {
    throw new Error("Can't find SS page");
  }
  
  var entries = null;
  var lastRow = page.getLastRow();
  var data = page.getRange(2, 4, lastRow - 1, 3).getValues();
  data.map(function(row) {
    if(row[0].length === 0) {
      return;
    }
    var driver = getDriver(row[0]);
    if(driver === false) {
      addUnknown(row[0]);
      return;
    }
    if(row[2].length < 10) {
      row[2] = "00:" + row[2];
    }
    driver.ssRaw[ssNum] = parseTime(row[2]);
    driver.ss[ssNum] = parseTime(row[2]) - (ssNum > 1 ? driver.ssRaw[ssNum - 1] : 0);
    driver.ssCount++;
    if(driver.ss[ssNum] !== 900 && driver.ss[ssNum] !== 1800) {
      driver.lastSS = ssNum;
      if(lastSS) {
        driver.totalTimeSeconds = parseTime(row[2]);
      }
    }
  });
  
  if(lastSS) {
    data = page.getRange(2, 18, lastRow - 1, 12).getValues();
    data.map(function(row) {
      for(var i = 0; i < 3; i++) {
        var colNum = i * 4;
        if(row[colNum].length === 0) {
          continue;
        }
        var driver = getDriver(row[colNum]);
        if(driver === false) {
          continue;
        }
        if(row[colNum + 1] instanceof Date) {
          driver.powerStageTime = row[colNum + 1];
        }
      }
    });
  }
}

function getDriver(name) {
  for(var class in this.participants) {
    if(this.participants[class].hasOwnProperty(name)) {
      return this.participants[class][name];
    }
  }
  
  return false;
}

function getTeam(name) {
  for(var class in this.participants) {
    if(this.teams[class].hasOwnProperty(name)) {
      return this.teams[class][name];
    }
  }
  
  return false;
}

function getPoints() {
  var page = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");
  var data = page.getRange(2, 4, page.getLastRow(), 2).getValues();
  data.map(function(row) {
    if(typeof row[0] === "number") {
      this.points.overall.push(row[0]);
    }
    if(typeof row[1] === "number") {
      this.points.powerStage.push(row[1]);
    }
  });
}

function getParticipants() {
  var page = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Drivers");
  var data = page.getRange(3, 1, page.getLastRow() - 2, 9).getValues();
  var classList = Object.keys(this.participants);
  data.map(function(row) {
    for(var class = 0; class < 3; class++) {
      var className = classList[class];
      
      var teamCol = class * 3;
      if(row[teamCol].length > 0) {
        var teamData = {
          name: row[teamCol],
          drivers: [],
          getScore: getTeamPoints,
          getParticipated: getTeamParticipated,
          globalThis: this
        }
        this.teams[className][teamData.name] = teamData;
      }
      
      for(var driver = 1; driver <= 2; driver++) {
        var driverCol = teamCol + driver;
        if(row[driverCol].length > 0) {
          var driverData = {
            ssCount: 0,
            lastSS: null,
            totalTimeSeconds: null,
            name: row[driverCol],
            score: 0,
            powerStageTime: null,
            ss: {},
            ssRaw: {},
            class: className,
            disqualified: false
          };
          if(row[teamCol].length > 0) {
            driverData.team = getTeam(row[teamCol]);
            driverData.team.drivers[driverData.name] = driverData;
          }
          
          this.participants[className][driverData.name] = driverData;
        }
      }
    }
  });
}

function getTeamPoints() {
  var points = null;
  var drivers = this.drivers;
  var driverList = Object.keys(drivers);
  driverList.map(function(driver) {
    if(drivers[driver].ssCount > 0) {
      points += drivers[driver].score;
    }
  });
  return points;
}

function getTeamParticipated() {
  var participated = false;
  var drivers = this.drivers;
  var ssCount = this.globalThis.ssCount;
  var driverList = Object.keys(drivers);
  driverList.map(function(driver) {
    if(drivers[driver].ssCount >= ssCount) {
      participated = true;
    }
  });
  return participated;
}

function fetchDataTimed() {
  var time = new Date().getUTCHours();
  if(time < 9) {
    return;
  }
  fetchData();
}

function fetchData() {
  var eventId = "" + SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data").getRange(1, 2).getValue();
  if(eventId.length < 1) {
    //Browser.msgBox("eventId puudu");
    return;
  }
  
  var response = UrlFetchApp.fetch("http://163.172.219.67:3021/id/" + eventId);
  if(response.getResponseCode() !== 200) {
    return;
  }
  
  var data = JSON.parse(response.getContentText());
  if(typeof data.id === "undefined") {
    return;
  }
  
  var pageList = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  data.stageData.map(function(stage, stageNum) {
    var page = null;
    var pageName = "SS" + (stageNum + 1);
    for(var i = 0; i < pageList.length; i++) {
      if(pageList[i].getName().substr(0, pageName.length) === pageName) {
        page = pageList[i];
        break;
      }
    }
    if(page === null) {
      throw new Error("Can't find SS page");
    }
    
    var last = page.getLastRow();
    page.getRange(2, 1, last - 2, 7).clearContent();
    
    var values = [];
    var row;
    for(var i in stage.entries) {
      row = stage.entries[i];
      values.push([
        row.Position,
        (row.PlayerDiff !== 0 ? row.PlayerDiff : ""),
        "",
        row.Name,
        row.VehicleName,
        row.Time,
        row.DiffFirst
      ]);
    }
    //var lastValue = page.getRange(page.getLastRow(), 2).getValue();
    
    if(values.length > 0) {
      page.getRange(2, 1, values.length, 7).setValues(values);
    }
    page.getRange(last, 2).copyTo(page.getRange(2, 2, last - 2));
  });
  
  updateScoring();
  
  printRestarters(data.restarters);
  
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data").getRange(2, 2).setValue(new Date());
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data").getRange(3, 2).setValue(new Date(data.cacheTime));
  
  if(typeof data.rallyFinished !== "undefined" && data.rallyFinished === true) {
    stopUpdating();
  }
}

function fetchData_old() {
  var eventId = "" + SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data").getRange(1, 2).getValue();
  if(eventId.length < 1) {
    //Browser.msgBox("eventId puudu");
    return;
  }
  
  var response_init = UrlFetchApp.fetch("https://www.dirtgame.com/uk/api/event?noCache=" + Date.now() + "&eventId=" + eventId + "&stageId=1");
  var data_init = JSON.parse(response_init.getContentText());
  for(var i = 1; i <= data_init.TotalStages; i++) {
    var participants = [];
    var response = UrlFetchApp.fetch("https://www.dirtgame.com/uk/api/event?leaderboard=true&noCache=" + Date.now() + "&eventId=" + eventId + "&stageId=" + i + "&page=1");
    if(response.getResponseCode() !== 200) {
      return;
    }
    var data = JSON.parse(response.getContentText());
    participants = participants.concat(data.Entries);
    if(data.Pages > 1) {
      for(var j = 2; j <= data.Pages; j++) {
        response = UrlFetchApp.fetch("https://www.dirtgame.com/uk/api/event?leaderboard=true&noCache=" + Date.now() + "&eventId=" + eventId + "&stageId=" + i + "&page=" + j);
        if(response.getResponseCode() !== 200) {
          return;
        }
        data = JSON.parse(response.getContentText());
        participants = participants.concat(data.Entries);
      }
    }
    if(participants.length > 0) {
      saveData(i, participants);
    } else {
      break;
    }
  }
  
  updateScoring();
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data").getRange(2, 2).setValue(new Date());
}

function saveData_old(ssNum, data) {
  var pageList = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  var page = null;
  var pageName = "SS" + ssNum;
  for(var i = 0; i < pageList.length; i++) {
    if(pageList[i].getName().substr(0, pageName.length) === pageName) {
      page = pageList[i];
      break;
    }
  }
  if(page === null) {
    throw new Error("Can't find SS page");
  }
  
  var last = page.getLastRow();
  page.getRange(2, 1, last - 2, 7).clearContent();
  
  var values = [];
  var row;
  for(var i in data) {
    row = data[i];
    values.push([
      row.Position,
      (row.PlayerDiff !== 0 ? row.PlayerDiff : ""),
      "",
      row.Name,
      row.VehicleName,
      row.Time,
      row.DiffFirst
    ]);
  }
  var lastValue = page.getRange(page.getLastRow(), 2).getValue();
  
  page.getRange(2, 1, values.length, 7).setValues(values);
  page.getRange(last, 2).copyTo(page.getRange(2, 2, last - 2));
}

function onOpen(event) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var menuEntries = [
    {
      name: "Update Times",
      functionName: "fetchData"
    },
    {
      name: "Update Overall",
      functionName: "updateScoring"
    },
    {
      name: "Start Automatic Update",
      functionName: "startUpdating"
    },
    {
      name: "Stop Automatic Update",
      functionName: "stopUpdating"
    }
  ];
  ss.addMenu("Extra Menu", menuEntries);
}
```

In the Season spreadsheet, this script is used, here is also values from "var data" and "function parseClass":

```
var data = {
  ralliesListPage: "Rally",
  wrc: "Rally",
};

var rallies = [];

var drivers = {
  wrc: {},
};

var nicks = {};

var teams = {
  wrc: {},
};

function startUpdating() {
  var triggers = ScriptApp.getProjectTriggers();
  if(triggers.length > 0) {
    return;
  }
  
  ScriptApp.newTrigger("updateStats").timeBased().everyMinutes(30).create();
}

function stopUpdating() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
}

function parseClass(name) {
  switch(name) {
    case "Rally":
      return "wrc";
    default:
      throw new Error("Could not parse class from '" + name + "'");
  }
}

var unknownDrivers = [];

function updateStats() {
  getRallies();
  getDrivers();
  getTeams();
  
  parseRallies();
  
  printResults();
  
  printUnknownDrivers();
  
  //var testValue = driverComparator(this.drivers.wrc["Ahto Järv"], this.drivers.wrc["Jan Torn"]);
  
  var foo = false;
}

function printUnknownDrivers() {
  var rows = [];
  this.unknownDrivers.map(function(driver) {
    rows.push([driver]);
  });
  var page = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");
  page.getRange(2, 1, page.getMaxRows() - 1).clearContent();
  if(this.unknownDrivers.length > 0) {
    page.getRange(2, 1, this.unknownDrivers.length).setValues(rows);
  }
}

function printResults() {
  for(var class in this.drivers) {
    var page = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.data[class]);
    var driverArray = createResultArray(this.drivers[class]).sort(driverComparator);
    var teamArray = createResultArray(this.teams[class]).sort(driverComparator);
    
    var driverOutput = [];
    var teamOutput = [];
    
    driverArray.map(driverPrinter.bind(this, driverOutput));
    teamArray.map(driverPrinter.bind(this, teamOutput));
    
    page.getRange(2, 1, page.getMaxRows() - 1, this.rallies.length + 3).clearContent();
    if(driverOutput.length > 0) {
      page.getRange(2, 1, driverOutput.length, this.rallies.length + 3).setValues(driverOutput);
    }
    page.getRange(2, this.rallies.length + 5, page.getMaxRows() - 1, this.rallies.length + 3).clearContent();
    if(teamOutput.length > 0) {
      page.getRange(2, this.rallies.length + 5, teamOutput.length, this.rallies.length + 3).setValues(teamOutput);
    }
  }
}

function driverPrinter(output, driver, index) {
  var result = [
    index + 1,
    driver.name
  ];
  for(var i in this.rallies) {
    if(typeof driver.scores[this.rallies[i]] === "undefined") {
      result.push("");
    } else {
      result.push(driver.scores[this.rallies[i]]);
    }
  }
  if(driver.totalScore === null) {
    result.push("");
  } else {
    result.push(driver.totalScore);
  }
  output.push(result);
}

function createResultArray(series) {
  var results = [];
  Object.keys(series).map(function(key) {
    results.push(series[key]);
  });
  return results;
}

function addUnknown(name) {
  if(this.unknownDrivers.indexOf(name) === -1) {
    this.unknownDrivers.push(name);
  }
}

function parseRallies() {
  for(var class in this.drivers) {
    var page = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.data[class]);
    var data = page.getRange(2, 25, page.getMaxRows() - 1, page.getMaxColumns() - 24).getValues();
    
    data.map(function(row) {
      for(var j = 0; j < row.length / 4; j++) {
        var colNum = j * 4;
        if(row[colNum].length > 0) {
          var name = row[colNum];
          var score = row[colNum + 1];
          
          if(typeof this.nicks[name] !== "undefined") {
            var driver = this.nicks[name];
            if(driver.class == class) {
              driver.scores[this.rallies[j]] = score;
              if(typeof score === "number") {
                driver.totalScore += score;
              }
            }
          } else {
            addUnknown(name);
          }
        }
        if(row[colNum + 2].length > 0) {
          var teamName = row[colNum + 2];
          var teamScore = row[colNum + 3];
          
          if(typeof this.teams[class][teamName] !== "undefined") {
            var team = this.teams[class][teamName];
            team.scores[this.rallies[j]] = teamScore;
            team.totalScore += teamScore;
          }
        }
      }
    });
  }
}

function getRallies() {
  var page = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.data.ralliesListPage);
  var data = page.getRange(1, 3, 1, 6).getValues();
  data[0].map(function(rally) {
    this.rallies.push(rally);
  });
}

function getDrivers() {
  var page = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Drivers");
  var data = page.getRange(2, 1, page.getLastRow() - 1, page.getLastColumn()).getValues();
  
  data.map(function(driver) {
    if(driver[0].length === 0) {
      return;
    }
    var driverData = {
      name: driver[0],
      class: parseClass(driver[1]),
      scores: {},
      totalScore: null
    };
    
    this.drivers[parseClass(driver[1])][driverData.name] = driverData;
    var nickList = driver.slice(2);
    nickList.map(function(nick) {
      if(nick.length > 0) {
        this.nicks[nick] = driverData;
      }
    });
  });
}

function getTeams() {
  var page = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Teams");
  var data = page.getRange(2, 1, page.getLastRow() - 1, 2).getValues();
  
  data.map(function(team) {
    if(team[0].length > 0) {
      this.teams[parseClass(team[1])][team[0]] = {
        name: team[0],
        scores: {},
        totalScore: null
      }
    }
  });
}

function driverComparator(driver1, driver2) {
  // One or both drivers have no score at all
  if(driver1.totalScore === null && driver2.totalScore === null) {
    return driver1.name.localeCompare(driver2.name);
  }
  if(driver1.totalScore === null) {
    return 1;
  }
  if(driver2.totalScore === null) {
    return -1;
  }
  
  // One or the other has a higher score
  if(driver1.totalScore - driver2.totalScore !== 0) {
    return driver2.totalScore - driver1.totalScore;
  }
  
  var driver1Scores = createScoreList(driver1);
  var driver2Scores = createScoreList(driver2);
  
  var scoreListResult = compareScoreLists(driver1Scores, driver2Scores);
  if(scoreListResult === 0) {
    return driver1.name.localeCompare(driver2.name);
  }
  return scoreListResult;
}

function createScoreList(driver) {
  var driverScores = [];
  var i = null;
  for(i in driver.scores) {
    if(typeof driver.scores[i] === "number") {
      driverScores.push(driver.scores[i]);
    }
  }
  driverScores.sort();
  var driverScoresList = {};
  for(i in driverScores) {
    if(typeof driverScoresList[driverScores[i]] !== "undefined") {
      driverScoresList[driverScores[i]]++;
    } else {
      driverScoresList[driverScores[i]] = 1;
    }
  }
  return driverScoresList;
}

function compareScoreLists(list1, list2) {
  var uniqueScores = [];
  Object.keys(list1).map(function(key) {
    key = parseInt(key, 10);
    if(uniqueScores.indexOf(key) === -1) {
      uniqueScores.push(key);
    }
  });
  Object.keys(list2).map(function(key) {
    key = parseInt(key, 10);
    if(uniqueScores.indexOf(key) === -1) {
      uniqueScores.push(key);
    }
  });
  uniqueScores.sort(function(a,b){return a - b}).reverse();
  for(var i in uniqueScores) {
    if(typeof list1[uniqueScores[i]] === "undefined" && typeof list2[uniqueScores[i]] === "undefined")
      continue;
    if(typeof list1[uniqueScores[i]] === "undefined")
      return 1;
    if(typeof list2[uniqueScores[i]] === "undefined")
      return -1;
    
    return list2[uniqueScores[i]] - list1[uniqueScores[i]];
  }
  
  return 0;
}

function onOpen(event) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var menuEntries = [
    {
      name: "Update Overall",
      functionName: "updateStats"
    },
    {
      name: "Start Automatic Update",
      functionName: "startUpdating"
    },
    {
      name: "Stop Automatic Update",
      functionName: "stopUpdating"
    }
  ];
  ss.addMenu("Extra Menu", menuEntries);
}
```

In the Season spreadsheet, you need to add Drivers, Teams, Points & Classes.
In the Event spreadsheet, you also need Driver, Classes & Data tab. Under the Data, you insert the event ID which the API uses to find the league.
