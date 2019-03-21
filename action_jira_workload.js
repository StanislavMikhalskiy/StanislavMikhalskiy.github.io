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
