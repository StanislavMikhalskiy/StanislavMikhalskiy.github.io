function GetAlert(value){
  alert(value);
}

// Настрокий Jira
var jiraURL = "https://jira.action-media.ru";
var jCreateTaskURL="/rest/api/2/issue/";
var jGetIssue="/rest/api/2/issue/";
var jIssueLinkURL = "/rest/api/2/issueLink/";
var jFieldNameEpicName="customfield_10102";
var jFieldNameEpicLink="customfield_10100";
var jFindURL="/rest/api/2/search";
var jGetSprint="/rest/agile/1.0/board/";

// глобальные переменные
var RoleCommon = [{RoleCode:'10206',RoleName:'Developers'},{RoleCode:'10404',RoleName:'QA'}];
var roleField = "customfield_11304", roleTimeField = "customfield_11303";
var futureSprint = "";
var planTime = [];
var functionResponse = {value:"",state:false,errorMsg:""};
var functionResponseArray = {value:[],state:false,errorMsg:""};
var employees = [], issues = [];
var errorMessage = "";
var boardId = "136";
var projectID = "SS";



function FirstStart(){
    var f = 'FirstStart ';
    console.log(f+'Запуск функции');
    var htmlTable = "",
        supportMessage="";
    errorMessage = "";
    // если спринта у нас нет, то ничего больше не делаем
    if (GetFutureSprintSmart()){
        if (GetTimeToWorkSmart()){
            // если мы еще не наполняли массив employees
            if (employees.length < 1) {
            //var employees = [];
                // обрабатываем данные по ресурсам
                for(var i = 0; i < planTime.length; i++){
                    // добавляем сотрудника в массив
                    employees.push({"eName":planTime[i].login,"planTimeToWork":planTime[i].timeToWork,"eEstimate":0,"eOstatok":0,"planRole":planTime[i].role});
                    console.log(f+'добавляем сотрудника в массив');
                    console.log(f+'employees = '+employees[i].eName+" "+employees[i].planTimeToWork+" "+employees[i].planRole);
                }
            }
            // получаем данные по текущей загрузке в спринте
            var sprintWorkload = [];
            issues = [];
            functionResponseArray = GetSprintWorkload(futureSprint);
            if (functionResponseArray.state) {
                sprintWorkload = functionResponseArray.value;

                ParseJiraTasks(sprintWorkload, f);
                UpdateWorkload(sprintWorkload,employees);

                // получаем данные по недооформленным задачам
                functionResponse = SetDeveloperForTask(f);

                if (functionResponse.state) {
                    supportMessage = functionResponse.value;
                } else {
                    errorMessage += "<p>"+functionResponse.errorMsg+"</p>";
                }
            } else {
                errorMessage += "<p>"+functionResponseArray.errorMsg+"</p>";
            }
            htmlTable = GenerateTable(employees);
        }
    }
    GenerateWindow(htmlTable, supportMessage);
    //GetAlert();
}
function SetDeveloperForTask(fname){
    var f = fname+'SetDeveloperForTask ';
    console.log(f+'Запуск функции');
    console.log(f+'value.length = '+issues.length);
    var localFunctionResponse = {value:"",state:false,errorMsg:""};

    if (issues.length > 0) {
        localFunctionResponse.state = true;
        var tmptable = "<br><table>";
        tmptable += "<tr><td>#</td><td>Задача</td><td>Диагностика</td></tr>";
        for(var i = 0; i < issues.length; i++) {
            console.log(f+'issues[i].key = '+issues[i].key);
            console.log(f+'issues[i].roles.length = '+issues[i].roles.length);
            var hasProblemIssue = false;
            var mess = [];

            // проверяем, что заполнена роль разработчика
            //console.log(f+'x.role = '+issues[i].roles.find((x) => x.role === 'Developers').role);
            if (issues[i].roles.find((x) => x.role === 'Developers') == -1 || issues[i].roles.find((x) => x.role === 'Developers') == undefined ) {
                console.log(f+'issues[i].key = '+issues[i].key+' не задана роль разработчика');
                hasProblemIssue = true;
                mess.push("Не задана роль разработчика");
                mess.push("Не задано время для роли разработчика");
            } else {
                if (issues[i].roles.find((x) => x.role === 'Developers').login == '') {
                    console.log(f+'issues[i].key = '+issues[i].key+' не задана роль разработчика');
                    hasProblemIssue = true;
                    mess.push("Не задана роль разработчика");
                }
                // проверяем, что заполнена время для роли разработчика
                if (issues[i].roles.find((x) => x.role === 'Developers').estimate <= 0) {
                    console.log(f+'issues[i].key = '+issues[i].key+' не задано время для роли разработчика');
                    hasProblemIssue = true;
                    mess.push("Не задано время для роли разработчика");
                }
            }
            if (mess.length > 0) {
                tmptable += "<tr><td>"+i+"</td><td><a href='"+jiraURL+"/browse/"+issues[i].key+"'>"+issues[i].key+"<a></td><td><ul>";
                for (var j=0; j<mess.length; j++) {
                    tmptable += "<li>"+mess[j]+"</li>";
                }
                tmptable += "</ul></td></tr>";
            }
        }
        if (hasProblemIssue) {
            localFunctionResponse.value = tmptable;
        }
    } else {console.log(f+'во входном массиве нет данных');};

    return localFunctionResponse;
/*
issues = []
{key
,assignee
,roles:[{role, login, estimate}]
,originalEstimate
,message
}
*/
}
function ParseJiraTask(value, fname){
    var f = fname+'ParseJiraTask ';
    console.log(f+'Запуск функции');
    var result = {
        key:"",
        assignee:"",
        originalEstimate: 0,
        message: "",
        roles: []
    };

    result.key = value.key;
    if ('timeoriginalestimate' in value.fields && value.fields['timeoriginalestimate'] != null) {
        result.originalEstimate = value.fields.timeoriginalestimate;
        console.log(f+'у задачи '+result.key+' originalEstimate = '+result.originalEstimate);
    } else {
        result.message += "Отсутствует timeoriginalestimate. ";
        console.log(f+'у задачи '+result.key+' отсутствует timeoriginalestimate');
    }

    if ('assignee' in value.fields && 'key' in value.fields.assignee && value.fields.assignee['key'] != null) {
        result.assignee = value.fields.assignee.key;
        console.log(f+'у задачи '+result.key+' assignee = '+result.assignee);
    } else {
        result.message += "Отсутствует assignee.key. ";
        console.log(f+'у задачи '+result.key+' отсутствует assignee.key');
    }
    // проверяем, что есть данные по ролям (пользователь) var roleField = "customfield_11304"
    if (roleField in value.fields && value.fields[roleField] != null) {
        console.log(f+'у задачи '+result.key+' есть данные по ролям (пользователь) '+roleField+' в количестве '+value.fields[roleField].length);
        var hasRoleLogin = false;
        // обходим массив ролей (пользователь)
        for(var i = 0; i < value.fields[roleField].length; i++) {
            // для каждого элемента ищем соответствие известным ролям var RoleCommon = [{RoleCode:'10206',RoleName:'Developers'},{RoleCode:'10404',RoleName:'QA'}];
            for ( var j=0; j<RoleCommon.length; j++) {
                var roleLogin = ParseRole(value.fields[roleField][i],RoleCommon[j].RoleCode,f);
                if ( roleLogin.length > 0 ) {
                    console.log(f+'у задачи '+result.key+' есть роль '+RoleCommon[j].RoleName+' с логином '+roleLogin);
                    //console.log(f+'добавляем в массив роль '+RoleCommon[j].RoleName+', логин '+roleLogin+' и нулевое время');
                    result.roles.push({role:RoleCommon[j].RoleName,login:roleLogin,estimate:0});
                    hasRoleLogin = true;
                } else { console.log(f+'у задачи '+result.key+' нет роли '+RoleCommon[j].RoleName);}
            }
        }
        if (!hasRoleLogin) {
            console.log(f+'у задачи '+result.key+' нет ролей');
            result.message += "Отсутствуют данные по ролям (пользователь). ";
        }
    } else {
        result.message += "Отсутствуют данные по ролям (пользователь). ";
        console.log(f+'у задачи '+result.key+' отсутствуют данные по ролям (пользователь) '+roleField);
    }
    // проверяем, что есть данные по ролям (время) var roleTimeField = "customfield_11303";
    if (roleTimeField in value.fields && value.fields[roleTimeField] != null) {
        console.log(f+'у задачи '+result.key+' есть данные по ролям (время) '+roleTimeField+' в количестве '+value.fields[roleTimeField].length);
        // обходим массив ролей (время)
        for(i = 0; i < value.fields[roleTimeField].length; i++) {
            // для каждого элемента ищем соответствие известным ролям var RoleCommon = [{RoleCode:'10206',RoleName:'Developers'},{RoleCode:'10404',RoleName:'QA'}];
            for (j=0; j<RoleCommon.length; j++) {
                var roleTime = ParseJiraRoleTime(value.fields[roleTimeField][i],RoleCommon[j].RoleName,f);
                if ( roleTime > 0 ) {
                    console.log(f+'у задачи '+result.key+' есть роль '+RoleCommon[j].RoleName+' со временем '+roleTime);
                    // ищем по массиву ролей, если такая роль есть - выставляем время, если нет - добавляем новую запись
                    var roleFinded = false;
                    for (var k=0; k<result.roles.length; k++) {
                        if (result.roles[k].role === RoleCommon[j].RoleName) {
                            result.roles[k].estimate = roleTime;
                            roleFinded = true;
                            console.log(f+'у задачи '+result.key+' нашли соответствие роли '+RoleCommon[j].RoleName+' со временем '+roleTime);
                            break;
                        }
                    }
                    if (!roleFinded) {
                        result.roles.push({role:RoleCommon[j].RoleName,login:'',estimate:roleTime});
                        console.log(f+'у задачи '+result.key+' не нашли соответствие и добавили для роли '+RoleCommon[j].RoleName+' со временем '+roleTime);
                    }
                } else { console.log(f+'у задачи '+result.key+' нет роли или времени '+RoleCommon[j].RoleName);}
            }
        }
    } else {
        result.message += "Отсутствуют данные по ролям (время). ";
        console.log(f+'у задачи '+result.key+' отсутствуют данные по ролям (время) '+roleTimeField);
    }

/*
issues = []
{key
,assignee
,roles:[{role, login, estimate}]
,originalEstimate
,message
}
*/
/*
{

    {
      "fields": {
        "customfield_11303": null,
        "customfield_11304": [
          "Role: 10206 (i.kishkevich)",
          "Role: 10404 ()"
        ],
        "timeestimate": 7200,
        "timeoriginalestimate": 7200,
        "fixVersions": [],
      }
    }
}
*/
    return result;
}
function ParseJiraRoleTime(value, roleName,fname){
    var f = fname+'ParseJiraRoleTime ';
    console.log(f+'Запуск функции');
    var result = 0;
    // определяем роль
    if (value.indexOf(roleName) > -1) {
        var startPos = value.indexOf("(")+1,
            linePos = value.indexOf("|")-1,
            tmpValue = value.substring(startPos,linePos);
        if (tmpValue !== 'null') {
            result = tmpValue.substring(0,tmpValue.indexOf("("));
        }
    }
    return result;
}
function ParseJiraTasks(value, fname){
    var f = fname+'ParseJiraTasks ';
    console.log(f+'Запуск функции');
    console.log(f+'value.total = '+value.total);

    for(var i = 0; i < value.total; i++) {
        var issue = ParseJiraTask(value.issues[i],f);
        issues.push(issue);
        console.log(f+'добавлена задача '+issue.key);
    }
/*
issues = []
{key
,assignee
,roles:[{role, login, estimate}]
,originalEstimate
,message
}
*/
}
function GetRolesOnTask(value){
    console.log('GetRolesOnTask - Запуск функции');
    // data.issues[i].fields
    var result = [];

    if (roleField in value.fields && value.fields[roleField] != null) {
        // обходим все роли и вычисляем логины, если заданы
        for(var i = 0; i < value.fields[roleField].length; i++) {
            console.log('GetRolesOnTask - '+roleField+' '+i+' '+value.fields[roleField][i]);
            for ( var j=0; j<RoleCommon.length; j++) {
                var roleLogin = ParseRole(value.fields[roleField][i],RoleCommon[j].RoleCode);
                if ( roleLogin.length > 0 ) {
                    console.log('GetRolesOnTask - Для роли '+RoleCommon[j].RoleName+' найден логин = '+roleLogin);
                    result.push({login:roleLogin,time:0,role:RoleCommon[j].RoleName,key:value.key,message:'Ok'});
                } else {
                    result.push({login:'',time:0,role:RoleCommon[j].RoleName,key:value.key,message:'Роль '+RoleCommon[j].RoleName+' не заполнена'});
                }

            }
        }
    } else {
        console.log('GetRolesOnTask - В задаче '+value.key+' нет блока данных по роли пользователя '+roleField);
        result.push({login:'',time:0,role:'',key:value.key,message:'Роль не заполнена'});
    }

    return result;
}
function Recalculate(){
    console.log('Refresh - Запуск функции');
    errorMessage = "";
    FirstStart();
}
function ParseRole(value,valueRoleCode,fname){
    var f = fname+' ParseRole ';
    console.log(f+'Запуск функции');
    var result = "";
    if (value.indexOf(valueRoleCode) > -1) {
        var startPos = value.indexOf("(")+1,
        endPos = value.indexOf(")");
        if (startPos < endPos) {
            var tempResult = value.substring(startPos,endPos);
            if ( tempResult !== 'null') {
                result = tempResult;
                //console.log('ParseJiraByRole - определили логин = '+result);
            }
        }
    }
    return result;
/*    "customfield_11304": [
      "Role: 10206 (a.ivanov)",
      "Role: 10404 (kusakin)"
    ],*/
}
function ParseTimeByRole(value,valueRoleData){
    console.log('ParseTimeByRole - Запуск функции');
    // определяем роль
    if (value.indexOf(valueRoleData.role) > -1) {
        var startPos = value.indexOf("(")+1,
            linePos = value.indexOf("|")-1,
            tmpValue = value.substring(startPos,linePos);
        if (tmpValue !== 'null') {
            var time = tmpValue.substring(0,tmpValue.indexOf("("));
            valueRoleData.time = time;
            //console.log('ParseTimeByRole - найдено время = '+time);
        }
    }//else {console.log('ParseTimeByRole - не найдена роль '+valueRoleData.role);}
/*
"customfield_11303": [
      "Role: Developers (14400(4h) | 14400(4h))",
      "Role: QA (null | null)"
    ],
================================================================
    "customfield_11303": [
      "Role: Developers (14400(4h) | 14400(4h))",
      "Role: QA (10800(3h) | 10800(3h))"
    ],
*/
}
function JiraParseByRole(value){
    console.log('ParseJiraByRole - Запуск функции');
    var result = [],
        hasRoleLogin = false;
        //RoleCommon = [{RoleCode:'10206',RoleName:'Developers'},{RoleCode:'10404',RoleName:'QA'}],
    result = GetRolesOnTask(value);
    // определяем - есть ли данные по времени, вычисляем, если заданы
    if (result.length > 0) {
        if (roleTimeField in value.fields && value.fields[roleTimeField] != null) {
            for(var i = 0; i < value.fields[roleTimeField].length; i++) {
                console.log('ParseJiraByRole - '+roleTimeField+' '+i+'='+value.fields[roleTimeField][i]);
                for (var j=0; j<result.length; j++) {
                    ParseTimeByRole(value.fields[roleTimeField][i],result[j]);
                }
            }
        } else { console.log('ParseJiraByRole - В задаче '+value.key+' нет блока данных по времени роли пользователя '+roleTimeField); result = [];}
    }
    return result;
}
function UpdateWorkload(valueSprintWorkload,valueEmployees){
    console.log('UpdateWorkload - Запуск функции');

    console.log('UpdateWorkload - valueSprintWorkload.total = '+valueSprintWorkload.total);
    var jiraParseByRole = [];
    // определяем по данным Jira - кто и чем загружен
    for(var i = 0; i < valueSprintWorkload.total; i++) {
        // определяем все роли, которые есть в задаче, а также привязанных к ролям пользователей и указанное время
        console.log('UpdateWorkload - issue = '+valueSprintWorkload.issues[i].key);
        var jiraParseByRoleResult = JiraParseByRole(valueSprintWorkload.issues[i]); //result.push({login:roleLogin,time:0,role:RoleCommon[j].RoleName, key:"key"});
        for(var j = 0; j < jiraParseByRoleResult.length; j++) {
            jiraParseByRole.push({login:jiraParseByRoleResult[j].login,time:jiraParseByRoleResult[j].time,role:jiraParseByRoleResult[j].role, key:jiraParseByRoleResult[j].key,message:jiraParseByRoleResult[j].message});
        }
    }
    if (jiraParseByRole.length > 0) {
        // анализируем массив сотрудников и назначенные на них задачи
        for(i = 0; i < valueEmployees.length; i++) { //employees.push({"eName":planTime[i].login,"planTimeToWork":planTime[i].timeToWork,"eEstimate":0,"eOstatok":0,"planRole":planTime[i].role});
            valueEmployees[i].eEstimate = 0;
            valueEmployees[i].eOstatok = 0;
            // myArray.find(x => x.id === '45').foo;
            var tmpJiraParseByRole = jiraParseByRole.filter(x => x.login === valueEmployees[i].eName);
            var sumTime = 0;
            for(j = 0; j < tmpJiraParseByRole.length; j++) {
                sumTime+=tmpJiraParseByRole[j].time/60/60;
            }
            if (isNaN(Number(sumTime))) {
            } else {
                valueEmployees[i].eEstimate+=Number(sumTime);
                valueEmployees[i].eOstatok = valueEmployees[i].planTimeToWork - valueEmployees[i].eEstimate;
            }
        }
    }
    return jiraParseByRole;
}
function GenerateTable(value){
    console.log('GenerateTable - Запуск функции');
    var localhtmlTable = "",
        localEmployees = value;

    localhtmlTable+="<table width='50%'>";
    localhtmlTable+="<tr><td class='caption'>Сотрудник</td><td class='caption'>Роль</td><td class='caption'>Начальное время</td><td class='caption'>Запланировано</td><td class='caption'>Остаток</td></tr>";
    var rowClass="";

    for(var i = 0; i < localEmployees.length; i++){
        // анализируем загрузку
        if ( (localEmployees[i].eEstimate) >= localEmployees[i].planTimeToWork ) {
            if ( i & 1 ) {
                rowClass="normalFullOne";
            } else {
                rowClass="normalFullTwo";
            }
        } else
        {
            if ( i & 1 ) {
                rowClass="normalFreeOne";
            } else {
                rowClass="normalFreeTwo";
            }
        }
        localhtmlTable+="<tr><td class='"+rowClass+"'>"+localEmployees[i].eName
            +"</td><td class='"+rowClass+"'>"+localEmployees[i].planRole
            +"</td><td class='"+rowClass+"'>"+localEmployees[i].planTimeToWork
            +"</td><td class='"+rowClass+"'>"+(localEmployees[i].eEstimate).toFixed(1)
            +"</td><td class='"+rowClass+"'>"+(localEmployees[i].eOstatok).toFixed(1)
            +"</td></tr>";
    }
    localhtmlTable+="</table>";


    return localhtmlTable;
}
function GetFutureSprintSmart(){
    console.log('GetFutureSprintSmart - Запуск функции');
    // если мы уже запрашивали спринт в этой сессии и у нас есть его значение, то повторно запрашивать не будем
    if (futureSprint.length == 0) {
        console.log('GetFutureSprintSmart - Спринт еще не был определен');
        functionResponse = GetFutureSprint(boardId);
        if (functionResponse.state) {
            futureSprint = functionResponse.value;
            console.log('GetFutureSprintSmart - Спринт определен успешно: '+futureSprint);
            return true;
        } else {
            errorMessage += "<p>Спринт не был определен</p>";
            errorMessage += "<p>"+functionResponse.errorMsg+"</p>";
            console.log('GetFutureSprintSmart - информация об ошибке: '+functionResponse.errorMsg);
            return false;
        }
    } else {
        console.log('GetFutureSprintSmart - Спринт уже был определен: '+futureSprint);
        return true;
    }
    return false;
}
function GetTimeToWork(value){
    console.log('GetTimeToWork - Запуск функции');
    var localFunctionResponseArray = {value:[],state:false,errorMsg:""},
        sprint = value,
        URL = "https://script.google.com/macros/s/AKfycbwJ8QiZKAyFVpjFbF037JQ6UmDaaq_SGPlu1eANAK9eHpEMjV0/exec?sprint="+sprint;
    var jqxhr = $.ajax({
    url: URL,
    type: "GET",
    success: function(jqdata) {
        console.log('GetTimeToWork - Запрос успешно отработал');
        console.log('jqdata.length = '+jqdata.length);
        if (jqdata.length > 0) {
            localFunctionResponseArray.state = true;
            localFunctionResponseArray.value = jqdata;
        } else {
            localFunctionResponseArray.state = false;
            localFunctionResponseArray.errorMsg = "Данные по планируемой загрузке не найдены, проверьте имя спринта или наличие данных ("+URL+")";
        }
    },
    async:false
    })
    //.done(function() { result="second success"; })
    .fail(function(errmsg) {
        console.log('GetTimeToWork - Ошибка обработки '+errmsg.responseText);
        localFunctionResponseArray.errorMsg = "Ошибка получения данных по url "+URL;
    })
    //.always(function() { result="finished"; });
    ;
    return localFunctionResponseArray;
}
function GetTimeToWorkSmart(){
    console.log('GetTimeToWorkSmart - Запуск функции');
    // получаем данные по ресурсам из гугла
    // если мы уже запрашивали спринт в этой сессии и у нас есть его значение, то повторно запрашивать не будем
    if (planTime.length<1) {
        console.log('GetTimeToWorkSmart - Данные по доступному времени еще не запрашивались');
        functionResponseArray = GetTimeToWork(futureSprint);
        if (functionResponseArray.state) {
            planTime = functionResponseArray.value;
            console.log('GetTimeToWorkSmart - Данные по доступному времени получены успешно');
            return functionResponseArray.state;
        } else {
            errorMessage += "<p>Данные по доступному времени не получены</p>";
            errorMessage += "<p>"+functionResponseArray.errorMsg+"</p>";
            console.log('GetTimeToWorkSmart - информация об ошибке: '+functionResponseArray.errorMsg);
            return functionResponseArray.state;
        }
    } else {
        console.log('GetTimeToWorkSmart - Данные по доступному времени уже были получены');
        return true;
    }
    return false;
}
function GetFutureSprint(value){
    console.log('GetFutureSprint - Запуск функции');
    var localFunctionResponse = {value:"",state:false,errorMsg:""},
        localboardId = value,
        localURL = jGetSprint+localboardId+"/sprint?state=future";
    var jqxhr = $.ajax({
    url: localURL,
    type: "GET",
    success: function(jqdata) {
      console.log('GetFutureSprint - Данные успешно получены по доске '+localboardId);
      if (jqdata.values.length==1) {
          localFunctionResponse.state = true;
          localFunctionResponse.value = jqdata.values[0].name;
      } else
      {
          if (jqdata.values.length==0) {
              localFunctionResponse.errorMsg = "GetFutureSprint - Не найдено ни одного 'будущего' спринта";
          } else {
              localFunctionResponse.errorMsg = "GetFutureSprint - Найдено более одного 'будущего' спринта";
          }
      }
    },
    async:false
    })
    //.done(function() { result="second success"; })
    .fail(function(errmsg) { console.log('GetFutureSprint - Ошибка обработки '+errmsg.responseText); })
    //.always(function() { result="finished"; });
    ;

    return localFunctionResponse;
}
function GenerateWindowInside(value){
    console.log('GenerateWindowInside - Запуск функции');

    // ghx-plan-group ghx-operations
    var targetElem = document.getElementById('ghx-plan-group'); // ghx-plan ghx-header ghx-plan-group header
    var buttonOut, sourceElem, workloadDiv, menuElem, menuNav;

    if (typeof(targetElem) != 'undefined' && targetElem != null) {
        console.log('GenerateWindowInside - targetElem существует');

        // <input type="checkbox" id="id-nav-toggle" hidden>
        menuElem = document.getElementById('nav-toggle');
        if (typeof(menuElem) != 'undefined' && menuElem != null) {
            console.log('GenerateWindowInside - menuElem существует');
            sourceElem = document.getElementById('id-workload');
            sourceElem.innerHTML = value;
        } else {
            console.log('GenerateWindowInside - menuElem создаем');
            menuElem = document.createElement('input');
            menuElem.id = "nav-toggle";
            menuElem.setAttribute('type', 'checkbox');
            menuElem.setAttribute('hidden', 'hidden');
            document.body.insertBefore(menuElem, document.body.firstChild);

            menuNav = document.createElement('nav');
            menuNav.id = "id-menuNav";
            menuNav.setAttribute('class', 'nav');
            menuNav.innerHTML = '<label for="nav-toggle" class="nav-toggle" onclick></label>';

            buttonOut = document.createElement('a');
            buttonOut.id = "id-btnworkload";
            buttonOut.href='javascript: void 0;';
            buttonOut.innerText='Обновить';
            //buttonOut.class='button24';
            buttonOut.setAttribute('class', 'button24');
            buttonOut.onclick=Recalculate;

            sourceElem = document.createElement('div');
            sourceElem.id = "id-workload";
            sourceElem.setAttribute('class', 'box');
            sourceElem.innerHTML = value;

            menuNav.appendChild(buttonOut);
            menuNav.appendChild(sourceElem);

            //targetElem.insertBefore(menuNav, targetElem.firstChild);
            document.body.appendChild(menuNav);
        }
    }
}
function GenerateWindow(value, value2){
    console.log('GenerateWindow - Запуск функции');
    var style = `<style>
table {
 border: solid 1px #333;
 border-collapse: collapse;}
table td {
 padding: 6px 10px;}
table td.caption {
 background: #DDD;
 font-weight: bold;}
table td.normalFreeOne {
 background: #FFFFFF;
 font-weight: bold;}
table td.normalFreeTwo {
 background: #F0F0F0;
 font-weight: bold;}
table td.normalFullOne {
 background: #F6D8CE;
 font-weight: bold;}
table td.normalFullTwo {
 background: #F5BCA9;
 font-weight: bold;}
a.button24 {
    box-sizing: border-box;
    transition: background-color .1s ease-out;
    border-radius: 3.01px;
    border-style: solid;
    border-width: 1px;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    font-variant: normal;
    font-weight: 400;
    background-image: none;
    background-color: rgba(9,30,66,0.08);
    border-color: transparent;
    color: #344563;
    text-decoration: none;
    display: inline-block;
    height: 2.14285714em;
    line-height: 1.42857143em;
    margin: 5px 0;
    padding: 4px 10px;
    vertical-align: baseline;
    white-space: nowrap;
    display:inline-block;
    z-index: 2002;
}
.button24:hover {
   border-top-color: #c4e7ff;
   background: #c4e7ff;
   color: #ccc;
   }
.button24:active {
   border-top-color: #1b435e;
   background: #1b435e;
   }

/**
 * Переключаемая боковая панель навигации
 * выдвигающаяся по клику слева
 */

.nav {
    /*  ширна произвольная, не стесняйтесь экспериментировать */
    width: 620px;
    min-width: 620px;
    /* фиксируем и выставляем высоту панели на максимум */
    height: 100%;
    position: fixed;
    top: 0;
    bottom: 0;
    margin: 0;
    /* сдвигаем (прячем) панель относительно левого края страницы */
    left: -660px;
    /* внутренние отступы */
    padding: 15px 35px 5px 5px;
    /* плавный переход смещения панели */
    -webkit-transition: left 0.3s;
    -moz-transition: left 0.3s;
    transition: left 0.3s;
    /* определяем цвет фона панели */
    background: #16a085;
    /* поверх других элементов */
    z-index: 2000;
}

/**
 * Кнопка переключения панели
 * тег <label>
 */

.nav-toggle {
    /* абсолютно позиционируем */
    position: absolute;
    /* относительно левого края панели */
    left: 660px;
    /* отступ от верхнего края панели */
    top: 1px;
    /* внутренние отступы */
    padding: 0.5em;
    /* определяем цвет фона переключателя
     * чаще вчего в соответствии с цветом фона панели
    */
    background: inherit;
    /* цвет текста */
    color: #dadada;
    /* вид курсора */
    cursor: pointer;
    /* размер шрифта */
    font-size: 1.2em;
    line-height: 1;
    /* всегда поверх других элементов страницы */
    z-index: 2001;
    /* анимируем цвет текста при наведении */
    -webkit-transition: color .25s ease-in-out;
    -moz-transition: color .25s ease-in-out;
    transition: color .25s ease-in-out;
}

/* определяем текст кнопки
 * символ Unicode (TRIGRAM FOR HEAVEN)
*/

.nav-toggle:after {
    content: '\u2630';
    text-decoration: none;
}

/* цвет текста при наведении */

.nav-toggle:hover {
    color: #f4f4f4;
}

/**
 * Скрытый чекбокс (флажок)
 * невидим и недоступен :)
 * имя селектора атрибут флажка
 */

[id='nav-toggle'] {
    position: absolute;
    display: none;
}

/**
 * изменение положения переключателя
 * при просмотре на мобильных устройствах
 * когда навигация раскрыта, распологаем внутри панели
*/

[id='nav-toggle']:checked ~ .nav > .nav-toggle {
    left: auto;
    right: 2px;
    top: 1em;
}

/**
 * Когда флажок установлен, открывается панель
 * используем псевдокласс:checked
 */

[id='nav-toggle']:checked ~ .nav {
    left: 0;
    box-shadow:4px 0px 20px 0px rgba(0,0,0, 0.5);
    -moz-box-shadow:4px 0px 20px 0px rgba(0,0,0, 0.5);
    -webkit-box-shadow:4px 0px 20px 0px rgba(0,0,0, 0.5);
    overflow-y: auto;
}

/*
 * смещение контента страницы
 * на размер ширины панели,
 * фишка необязательная, на любителя
*/

[id='nav-toggle']:checked ~ main > article {
    -webkit-transform: translateX(320px);
    -moz-transform: translateX(320px);
    transform: translateX(320px);
}

/*
 * изменение символа переключателя,
 * привычный крестик (MULTIPLICATION X),
 * вы можете испльзовать любой другой значок
*/

[id='nav-toggle']:checked ~ .nav > .nav-toggle:after {
    content: '\u2715';
}

/**
 * профиксим баг в Android <= 4.1.2
 * см: http://timpietrusky.com/advanced-checkbox-hack
 */

body {
    -webkit-animation: bugfix infinite 1s;
}

@-webkit-keyframes bugfix {
    to {
      padding: 0;
    }
}

/**
 * позаботьтимся о средних и маленьких экранах
 * мобильных устройств
 */

@media screen and (min-width: 320px) {
    html,
    body {
      margin: 0;
      overflow-x: hidden;
    }
}

@media screen and (max-width: 320px) {
    html,
    body {
      margin: 0;
      overflow-x: hidden;
    }
    .nav {
      width: 100%;
      box-shadow: none
    }
}

/**
 * Формируем стиль заголовка (логотип) панели
*/

.nav h2 {
    width: 90%;
    padding: 0;
    margin: 10px 0;
    text-align: center;
    text-shadow: rgba(255, 255, 255, .1) -1px -1px 1px, rgba(0, 0, 0, .5) 1px 1px 1px;
    font-size: 1.3em;
    line-height: 1.3em;
    opacity: 0;
    transform: scale(0.1, 0.1);
    -ms-transform: scale(0.1, 0.1);
    -moz-transform: scale(0.1, 0.1);
    -webkit-transform: scale(0.1, 0.1);
    transform-origin: 0% 0%;
    -ms-transform-origin: 0% 0%;
    -moz-transform-origin: 0% 0%;
    -webkit-transform-origin: 0% 0%;
    transition: opacity 0.8s, transform 0.8s;
    -ms-transition: opacity 0.8s, -ms-transform 0.8s;
    -moz-transition: opacity 0.8s, -moz-transform 0.8s;
    -webkit-transition: opacity 0.8s, -webkit-transform 0.8s;
}

.nav h2 a {
    color: #dadada;
    text-decoration: none;
    text-transform: uppercase;
}


/*плавное появление заголовка (логотипа) при раскрытии панели */

[id='nav-toggle']:checked ~ .nav h2 {
    opacity: 1;
    transform: scale(1, 1);
    -ms-transform: scale(1, 1);
    -moz-transform: scale(1, 1);
    -webkit-transform: scale(1, 1);
}

</style>
`;

    GenerateWindowInside(errorMessage+value+style+value2);
    /*var screenSizeW = 900,
        screenSizeH = 600,
        screenL = Number((screen.width/2)-(screenSizeW/2)),
        screenT = Number((screen.height/2)-(screenSizeH/2));
    var x=window.open('','','width='+screenSizeW+', height='+screenSizeH+'');
    x.document.open();
    x.document.write(doc+errorMessage+value+buttonOut+btnReset+style);
    x.document.close();*/
}
function GetSprintWorkload(value){
    console.log('GetSprintWorkload - Запуск функции');
    var localFunctionResponseArray = {value:[],state:false,errorMsg:""},
        localfutureSprint = value;
    var taskdata = {
        "jql": "project = "+projectID+" and Sprint in ('"+localfutureSprint+"')",
        "startAt": 0,
        "maxResults": 500,
        "fields": [
            "fixVersions",
            "customfield_11303",
            "customfield_11304",
            "timeestimate",
            "timeoriginalestimate",
            "timetracking",
            "assignee"
        ]
    };
    var parameters = JSON.stringify(taskdata);
    var req = $.ajax({
        url: jiraURL+jFindURL,
        type: "POST",
        data: parameters,
        contentType: 'application/json',
        dataType: 'json',
        async: false,
        processData: false,
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader('Content-Type', 'application/json')
        //    xhr.setRequestHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        },
        error: function (errmsg) {
            console.log('GetSprintWorkload - Ошибка: ' + errmsg.responseText + " " + parameters);
            localFunctionResponseArray.errorMsg = "GetSprintWorkload - Ошибка выполнения запроса";
        },
        success: function (data) {
            console.log('GetSprintWorkload - Запрос успешно отработал '+jiraURL+jFindURL+" "+taskdata);
            if ("total" in data) {
                if (data.total>0) {
                    localFunctionResponseArray.state = true;
                    localFunctionResponseArray.value = data;
                } else {
                    localFunctionResponseArray.errorMsg = "В спринт '"+localfutureSprint+"' еще не запланированы задачи";
                    console.log('GetSprintWorkload - В спринт "'+localfutureSprint+'" еще не запланированы задачи');
                }
            } else {
                console.log('GetSprintWorkload - Параметр "total" не найден в ответе');
                localFunctionResponseArray.errorMsg = "GetSprintWorkload - Ошибка выполнения запроса. Параметр 'total' не найден в ответе";
            }
        }
        });
    return localFunctionResponseArray;
}

