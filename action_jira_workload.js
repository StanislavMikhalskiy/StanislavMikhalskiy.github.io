var action_jira_workload_v = '1.0';

function GetFutureSprintSmart(flevel){
    var f = flevel+'- ';
    console.log(f+'GetFutureSprintSmart - Запуск функции');
    // если мы уже запрашивали спринт в этой сессии и у нас есть его значение, то повторно запрашивать не будем
    if (futureSprint.length == 0) {
        console.log(f+'Спринт еще не был определен');
        functionResponse = JiraGetFutureSprint(boardId,f);
        if (functionResponse.state) {
            futureSprint = functionResponse.value;
            console.log(f+'Спринт определен успешно: '+futureSprint);
            console.log(f+'GetFutureSprintSmart - завершение работы функции');
            return true;
        } else {
            errorMessage += "<p>Спринт не был определен</p>";
            errorMessage += "<p>"+functionResponse.errorMsg+"</p>";
            console.log(f+'Информация об ошибке: '+functionResponse.errorMsg);
            console.log(f+'GetFutureSprintSmart - завершение работы функции');
            return false;
        }
    } else {
        console.log(f+'Спринт уже был определен: '+futureSprint);
        console.log(f+'GetFutureSprintSmart - завершение работы функции');
        return true;
    }
    
    console.log(f+'GetFutureSprintSmart - завершение работы функции');
    return false;
}

function GetTimeToWorkSmart(flevel){
    var f = flevel+'- ';
    console.log(f+'GetTimeToWorkSmart - Запуск функции');
    // получаем данные по ресурсам из гугла
    // если мы уже запрашивали спринт в этой сессии и у нас есть его значение, то повторно запрашивать не будем
    if (planTime.length<1) {
        console.log(f+'Данные по доступному времени еще не запрашивались');
        functionResponseArray = GetTimeToWork(futureSprint,f);
        if (functionResponseArray.state) {
            planTime = functionResponseArray.value;
            console.log(f+'Данные по доступному времени получены успешно');
            console.log(f+'GetTimeToWorkSmart - завершение работы функции');
            return functionResponseArray.state;
        } else {
            errorMessage += "<p>Данные по доступному времени не получены</p>";
            errorMessage += "<p>"+functionResponseArray.errorMsg+"</p>";
            console.log(f+'Информация об ошибке: '+functionResponseArray.errorMsg);
            console.log(f+'GetTimeToWorkSmart - завершение работы функции');
            return functionResponseArray.state;
        }
    } else {
        console.log(f+'Данные по доступному времени уже были получены');
        console.log(f+'GetTimeToWorkSmart - завершение работы функции');
        return true;
    }
    
    console.log(f+'GetTimeToWorkSmart - завершение работы функции');
    return false;
}

function ParseJiraTasks(value, flevel){
    var f = flevel+'- ';
    console.log(f+'ParseJiraTasks - Запуск функции');
    console.log(f+'value.total = '+value.total);

    for(var i = 0; i < value.total; i++) {
        var issue = ParseJiraTask(value.issues[i],f);
        issues.push(issue);
        console.log(f+'Добавлена задача '+issue.key);
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
    console.log(f+'ParseJiraTasks - завершение работы функции');
}

function ParseJiraTask(value, flevel){
    var f = flevel+'- ';
    console.log(f+'ParseJiraTask - Запуск функции');
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
        console.log(f+'У задачи '+result.key+' originalEstimate = '+result.originalEstimate);
    } else {
        result.message += "Отсутствует timeoriginalestimate. ";
        console.log(f+'У задачи '+result.key+' отсутствует timeoriginalestimate');
    }

    if ('assignee' in value.fields && 'key' in value.fields.assignee && value.fields.assignee['key'] != null) {
        result.assignee = value.fields.assignee.key;
        console.log(f+'У задачи '+result.key+' assignee = '+result.assignee);
    } else {
        result.message += "Отсутствует assignee.key. ";
        console.log(f+'У задачи '+result.key+' отсутствует assignee.key');
    }
    // проверяем, что есть данные по ролям (пользователь) var roleField = "customfield_11304"
    /*
    if (roleField in value.fields && value.fields[roleField] != null) {
        console.log(f+'У задачи '+result.key+' есть данные по ролям (пользователь) '+roleField+' в количестве '+value.fields[roleField].length);
        var hasRoleLogin = false;
        // обходим массив ролей (пользователь)
        for(var i = 0; i < value.fields[roleField].length; i++) {
            // для каждого элемента ищем соответствие известным ролям var RoleCommon = [{RoleCode:'10206',RoleName:'Developers'},{RoleCode:'10404',RoleName:'QA'}];
            for ( var j=0; j<RoleCommon.length; j++) {
                var roleLogin = ParseRole(value.fields[roleField][i],RoleCommon[j].RoleCode,f);
                if ( roleLogin.length > 0 ) {
                    console.log(f+'У задачи '+result.key+' есть роль '+RoleCommon[j].RoleName+' с логином '+roleLogin);
                    //console.log(f+'добавляем в массив роль '+RoleCommon[j].RoleName+', логин '+roleLogin+' и нулевое время');
                    result.roles.push({role:RoleCommon[j].RoleName,login:roleLogin,estimate:0});
                    hasRoleLogin = true;
                } else { console.log(f+'У задачи '+result.key+' нет роли '+RoleCommon[j].RoleName);}
            }
        }
        if (!hasRoleLogin) {
            console.log(f+'У задачи '+result.key+' нет ролей');
            result.message += "Отсутствуют данные по ролям (пользователь). ";
        }
    } else {
        result.message += "Отсутствуют данные по ролям (пользователь). ";
        console.log(f+'У задачи '+result.key+' отсутствуют данные по ролям (пользователь) '+roleField);
    }*/
    // проверяем, что есть данные по ролям (время) var roleTimeField = "customfield_11303";
    /*
    if (roleTimeField in value.fields && value.fields[roleTimeField] != null) {
        console.log(f+'У задачи '+result.key+' есть данные по ролям (время) '+roleTimeField+' в количестве '+value.fields[roleTimeField].length);
        // обходим массив ролей (время)
        for(i = 0; i < value.fields[roleTimeField].length; i++) {
            // для каждого элемента ищем соответствие известным ролям var RoleCommon = [{RoleCode:'10206',RoleName:'Developers'},{RoleCode:'10404',RoleName:'QA'}];
            for (j=0; j<RoleCommon.length; j++) {
                var roleTime = ParseJiraRoleTime(value.fields[roleTimeField][i],RoleCommon[j].RoleName,f);
                if ( roleTime > 0 ) {
                    console.log(f+'У задачи '+result.key+' есть роль '+RoleCommon[j].RoleName+' со временем '+roleTime);
                    // ищем по массиву ролей, если такая роль есть - выставляем время, если нет - добавляем новую запись
                    var roleFinded = false;
                    for (var k=0; k<result.roles.length; k++) {
                        if (result.roles[k].role === RoleCommon[j].RoleName) {
                            result.roles[k].estimate = roleTime;
                            roleFinded = true;
                            console.log(f+'У задачи '+result.key+' нашли соответствие роли '+RoleCommon[j].RoleName+' со временем '+roleTime);
                            break;
                        }
                    }
                    if (!roleFinded) {
                        result.roles.push({role:RoleCommon[j].RoleName,login:'',estimate:roleTime});
                        console.log(f+'У задачи '+result.key+' не нашли соответствие и добавили для роли '+RoleCommon[j].RoleName+' со временем '+roleTime);
                    }
                } else { console.log(f+'У задачи '+result.key+' нет роли или времени '+RoleCommon[j].RoleName);}
            }
        }
    } else {
        result.message += "Отсутствуют данные по ролям (время). ";
        console.log(f+'У задачи '+result.key+' отсутствуют данные по ролям (время) '+roleTimeField);
    }*/

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
    console.log(f+'ParseJiraTask - завершение работы функции');
    return result;
}

function UpdateWorkload(valueIssues,valueEmployees,flevel){
    var f = flevel+'- ';
    console.log(f+'UpdateWorkload - Запуск функции');
    console.log(f+'valueIssues.length = '+valueIssues.length);

    for(var i = 0; i < valueEmployees.length; i++) { //employees.push({"eName":planTime[i].login,"planTimeToWork":planTime[i].timeToWork,"eEstimate":0,"eOstatok":0,"planRole":planTime[i].role});
        valueEmployees[i].eEstimate = 0;
        for(var j = 0; j < valueIssues.length; j++) {
            if (valueIssues[j].assignee === valueEmployees[i].eName) {
                valueEmployees[i].eEstimate += valueIssues[j].originalEstimate/60/60;
            }
        }
        valueEmployees[i].eOstatok = valueEmployees[i].planTimeToWork - valueEmployees[i].eEstimate;
        console.log(f+'employees.eName = '+valueEmployees[i].eName+' employees.planTimeToWork = '+valueEmployees[i].planTimeToWork+' employees.eEstimate = '+valueEmployees[i].eEstimate+' employees.eOstatok = '+valueEmployees[i].eOstatok);
    }
    console.log(f+'UpdateWorkload - завершение работы функции');
}
